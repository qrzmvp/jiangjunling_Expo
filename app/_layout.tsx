import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '../contexts/AuthContext';
import Head from 'expo-router/head';

export default function RootLayout() {
  return (
    <AuthProvider>
      <Head>
        <title>将军令</title>
        <meta name="description" content="将军令 - 专业的交易信号平台" />
      </Head>
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
