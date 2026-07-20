import AsyncStorage from "@react-native-async-storage/async-storage";

const PROFILE_KEY = "user_profile";

export async function saveProfile(profile) {

  try {

    await AsyncStorage.setItem(
      PROFILE_KEY,
      JSON.stringify(profile)
    );

  } catch (error) {

    console.log("Error saving profile:", error);

  }

}

export async function getProfile() {

  try {

    const data = await AsyncStorage.getItem(PROFILE_KEY);

    return data ? JSON.parse(data) : null;

  } catch (error) {

    console.log("Error loading profile:", error);

    return null;

  }

}

export async function deleteProfile() {

  try {

    await AsyncStorage.removeItem(PROFILE_KEY);

  } catch (error) {

    console.log("Error deleting profile:", error);

  }

}