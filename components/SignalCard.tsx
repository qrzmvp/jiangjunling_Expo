import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';

const COLORS = {
  primary: "#2ebd85",
  danger: "#f6465d",
  background: "#000000",
  surface: "#131313",
  surfaceLight: "#1c1c1e", // Lighter gray for cards
  surfaceLighter: "#2c2c2e", // Even lighter for signal box
  textMain: "#ffffff",
  textMuted: "#9ca3af",
  border: "#27272a",
  yellow: "#eab308",
  purple: "#8b5cf6",
  purpleLight: "rgba(139, 92, 246, 0.2)",
};

interface SignalCardProps {
  name: string;
  avatar: string;
  description: string;
  currency: string;
  entry: string;
  direction: 'long' | 'short';
  stopLoss: string;
  takeProfit: string;
  time: string;
  signalCount: number;
  onPress?: () => void;
  onSubscribe?: () => void;
}

export const SignalCard = ({
  name,
  avatar,
  description,
  currency,
  entry,
  direction,
  stopLoss,
  takeProfit,
  time,
  signalCount,
  onPress,
  onSubscribe
}: SignalCardProps) => {
  const isLong = direction === 'long';
  const directionText = isLong ? '多单' : '空单';
  const directionColor = isLong ? COLORS.primary : COLORS.danger;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <Image source={{ uri: avatar }} style={styles.avatar} />
          <View style={styles.nameContainer}>
            <View style={styles.nameRow}>
              <Text style={styles.name}>{name}</Text>
              <View style={styles.statusDot} />
            </View>
            <Text style={styles.description}>{description}</Text>
          </View>
        </View>
        <View style={[styles.directionBadge, { backgroundColor: 'rgba(246, 70, 93, 0.1)' }]}>
          <MaterialIcons name={isLong ? "arrow-upward" : "arrow-downward"} size={12} color={directionColor} />
          <Text style={[styles.directionText, { color: directionColor }]}>做{isLong ? '多' : '空'}</Text>
        </View>
      </View>

      {/* Signal Box */}
      <View style={styles.signalBox}>
        <Text style={styles.signalTitle}>【交易信号】</Text>
        <View style={styles.signalRow}>
          <Text style={styles.signalLabel}>币种：</Text>
          <Text style={styles.signalValue}>{currency}</Text>
        </View>
        <View style={styles.signalRow}>
          <Text style={styles.signalLabel}>入场：</Text>
          <Text style={styles.signalValue}>{entry}</Text>
        </View>
        <View style={styles.signalRow}>
          <Text style={styles.signalLabel}>方向：</Text>
          <Text style={[styles.signalValue, { color: directionColor }]}>{directionText}</Text>
        </View>
        <View style={styles.signalRow}>
          <Text style={styles.signalLabel}>止损：</Text>
          <Text style={styles.signalValue}>{stopLoss}</Text>
        </View>
        <View style={styles.signalRow}>
          <Text style={styles.signalLabel}>止盈：</Text>
          <Text style={styles.signalValue}>{takeProfit}</Text>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.timeText}>{time}</Text>
        <View style={styles.footerActions}>
          <View style={styles.signalCountBadge}>
            <Text style={styles.signalCountText}>{signalCount}条信号</Text>
          </View>
          <TouchableOpacity style={styles.subscribeBtn} onPress={onSubscribe}>
            <Ionicons name="star" size={12} color="#fff" style={{ marginRight: 4 }} />
            <Text style={styles.subscribeText}>订阅</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.detailBtn} onPress={onPress}>
            <Text style={styles.detailText}>查看详情</Text>
            <MaterialIcons name="chevron-right" size={16} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  nameContainer: {
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  name: {
    color: COLORS.textMain,
    fontSize: 14,
    fontWeight: 'bold',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
  },
  description: {
    color: COLORS.textMuted,
    fontSize: 12,
  },
  directionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    gap: 2,
  },
  directionText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  signalBox: {
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  signalTitle: {
    color: COLORS.textMain,
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  signalRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  signalLabel: {
    color: COLORS.textMuted,
    fontSize: 13,
    width: 45,
  },
  signalValue: {
    color: COLORS.textMain,
    fontSize: 13,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeText: {
    color: COLORS.textMuted,
    fontSize: 12,
  },
  footerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  signalCountBadge: {
    backgroundColor: COLORS.purpleLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  signalCountText: {
    color: COLORS.purple,
    fontSize: 11,
    fontWeight: '600',
  },
  subscribeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.purple,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 4,
  },
  subscribeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  detailBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceLight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  detailText: {
    color: COLORS.textMain,
    fontSize: 12,
    fontWeight: '500',
  },
});
