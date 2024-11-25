import { View, Text, StyleSheet } from "react-native";

type PositionInfoProps = {
  latitude: number;
  longitude: number;
  altitude: number;
};

export const PositionInfo: React.FC<PositionInfoProps> = ({
  latitude,
  longitude,
  altitude,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Position Information</Text>
      <View style={styles.infoContainer}>
        <View style={styles.row}>
          <Text style={styles.label}>Latitude:</Text>
          <Text style={styles.value}>{latitude.toFixed(4)}°</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Longitude:</Text>
          <Text style={styles.value}>{longitude.toFixed(4)}°</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Sun's Altitude:</Text>
          <Text style={styles.value}>{altitude.toFixed(2)}°</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    padding: 16,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3, // Shadow for Android
  },
  header: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#333",
  },
  infoContainer: {
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    paddingTop: 8,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 4,
  },
  label: {
    fontSize: 14,
    color: "#555",
  },
  value: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#222",
  },
});
