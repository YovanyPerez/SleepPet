import AsyncStorage from "@react-native-async-storage/async-storage";
import { backfillWakeFromUnlocks } from "../services/WakeBackfillService";

const KEY = "sleep_history";

export async function saveSleepSession(session) {

  try {

    const history = await getSleepHistory();

    history.unshift(session);

    await AsyncStorage.setItem(
      KEY,
      JSON.stringify(history)
    );

  } catch (e) {

    console.log(e);

  }

}

export async function getSleepHistory() {

  try {

    const data = await AsyncStorage.getItem(KEY);

    const history = data ? JSON.parse(data) : [];

    // Migración única: sesiones viejas con desbloqueos pero ventanas LIGHT
    // (antes del fix WAKE por uso del celular) se corrigen y persisten.
    // Idempotente: tras la primera vez ya no detecta cambios ni reescribe.
    try {
      const { history: fixed, changed } = backfillWakeFromUnlocks(history);
      if (changed) {
        await AsyncStorage.setItem(KEY, JSON.stringify(fixed));
        return fixed;
      }
    } catch (e) {
      console.log("backfill WAKE:", e?.message ?? e);
    }

    return history;

  } catch (e) {

    return [];

  }

}

export async function clearSleepHistory() {

  try {

    await AsyncStorage.removeItem(KEY);

  } catch (e) {

    console.log(e);

  }

}