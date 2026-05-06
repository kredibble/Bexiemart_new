import "@/global.css";
import RootNavigator from "@/navigation/RootNavigator";

/**
 * Catch-all route: expo-router resolves any URL that isn't an exact file match
 * to this file, so React Navigation handles the actual screen routing.
 */
export default function CatchAll() {
  return <RootNavigator />;
}
