import React, { useContext, useState, useEffect, useRef } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  Switch,
  PermissionsAndroid,
  Platform,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { AppContext } from "../context/AppContext";
import { NIGHT } from "../constants/theme";
import { getTranslations } from "../services/TranslationService";
import { isAccessibilityEnabled, openAccessibilitySettings } from "../services/AccessibilityListener";
import { getNotificationStatus, openNotificationSettings } from "../services/NotificationService";
import { scheduleReminder, cancelReminder } from "../services/ReminderService";
import { getReminderSettings, saveReminderSettings } from "../storage/ReminderStorage";
import { setSmartAlarmConfig } from "../services/SmartAlarmService";
import { getSmartAlarmSettings, saveSmartAlarmSettings } from "../storage/SmartAlarmStorage";
import { getMissingSetup } from "../services/SetupCheckService";
import NightBackground from "../components/NightBackground";
import AppText from "../components/AppText";
import AppIcon from "../components/AppIcon";
import TimeSelector, { wrapValue } from "../components/TimeSelector";
import styles from "./styles/SleepSetupScreen.styles";

// Preparación previa a la primera sesión (o a pendientes). NO inicia sesiones:
// solo configura y verifica; el flujo real sigue en SleepMode.handleStartSleep.
// firstRun=true → muestra todo. Si no, SOLO bloqueantes pendientes (cond. 6).
export default function SleepSetupScreen({ navigation, route }) {
  const { language } = useContext(AppContext);
  const t = getTranslations(language);

  const firstRun = route.params?.firstRun === true;

  const [a11yOk, setA11yOk] = useState(null);
  const [notifOk, setNotifOk] = useState(null);
  const [missing, setMissing] = useState(route.params?.missing ?? []);

  const [reminder, setReminderState] = useState({ enabled: false, hour: 22, minute: 30 });
  const [smart, setSmartState] = useState({ enabled: false, hour: 7, minute: 0, windowMin: 30 });

  const appear = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(appear, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [appear]);

  async function refreshChecks() {
    try {
      setA11yOk(await isAccessibilityEnabled());
    } catch (e) {
      setA11yOk(false);
    }
    try {
      if (Platform.OS === "android" && Platform.Version >= 33) {
        setNotifOk(await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS));
      } else {
        const status = await getNotificationStatus();
        setNotifOk(!!status?.notificationsEnabled);
      }
    } catch (e) {
      setNotifOk(false);
    }
    try {
      setMissing(await getMissingSetup());
    } catch (e) {}
  }

  // Re-comprueba al volver de los ajustes de Android (cond. focus)
  useEffect(() => {
    refreshChecks();
    const unsub = navigation.addListener("focus", refreshChecks);
    return unsub;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigation]);

  useEffect(() => {
    (async () => {
      try {
        const r = await getReminderSettings();
        if (r) setReminderState({ enabled: !!r.enabled, hour: r.hour ?? 22, minute: r.minute ?? 30 });
      } catch (e) {}
      try {
        const s = await getSmartAlarmSettings();
        if (s) setSmartState(s);
      } catch (e) {}
    })();
  }, []);

  async function requestNotifications() {
    if (Platform.OS === "android" && Platform.Version >= 33) {
      try {
        await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
      } catch (e) {}
    } else {
      openNotificationSettings();
    }
    refreshChecks();
  }

  function applyReminder(next) {
    setReminderState(next);
    saveReminderSettings(next);
    if (next.enabled) {
      scheduleReminder(
        next.hour,
        next.minute,
        t.reminderChannel,
        t.reminderChannelDescription,
        t.reminderTitle,
        t.reminderContent,
        t.reminderFollowUpTitle,
        t.reminderFollowUpContent
      );
    } else {
      cancelReminder();
    }
  }

  function stepReminderTime(field, direction) {
    const next =
      field === "hour"
        ? { ...reminder, hour: wrapValue(reminder.hour, direction, 0, 23) }
        : { ...reminder, minute: wrapValue(reminder.minute, direction, 0, 59) };
    applyReminder(next);
  }

  function applySmart(next) {
    setSmartState(next);
    saveSmartAlarmSettings(next);
    setSmartAlarmConfig(next).catch(() => {});
  }

  function stepSmartTime(field, direction) {
    const next =
      field === "hour"
        ? { ...smart, hour: wrapValue(smart.hour, direction, 0, 23) }
        : { ...smart, minute: wrapValue(smart.minute, direction, 0, 59) };
    applySmart(next);
  }

  function handleContinue() {
    if (firstRun) {
      navigation.replace("SleepMode");
    } else {
      navigation.goBack();
    }
  }

  function handleBack() {
    if (firstRun) {
      navigation.replace("Home");
    } else {
      navigation.goBack();
    }
  }

  const showA11y = firstRun || missing.includes("accessibility");
  const showNotif = firstRun || missing.includes("notifications");
  const showOptional = firstRun;
  const allBlockingDone = !missing.includes("accessibility") && !missing.includes("notifications");

  function statusIcon(ok) {
    if (ok === null) {
      return <AppIcon name="clock" size={22} color="#FFFFFF" />;
    }
    return ok
      ? <AppIcon name="check" size={22} color="#4CAF50" />
      : <AppIcon name="warning" size={22} color={NIGHT.yellow} />;
  }

  return (
    <NightBackground moon={false}>
      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        <Animated.View style={{ flex: 1, opacity: appear }}>
          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

            <View style={styles.header}>
              <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
              </TouchableOpacity>
              <View style={styles.headerText}>
                <AppText style={styles.title}>{t.setupTitle}</AppText>
                <AppText style={styles.subtitle}>
                  {firstRun ? t.setupSubtitle : t.setupPendingOnly}
                </AppText>
              </View>
            </View>

            {showA11y && (
              <View style={styles.rowCard}>
                <View style={styles.rowHeader}>
                  <View style={[styles.statusCircle, a11yOk ? styles.statusOk : styles.statusPending]}>
                    {statusIcon(a11yOk)}
                  </View>
                  <View style={styles.rowTitleWrap}>
                    <AppText style={styles.rowTitle}>{t.setupAccessibilityTitle}</AppText>
                  </View>
                  <AppIcon name="accessibility" size={22} color={NIGHT.yellow} />
                </View>
                <AppText style={styles.rowBody}>{t.setupAccessibilityBody}</AppText>
                {!a11yOk && (
                  <TouchableOpacity style={styles.actionButton} onPress={() => openAccessibilitySettings()}>
                    <AppText style={styles.actionText}>{t.setupAccessibilityAction}</AppText>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {showA11y && (
              <View style={styles.rowCard}>
                <View style={styles.rowHeader}>
                  <View style={[styles.statusCircle, a11yOk ? styles.statusOk : styles.statusPending]}>
                    {statusIcon(a11yOk)}
                  </View>
                  <View style={styles.rowTitleWrap}>
                    <AppText style={styles.rowTitle}>{t.setupRestrictedTitle}</AppText>
                  </View>
                  <AppIcon name="warning" size={22} color={NIGHT.yellow} />
                </View>
                <AppText style={styles.rowBody}>{t.setupRestrictedBody}</AppText>
              </View>
            )}

            {showNotif && (
              <View style={styles.rowCard}>
                <View style={styles.rowHeader}>
                  <View style={[styles.statusCircle, notifOk ? styles.statusOk : styles.statusPending]}>
                    {statusIcon(notifOk)}
                  </View>
                  <View style={styles.rowTitleWrap}>
                    <AppText style={styles.rowTitle}>{t.setupNotificationsTitle}</AppText>
                  </View>
                  <AppIcon name="bell" size={22} color={NIGHT.yellow} />
                </View>
                <AppText style={styles.rowBody}>{t.setupNotificationsBody}</AppText>
                {!notifOk && (
                  <TouchableOpacity style={styles.actionButton} onPress={requestNotifications}>
                    <AppText style={styles.actionText}>{t.setupNotificationsAction}</AppText>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {showOptional && (
              <View style={styles.rowCard}>
                <View style={styles.rowHeader}>
                  <View style={[styles.statusCircle, reminder.enabled ? styles.statusOk : styles.statusPending]}>
                    {reminder.enabled
                      ? <AppIcon name="check" size={22} color="#4CAF50" />
                      : <AppIcon name="clock" size={22} color="#FFFFFF" />}
                  </View>
                  <View style={styles.rowTitleWrap}>
                    <AppText style={styles.rowTitle}>{t.setupReminderTitle}</AppText>
                  </View>
                  <AppIcon name="reminder" size={22} color={NIGHT.yellow} />
                </View>
                <AppText style={styles.rowBody}>{t.setupReminderBody}</AppText>
                <View style={styles.switchRow}>
                  <AppText style={styles.switchLabel}>{t.setupReminderTitle}</AppText>
                  <Switch
                    value={reminder.enabled}
                    onValueChange={(v) => applyReminder({ ...reminder, enabled: v })}
                    trackColor={{ true: NIGHT.end, false: "#D0D0D0" }}
                    thumbColor="#FFFFFF"
                  />
                </View>
                {reminder.enabled && (
                  <TimeSelector
                    hour={reminder.hour}
                    minute={reminder.minute}
                    hourLabel={t.reminderHour}
                    minuteLabel={t.reminderMinute}
                    onStep={stepReminderTime}
                  />
                )}
              </View>
            )}

            {showOptional && (
              <View style={styles.rowCard}>
                <View style={styles.rowHeader}>
                  <View style={[styles.statusCircle, smart.enabled ? styles.statusOk : styles.statusPending]}>
                    {smart.enabled
                      ? <AppIcon name="check" size={22} color="#4CAF50" />
                      : <AppIcon name="clock" size={22} color="#FFFFFF" />}
                  </View>
                  <View style={styles.rowTitleWrap}>
                    <AppText style={styles.rowTitle}>{t.setupSmartAlarmTitle}</AppText>
                  </View>
                  <AppIcon name="sparkles" size={22} color={NIGHT.yellow} />
                </View>
                <AppText style={styles.rowBody}>{t.setupSmartAlarmBody}</AppText>
                <View style={styles.switchRow}>
                  <AppText style={styles.switchLabel}>{t.setupSmartAlarmTitle}</AppText>
                  <Switch
                    value={smart.enabled}
                    onValueChange={(v) => applySmart({ ...smart, enabled: v })}
                    trackColor={{ true: NIGHT.end, false: "#D0D0D0" }}
                    thumbColor="#FFFFFF"
                  />
                </View>
                {smart.enabled && (
                  <>
                    <TimeSelector
                      hour={smart.hour}
                      minute={smart.minute}
                      hourLabel={t.reminderHour}
                      minuteLabel={t.reminderMinute}
                      onStep={stepSmartTime}
                    />
                    <View style={styles.windowRow}>
                      {[15, 30, 45].map((w) => (
                        <TouchableOpacity
                          key={w}
                          style={[styles.windowBtn, smart.windowMin === w && styles.windowBtnActive]}
                          onPress={() => applySmart({ ...smart, windowMin: w })}
                        >
                          <AppText style={[styles.windowText, smart.windowMin === w && styles.windowTextActive]}>
                            {w} min
                          </AppText>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </>
                )}
              </View>
            )}

            {!firstRun && allBlockingDone && (
              <View style={styles.doneBox}>
                <AppIcon name="check" size={22} color="#4CAF50" />
                <AppText style={styles.doneText}>{t.setupDone}</AppText>
              </View>
            )}

            <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
              <AppText style={styles.continueText}>{t.setupContinue}</AppText>
            </TouchableOpacity>

          </ScrollView>
        </Animated.View>
      </SafeAreaView>
    </NightBackground>
  );
}
