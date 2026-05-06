import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ForgotPasswordScreen from "@/screens/auth/ForgotPasswordScreen";
import LaunchScreen from "@/screens/auth/LaunchScreen";
import LoginScreen from "@/screens/auth/LoginScreen";
import NewPasswordScreen from "@/screens/auth/NewPasswordScreen";
import PasswordVerifyScreen from "@/screens/auth/PasswordVerifyScreen";
import RegisterScreen from "@/screens/auth/RegisterScreen";

export type AuthStackParamList = {
  Launch: undefined;
  Login: undefined;
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
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Launch" component={LaunchScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="PasswordVerify" component={PasswordVerifyScreen} />
      <Stack.Screen name="NewPassword" component={NewPasswordScreen} />
    </Stack.Navigator>
  );
}
