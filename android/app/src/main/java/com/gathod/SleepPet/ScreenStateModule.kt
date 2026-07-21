package com.gathod.SleepPet

import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.modules.core.DeviceEventManagerModule

class ScreenStateModule(
    private val reactContext: ReactApplicationContext
) : ReactContextBaseJavaModule(reactContext) {

    companion object {

        private var instance: ScreenStateModule? = null

        fun sendUnlockEvent() {
            instance?.emitUnlockEvent()
        }

    }

    init {
        instance = this
    }

    override fun getName(): String {
        return "ScreenState"
    }

    private fun emitUnlockEvent() {

        val params = Arguments.createMap()

        params.putDouble(
            "timestamp",
            System.currentTimeMillis().toDouble()
        )

        reactContext
            .getJSModule(
                DeviceEventManagerModule.RCTDeviceEventEmitter::class.java
            )
            .emit(
                "PHONE_UNLOCKED",
                params
            )

    }

}