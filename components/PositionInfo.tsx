import { View, Text, StyleSheet } from "react-native";
import { getLocales  } from 'expo-localization';
import { I18n } from 'i18n-js';
import en from '@/locales/en.json';
import de from '@/locales/de.json';

const i18n = new I18n({en, de});

i18n.locale = getLocales()[0].languageCode ?? 'en';

i18n.enableFallback = true; // Enable fallback to default language if translation is not available

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
      <Text style={styles.header}>{i18n.t("positionHeadline")}</Text>
      <View style={styles.infoContainer}>
        <View style={styles.row}>
          <Text style={styles.label}>{i18n.t("latitude")}</Text>
          <Text style={styles.value}>{latitude.toFixed(4)}°</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>{i18n.t("longitude")}</Text>
          <Text style={styles.value}>{longitude.toFixed(4)}°</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>{i18n.t("altitude")}</Text>
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
