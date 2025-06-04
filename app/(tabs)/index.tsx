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
// import '@/utils/i18n'; // Import i18n for translations
import { getLocales  } from 'expo-localization';
import { I18n } from 'i18n-js';
import en from '@/locales/en.json';
import de from '@/locales/de.json';
import PagerView from "react-native-pager-view";
import { SunAltitudeChart } from "@/components/SunAltitudeChart";

const i18n = new I18n({en, de});

i18n.locale = getLocales()[0].languageCode ?? 'en';

i18n.enableFallback = true; // Enable fallback to default language if translation is not available

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
  const [sunData, setSunData] = useState<SunData | null>(null);

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

  const updateLocationIfChanged = (newLoc: { latitude: number; longitude: number }) => {
    setLocation((prev) => {
      if (
        !prev ||
        prev.latitude !== newLoc.latitude ||
        prev.longitude !== newLoc.longitude
      ) {
        return newLoc;
      }
      return prev;
    });
  };
    
  // 1. Fetch location when the app is in the foreground
  useEffect(() => {
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === "active" && expoPushToken) {
        (async () => {
          try {
            const loc = await getLocationAsync();
            updateLocationIfChanged({
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
        updateLocationIfChanged({
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
    
  // 2. Sync , when expoPushToken and location are available or when location changes
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

  useEffect(() => {
    if (!isSynced || !expoPushToken) return;
    (async () => {
      try {
        // Hier rufst du deinen Endpunkt auf
        const response = await fetch('https://solardose-backend.vercel.app/api/get-sun-altitude-data', {
          method: 'GET',
          headers: {
            'token': expoPushToken,
          },
        });
        if (!response.ok) throw new Error('Failed to fetch sun altitude data');
        const data = await response.json();
        setSunData(data);
        console.log('Sun altitude data loaded successfully', data);
      } catch (e) {
        console.log('Error while loading sun altitude data', e);
      }
    })();
  }, [isSynced, expoPushToken]);

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
        <ThemedText style={styles.loadingText}>{i18n.t('loading')}</ThemedText>
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
                {i18n.t('failureText ')}
              </ThemedText>
              <ThemedText style={styles.nextDateText}>
                {i18n.t('nextDateText', { date: nextPossibleDate})}
              </ThemedText>
              </View>
          )}
          {isVitaminDSynthesisPossible && (
            <ThemedText style={styles.successText}>
              {i18n.t('successText')}

            </ThemedText>
          )}
           {location && 
            (
              <PagerView style={{ flex: 1, height: 180 }} initialPage={0}>

              <View key="1">
                {sunData ? (
                  <SunAltitudeChart
                    sunAltitudes={sunData.sunAltitudes}
                    sunrise={sunData.sunrise}
                    sunset={sunData.sunset}
                  />
                ) : (
                  <ActivityIndicator size="large" />
                )}
              </View>
              <View key="2">
                <PositionInfo
                  latitude={location.latitude}
                  longitude={location.longitude}
                  altitude={sunAltitude}
                />
              </View>
            </PagerView>
          )
          }
        </View>
{/*         
{sunData ? (
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
             {i18n.t('modalText')}
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
              {i18n.t('infoText')}
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