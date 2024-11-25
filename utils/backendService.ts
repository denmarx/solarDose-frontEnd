import { LocationObject } from "expo-location";

export const sendPushTokenToBackend = async (token: string, location: LocationObject) => {
  try {
    const response = await fetch("https://solardose-backend.vercel.app/api/update-location", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token,
        location: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        },
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to send push token and location to backend");
    }

    const data = await response.json();

    console.log("Push token, location and sun position sent to backend successfully");

    return data;

  } catch (error) {
    console.error("Error sending push token and location to backend:", error);
    throw error;
  }
};


