import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Dimensions, NativeSyntheticEvent, NativeScrollEvent, useWindowDimensions, LayoutChangeEvent, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Svg, { Path, Defs, LinearGradient, Stop, Rect, Circle, G, Image as SvgImage, Text as SvgText, ClipPath } from 'react-native-svg';
import { AddToHomeScreen } from '../../components/AddToHomeScreen';
import { TraderCard } from '../../components/TraderCard';
import { SignalCard } from '../../components/SignalCard';
import { SignalService, Signal } from '../../lib/signalService';
import { useAuth } from '../../contexts/AuthContext';
import { getFollowedTraders, getSubscribedTraders } from '../../lib/userTraderService';

const { width } = Dimensions.get('window');

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

// 错误边界组件：用于捕获 SVG 渲染错误（通常是因为未重新构建 App）
class ChartErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean}> {
  state = { hasError: false };
  static getDerivedStateFromError(_: any) { return { hasError: true }; }
  render() {
    if (this.state.hasError) {
      return (
        <View style={[styles.chartArea, { justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,0,0,0.05)' }]}>
          <MaterialIcons name="build" size={32} color={COLORS.danger} style={{ marginBottom: 8 }} />
          <Text style={{ color: COLORS.danger, fontWeight: 'bold', marginBottom: 4 }}>图表组件未加载</Text>
          <Text style={{ color: COLORS.textMuted, fontSize: 12 }}>请在终端运行以下命令重新构建：</Text>
          <View style={{ backgroundColor: '#000', padding: 8, borderRadius: 4, marginTop: 8 }}>
            <Text style={{ color: COLORS.primary, fontSize: 12, fontFamily: 'Menlo' }}>npx expo run:ios</Text>
          </View>
        </View>
      );
    }
    return this.props.children;
  }
}

// 排行榜列表项组件
const LeaderboardItem = ({ rank, name, roi, avatar, isTop = false }: { rank: number, name: string, roi: string, avatar: string, isTop?: boolean }) => {
  const [isSubscribed, setIsSubscribed] = React.useState(false);

  return (
    <View style={[styles.leaderboardItem, isTop && styles.topLeaderboardItem]}>
      {isTop && (
        <View style={styles.topBadgeIcon}>
           <MaterialIcons name="emoji-events" size={60} color={COLORS.yellow} style={{ opacity: 0.1 }} />
        </View>
      )}
      
      <View style={styles.rankContainer}>
        <Text style={[
          styles.rankText, 
          rank === 1 ? { color: COLORS.yellow } : 
          rank === 2 ? { color: '#9ca3af' } : 
          rank === 3 ? { color: '#c2410c' } : 
          { color: COLORS.textMuted, fontSize: 14 }
        ]}>
          {rank}
        </Text>
      </View>

      <View style={styles.avatarContainer}>
        <Image source={{ uri: avatar }} style={[styles.avatar, isTop && { width: 48, height: 48, borderColor: COLORS.yellow }]} />
        {isTop && (
          <View style={styles.topBadge}>
            <Text style={styles.topBadgeText}>TOP 1</Text>
          </View>
        )}
      </View>

      <View style={styles.infoContainer}>
        <View style={styles.nameRow}>
          <Text style={[styles.nameText, isTop && { color: COLORS.yellowText }]} numberOfLines={1}>{name}</Text>
        </View>
        <View style={styles.roiRow}>
          <Text style={styles.roiLabel}>ROI</Text>
          <Text style={[styles.roiValue, isTop && { fontSize: 16 }]}>{roi}</Text>
        </View>
      </View>

      <TouchableOpacity>
        <MaterialIcons name="star-border" size={24} color={COLORS.textMuted} />
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.copyButton, isSubscribed ? styles.copyButtonSubscribed : styles.copyButtonUnsubscribed]}
        onPress={() => setIsSubscribed(!isSubscribed)}
      >
        <Text style={styles.copyButtonText}>{isSubscribed ? '已copy' : 'Copy'}</Text>
      </TouchableOpacity>
    </View>
  );
};

