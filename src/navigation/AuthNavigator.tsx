/**
 * AuthNavigator — Stack navigator for the authentication flow.
 * Launch → Login → SocialRoleSelect → Register → ForgotPassword → PasswordVerify → NewPassword
 */
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// Screen imports from src/screens/auth
import LaunchScreen from "@/screens/auth/LaunchScreen";
import SocialSignInScreen from "@/screens/auth/SocialSignInScreen";
import SocialRoleSelectScreen from "@/screens/auth/SocialRoleSelectScreen";
import RegisterScreen from "@/screens/auth/RegisterScreen";
import ForgotPasswordScreen from "@/screens/auth/ForgotPasswordScreen";
import PasswordVerifyScreen from "@/screens/auth/PasswordVerifyScreen";
import NewPasswordScreen from "@/screens/auth/NewPasswordScreen";

export type AuthStackParamList = {
  Launch: undefined;
  Login: undefined;
  SocialRoleSelect: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  PasswordVerify: { email: string };
  NewPassword: { email: string; token: string };
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

export default function AuthNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Launch"
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
        gestureEnabled: true,
        contentStyle: { backgroundColor: "#FFFFFF" },
      }}
    >
      <Stack.Screen
        name="Launch"
        component={LaunchScreen}
        options={{ animation: "fade" }}
      />
      <Stack.Screen name="Login" component={SocialSignInScreen} />
      <Stack.Screen name="SocialRoleSelect" component={SocialRoleSelectScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="PasswordVerify" component={PasswordVerifyScreen} />
      <Stack.Screen name="NewPassword" component={NewPasswordScreen} />
    </Stack.Navigator>
  );
}
