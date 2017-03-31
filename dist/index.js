'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; /* global WXEnvironment, weex, callNative */

var _semver = require('./semver');

var _semver2 = _interopRequireDefault(_semver);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var MODULE_NAME = 'instanceWrap';
var DOWNGRADE_TYPE = 1;
var DOWNGRADE_ERROR_CODE = 1003;
var DOWNGRADE_MSG = 'Force downgrade to web';

/**
 * @private
 * Using async type to check environment
 */
function isWeex() {
    return (typeof window === 'undefined' ? 'undefined' : _typeof(window)) !== 'object' && typeof callNative !== 'undefined';
}

/**
 * @private
 * Require module and fixed lagacy version require issues.
 */
function getInstanceWrap() {
    var prefix = '@weex-module/';

    try {
        return weex.requireModule(MODULE_NAME);
    } catch (e) {}

    try {
        return __weex_require__(prefix + MODULE_NAME);
    } catch (e) {}

    return { error: function error() {
            console && console.log && console.log('Can not found module ' + MODULE_NAME);
        } };
}

function force(type, errorCode, message) {
    if (!isWeex()) return false;
    type = parseInt(type) || DOWNGRADE_TYPE;
    errorCode = parseInt(errorCode) || DOWNGRADE_ERROR_CODE;
    message = isString(message) ? message : DOWNGRADE_MSG;
    getInstanceWrap()['error'](type, errorCode, message);
    return true;
}

/**
 * config
 *
 * {
 *   ios: {
 *     osVersion: '>1.0.0' or '>=1.0.0' or '<1.0.0' or '<=1.0.0' or '1.0.0'
 *     appVersion: '>1.0.0' or '>=1.0.0' or '<1.0.0' or '<=1.0.0' or '1.0.0'
 *     weexVersion: '>1.0.0' or '>=1.0.0' or '<1.0.0' or '<=1.0.0' or '1.0.0'
 *     deviceModel: ['modelA', 'modelB', ...]
 *   },
 *   android: {
 *     osVersion: '>1.0.0' or '>=1.0.0' or '<1.0.0' or '<=1.0.0' or '1.0.0'
 *     appVersion: '>1.0.0' or '>=1.0.0' or '<1.0.0' or '<=1.0.0' or '1.0.0'
 *     weexVersion: '>1.0.0' or '>=1.0.0' or '<1.0.0' or '<=1.0.0' or '1.0.0'
 *     deviceModel: ['modelA', 'modelB', ...]
 *   }
 * }
 *
 */
function check(config) {
    var result = {
        isDowngrade: false
    };

    if (!isWeex()) {
        return result;
    }

    var deviceInfo = WXEnvironment || {};

    var platform = deviceInfo.platform || 'unknow';
    var dPlatform = platform.toLowerCase();
    var cObj = config[dPlatform] || {};

    for (var key in deviceInfo) {
        var keyLower = key.toLowerCase();
        var val = deviceInfo[key];
        var isVersion = keyLower.indexOf('version') >= 0;
        var isDeviceModel = keyLower.indexOf('devicemodel') >= 0;
        var criteria = cObj[key];

        if (criteria && isVersion) {
            var c = normalizeVersion(criteria);
            var d = normalizeVersion(deviceInfo[key]);

            if (_semver2.default.satisfies(d, c)) {
                result = getError(key, val, criteria);
                break;
            }
        } else if (isDeviceModel) {
            var _criteria = Array.isArray(criteria) ? criteria : [criteria];

            if (_criteria.indexOf(val) >= 0) {
                result = getError(key, val, criteria);
                break;
            }
        }
    }

    return result;
}

function isString(v) {
    return typeof v === 'string';
}

function normalizeVersion(v) {
    if (v === '*') {
        return v;
    }

    v = isString(v) ? v : '';
    var split = v.split('.');
    var i = 0;
    var result = [];

    while (i < 3) {
        var s = isString(split[i]) && split[i] ? split[i] : '0';
        result.push(s);
        i++;
    }

    return result.join('.');
}

function getError(key, val, criteria) {
    var result = {
        isDowngrade: true,
        errorType: 1,
        code: 1000
    };

    var getMsg = function getMsg(key, val, criteria) {
        return 'Downgrade[' + key + ']: envInfo ' + val + ' matched criteria ' + criteria;
    };
    var _key = key.toLowerCase();

    if (_key.indexOf('osversion') >= 0) {
        result.code = 1001;
    } else if (_key.indexOf('appversion') >= 0) {
        result.code = 1002;
    } else if (_key.indexOf('weexversion') >= 0) {
        result.code = 1003;
    } else if (_key.indexOf('devicemodel') >= 0) {
        result.code = 1004;
    }

    result.errorMessage = getMsg(key, val, criteria);
    return result;
}

function condition(config) {
    var diagnose = check(config);
    if (diagnose.isDowngrade) {
        force(diagnose.errorType, diagnose.code, diagnose.errorMessage);
    }

    return diagnose.isDowngrade;
}

exports.default = {
    force: force,
    check: check,
    condition: condition,
    semverLite: _semver2.default
};