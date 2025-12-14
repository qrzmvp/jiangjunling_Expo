import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View, StyleSheet } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#2C2E36',
          borderTopWidth: 1,
          borderTopColor: '#40434D',
          paddingVertical: 8,
          paddingBottom: 12,
          height: 80,
        },
        tabBarActiveTintColor: '#FFFFFF',
        tabBarInactiveTintColor: '#8A919E',
        tabBarLabelStyle: {
          fontSize: 11,
          marginTop: 4,
          fontWeight: '600',
        },
      }}
    >
      {/* 首页 */}
      <Tabs.Screen
        name="index"
        options={{
          title: '首页',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'home' : 'home-outline'}
              size={26}
              color={color}
            />
          ),
        }}
      />

      {/* 交易页 - 突出的圆形按钮 */}
      <Tabs.Screen
        name="trade"
        options={{
          title: '交易',
          tabBarIcon: ({ focused }) => (
            <View style={styles.tradeButton}>
              <Ionicons
                name="swap-horizontal"
                size={28}
                color="#000000"
              />
            </View>
          ),
        }}
      />

      {/* 我的页面 */}
      <Tabs.Screen
        name="my"
        options={{
          title: '我的',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'person' : 'person-outline'}
              size={26}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tradeButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 6,
  },
});
