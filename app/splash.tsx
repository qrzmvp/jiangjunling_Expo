import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Text, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';

// 将军令 Logo 图标 - 盾牌形状
const ShieldLogo = () => {
  return (
    <View style={styles.shieldContainer}>
      {/* 上半部分 - 5条竖线，中间高两边矮 */}
      <View style={styles.barsContainer}>
        {/* 最左边 */}
        <View style={[styles.verticalBar, { height: 40 }]} />
        {/* 左二 */}
        <View style={[styles.verticalBar, { height: 56 }]} />
        {/* 中间最高 */}
        <View style={[styles.verticalBar, { height: 72 }]} />
        {/* 右二 */}
        <View style={[styles.verticalBar, { height: 56 }]} />
        {/* 最右边 */}
        <View style={[styles.verticalBar, { height: 40 }]} />
      </View>
      
      {/* 下半部分 - 向下的箭头 */}
      <View style={styles.arrowDown}>
        <View style={styles.arrowLeftPart} />
        <View style={styles.arrowRightPart} />
      </View>
    </View>
  );
};

const JiangJunLingLogo = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(10)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View 
      style={[
        styles.logoWrapper,
        {
          opacity: fadeAnim,
          transform: [{ translateY }],
        }
      ]}
    >
      <ShieldLogo />
      <View style={styles.textContainer}>
        <Text style={styles.chineseText}>将军令</Text>
        <View style={styles.divider} />
        <Text style={styles.englishText}>GENERAL'S ORDER</Text>
      </View>
    </Animated.View>
  );
};

export default function SplashScreen() {
  const router = useRouter();
  const { session, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    const timer = setTimeout(() => {
      if (session) {
        router.replace('/(tabs)');
      } else {
        router.replace('/login');
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [loading, session]);

  return (
    <View style={styles.container}>
      <View style={styles.mainContent}>
        <JiangJunLingLogo />
      </View>
      
      <View style={styles.footer}>
        <Text style={styles.versionText}>V2.1.0 • STRATEGY CORE</Text>
        <View style={styles.bottomBar} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgb(19, 21, 29)',
  },
  mainContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  // 盾牌 Logo
  shieldContainer: {
    alignItems: 'center',
    marginRight: 24,
  },
  barsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,
  },
  verticalBar: {
    width: 8,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },
  arrowDown: {
    flexDirection: 'row',
    marginTop: -1,
  },
  arrowLeftPart: {
    width: 0,
    height: 0,
    borderTopWidth: 28,
    borderTopColor: '#FFFFFF',
    borderLeftWidth: 28,
    borderLeftColor: 'transparent',
  },
  arrowRightPart: {
    width: 0,
    height: 0,
    borderTopWidth: 28,
    borderTopColor: '#FFFFFF',
    borderRightWidth: 28,
    borderRightColor: 'transparent',
  },

  // 文字
  textContainer: {
    justifyContent: 'center',
  },
  chineseText: {
    color: '#FFFFFF',
    fontSize: 36,
    fontWeight: '800',
    letterSpacing: 8,
  },
  divider: {
    width: 48,
    height: 1.5,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 1,
    marginVertical: 10,
  },
  englishText: {
    color: 'rgba(156, 163, 175, 1)',
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 2,
  },

  // 底部
  footer: {
    paddingBottom: 40,
    alignItems: 'center',
    gap: 24,
  },
  versionText: {
    color: 'rgba(107, 114, 128, 0.5)',
    fontSize: 10,
    letterSpacing: 2,
  },
  bottomBar: {
    width: 128,
    height: 4,
    backgroundColor: 'rgba(31, 41, 55, 1)',
    borderRadius: 2,
  },
});
