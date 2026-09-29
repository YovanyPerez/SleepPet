import React, { useContext } from "react";
import {
  NavigationContainer,
} from "@react-navigation/native";
import {
  createNativeStackNavigator,
} from "@react-navigation/native-stack";

import { AppContext } from "../context/AppContext";
import { getTranslations } from "../services/TranslationService";
import { hasExistingUserData } from "../services/UserDataService";
import LoadingScreen from "../components/LoadingScreen";

import SleepModeScreen from "../screens/SleepModeScreen";
import ResultsScreen from "../screens/ResultsScreen";
import HistoryScreen from "../screens/HistoryScreen";
import MenuScreen from "../screens/MenuScreen";
import WelcomeScreen from "../screens/WelcomeScreen";
import TermsScreen from "../screens/TermsScreen";
import CreateProfileScreen from "../screens/CreateProfileScreen";
import ProfileScreen from "../screens/ProfileScreen";
import EditProfileScreen from "../screens/EditProfileScreen";
import AchievementPopup from "../components/AchievementPopup";
import AboutScreen from "../screens/AboutScreen";
import PPGMeasureScreen from "../screens/PPGMeasureScreen";
import SleepSetupScreen from "../screens/SleepSetupScreen";
import TabsNavigator from "./TabsNavigator";

const Stack = createNativeStackNavigator();

const SCREENS = {
  Welcome: WelcomeScreen,
  Terms: TermsScreen,
  CreateProfile: CreateProfileScreen,
  SleepMode: SleepModeScreen,
  Results: ResultsScreen,
  Menu: MenuScreen,
  History: HistoryScreen,
  Profile: ProfileScreen,
  EditProfile: EditProfileScreen,
  About: AboutScreen,
  PPGMeasure: PPGMeasureScreen,
  SleepSetup: SleepSetupScreen,
};

export default function AppNavigator() {

  const ctx = useContext(AppContext);

  const {
    achievementPopup,
    setAchievementPopup,
    language,
  } = ctx;

  const t = getTranslations(language);

  if (ctx.loading) {

    return <LoadingScreen tagline={t.splashTagline} />;

  }

  // REGLA CRÍTICA: usuario nuevo = sin datos reales persistidos (nunca un solo flag)
  const existingUser = hasExistingUserData(ctx);

  // Términos: existentes de antes de esta pantalla la ven una vez
  const initialRoute = existingUser
    ? (ctx.hasAcceptedTerms ? "Tabs" : "Terms")
    : "Welcome";

  return (

    <>

      <NavigationContainer>

        <Stack.Navigator
          initialRouteName={initialRoute}
          screenOptions={{
            headerShown: false,
          }}
        >

          <Stack.Screen name="Tabs" component={TabsNavigator} />

          {Object.entries(SCREENS).map(([name, component]) => (
            <Stack.Screen
              key={name}
              name={name}
              component={component}
            />
          ))}

        </Stack.Navigator>

      </NavigationContainer>

      <AchievementPopup
        visible={achievementPopup.visible}
        title={achievementPopup.title}
        reward={achievementPopup.reward}
        onHide={() =>
          setAchievementPopup({
            visible: false,
            title: "",
            reward: 0,
          })
        }
      />

    </>

  );

}
//npx expo start