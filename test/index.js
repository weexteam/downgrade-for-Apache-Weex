import * as mocha from 'mocha'
import { expect } from 'chai'
import pkg from '../package.json'
import testHelper from './testHelper'

import Downgrade from '../src/index'


describe(pkg.name, () => {
    beforeEach( () => {
        testHelper.setGlobalEnvironment()
    })

    afterEach( () => {
        testHelper.resetGlobalEnvironment()
    })

    describe('force', () => {
        it('should be force downgrade without params', () => {
            expect(Downgrade.force()).equal(true)
        })

        it('should be force downgrade with custom params', () => {
            expect(Downgrade.force('yoyo', 'haha', 'My custom params')).equal(true)
        })

        it('should be force downgrade with custom params and callNative is empty', () => {
            testHelper.resetGlobalEnvironment()
            expect(Downgrade.force('yoyo', 'haha', 'My custom params')).equal(false)
        })

        it('should be weex environment error', () => {
            global.weex = null
            global.__weex_require__ = null
            expect(Downgrade.force('yoyo', 'haha', 'My custom params')).equal(true)
        })
    })

    describe('check', () => {
        it('should be handle not weex environment', () => {
            global.callNative = undefined
            expect(Downgrade.check({}).isDowngrade).equal(false)
        })

        describe('should be match match condition', () => {
            const condition = {
                ios: {
                    osVersion: '>1.2.3',
                    appVersion: '<2.3.4',
                    weexVersion: '<0.5.0',
                    deviceModel: ['iPhone6,2']
                },
                android: {
                    osVersion: '>4.5.6',
                    appVersion: '<5.6.7',
                    weexVersion: '<0.2.0',
                    deviceModel: []
                }
            }

            it('with osVerison', () => {
                global.WXEnvironment = {
                    platform: 'iOS',
                    appVersion: '3.4.5',
                    osVersion: '10.3.1',
                    weexVersion: '5.0.0',
                    deviceModel: 'iPhone7,1'
                }
                expect(Downgrade.check(condition).isDowngrade).equal(true)
            })

            it('with appVerison', () => {
                global.WXEnvironment = {
                    platform: 'iOS',
                    appVersion: '0.1.5',
                    osVersion: '10.3.1',
                    weexVersion: '5.0.0',
                    deviceModel: 'iPhone7,1'
                }
                expect(Downgrade.check(condition).isDowngrade).equal(true)
            })

            it('with weexVersion', () => {
                global.WXEnvironment = {
                    platform: 'iOS',
                    appVersion: '10.4.5',
                    osVersion: '0.3.1',
                    weexVersion: '0.1.0',
                    deviceModel: 'iPhone7,1'
                }
                expect(Downgrade.check(condition).isDowngrade).equal(true)
            })

            it('with deviceModel', () => {
                global.WXEnvironment = {
                    platform: 'iOS',
                    appVersion: '10.0.0',
                    osVersion: '0.3.1',
                    weexVersion: '5.0.0',
                    deviceModel: 'iPhone6,2'
                }
                expect(Downgrade.check(condition).isDowngrade).equal(true)
            })

            it('with * verison', () => {
                global.WXEnvironment = {
                    platform: 'iOS',
                    appVersion: '*',
                    osVersion: '*',
                    weexVersion: '*',
                    deviceModel: 'iPhone7,1'
                }
                expect(Downgrade.check(condition).isDowngrade).equal(true)
            })
        })

        describe('should be match condition with multiple app', () => {
            const condition = {
                ios: {
                    osVersion: '<1',
                    appVersion: {
                        MY_APP_A: '>2.3.4'
                    },
                    weexVersion: '<1',
                    deviceModel: []
                },
                android: {
                    osVersion: '<1',
                    appVersion: {
                        MY_APP_B: '<5.6.7'
                    },
                    weexVersion: '<1',
                    deviceModel: []
                }
            }

            it('true case', () => {
                global.WXEnvironment = {
                    platform: 'iOS',
                    appName: 'MY_APP_A',
                    appVersion: '3.4.5',
                    osVersion: '10.3.1',
                    weexVersion: '5.0.0',
                    deviceModel: 'iPhone7,1'
                }
                expect(Downgrade.check(condition).isDowngrade).equal(true)

                global.WXEnvironment = {
                    platform: 'iOS',
                    appName: 'MY_APP_A',
                    appVersion: '1.4.5',
                    osVersion: '10.3.1',
                    weexVersion: '5.0.0',
                    deviceModel: 'iPhone7,1'
                }
                expect(Downgrade.check(condition).isDowngrade).equal(false)
            })

            it('false case', () => {
                global.WXEnvironment = {
                    platform: 'iOS',
                    appName: 'MY_APP_B',
                    appVersion: '3.4.5',
                    osVersion: '10.3.1',
                    weexVersion: '5.0.0',
                    deviceModel: 'iPhone7,1'
                }
                expect(Downgrade.check(condition).isDowngrade).equal(false)

                global.WXEnvironment = {
                    platform: 'iOS',
                    appName: 'MY_APP_B',
                    appVersion: '0.0.5',
                    osVersion: '10.3.1',
                    weexVersion: '5.0.0',
                    deviceModel: 'iPhone7,1'
                }
                expect(Downgrade.check(condition).isDowngrade).equal(false)
            })
        })
    })

    describe('condition', () => {
        it('should be match condition and fire downgrade action', () => {
            const condition = {
                ios: {
                    osVersion: '>1.2.3',
                    appVersion: '<2.3.4',
                    weexVersion: '<0.5.0',
                    deviceModel: []
                },
                android: {
                    osVersion: '>4.5.6',
                    appVersion: '<5.6.7',
                    weexVersion: '<0.2.0',
                    deviceModel: []
                }
            }
            global.WXEnvironment = {
                platform: 'iOS',
                appVersion: '3.4.5',
                osVersion: '10.3.1',
                weexVersion: '5.0.0',
                deviceModel: 'iPhone7,1'
            }
            expect(Downgrade.condition(condition)).equal(true)
        })
    })

    describe('semverLite', () => {
        it('should be satisfies the rule', () => {
            expect(Downgrade.semverLite.satisfies('1.0.0', '>1.0.0')).equal(false)

            expect(Downgrade.semverLite.satisfies('1.0.0', '>=1.0.0')).equal(true)

            expect(Downgrade.semverLite.satisfies('1.0.0', '>=1.0')).equal(true)

            expect(Downgrade.semverLite.satisfies('1.0.0', '>=1')).equal(true)
        })
    })
})
