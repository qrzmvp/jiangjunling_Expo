import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  SafeAreaView,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import Svg, { Path } from 'react-native-svg';
import { useAuth } from '../contexts/AuthContext';

const COLORS = {
  primary: "#2ebd85",
  danger: "#f6465d",
  background: "#000000",
  surface: "#131313",
  surfaceLight: "#1c1c1e", // Lighter gray for cards
  textMain: "#ffffff",
  textMuted: "#9ca3af",
  border: "#27272a",
  yellow: "#eab308", // yellow-500
  yellowText: "#facc15", // yellow-400
};

export default function LoginScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const { signInWithOtp, verifyOtp, signInWithPassword } = useAuth();
  // Force dark mode as requested
  const isDark = true; 
  
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [isPasswordLogin, setIsPasswordLogin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const handleSendCode = async () => {
    if (!email) {
      Alert.alert('错误', '请输入邮箱');
      return;
    }
    setLoading(true);
    const { error } = await signInWithOtp(email);
    setLoading(false);
    if (error) {
      Alert.alert('错误', error.message);
    } else {
      Alert.alert('成功', '验证码已发送');
      setCountdown(60);
    }
  };

  const handleLogin = async () => {
    if (!email) {
      Alert.alert('错误', '请输入邮箱');
      return;
    }
    setLoading(true);
    let result;
    if (isPasswordLogin) {
      if (!password) {
        Alert.alert('错误', '请输入密码');
        setLoading(false);
        return;
      }
      result = await signInWithPassword(email, password);
    } else {
      if (!code) {
        Alert.alert('错误', '请输入验证码');
        setLoading(false);
        return;
      }
      result = await verifyOtp(email, code);
    }
    setLoading(false);

    if (result.error) {
      Alert.alert('错误', result.error.message);
    } else {
      // Success, navigate to home
      router.replace('/(tabs)');
    }
  };

  const theme = {
    background: COLORS.background,
    text: COLORS.textMain,
    textSecondary: COLORS.textMuted,
    inputBg: COLORS.surface,
    inputBorder: COLORS.border,
    placeholder: COLORS.textMuted,
    mainButtonBg: COLORS.textMain,
    mainButtonText: COLORS.background,
    socialBg: COLORS.surface,
    socialBorder: COLORS.border,
    socialHover: COLORS.surfaceLight,
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={[styles.backButton, isDark && styles.backButtonDark]}
          >
            <MaterialIcons name="arrow-back-ios" size={20} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text }]}>登录/注册</Text>
          <View style={{ width: 40 }} /> 
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.titleContainer}>
            <Text style={[styles.title, { color: theme.text }]}>欢迎回来</Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              请输入您的邮箱以登录或创建新账户。
            </Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.text }]}>邮箱</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: theme.inputBg,
                      borderColor: theme.inputBorder,
                      color: theme.text,
                    },
                  ]}
                  placeholder="name@example.com"
                  placeholderTextColor={theme.placeholder}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                {email.length > 0 && (
                  <TouchableOpacity
                    onPress={() => setEmail('')}
                    style={styles.clearButton}
                  >
                    <MaterialIcons name="cancel" size={20} color={COLORS.textMuted} />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={[styles.label, { color: theme.text }]}>
                  {isPasswordLogin ? '密码' : '验证码'}
                </Text>
                <TouchableOpacity 
                  onPress={() => setIsPasswordLogin(!isPasswordLogin)}
                >
                  <Text style={{ fontSize: 14, color: theme.text, fontWeight: '500' }}>
                    {isPasswordLogin ? '切换验证码登录' : '切换密码登录'}
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={styles.inputWrapper}>
                {isPasswordLogin ? (
                  <TextInput
                    style={[
                      styles.input,
                      {
                        backgroundColor: theme.inputBg,
                        borderColor: theme.inputBorder,
                        color: theme.text,
                      },
                    ]}
                    placeholder="请输入密码"
                    placeholderTextColor={theme.placeholder}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                  />
                ) : (
                  <TextInput
                    style={[
                      styles.input,
                      {
                        backgroundColor: theme.inputBg,
                        borderColor: theme.inputBorder,
                        color: theme.text,
                        paddingRight: 100, // Space for the button
                      },
                    ]}
                    placeholder="输入6位验证码"
                    placeholderTextColor={theme.placeholder}
                    value={code}
                    onChangeText={setCode}
                    maxLength={6}
                    keyboardType="number-pad"
                  />
                )}
                {!isPasswordLogin && (
                  <TouchableOpacity 
                    style={[styles.getCodeButton, countdown > 0 && { opacity: 0.5 }]}
                    onPress={handleSendCode}
                    disabled={countdown > 0 || loading}
                  >
                    <Text style={styles.getCodeText}>
                      {countdown > 0 ? `${countdown}s` : '获取验证码'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.text }]}>邀请码 (选填)</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: theme.inputBg,
                      borderColor: theme.inputBorder,
                      color: theme.text,
                    },
                  ]}
                  placeholder="请输入邀请码"
                  placeholderTextColor={theme.placeholder}
                  value={inviteCode}
                  onChangeText={setInviteCode}
                  autoCapitalize="none"
                />
              </View>
            </View>
          </View>

          <View style={styles.actionContainer}>
            <TouchableOpacity
              style={[styles.mainButton, { backgroundColor: theme.mainButtonBg }]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={theme.mainButtonText} />
              ) : (
                <Text style={[styles.mainButtonText, { color: theme.mainButtonText }]}>
                  登录/注册
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* <View style={styles.dividerContainer}>
            <View style={[styles.divider, { backgroundColor: theme.inputBorder }]} />
            <Text style={styles.dividerText}>其他方式登录</Text>
            <View style={[styles.divider, { backgroundColor: theme.inputBorder }]} />
          </View>

          <View style={styles.socialContainer}>
            <TouchableOpacity
              style={[
                styles.socialButton,
                {
                  backgroundColor: theme.socialBg,
                  borderColor: theme.socialBorder,
                },
              ]}
            >
              <Svg width={20} height={20} viewBox="0 0 24 24" fill={theme.text}>
                <Path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.78.81.04 2.39-1.04 4.02-.2 1.07.55 1.78 1.48 2.2 1.83-3.66 1.79-2.73 7.02.66 8.35-.49 1.1-1.07 1.84-1.96 2.21zM13.24 2.1c.45 2.51-2.4 4.67-4.47 4.54-.31-2.45 2.25-4.87 4.47-4.54z" />
              </Svg>
              <Text style={[styles.socialButtonText, { color: theme.text }]}>Apple</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.socialButton,
                {
                  backgroundColor: theme.socialBg,
                  borderColor: theme.socialBorder,
                },
              ]}
            >
              <Svg width={20} height={20} viewBox="0 0 24 24" fill={theme.text}>
                <Path d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 16.25 5 12c0-4.1 3.2-7.27 7.2-7.27 3.09 0 4.9 1.97 4.9 1.97L19 4.72S16.56 2 12.1 2C6.42 2 2.03 6.8 2.03 12c0 5.05 4.13 10 10.22 10 5.35 0 9.25-3.67 9.25-9.09 0-1.15-.15-1.81-.15-1.81z" />
              </Svg>
              <Text style={[styles.socialButtonText, { color: theme.text }]}>Google</Text>
            </TouchableOpacity>
          </View> */}
        </ScrollView>

        {/* <View style={styles.footer}>
          <Text style={styles.footerText}>
            继续即代表您同意
            <Text style={styles.linkText}>《服务协议》</Text>
            和
            <Text style={styles.linkText}>《隐私政策》</Text>
          </Text>
        </View> */}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonDark: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 20,
  },
  titleContainer: {
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
  },
  formContainer: {
    gap: 24,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  inputWrapper: {
    position: 'relative',
    justifyContent: 'center',
  },
  input: {
    height: 56,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 15,
    fontSize: 16,
  },
  clearButton: {
    position: 'absolute',
    right: 12,
    padding: 4,
  },
  getCodeButton: {
    position: 'absolute',
    right: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  getCodeText: {
    color: COLORS.textMain,
    fontSize: 14,
    fontWeight: '500',
  },
  switchLoginButton: {
    alignSelf: 'flex-start',
    marginTop: 12,
  },
  switchLoginText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textMuted,
  },
  actionContainer: {
    marginTop: 32,
  },
  mainButton: {
    height: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  mainButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 32,
  },
  divider: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  socialContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
  },
  socialButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  footer: {
    padding: 16,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  linkText: {
    color: COLORS.primary,
  },
});
