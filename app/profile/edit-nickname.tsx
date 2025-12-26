import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, SafeAreaView, StatusBar, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';
import { useProtectedRoute } from '../../hooks/useProtectedRoute';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

const COLORS = {
  backgroundDark: "#000000",
  cardDark: "#161616",
  cardHighlight: "#252525",
  textMainDark: "#F0F0F0",
  textSubDark: "#888888",
  borderDark: "#252525",
  accentOrange: "#F0B90B",
};

export default function EditNicknamePage() {
  useProtectedRoute(); // 保护路由
  const router = useRouter();
  const { user, profile, refreshProfile } = useAuth();
  const [nickname, setNickname] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // 使用与个人信息页面相同的逻辑获取昵称
    const currentNickname = profile?.username || user?.email?.split('@')[0] || '';
    setNickname(currentNickname);
  }, [profile, user]);

  const handleSave = async () => {
    if (!user) return;
    if (!nickname.trim()) {
      Alert.alert('错误', '账户名称不能为空');
      return;
    }
    if (nickname.length < 2 || nickname.length > 20) {
      Alert.alert('错误', '账户名称长度需在2-20个字符之间');
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('users')
        .update({ username: nickname.trim() })
        .eq('id', user.id);

      if (error) throw error;

      await refreshProfile();
      Alert.alert('成功', '账户名称已更新', [
        { text: '确定', onPress: () => router.back() }
      ]);
    } catch (error: any) {
      Alert.alert('错误', '更新失败: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const clearNickname = () => {
    setNickname("");
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
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={24} color={COLORS.textSubDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>修改账户名称</Text>
        <TouchableOpacity 
          onPress={handleSave} 
          style={styles.saveButton}
          disabled={saving}
        >
          <Text style={[styles.saveButtonText, saving && { opacity: 0.5 }]}>
            {saving ? '保存中...' : '保存'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={nickname}
            onChangeText={setNickname}
            placeholder="请输入账户名称"
            placeholderTextColor="rgba(136, 136, 136, 0.5)"
            selectionColor={COLORS.accentOrange}
            autoFocus
          />
          {nickname.length > 0 && (
            <TouchableOpacity onPress={clearNickname} style={styles.clearButton}>
              <Ionicons name="close-circle" size={20} color={COLORS.textSubDark} />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.helperTextContainer}>
          <Text style={styles.helperText}>账户名称支持中英文、数字，长度限制2-20个字符。</Text>
          <Text style={styles.helperText}>账户名称不能包含敏感词汇、侮辱性语言或违反法律法规的内容。</Text>
        </View>
      </View>
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
  backButton: {
    padding: 8,
    marginLeft: -8,
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textMainDark,
  },
  saveButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardDark,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.cardDark,
  },
  input: {
    flex: 1,
    color: COLORS.textMainDark,
    fontSize: 16,
    height: '100%',
    outlineStyle: 'none',
  },
  clearButton: {
    padding: 4,
  },
  helperTextContainer: {
    paddingHorizontal: 4,
  },
  helperText: {
    color: COLORS.textSubDark,
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 8,
  },
});
