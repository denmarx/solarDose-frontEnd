import * as Location from "expo-location";
import { syncUserDataToBackend } from "@/utils/backendService";
import { useNotification } from "@/context/NotificationContext";

export const useLocationNotificationController = (): {
    syncLocationAndNotification: () => Promise<void>;
} => {
    const { expoPushToken } = useNotification();
    const syncLocationAndNotification = async () => {
        try {
            // Standort ermitteln
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== "granted") {
                throw new Error("Location permission not granted");
            }
            const currentLocation = await Location.getCurrentPositionAsync({});
        
            if (!expoPushToken) {
                throw new Error("Push token not available");
            }
        
            // Token und Standort ans Backend senden
            await syncUserDataToBackend(expoPushToken, currentLocation);
        
            console.log("Token and location synced successfully:", currentLocation);
        } catch (error) {
            console.error("Error syncing location and notifications:", error);
        }
    };
    
    return { syncLocationAndNotification };
};
