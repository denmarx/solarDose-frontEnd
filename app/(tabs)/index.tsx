import { useEffect, useState } from "react";
import { ActivityIndicator, Platform, SafeAreaView, StatusBar, StyleSheet, View } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useNotification } from "@/context/NotificationContext";
import { Header } from "@/components/Header";
import { StatusDisplay } from "@/components/StatusDisplay";
import { PositionInfo } from "@/components/PositionInfo";

// Define the type for location data
type LocationData = {
    latitude: number;
    longitude: number;
    altitude: number;
    isVitaminDSynthesisPossible: boolean;
} | null;


export default function HomeScreen() {
  const { error, expoPushToken } = useNotification();
  const [locationData, setLocationData] = useState<LocationData>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (!expoPushToken) {
      console.log("Push token is not yet available.");
      return;
    }

    const fetchSunPosition= async() => {
      try {
        const response = await fetch("https://solardose-backend.vercel.app/api/get-sun-position", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token: expoPushToken }),
        });
        
            if (!response.ok) {
                throw new Error("Failed to fetch sun position");
            }

            const data = await response.json();
            console.log(data);

            setLocationData({
                latitude: data.latitude,
                longitude: data.longitude,
                altitude: data.sunAltitude,
                isVitaminDSynthesisPossible: data.isVitaminDSynthesisPossible,
            });
        } catch (error) {
            console.error("Error fetching sun position:", error);
        } finally {
            setLoading(false);
        }
    }

    fetchSunPosition();
}, [expoPushToken]);

  if (error) {
    return <ThemedText>Error: {error.message}</ThemedText>;
  }

  if (loading || !locationData) {
    return (
      <ThemedView style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#007ACC" />
        <ThemedText style={styles.loadingText}>Fetching data, please wait...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.mainContainer}>
      <SafeAreaView style={styles.container}>
        <Header />
        <View style={styles.content}>
        <StatusDisplay status={locationData.isVitaminDSynthesisPossible} />
          <PositionInfo
            latitude={locationData.latitude}
            longitude={locationData.longitude}
            altitude={locationData.altitude}
          />
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#f0f4f8",
  },
  container: {
    flex: 1,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 20,
    backgroundColor: "#87CEEB", // Sky-blue background
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 10,
    justifyContent: "space-between",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#87CEEB", // Sky-blue background
  },
    loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#555",
  },
    errorText: {
    flex: 1,
    justifyContent: "center",
    alignSelf: "center",
    fontSize: 16,
    color: "#FF3B30",
  },
});