const OverviewTabContent = ({ onMorePress }: { onMorePress: () => void }) => {
  const { width: windowWidth } = useWindowDimensions();
  const [timeFilter, setTimeFilter] = React.useState('近一周');
  const [hiddenTraders, setHiddenTraders] = React.useState<string[]>([]);

  const toggleTrader = (name: string) => {
    setHiddenTraders(prev => 
      prev.includes(name) 
        ? prev.filter(n => n !== name)
        : [...prev, name]
    );
  };

  // Mock Chart Data
  const rawTraders = [
    {
      name: '本组合',
      color: COLORS.primary,
      avatar: 'https://randomuser.me/api/portraits/men/85.jpg',
      data: [
        { date: '10-21', value: 20 },
        { date: '10-22', value: 35 },
        { date: '10-23', value: 55 },
        { date: '10-24', value: 50 },
        { date: '10-25', value: 70 },
        { date: '10-26', value: 85 },
        { date: '10-27', value: 90 },
        { date: '10-28', value: 80 },
        { date: '10-29', value: 95 },
        { date: '10-30', value: 85 },
        { date: '10-31', value: 100 },
      ]
    },
    {
      name: 'Trader A',
      color: '#3b82f6',
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
      data: [
        { date: '10-21', value: 10 },
        { date: '10-22', value: 25 },
        { date: '10-23', value: 40 },
        { date: '10-24', value: 35 },
        { date: '10-25', value: 60 },
        { date: '10-26', value: 75 },
        { date: '10-27', value: 60 },
        { date: '10-28', value: 70 },
        { date: '10-29', value: 85 },
        { date: '10-30', value: 75 },
        { date: '10-31', value: 90 },
      ]
    },
    {
      name: 'Trader B',
      color: COLORS.yellow,
      avatar: 'https://randomuser.me/api/portraits/men/44.jpg',
      data: [
        { date: '10-21', value: 30 },
        { date: '10-22', value: 45 },
        { date: '10-23', value: 35 },
        { date: '10-24', value: 55 },
        { date: '10-25', value: 40 },
        { date: '10-26', value: 65 },
        { date: '10-27', value: 50 },
        { date: '10-28', value: 60 },
        { date: '10-29', value: 55 },
        { date: '10-30', value: 70 },
        { date: '10-31', value: 80 },
      ]
    },
    {
      name: 'Trader C',
      color: '#f97316', // orange-500
      avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
      data: [
        { date: '10-21', value: 15 },
        { date: '10-22', value: 20 },
        { date: '10-23', value: 30 },
        { date: '10-24', value: 45 },
        { date: '10-25', value: 50 },
        { date: '10-26', value: 60 },
        { date: '10-27', value: 55 },
        { date: '10-28', value: 65 },
        { date: '10-29', value: 70 },
        { date: '10-30', value: 80 },
        { date: '10-31', value: 85 },
      ]
    },
    {
      name: 'Trader D',
      color: '#8b5cf6', // violet-500
      avatar: 'https://randomuser.me/api/portraits/women/65.jpg',
      data: [
        { date: '10-21', value: 50 },
        { date: '10-22', value: 45 },
        { date: '10-23', value: 40 },
        { date: '10-24', value: 30 },
        { date: '10-25', value: 20 },
        { date: '10-26', value: 25 },
        { date: '10-27', value: 15 },
        { date: '10-28', value: 10 },
        { date: '10-29', value: 5 },
        { date: '10-30', value: 0 },
        { date: '10-31', value: -10 },
      ]
    },
    {
      name: 'Trader E',
      color: '#ec4899', // pink-500
      avatar: 'https://randomuser.me/api/portraits/men/12.jpg',
      data: [
        { date: '10-21', value: 25 },
        { date: '10-22', value: 30 },
        { date: '10-23', value: 45 },
        { date: '10-24', value: 40 },
        { date: '10-25', value: 55 },
        { date: '10-26', value: 65 },
        { date: '10-27', value: 70 },
        { date: '10-28', value: 60 },
        { date: '10-29', value: 75 },
        { date: '10-30', value: 85 },
        { date: '10-31', value: 95 },
      ]
    }
  ];

  const traders = React.useMemo(() => {
    let currentTraders = rawTraders;
    if (timeFilter === '近一周') {
      currentTraders = rawTraders.map(t => ({
        ...t,
        data: t.data.slice(-7)
      }));
    }

    // Normalize each trader's data so start is 0%
    return currentTraders.map(t => {
      if (t.data.length > 0) {
        const startValue = t.data[0].value;
        return {
          ...t,
          data: t.data.map(d => ({ ...d, value: d.value - startValue }))
        };
      }
      return t;
    });
  }, [timeFilter]);

  // Calculate Min/Max Y dynamically
  const { yAxisMax, yAxisMin, yRange } = React.useMemo(() => {
    const allValues = traders.flatMap(t => t.data.map(d => d.value));
    const dataMax = Math.max(...allValues);
    const dataMin = Math.min(...allValues);
    
    // Add ~10% padding
    const range = dataMax - dataMin;
    const padding = range * 0.1 || 5;
    
    const max = Math.ceil(dataMax + padding);
    const min = Math.floor(dataMin - padding);
    
    return { yAxisMax: max, yAxisMin: min, yRange: max - min };
  }, [traders]);

  const chartAreaWidth = windowWidth - 64 - 40; // 16*2 margin + 16*2 padding + 40 yAxis
  const dataLength = traders[0].data.length;
  
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
  <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
    {/* Statistics Section */}
    <View style={styles.statsContainer}>
      <View style={styles.statItem}>
        <Text style={styles.statValue}>36</Text>
        <Text style={styles.statLabelSmall}>今日信号</Text>
      </View>
      <View style={styles.statItem}>
        <Text style={styles.statValue}>5</Text>
        <Text style={styles.statLabelSmall}>活跃博主</Text>
      </View>
      <View style={styles.statItem}>
        <Text style={styles.statValue}>16</Text>
        <Text style={styles.statLabelSmall}>交易币种</Text>
      </View>
    </View>

    {/* Profit Trend Section */}
    <View style={styles.card}>
      <Text style={[styles.sectionTitle, { marginBottom: 16 }]}>收益走势</Text>
      
      <View style={styles.timeFilter}>
        {['近一周', '近一月', '近三月', '创建至今'].map((filter) => (
          <TouchableOpacity 
            key={filter}
            style={timeFilter === filter ? styles.timeBtnActive : styles.timeBtn}
            onPress={() => setTimeFilter(filter)}
          >
            <Text style={timeFilter === filter ? styles.timeBtnTextActive : styles.timeBtnText}>{filter}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start', gap: 12, marginBottom: 12 }}>
        {traders.map((trader, index) => {
          const isHidden = hiddenTraders.includes(trader.name);
          return (
            <TouchableOpacity 
              key={index} 
              style={[styles.chartLegend, { opacity: isHidden ? 0.5 : 1 }]}
              onPress={() => toggleTrader(trader.name)}
            >
              <View style={[styles.legendColor, { backgroundColor: trader.color }]} />
              <Text style={styles.legendText}>{trader.name}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.chartHeader}>
        <Text style={styles.chartLabel}>累计收益率(%)</Text>
      </View>

      <View style={styles.chartContainer}>
        <View style={styles.yAxis}>
          {/* Max Label */}
          <Text style={[styles.axisText, { position: 'absolute', top: getY(yAxisMax) - 6 }]}>
            {yAxisMax}%
          </Text>

          {/* Positive Intermediate Labels */}
          {yAxisMax > 0 && (
            <>
              <Text style={[styles.axisText, { position: 'absolute', top: getY(positiveStep2) - 6 }]}>
                {positiveStep2}%
              </Text>
              <Text style={[styles.axisText, { position: 'absolute', top: getY(positiveStep1) - 6 }]}>
                {positiveStep1}%
              </Text>
            </>
          )}
          
          {/* Zero Label */}
          {yAxisMin < 0 && yAxisMax > 0 && (
            <Text style={[styles.axisText, { position: 'absolute', top: getY(0) - 6, color: COLORS.textMain }]}>
              0%
            </Text>
          )}

          {/* Negative Intermediate Labels */}
          {yAxisMin < 0 && (
            <>
              <Text style={[styles.axisText, { position: 'absolute', top: getY(negativeStep1) - 6 }]}>
                {negativeStep1}%
              </Text>
              <Text style={[styles.axisText, { position: 'absolute', top: getY(negativeStep2) - 6 }]}>
                {negativeStep2}%
              </Text>
            </>
          )}
          
          {/* Min Label */}
          <Text style={[styles.axisText, { position: 'absolute', top: getY(yAxisMin) - 6 }]}>
            {yAxisMin}%
          </Text>
        </View>
        
        <ChartErrorBoundary>
          <View style={styles.chartArea}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flex: 1 }}>
              <View style={{ width: chartWidth, height: chartHeight }}>
                <Svg height="100%" width="100%" viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
                  <Defs>
                    <LinearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                      <Stop offset="0%" stopColor={COLORS.primary} stopOpacity="0.3" />
                      <Stop offset="100%" stopColor={COLORS.primary} stopOpacity="0" />
                    </LinearGradient>
                  </Defs>

                  {/* Zero Line */}
                  {yAxisMin < 0 && (
                    <Path
                      d={`M 0 ${getY(0)} L ${chartWidth} ${getY(0)}`}
                      stroke={COLORS.textMuted}
                      strokeWidth="1"
                      strokeDasharray="5, 5"
                      opacity="0.3"
                    />
                  )}

                  {/* Lines */}
                  {traders.map((trader, index) => {
                    if (hiddenTraders.includes(trader.name)) return null;
                    return (
                      <Path 
                        key={`line-${index}`}
                        d={generatePath(trader.data)} 
                        fill="none" 
                        stroke={trader.color}
                        strokeWidth="3" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                      />
                    );
                  })}

                  {/* Avatars at the end of each line */}
                  {traders.map((trader, index) => {
                    if (hiddenTraders.includes(trader.name)) return null;
                    const lastPoint = trader.data[trader.data.length - 1];
                    const i = trader.data.length - 1;
                    const x = i * xStep;
                    const y = getY(lastPoint.value);
                    
                    return (
                      <G key={`avatar-${index}`}>
                        {/* Avatar Border */}
                        <Circle
                          cx={x}
                          cy={y}
                          r={14}
                          fill={COLORS.surface}
                          stroke={trader.color}
                          strokeWidth={2}
                        />
                        
                        {/* Avatar Image with ClipPath */}
                        <Defs>
                          <ClipPath id={`clip-trader-${index}`}>
                            <Circle cx={x} cy={y} r={12} />
                          </ClipPath>
                        </Defs>
                        <SvgImage
                          x={x - 12}
                          y={y - 12}
                          width={24}
                          height={24}
                          href={{ uri: trader.avatar }}
                          clipPath={`url(#clip-trader-${index})`}
                          preserveAspectRatio="xMidYMid slice"
                        />
                      </G>
                    );
                  })}
                  
                  {/* X Axis Labels inside ScrollView */}
                  {traders[0].data.map((point, i) => (
                    <SvgText
                      key={`label-${i}`}
                      x={i * xStep}
                      y={chartHeight - 5}
                      fill={COLORS.textMuted}
                      fontSize="10"
                      textAnchor={i === 0 ? "start" : i === traders[0].data.length - 1 ? "end" : "middle"}
                    >
                      {point.date}
                    </SvgText>
                  ))}
                </Svg>
              </View>
            </ScrollView>
          </View>
        </ChartErrorBoundary>
      </View>
    </View>

    {/* Leaderboard Section */}
    <View style={{ paddingHorizontal: 16, paddingBottom: 20, paddingTop: 24 }}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { fontSize: 14, fontWeight: '600' }]}>排行榜（近一周）</Text>
        <TouchableOpacity onPress={onMorePress}>
          <Text style={{ color: COLORS.textMuted, fontSize: 14 }}>更多 {'>'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.leaderboardList}>
        <LeaderboardItem 
          rank={1}
          name="Average-Moon..."
          roi="+107.70%"
          avatar="https://lh3.googleusercontent.com/aida-public/AB6AXuB_YJoFtmSgqjEYM2tsRwwH6OcbxEzQ0rOaBPiJTZ4kKmIvaq0Whpfn4QNXrDoxYbqYTbsxrudPSci0vqyxrfvX5NmUtQlekhCyT7-wQDutN-2ZxMOpAvUeEwTkwiZt1NsTnXYQeiDjq55arRKjL8FCa3t0cxXr0bvH7NV1Wo8KBsbV8ddGD1USqDJU2_1BtHf6qmsHmXN0_TGvvZFwElGBKxyPrp7TnUPf9H6emqbfpZBteQl9GvFy3Hm8KvITkQ6I01WLW7MLXQ"
          isTop={true}
        />
        <LeaderboardItem 
          rank={2}
          name="BeyondHJJ"
          roi="+32.26%"
          avatar="https://lh3.googleusercontent.com/aida-public/AB6AXuBzZa78G7eCvQ3Qfir53Hh3en0nyDyqTSQLbXpOwuGfgmNT5K8kK94gFtLZ9c4QsAjTMvLKoJG-ZohYppqv5hWBKiP8tms6JOyEYTUPB-D0glDcbsQTF4Ba9k1opWJScsAodRQkxc1KcoUOmvSt6CsC8FvXUvDGJruHwegzMFzTaFLM_eF5JWZK8HPtqhNbHRWnliPvTu693N4wpz-ZmEZFfhYTq1BUb9135nVBVxM59E0nYYPndbBJBhQkWX9zheGiN9QcioZyIg"
        />
        <LeaderboardItem 
          rank={3}
          name="zh138"
          roi="+7.56%"
          avatar="https://lh3.googleusercontent.com/aida-public/AB6AXuCA6jm-quFFL4rGgnuqOTX6aa7ja62sdDdo3axzhQrnFedupfbhBgf-e6uQk2UJW6Fw_P6j3rE-Chdj1ROGQUydNYpLFiDKTnaRkds9OmErntL2HdtacO_UqSoB5ba2135lFtLoHiQHxZEScqx0miCEfAjnfV5_KSl5QyMd8yLi2gw_PLYz0wZiLCXKt2wdodUjdjvSKNgWzPDtwupJElJqhtE9RKBIQ9kS_wrdn6X3Mco8KWrf3EmG7376RFVDEW_ffsBfco13qw"
        />
        <LeaderboardItem 
          rank={4}
          name="CryptoKing"
          roi="+5.12%"
          avatar="https://lh3.googleusercontent.com/aida-public/AB6AXuDVXm3a-fpXh5zQN3sNH5-qNsQXC7nIZEIBDBl5DS-_f8dCCU7lM0nnHc9NopUGzSoFU82lsG915VOGMfQ5OqF_w12XEnoc66ZsMChKilE-8sn7rt5TSjarqbfC_-RnU6WIarPlvl6UQOjBUhsWZVRewlBxOyqDifftOdQ7nbs-SYQf8ueAclFocUQNE1f3s3iPwU89cVXi5pVvpkb4UrIO9BvmlgYP5vECM0CfXkb_DG9zLwr140WUke8skQb38aPzkxGic2604A"
        />
        <LeaderboardItem 
          rank={5}
          name="EtherWhale"
          roi="+4.80%"
          avatar="https://lh3.googleusercontent.com/aida-public/AB6AXuChG2uLZ1MGBu_JRnsIhReRPPHSGAWTi7TRNPzW89GNTfSDJHzQCj5YF8CEbcvYGQAJcKFVuKWXTwvNOuWYgsHeb81R3G3mvkRN9qhax5qRcsSEx-D7XrfphssVslqZ_ATs93L10qAIHIaalReVoPZ5r8e4BhdBeQU4fhaJIIHQ_QVUERg1SAXP-wiUbUt5rKMcEod6NUnJSy3WvohDdC8BwYZ6ppsr3ifIxubBxcpIZLg2I46Ub8yPmUxgza3gZ4YyRvkgRVoC6w"
        />
      </View>
    </View>
  </ScrollView>
  );
};

interface CopyTabContentProps {
  activeFilters: string[];
  setActiveFilters: (filters: string[]) => void;
}

const CopyTabContent = ({ activeFilters, setActiveFilters }: CopyTabContentProps) => {
  const router = useRouter();
  const filters = ['综合', '近一周收益', '近一月收益', '已订阅', '已关注'];

  const handleFilterPress = (filter: string) => {
    if (filter === '综合') {
      setActiveFilters(['综合']);
      return;
    }

    let newFilters = [...activeFilters];
    if (newFilters.includes('综合')) {
      newFilters = newFilters.filter(f => f !== '综合');
    }

    if (newFilters.includes(filter)) {
      newFilters = newFilters.filter(f => f !== filter);
    } else {
      newFilters.push(filter);
    }

    if (newFilters.length === 0) {
      setActiveFilters(['综合']);
    } else {
      setActiveFilters(newFilters);
    }
  };

  const getRoiLabel = () => {
    if (activeFilters.includes('近一周收益')) return 'Lead trader 7D PnL';
    if (activeFilters.includes('近一月收益')) return 'Lead trader 30D PnL';
    return 'Lead trader 90D PnL';
  };
  
  return (
  <View style={{ flex: 1 }}>
    {/* Fixed Filter Bar */}
    <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, gap: 8, backgroundColor: COLORS.background, borderBottomWidth: 1, borderBottomColor: COLORS.border }}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }} style={{ flex: 1 }}>
        {filters.map((filter) => {
          const isActive = activeFilters.includes(filter);
          return (
          <TouchableOpacity 
            key={filter} 
            style={{
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 16,
              backgroundColor: isActive ? COLORS.surfaceLight : 'transparent',
              borderWidth: 1,
              borderColor: isActive ? COLORS.primary : COLORS.border,
            }}
            onPress={() => handleFilterPress(filter)}
          >
            <Text style={{
              color: isActive ? COLORS.primary : COLORS.textMuted,
              fontSize: 12,
              fontWeight: isActive ? 'bold' : 'normal',
            }}>{filter}</Text>
          </TouchableOpacity>
        )})}
      </ScrollView>
      <TouchableOpacity style={{ padding: 4 }} onPress={() => router.push('/search')}>
        <MaterialIcons name="search" size={24} color={COLORS.textMuted} />
      </TouchableOpacity>
    </View>

    {/* Scrollable Content */}
    <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 120 }}>
      <View style={styles.traderList}>
      <TraderCard 
        roiLabel={getRoiLabel()} 
        name="zh138"
        avatar="https://lh3.googleusercontent.com/aida-public/AB6AXuCA6jm-quFFL4rGgnuqOTX6aa7ja62sdDdo3axzhQrnFedupfbhBgf-e6uQk2UJW6Fw_P6j3rE-Chdj1ROGQUydNYpLFiDKTnaRkds9OmErntL2HdtacO_UqSoB5ba2135lFtLoHiQHxZEScqx0miCEfAjnfV5_KSl5QyMd8yLi2gw_PLYz0wZiLCXKt2wdodUjdjvSKNgWzPDtwupJElJqhtE9RKBIQ9kS_wrdn6X3Mco8KWrf3EmG7376RFVDEW_ffsBfco13qw"
        followers={46}
        maxFollowers={100}
        roi="+7.56%"
        pnl="+$1,968.88"
        winRate="63.10%"
        aum="$7,029.75"
        days={290}
        coins={[
          "https://lh3.googleusercontent.com/aida-public/AB6AXuATVNwivtQOZ2npc_w1PrcrX_4y17f4sOiNkn0PcY8zqp0YLkQ3QuxIkuDHNbTjM1ZyrnwY3GKd7UVSYfoETg68d3DNq3yliS1uwFDzri7UqYgzB5fN2Ju5KYY8plwkhuhEWVym03IBsLlyKhgTloiJKTujcHXIe_z-lpDvnkbxcYGocB5nfG-PQGKRLQ1b7pknYTUavPCwz1iU0-cRBaTMqb597A3OgbOCuT2YYwBSVl3V5yGQaMdwr6lBh9K9vzREuJyuOGn7Tg",
          "https://lh3.googleusercontent.com/aida-public/AB6AXuBqVLgtNIEpUr5EnOPS_CgkITlq0vVjaigO9jnxDPyQnAokTkWkEOTGXrlpCYF9sNvRwze7xjCTLCxaNfb3DiTbcvBgZhA5rJt4lyW5zxbfuPyai7ANHCgpXluqDnWr9ATykGdJ9X5sTLPyJND5T5bvWN7ciyMIvkT-OAUvZG8khWTSrhiGjPrSs-AL0ZpdNIzo2pRweRiGqFRbsmXXfg4024-qe1haFHvijyQhWvK--a2M_RHLjsnDeVusKni_aeEZwEa9cuvmxA",
          "https://lh3.googleusercontent.com/aida-public/AB6AXuAEcAV67993OCt0DPtM2p8O2VOufk16pTKp8rXdxYzZU8G7G59l0CDW4oL01HveVAtNT8Kh31Z9GKhffkuQDVAasrQHuE6ebVN23WctH5f7nUebYYIynGAqCZBHm1obLP8vwJwmcWrJZWa6EMfh2j2DJYl9_nwAh14I6lW2R3ZM_WibvUnRtI2a_v96J6JPW2yEh_yFxhIxz-NjuG02m8tjKWN6rti6CP0T5pyv_yhFsEtAHivwBNN7IhN3qg66P95nZngpHi5fcQ"
        ]}
        chartPath="M0,35 Q10,32 20,30 T40,20 T60,25 T80,10 L100,20"
        statusColor={COLORS.yellow}
        onPress={() => router.push('/trader/detail')}
      />
      <TraderCard 
        roiLabel={getRoiLabel()}
        name="BeyondHJJ"
        avatar="https://lh3.googleusercontent.com/aida-public/AB6AXuBzZa78G7eCvQ3Qfir53Hh3en0nyDyqTSQLbXpOwuGfgmNT5K8kK94gFtLZ9c4QsAjTMvLKoJG-ZohYppqv5hWBKiP8tms6JOyEYTUPB-D0glDcbsQTF4Ba9k1opWJScsAodRQkxc1KcoUOmvSt6CsC8FvXUvDGJruHwegzMFzTaFLM_eF5JWZK8HPtqhNbHRWnliPvTu693N4wpz-ZmEZFfhYTq1BUb9135nVBVxM59E0nYYPndbBJBhQkWX9zheGiN9QcioZyIg"
        followers={15}
        maxFollowers={100}
        roi="+32.26%"
        pnl="+$9,567.86"
        winRate="57.50%"
        aum="$3,432.94"
        days={397}
        coins={[
          "https://lh3.googleusercontent.com/aida-public/AB6AXuB5BEa1eJ7RTyut5QDtbRnbcjJ5-mr3UyskhB1e5NMl50E8qS7We3bsUKyEIMd9uUgS6IzSdSYh38DU1f-CM1mrSVjDtKcr12vjB1N11w_IRwwb_qSeI7L7Au615sx-FmgHAe4pGkm5QGehKViamzP5_gH42rlQLtmbXs_KrVpfLkT_t4WSltoJsxFY8cPVAoSTwB2hjJW6pB5oiGWvNilSYsbx7hilCTwU9sm18uqe-77YRHFJXuW650Dsih0mOx40On2uZoG_mQ",
          "https://lh3.googleusercontent.com/aida-public/AB6AXuDzQvuheaDEXO_pAahI2DC6OOoQh-GT4prgsNS4pMaa6kQ4GMH73HAbe3u1TlhasjEGVWIsF2UU8fuYTyv8R8dzueZC7CV4duhY2IdCp2JPldm1JhcnlB3TpdOL0C8DJsfs7YumHYJdDJxwKN6UsQpCwWksP6SYJDG1TK5jgvFMP2R8bPBy5PCiidhBsV66AOGKidRcrIknZBDi4bly-ZFhdSivj0pgi5Mu7paYKW66riciXUrk_eS6IRo0v3Cu7zsYrkMezFfjfQ",
          "https://lh3.googleusercontent.com/aida-public/AB6AXuBehiWHC50o_Y1I-9WK0ZLzs8_cE6ScQ3TJ1E5JRRZdnO80jNAB8sfhY_z4oBej5b7eciccGxm2UJ2wFkO4dI6lhot4C2P9FkdufN-NY_1TSQpxu96I4DZH7zlss4qPS2MCoYrUR9EFcaQHdeOo3EovWDe664NAuYPyyfVI_PsCd83nZGblwen4iHNSU3QyI6GtaFdOzYEIjlTmFaiBrNqwe8ykvFxsUVHfZT3bN-3IC1w9wdCpyrbohukhiWLvlsp2bveDEVvSpA"
        ]}
        chartPath="M0,30 Q15,32 25,25 T45,28 T65,15 T85,25 L100,18"
        statusColor={COLORS.yellow}
        onPress={() => router.push('/trader/detail')}
      />
      <TraderCard 
        name="Average-Moon-Cypress"
        avatar="https://lh3.googleusercontent.com/aida-public/AB6AXuB_YJoFtmSgqjEYM2tsRwwH6OcbxEzQ0rOaBPiJTZ4kKmIvaq0Whpfn4QNXrDoxYbqYTbsxrudPSci0vqyxrfvX5NmUtQlekhCyT7-wQDutN-2ZxMOpAvUeEwTkwiZt1NsTnXYQeiDjq55arRKjL8FCa3t0cxXr0bvH7NV1Wo8KBsbV8ddGD1USqDJU2_1BtHf6qmsHmXN0_TGvvZFwElGBKxyPrp7TnUPf9H6emqbfpZBteQl9GvFy3Hm8KvITkQ6I01WLW7MLXQ"
        followers={1102}
        maxFollowers={1200}
        roi="+107.70%"
        pnl="+$205,283.56"
        winRate="82.40%"
        aum="$1,234,029.75"
        days={120}
        coins={[
          "https://lh3.googleusercontent.com/aida-public/AB6AXuDVXm3a-fpXh5zQN3sNH5-qNsQXC7nIZEIBDBl5DS-_f8dCCU7lM0nnHc9NopUGzSoFU82lsG915VOGMfQ5OqF_w12XEnoc66ZsMChKilE-8sn7rt5TSjarqbfC_-RnU6WIarPlvl6UQOjBUhsWZVRewlBxOyqDifftOdQ7nbs-SYQf8ueAclFocUQNE1f3s3iPwU89cVXi5pVvpkb4UrIO9BvmlgYP5vECM0CfXkb_DG9zLwr140WUke8skQb38aPzkxGic2604A",
          "https://lh3.googleusercontent.com/aida-public/AB6AXuChG2uLZ1MGBu_JRnsIhReRPPHSGAWTi7TRNPzW89GNTfSDJHzQCj5YF8CEbcvYGQAJcKFVuKWXTwvNOuWYgsHeb81R3G3mvkRN9qhax5qRcsSEx-D7XrfphssVslqZ_ATs93L10qAIHIaalReVoPZ5r8e4BhdBeQU4fhaJIIHQ_QVUERg1SAXP-wiUbUt5rKMcEod6NUnJSy3WvohDdC8BwYZ6ppsr3ifIxubBxcpIZLg2I46Ub8yPmUxgza3gZ4YyRvkgRVoC6w",
          "https://lh3.googleusercontent.com/aida-public/AB6AXuA8CM29v6kMcf4CybMdBJUcjXNwIIiJ7OsBMwdeW7sf5AavuaMAaAsNJQHgemKu15oAlO9ejkGtdRHfxYaVJrEGGWZlGDm0BT6iSkzZPEeaboaXN5cWf7lYpBxkGEJUeQLUx_NXe9vWMr6AJa6Hso6Tt2zW-YO7DcsKhJHv3uEE1PZy2SHs9ZJOfhPhMgP5PV-EMSg7GhF62CMB3uGgFpIs9GnQC9EAT9dFVEPTW8Ggl-rZV8Pd7l-RxU-rlMsaJEh0iw4fA7PbeQ"
        ]}
        chartPath="M0,38 Q20,35 30,28 T50,20 T70,10 L100,5"
        statusColor="#3b82f6" // blue-500
        onPress={() => router.push('/trader/detail')}
      />
    </View>
    </ScrollView>
  </View>
  );
};

