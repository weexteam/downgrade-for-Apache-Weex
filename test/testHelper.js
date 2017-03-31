
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
        global.callNative = function(){}
    },

    resetGlobalEnvironment () {
        global.WXEnvironment = undefined
        global.weex = undefined
        global.callNative = undefined
    }
}
