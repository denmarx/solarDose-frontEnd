import { useEffect, useState } from "react";
import { ActivityIndicator, Modal, Platform, SafeAreaView, StatusBar, StyleSheet, View, Button } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useNotification } from "@/context/NotificationContext";
import { Header } from "@/components/Header";
import { StatusDisplay } from "@/components/StatusDisplay";
import { PositionInfo } from "@/components/PositionInfo";
import { useLocationNotificationController } from "@/components/LocationNotificationController";
import { getSunInfo, getSunPosition } from '@/utils/backendService';
import { stopLocationUpdatesAsync } from "expo-location";
import { SunAltitudeChart } from "@/components/SunAltitudeChart";
import { getSunAltitudeData } from "@/utils/backendService"

// Define the type for location data
type LocationData = {
    latitude: number;
    longitude: number;
    altitude: number;
} | null;

// Define a type for the sun data
interface SunData {
  sunrise: string;
  sunset: string;
  sunAltitudes: { time: string; altitude: number }[]; // Array of objects with time and altitude
}


export default function HomeScreen() {
  const { error, expoPushToken } = useNotification();
  const [locationData, setLocationData] = useState<LocationData>(null);
  const [nextPossibleDate, setNextPossibleDate] = useState<string | null>(null); 
  const [isVitaminDSynthesisPossible, setIsVitaminDSynthesisPossible] = useState<boolean | null>(null); 
  const [loading, setLoading] = useState(true);
  const { syncLocationAndNotification } = useLocationNotificationController();
  const [showVitaminDModal, setShowVitaminDModal] = useState(false);
  const [showVitaminDInfo, setShowVitaminDInfo] = useState(false);
  const [sunData, setSunData] = useState<SunData | null>(null);


  const formatDate = (isoDate: string): string => {
    const date = new Date(isoDate); // Convert ISO string to Date object
    return date.toISOString().split("T")[0]; // Extract and return only the date portion (YYYY-MM-DD)
  };

  // fetch nextPossibleDate from backend and sets it
  // determines if Vitamin D synthesis is possible
  // and shows a modal if not
  const fetchSunInfo = async (expoPushToken: string) => {
    try {
      const date = await getSunInfo(expoPushToken); // Fetch nextPossibleDate from backend
      const formattedDate = formatDate(date); 
        setNextPossibleDate(formattedDate);

      // Determine if Vitamin D synthesis is possible
      const today = new Date();
      const nextDate = new Date(date);
      setIsVitaminDSynthesisPossible(nextDate <= today); // If the next date is today or in the past, synthesis is possible
      if (nextDate > today) {
        setShowVitaminDModal(true); // Show modal if Vitamin D synthesis is not possible because of location or season
      }
    } catch (error) {
      console.log("Error fetching sun info", error);
    }
  };

  // Fetch sun position data from backend
  // and sets the location data
  const fetchSunPosition = async (expoPushToken: string) => {
    try {
      const sunPositionData = await getSunPosition(expoPushToken);
      const { latitude, longitude, sunAltitude } = sunPositionData;
      setLocationData({ latitude, longitude, altitude: sunAltitude });
    } catch (error) {
      console.log("Error fetching sun position", error);
    } finally {
      setLoading(false);
    }
  };
    
  useEffect(() => {
    if (!expoPushToken) return; 
      getSunAltitudeData(expoPushToken)
        .then((data) => {
          console.log("Sun Data:", data);
          // Destructure the returned data
          const { sunrise, sunset, sunAltitudes } = data;
          // Set the sun data (including sunrise, sunset, and sun altitudes)
          setSunData({ sunrise, sunset, sunAltitudes });
        })
        .catch(console.error);
    }, [expoPushToken]);
    
    useEffect(() => {
      if (!expoPushToken) return;
      fetchSunInfo(expoPushToken);
    }, [expoPushToken]);
  
    useEffect(() => {
      if (!expoPushToken) return;
      fetchSunPosition(expoPushToken);
    }, [expoPushToken]);

    useEffect(() => {
      if (!expoPushToken) return;
      syncLocationAndNotification();
    }, [expoPushToken]);

  if (error) {
    return <ThemedText>Error: {error.message}</ThemedText>;
  }

  if (loading) {
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
          {isVitaminDSynthesisPossible === false && (
            <View style={styles.notification}>
              <ThemedText style={styles.notificationText}>
                Vitamin D synthesis is not possible at your location. It is likely winter or the sun will not reach sufficient altitude.
              </ThemedText>
              <ThemedText style={styles.nextDateText}>
                The sun will reach the altitude required for Vitamin D synthesis again on {nextPossibleDate}. We will notify you once it happens.
              </ThemedText>
              </View>
          )}
          {isVitaminDSynthesisPossible && (
            <ThemedText style={styles.successText}>
              Vitamin D synthesis is possible today! Enjoy the sunshine responsibly.
            </ThemedText>
          )}
          {locationData && 
            (
              <PositionInfo
              latitude={locationData.latitude}
              longitude={locationData.longitude}
              altitude={locationData.altitude}
            />   
          )
          }
          </View>
{/* {sunData ? (
  <SunAltitudeChart sunAltitudes={sunData.sunAltitudes} sunrise={sunData.sunrise} sunset={sunData.sunset} />
) : (
  <ActivityIndicator size="large" />
)} */}

        {/* Model for Vitamin D Alternatives */}
        <Modal
          visible={showVitaminDModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowVitaminDInfo(false)}
        >
          <View style={styles.modalContainer}>
            <ThemedText style={styles.modalText}>
              Vitamin D synthesis is not possible at your location. Would you like to learn about Vitamin D alternatives?
            </ThemedText>
            <View style={styles.buttonContainer}>
              <Button
                title="Yes"
                onPress={() => {
                  setShowVitaminDInfo(true);
                  setShowVitaminDModal(false);
                }}
              />
              <Button title="No" onPress={() => setShowVitaminDModal(false)} />
            </View>
          </View>
        </Modal>

        {/* Modal for Detailed Info */}
        <Modal
          visible={showVitaminDInfo}
          animationType="slide"
          transparent={false}
          onRequestClose={() => setShowVitaminDInfo(false)}
        >
          <SafeAreaView style={styles.infoContainer}>
            <ThemedText style={styles.infoText}>
              Vitamin D Alternatives:
              {"\n\n"}1. **Supplements**: Consult a healthcare provider to determine the correct dosage.
              {"\n\n"}2. **Blood Levels**: Regularly check your Vitamin D levels through blood tests.
              {"\n\n"}3. **Foods**: Incorporate Vitamin D-rich foods like fatty fish, fortified dairy, and eggs into your diet.
            </ThemedText>
            <Button title="Close" onPress={() => setShowVitaminDInfo(false)} />
          </SafeAreaView>
        </Modal>

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
    notification: {
    backgroundColor: "#FFD700",
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
    notificationText: {
    fontSize: 16,
    color: "#000",
    marginBottom: 5,
  },
  nextDateText: {
    fontSize: 14,
    color: "#555",
  },
  successText: {
    fontSize: 16,
    color: "#006400",
  },
    modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: 20,
  },
  modalText: {
    color: "#fff",
    fontSize: 18,
    marginBottom: 20,
    textAlign: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "80%",
  },
  infoContainer: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  infoText: {
    fontSize: 16,
    color: "#333",
  },
});