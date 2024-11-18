import { Platform, SafeAreaView, StatusBar } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useNotification } from "@/context/NotificationContext";
import { Header } from "@/components/Header";
import { StatusDisplay } from "@/components/StatusDisplay";
import { PositionInfo } from "@/components/PositionInfo";

export default function HomeScreen() {
  const { error } = useNotification();
  const isVitaminDSynthesisPossible = true;

  if (error) {
    return <ThemedText>Error: {error.message}</ThemedText>;
  }

  return (
    <ThemedView
      style={{
        flex: 1,
        padding: 10,
        paddingTop: Platform.OS == "android" ? StatusBar.currentHeight : 10,
      }}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <Header />
        <StatusDisplay status={isVitaminDSynthesisPossible} />
        <PositionInfo    latitude={49.2827}
      longitude={-123.1207}
      altitude={35.6}
      azimuth={120.5} />
      </SafeAreaView>
    </ThemedView>
  );
}