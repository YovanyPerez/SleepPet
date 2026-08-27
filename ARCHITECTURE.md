# SleepPet — Arquitectura

> Fuente operativa: `AGENTS.md` (constraints críticos: New Arch ON, sync nativo, builds).  
> Este documento describe el funcionamiento actual de la app. `AGENTS.md` se deja intacto.

## 1. Stack & Overview

- **Expo SDK 54 / React Native 0.81.5 / New Architecture ON** (`newArchEnabled:true` en `app.json` y `android/gradle.properties`)
- **Hermes**, **AsyncStorage**, **React Navigation (native-stack)**
- **Cámara PPG:** `react-native-vision-camera 4.7.3` + `react-native-reanimated 4.1.7` + `react-native-worklets 0.5.2` + `react-native-worklets-core 1.6.3`
- **UI:** `expo-linear-gradient`, `@expo-google-fonts/nunito`, `@expo/vector-icons`, `expo-constants`
- **Solo Android** (`foregroundServiceType="specialUse"`). `minSdk 26` (requerido por `frame.toArrayBuffer()`).

## 2. Estructura del proyecto

```
App.js
navigation/AppNavigator.js
context/AppContext.js
screens/*.js + screens/styles/*.styles.js
components/*.js          # primitivas de diseño
services/*.js            # lógica de dominio
storage/*.js             # AsyncStorage wrappers
hooks/usePPG.js, hooks/useSleepSession.js
constants/theme.js, constants/tabs.js, constants/PetImages.js
translations/es.js, translations/en.js
plugins/native/java/com/gathod/SleepPet/  # source of truth nativo
plugins/withSleepPetNative.js             # copia a android/ en prebuild
android/                                  # generado por expo prebuild / compilado por Gradle
assets/pets/<id>/{happy,normal,sleepy,sad}.png
tools/testPPG.js
```

## 3. Bootstrap & Navegación

```mermaid
graph TD
  App --> Fonts[Nunito 400/600/700/800]
  Fonts --> AppProvider
  AppProvider --> AppNavigator
  AppNavigator --> Loading[LoadingScreen]
  AppNavigator --> Welcome
  AppNavigator --> Home
  Welcome --> CreateProfile --> Home
  Home --> SleepMode
  Home --> Statistics & Achievements & PetShop & Settings & Menu
  Menu --> Profile & History
  SleepMode --> PPGMeasure
  SleepMode --> Results
```

- `App.js:14` carga fuentes con `useFonts`; mientras tanto `LoadingScreen`.
- `AppProvider` envuelve `AppNavigator`.
- `AppNavigator.js:60` single `createNativeStackNavigator` con `headerShown:false`; ruta inicial `userName ? "Home" : "Welcome"`; 15 screens + `AchievementPopup` global overlay.
- `SwipeableTabScreen` + `constants/tabs.js:TAB_ORDER` permite swipe horizontal entre las 5 tabs del `BottomNav`.

## 4. Estado global — `context/AppContext.js`

Single source of truth. Carga en `loadData()` y guarda automático en `saveAppData()`.

| Dominio | Keys en AppContext | Persistencia |
|---|---|---|
| Perfil | `userName`, `petNames{m}`, `userAge`, `goalHours`, `goalType`, `selectedPet`, `ownedPets`, `language` | `sleep_pet_data` |
| Economía | `coins` | `sleep_pet_data` |
| Nivel | `level`, `xp` (100 XP/nivel) | `sleep_pet_data` |
| Mascota | `petMood`, `petHappiness`, `lastHappinessUpdate` | `sleep_pet_data` |
| Racha | `streak`, `lastStreakDateKey` | `sleep_pet_data` |
| Historial | `sleepHistory[]`, `lastSleepSession`, `lastSleepHours` | `sleep_history` |
| Sesión | `sleepSessionStarted`, `unlockCount`, `unlockTimes`, `preSleepBpm`, `bpmConfidence` | `current_sleep_session` + `sleep_pet_data` |
| Logros | `unlockedAchievements`, `achievementPopup` | `sleep_pet_achievements` |

