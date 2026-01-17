import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';

const COLORS = {
  primary: "#2ebd85",
  background: "#000000",
  textMain: "#F0F0F0",
  textSub: "#888888",
};

interface BlurredContentProps {
  children: React.ReactNode;
  isBlurred: boolean;
  message?: string;
  onPress?: () => void;
}

/**
 * 模糊内容组件 - 用于未登录用户的内容遮罩
 */
export const BlurredContent: React.FC<BlurredContentProps> = ({ 
  children, 
  isBlurred, 
  message = '登录后查看完整内容',
  onPress 
}) => {
  const router = useRouter();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push('/login');
    }
  };

  // 不使用条件性的early return，而是条件性渲染
  return (
    <View style={isBlurred ? styles.container : undefined}>
      {children}
      {isBlurred && (
        <BlurView intensity={80} tint="dark" style={styles.blurOverlay}>
          <TouchableOpacity 
            style={styles.loginPrompt}
            onPress={handlePress}
            activeOpacity={0.8}
          >
            <MaterialIcons name="lock" size={32} color={COLORS.primary} />
            <Text style={styles.promptText}>{message}</Text>
            <View style={styles.loginButton}>
              <Text style={styles.loginButtonText}>立即登录</Text>
              <MaterialIcons name="arrow-forward" size={16} color={COLORS.background} />
            </View>
          </TouchableOpacity>
        </BlurView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  blurOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    overflow: 'hidden',
  },
  loginPrompt: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 24,
  },
  promptText: {
    color: COLORS.textMain,
    fontSize: 13,
    marginTop: 8,
    marginBottom: 12,
    textAlign: 'center',
    opacity: 0.9,
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    gap: 6,
  },
  loginButtonText: {
    color: COLORS.background,
    fontSize: 13,
    fontWeight: '600',
  },
});
