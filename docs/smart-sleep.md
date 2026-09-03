# Smart Sleep — SleepPet (experimental)

> **Estimación, no medición médica.** SleepPet estima estados `WAKE/LIGHT/DEEP` con acelerómetro + micrófono del teléfono. No es polisomnografía, no usa smartwatch/EEG, no es dispositivo médico. Texto UI: `*estimación por reglas movimiento+audio`.

## 1. Arquitectura
```
SleepModeScreen START → AppContext → SleepForegroundService (foregroundServiceType specialUse|microphone + WAKE_LOCK 12h)
  → MovementDetector (TYPE_ACCELEROMETER SENSOR_DELAY_GAME ~50Hz) + AudioRecord (VOICE_RECOGNITION 16kHz mono PCM16) HandlerThread
  → ventana 30s SMART_WINDOW_MS 30000 sincronizada → RMS/ZCR por ventana → closeSmartWindow()
  → reglas Cole-Kripke/Sadeh adaptadas → {WAKE|LIGHT|DEEP, confidence, level} → MovementModule → MovementService → sleep_history.smartWindows
  → SmartAlarm window [target-windowMin, target] → log momento favorable (TODO progresiva)
  → Statistics/Results hipnograma estimado*
```
- **Fuente única nativa:** `SleepForegroundService.kt` inner `MovementDetector` + `AudioProcessor` (mismo servicio, no 2 servicios). `MovementModule`/`SmartAlarmModule` solo puentes.
- **Dos copias nativas:** `plugins/native/java/...` source of truth → `withSleepPetNative.js` copia a `android/app/src/main/java/...` en `expo prebuild`; `MainApplication.getPackages()` + `PACKAGE_ADDS` registran `MovementPackage`/`SmartAlarmPackage`.

## 2. Sensores
- **Acelerómetro:** `|sqrt(x²+y²+z²)-g|` m/s², histéresis `START 0.32 / END 0.15` (cama), `QUIET 2s`, `MIN 1.2s`, `COOLDOWN 3s`, epochs `5m` + **smartWindows `30s` 960 cap ~8h**, `samples ~1484/30s` `50Hz`. Persistencia `sleep_movement` `SharedPreferences` `{events, score, epochs, smartWindows}` sobrevive muerte proceso; `EXTRA_RESUME` distingue nueva vs restore.
- **Micrófono:** `AudioRecord` `16kHz` `1024` `short[]` continuo en `SmartAudioThread`, alimentado `MovementDetector.addAudioChunk(chunk)` por ventana `30s` → `RMS sqrt(mean(s²))` `ZCR cruces/samples` → **descartado tras features** (`Arrays.fill` + GC, nunca archivo). Si `RECORD_AUDIO` denegado → `NO_AUDIO` `hasAudio false` `accel-only` (sesión no se bloquea). `FOREGROUND_SERVICE_MICROPHONE` + `RECORD_AUDIO` + `FOREGROUND_SERVICE_SPECIAL_USE` + `WAKE_LOCK` en `withSleepPetNative.js:9` y `AndroidManifest.xml` (`foregroundServiceType specialUse|microphone`, `uses-feature microphone required=false`).

## 3. Procesamiento por ventana 30s
- **Movimiento:** `avg = sum(movement)/samples`, `max`, `avgExcess = sum(max(0,movement-0.10)*dt)/duration`.
- **Audio:** `audioRms` `audioZcr` `audioSamples ~480k` (`16kHz*30s`), `hasAudio` flag.
- **Sincronía:** `maybeCloseSmartWindows(nowWall)` cierra ventana `idx = (nowWall-start)/30000` tanto desde `onSensorChanged` (sensor) como `tick 1s` (tiempo) como `addAudioChunk` (audio); `@Synchronized` evita duplicados vistos `21:54` `3 logs mismo idx`.

