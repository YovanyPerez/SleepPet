package com.gathod.SleepPet

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.graphics.BitmapFactory
import android.util.Log
import androidx.core.app.NotificationCompat

/**
 * One-shot de felicidad baja de la mascota: muestra la notificación
 * programada por NotificationModule.schedulePetAlert y listo (no re-agenda).
 * El tap abre la app. Si la mascota se recuperó antes, JS lo cancela con
 * cancelPetAlert y esto nunca dispara.
 */
class PetCheckReceiver : BroadcastReceiver() {

    companion object {
        const val CHANNEL_ID = "pet_mood_channel"
        const val NOTIFICATION_ID = 4001
        const val REQUEST_CODE = 4002
        const val EXTRA_TITLE = "title"
        const val EXTRA_CONTENT = "content"
    }

    override fun onReceive(context: Context?, intent: Intent?) {
        if (context == null) return
        try {
            val title = intent?.getStringExtra(EXTRA_TITLE).orEmpty()
            val content = intent?.getStringExtra(EXTRA_CONTENT).orEmpty()
            if (title.isEmpty() && content.isEmpty()) return
            val manager = context.getSystemService(
                Context.NOTIFICATION_SERVICE
            ) as NotificationManager
            val ch = NotificationChannel(
                CHANNEL_ID, "Mascota", NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = "Avisos de felicidad baja de tu mascota"
                setShowBadge(false)
            }
            manager.createNotificationChannel(ch)
            val launch = context.packageManager
                .getLaunchIntentForPackage(context.packageName)?.apply {
                    flags = Intent.FLAG_ACTIVITY_NEW_TASK or
                        Intent.FLAG_ACTIVITY_CLEAR_TOP
                }
            val pending = PendingIntent.getActivity(
                context, 4003, launch,
                PendingIntent.FLAG_UPDATE_CURRENT or
                    PendingIntent.FLAG_IMMUTABLE
            )
            val notif = NotificationCompat.Builder(context, CHANNEL_ID)
                .setSmallIcon(R.drawable.ic_sleep_moon)
                .setColor(0xFFFF8FAB.toInt())
                .setLargeIcon(
                    BitmapFactory.decodeResource(
                        context.resources, R.mipmap.ic_launcher
                    )
                )
                .setContentTitle(title)
                .setContentText(content)
                .setPriority(NotificationCompat.PRIORITY_HIGH)
                .setAutoCancel(true)
                .setContentIntent(pending)
                .build()
            manager.notify(NOTIFICATION_ID, notif)
            Log.i("SleepPet", "alerta de mascota mostrada")
        } catch (e: Exception) {
            Log.e("SleepPet", "petAlert error ${e.message}")
        }
    }
}