const SignalTabContent = ({ activeFilters, setActiveFilters }: CopyTabContentProps) => {
  const router = useRouter();
  const { user } = useAuth();
  // 暂时隐藏已订阅和已关注筛选器
  const filters = ['全部', '做多', '做空'];
  const [signals, setSignals] = useState<Signal[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 20;

  // 加载信号数据
  useEffect(() => {
    loadSignals(true); // 重新加载时重置
  }, [activeFilters]);

  const loadSignals = async (reset: boolean = false) => {
    try {
      if (reset) {
        setLoading(true);
        setPage(1);
        setHasMore(true);
      } else {
        setLoadingMore(true);
      }

      const currentPage = reset ? 1 : page;
      let data: Signal[] = [];

      // 检查筛选条件
      const hasLong = activeFilters.includes('做多');
      const hasShort = activeFilters.includes('做空');
      const hasSubscribed = activeFilters.includes('已订阅');
      const hasFollowed = activeFilters.includes('已关注');

      // 获取已订阅和已关注的交易员ID
      let subscribedTraderIds: string[] = [];
      let followedTraderIds: string[] = [];
      
      if (hasSubscribed && user?.id) {
        const subscribedTraders = await getSubscribedTraders(user.id);
        subscribedTraderIds = subscribedTraders.map(item => item.trader_id);
      }
      
      if (hasFollowed && user?.id) {
        const followedTraders = await getFollowedTraders(user.id);
        followedTraderIds = followedTraders.map(item => item.trader_id);
      }

      // 根据筛选条件获取信号
      if (hasLong && hasShort) {
        // 同时选择做多和做空，获取两者的并集
        const [longSignals, shortSignals] = await Promise.all([
          SignalService.getSignalsByDirection('long', PAGE_SIZE * currentPage),
          SignalService.getSignalsByDirection('short', PAGE_SIZE * currentPage)
        ]);
        // 合并并去重（基于ID）
        const signalMap = new Map();
        [...longSignals, ...shortSignals].forEach(signal => {
          signalMap.set(signal.id, signal);
        });
        data = Array.from(signalMap.values());
        // 按信号时间倒序排序
        data.sort((a, b) => new Date(b.signal_time).getTime() - new Date(a.signal_time).getTime());
      } else if (hasLong) {
        // 只选择做多
        data = await SignalService.getSignalsByDirection('long', PAGE_SIZE * currentPage);
      } else if (hasShort) {
        // 只选择做空
        data = await SignalService.getSignalsByDirection('short', PAGE_SIZE * currentPage);
      } else {
        // 全部或其他筛选条件
        data = await SignalService.getActiveSignals(PAGE_SIZE * currentPage);
      }

      // 根据已订阅/已关注筛选交易员
      if (hasSubscribed && subscribedTraderIds.length > 0) {
        data = data.filter(signal => subscribedTraderIds.includes(signal.trader_id));
      }
      
      if (hasFollowed && followedTraderIds.length > 0) {
        data = data.filter(signal => followedTraderIds.includes(signal.trader_id));
      }

      // 判断是否还有更多数据
      const hasMoreData = data.length >= PAGE_SIZE * currentPage;
      setHasMore(hasMoreData);

      if (reset) {
        setSignals(data);
      } else {
        // 追加数据并去重
        const existingIds = new Set(signals.map(s => s.id));
        const newSignals = data.filter(s => !existingIds.has(s.id));
        setSignals([...signals, ...newSignals]);
      }

      if (!reset) {
        setPage(currentPage + 1);
      }
    } catch (error) {
      console.error('加载信号失败:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      loadSignals(false);
    }
  };

  const handleFilterPress = (filter: string) => {
    if (filter === '全部') {
      setActiveFilters(['全部']);
      return;
    }

    let newFilters = [...activeFilters];
    if (newFilters.includes('全部')) {
      newFilters = newFilters.filter(f => f !== '全部');
    }

    if (newFilters.includes(filter)) {
      newFilters = newFilters.filter(f => f !== filter);
    } else {
      newFilters.push(filter);
    }

    if (newFilters.length === 0) {
      setActiveFilters(['全部']);
    } else {
      setActiveFilters(newFilters);
    }
  };

  const getRoiLabel = () => {
    if (activeFilters.includes('近一周收益')) return 'Lead trader 7D PnL';
    if (activeFilters.includes('近一月收益')) return 'Lead trader 30D PnL';
    return 'Lead trader 90D PnL';
  };
  
  return (
  <View style={{ flex: 1 }}>
    {/* Fixed Filter Bar */}
    <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, gap: 8, backgroundColor: COLORS.background, borderBottomWidth: 1, borderBottomColor: COLORS.border }}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }} style={{ flex: 1 }}>
        {filters.map((filter) => {
          const isActive = activeFilters.includes(filter);
          return (
          <TouchableOpacity 
            key={filter} 
            style={{
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 16,
              backgroundColor: isActive ? COLORS.surfaceLight : 'transparent',
              borderWidth: 1,
              borderColor: isActive ? COLORS.primary : COLORS.border,
            }}
            onPress={() => handleFilterPress(filter)}
          >
            <Text style={{
              color: isActive ? COLORS.primary : COLORS.textMuted,
              fontSize: 12,
              fontWeight: isActive ? 'bold' : 'normal',
            }}>{filter}</Text>
          </TouchableOpacity>
        )})}
      </ScrollView>
      <TouchableOpacity style={{ padding: 4 }} onPress={() => router.push('/search')}>
        <MaterialIcons name="search" size={24} color={COLORS.textMuted} />
      </TouchableOpacity>
    </View>

    {/* Scrollable Content */}
    <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 120 }}>
      <View style={styles.traderList}>
      {loading ? (
        <View style={{ padding: 40, alignItems: 'center' }}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : signals.length === 0 ? (
        <View style={{ padding: 40, alignItems: 'center' }}>
          <Text style={{ color: COLORS.textMuted }}>暂无信号数据</Text>
        </View>
      ) : (
        <>
          {signals.map((signal) => {
            // Supabase关联查询可能返回数组，需要处理
            const trader = Array.isArray(signal.trader) ? signal.trader[0] : signal.trader;
            
            // 调试日志 - 帮助排查iOS头像显示问题
            if (!trader?.avatar_url) {
              console.log('Missing trader data for signal:', signal.id);
              console.log('Signal trader:', JSON.stringify(signal.trader));
            }
            
            return (
              <SignalCard 
                key={signal.id}
                traderId={signal.trader_id}
                name={trader?.name || '未知交易员'}
                avatar={trader?.avatar_url || 'https://via.placeholder.com/100'}
                description={trader?.description || ''}
                currency={signal.currency}
                entry={signal.entry_price}
                direction={signal.direction}
                stopLoss={signal.stop_loss}
                takeProfit={signal.take_profit}
                time={SignalService.formatSignalTime(signal.signal_time)}
                signalCount={trader?.signal_count || 0}
                onPress={() => router.push('/trader/detail')}
                onSubscribe={() => {}}
                onStatsChange={() => {
                  // 当关注/订阅状态改变时，重新加载信号列表以更新筛选结果
                  if (activeFilters.includes('已订阅') || activeFilters.includes('已关注')) {
                    loadSignals(true);
                  }
                }}
              />
            );
          })}
          
          {/* 加载更多按钮/指示器 */}
          {hasMore && (
            <TouchableOpacity 
              style={{ 
                padding: 20, 
                alignItems: 'center'
              }}
              onPress={handleLoadMore}
              disabled={loadingMore}
            >
              {loadingMore ? (
                <ActivityIndicator size="small" color={COLORS.textMain} />
              ) : (
                <Text style={{ color: COLORS.textMain, fontSize: 14 }}>
                  加载更多
                </Text>
              )}
            </TouchableOpacity>
          )}

          {!hasMore && signals.length > 0 && (
            <View style={{ padding: 20, alignItems: 'center' }}>
              <Text style={{ color: COLORS.textMuted, fontSize: 12 }}>
                已加载全部信号
              </Text>
            </View>
          )}
        </>
      )}
    </View>
    </ScrollView>
  </View>
  );
};

