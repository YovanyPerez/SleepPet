package com.gathod.SleepPet

import android.content.Intent
import android.provider.Settings
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.modules.core.DeviceEventManagerModule

class AccessibilityModule(
    private val reactContext: ReactApplicationContext
) : ReactContextBaseJavaModule(reactContext) {

    companion object {

        private var instance: AccessibilityModule? = null

        // Cambia este package si algún día cambia el applicationId
        private const val SLEEPPET_PACKAGE = "com.gathod.SleepPet"
        private const val SERVICE_ID = "com.gathod.SleepPet/com.gathod.SleepPet.UnlockAccessibilityService"

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

        fun isServiceEnabled(context: android.content.Context): Boolean {
            val enabled = Settings.Secure.getString(
                context.contentResolver,
                Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES
            ) ?: return false
            return enabled.split(':').any { it.trim().equals(SERVICE_ID, ignoreCase = true) }
        }

    }

    init {
        instance = this
    }

    override fun getName(): String {
        return "AccessibilityModule"
    }

    @ReactMethod
    fun isAccessibilityEnabled(promise: Promise) {
        try {
            promise.resolve(isServiceEnabled(reactContext))
        } catch (e: Exception) {
            promise.resolve(false)
        }
    }

    @ReactMethod
    fun openAccessibilitySettings() {
        try {
            val intent = Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS)
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            reactContext.startActivity(intent)
        } catch (e: Exception) {
            // Si falla, se ignora
        }
    }
}
