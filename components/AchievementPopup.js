import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
} from "react-native";

import { COLORS } from "../constants/theme";

export default function AchievementPopup({

  visible,

  title,

  reward,

}) {

  return (

    <Modal

      transparent

      animationType="fade"

      visible={visible}

    >

      <View style={styles.overlay}>

        <View style={styles.card}>

          <Text style={styles.icon}>
            🏆
          </Text>

          <Text style={styles.title}>
            Achievement Unlocked!
          </Text>

          <Text style={styles.name}>
            {title}
          </Text>

          <Text style={styles.reward}>
            +{reward} Coins
          </Text>

        </View>

      </View>

    </Modal>

  );

}

const styles = StyleSheet.create({

  overlay:{

    flex:1,

    justifyContent:"center",

    alignItems:"center",

    backgroundColor:"rgba(0,0,0,0.5)",

  },

  card:{

    width:300,

    backgroundColor:"white",

    borderRadius:24,

    padding:30,

    alignItems:"center",

    elevation:8,

  },

  icon:{

    fontSize:70,

  },

  title:{

    fontSize:24,

    fontWeight:"bold",

    marginTop:15,

  },

  name:{

    fontSize:20,

    color:COLORS.primary,

    marginTop:15,

    fontWeight:"bold",

    textAlign:"center",

  },

  reward:{

    fontSize:18,

    marginTop:20,

    color:"#3CB371",

    fontWeight:"bold",

  },

});