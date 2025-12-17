import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';

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
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'positions' | 'orders' | 'history'>('positions');

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.iconButton} 
          onPress={() => router.back()}
        >
          <MaterialIcons name="arrow-back-ios" size={20} color={COLORS.textSub} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>交易员详情</Text>
        <TouchableOpacity style={styles.iconButton}>
          <MaterialIcons name="share" size={20} color={COLORS.textSub} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        
        {/* Trader Info Section */}
        <View style={styles.card}>
          <View style={styles.traderHeader}>
            <View style={styles.avatarContainer}>
              <Image 
                source={{ uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuAaf9dVjkyC17LtClctTc-4sEEVvnJDQ0sqSp-elCOM8ljGaMwkhTiacOULcPPbYtSTu_lFPmnNtKsVxiOA5eHNZkJE8KHzJP-Ltx4rAvebxj5DVRDSPgWop3DQj8PuIxIIGVG_9IjKOT49af1xYWNvQQvVOeMdNj3kbhN4shXLBHo1Imm3YXyaQ_Bf8Gav9EMWI697UBzvaFwIV24Dxnf9tVPbk9jCB7kc-S_KzV8Gm3EW2a9jUrIkf3nvAt1kgTa8y1UdRtKUfg" }}
                style={styles.avatar}
              />
              <View style={styles.verifiedBadge}>
                <MaterialIcons name="verified" size={14} color={COLORS.yellow} />
              </View>
            </View>
            
            <View style={styles.traderInfo}>
              <View style={styles.nameRow}>
                <View style={styles.nameContainer}>
                  <Text style={styles.traderName} numberOfLines={1}>Aaron</Text>
                  <View style={styles.tagContainer}>
                    <Text style={styles.tagText}>模拟</Text>
                  </View>
                </View>
                <View style={styles.actionButtons}>
                  <TouchableOpacity style={styles.starButton}>
                    <MaterialIcons name="star-border" size={24} color={COLORS.textSub} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.copyButton}>
                    <Text style={styles.copyButtonText}>Copy</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <Text style={styles.description} numberOfLines={1}>年底大豐收 - 稳健投资策略</Text>
            </View>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.roiSection}>
              <View style={styles.roiHeader}>
                <Text style={styles.roiLabel}>带单90日收益 (ROI)</Text>
                <MaterialIcons name="info-outline" size={14} color="rgba(136, 136, 136, 0.5)" />
              </View>
              <View style={styles.roiValues}>
                <Text style={styles.roiPercent}>+21.23%</Text>
                <Text style={styles.roiAmount}>+3,000.00 USD</Text>
              </View>
            </View>

            <View style={styles.gridStats}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>胜率</Text>
                <Text style={styles.statValue}>68.5%</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>AUM (USDT)</Text>
                <Text style={styles.statValue}>1.98M</Text>
              </View>
              <View style={[styles.statItem, { alignItems: 'flex-end' }]}>
                <Text style={styles.statLabel}>交易天数</Text>
                <Text style={styles.statValue}>428</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Rank Section */}
        <View style={[styles.card, styles.rankCard]}>
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
        </View>

        {/* Profit Trend Section */}
        <View style={styles.card}>
          <View style={styles.chartHeader}>
            <Text style={styles.sectionTitle}>收益走勢</Text>
            <View style={styles.legendContainer}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: COLORS.yellow }]} />
                <Text style={styles.legendText}>本组合</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: COLORS.purple }]} />
                <Text style={styles.legendText}>基准</Text>
              </View>
            </View>
          </View>

          <View style={styles.timeFilterContainer}>
            <TouchableOpacity style={styles.timeFilterBtnActive}>
              <Text style={styles.timeFilterTextActive}>近一周</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.timeFilterBtn}>
              <Text style={styles.timeFilterText}>近一月</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.timeFilterBtn}>
              <Text style={styles.timeFilterText}>近三月</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.timeFilterBtn}>
              <Text style={styles.timeFilterText}>全部</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.chartContainer}>
            <View style={styles.yAxis}>
              <Text style={styles.axisText}>+100%</Text>
              <Text style={styles.axisText}>+50%</Text>
              <Text style={styles.axisText}>0%</Text>
              <Text style={styles.axisText}>-50%</Text>
            </View>
            <View style={styles.chartContent}>
              {/* Grid Lines */}
              <View style={styles.gridLine} />
              <View style={styles.gridLine} />
              <View style={styles.gridLine} />
              <View style={styles.gridLine} />
              
              {/* SVG Chart */}
              <View style={StyleSheet.absoluteFill}>
                <Svg height="100%" width="100%" viewBox="0 0 300 100" preserveAspectRatio="none">
                  <Defs>
                    <LinearGradient id="gradientOrange" x1="0" y1="0" x2="0" y2="1">
                      <Stop offset="0%" stopColor="#F0B90B" stopOpacity="0.2" />
                      <Stop offset="100%" stopColor="#F0B90B" stopOpacity="0" />
                    </LinearGradient>
                  </Defs>
                  {/* Dashed Line */}
                  <Path 
                    d="M0,80 C50,78 100,75 150,85 C200,95 250,92 300,95" 
                    fill="none" 
                    stroke="#8b5cf6" 
                    strokeWidth="1.5" 
                    strokeDasharray="4, 4"
                  />
                  {/* Area */}
                  <Path 
                    d="M0,90 L30,60 L60,60 L90,50 L120,35 L150,45 L180,35 L210,35 L240,20 L250,45 L270,55 L300,55 L300,105 L0,105 Z" 
                    fill="url(#gradientOrange)" 
                    stroke="none"
                  />
                  {/* Line */}
                  <Path 
                    d="M0,90 L30,60 L60,60 L90,50 L120,35 L150,45 L180,35 L210,35 L240,20 L250,45 L270,55 L300,55" 
                    fill="none" 
                    stroke="#F0B90B" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                </Svg>
              </View>
            </View>
          </View>
          <View style={styles.xAxis}>
            <Text style={styles.axisText}>05-01</Text>
            <Text style={styles.axisText}>06-01</Text>
            <Text style={styles.axisText}>07-01</Text>
            <Text style={styles.axisText}>08-01</Text>
          </View>
        </View>

        {/* Positions/Orders Section */}
        <View style={[styles.card, { padding: 0, overflow: 'hidden' }]}>
          <View style={styles.tabsHeader}>
            <TouchableOpacity 
              style={styles.tabItem} 
              onPress={() => setActiveTab('positions')}
            >
              <View style={styles.tabContent}>
                <Text style={[styles.tabText, activeTab === 'positions' ? styles.tabTextActive : null]}>持仓</Text>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>3</Text>
                </View>
              </View>
              {activeTab === 'positions' && <View style={styles.activeIndicator} />}
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.tabItem}
              onPress={() => setActiveTab('orders')}
            >
              <View style={styles.tabContent}>
                <Text style={[styles.tabText, activeTab === 'orders' ? styles.tabTextActive : null]}>挂单</Text>
                <View style={styles.badgeTransparent}>
                  <Text style={styles.badgeTextTransparent}>2</Text>
                </View>
              </View>
              {activeTab === 'orders' && <View style={styles.activeIndicator} />}
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.tabItem}
              onPress={() => setActiveTab('history')}
            >
              <View style={styles.tabContent}>
                <Text style={[styles.tabText, activeTab === 'history' ? styles.tabTextActive : null]}>历史</Text>
              </View>
              {activeTab === 'history' && <View style={styles.activeIndicator} />}
            </TouchableOpacity>
          </View>

          <View style={styles.listContainer}>
            {activeTab === 'positions' && (
              <>
                <View style={styles.listHeader}>
                  <Text style={[styles.listHeaderLabel, { width: '35%' }]}>交易对 / 杠杆</Text>
                  <Text style={[styles.listHeaderLabel, { width: '35%', textAlign: 'right' }]}>开仓 / 最新价</Text>
                  <Text style={[styles.listHeaderLabel, { width: '30%', textAlign: 'right' }]}>未结盈亏 (U)</Text>
                </View>

                <View style={styles.listItem}>
                  <View style={{ width: '35%' }}>
                    <View style={styles.pairRow}>
                      <Text style={styles.pairText}>BTC</Text>
                      <View style={styles.leverageTagGreen}>
                        <Text style={styles.leverageTextGreen}>多 20X</Text>
                      </View>
                    </View>
                    <Text style={styles.amountText}>0.452 BTC</Text>
                  </View>
                  <View style={{ width: '35%', alignItems: 'flex-end' }}>
                    <Text style={styles.priceText}>65,420.5</Text>
                    <Text style={styles.subPriceText}>66,108.0</Text>
                  </View>
                  <View style={{ width: '30%', alignItems: 'flex-end' }}>
                    <Text style={styles.pnlTextGreen}>+310.85</Text>
                    <Text style={styles.pnlPercentGreen}>+1.05%</Text>
                  </View>
                </View>
                <View style={styles.separator} />

                <View style={styles.listItem}>
                  <View style={{ width: '35%' }}>
                    <View style={styles.pairRow}>
                      <Text style={styles.pairText}>ETH</Text>
                      <View style={styles.leverageTagRed}>
                        <Text style={styles.leverageTextRed}>空 10X</Text>
                      </View>
                    </View>
                    <Text style={styles.amountText}>12.50 ETH</Text>
                  </View>
                  <View style={{ width: '35%', alignItems: 'flex-end' }}>
                    <Text style={styles.priceText}>3,450.0</Text>
                    <Text style={styles.subPriceText}>3,425.5</Text>
                  </View>
                  <View style={{ width: '30%', alignItems: 'flex-end' }}>
                    <Text style={styles.pnlTextGreen}>+306.25</Text>
                    <Text style={styles.pnlPercentGreen}>+0.71%</Text>
                  </View>
                </View>
                <View style={styles.separator} />

                <View style={styles.listItem}>
                  <View style={{ width: '35%' }}>
                    <View style={styles.pairRow}>
                      <Text style={styles.pairText}>SOL</Text>
                      <View style={styles.leverageTagGreen}>
                        <Text style={styles.leverageTextGreen}>多 5X</Text>
                      </View>
                    </View>
                    <Text style={styles.amountText}>145.0 SOL</Text>
                  </View>
                  <View style={{ width: '35%', alignItems: 'flex-end' }}>
                    <Text style={styles.priceText}>148.50</Text>
                    <Text style={styles.subPriceText}>146.20</Text>
                  </View>
                  <View style={{ width: '30%', alignItems: 'flex-end' }}>
                    <Text style={styles.pnlTextRed}>-333.50</Text>
                    <Text style={styles.pnlPercentRed}>-1.55%</Text>
                  </View>
                </View>
              </>
            )}

            {activeTab === 'orders' && (
              <>
                <View style={styles.listHeader}>
                  <Text style={[styles.listHeaderLabel, { width: '40%' }]}>类型 / 交易对</Text>
                  <Text style={[styles.listHeaderLabel, { width: '35%', textAlign: 'right' }]}>价格 / 数量</Text>
                  <Text style={[styles.listHeaderLabel, { width: '25%', textAlign: 'right' }]}>状态</Text>
                </View>

                <View style={styles.listItem}>
                  <View style={{ width: '40%' }}>
                    <View style={styles.pairRow}>
                      <Text style={[styles.typeText, { color: COLORS.primary }]}>买入</Text>
                      <Text style={styles.pairText}>BNB</Text>
                    </View>
                    <Text style={styles.amountText}>限价委托</Text>
                  </View>
                  <View style={{ width: '35%', alignItems: 'flex-end' }}>
                    <Text style={styles.priceText}>580.0</Text>
                    <Text style={styles.subPriceText}>10.0 BNB</Text>
                  </View>
                  <View style={{ width: '25%', alignItems: 'flex-end' }}>
                    <View style={styles.statusTag}>
                      <Text style={styles.statusText}>挂单中</Text>
                    </View>
                  </View>
                </View>
                <View style={styles.separator} />

                <View style={styles.listItem}>
                  <View style={{ width: '40%' }}>
                    <View style={styles.pairRow}>
                      <Text style={[styles.typeText, { color: COLORS.danger }]}>卖出</Text>
                      <Text style={styles.pairText}>XRP</Text>
                    </View>
                    <Text style={styles.amountText}>止损委托</Text>
                  </View>
                  <View style={{ width: '35%', alignItems: 'flex-end' }}>
                    <Text style={styles.priceText}>0.4850</Text>
                    <Text style={styles.subPriceText}>5,000 XRP</Text>
                  </View>
                  <View style={{ width: '25%', alignItems: 'flex-end' }}>
                    <View style={styles.statusTag}>
                      <Text style={styles.statusText}>触发中</Text>
                    </View>
                  </View>
                </View>
              </>
            )}
            
            {activeTab === 'history' && (
               <View style={{ padding: 20, alignItems: 'center' }}>
                 <Text style={{ color: COLORS.textSub }}>暂无历史记录</Text>
               </View>
            )}
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

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
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
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
    gap: 4,
  },
  roiLabel: {
    color: COLORS.textSub,
    fontSize: 12,
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
    height: 192,
    width: '100%',
    marginBottom: 8,
  },
  yAxis: {
    justifyContent: 'space-between',
    paddingRight: 8,
    paddingBottom: 24,
    width: 40,
  },
  axisText: {
    color: 'rgba(136, 136, 136, 0.6)',
    fontSize: 10,
    fontFamily: 'Menlo',
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
});

export default TraderDetailScreen;