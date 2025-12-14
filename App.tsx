import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Text, TouchableOpacity, Platform } from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';

// 导入页面组件
import HomePage from './screens/HomePage';
import TradePage from './screens/TradePage';
import MyPage from './screens/MyPage';

// 定义标签类型
type TabType = 'home' | 'trade' | 'my';

export default function App() {
  const [currentTab, setCurrentTab] = useState<TabType>('trade');

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* 根据当前标签显示不同页面 */}
      {currentTab === 'home' && <HomePage />}
      {currentTab === 'trade' && <TradePage />}
      {currentTab === 'my' && <MyPage />}

      {/* Bottom Navigation Bar */}
      <View style={styles.bottomNav}>
        <TouchableOpacity 
          style={styles.navButton}
          onPress={() => setCurrentTab('home')}
        >
          <Ionicons 
            name={currentTab === 'home' ? 'home' : 'home-outline'} 
            size={26} 
            color={currentTab === 'home' ? '#FFFFFF' : '#8A919E'} 
          />
          <Text style={[styles.navLabel, currentTab === 'home' && styles.navLabelActive]}>首页</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.centerNavButton}
          onPress={() => setCurrentTab('trade')}
        >
          <View style={styles.centerNavIcon}>
            <Ionicons 
              name="swap-horizontal" 
              size={30} 
              color="#000000" 
            />
          </View>
          <Text style={[styles.navLabel, currentTab === 'trade' && styles.navLabelActive]}>交易</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.navButton}
          onPress={() => setCurrentTab('my')}
        >
          <Ionicons 
            name={currentTab === 'my' ? 'person' : 'person-outline'} 
            size={26} 
            color={currentTab === 'my' ? '#FFFFFF' : '#8A919E'} 
          />
          <Text style={[styles.navLabel, currentTab === 'my' && styles.navLabelActive]}>我的</Text>
        </TouchableOpacity>
      </View>

      {/* Home Indicator */}
      <View style={styles.bottomBar}>
        <View style={styles.homeIndicator} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E2026',
    paddingTop: Platform.OS === 'web' ? 0 : 50,
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#2C2E36',
    paddingVertical: 8,
    paddingBottom: 12,
    borderTopWidth: 1,
    borderTopColor: '#40434D',
  },
  navButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  centerNavButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: -30,
  },
  centerNavIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 3,
    borderColor: '#000000',
  },
  navLabel: {
    fontSize: 11,
    color: '#8A919E',
    marginTop: 4,
  },
  navLabelActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  bottomBar: {
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1E2026',
  },
  homeIndicator: {
    width: 128,
    height: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
  },
});
