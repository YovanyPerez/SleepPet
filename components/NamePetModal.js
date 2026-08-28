import React, { useEffect, useState } from "react";
import {
  Modal,
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

import { NIGHT } from "../constants/theme";
import AppText from "./AppText";
import AppIcon from "./AppIcon";

export default function NamePetModal({
  visible,
  title,
  message,
  placeholder,
  cancelLabel,
  confirmLabel,
  onConfirm,
  onCancel,
}) {

  const [name, setName] = useState("");

  useEffect(() => {
    if (visible) setName("");
  }, [visible]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>

        <View style={styles.card}>

          <AppIcon name="paw" size={30} color={NIGHT.yellow} style={styles.icon} />

          <AppText style={styles.title}>
            {title}
          </AppText>

          {
            message ? (
              <AppText style={styles.message}>
                {message}
              </AppText>
            ) : null
          }

          <TextInput
            value={name}
            onChangeText={setName}
            placeholder={placeholder}
            placeholderTextColor="#B8B2E8"
            cursorColor={NIGHT.end}
            autoFocus
            style={styles.input}
          />

          <View style={styles.buttons}>

            <TouchableOpacity
              style={[styles.button, styles.cancel]}
              onPress={onCancel}
            >
              <AppText style={styles.cancelText}>
                {cancelLabel}
              </AppText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.confirm]}
              onPress={() => onConfirm(name.trim())}
            >
              <AppText style={styles.confirmText}>
                {confirmLabel}
              </AppText>
            </TouchableOpacity>

          </View>

        </View>

      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({

  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    padding: 28,
  },

  card: {
    backgroundColor: "#1D1B5B",
    borderWidth: 1,
    borderColor: "rgba(150,130,255,0.3)",
    borderRadius: 26,
    padding: 22,
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },

  icon: {
    marginBottom: 10,
  },

  title: {
    color: "#FFFFFF",
    fontSize: 20,
    fontFamily: "Nunito_800ExtraBold",
    textAlign: "center",
  },

  message: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 14,
    fontFamily: "Nunito_400Regular",
    textAlign: "center",
    marginTop: 4,
    marginBottom: 16,
  },

  input: {
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderColor: "rgba(150,130,255,0.35)",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 17,
    color: "#FFFFFF",
    marginBottom: 18,
  },

  buttons: {
    flexDirection: "row",
    width: "100%",
  },

  button: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 16,
    alignItems: "center",
    marginHorizontal: 5,
  },

  cancel: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },

  confirm: {
    backgroundColor: NIGHT.end,
  },

  cancelText: {
    color: "#D5CFF5",
    fontSize: 15,
    fontFamily: "Nunito_700Bold",
  },

  confirmText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontFamily: "Nunito_800ExtraBold",
  },

});
