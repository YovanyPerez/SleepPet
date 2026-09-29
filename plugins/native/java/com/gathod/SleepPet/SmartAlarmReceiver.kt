package com.gathod.SleepPet

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.graphics.BitmapFactory
import android.os.Build
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import android.util.Log
import androidx.core.app.NotificationCompat

class SmartAlarmReceiver : BroadcastReceiver() {

    companion object {

        // Detener/despertar guarda la FECHA (no un boolean): auto-expira al día
        // siguiente, así un Detener no silencia las noches futuras (latch del flag viejo).
        internal fun todayStr(): String {
            return java.time.LocalDate.now().toString()
        }

        internal fun isStoppedToday(prefs: android.content.SharedPreferences): Boolean {
            // Migración: el flag legacy "stopped" se considera expirado (suena de nuevo)
            if (prefs.contains("stopped")) {
                prefs.edit().remove("stopped").apply()
            }
            val d = prefs.getString("stoppedDate", "") ?: ""
            return d.isNotEmpty() && d == todayStr()
        }

        internal fun markStoppedToday(prefs: android.content.SharedPreferences) {
            if (prefs.contains("stopped")) {
                prefs.edit().remove("stopped").apply()
            }
            prefs.edit().putString("stoppedDate", todayStr()).apply()
        }
    }

    override fun onReceive(context: Context, intent: Intent?) {
        try {
            val action = intent?.action
            when (action) {
                SmartAlarmScheduler.ACTION_STOP -> {
                    handleStop(context)
                    return
                }
                SmartAlarmScheduler.ACTION_ESCALATE -> {
                    val level = intent?.getIntExtra("level", 1) ?: 1
                    handleEscalation(context, level)
                    return
                }
                else -> {
                    // ACTION_SMART_ALARM (target obligatorio o favorable +5s)
                    handleTrigger(context)
                }
            }
        } catch (e: Exception) {
            Log.e("SmartAlarm", "onReceive error ${e.message}")
        }
    }

    private fun prefs(context: Context) =
        context.getSharedPreferences(SleepForegroundService.SMART_ALARM_PREFS_NAME, Context.MODE_PRIVATE)

    private fun handleTrigger(context: Context) {
        val p = prefs(context)
        if (!p.getBoolean("enabled", false)) {
            Log.i("SmartAlarm", "alarma ignorada — disabled")
            return
        }
        // Si el usuario ya detuvo la alarma de HOY, no sonar (expira solo al cambiar de día)
        if (isStoppedToday(p)) {
            Log.i("SmartAlarm", "alarma ignorada — ya detenida hoy por usuario")
            return
        }
        val hour = p.getInt("hour", 7)
        val minute = p.getInt("minute", 0)
        Log.i("SmartAlarm", "¡ALARMA SmartAlarm disparada ${hour}:${String.format("%02d", minute)} nivel 0 suave!")
        p.edit()
            .putLong("lastTriggerMs", System.currentTimeMillis())
            .apply()
        // Nivel 0: sonido suave + vibración corta
        SmartAlarmPlayer.play(context, 0)
        vibrate(context, longArrayOf(0, 400, 300), intArrayOf(0, 80, 0))
        showSmartAlarmNotification(context, hour, minute, 0)
        // Escalar si no responde: +30s nivel 1, +60s nivel 2
        SmartAlarmScheduler.scheduleEscalation(context, 1, 30)
        SmartAlarmScheduler.scheduleEscalation(context, 2, 60)
    }

    private fun handleEscalation(context: Context, level: Int) {
        val p = prefs(context)
        if (!p.getBoolean("enabled", false)) return
        if (isStoppedToday(p)) {
            Log.i("SmartAlarm", "escalada nivel $level ignorada — detenida hoy")
            return
        }
        val hour = p.getInt("hour", 7)
        val minute = p.getInt("minute", 0)
        Log.i("SmartAlarm", "escalando alarma nivel $level")
        SmartAlarmPlayer.play(context, level)
        if (level == 1) {
            vibrate(context, longArrayOf(0, 600, 400, 600), intArrayOf(0, 150, 0, 150))
        } else {
            vibrate(context, longArrayOf(0, 800, 300, 800, 300, 800), intArrayOf(0, 255, 0, 255, 0, 255))
        }
        showSmartAlarmNotification(context, hour, minute, level)
    }

