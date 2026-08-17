import React from "react";
import {
  useFonts,
  Nunito_400Regular,
  Nunito_600SemiBold,
  Nunito_700Bold,
  Nunito_800ExtraBold,
} from "@expo-google-fonts/nunito";

import { AppProvider } from "./context/AppContext";
import AppNavigator from "./navigation/AppNavigator";
import LoadingScreen from "./components/LoadingScreen";

export default function App() {

  const [fontsLoaded] = useFonts({
    Nunito_400Regular,
    Nunito_600SemiBold,
    Nunito_700Bold,
    Nunito_800ExtraBold,
  });

  if (!fontsLoaded) {

    return <LoadingScreen />;

  }

  return (
    <AppProvider>
      <AppNavigator />
    </AppProvider>
  );
}
