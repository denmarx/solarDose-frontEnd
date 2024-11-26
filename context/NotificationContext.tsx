import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  ReactNode,
} from "react";
import * as Notifications from "expo-notifications";
import * as Location from "expo-location";
import { Subscription } from "expo-modules-core";
import { registerForPushNotificationsAsync } from "@/utils/registerForPushNotificationsAsync";
import { sendPushTokenToBackend } from "@/utils/backendService";

interface NotificationContextType {
  expoPushToken: string | null;
  notification: Notifications.Notification | null;
  error: Error | null;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotification must be used within a NotificationProvider"
    );
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
}) => {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] =
    useState<Notifications.Notification | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const notificationListener = useRef<Subscription>();
  const responseListener = useRef<Subscription>();

  useEffect(() => {

    const initializeNotifications = async () => {
      try {
        // Request and set push notification token
        const token = await registerForPushNotificationsAsync();
        setExpoPushToken(token);

        // Request location permission to get current location
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === "granted") {
          const currentLocation = await Location.getCurrentPositionAsync({});
          setLocation(currentLocation);

          // Send the token and location to backend
         await sendPushTokenToBackend(token, currentLocation);
         
          console.log(currentLocation);
          console.log("Sending location:", currentLocation.coords.latitude, currentLocation.coords.longitude);
        } else {
          throw new Error("Location permission not granted");
        }
      } catch (err) {
        setError(err as Error);
      }
    };

    initializeNotifications();

    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        console.log("🔔 Notification Received: ", notification);
        setNotification(notification);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log(
          "🔔 Notification Response: ",
          JSON.stringify(response, null, 2),
          JSON.stringify(response.notification.request.content.data, null, 2)
        );
        // Handle the notification response here
      });

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(
          notificationListener.current
        );
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  return (
    <NotificationContext.Provider
    value={{ expoPushToken, notification, error }}
    >
      {children}
    </NotificationContext.Provider>
  );
};