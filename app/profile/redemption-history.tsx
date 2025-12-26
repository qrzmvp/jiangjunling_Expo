import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useProtectedRoute } from '../../hooks/useProtectedRoute';

const COLORS = {
  background: "#000000",
  surface: "#1c1c1e",
  textMain: "#ffffff",
  textMuted: "#9ca3af",
  border: "#27272a",
  primary: "#2ebd85",
};

interface RedemptionRecord {
  id: string;
  code: string;
  itemName: string;
  redeemedAt: string;
  status: 'success' | 'expired' | 'used';
}

const MOCK_DATA: RedemptionRecord[] = [
  {
    id: '1',
    code: 'VIP2024NEWYEAR',
    itemName: '月度会员',
    redeemedAt: '2024-01-01 12:00:00',
    status: 'success',
  },
  {
    id: '2',
    code: 'WELCOME2023',
    itemName: '7天体验卡',
    redeemedAt: '2023-12-15 09:30:00',
    status: 'success',
  },
];

export default function RedemptionHistoryPage() {
  useProtectedRoute(); // 保护路由
  const router = useRouter();

  const renderItem = ({ item }: { item: RedemptionRecord }) => (
    <View style={styles.itemContainer}>
      <View style={styles.itemHeader}>
        <Text style={styles.itemName}>{item.itemName}</Text>
        <Text style={styles.statusText}>兑换成功</Text>
      </View>
      <View style={styles.itemDetails}>
        <Text style={styles.codeText}>兑换码: {item.code}</Text>
        <Text style={styles.dateText}>{item.redeemedAt}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>兑换记录</Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        data={MOCK_DATA}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>暂无兑换记录</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 44,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textMain,
  },
  listContent: {
    padding: 16,
  },
  itemContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textMain,
  },
  statusText: {
    fontSize: 14,
    color: COLORS.primary,
  },
  itemDetails: {
    gap: 4,
  },
  codeText: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
  dateText: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: COLORS.textMuted,
    fontSize: 14,
  },
});
