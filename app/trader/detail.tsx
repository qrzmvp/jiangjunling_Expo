import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, useWindowDimensions, ActivityIndicator, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import Svg, { Path, Defs, LinearGradient, Stop, Circle, G, Image as SvgImage, Text as SvgText, ClipPath } from 'react-native-svg';
import { useProtectedRoute } from '../../hooks/useProtectedRoute';
import { useAuth } from '../../contexts/AuthContext';
import { subscribeTrader, unsubscribeTrader, followTrader, unfollowTrader } from '../../lib/userTraderService';
import { getTraderDetail, TraderDetail, getTraderSignals } from '../../lib/traderService';
import { Signal } from '../../lib/signalService';
import type { Trader } from '../../types';
import Toast from '../../components/Toast';

const COLORS = {
  primary: "#2ebd85",
  danger: "#f6465d",
  background: "#000000",
  surface: "#161616",
  surfaceLight: "#252525",
  textMain: "#F0F0F0",
  textSub: "#888888",
  border: "#252525",
  yellow: "#F0B90B",
  purple: "#8B5CF6",
  white: "#FFFFFF",
};

const TraderDetailScreen = () => {
  useProtectedRoute(); // 保护路由
  const router = useRouter();
  const { user } = useAuth();
  const params = useLocalSearchParams();
  const traderId = params.traderId as string;
  const returnTab = params.returnTab as string | undefined;
  
  const { width: windowWidth } = useWindowDimensions();
  const [activeTab, setActiveTab] = useState<'current' | 'history'>('current');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [timeFilter, setTimeFilter] = useState('近一周');
  const [signalTrendPeriod, setSignalTrendPeriod] = useState<'7' | '30' | '90'>('7');
  const [trader, setTrader] = useState<TraderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [currentSignals, setCurrentSignals] = useState<Signal[]>([]);
  const [historySignals, setHistorySignals] = useState<Signal[]>([]);
  const [signalsLoading, setSignalsLoading] = useState(false);

  // 【优化】加载交易员数据 - 使用单次优化查询
  useEffect(() => {
    loadTraderData();
    loadSignals();
  }, [traderId]);

  const loadTraderData = async () => {
    if (!traderId) return;
    
    try {
      setLoading(true);
      
      // 使用新的 RPC 函数：getTraderDetail 获取完整的交易员信息及统计数据
      const traderDetail = await getTraderDetail(traderId, user?.id);
      
      if (traderDetail) {
        setTrader(traderDetail);
        setIsSubscribed(traderDetail.is_subscribed || false);
        setIsFavorite(traderDetail.is_followed || false);
      }
    } catch (error) {
      console.error('加载交易员数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSignals = async () => {
    if (!traderId) return;
    
    try {
      setSignalsLoading(true);
      
      // 加载当天信号（active状态）
      const activeSignals = await getTraderSignals(traderId, 'active', 20, 0);
      setCurrentSignals(activeSignals);
      
      // 加载历史信号（closed状态）
      const closedSignals = await getTraderSignals(traderId, 'closed', 20, 0);
      setHistorySignals(closedSignals);
      
      console.log('✅ 成功加载信号数据:', { 
        active: activeSignals.length, 
        closed: closedSignals.length 
      });
    } catch (error) {
      console.error('加载信号数据失败:', error);
    } finally {
      setSignalsLoading(false);
    }
  };

  // 处理订阅/取消订阅
  const handleSubscriptionToggle = async () => {
    if (!user?.id || !trader) {
      console.log('请先登录');
      return;
    }

    if (actionLoading) return;

    try {
      setActionLoading(true);
      
      if (isSubscribed) {
        const result = await unsubscribeTrader(user.id, trader.id);
        if (result.success) {
          setIsSubscribed(false);
        }
      } else {
        const result = await subscribeTrader(user.id, trader.id);
        if (result.success) {
          setIsSubscribed(true);
        }
      }
    } catch (error) {
      console.error('订阅操作失败:', error);
    } finally {
      setActionLoading(false);
    }
  };

  // 处理关注/取消关注
  const handleFavoriteToggle = async () => {
    if (!user?.id || !trader) {
      console.log('请先登录');
      return;
    }

    if (actionLoading) return;

    try {
      setActionLoading(true);
      
      if (isFavorite) {
        const result = await unfollowTrader(user.id, trader.id);
        if (result.success) {
          setIsFavorite(false);
        }
      } else {
        const result = await followTrader(user.id, trader.id);
        if (result.success) {
          setIsFavorite(true);
        }
      }
    } catch (error) {
      console.error('关注操作失败:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCopy = () => {
    setToastMessage('Copy成功');
    setToastVisible(true);
  };

  // 渲染单个信号卡片
  const renderSignalCard = (signal: Signal) => {
    const isLong = signal.direction === 'long';
    const statusBgColor = isLong ? 'rgba(46, 189, 133, 0.15)' : 'rgba(246, 70, 93, 0.15)';
    const statusTextColor = isLong ? COLORS.primary : COLORS.danger;
    
    // 计算盈亏比
    const entryPrice = parseFloat(signal.entry_price);
    const takeProfit = parseFloat(signal.take_profit);
    const stopLoss = parseFloat(signal.stop_loss);
    
    let profitLossRatio = '0:0';
    if (isLong) {
      const profit = takeProfit - entryPrice;
      const loss = entryPrice - stopLoss;
      if (loss > 0) {
        profitLossRatio = `${(profit / loss).toFixed(2)}:1`;
      }
    } else {
      const profit = entryPrice - takeProfit;
      const loss = stopLoss - entryPrice;
      if (loss > 0) {
        profitLossRatio = `${(profit / loss).toFixed(2)}:1`;
      }
    }

    // 格式化时间
    const formatTime = (dateString: string) => {
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;
    };

    // 信号类型显示
    const signalTypeText = signal.signal_type === 'spot' ? '现货' : 
                          signal.signal_type === 'futures' ? '永续' : '杠杆';

    return (
      <View key={signal.id} style={styles.signalCard}>
        <View style={styles.signalCardHeader}>
          <Text style={styles.signalPairText}>{signal.currency} {signalTypeText}</Text>
          <View style={[styles.signalStatusTag, { backgroundColor: statusBgColor }]}>
            <Text style={[styles.signalStatusText, { color: statusTextColor }]}>
              {isLong ? '做多' : '做空'}
            </Text>
          </View>
          <View style={styles.signalLeverageTag}>
            <Text style={styles.signalLeverageText}>{signal.leverage}x</Text>
          </View>
          <TouchableOpacity style={styles.signalCopyButton} onPress={handleCopy}>
            <Text style={styles.signalCopyButtonText}>Copy</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.signalInfoGrid}>
          <View style={styles.signalGridItem}>
            <Text style={styles.signalInfoLabel}>入场价</Text>
            <Text style={styles.signalInfoValue}>{signal.entry_price}</Text>
          </View>
          <View style={styles.signalGridItem}>
            <Text style={styles.signalInfoLabel}>仓位模式</Text>
            <Text style={styles.signalInfoValue}>全仓</Text>
          </View>
          <View style={styles.signalGridItem}>
            <Text style={styles.signalInfoLabel}>委托时间</Text>
            <Text style={styles.signalInfoValue}>{formatTime(signal.signal_time)}</Text>
          </View>
        </View>

        <View style={styles.signalInfoGrid}>
          <View style={styles.signalGridItem}>
            <Text style={styles.signalInfoLabel}>止盈价</Text>
            <Text style={[styles.signalInfoValue, { color: COLORS.primary }]}>{signal.take_profit}</Text>
          </View>
          <View style={styles.signalGridItem}>
            <Text style={styles.signalInfoLabel}>止损价</Text>
            <Text style={[styles.signalInfoValue, { color: COLORS.danger }]}>{signal.stop_loss}</Text>
          </View>
          <View style={styles.signalGridItem}>
            <Text style={styles.signalInfoLabel}>盈亏比</Text>
            <Text style={[styles.signalInfoValue, { color: COLORS.yellow }]}>{profitLossRatio}</Text>
          </View>
        </View>
      </View>
    );
  };

  // Mock Chart Data
  const rawChartData = [
    { date: '10-21', value: 100 },
    { date: '10-22', value: 115 },
    { date: '10-23', value: 125 },
    { date: '10-24', value: 110 },
    { date: '10-25', value: 90 },
    { date: '10-26', value: 80 },
    { date: '10-27', value: 105 },
    { date: '10-28', value: 95 },
    { date: '10-29', value: 85 },
    { date: '10-30', value: 75 },
    { date: '10-31', value: 65 },
  ];

  const chartData = React.useMemo(() => {
    let data = rawChartData;
    if (timeFilter === '近一周') {
      data = rawChartData.slice(-7);
    }
    
    // Normalize data so start is 0%
    if (data.length > 0) {
      const startValue = data[0].value;
      return data.map(d => ({ ...d, value: d.value - startValue }));
    }
    return data;
  }, [timeFilter]);

  // Calculate Min/Max Y dynamically
  const { yAxisMax, yAxisMin, yRange } = React.useMemo(() => {
    const allValues = chartData.map(d => d.value);
    const dataMax = Math.max(...allValues);
    const dataMin = Math.min(...allValues);
    
    // Add ~10% padding
    const range = dataMax - dataMin;
    const padding = range * 0.1 || 5;
    
    const max = Math.ceil(dataMax + padding);
    // If dataMin >= 0, start axis at 0. Otherwise add padding at bottom.
    let min = dataMin >= 0 ? 0 : Math.floor(dataMin - padding);
    
    return { yAxisMax: max, yAxisMin: min, yRange: max - min };
  }, [chartData]);

  const chartAreaWidth = windowWidth - 64 - 40; // 16*2 content padding + 16*2 card padding + 40 yAxis
  const dataLength = chartData.length;
  
  let xStep = 0;
  let chartWidth = chartAreaWidth;
  
  if (dataLength > 1) {
    if (dataLength <= 7) {
      // Fit in screen, leave ~30px for avatar at the end
      xStep = (chartAreaWidth - 30) / (dataLength - 1);
      chartWidth = chartAreaWidth;
    } else {
      // Scrollable
      xStep = 60;
      chartWidth = (dataLength - 1) * xStep + 60; // Ensure enough space at end
    }
  } else {
    xStep = 0;
    chartWidth = chartAreaWidth;
  }

  const chartHeight = 200;
  const verticalPadding = 20;

  const getY = (val: number) => {
    const availableHeight = chartHeight - (verticalPadding * 2);
    const normalizedVal = (val - yAxisMin) / (yRange || 1);
    return chartHeight - verticalPadding - normalizedVal * availableHeight;
  };

  // Calculate intermediate ticks
  const positiveStep1 = Math.ceil(yAxisMax / 3);
  const positiveStep2 = Math.ceil(yAxisMax * 2 / 3);
  const negativeStep1 = yAxisMin < 0 ? Math.floor(yAxisMin / 3) : 0;
  const negativeStep2 = yAxisMin < 0 ? Math.floor(yAxisMin * 2 / 3) : 0;

  // Generate Smooth Path
  const generatePath = (data: any[]) => {
    return data.reduce((acc, point, i) => {
      const x = i * xStep; // Start at 0
      const y = getY(point.value);
      if (i === 0) return `M ${x} ${y}`;
      const prev = data[i - 1];
      const prevX = (i - 1) * xStep;
      const prevY = getY(prev.value);
      const cp1x = prevX + xStep / 2;
      const cp1y = prevY;
      const cp2x = x - xStep / 2;
      const cp2y = y;
      return `${acc} C ${cp1x} ${cp1y} ${cp2x} ${cp2y} ${x} ${y}`;
    }, '');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.iconButton} 
          onPress={() => {
            if (returnTab) {
              // 如果有returnTab参数，返回首页并切换到对应标签
              router.push({
                pathname: '/(tabs)',
                params: { returnTab }
              });
            } else {
              // 否则使用默认返回
              router.back();
            }
          }}
        >
          <MaterialIcons name="arrow-back-ios" size={20} color={COLORS.textSub} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>交易员详情</Text>
        <TouchableOpacity style={styles.iconButton}>
          <MaterialIcons name="share" size={20} color={COLORS.textSub} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : !trader ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: COLORS.textSub }}>未找到交易员信息</Text>
        </View>
      ) : (
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
          
          {/* Trader Info Section */}
          <View style={styles.card}>
            <View style={styles.traderHeader}>
              <View style={styles.avatarContainer}>
                <Image 
                  source={{ uri: trader.avatar_url }}
                  style={styles.avatar}
                />
                <View style={styles.verifiedBadge}>
                  <MaterialIcons name="verified" size={14} color={COLORS.yellow} />
                </View>
              </View>
              
              <View style={styles.traderInfo}>
                <View style={styles.nameRow}>
                  <View style={styles.nameContainer}>
                    <Text style={styles.traderName} numberOfLines={1}>{trader.name}</Text>
                  </View>
                  <View style={styles.actionButtons}>
                    <TouchableOpacity 
                      style={styles.starButton} 
                      onPress={handleFavoriteToggle}
                      disabled={actionLoading}
                    >
                      <MaterialIcons 
                        name={isFavorite ? "star" : "star-border"} 
                        size={24} 
                        color={isFavorite ? COLORS.yellow : COLORS.textSub} 
                      />
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.copyButton, isSubscribed ? styles.copyButtonSubscribed : styles.copyButtonUnsubscribed]}
                      onPress={handleSubscriptionToggle}
                      disabled={actionLoading}
                    >
                      <Text style={styles.copyButtonText}>
                        {actionLoading ? '...' : (isSubscribed ? '已订阅' : '订阅')}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
                <Text style={styles.description} numberOfLines={1} ellipsizeMode="tail">{trader.description || '暂无描述'}</Text>
              </View>
            </View>

          <View style={styles.statsContainer}>
            <View style={styles.roiSection}>
              <View style={styles.roiHeader}>
                <View style={styles.roiHeaderLeft}>
                  <Text style={styles.roiLabel}>信号总数</Text>
                  <MaterialIcons name="info-outline" size={14} color="rgba(136, 136, 136, 0.5)" />
                </View>
                <View style={styles.periodSelector}>
                  <TouchableOpacity 
                    style={[styles.periodButton, signalTrendPeriod === '7' && styles.periodButtonActive]}
                    onPress={() => setSignalTrendPeriod('7')}
                  >
                    <Text style={[styles.periodButtonText, signalTrendPeriod === '7' && styles.periodButtonTextActive]}>7天</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.periodButton, signalTrendPeriod === '30' && styles.periodButtonActive]}
                    onPress={() => setSignalTrendPeriod('30')}
                  >
                    <Text style={[styles.periodButtonText, signalTrendPeriod === '30' && styles.periodButtonTextActive]}>30天</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.periodButton, signalTrendPeriod === '90' && styles.periodButtonActive]}
                    onPress={() => setSignalTrendPeriod('90')}
                  >
                    <Text style={[styles.periodButtonText, signalTrendPeriod === '90' && styles.periodButtonTextActive]}>90天</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.roiRow}>
                <View style={styles.roiValues}>
                  <Text style={styles.roiPercent}>{trader?.total_signals || 0}</Text>
                </View>
                <View style={styles.miniChartContainer}>
                  <Svg height="100%" width="100%" viewBox="0 0 100 40" preserveAspectRatio="none">
                    <Path 
                      d="M 0,20 Q 25,10 50,15 T 100,5" 
                      fill="none" 
                      stroke={COLORS.primary} 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    />
                  </Svg>
                </View>
              </View>
            </View>

            <View style={styles.gridStats}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>做多信号</Text>
                <Text style={styles.statValue}>{trader?.long_signals || 0}</Text>
              </View>
              <View style={[styles.statItem, { alignItems: 'center' }]}>
                <Text style={styles.statLabel}>做空信号</Text>
                <Text style={styles.statValue}>{trader?.short_signals || 0}</Text>
              </View>
              <View style={[styles.statItem, { alignItems: 'flex-end' }]}>
                <Text style={styles.statLabel}>交易天数</Text>
                <Text style={styles.statValue}>{trader?.signal_count || 0}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Rank Section - 暂时隐藏 */}
        {/* <View style={[styles.card, styles.rankCard]}>
          <View style={[styles.rankItem, styles.borderRight]}>
            <Text style={styles.rankLabel}>日排行</Text>
            <View style={styles.rankValueRow}>
              <Text style={styles.rankValue}>2</Text>
              <View style={styles.rankChangeGreen}>
                <Text style={styles.rankChangeTextGreen}>▲ 1</Text>
              </View>
            </View>
          </View>
          <View style={[styles.rankItem, styles.borderRight]}>
            <Text style={styles.rankLabel}>月排行</Text>
            <View style={styles.rankValueRow}>
              <Text style={styles.rankValue}>123</Text>
              <View style={styles.rankChangeRed}>
                <Text style={styles.rankChangeTextRed}>▼ 5</Text>
              </View>
            </View>
          </View>
          <View style={styles.rankItem}>
            <Text style={styles.rankLabel}>总排行</Text>
            <View style={styles.rankValueRow}>
              <Text style={styles.rankValue}>10</Text>
            </View>
          </View>
          <View style={styles.rankArrow}>
            <MaterialIcons name="chevron-right" size={24} color={COLORS.textSub} />
          </View>
        </View> */}

        {/* Profit Trend Section - 暂时隐藏 */}
        {/* <View style={styles.card}>
          <Text style={[styles.sectionTitle, { marginBottom: 16 }]}>收益走势</Text>
          ... 
        </View> */}

        {/* Signals Section - 信号列表 */}
        <View style={[styles.card, { padding: 0, overflow: 'hidden' }]}>
          <View style={styles.tabsHeader}>
            <TouchableOpacity 
              style={styles.tabItem} 
              onPress={() => setActiveTab('current')}
            >
              <View style={styles.tabContent}>
                <Text style={[styles.tabText, activeTab === 'current' ? styles.tabTextActive : null]}>当天信号</Text>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{trader?.active_signals || 0}</Text>
                </View>
              </View>
              {activeTab === 'current' && <View style={styles.activeIndicator} />}
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.tabItem}
              onPress={() => setActiveTab('history')}
            >
              <View style={styles.tabContent}>
                <Text style={[styles.tabText, activeTab === 'history' ? styles.tabTextActive : null]}>历史信号</Text>
              </View>
              {activeTab === 'history' && <View style={styles.activeIndicator} />}
            </TouchableOpacity>
          </View>

          <View style={styles.listContainer}>
            {signalsLoading ? (
              <View style={{ padding: 40, alignItems: 'center' }}>
                <ActivityIndicator size="small" color={COLORS.primary} />
                <Text style={{ color: COLORS.textSub, fontSize: 12, marginTop: 8 }}>
                  加载信号数据...
                </Text>
              </View>
            ) : (
              <>
                {activeTab === 'current' && (
                  <>
                    {currentSignals.length === 0 ? (
                      <View style={{ padding: 40, alignItems: 'center' }}>
                        <Text style={{ color: COLORS.textSub, fontSize: 14 }}>暂无当天信号</Text>
                      </View>
                    ) : (
                      currentSignals.map(signal => renderSignalCard(signal))
                    )}
                  </>
                )}

                {activeTab === 'history' && (
                  <>
                    {historySignals.length === 0 ? (
                      <View style={{ padding: 40, alignItems: 'center' }}>
                        <Text style={{ color: COLORS.textSub, fontSize: 14 }}>暂无历史信号</Text>
                      </View>
                    ) : (
                      historySignals.map(signal => renderSignalCard(signal))
                    )}
                  </>
                )}
              </>
            )}
          </View>
        </View>

      </ScrollView>
      )}
      <Toast 
        visible={toastVisible} 
        message={toastMessage} 
        type="success" 
        duration={1500}
        onHide={() => setToastVisible(false)} 
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    ...(Platform.OS === 'web' && {
      position: 'fixed' as any,
      width: '100%',
      height: '100%',
      overflow: 'hidden',
      touchAction: 'pan-y' as any,
    }),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  headerTitle: {
    color: COLORS.textMain,
    fontSize: 16,
    fontWeight: 'bold',
  },
  iconButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 5,
  },
  // Trader Info Styles
  traderHeader: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: 'rgba(37, 37, 37, 0.5)',
    backgroundColor: COLORS.surfaceLight,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: 'black',
    borderRadius: 10,
    padding: 2,
  },
  traderInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  traderName: {
    color: COLORS.textMain,
    fontSize: 18,
    fontWeight: 'bold',
    maxWidth: 120,
  },
  tagContainer: {
    backgroundColor: 'rgba(37, 37, 37, 0.5)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tagText: {
    color: COLORS.textSub,
    fontSize: 10,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  starButton: {
    padding: 4,
  },
  copyButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  copyButtonUnsubscribed: {
    backgroundColor: COLORS.white,
  },
  copyButtonSubscribed: {
    backgroundColor: COLORS.yellow,
  },
  copyButtonText: {
    color: 'black',
    fontSize: 14,
    fontWeight: 'bold',
  },
  description: {
    color: COLORS.textSub,
    fontSize: 12,
  },
  statsContainer: {
    gap: 20,
  },
  roiSection: {
    gap: 6,
  },
  roiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  roiHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  roiLabel: {
    color: COLORS.textSub,
    fontSize: 12,
  },
  roiRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  roiValues: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 12,
  },
  roiPercent: {
    color: COLORS.primary,
    fontSize: 30,
    fontWeight: 'bold',
    letterSpacing: -0.5,
  },
  roiAmount: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  periodSelector: {
    flexDirection: 'row',
    gap: 4,
  },
  periodButton: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    backgroundColor: 'rgba(37, 37, 37, 0.5)',
  },
  periodButtonActive: {
    backgroundColor: COLORS.primary,
  },
  periodButtonText: {
    color: COLORS.textSub,
    fontSize: 10,
    fontWeight: '500',
  },
  periodButtonTextActive: {
    color: COLORS.background,
  },
  miniChartContainer: {
    width: 150,
    height: 50,
  },
  gridStats: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: 'rgba(37, 37, 37, 0.5)',
    paddingTop: 16,
  },
  statItem: {
    flex: 1,
  },
  statLabel: {
    color: COLORS.textSub,
    fontSize: 11,
    marginBottom: 4,
  },
  statValue: {
    color: COLORS.textMain,
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Rank Card Styles
  rankCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  rankItem: {
    flex: 1,
    alignItems: 'center',
  },
  borderRight: {
    borderRightWidth: 1,
    borderRightColor: 'rgba(37, 37, 37, 0.5)',
  },
  rankLabel: {
    color: COLORS.textSub,
    fontSize: 12,
    marginBottom: 4,
  },
  rankValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rankValue: {
    color: COLORS.textMain,
    fontSize: 18,
    fontWeight: 'bold',
  },
  rankChangeGreen: {
    backgroundColor: 'rgba(46, 189, 133, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  rankChangeTextGreen: {
    color: COLORS.primary,
    fontSize: 10,
    fontWeight: '500',
  },
  rankChangeRed: {
    backgroundColor: 'rgba(246, 70, 93, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  rankChangeTextRed: {
    color: COLORS.danger,
    fontSize: 10,
    fontWeight: '500',
  },
  rankArrow: {
    paddingLeft: 8,
  },
  // Chart Section Styles
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  chartLabel: {
    color: COLORS.textSub,
    fontSize: 12,
  },
  sectionTitle: {
    color: COLORS.textMain,
    fontSize: 16,
    fontWeight: 'bold',
  },
  legendContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    color: COLORS.textSub,
    fontSize: 10,
  },
  timeFilterContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    padding: 4,
    borderRadius: 8,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(37, 37, 37, 0.5)',
  },
  timeFilterBtn: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    borderRadius: 6,
  },
  timeFilterBtnActive: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
  },
  timeFilterText: {
    color: COLORS.textSub,
    fontSize: 12,
  },
  timeFilterTextActive: {
    color: COLORS.textMain,
    fontSize: 12,
    fontWeight: '500',
  },
  chartContainer: {
    flexDirection: 'row',
    height: 200,
    width: '100%',
    marginBottom: 8,
  },
  yAxis: {
    position: 'relative',
    width: 40,
    height: '100%',
  },
  axisText: {
    color: COLORS.textSub,
    fontSize: 10,
    fontWeight: '500',
  },
  chartContent: {
    flex: 1,
    position: 'relative',
  },
  gridLine: {
    width: '100%',
    height: 1,
    backgroundColor: 'rgba(37, 37, 37, 0.3)',
    borderStyle: 'dashed',
    marginBottom: (192 - 24) / 4,
  },
  xAxis: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingLeft: 40,
  },
  // Tabs & List Styles
  tabsHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(37, 37, 37, 0.5)',
    paddingHorizontal: 20,
  },
  tabItem: {
    marginRight: 24,
    paddingVertical: 14,
    position: 'relative',
  },
  tabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tabText: {
    color: COLORS.textSub,
    fontSize: 16,
    fontWeight: '500',
  },
  tabTextActive: {
    color: COLORS.textMain,
    fontWeight: 'bold',
  },
  badge: {
    backgroundColor: COLORS.surfaceLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(37, 37, 37, 0.5)',
  },
  badgeText: {
    color: COLORS.textSub,
    fontSize: 12,
  },
  badgeTransparent: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  badgeTextTransparent: {
    color: 'rgba(136, 136, 136, 0.6)',
    fontSize: 12,
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: COLORS.white,
  },
  listContainer: {
    padding: 16,
    minHeight: 220,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  listHeaderLabel: {
    color: COLORS.textSub,
    fontSize: 11,
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 8,
  },
  separator: {
    height: 1,
    backgroundColor: 'rgba(37, 37, 37, 0.5)',
    marginVertical: 8,
  },
  pairRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  pairText: {
    color: COLORS.textMain,
    fontSize: 14,
    fontWeight: 'bold',
  },
  typeText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  leverageTagGreen: {
    backgroundColor: 'rgba(46, 189, 133, 0.1)',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  leverageTextGreen: {
    color: COLORS.primary,
    fontSize: 10,
    fontWeight: 'bold',
  },
  leverageTagRed: {
    backgroundColor: 'rgba(246, 70, 93, 0.1)',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  leverageTextRed: {
    color: COLORS.danger,
    fontSize: 10,
    fontWeight: 'bold',
  },
  amountText: {
    color: COLORS.textSub,
    fontSize: 11,
  },
  priceText: {
    color: COLORS.textMain,
    fontSize: 14,
    fontWeight: '500',
  },
  subPriceText: {
    color: COLORS.textSub,
    fontSize: 11,
    marginTop: 4,
  },
  pnlTextGreen: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: 'bold',
  },
  pnlPercentGreen: {
    color: COLORS.primary,
    fontSize: 10,
    fontWeight: '500',
    marginTop: 4,
  },
  pnlTextRed: {
    color: COLORS.danger,
    fontSize: 14,
    fontWeight: 'bold',
  },
  pnlPercentRed: {
    color: COLORS.danger,
    fontSize: 10,
    fontWeight: '500',
    marginTop: 4,
  },
  statusTag: {
    backgroundColor: 'rgba(240, 185, 11, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    color: COLORS.yellow,
    fontSize: 10,
    fontWeight: '500',
  },
  // Signal Card Styles
  signalCard: {
    backgroundColor: COLORS.surfaceLight,
    marginLeft: 0,
    marginRight: 0,
    marginBottom: 12,
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(37, 37, 37, 0.5)',
  },
  signalCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  signalPairText: {
    color: COLORS.textMain,
    fontSize: 16,
    fontWeight: 'bold',
  },
  signalStatusTag: {
    backgroundColor: 'rgba(46, 189, 133, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  signalStatusText: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: '500',
  },
  signalLeverageTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  signalLeverageText: {
    color: COLORS.textMain,
    fontSize: 11,
  },
  signalCopyButton: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    marginLeft: 'auto',
  },
  signalCopyButtonText: {
    color: COLORS.background,
    fontSize: 11,
    fontWeight: 'bold',
  },
  signalInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  signalInfoItem: {
    flex: 1,
  },
  signalInfoGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  signalGridItem: {
    flex: 1,
  },
  signalInfoLabel: {
    color: COLORS.textSub,
    fontSize: 11,
    marginBottom: 4,
  },
  signalInfoValue: {
    color: COLORS.textMain,
    fontSize: 13,
    fontWeight: '500',
  },
});

export default TraderDetailScreen;