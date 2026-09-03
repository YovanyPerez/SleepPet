package com.gathod.SleepPet

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import android.util.Log
import java.util.Calendar

object SmartAlarmScheduler {
    const val REQUEST_CODE = 3002
    const val REQUEST_FAVORABLE = 3003
    const val REQUEST_ESCALATE_BASE = 3010
    const val ACTION_SMART_ALARM = "com.gathod.SleepPet.SMART_ALARM"
    const val ACTION_ESCALATE = "com.gathod.SleepPet.SMART_ALARM_ESCALATE"
    const val ACTION_STOP = "com.gathod.SleepPet.SMART_ALARM_STOP"

    fun scheduleExact(context: Context, hour: Int, minute: Int, windowMin: Int) {
        try {
            val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
            val triggerAt = nextTargetTime(hour, minute)
            // Guardar window para check favorable durante ventana (closeSmartWindow usa SharedPreferences, no necesita alarm extra)
            // Programar alarma obligatoria a targetTime como fallback (si no hay momento favorable, suena igual)
            val intent = Intent(context, SmartAlarmReceiver::class.java).apply { action = ACTION_SMART_ALARM }
            val pending = PendingIntent.getBroadcast(context, REQUEST_CODE, intent, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
            val canExact = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) alarmManager.canScheduleExactAlarms() else true
            if (canExact) {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                    alarmManager.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, triggerAt, pending)
                } else {
                    alarmManager.setExact(AlarmManager.RTC_WAKEUP, triggerAt, pending)
                }
                Log.i("SmartAlarm", "alarma exacta programada ${hour}:${String.format("%02d", minute)} trigger ${java.util.Date(triggerAt)}")
            } else {
                alarmManager.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, triggerAt, pending)
                Log.i("SmartAlarm", "alarma inexacta programada (sin exact permission)")
            }
        } catch (e: Exception) {
            Log.e("SmartAlarm", "schedule error ${e.message}")
        }
    }

    fun cancel(context: Context) {
        try {
            val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
            val intent = Intent(context, SmartAlarmReceiver::class.java).apply { action = ACTION_SMART_ALARM }
            val pending = PendingIntent.getBroadcast(context, REQUEST_CODE, intent, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
            alarmManager.cancel(pending)
            val fav = Intent(context, SmartAlarmReceiver::class.java).apply { action = ACTION_SMART_ALARM }
            val favPending = PendingIntent.getBroadcast(context, REQUEST_FAVORABLE, fav, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
            alarmManager.cancel(favPending)
            cancelEscalations(context)
            Log.i("SmartAlarm", "alarma cancelada")
        } catch (e: Exception) {
            Log.e("SmartAlarm", "cancel error ${e.message}")
        }
    }

    fun cancelEscalations(context: Context) {
        try {
            val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
            for (level in 1..2) {
                val i = Intent(context, SmartAlarmReceiver::class.java).apply {
                    action = ACTION_ESCALATE
                    putExtra("level", level)
                }
                val p = PendingIntent.getBroadcast(context, REQUEST_ESCALATE_BASE + level, i, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
                alarmManager.cancel(p)
            }
        } catch (_: Exception) {}
    }

    fun scheduleEscalation(context: Context, level: Int, delaySec: Long) {
        try {
            val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
            val triggerAt = System.currentTimeMillis() + delaySec * 1000
            val intent = Intent(context, SmartAlarmReceiver::class.java).apply {
                action = ACTION_ESCALATE
                putExtra("level", level)
            }
            val pending = PendingIntent.getBroadcast(context, REQUEST_ESCALATE_BASE + level, intent, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                alarmManager.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, triggerAt, pending)
            } else {
                alarmManager.setExact(AlarmManager.RTC_WAKEUP, triggerAt, pending)
            }
            Log.i("SmartAlarm", "escalada nivel $level en ${delaySec}s")
        } catch (e: Exception) {
            Log.e("SmartAlarm", "escalation error ${e.message}")
        }
    }

    fun stopIntent(context: Context): PendingIntent {
        val i = Intent(context, SmartAlarmReceiver::class.java).apply { action = ACTION_STOP }
        return PendingIntent.getBroadcast(context, 3020, i, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
    }

    fun scheduleFavorableNow(context: Context) {
        // Disparo anticipado dentro de ventana favorable (LIGHT) — programa alarma inmediata +5s
        try {
            val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
            val triggerAt = System.currentTimeMillis() + 5000
            val intent = Intent(context, SmartAlarmReceiver::class.java).apply { action = ACTION_SMART_ALARM }
            val pending = PendingIntent.getBroadcast(context, REQUEST_FAVORABLE, intent, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                alarmManager.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, triggerAt, pending)
            } else {
                alarmManager.setExact(AlarmManager.RTC_WAKEUP, triggerAt, pending)
            }
            Log.i("SmartAlarm", "alarma favorable programada en 5s")
        } catch (e: Exception) {
            Log.e("SmartAlarm", "favorable error ${e.message}")
        }
    }

    private fun nextTargetTime(hour: Int, minute: Int): Long {
        val cal = Calendar.getInstance()
        cal.set(Calendar.HOUR_OF_DAY, hour)
        cal.set(Calendar.MINUTE, minute)
        cal.set(Calendar.SECOND, 0)
        cal.set(Calendar.MILLISECOND, 0)
        if (cal.timeInMillis <= System.currentTimeMillis()) {
            cal.add(Calendar.DAY_OF_YEAR, 1)
        }
        return cal.timeInMillis
    }
}