Efectos en `AppContext`:
- Hidratación + restart de sesión activa (`startNotification` + `setSleepActive(true)`) + `decayPetHappiness` hasta `startTime` si hay sesión.
- Re-schedule del recordatorio en cada cambio de `language`.
- Listener de desbloqueos (`startAccessibilityListener`) que solo incrementa si `sleepSessionStarted`.
- `updateUnlockState` / `updateUnlocks` en cada cambio de `unlockCount`.

## 5. Storage — AsyncStorage

| Key | Contenido | Storage |
|---|---|---|
| `sleep_pet_data` | perfil+economía+petMood+level+xp+language+`preSleepBpm`/`bpmConfidence` | `AppStorage.js` |
| `current_sleep_session` | `{startTime, active, unlockCount, unlockTimes, preSleepBpm, bpmConfidence, bpmCapturedAt, bpmSource}` | `CurrentSleepStorage.js` |
| `sleep_history` | array de sesiones finalizadas (cada una con bpm si hubo) | `SleepStorage.js` |
| `sleep_pet_achievements` | ids desbloqueados | `AchievementStorage.js` |
| `sleep_reminder_settings` | `{enabled, hour, minute}` | `ReminderStorage.js` |
| SharedPrefs `sleep_reminder` | `sleepActive`, `followupCount/Max`, `followupTitle/Content` | nativo `ReminderModule` |

Racha: `StreakService.computeStreakUpdate` (`STREAK_MIN_HOURS=3`, 1×/día, siestas <3h neutras).

## 6. Flujos core

### 6.1 Sesión de sueño

```mermaid
sequenceDiagram
  participant U as Usuario
  participant SM as SleepModeScreen
  participant Ctx as AppContext
  participant Svc as SleepService
  participant FG as SleepForegroundService
  participant R as ResultsScreen
  U->>SM: START SLEEP
  SM->>SM: request POST_NOTIFICATIONS + ACTIVITY_RECOGNITION + check Accessibility
  SM->>Ctx: setSleepSessionStarted(true)
  Ctx->>Svc: startSleep({preSleepBpm, bpmConfidence}) -> current_sleep_session
  Ctx->>FG: startNotification(startTime)
  Note over Ctx,FG: notificación persistente con tiempo + unlockCount
  FG-->>Ctx: tick cada 1s (useSleepSession)
  U->>SM: WAKE UP
  SM->>Svc: finishSleepSession() -> discarta si <0.5h
  Svc->>R: calculateSleepRewards (score 100-(goal-h)*10 - unlocks*5) -> coins/XP/streak/logros
  Ctx->>FG: stopForeground
```

### 6.2 Detección de desbloqueos

```mermaid
graph LR
  A[UnlockAccessibilityService] -->|SCREEN_OFF arma| B
  B -->|USER_PRESENT / WINDOW_STATE_CHANGED con debounce 2s| C[AccessibilityModule.checkForegroundApp]
  C -->|PHONE_UNLOCKED| D[AccessibilityListener.js]
  D --> E[AppContext startAccessibilityListener]
  E -->|solo si sleepSessionStarted| F[unlockCount++ / unlockTimes[]]
  F --> G[SleepService.updateUnlockState]
  F --> H[NotificationService.updateUnlocks]
```

### 6.3 Fotopletismografía PPG

```mermaid
graph TD
  A[SleepMode card ¿Medir pulso?] --> B[PPGMeasureScreen auto-arm]
  B --> C{GOOD_STREAK 30 + preparing 350ms}
  C --> D[usePPG measuring]
  D --> E[FrameProcessor plano Y wh/4096 + spatialStd]
  E --> F[PPGService Butterworth 0.7-4Hz -> Hampel -> picos adaptativos -> BPM temporal]
  F --> G[Verificador espectral DFT 0.7-4Hz]
  G --> H{delta <=5?}
  H -->|si| I[conf+0.05]
  H -->|no| J[conf*0.65]
  I & J --> K{Cadena estable 3s ancho 5bpm x5 lecturas}
  K --> L[BPM confirmado -> SleepMode preSleepBpm]
  L --> M[ResultsScreen badge + History SleepCard]
```

