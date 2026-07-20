import AsyncStorage from "@react-native-async-storage/async-storage";

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

    return data ? JSON.parse(data) : [];

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