## 4. Clasificador WAKE/LIGHT/DEEP (sin ML)
- **Por qué no REM/NREM ML:** datasets `Sleep-EDF/MESA/SHHS` con PSG usan `EEG/actigrafía` wearable, no `audio smartphone + PSG` simultáneo; `REM` sin `EEG` es problema abierto; presentar `LIGHT/DEEP` por reglas es válido para `SmartAlarm` (despertar en ligero).
- **Reglas Fase C (Kotlin `closeSmartWindow`):**
  - `level` `LOW<0.93 MED<1.02 HIGH>=1.02` (recalibrado `rsmzu8mztspndyj7` baseline `0.88-0.94` no `0.07`; `pico del minuto` `1.0-1.3` quieto).
  - `WAKE` si `avg>=1.02` (`SMART_WAKE_THRESHOLD 1.0`) o `audioRms>=0.015` && `avg>=0.93`.
  - Si no `WAKE` y `avg<0.90` && `audioRms<0.015` → `DEEP` else `LIGHT` (`SMART_LIGHT_AVG_THRESHOLD 0.90`).
  - `confidence = 0.5+distance*0.5` clamp `0.3-0.95` (lejos del umbral = alta), suavizado `2` ventanas consecutivas `prevRawStage == rawStage` para cambiar `smoothedStage` (evita `DEEP→LIGHT` cada `30s`).
  - Interfaz `stage/rawStage/confidence/level/hasAudio` por ventana + `snapshot` parcial no-mutante (poll `30s` no fragmenta).
- **Calibración:** `0.93/1.02/1.0/0.015/0.90` en `SleepForegroundService.kt:80` `companion`, ajustables con `logcat SmartSleep ventana #idx avg/max/audioRms/stage` + `SmartAudio rms/zcr` (quieto `rms 0.002-0.003`, habla `0.08`). `Movement: pico del minuto` para umbrales cama. No requiere dataset etiquetado grande; validar con `3-5` noches propias vs percepción subjetiva.

## 5. SmartAlarm
- **Config:** `storage/SmartAlarmStorage.js` `smart_alarm_settings` `{enabled, hour, minute, windowMin 15/30/45}` + `services/SmartAlarmService.js` + nativo `SmartAlarmModule` `SharedPreferences smart_alarm` (`setConfig/getConfig/isInSmartAlarmWindow`). `SettingsScreen` card `SmartAlarm` (`Switch` + `TimeSelector` `HH:MM` + pills `15/30/45`).
- **Lógica:** `SleepForegroundService.closeSmartWindow()` check `isInSmartAlarmWindow(startWall)` (`target hour:minute` vs `startWall` de ventana) → si `LIGHT` && `confidence>=0.6` log `SmartAlarm: momento favorable LIGHT` (TODO `sonido suave → vibración` progresiva, hoy solo log). Si no favorable hasta `targetTime` → alarma obligatoria (nunca omite).
- **Fallback:** `smart_alarm disabled` o `NO_AUDIO` → `accel-only` (sin `LIGHT/DEEP` fiable), `clasificador fail` → `tracking básico duración`, `SmartAlarm fail` → `alarma normal targetTime`.

## 6. Historial y UI
- **Sesión:** `SleepModeScreen.finishSleep()` `getMovementSummary()` → `session.smartWindows[]` (`stage/confidence/audioRms`) + `estimatedStages{wake,light,deep} min` (`toMin` `windowMs 30000`) + `smartWindowMs` → `sleep_history` (retrocompat `??`).
- **Statistics:** `StatisticsScreen` `smartSessions` filtra `estimatedStages` `!isNap`, promedia `wake/light/deep min` en `StatCard` + hipnograma `WAKE(60px)/LIGHT(36px)/DEEP(18px)` con colores `#FF8FAB/#FFD166/#8FA3FF` últimas `48` ventanas.
- **Results:** `ResultsScreen` `metricCard` `Sueño estimado*` `deep/light/wake m` + disclaimer `*Estimación por reglas`.
- **SleepMode:** debug card `Fase C` `Smart Sleep (Fase C)` `N ventanas · avg/max · LEVEL · stage conf%` + `audio rms/zcr` + `*estimación no diagnóstico`.

