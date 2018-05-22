'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var fs = _interopDefault(require('fs'));
var path = _interopDefault(require('path'));
var webpackSources = require('webpack-sources');

/*
  change for npm modules.
  by Luiz Estácio.

  json-format v.1.1
  http://github.com/phoboslab/json-format

  Released under MIT license:
  http://www.opensource.org/licenses/mit-license.php
*/
var p = [];
var indentConfig = {
    tab: { char: '\t', size: 1 },
    space: { char: ' ', size: 4 }
  };
var configDefault = {
    type: 'tab'
  };
var push = function( m ) { return '\\' + p.push( m ) + '\\'; };
var pop = function( m, i ) { return p[i-1] };
var tabs = function( count, indentType) { return new Array( count + 1 ).join( indentType ); };

function JSONFormat ( json, indentType ) {
  p = [];
  var out = "",
      indent = 0;

  // Extract backslashes and strings
  json = json
    .replace( /\\./g, push )
    .replace( /(".*?"|'.*?')/g, push )
    .replace( /\s+/, '' );    

  // Indent and insert newlines
  for( var i = 0; i < json.length; i++ ) {
    var c = json.charAt(i);

    switch(c) {
      case '{':
      case '[':
        out += c + "\n" + tabs(++indent, indentType);
        break;
      case '}':
      case ']':
        out += "\n" + tabs(--indent, indentType) + c;
        break;
      case ',':
        out += ",\n" + tabs(indent, indentType);
        break;
      case ':':
        out += ": ";
        break;
      default:
        out += c;
        break;      
    }         
  }

  // Strip whitespace from numeric arrays and put backslashes 
  // and strings back in
  out = out
    .replace( /\[[\d,\s]+?\]/g, function(m){ return m.replace(/\s/g,''); } )
    .replace( /\\(\d+)\\/g, pop ) // strings
    .replace( /\\(\d+)\\/g, pop ); // backslashes in strings

  return out;
}

var jsonFormat = function(json, config){
  config = config || configDefault;
  var indent = indentConfig[config.type];

  if ( indent == null ) {
    throw new Error('Unrecognized indent type: "' + config.type + '"');
  }
  var indentType = new Array((config.size || indent.size) + 1).join(indent.char);
  return JSONFormat(JSON.stringify(json), indentType);
};

var defaultFilePath = path.join(__dirname, './downgrade.js');

function indent (code, len) {
  if ( len === void 0 ) len = 2;

  var space = (new Array(len + 1)).join(' ');
  return space + code.replace(/\n/g, '\n' + space)
}

function readCodesSync (filePath) {
  if ( filePath === void 0 ) filePath = defaultFilePath;

  try {
    var code = fs.readFileSync(filePath, 'utf8');
    return '/* npm downgrade module */\n' + code
  } catch(e) {
    console.log('Error:', e.stack);
    return '/* invalid downgrade code */'
  }
}

function generateConditionCode (condition) {
  var params = jsonFormat(condition, {
    type: 'space',
    size: 2
  });
  return "/* downgrade condition */\n" +
    "WeexDowngrade.condition(\n" + (indent(params)) + "\n);"
}

function generateForceCode (condition) {
  return "/* force downgrade */\nWeexDowngrade.force();"
}

function generateDowngradeCode (options) {
  // TODO: check condition format
  var condition = options.condition || defaultCondition;

  var downgradeCode = (options.force === true)
    ? generateForceCode()
    : generateConditionCode(condition);

  return '\n/* Weex downgrade configs */\n' +
    ';(function(){\n' +
      indent(readCodesSync(defaultFilePath)) + '\n\n' +
      indent(downgradeCode) + '\n' +
    '})();\n\n'
}

var WeexDowngradePlugin = function WeexDowngradePlugin (options) {
  this.options = options || {};
};

WeexDowngradePlugin.prototype.apply = function apply (compiler) {
  var code = generateDowngradeCode(this.options);

  compiler.plugin('compilation', function (compilation) {
    compilation.plugin('optimize-chunk-assets', function (chunks, callback) {
      // console.log(' => optimize-chunk-assets\n')
      chunks.forEach(function (chunk) {
        if ('isInitial' in chunk && !chunk.isInitial()) { return; }

        chunk.files.forEach(function (file) {
          compilation.assets[file] = new webpackSources.ConcatSource(code, compilation.assets[file]);
        });
      });
      callback();
    });

    compilation.plugin('additional-assets', function (callback) {
      // console.log(' => additional-assets\n')
      callback();
    });

    // compilation.plugin('additional-chunk-assets', chunks => {
    // // console.log(console.log(chunks))
    // chunks.forEach(chunk => {
    //   // console.log(Object.keys(chunk))
    //   console.log(chunk.modules)
    // })
    // })
  });

  // compiler.plugin('emit', (compilation, callback) => {
  // var assets = compilation.assets;
  // console.log(Object.keys(assets))
  // })
};

module.exports = WeexDowngradePlugin;
