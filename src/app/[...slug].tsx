import "@/global.css";
import { Redirect } from "expo-router";

/**
 * Catch-all route: any unrecognized URL redirects to root
 * so React Navigation handles all internal screen routing.
 */
export default function CatchAll() {
  return <Redirect href="/" />;
}
