import * as Location from "expo-location";

/**
 * Holt die aktuelle Position des Nutzers, inkl. Berechtigungsabfrage.
 * @throws Error, wenn keine Berechtigung erteilt wurde oder Standort nicht ermittelt werden kann.
 */
export const getLocationAsync = async (): Promise<Location.LocationObject> => {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== "granted") {
    throw new Error("Location permission not granted");
  }
  return await Location.getCurrentPositionAsync({});
};