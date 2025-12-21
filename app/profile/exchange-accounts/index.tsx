import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, StyleSheet, Platform } from 'react-native';
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
};

export default function ExchangeAccountsList() {
  const router = useRouter();

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
          <Text style={styles.headerTitle}>交易所账户管理</Text>
          <TouchableOpacity 
            onPress={() => router.push('/profile/exchange-accounts/edit')}
            style={styles.iconButton}
          >
            <Text style={styles.headerAction}>添加</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Stats Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardLabel}>连接总数</Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>运行良好</Text>
            </View>
          </View>
          <View style={styles.statsRow}>
            <Text style={styles.statsNumber}>4</Text>
            <Text style={styles.statsUnit}>个账户</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>已连接账户</Text>

        {/* Binance Account */}
        <TouchableOpacity 
          style={styles.accountCard}
          activeOpacity={0.7}
          onPress={() => router.push('/profile/exchange-accounts/edit')}
        >
          <View style={styles.accountInfo}>
            <View style={[styles.logoContainer, { backgroundColor: '#FCD535' }]}>
               <Text style={[styles.logoText, { color: '#000000' }]}>B</Text>
               <View style={styles.statusDotContainer}>
                 <View style={[styles.statusDot, { backgroundColor: COLORS.success }]} />
               </View>
            </View>
            <View style={styles.accountDetails}>
              <View style={styles.accountNameRow}>
                <Text style={styles.accountName}>Binance</Text>
                <View style={styles.tag}>
                  <Text style={styles.tagText}>现货</Text>
                </View>
              </View>
              <Text style={styles.accountSubtext}>主账户 • API ...8392</Text>
            </View>
          </View>
          <View style={styles.accountAction}>
            <Text style={[styles.statusLabel, { color: COLORS.success }]}>正常</Text>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
          </View>
        </TouchableOpacity>

        {/* OKX Account */}
        <TouchableOpacity 
          style={styles.accountCard}
          activeOpacity={0.7}
          onPress={() => router.push('/profile/exchange-accounts/edit')}
        >
          <View style={styles.accountInfo}>
            <View style={[styles.logoContainer, { backgroundColor: '#FFFFFF' }]}>
              <Text style={[styles.logoText, { color: '#000000', fontSize: 12 }]}>OKX</Text>
              <View style={styles.statusDotContainer}>
                <View style={[styles.statusDot, { backgroundColor: COLORS.success }]} />
              </View>
            </View>
            <View style={styles.accountDetails}>
              <View style={styles.accountNameRow}>
                <Text style={styles.accountName}>OKX</Text>
                <View style={styles.tag}>
                  <Text style={styles.tagText}>合约</Text>
                </View>
              </View>
              <Text style={styles.accountSubtext}>交易号 2 • API ...1102</Text>
            </View>
          </View>
          <View style={styles.accountAction}>
            <Text style={[styles.statusLabel, { color: COLORS.success }]}>正常</Text>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
          </View>
        </TouchableOpacity>

        {/* Bybit Account */}
        <TouchableOpacity 
          style={styles.accountCard}
          activeOpacity={0.7}
          onPress={() => router.push('/profile/exchange-accounts/edit')}
        >
          <View style={styles.accountInfo}>
            <View style={[styles.logoContainer, { backgroundColor: '#1F2937' }]}>
              <Text style={[styles.logoText, { color: '#FFFFFF' }]}>B</Text>
              <View style={styles.statusDotContainer}>
                <View style={[styles.statusDot, { backgroundColor: COLORS.danger }]} />
              </View>
            </View>
            <View style={styles.accountDetails}>
              <View style={styles.accountNameRow}>
                <Text style={styles.accountName}>Bybit</Text>
              </View>
              <Text style={styles.accountSubtext}>策略组 A • API ...5521</Text>
            </View>
          </View>
          <View style={styles.accountAction}>
            <Text style={[styles.statusLabel, { color: COLORS.danger }]}>授权过期</Text>
            <MaterialIcons name="error" size={20} color={COLORS.danger} />
          </View>
        </TouchableOpacity>

        {/* Coinbase Account */}
        <TouchableOpacity 
          style={[styles.accountCard, { opacity: 0.6 }]}
          activeOpacity={0.7}
          onPress={() => router.push('/profile/exchange-accounts/edit')}
        >
          <View style={styles.accountInfo}>
            <View style={[styles.logoContainer, { backgroundColor: '#2563EB' }]}>
              <Text style={[styles.logoText, { color: '#FFFFFF', fontSize: 20 }]}>C</Text>
              <View style={styles.statusDotContainer}>
                <View style={[styles.statusDot, { backgroundColor: COLORS.warning }]} />
              </View>
            </View>
            <View style={styles.accountDetails}>
              <View style={styles.accountNameRow}>
                <Text style={styles.accountName}>Coinbase</Text>
              </View>
              <Text style={styles.accountSubtext}>备用 • API ...9982</Text>
            </View>
          </View>
          <View style={styles.accountAction}>
            <Text style={[styles.statusLabel, { color: COLORS.warning }]}>已暂停</Text>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
          </View>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            为了您的资产安全，请确保API Key仅开启了交易权限，并未开启提现权限。
          </Text>
        </View>
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
  },
  iconButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.text,
  },
  headerAction: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  cardLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 9999,
    backgroundColor: 'rgba(46, 189, 133, 0.15)',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.success,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  statsNumber: {
    fontSize: 30,
    fontWeight: 'bold',
    marginRight: 4,
    color: COLORS.text,
  },
  statsUnit: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 4,
    marginBottom: 8,
    marginTop: 8,
    color: COLORS.textSecondary,
  },
  accountCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  accountInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logoContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  logoText: {
    fontWeight: 'bold',
    fontSize: 20,
  },
  statusDotContainer: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  accountDetails: {
    marginLeft: 16,
    flex: 1,
  },
  accountNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  accountName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  tag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
    backgroundColor: '#2C2C2E',
  },
  tagText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#D1D5DB',
  },
  accountSubtext: {
    fontSize: 14,
    marginTop: 2,
    color: COLORS.textSecondary,
  },
  accountAction: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginRight: 8,
  },
  footer: {
    paddingHorizontal: 8,
    marginTop: 8,
  },
  footerText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
});
