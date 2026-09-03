package com.gathod.SleepPet

import android.content.Context
import android.media.AudioAttributes
import android.media.MediaPlayer
import android.os.Build
import android.provider.Settings
import android.util.Log

/**
 * Reproductor singleton para alarma progresiva SmartAlarm.
 * Niveles: 0 suave (vol 0.25) -> 1 medio (0.6) -> 2 fuerte (1.0).
 * Usa tono de alarma del sistema, sin assets. Stop libera todo.
 */
object SmartAlarmPlayer {
    private var player: MediaPlayer? = null
    private var currentLevel = -1

    private val volumes = floatArrayOf(0.25f, 0.6f, 1.0f)

    @Synchronized
    fun play(context: Context, level: Int) {
        try {
            stopLocked()
            currentLevel = level.coerceIn(0, 2)
            val vol = volumes[currentLevel]
            val uri = Settings.System.DEFAULT_ALARM_ALERT_URI
                ?: Settings.System.DEFAULT_NOTIFICATION_URI
                ?: Settings.System.DEFAULT_RINGTONE_URI
            if (uri == null) {
                Log.w("SmartAlarm", "sin tono de sistema — solo vibración/notificación nivel $level")
                return
            }
            val mp = MediaPlayer()
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                mp.setAudioAttributes(
                    AudioAttributes.Builder()
                        .setUsage(AudioAttributes.USAGE_ALARM)
                        .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                        .build()
                )
            } else {
                @Suppress("DEPRECATION")
                mp.setAudioStreamType(android.media.AudioManager.STREAM_ALARM)
            }
            mp.setDataSource(context, uri)
            mp.setVolume(vol, vol)
            mp.isLooping = false
            mp.setOnCompletionListener { stop() }
            mp.setOnErrorListener { _, _, _ -> stop(); true }
            mp.prepare()
            mp.start()
            player = mp
            Log.i("SmartAlarm", "reproduciendo nivel $level vol=$vol")
        } catch (e: Exception) {
            Log.e("SmartAlarm", "play error nivel $level ${e.message}")
            stop()
        }
    }

    @Synchronized
    fun stop() {
        stopLocked()
        currentLevel = -1
    }

    private fun stopLocked() {
        try {
            player?.let {
                try { if (it.isPlaying) it.stop() } catch (_: Exception) {}
                try { it.reset() } catch (_: Exception) {}
                try { it.release() } catch (_: Exception) {}
            }
        } catch (_: Exception) {
        } finally {
            player = null
        }
    }
}
