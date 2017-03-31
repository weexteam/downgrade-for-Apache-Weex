/* global WXEnvironment, weex, callNative */

// import * as semver from 'semver'
import semver from './semver'

const MODULE_NAME = 'instanceWrap'
const DOWNGRADE_TYPE = 1
const DOWNGRADE_ERROR_CODE = 1003
const DOWNGRADE_MSG = 'Force downgrade to web'

/**
 * @private
 * Using async type to check environment
 */
function isWeex () {
    return typeof(window) !== 'object' && typeof(callNative) !== 'undefined'
}

/**
 * @private
 * Require module and fixed lagacy version require issues.
 */
function getInstanceWrap() {
    const prefix = '@weex-module/'

    try {
        return weex.requireModule(MODULE_NAME)
    }catch(e) {}

    try {
        return __weex_require__( prefix + MODULE_NAME)
    }catch(e) {}

    return { error: function() {
        console && console.log && console.log('Can not found module ' + MODULE_NAME)
    } }
}

function force (type, errorCode, message) {
    if(!isWeex()) return false
    type = parseInt(type) || DOWNGRADE_TYPE
    errorCode = parseInt(errorCode) || DOWNGRADE_ERROR_CODE
    message = isString(message) ? message : DOWNGRADE_MSG
    getInstanceWrap()['error'](type, errorCode, message)
    return true
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
    let result = {
        isDowngrade: false
    }

    if (!isWeex()) {
        return result
    }

    let deviceInfo = WXEnvironment || {}

    let platform = deviceInfo.platform || 'unknow'
    let dPlatform = platform.toLowerCase()
    let cObj = config[dPlatform] || {}

    for (let key in deviceInfo) {
        let keyLower = key.toLowerCase()
        let val = deviceInfo[key]
        let isVersion = keyLower.indexOf('version') >= 0
        let isDeviceModel = keyLower.indexOf('devicemodel') >= 0
        let criteria = cObj[key]

        if (criteria && isVersion) {
            let c = normalizeVersion(criteria)
            let d = normalizeVersion(deviceInfo[key])

            if (semver.satisfies(d, c)) {
                result = getError(key, val, criteria)
                break
            }
        } else if (isDeviceModel) {
            let _criteria = Array.isArray(criteria) ? criteria : [criteria]

            if (_criteria.indexOf(val) >= 0) {
                result = getError(key, val, criteria)
                break
            }
        }
    }

    return result
}

function isString(v) {
    return typeof(v) === 'string'
}

function normalizeVersion(v) {
    if (v === '*') {
        return v
    }

    v = isString(v) ? v : ''
    const split = v.split('.')
    let i = 0
    let result = []

    while (i < 3) {
        let s = isString(split[i]) && split[i] ? split[i] : '0'
        result.push(s)
        i++
    }

    return result.join('.')
}

function getError(key, val, criteria) {
    let result = {
        isDowngrade: true,
        errorType: 1,
        code: 1000
    }

    let getMsg = function(key, val, criteria) {
        return `Downgrade[${key}]: envInfo ${val} matched criteria ${criteria}`
    }
    let _key = key.toLowerCase()

    if (_key.indexOf('osversion') >= 0) {
        result.code = 1001
    } else if (_key.indexOf('appversion') >= 0) {
        result.code = 1002
    } else if (_key.indexOf('weexversion') >= 0) {
        result.code = 1003
    } else if (_key.indexOf('devicemodel') >= 0) {
        result.code = 1004
    }

    result.errorMessage = getMsg(key, val, criteria)
    return result
}

function condition (config) {
    let diagnose = check(config)
    if(diagnose.isDowngrade) {
        force(diagnose.errorType, diagnose.code, diagnose.errorMessage)
    }

    return diagnose.isDowngrade
}

export default {
    force,
    check,
    condition,
    semverLite: semver
}
