package com.gathod.SleepPet

import android.content.Context
import android.util.Log
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.WritableNativeArray
import com.facebook.react.bridge.WritableNativeMap
import org.json.JSONArray
import org.json.JSONObject

/**
 * Puente JS <-> resumen de movimiento nocturno.
 * El detector vive en SleepForegroundService; este módulo solo expone
 * el resumen agregado (eventos, score, epochs) — nunca muestras crudas.
 */
class MovementModule(
    reactContext: ReactApplicationContext
) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "MovementModule"

    @ReactMethod
    fun getMovementSummary(promise: Promise) {
        try {
            val json: JSONObject = SleepForegroundService.movementSnapshot(
                reactApplicationContext
            )
            val epochsOut = WritableNativeArray()
            val epochs: JSONArray = json.optJSONArray("epochs") ?: JSONArray()
            for (i in 0 until epochs.length()) {
                val e = epochs.getJSONObject(i)
                epochsOut.pushMap(
                    WritableNativeMap().apply {
                        putDouble("startTime", e.optDouble("startTime", 0.0))
                        putDouble("durationMs", e.optDouble("durationMs", 0.0))
                        putDouble("movementScore", e.optDouble("movementScore", 0.0))
                        putInt("movementEvents", e.optInt("movementEvents", 0))
                    }
                )
            }
            val map = WritableNativeMap().apply {
                putInt("events", json.optInt("events", 0))
                putDouble("score", json.optDouble("score", 0.0))
                putArray("epochs", epochsOut)
            }
            promise.resolve(map)
        } catch (e: Exception) {
            Log.e("Movement", "error leyendo resumen: ${e.message}")
            promise.reject("movement_error", e.message)
        }
    }

    @ReactMethod
    fun clearMovementSummary() {
        SleepForegroundService.clearMovementSummary(reactApplicationContext)
    }
}
