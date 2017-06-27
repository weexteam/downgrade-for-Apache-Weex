
export default {
    setGlobalEnvironment () {
        global.WXEnvironment = {}
        global.weex = {
            requireModule () {
                return {
                    error () {
                        return true
                    }
                }
            }
        }
        global.__weex_require__ = () => {
            return {
                error () {
                    return true
                }
            }
        }
        global.callNative = function(){}
    },

    resetGlobalEnvironment () {
        global.WXEnvironment = undefined
        global.weex = undefined
        global.__weex_require__ = undefined
        global.callNative = undefined
    }
}
