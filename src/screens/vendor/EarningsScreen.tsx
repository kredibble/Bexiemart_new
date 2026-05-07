// EarningsScreen - Vendor earnings overview, transaction history, and withdrawal
import { View, Text, StyleSheet } from "react-native";

export default function EarningsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Vendor Earnings</Text>
      <Text style={styles.subtitle}>Coming soon</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  title: {
    fontFamily: "Raleway_700Bold",
    fontSize: 24,
    color: "#111322",
  },
  subtitle: {
    fontFamily: "Nunito_400Regular",
    fontSize: 14,
    color: "#5F6C7B",
    marginTop: 8,
  },
});