    private fun handleStop(context: Context) {
        try {
            markStoppedToday(prefs(context))
            SmartAlarmScheduler.cancelEscalations(context)
            SmartAlarmPlayer.stop()
            val manager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            manager.cancel(3001)
            Log.i("SmartAlarm", "alarma detenida por usuario (stop alarm)")
        } catch (e: Exception) {
            Log.e("SmartAlarm", "stop error ${e.message}")
        }
    }

    private fun vibrate(context: Context, timings: LongArray, amplitudes: IntArray) {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                val vm = context.getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as? VibratorManager
                val vib = vm?.defaultVibrator
                vib?.vibrate(VibrationEffect.createWaveform(timings, amplitudes, -1))
            } else {
                @Suppress("DEPRECATION")
                val vib = context.getSystemService(Context.VIBRATOR_SERVICE) as? Vibrator
                try {
                    vib?.vibrate(VibrationEffect.createWaveform(timings, amplitudes, -1))
                } catch (_: Exception) {
                    @Suppress("DEPRECATION")
                    vib?.vibrate(timings, -1)
                }
            }
        } catch (e: Exception) {
            Log.e("SmartAlarm", "vibrate error ${e.message}")
        }
    }

    private fun showSmartAlarmNotification(context: Context, hour: Int, minute: Int, level: Int) {
        try {
            val p = prefs(context)
            val channelId = "smart_alarm_channel"
            val manager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            val ch = NotificationChannel(channelId, "Smart Alarm", NotificationManager.IMPORTANCE_HIGH).apply {
                description = "Despertar favorable Smart Sleep"
                enableVibration(true)
                setShowBadge(false)
            }
            manager.createNotificationChannel(ch)
            val launchIntent = context.packageManager.getLaunchIntentForPackage(context.packageName)?.apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
                putExtra("fromSmartAlarm", true)
            }
            // launchIntent puede ser null en teoría (NPE latente): fallback al
            // desafío (siempre existe) o sin tap si tampoco hay desafío
            val pending = launchIntent?.let {
                PendingIntent.getActivity(context, 4001, it, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
            }
            // Modo desafío (escribir palabra): sin atajo Detener — el tap abre
            // la pantalla del desafío, única vía para silenciar (ACTION_STOP).
            val challenge = p.getString("dismissMode", "off") == "word"
            val contentPending = if (challenge) {
                val dismissIntent = Intent(context, SmartAlarmDismissActivity::class.java).apply {
                    flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
                }
                PendingIntent.getActivity(context, 4002, dismissIntent, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
            } else {
                pending
            }
            val stopIntent = Intent(context, SmartAlarmReceiver::class.java).apply { action = SmartAlarmScheduler.ACTION_STOP }
            val stopPending = PendingIntent.getBroadcast(context, 3020, stopIntent, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
            val timeStr = String.format("%02d:%02d", hour, minute)
            val stageTitle = when (level) {
                0 -> "SmartAlarm $timeStr — Buenos días (suave)"
                1 -> "SmartAlarm $timeStr — Hora de levantarse"
                else -> "SmartAlarm $timeStr — DESPIERTA"
            }
            val notif = NotificationCompat.Builder(context, channelId)
                .setSmallIcon(R.drawable.ic_sleep_moon)
                .setColor(0xFF5E60CE.toInt())
                .setLargeIcon(BitmapFactory.decodeResource(context.resources, R.mipmap.ic_launcher))
                .setContentTitle(stageTitle)
                .setContentText(
                    if (challenge) "Toca para escribir la palabra y apagar"
                    else "Despertar en fase ligera · Detener para silenciar"
                )
                .setPriority(NotificationCompat.PRIORITY_HIGH)
                .setCategory(NotificationCompat.CATEGORY_ALARM)
                .setAutoCancel(false)
                .setOngoing(true)
                .setContentIntent(contentPending)
                .setVibrate(longArrayOf(0, 600, 400, 600))
                .apply { if (!challenge) addAction(0, "Detener", stopPending) }
                .build()
            manager.notify(3001, notif)
            Log.i("SmartAlarm", "notificación SmartAlarm mostrada $timeStr nivel $level")
        } catch (e: Exception) {
            Log.e("SmartAlarm", "show notif error ${e.message}")
        }
    }
}