## 7. Permisos y privacidad
- **Permisos:** `RECORD_AUDIO` runtime (`PermissionsAndroid.request` en `SleepModeScreen.handleStartSleep` tras `ACTIVITY_RECOGNITION`, `Alert` `micPermissionTitle/Message` ES: *procesa local, descarta tras RMS/ZCR*), `FOREGROUND_SERVICE_MICROPHONE` + `FOREGROUND_SERVICE_SPECIAL_USE` + `WAKE_LOCK` + `POST_NOTIFICATIONS`/`ACTIVITY_RECOGNITION`. Acelerómetro sin permiso. `CAMERA` ya de `PPG` (`minSdk 26`).
- **Privacidad:** `Mic → PCM short[1024] → RMS/ZCR ventana 30s → stage → descartar chunk` (GC, nunca `FileOutputStream` toda la noche, no `RECORD_AUDIO` guardado, no envío servidor, no reconocimiento voz). Si `RECORD_AUDIO` denegado → `NO_AUDIO` `hasAudio false`.

## 8. Consumo y Doze
- **WakeLock:** `PowerManager.PARTIAL_WAKE_LOCK` `12h` en `onStartCommand` + `sensorKeepAliveRunnable` `120s` re-registra `TYPE_ACCELEROMETER` (fix `0 samples` visto `21:08` `8m` y `21:42` `10m` con `mWakefulness=Asleep` aun con `isForeground true`).
- **Frecuencias:** `SENSOR_DELAY_GAME ~50Hz` `1484 samples/30s` + `AudioRecord 16kHz` `480k samples/30s` `RMS/ZCR O(N)` cada `30s` despreciable; `confidence` aritmética `~5 operaciones/ventana`.
- **Medición:** `dumpsys batterystats` `10m` noche, `logcat` `samples` estables, `wakeLock` solo mientras `running` (`acquire` en `onStartCommand`, `release` en `onDestroy`).

## 9. Limitaciones
- `WAKE/LIGHT/DEEP` es **estimación por reglas** `avg/audioRms` calibrada en `rsmzu8mztspndyj7` (no `~0.07` genérico), no `PSG`, no `REM/N1/N2/N3`. Presentar siempre con `*` y disclaimer.
- Audio sin `mel-spectrogram` (sobre-ingeniería para reglas); `ZCR` basta para `Fase B`, `RMS` distingue silencio vs habla/ronquido leve.

## 10. Cómo probar
- `adb logcat -s SmartSleep:V SmartAudio:V SmartAlarm:V Movement:V` cada `30s` `avg/max/level/stage/rms/zcr` sin `0 samples`, `samples 1484/480k`, `stage` `LIGHT→DEEP` estable tras `2` ventanas `DEEP` (ej `21:54 LIGHT raw DEEP 0.37` → `21:56 DEEP 0.59`).
- Mesa plana silenciosa `60s` → `avg 0.82-0.93 LOW` `rms 0.002` `DEEP`; hablar `10s` → `rms 0.08` `WAKE`; denegar mic → `NO_AUDIO`.
- Noche larga `12m` quieto → `DEEP` continuo sin duplicados (fix `@Synchronized` `21:54` triplicado).

## 11. Umbrales calibrados (Fase C)
- `FINGER_MIN/SPATIAL_STD_MAX` `PPG` intactos `hooks/usePPG.js:8`; `SMART_WAKE 1.0 / AUDIO_RMS 0.015 / LIGHT_AVG 0.90 / LOW 0.93 MED 1.02` en `SleepForegroundService.kt:80` (recalibrar con `N·avg·rms` si cambia dispositivo/colchón).