export default function HomePage() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { width: windowWidth } = useWindowDimensions();
  const [containerWidth, setContainerWidth] = React.useState(windowWidth);
  const [activeTab, setActiveTab] = React.useState<'overview' | 'copy' | 'signal'>('overview');
  const scrollViewRef = React.useRef<ScrollView>(null);
  const [heights, setHeights] = React.useState({ overview: 0, copy: 0, signal: 0 });
  const [activeFilters, setActiveFilters] = React.useState<string[]>(['综合']);
  const isScrollingRef = React.useRef(false); // 用于标记是否正在滚动

  const handleMorePress = () => {
    handleTabPress('copy');
    setActiveFilters(['近一周收益']);
  };

  React.useEffect(() => {
    if (activeTab === 'signal') {
      setActiveFilters(['全部']);
    } else if (activeTab === 'copy') {
      setActiveFilters(['综合']);
    }
  }, [activeTab]);

  React.useEffect(() => {
    if (params.tab === 'copy') {
      handleTabPress('copy');
      if (params.filter) {
        setActiveFilters([params.filter as string]);
      }
    }
  }, [params.tab, params.filter]);

  const updateTabFromScroll = (offsetX: number) => {
    // 如果是手动触发的滚动动画，不更新状态
    if (isScrollingRef.current) {
      return;
    }

    const index = Math.round(offsetX / containerWidth);
    const newTab = index === 0 ? 'overview' : index === 1 ? 'signal' : 'copy';
    if (newTab !== activeTab) {
      setActiveTab(newTab);
    }
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    updateTabFromScroll(offsetX);
  };

  const handleScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    updateTabFromScroll(offsetX);
  };

  const handleTabPress = (tab: 'overview' | 'copy' | 'signal') => {
    setActiveTab(tab);
    isScrollingRef.current = true; // 标记正在滚动
    
    let x = 0;
    if (tab === 'signal') x = containerWidth;
    if (tab === 'copy') x = containerWidth * 2;

    scrollViewRef.current?.scrollTo({
      x,
      animated: true,
    });

    // 滚动动画完成后重置标记（适配不同平台）
    setTimeout(() => {
      isScrollingRef.current = false;
    }, 350);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <AddToHomeScreen />
      
      {/* Fixed Sticky Nav Tabs */}
      <View style={styles.stickyNavTabs}>
        <View style={styles.navBarContent}>
          <View style={styles.navTabs}>
            <TouchableOpacity 
              style={styles.tabItem} 
              onPress={() => handleTabPress('overview')}
            >
              <Text style={activeTab === 'overview' ? styles.tabTextActive : styles.tabText}>Overview</Text>
              {activeTab === 'overview' && <View style={styles.tabIndicator} />}
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.tabItem}
              onPress={() => handleTabPress('signal')}
            >
              <Text style={activeTab === 'signal' ? styles.tabTextActive : styles.tabText}>Signals</Text>
              {activeTab === 'signal' && <View style={styles.tabIndicator} />}
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.tabItem}
              onPress={() => handleTabPress('copy')}
            >
              <Text style={activeTab === 'copy' ? styles.tabTextActive : styles.tabText}>Traders</Text>
              {activeTab === 'copy' && <View style={styles.tabIndicator} />}
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Scrollable Content */}
      <View style={{ flex: 1 }} onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}>
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={400}
          onMomentumScrollEnd={handleScrollEnd}
          onScrollEndDrag={handleScrollEnd}
          nestedScrollEnabled={true}
          directionalLockEnabled={true}
          style={{ flex: 1 }}
        >
          <View style={{ width: containerWidth, height: '100%' }} onLayout={(e) => {
            const height = e.nativeEvent.layout.height;
            setHeights(h => ({ ...h, overview: height }));
          }}>
            <OverviewTabContent onMorePress={handleMorePress} />
          </View>
          <View style={{ width: containerWidth, height: '100%' }} onLayout={(e) => {
            const height = e.nativeEvent.layout.height;
            setHeights(h => ({ ...h, signal: height }));
          }}>
            <SignalTabContent activeFilters={activeFilters} setActiveFilters={setActiveFilters} />
          </View>
          <View style={{ width: containerWidth, height: '100%' }} onLayout={(e) => {
            const height = e.nativeEvent.layout.height;
            setHeights(h => ({ ...h, copy: height }));
          }}>
            <CopyTabContent activeFilters={activeFilters} setActiveFilters={setActiveFilters} />
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  headerTopContainer: {
    backgroundColor: COLORS.background,
    paddingTop: 16,
  },
  stickyNavTabs: {
    backgroundColor: COLORS.background,
    zIndex: 100,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  userAvatarContainer: {
    position: 'relative',
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: COLORS.surface,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    backgroundColor: COLORS.primary,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.background,
  },
  userDetails: {
    justifyContent: 'center',
  },
  userNameBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  userName: {
    color: COLORS.textMain,
    fontWeight: 'bold',
    fontSize: 14,
  },
  userBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },
  vipBadge: {
    backgroundColor: 'rgba(234, 179, 8, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  vipText: {
    color: COLORS.yellowText,
    fontSize: 10,
    fontWeight: 'bold',
  },
  uidText: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: '500',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconBtn: {
    padding: 4,
  },
  navBarContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: 16,
  },
  navTabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 32,
    alignItems: 'flex-end',
  },
  searchBtn: {
    padding: 4,
  },
  tabItem: {
    paddingBottom: 12,
    position: 'relative',
  },
  tabTextActive: {
    color: COLORS.textMain,
    fontWeight: '600',
    fontSize: 20,
  },
  tabText: {
    color: COLORS.textMuted,
    fontWeight: '500',
    fontSize: 16,
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: COLORS.textMain,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
    gap: 24,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginHorizontal: 16,
  },
  sectionTitle: {
    color: COLORS.textMain,
    fontSize: 18,
    fontWeight: 'bold',
  },
  timeFilter: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.4)',
    padding: 4,
    borderRadius: 8,
    marginBottom: 24,
  },
  timeBtn: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeBtnActive: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  timeBtnText: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: '500',
  },
  timeBtnTextActive: {
    color: COLORS.textMain,
    fontSize: 12,
    fontWeight: 'bold',
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  chartLabel: {
    color: COLORS.textMuted,
    fontSize: 12,
  },
  chartLegend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendColor: {
    width: 10,
    height: 2,
    backgroundColor: COLORS.primary,
    borderRadius: 1,
  },
  legendText: {
    color: COLORS.textMuted,
    fontSize: 12,
  },
  chartContainer: {
    flexDirection: 'row',
    height: 200,
    width: '100%',
  },
  yAxis: {
    position: 'relative',
    width: 40,
    height: '100%',
  },
  axisText: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontWeight: '500',
  },
  chartArea: {
    flex: 1,
    position: 'relative',
    borderLeftWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(39, 39, 42, 0.5)',
  },
  gridLine: {
    width: '100%',
    height: 1,
    backgroundColor: 'rgba(229, 231, 235, 0.1)',
    marginBottom: (256 - 32) / 4, // Approximate spacing
    borderStyle: 'dashed', // React Native doesn't support borderStyle on View like CSS, need SVG or just opacity
    opacity: 0.3,
  },
  gridLineTransparent: {
    width: '100%',
    height: 1,
    backgroundColor: 'transparent',
  },
  svgContainer: {
    ...StyleSheet.absoluteFillObject,
    paddingBottom: 24,
    paddingTop: 8,
    paddingLeft: 8,
  },
  chartPoint: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    width: 32, // 给定一个宽度，避免布局塌缩
    height: 32,
    transform: [{ translateX: -16 }, { translateY: -16 }], // Center the point
  },
  pointAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.primary,
    zIndex: 10,
  },
  pointTooltip: {
    position: 'absolute',
    top: -34, // 稍微调高一点
    backgroundColor: 'white',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    zIndex: 20,
    minWidth: 60, // 增加最小宽度防止换行
    alignItems: 'center',
  },
  pointTooltipText: {
    color: 'black',
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  crownIcon: {
    position: 'absolute',
    top: -10,
    right: -4,
    zIndex: 20,
  },
  xAxis: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingLeft: 40, // Match yAxis width
    paddingRight: 8,
    marginTop: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  filterGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  filterBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  filterBtnActive: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 4,
  },
  filterBtnText: {
    color: COLORS.textMuted,
    fontSize: 12,
  },
  filterBtnTextActive: {
    color: COLORS.textMain,
    fontSize: 12,
    fontWeight: '500',
  },
  leaderboardList: {
    gap: 8,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 16,
  },
  topLeaderboardItem: {
    backgroundColor: 'rgba(234, 179, 8, 0.1)', // yellow-500/10
    borderColor: 'rgba(234, 179, 8, 0.2)',
    position: 'relative',
    overflow: 'hidden',
  },
  topBadgeIcon: {
    position: 'absolute',
    top: 0,
    right: 0,
    zIndex: 0,
  },
  rankContainer: {
    width: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: {
    fontSize: 20,
    fontWeight: '900',
    fontStyle: 'italic',
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#9ca3af', // gray-400
  },
  topBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: COLORS.yellow,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.surface,
  },
  topBadgeText: {
    color: 'black',
    fontSize: 8,
    fontWeight: 'bold',
  },
  infoContainer: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  nameText: {
    color: COLORS.textMain,
    fontWeight: 'bold',
    fontSize: 14,
    maxWidth: 100,
  },
  roiRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: 8,
  },
  roiLabel: {
    color: COLORS.textMuted,
    fontSize: 12,
  },
  roiValue: {
    color: COLORS.primary,
    fontWeight: 'bold',
    fontSize: 14,
  },
  copyButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  copyButtonUnsubscribed: {
    backgroundColor: 'white',
  },
  copyButtonSubscribed: {
    backgroundColor: COLORS.yellow,
  },
  copyButtonOutline: {
    // Deprecated, keeping for safety but unused
    backgroundColor: 'white',
  },
  copyButtonText: {
    color: 'black',
    fontSize: 12,
    fontWeight: 'bold',
  },
  // Copy Tab Styles
  copyTabContainer: {
    paddingBottom: 20,
  },
  moreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  moreBtnText: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginRight: 2,
  },
  traderList: {
    gap: 8,
  },
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
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: COLORS.surfaceLight,
    marginHorizontal: 16,
    marginBottom: 16,
    paddingVertical: 20,
    borderRadius: 12,
  },
  statItem: {
    alignItems: 'center',
    gap: 8,
  },
  statValue: {
    color: COLORS.textMain,
    fontSize: 20,
    fontWeight: 'bold',
  },
  statLabelSmall: {
    color: COLORS.textMuted,
    fontSize: 11,
  },
});
