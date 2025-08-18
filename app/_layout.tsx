import 'react-native-reanimated'; // MUST be first
import { Stack } from 'expo-router';



export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="create-qr" options={{ headerShown: true, headerTitle: "Create QR" }}   />
      <Stack.Screen name="favorites" options={{ headerShown: true, headerTitle: "Favorites" }}  />
      <Stack.Screen name="history"  options={{ headerShown: true, headerTitle: "History" }}/>
      {/* <Drawer /> */}
    </Stack>
  );
}


