import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useProtectedRoute } from '../hooks/useProtectedRoute';

const COLORS = {
  background: "#000000",
  surface: "#1c1c1e",
  textMain: "#ffffff",
  textMuted: "#9ca3af",
  border: "#27272a",
  success: "#2ebd85",
  danger: "#f6465d",
};

interface PurchaseRecord {
  id: string;
  packageName: string;
  orderNo: string;
  date: string;
  status: 'completed' | 'pending' | 'failed';
  amount: string;
  paymentMethod: string;
}

const MOCK_DATA: PurchaseRecord[] = [
  {
    id: '1',
    packageName: '年度会员',
    orderNo: 'ORDER20251220001',
    date: '2025-12-20 14:30:00',
    status: 'completed',
    amount: '299.9 USDT',
    paymentMethod: 'USDT',
  },
  {
    id: '2',
    packageName: '月度会员',
    orderNo: 'ORDER20251120001',
    date: '2025-11-20 10:15:00',
    status: 'completed',
    amount: '29.9 USDT',
    paymentMethod: 'USDT',
  },
  {
    id: '3',
    packageName: '季度会员',
    orderNo: 'ORDER20250820001',
    date: '2025-08-20 09:00:00',
    status: 'failed',
    amount: '79.9 USDT',
    paymentMethod: 'USDT',
  }
];

const StatusBadge = ({ status }: { status: PurchaseRecord['status'] }) => {
  let color = COLORS.textMuted;
  let text = '未知';

  switch (status) {
    case 'completed':
      color = COLORS.success;
      text = '已完成';
      break;
    case 'pending':
      color = '#eab308';
      text = '待支付';
      break;
    case 'failed':
      color = COLORS.danger;
      text = '支付失败';
      break;
  }

  return (
    <View style={[styles.statusBadge, { borderColor: color }]}>
      <Text style={[styles.statusText, { color }]}>{text}</Text>
    </View>
  );
};

export default function PurchaseHistoryPage() {
  const router = useRouter();

  const renderItem = ({ item }: { item: PurchaseRecord }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.packageName}>{item.packageName}</Text>
        <StatusBadge status={item.status} />
      </View>
      
      <View style={styles.divider} />
      
      <View style={styles.row}>
        <Text style={styles.label}>订单号</Text>
        <Text style={styles.value}>{item.orderNo}</Text>
      </View>
      
      <View style={styles.row}>
        <Text style={styles.label}>购买时间</Text>
        <Text style={styles.value}>{item.date}</Text>
      </View>
      
      <View style={styles.row}>
        <Text style={styles.label}>付款方式</Text>
        <Text style={styles.value}>{item.paymentMethod}</Text>
      </View>
      
      <View style={[styles.row, { marginTop: 4 }]}>
        <Text style={styles.label}>支付金额</Text>
        <Text style={styles.amount}>{item.amount}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>购买记录</Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        data={MOCK_DATA}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="receipt-outline" size={64} color={COLORS.textMuted} />
            <Text style={styles.emptyText}>暂无购买记录</Text>
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
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  packageName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textMain,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 12,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
  value: {
    fontSize: 14,
    color: COLORS.textMain,
  },
  amount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textMain,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  emptyText: {
    marginTop: 16,
    color: COLORS.textMuted,
    fontSize: 14,
  },
});
