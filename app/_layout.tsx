import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '../contexts/AuthContext';
import { Platform } from 'react-native';

export default function RootLayout() {
  // 在 web 平台设置页面标题
  if (Platform.OS === 'web' && typeof document !== 'undefined') {
    document.title = '将军令';
  }

  return (
    <AuthProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#14151A' },
        }}
      >
        <Stack.Screen name="splash" />
        <Stack.Screen name="login" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen 
          name="qrcode" 
          options={{
            presentation: 'transparentModal',
            animation: 'fade',
            headerShown: false,
            contentStyle: { backgroundColor: 'transparent' },
          }} 
        />
      </Stack>
    </AuthProvider>
  );
}
