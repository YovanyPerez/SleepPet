import React from "react";
import {
  View,
  Text,
  StyleSheet,
} from "react-native";

import { COLORS } from "../constants/theme";

export default function StatCard({

  icon,

  label,

  value,

}) {

  return (

    <View style={styles.card}>

      <Text style={styles.icon}>
        {icon}
      </Text>

      <Text style={styles.label}>
        {label}
      </Text>

      <Text
        style={styles.value}
        numberOfLines={1}
        adjustsFontSizeToFit
      >
        {value}
      </Text>

    </View>

  );

}

const styles = StyleSheet.create({

  card: {
    width: "48%",
    backgroundColor: "white",
    borderRadius: 20,
    paddingVertical: 22,
    marginBottom: 15,
    alignItems: "center",
    elevation: 4,
  },

  icon: {
    fontSize: 34,
    marginBottom: 10,
  },

  label: {
    fontSize: 18,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },

  value: {
    fontSize: 22,
    fontWeight: "bold",
    color: COLORS.text,
  },

});