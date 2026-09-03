package com.gathod.SleepPet

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.util.Log

class BootReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent?) {
        if (intent?.action != Intent.ACTION_BOOT_COMPLETED) return
        try {
            Log.i("SmartAlarm", "BootReceiver BOOT_COMPLETED — re-agendando alarmas")
            // SmartAlarm: SharedPreferences smart_alarm sobrevive reboot (no es AsyncStorage), así que podemos re-agendar aquí
            val prefs = context.getSharedPreferences(SleepForegroundService.SMART_ALARM_PREFS_NAME, Context.MODE_PRIVATE)
            val enabled = prefs.getBoolean("enabled", false)
            if (enabled) {
                val hour = prefs.getInt("hour", 7)
                val minute = prefs.getInt("minute", 0)
                val windowMin = prefs.getInt("windowMin", 30)
                SmartAlarmScheduler.scheduleExact(context, hour, minute, windowMin)
                Log.i("SmartAlarm", "SmartAlarm re-agendado tras boot ${hour}:${String.format("%02d", minute)} window ${windowMin}m")
            }
            // Reminder: se re-agenda al abrir app vía AppContext, pero también intentamos aquí si hay prefs
            val rprefs = context.getSharedPreferences("sleep_reminder", Context.MODE_PRIVATE)
            val remHour = rprefs.getInt("hour", -1)
            if (remHour != -1) {
                Log.i("BootReceiver", "reminder prefs encontrados — re-agenda al abrir app")
            }
        } catch (e: Exception) {
            Log.e("BootReceiver", "error ${e.message}")
        }
    }
}
