import { useEffect, useState } from "react";
import { ActivityIndicator, Modal, Platform, SafeAreaView, StatusBar, StyleSheet, View, Button } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useNotification } from "@/context/NotificationContext";
import { Header } from "@/components/Header";
import { PositionInfo } from "@/components/PositionInfo";
import { syncLocationAndNotification } from "@/components/LocationNotificationController";
import { getNextPossibleDate, getSunAltitude } from '@/utils/backendService';
import { getLocationAsync } from "@/utils/locationHelper";
import { AppState } from "react-native";

// Define the type for location data 
type LocationData = {
    latitude: number;
    longitude: number;
} | null;

// Define a type for the sun data for the sun altitude chart
interface SunData {
  sunrise: string;
  sunset: string;
  sunAltitudes: { time: string; altitude: number }[]; // Array of objects with time and altitude
}

export default function HomeScreen() {
  const { error, expoPushToken } = useNotification(); // get the expoPushToken
  const [location, setLocation] = useState<LocationData | null>(null);
  const [isSynced, setIsSynced] = useState(false);
  const [nextPossibleDate, setNextPossibleDate] = useState<string | null>(null); 
  const [isVitaminDSynthesisPossible, setIsVitaminDSynthesisPossible] = useState<boolean | null>(null); 
  const [loading, setLoading] = useState(true);
  const [showVitaminDModal, setShowVitaminDModal] = useState(false);
  const [showVitaminDInfo, setShowVitaminDInfo] = useState(false);
  const [sunAltitude, setSunAltitude] = useState<number>(0);

  // fetch nextPossibleDate from backend and sets it
  // determines if Vitamin D synthesis is possible
  // and shows a modal if not
  const fetchNextPossibleDate = async (expoPushToken: string) => {
    const date = await getNextPossibleDate(expoPushToken); // Fetch nextPossibleDate from backend
    const formattedDate = formatDate(date);
    setNextPossibleDate(formattedDate);
    return date;
  };

  const formatDate = (isoDate: string): string => {
    const date = new Date(isoDate); // Convert ISO string to Date object
    return date.toISOString().split("T")[0]; // Extract and return only the date portion (YYYY-MM-DD)
  };

  const checkVitaminDSynthesisPossible = (date: string) => {
    const today = new Date();
    const nextDate = new Date(date);
    return nextDate <= today;
  };

  const handleVitaminDModal = (isPossible: boolean) => {
    if (!isPossible) setShowVitaminDModal(true);
  };
    
  // 1. Fetch location when the app is in the foreground
  useEffect(() => {
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === "active" && expoPushToken) {
        (async () => {
          try {
            const loc = await getLocationAsync();
            setLocation({
              latitude: loc.coords.latitude,
              longitude: loc.coords.longitude,
            });
          } catch (e) {
            console.log("Error getting location", e);
          }
        })();
      }
    };
    
    // Add event listener for app state changes
    const subscription = AppState.addEventListener("change", handleAppStateChange)
    
    // Request location permission and fetch location
    if (!expoPushToken) return; 
    (async () => {
      try {
        const loc = await getLocationAsync();
        console.log("Location fetched:", loc);
        console.log("Expo Push Token:", expoPushToken);
        setLocation({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        });
      } catch (e) {
        console.log("Error getting location", e);
      }
    })();
    
    return () => {
      subscription.remove();
    };
  }, [expoPushToken]);
    
  // 2. Sync , when expoPushToken and location are available
  useEffect(() => {
    if (!expoPushToken || !location) return;
    (async () => {
      try {
        await syncLocationAndNotification(expoPushToken, location); 
        setIsSynced(true);
      } catch (e) {
        console.log("Error during sync", e);
      }
    })();
  }, [expoPushToken, location]);

  // 3. Fetch nextPossibleDate and check if Vitamin D synthesis is possible
  // and show a modal if not
  useEffect(() => {
    if (!isSynced || !expoPushToken) return; 
    (async () => {
      try {
        const date = await fetchNextPossibleDate(expoPushToken);
        const formattedDate = formatDate(date);
        setNextPossibleDate(formattedDate);
        const isPossible = checkVitaminDSynthesisPossible(formattedDate);
        setIsVitaminDSynthesisPossible(isPossible);
        handleVitaminDModal(isPossible);
      } catch (e) {
        console.log("Error while loading next possible date", e);
      }
    })();
  }, [isSynced, expoPushToken]);
  
  // get the sunaltitude data from the backend, set state and stop loading
  useEffect(() => {
    if (!isSynced || !expoPushToken) return;
    (async () => {
      try {
        const sunAltitude = await getSunAltitude(expoPushToken);
        setSunAltitude(sunAltitude)
        setLoading(false);
      } catch (e) {
        console.log("Error while loading sun altitude", e);
      }
    })();
  }, [isSynced, expoPushToken]);

  if (error) {
    return <ThemedText>Error: {error.message}</ThemedText>;
  }

  if (loading) {
    return (
      <ThemedView style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#007ACC" />
        <ThemedText style={styles.loadingText}>Loading data, please wait...</ThemedText>
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
              Did you know that Vitamin D is essential for your health? Your skin can produce it only when the sun is high enough in the sky — usually around midday.
              {"\n\n"}
              Depending on your location, this window when Vitamin D production is possible can be very short, so it is important to time it right.
              {"\n\n"}
              Our app will notify you as soon as this window opens, even if you are not actively using it at that moment.
            </ThemedText>
          )}
           {location && 
            (
              <PositionInfo
              latitude={location.latitude}
              longitude={location.longitude}
              altitude={sunAltitude}
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
    fontSize: 18,
    color: "#555",
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