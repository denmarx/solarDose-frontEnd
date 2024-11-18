import { View, Text, StyleSheet, Image } from "react-native";

type StatusDisplayProps = {
  status: boolean; // true for synthesis possible, false otherwise
};

export const StatusDisplay: React.FC<StatusDisplayProps> = ({ status }) => {
  return (
    <View style={styles.container}>

      <Text style={[styles.text, status ? styles.textSuccess : styles.textError]}>
        {status
          ? "✔ Vitamin D Synthesis Possible!"
          : "✖ Vitamin D Synthesis Not Possible"}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginVertical: 20,
  },
  text: {
    fontSize: 18,
    fontWeight: "bold",
  },
  textSuccess: {
    color: "green",
  },
  textError: {
    color: "red",
  },
});