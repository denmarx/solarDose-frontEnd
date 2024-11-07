import { LocationObject } from "expo-location";

export const sendPushTokenToBackend = async (token: string, location: LocationObject) => {
  try {
    const response = await fetch("https://solardose-backend.onrender.com/api/update-location", {
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

    console.log("Push token and location sent to backend successfully");
  } catch (error) {
    console.error("Error sending push token and location to backend:", error);
  }
};


