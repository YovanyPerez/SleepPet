import AsyncStorage from "@react-native-async-storage/async-storage";

const CURRENT_SLEEP = "current_sleep_session";

export async function saveCurrentSleep(startTime) {

  try {

    await AsyncStorage.setItem(

      CURRENT_SLEEP,

      JSON.stringify(startTime)

    );

  } catch (e) {

    console.log(e);

  }

}

export async function getCurrentSleep() {

  try {

    const data = await AsyncStorage.getItem(CURRENT_SLEEP);

    return data ? JSON.parse(data) : null;

  } catch (e) {

    return null;

  }

}

export async function clearCurrentSleep() {

  await AsyncStorage.removeItem(CURRENT_SLEEP);

}