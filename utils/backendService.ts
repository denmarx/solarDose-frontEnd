import { LocationObject } from "expo-location";
export type SimpleLocation = { latitude: number; longitude: number};

export const syncUserDataToBackend = async (token: string, location: SimpleLocation) => {
  try {
    await fetch("https://solardose-backend.vercel.app/api/update-location", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token,
        location: {
          latitude: location.latitude,
          longitude: location.longitude,
        },
      }),
    });

  } catch (error) {
    console.error("Error sending push token and location to backend:", error);
  }
};

export const getNextPossibleDate = async (token: string) => {
  try {
    const response = await fetch("https://solardose-backend.vercel.app/api/get-next-possible-date", {
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

export const getSunAltitude= async (token: string) => {
  try {
    const response = await fetch("https://solardose-backend.vercel.app/api/get-sun-altitude", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "token": token,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch sun's altitude");
    }

    const data = await response.json();
    return data.sunAltitude;
  } catch (error) {
    console.error("Error fetching sun' altitude:", error);
    throw error;
  }
};

export const getSunAltitudeData = async (token: string) => {
  try {
    const response = await fetch("https://solardose-backend.vercel.app/api/get-sun-altitude-data", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "token": token,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch sun altitude data");
    }

    const data = await response.json();


      // Ensure you handle the sunrise and sunset data
    const { sunrise, sunset, sunAltitudes } = data;

    // Log the sunrise, sunset, and altitude data (optional)
    console.log("Sunrise:", sunrise);
    console.log("Sunset:", sunset);

    return { sunrise, sunset, sunAltitudes };
  } catch (error) {
    console.error("Error fetching sun position:", error);
    throw error;
  }
};