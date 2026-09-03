package com.gathod.SleepPet

import android.content.Context
import android.util.Log
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class SmartAlarmModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    override fun getName(): String = "SmartAlarmModule"

    @ReactMethod
    fun setConfig(enabled: Boolean, hour: Int, minute: Int, windowMin: Int, promise: Promise) {
        try {
            SleepForegroundService.setSmartAlarmConfig(reactApplicationContext, enabled, hour, minute, windowMin)
            if (enabled) {
                SmartAlarmScheduler.scheduleExact(reactApplicationContext, hour, minute, windowMin)
            } else {
                SmartAlarmScheduler.cancel(reactApplicationContext)
            }
            promise.resolve(true)
        } catch (e: Exception) {
            Log.e("SmartAlarm", "setConfig error ${e.message}")
            promise.reject("smartalarm_error", e.message)
        }
    }

    @ReactMethod
    fun getConfig(promise: Promise) {
        try {
            val json = SleepForegroundService.getSmartAlarmConfig(reactApplicationContext)
            val map = com.facebook.react.bridge.WritableNativeMap().apply {
                putBoolean("enabled", json.optBoolean("enabled", false))
                putInt("hour", json.optInt("hour", 7))
                putInt("minute", json.optInt("minute", 0))
                putInt("windowMin", json.optInt("windowMin", 30))
            }
            promise.resolve(map)
        } catch (e: Exception) {
            promise.reject("smartalarm_error", e.message)
        }
    }

    @ReactMethod
    fun getLastInfo(promise: Promise) {
        try {
            val prefs = reactApplicationContext.getSharedPreferences(
                SleepForegroundService.SMART_ALARM_PREFS_NAME,
                android.content.Context.MODE_PRIVATE
            )
            val map = com.facebook.react.bridge.WritableNativeMap().apply {
                putDouble("lastTriggerMs", prefs.getLong("lastTriggerMs", 0L).toDouble())
                putDouble("lastFavorableMs", prefs.getLong("lastFavorableMs", 0L).toDouble())
            }
            promise.resolve(map)
        } catch (e: Exception) {
            promise.reject("smartalarm_error", e.message)
        }
    }

    @ReactMethod
    fun stopAlarm() {
        try {
            SmartAlarmScheduler.cancelEscalations(reactApplicationContext)
            SmartAlarmPlayer.stop()
            val manager = reactApplicationContext.getSystemService(
                android.content.Context.NOTIFICATION_SERVICE
            ) as android.app.NotificationManager
            manager.cancel(3001)
            reactApplicationContext.getSharedPreferences(
                SleepForegroundService.SMART_ALARM_PREFS_NAME,
                android.content.Context.MODE_PRIVATE
            ).edit().putBoolean("stopped", true).apply()
        } catch (_: Exception) {}
    }
}
