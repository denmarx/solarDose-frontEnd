import { View, Text, Image, StyleSheet } from "react-native";

export const Header = () => (
  <View style={styles.container}>
    <Text style={styles.title}>Solar Dose</Text>
    <Image source={require("@/assets/sun-rays.png")} style={styles.icon} />
  </View>
);

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  icon: {
    width: 100,
    height: 100,
    marginTop: 10,
  },
});