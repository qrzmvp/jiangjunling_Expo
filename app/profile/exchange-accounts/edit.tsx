import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, TextInput, Switch, StyleSheet, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

const COLORS = {
  background: "#000000",
  card: "#1c1c1e",
  text: "#ffffff",
  textSecondary: "#9ca3af",
  border: "#27272a",
  primary: "#3B82F6", // Blue for actions
  success: "#2ebd85", // Green
  danger: "#f6465d", // Red
  warning: "#eab308", // Yellow
  warningBg: "rgba(234, 179, 8, 0.1)",
  inputPlaceholder: "#6B7280",
};

export default function EditExchangeAccount() {
  const router = useRouter();
  const [isEnabled, setIsEnabled] = useState(true);
  const toggleSwitch = () => setIsEnabled(previousState => !previousState);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      {/* Header */}
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => router.back()}
            style={styles.iconButton}
          >
            <Ionicons name="chevron-back" size={24} color={COLORS.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>新增交易所账户</Text>
          <TouchableOpacity 
            onPress={() => router.back()}
            style={styles.saveButton}
          >
            <Text style={styles.saveButtonText}>保存</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Exchange Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            交易所信息
          </Text>
          <View style={styles.card}>
            <TouchableOpacity style={styles.cardRow}>
              <View style={styles.rowLeft}>
                <View style={styles.iconContainer}>
                  <MaterialIcons name="account-balance" size={18} color="#9CA3AF" />
                </View>
                <Text style={styles.rowLabel}>选择交易所</Text>
              </View>
              <View style={styles.rowRight}>
                <Text style={styles.rowValue}>Binance</Text>
                <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* API Config */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            API 配置
          </Text>
          <View style={styles.card}>
            {/* API Key */}
            <View style={styles.inputRow}>
              <View style={styles.inputHeader}>
                <Text style={styles.inputLabel}>API Key</Text>
                <TouchableOpacity>
                  <MaterialIcons name="qr-code-scanner" size={20} color={COLORS.primary} />
                </TouchableOpacity>
              </View>
              <TextInput 
                style={styles.input}
                placeholder="输入 Access Key"
                placeholderTextColor={COLORS.inputPlaceholder}
              />
            </View>

            {/* Secret Key */}
            <View style={styles.inputRow}>
              <View style={styles.inputHeader}>
                <Text style={styles.inputLabel}>Secret Key</Text>
                <TouchableOpacity>
                  <MaterialIcons name="content-paste" size={20} color={COLORS.textSecondary} />
                </TouchableOpacity>
              </View>
              <TextInput 
                style={styles.input}
                placeholder="输入 Secret Key"
                placeholderTextColor={COLORS.inputPlaceholder}
                secureTextEntry
              />
            </View>

            {/* Passphrase */}
            <View style={styles.inputRowNoBorder}>
              <Text style={[styles.inputLabel, { marginBottom: 8 }]}>
                Passphrase <Text style={styles.optionalText}>(选填)</Text>
              </Text>
              <TextInput 
                style={styles.input}
                placeholder="输入口令 (部分交易所需要)"
                placeholderTextColor={COLORS.inputPlaceholder}
                secureTextEntry
              />
            </View>
          </View>
        </View>

        {/* Account Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            账户设置
          </Text>
          <View style={styles.card}>
            <View style={[styles.cardRow, { borderBottomWidth: 1, borderBottomColor: COLORS.border }]}>
              <Text style={styles.rowLabel}>账户备注</Text>
              <TextInput 
                style={styles.inputRight}
                placeholder="例如: 币安主账户"
                placeholderTextColor={COLORS.inputPlaceholder}
              />
            </View>
            <View style={styles.cardRow}>
              <View style={styles.columnLeft}>
                <Text style={styles.rowLabel}>启用账户</Text>
                <Text style={styles.helperText}>关闭后停止同步数据</Text>
              </View>
              <Switch
                trackColor={{ false: "#767577", true: COLORS.primary }}
                thumbColor={"#f4f3f4"}
                ios_backgroundColor="#3e3e3e"
                onValueChange={toggleSwitch}
                value={isEnabled}
              />
            </View>
          </View>
        </View>

        {/* Security Warning */}
        <View style={styles.warningCard}>
          <MaterialIcons name="security" size={20} color={COLORS.warning} style={{marginTop: 2}} />
          <View style={styles.warningContent}>
            <Text style={styles.warningTitle}>安全提示</Text>
            <Text style={styles.warningText}>
              您的 API Key 将被加密存储。为了您的资金安全，请务必在交易所后台设置 API 权限，仅勾选「读取」和「交易」权限，
              <Text style={{ fontWeight: 'bold', textDecorationLine: 'underline' }}>切勿开启「提现」权限</Text>。
            </Text>
          </View>
        </View>
        
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: Platform.OS === 'android' ? 30 : 0,
  },
  safeArea: {
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.border,
    height: 56,
  },
  iconButton: {
    padding: 4,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.text,
  },
  saveButton: {
    paddingHorizontal: 8,
  },
  saveButtonText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginLeft: 4,
    marginBottom: 8,
    color: COLORS.textSecondary,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#374151',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rowLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowValue: {
    fontSize: 14,
    marginRight: 8,
    color: COLORS.textSecondary,
  },
  inputRow: {
    padding: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.border,
  },
  inputRowNoBorder: {
    padding: 16,
  },
  inputHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
  },
  optionalText: {
    color: COLORS.textSecondary,
    fontWeight: '400',
    fontSize: 12,
  },
  input: {
    fontSize: 16,
    padding: 0,
    color: COLORS.text,
  },
  inputRight: {
    flex: 1,
    fontSize: 16,
    textAlign: 'right',
    padding: 0,
    color: COLORS.text,
  },
  columnLeft: {
    flexDirection: 'column',
  },
  helperText: {
    fontSize: 12,
    marginTop: 2,
    color: COLORS.textSecondary,
  },
  warningCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 32,
    backgroundColor: COLORS.warningBg,
    borderColor: 'rgba(234, 179, 8, 0.3)',
  },
  warningContent: {
    flex: 1,
    marginLeft: 12,
  },
  warningTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
    color: COLORS.warning,
  },
  warningText: {
    fontSize: 12,
    lineHeight: 18,
    color: 'rgba(253, 230, 138, 0.8)',
  },
});
