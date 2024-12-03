import { LocationObject } from "expo-location";

export const syncUserDataToBackend = async (token: string, location: LocationObject) => {
  try {
    await fetch("https://solardose-backend.vercel.app/api/update-location", {
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

  } catch (error) {
    console.error("Error sending push token and location to backend:", error);
  }
};

export const getSunInfo = async (token: string) => {
  try {
    const response = await fetch("https://solardose-backend.vercel.app/api/get-sun-info", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "token": token,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch sun info");
    }

    const data = await response.json();
    return data.nextPossibleDate;
  } catch (error) {
    console.error("Error fetching sun info:", error);
    throw error;
  }
};

export const getSunPosition = async (token: string) => {
  try {
    const response = await fetch("https://solardose-backend.vercel.app/api/get-sun-position", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "token": token,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch sun position");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching sun position:", error);
    throw error;
  }
};