- Gates: `FINGER_MIN 80`, `SPATIAL_STD_MAX 18` (textura intra-frame), `BAD_STREAK 15`/`GOOD_STREAK 30`, `PULSATILE_MIN_STD 1.0` (`filteredStd<1 && conf<0.60 -> low_pulsatile`).
- Validado con `tools/testPPG.js` señal sintética 30Hz (11/13 OK, `delta espectral 0.0-0.1`).

### 6.4 Recordatorio para dormir

`SettingsScreen` guarda `{enabled,hour,minute}` → `ReminderService.scheduleReminder` → `ReminderModule.schedule` (`AlarmManager.setAlarmClock` si `canScheduleExactAlarms()`, fallback `setInexactRepeating`) → `ReminderReceiver` muestra notificación y re-agenda; followups cada 15min ×4 con `sleepActive` gate. Sin `BOOT_COMPLETED` — se pierde al reiniciar hasta reabrir app.

### 6.5 Economía & Mascotas

- `PET_IMAGES` auto-detectadas vía `require.context` en `assets/pets/`; añadir mascota = subir carpeta con 4 moods.
- `PetService.PETS` deriva `available` de `AVAILABLE_PETS`.
- `PetHappinessService`: `calculatePetHappiness` (+10/6/2/-12) + `decayPetHappiness` (1/h tras 6h gracia).

## 7. Capa nativa

- **Módulos legacy** registrados en `MainApplication.getPackages()`: `AccessibilityModule`, `NotificationModule`, `ReminderModule` (requieren New Arch ON).
- **Dos copias:** `plugins/native/...` es source of truth; `withSleepPetNative.js` copia a `android/app/src/main/java/...` en `expo prebuild`; Gradle compila las copias de `android/`.
- **Foreground:** `SleepForegroundService` con `specialUse` (no `health`).
- **Permisos:** `CAMERA` via `expo-build-properties` + `withSleepPetNative` + `AndroidManifest.xml` manual.

## 8. Sistema de diseño

- **Tema nocturno** `constants/theme.js:NIGHT` (`#1B1B4B`→`#5E60CE`, lavandas, amarillo `#FFD166`, rosa `#FF8FAB`), fuente `Nunito` vía `theme.FONT_FAMILY`, primitivas `NightBackground`/`GlowMoon`/`Card`/`AppText`/`AppIcon`/`BottomNav`/`ProgressBar`/`SectionHeader`/`MotivationalCard`.
- **Patrones:** `NIGHT_STYLES` en `theme.js` + `screens/styles/*.styles.js` (sin `StyleSheet.create` inline).
- Pantallas de referencia: `HomeScreen` (header+mascota+streak/nivel+LAST NIGHT), `SleepModeScreen` (GlowMoon + unlocks + glass cards), `PPGMeasureScreen` (círculo 130px + anillo estado + corazón 60000/liveBpm + sparkline + barra estabilidad).

## 9. Traducciones, Build & Debug

- `translations/{es,en}.js` vía `TranslationService.getTranslations(language)`.
- **Build:** `cd android && gradlew assembleRelease` → `app-release.apk` (debug-signed); `adb install -r ...`; `org.gradle.jvmargs=-Xmx4096m`; bump `versionCode` en `app.json` y `android/app/build.gradle`.
- **Debug:** `npx expo run:android` (Metro); release usa bundle Hermes embebido.
- **adb** en `C:\Android\Sdk\platform-tools\adb.exe`; tags logcat `UnlockA11y`, `ReactNativeJS` (`PPG frame avg=... spatialStd=...`, `PPG: live BPM ... filteredStd ... spectralBpm ...`), `Frame`.

## 10. Convenciones

- Comentarios y logs en español.
- Tunables PPG arriba de cada archivo (`FINGER_MIN`, `SPATIAL_STD_MAX`, `EXPOSURE_BIAS`, `HAMPEL_K`, `PULSATILE_MIN_STD`, `SPECTRAL_*`).
- Ver `AGENTS.md` para constraints críticos que no se repiten aquí (New Arch, sync nativo, OOM, gotchas VisionCamera `useCameraDevice("back")` + lazy `frameProcessor` + `toArrayBuffer` minSdk 26).
