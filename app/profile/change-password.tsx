import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, SafeAreaView, StatusBar, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';
import { useProtectedRoute } from '../../hooks/useProtectedRoute';
import { useAuth } from '../../contexts/AuthContext';

const COLORS = {
  backgroundDark: "#000000",
  cardDark: "#161616",
  cardHighlight: "#252525",
  textMainDark: "#F0F0F0",
  textSubDark: "#888888",
  borderDark: "#252525",
  accentOrange: "#F0B90B",
  primary: "#ffffff",
};

export default function ChangePasswordPage() {
  useProtectedRoute(); // 保护路由
  const router = useRouter();
  const { user, updatePassword } = useAuth();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  const email = user?.email || '';

  // 实时校验新密码
  const validateNewPassword = (value: string) => {
    if (!value.trim()) {
      setPasswordError("请输入新密码");
      return false;
    }
    if (value.length < 6) {
      setPasswordError("密码长度至少为6个字符");
      return false;
    }
    setPasswordError("");
    
    // 如果确认密码已经输入，同时检查一致性
    if (confirmPassword && value !== confirmPassword) {
      setConfirmPasswordError("两次输入的密码不一致");
    } else if (confirmPassword) {
      setConfirmPasswordError("");
    }
    
    return true;
  };

  // 实时校验确认密码
  const validateConfirmPassword = (value: string) => {
    if (!value.trim()) {
      setConfirmPasswordError("请再次输入新密码");
      return false;
    }
    if (value !== password) {
      setConfirmPasswordError("两次输入的密码不一致");
      return false;
    }
    setConfirmPasswordError("");
    return true;
  };

  // 处理新密码输入
  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (value) {
      validateNewPassword(value);
    } else {
      setPasswordError("");
    }
  };

  // 处理确认密码输入
  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value);
    if (value) {
      validateConfirmPassword(value);
    } else {
      setConfirmPasswordError("");
    }
  };

  // 提交时的最终校验
  const validatePassword = () => {
    let isValid = true;
    
    if (!password.trim()) {
      setPasswordError("请输入新密码");
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError("密码长度至少为6个字符");
      isValid = false;
    } else {
      setPasswordError("");
    }
    
    if (!confirmPassword.trim()) {
      setConfirmPasswordError("请再次输入新密码");
      isValid = false;
    } else if (password !== confirmPassword) {
      setConfirmPasswordError("两次输入的密码不一致");
      isValid = false;
    } else {
      setConfirmPasswordError("");
    }
    
    return isValid;
  };

  const handleSave = async () => {
    console.log('🔵 ============ handleSave 开始 ============');
    console.log('🔵 当前时间:', new Date().toISOString());
    console.log('🔵 密码值:', password);
    console.log('🔵 确认密码值:', confirmPassword);
    console.log('🔵 密码长度:', password.length);
    console.log('🔵 确认密码长度:', confirmPassword.length);
    
    // 验证密码
    const isValid = validatePassword();
    console.log('🔵 验证结果:', isValid);
    
    if (!isValid) {
      console.log('❌ 验证失败，停止执行');
      return;
    }

    console.log('✅ 验证通过，准备保存');
    console.log('📡 设置 saving = true');
    setSaving(true);
    
    try {
      console.log('📡 准备调用 updatePassword...');
      console.log('📡 调用时间:', new Date().toISOString());
      
      // 增加整体超时保护到 35 秒
      const updatePromise = updatePassword(password);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => {
          console.log('⏰ 35秒超时触发');
          reject(new Error('操作超时（超过30秒），请检查网络连接'));
        }, 35000)
      );
      
      console.log('📡 等待 Promise.race 结果...');
      const result = await Promise.race([updatePromise, timeoutPromise]) as any;
      console.log('📡 ========== Promise.race 完成 ==========');
      console.log('📡 返回时间:', new Date().toISOString());
      console.log('📡 返回结果:', JSON.stringify(result, null, 2));
      console.log('📡 返回结果类型:', typeof result);
      console.log('📡 result.error:', JSON.stringify(result?.error));
      console.log('📡 result.error 是否存在:', !!result?.error);
      console.log('📡 result.error 值:', result?.error);

      // 检查是否有错误
      // updatePassword 返回 { error: null } 表示成功，{ error: {...} } 表示失败
      if (result?.error) {
        console.error('❌ 结果包含错误:', JSON.stringify(result.error));
        console.error('❌ 准备抛出错误');
        throw result.error;
      }

      console.log('✅ 没有错误，密码更新成功！');
      console.log('🎉 准备显示成功提示');
      console.log('🎉 当前 showToast 状态:', showToast);
      
      // 显示成功提示
      setShowToast(true);
      console.log('🎉 已调用 setShowToast(true)');
      
      // 1.5秒后隐藏提示并返回
      setTimeout(() => {
        console.log('🔙 setTimeout 触发：隐藏提示，准备返回');
        setShowToast(false);
        router.back();
      }, 1500);
      
      console.log('✅ try 块执行完成');
    } catch (error: any) {
      console.error('❌ ============ 捕获到错误 ============');
      console.error('❌ 错误类型:', typeof error);
      console.error('❌ 错误对象:', error);
      console.error('❌ 错误消息:', error?.message);
      console.error('❌ 错误堆栈:', error?.stack);
      
      let errorMessage = '修改失败';
      if (error?.message) {
        errorMessage = error.message;
      }
      
      // 特别处理超时错误
      if (errorMessage.includes('超时') || errorMessage.includes('timeout')) {
        errorMessage += '\n\n可能原因：\n1. 网络连接不稳定\n2. Supabase 服务器响应慢\n3. 防火墙或代理限制\n\n建议：稍后重试或检查网络设置';
      }
      
      console.error('❌ 将显示错误提示:', errorMessage);
      Alert.alert('错误', errorMessage);
    } finally {
      console.log('🔵 finally 块执行');
      console.log('🔵 设置 saving = false');
      setSaving(false);
      console.log('🔵 ============ handleSave 结束 ============');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.backgroundDark} />
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.push('/profile');
            }
          }}
          style={styles.iconButton}
        >
          <Ionicons name="chevron-back" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>修改密码</Text>
        <View style={styles.headerRight} />
      </View>

      <View style={styles.content}>
        {/* Email (Read-only) */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>邮箱账号</Text>
          <View style={styles.emailContainer}>
            <Text style={styles.emailText}>{email}</Text>
          </View>
        </View>

        {/* New Password */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>新密码</Text>
          <View style={[styles.inputContainer, passwordError && styles.inputContainerError]}>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={handlePasswordChange}
              placeholder="请输入新密码（至少6位）"
              placeholderTextColor="rgba(136, 136, 136, 0.5)"
              selectionColor={COLORS.accentOrange}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />
            {password.length > 0 && (
              <TouchableOpacity 
                onPress={() => {
                  setPassword('');
                  setPasswordError('');
                }} 
                style={styles.clearButton}
              >
                <Ionicons 
                  name="close-circle" 
                  size={20} 
                  color={COLORS.textSubDark} 
                />
              </TouchableOpacity>
            )}
            <TouchableOpacity 
              onPress={() => setShowPassword(!showPassword)} 
              style={styles.eyeButton}
            >
              <Ionicons 
                name={showPassword ? "eye-outline" : "eye-off-outline"} 
                size={20} 
                color={COLORS.textSubDark} 
              />
            </TouchableOpacity>
          </View>
          {passwordError ? (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={14} color="#FF4444" />
              <Text style={styles.errorText}>{passwordError}</Text>
            </View>
          ) : null}
        </View>

        {/* Confirm Password */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>确认新密码</Text>
          <View style={[styles.inputContainer, confirmPasswordError && styles.inputContainerError]}>
            <TextInput
              style={styles.input}
              value={confirmPassword}
              onChangeText={handleConfirmPasswordChange}
              placeholder="请再次输入新密码"
              placeholderTextColor="rgba(136, 136, 136, 0.5)"
              selectionColor={COLORS.accentOrange}
              secureTextEntry={!showConfirmPassword}
              autoCapitalize="none"
            />
            {confirmPassword.length > 0 && (
              <TouchableOpacity 
                onPress={() => {
                  setConfirmPassword('');
                  setConfirmPasswordError('');
                }} 
                style={styles.clearButton}
              >
                <Ionicons 
                  name="close-circle" 
                  size={20} 
                  color={COLORS.textSubDark} 
                />
              </TouchableOpacity>
            )}
            <TouchableOpacity 
              onPress={() => setShowConfirmPassword(!showConfirmPassword)} 
              style={styles.eyeButton}
            >
              <Ionicons 
                name={showConfirmPassword ? "eye-outline" : "eye-off-outline"} 
                size={20} 
                color={COLORS.textSubDark} 
              />
            </TouchableOpacity>
          </View>
          {confirmPasswordError ? (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={14} color="#FF4444" />
              <Text style={styles.errorText}>{confirmPasswordError}</Text>
            </View>
          ) : null}
        </View>

        {/* Helper Text */}
        <View style={styles.helperTextContainer}>
          <Text style={styles.helperText}>• 密码长度至少为6个字符</Text>
          <Text style={styles.helperText}>• 两次输入的密码必须一致</Text>
        </View>

        {/* Save Button */}
        <TouchableOpacity 
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving}
          activeOpacity={0.7}
        >
          <Text style={styles.saveButtonText}>
            {saving ? '保存中...' : '保存'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Success Toast */}
      {showToast && (
        <View style={styles.toastContainer}>
          <View style={styles.toastContent}>
            <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
            <Text style={styles.toastText}>修改成功</Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundDark,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
  },
  iconButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textMainDark,
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  fieldContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    color: COLORS.textSubDark,
    marginBottom: 8,
  },
  emailContainer: {
    backgroundColor: COLORS.cardDark,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
  },
  emailText: {
    fontSize: 15,
    color: COLORS.textMainDark,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardDark,
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
  },
  inputContainerError: {
    borderColor: '#FF4444',
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: COLORS.textMainDark,
    paddingVertical: 14,
  },
  clearButton: {
    padding: 4,
    marginLeft: 4,
  },
  eyeButton: {
    padding: 4,
    marginLeft: 4,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    paddingHorizontal: 4,
  },
  errorText: {
    fontSize: 12,
    color: '#FF4444',
    marginLeft: 4,
  },
  helperTextContainer: {
    marginTop: 8,
    marginBottom: 32,
  },
  helperText: {
    fontSize: 12,
    color: COLORS.textSubDark,
    marginBottom: 4,
  },
  saveButton: {
    backgroundColor: COLORS.accentOrange,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  toastContainer: {
    position: 'absolute',
    top: 100,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1000,
  },
  toastContent: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(22, 22, 22, 0.95)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.3)',
  },
  toastText: {
    fontSize: 14,
    color: '#4CAF50',
    marginLeft: 8,
    fontWeight: '500',
  },
});
