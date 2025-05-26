import * as Location from "expo-location";
import { syncUserDataToBackend, SimpleLocation } from "@/utils/backendService";

export const syncLocationAndNotification = async (
    expoPushToken: string,
    location: SimpleLocation
): Promise<void> => {
    if (!expoPushToken) throw new Error("Push token not available");
    if (!location) throw new Error("Location not available");
    await syncUserDataToBackend(expoPushToken, location);
};