import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Svg, { Path } from 'react-native-svg';
import { useAuth } from '../contexts/AuthContext';
import { subscribeTrader, unsubscribeTrader, followTrader, unfollowTrader } from '../lib/userTraderService';

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

export const TraderCard = ({ 
  traderId,
  name, 
  avatar, 
  followers, 
  maxFollowers, 
  roi, 
  roiLabel = "Lead trader 90D PnL",
  pnl, 
  winRate, 
  aum, 
  days, 
  coins,
  chartPath,
  statusColor = COLORS.yellow,
  initialIsSubscribed = false,
  initialIsFavorite = false,
  onSubscriptionChange,
  onFavoriteChange,
  onPress
}: {
  traderId: string,
  name: string,
  avatar: string,
  followers: number,
  maxFollowers: number,
  roi: string,
  roiLabel?: string,
  pnl: string,
  winRate: string,
  aum: string,
  days: number,
  coins: string[],
  chartPath: string,
  statusColor?: string,
  initialIsSubscribed?: boolean,
  initialIsFavorite?: boolean,
  onSubscriptionChange?: () => void,
  onFavoriteChange?: () => void,
  onPress?: () => void
}) => {
  const { user } = useAuth();
  const [isSubscribed, setIsSubscribed] = React.useState(initialIsSubscribed);
  const [isFavorite, setIsFavorite] = React.useState(initialIsFavorite);
  const [loading, setLoading] = React.useState(false);

  // 处理订阅/取消订阅
  const handleSubscriptionToggle = async () => {
    if (!user?.id) {
      console.log('请先登录');
      return;
    }

    if (loading) return;

    try {
      setLoading(true);
      
      if (isSubscribed) {
        const result = await unsubscribeTrader(user.id, traderId);
        if (result.success) {
          setIsSubscribed(false);
          onSubscriptionChange?.();
        }
      } else {
        const result = await subscribeTrader(user.id, traderId);
        if (result.success) {
          setIsSubscribed(true);
          onSubscriptionChange?.();
        }
      }
    } catch (error) {
      console.error('订阅操作失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 处理关注/取消关注
  const handleFavoriteToggle = async () => {
    if (!user?.id) {
      console.log('请先登录');
      return;
    }

    if (loading) return;

    try {
      setLoading(true);
      
      if (isFavorite) {
        const result = await unfollowTrader(user.id, traderId);
        if (result.success) {
          setIsFavorite(false);
          onFavoriteChange?.();
        }
      } else {
        const result = await followTrader(user.id, traderId);
        if (result.success) {
          setIsFavorite(true);
          onFavoriteChange?.();
        }
      }
    } catch (error) {
      console.error('关注操作失败:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableOpacity style={styles.traderCard} onPress={onPress} activeOpacity={0.9}>
      {/* Header */}
      <View style={styles.cardHeader}>
        <View style={styles.traderInfo}>
          <View style={styles.traderAvatarContainer}>
            <Image source={{ uri: avatar }} style={styles.traderAvatar} />
            <View style={styles.statusIndicatorContainer}>
              <View style={[styles.statusIndicator, { backgroundColor: statusColor }]} />
            </View>
          </View>
          <View>
            <Text style={styles.traderName}>{name}</Text>
            <View style={styles.followerInfo}>
              <MaterialIcons name="group" size={10} color={COLORS.textMuted} style={{ marginRight: 4 }} />
              <Text style={styles.followerText}>{followers}/{maxFollowers}</Text>
            </View>
          </View>
        </View>
        <View style={styles.cardActions}>
          <TouchableOpacity 
            style={styles.starBtn} 
            onPress={handleFavoriteToggle}
            disabled={loading}
          >
            <MaterialIcons 
              name={isFavorite ? "star" : "star-border"} 
              size={20} 
              color={isFavorite ? COLORS.yellow : COLORS.textMuted} 
            />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.cardCopyBtn, isSubscribed ? styles.copyButtonSubscribed : styles.copyButtonUnsubscribed]}
            onPress={handleSubscriptionToggle}
            disabled={loading}
          >
            <Text style={styles.cardCopyBtnText}>
              {loading ? '...' : (isSubscribed ? '已订阅' : '订阅')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Stats & Chart */}
      <View style={styles.mainStatsRow}>
        <View>
          <View style={styles.statLabelRow}>
            <Text style={styles.statLabel}>{roiLabel}</Text>
          </View>
          <Text style={styles.roiText}>{roi}</Text>
          <Text style={styles.pnlText}>{pnl}</Text>
        </View>
        <View style={styles.miniChartContainer}>
          <Svg height="100%" width="100%" viewBox="0 0 100 40" preserveAspectRatio="none">
            <Path 
              d={chartPath} 
              fill="none" 
              stroke={COLORS.primary} 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </Svg>
        </View>
      </View>

      {/* Footer Stats */}
      <View style={styles.cardFooter}>
        <View style={styles.footerLeft}>
          <View style={styles.footerStatRow}>
            <Text style={styles.footerLabel}>Win rate</Text>
            <Text style={styles.footerValue}>{winRate}</Text>
          </View>
          <View style={styles.footerStatRow}>
            <Text style={styles.footerLabel}>AUM</Text>
            <Text style={styles.footerValue}>{aum}</Text>
          </View>
        </View>
        <View style={styles.footerRight}>
          <View style={styles.daysInfo}>
            <MaterialIcons name="calendar-today" size={12} color={COLORS.textMuted} style={{ marginRight: 4 }} />
            <Text style={styles.daysText}>{days} days</Text>
          </View>
          <View style={styles.coinIcons}>
            {coins.map((coin, index) => (
              <Image key={index} source={{ uri: coin }} style={[styles.coinIcon, { zIndex: coins.length - index, marginLeft: index > 0 ? -6 : 0 }]} />
            ))}
            <View style={[styles.moreCoinsBadge, { zIndex: 0, marginLeft: -6 }]}>
              <Text style={styles.moreCoinsText}>2</Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  traderCard: {
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  traderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  traderAvatarContainer: {
    position: 'relative',
    width: 40,
    height: 40,
  },
  traderAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
  },
  statusIndicatorContainer: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 8,
    padding: 2,
  },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  traderName: {
    color: COLORS.textMain,
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 2,
  },
  followerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  followerText: {
    color: COLORS.textMuted,
    fontSize: 12,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  starBtn: {
    padding: 4,
  },
  cardCopyBtn: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  cardCopyBtnText: {
    color: 'black',
    fontSize: 12,
    fontWeight: 'bold',
  },
  copyButtonUnsubscribed: {
    backgroundColor: 'white',
  },
  copyButtonSubscribed: {
    backgroundColor: COLORS.yellow,
  },
  mainStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  statLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  statLabel: {
    color: COLORS.textMuted,
    fontSize: 12,
  },
  roiText: {
    color: COLORS.primary,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  pnlText: {
    color: COLORS.textMain,
    fontSize: 12,
    fontWeight: '500',
  },
  miniChartContainer: {
    width: 100,
    height: 40,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  footerLeft: {
    gap: 4,
  },
  footerRight: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  footerStatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minWidth: 120,
    justifyContent: 'space-between',
  },
  footerLabel: {
    color: COLORS.textMuted,
    fontSize: 12,
  },
  footerValue: {
    color: COLORS.textMain,
    fontSize: 12,
    fontWeight: '500',
  },
  daysInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  daysText: {
    color: COLORS.textMuted,
    fontSize: 12,
  },
  coinIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 6,
  },
  coinIcon: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.surfaceLight,
    backgroundColor: COLORS.surface,
  },
  moreCoinsBadge: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreCoinsText: {
    color: COLORS.textMuted,
    fontSize: 8,
    fontWeight: 'bold',
  },
});
