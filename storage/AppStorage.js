import AsyncStorage from "@react-native-async-storage/async-storage";

const APP_DATA = "sleep_pet_data";

export async function saveAppData(data) {

  try {

    await AsyncStorage.setItem(
      APP_DATA,
      JSON.stringify(data)
    );

  } catch (e) {

    console.log(e);

  }

}

export async function loadAppData() {

  try {

    const data = await AsyncStorage.getItem(APP_DATA);

    return data ? JSON.parse(data) : null;

  } catch (e) {

    return null;

  }

}

export async function clearAppData() {

  await AsyncStorage.removeItem(APP_DATA);

}