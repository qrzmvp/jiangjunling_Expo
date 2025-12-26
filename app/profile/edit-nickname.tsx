import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';
import { useProtectedRoute } from '../../hooks/useProtectedRoute';

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
  const [nickname, setNickname] = useState("西柚一点甜");

  const handleSave = () => {
    // TODO: Implement save logic
    router.back();
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
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={24} color={COLORS.textSubDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>我的昵称</Text>
        <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
          <Text style={styles.saveButtonText}>保存</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={nickname}
            onChangeText={setNickname}
            placeholder="请输入昵称"
            placeholderTextColor="rgba(136, 136, 136, 0.5)"
            selectionColor={COLORS.accentOrange}
          />
          {nickname.length > 0 && (
            <TouchableOpacity onPress={clearNickname} style={styles.clearButton}>
              <Ionicons name="close-circle" size={20} color={COLORS.textSubDark} />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.helperTextContainer}>
          <Text style={styles.helperText}>昵称支持中英文、数字，长度限制2-20个字符。</Text>
          <Text style={styles.helperText}>昵称不能包含敏感词汇、侮辱性语言或违反法律法规的内容。</Text>
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
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.accentOrange,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardDark,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 50,
  },
  input: {
    flex: 1,
    color: COLORS.textMainDark,
    fontSize: 16,
    height: '100%',
  },
  clearButton: {
    padding: 4,
  },
  helperTextContainer: {
    marginTop: 12,
    paddingHorizontal: 4,
  },
  helperText: {
    fontSize: 12,
    color: COLORS.textSubDark,
    lineHeight: 18,
    marginBottom: 4,
  },
});
