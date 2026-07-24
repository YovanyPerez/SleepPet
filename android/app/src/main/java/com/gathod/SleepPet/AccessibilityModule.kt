package com.gathod.SleepPet

import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.modules.core.DeviceEventManagerModule

class AccessibilityModule(
    private val reactContext: ReactApplicationContext
) : ReactContextBaseJavaModule(reactContext) {

    companion object {

        private var instance: AccessibilityModule? = null

        // Cambia este package si algún día cambia el applicationId
        private const val SLEEPPET_PACKAGE = "com.gathod.SleepPet"

        fun checkForegroundApp(packageName: String) {

            val module = instance ?: return

            // No contar cuando vuelve a SleepPet
            if (packageName == SLEEPPET_PACKAGE) {
                return
            }

            val params = Arguments.createMap()

            params.putString("packageName", packageName)

            module.reactContext
                .getJSModule(
                    DeviceEventManagerModule.RCTDeviceEventEmitter::class.java
                )
                .emit(
                    "PHONE_UNLOCKED",
                    params
                )
        }

    }

    init {
        instance = this
    }

    override fun getName(): String {
        return "AccessibilityModule"
    }
}