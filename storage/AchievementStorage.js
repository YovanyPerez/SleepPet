import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "sleep_pet_achievements";

export async function saveUnlockedAchievements(data) {

  try {

    await AsyncStorage.setItem(
      KEY,
      JSON.stringify(data)
    );

  } catch (e) {

    console.log(e);

  }

}

export async function loadUnlockedAchievements() {

  try {

    const data = await AsyncStorage.getItem(KEY);

    return data ? JSON.parse(data) : [];

  } catch (e) {

    return [];

  }

}

export async function clearUnlockedAchievements() {

  try {

    await AsyncStorage.removeItem(KEY);

  } catch (e) {

    console.log(e);

  }

}