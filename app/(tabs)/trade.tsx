import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Platform, Modal, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ExchangeAccountService } from '../../lib/exchangeAccountService';
import { ExchangeAccount } from '../../types';

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

const NumberTicker = ({ value, style, duration = 1000 }: { value: string, style?: any, duration?: number }) => {
  const [displayValue, setDisplayValue] = useState("0.00");
  
  useEffect(() => {
    const isNegative = value.includes('-');
    const isPositive = value.includes('+');
    const cleanValue = value.replace(/,/g, '').replace(/[+\-]/g, '');
    const targetValue = parseFloat(cleanValue);
    
    if (isNaN(targetValue)) {
      setDisplayValue(value);
      return;
    }

    const startTime = Date.now();
    let animationFrameId: number;
    
    const animate = () => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 4); // Ease out quart
      
      const currentValue = targetValue * ease;
      let formatted = currentValue.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      
      if (isPositive) formatted = '+' + formatted;
      if (isNegative) formatted = '-' + formatted;
      
      setDisplayValue(formatted);
      
      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        setDisplayValue(value);
      }
    };
    
    animationFrameId = requestAnimationFrame(animate);
    
    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [value, duration]);

  return <Text style={style}>{displayValue}</Text>;
};

const TradePage: React.FC = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'position' | 'order' | 'history'>('position');
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [exchangeAccounts, setExchangeAccounts] = useState<ExchangeAccount[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<ExchangeAccount | null>(null);
  const [loadingAccounts, setLoadingAccounts] = useState(false);

  // 模拟持仓数据
  const positionData = [
    {
      id: 1,
      symbol: 'BTC/USD',
      name: 'Bitcoin',
      shares: 0.5,
      avgPrice: 98000.00,
      currentPrice: 109384.00,
      marketValue: 54692.00,
      profit: 5692.00,
      profitRate: 11.61,
      isProfit: true,
    },
    {
      id: 2,
      symbol: 'ETH/USD',
      name: 'Ethereum',
      shares: 10,
      avgPrice: 3650.00,
      currentPrice: 3580.00,
      marketValue: 35800.00,
      profit: -700.00,
      profitRate: -1.92,
      isProfit: false,
    },
  ];

  // 模拟挂单数据
  const orderData = [
    {
      id: 1,
      symbol: 'BTC/USD',
      name: 'Bitcoin',
      type: 'buy',
      orderType: '限价单',
      shares: 0.2,
      orderPrice: 108000.00,
      status: '未成交',
      time: '2025-12-15 09:30',
    },
    {
      id: 2,
      symbol: 'ETH/USD',
      name: 'Ethereum',
      type: 'sell',
      orderType: '限价单',
      shares: 5,
      orderPrice: 3700.00,
      status: '部分成交',
      filledShares: 2,
      time: '2025-12-15 10:15',
    },
    {
      id: 3,
      symbol: 'SOL/USD',
      name: 'Solana',
      type: 'buy',
      orderType: '市价单',
      shares: 15,
      status: '未成交',
      time: '2025-12-15 11:05',
    },
  ];

  // 模拟历史数据
  const historyData = [
    {
      id: 1,
      symbol: 'BTC/USD',
      name: 'Bitcoin',
      type: 'buy',
      orderType: '限价单',
      shares: 0.1,
      orderPrice: 95000.00,
      avgPrice: 95000.00,
      status: '已成交',
      time: '2025-12-14 14:20',
    },
    {
      id: 2,
      symbol: 'ETH/USD',
      name: 'Ethereum',
      type: 'sell',
      orderType: '限价单',
      shares: 2,
      orderPrice: 3800.00,
      avgPrice: 3800.00,
      status: '已成交',
      time: '2025-12-13 09:15',
    },
    {
      id: 3,
      symbol: 'SOL/USD',
      name: 'Solana',
      type: 'buy',
      orderType: '限价单',
      shares: 10,
      orderPrice: 140.00,
      status: '已撤单',
      time: '2025-12-12 16:45',
    },
  ];

  // 加载交易所账户
  useEffect(() => {
    loadExchangeAccounts();
  }, []);

  const loadExchangeAccounts = async () => {
    try {
      setLoadingAccounts(true);
      // 直接获取已启用的账户
      const enabledAccounts = await ExchangeAccountService.getEnabledExchangeAccounts();
      setExchangeAccounts(enabledAccounts);
      
      // 如果当前选中的账户已经被禁用或删除，则重新选择第一个账户
      if (selectedAccount) {
        const stillExists = enabledAccounts.find(acc => acc.id === selectedAccount.id);
        if (!stillExists && enabledAccounts.length > 0) {
          setSelectedAccount(enabledAccounts[0]);
        } else if (stillExists) {
          // 更新选中账户的数据（可能昵称等信息已更改）
          setSelectedAccount(stillExists);
        }
      } else if (enabledAccounts.length > 0) {
        // 如果之前没有选中账户，选择第一个
        setSelectedAccount(enabledAccounts[0]);
      }
    } catch (error) {
      console.error('加载交易所账户失败:', error);
    } finally {
      setLoadingAccounts(false);
    }
  };

  const handleSelectAccount = (account: ExchangeAccount) => {
    setSelectedAccount(account);
    setShowAccountModal(false);
  };

  const handleOpenAccountModal = () => {
    setShowAccountModal(true);
    // 每次打开模态框时重新获取最新数据
    loadExchangeAccounts();
  };

  const getExchangeIcon = (name: string) => {
    const lowerName = name.toLowerCase();
    const icons: { [key: string]: { icon: string; bg: string; color: string } } = {
      'binance': { icon: 'B', bg: '#FCD535', color: '#000000' },
      'okx': { icon: 'O', bg: '#FFFFFF', color: '#000000' },
      'bybit': { icon: 'B', bg: '#F7A600', color: '#000000' },
      'coinbase': { icon: 'C', bg: '#0052FF', color: '#FFFFFF' },
      'kraken': { icon: 'K', bg: '#5741D9', color: '#FFFFFF' },
      'huobi': { icon: 'H', bg: '#2EAEF0', color: '#FFFFFF' },
    };
    return icons[lowerName] || { icon: name[0]?.toUpperCase() || 'E', bg: '#666666', color: '#FFFFFF' };
  };

  return (
    <View style={styles.container}>
      {/* Header with Account Selector */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.accountInfo} 
          onPress={handleOpenAccountModal}
        >
          {selectedAccount && selectedAccount.exchanges ? (
            <>
              <View style={[
                styles.exchangeIconSmall,
                { backgroundColor: getExchangeIcon(selectedAccount.exchanges.name).bg }
              ]}>
                <Text style={[
                  styles.exchangeIconTextSmall,
                  { color: getExchangeIcon(selectedAccount.exchanges.name).color }
                ]}>
                  {getExchangeIcon(selectedAccount.exchanges.name).icon}
                </Text>
              </View>
              <Text style={styles.accountName}>{selectedAccount.account_nickname}</Text>
              <Ionicons name="chevron-down" size={18} color="#8A919E" style={{ marginLeft: 4 }} />
            </>
          ) : (
            <>
              <View style={styles.okxIcon}>
                <Text style={styles.okxText}>OKX</Text>
              </View>
              <Text style={styles.accountName}>我的账户(1001)</Text>
              <Ionicons name="chevron-down" size={18} color="#8A919E" style={{ marginLeft: 4 }} />
            </>
          )}
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/profile/exchange-accounts/edit')}>
          <Ionicons name="add" size={28} color="#EAEBEF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>

        {/* Primary Navigation */}
        <View style={styles.primaryNav}>
          <TouchableOpacity style={styles.navItemActive}>
            <Text style={styles.navTextActive}>资产</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem}>
            <Text style={styles.navText}>分析</Text>
          </TouchableOpacity>
        </View>

        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <View style={styles.cardHeader}>
            <View style={styles.assetLabel}>
              <Text style={styles.assetLabelText}>资产净值</Text>
              <View style={styles.currencyBadge}>
                <Text style={styles.currencyText}>HKD</Text>
              </View>
            </View>
            <Text style={styles.arrow}>›</Text>
          </View>
          
          <NumberTicker value="2,019,899.00" style={styles.mainBalance} />
          
          <View style={styles.metricsGrid}>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>持仓市值</Text>
              <NumberTicker value="1,019,899.00" style={styles.metricValue} />
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>持仓盈亏</Text>
              <NumberTicker value="+15,987.09" style={[styles.metricValue, styles.greenText]} />
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>今日盈亏</Text>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <NumberTicker value="+1,987.09" style={[styles.metricValue, styles.greenText]} />
                <Text style={[styles.metricValue, styles.greenText]}>/0.14%</Text>
              </View>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>冻结资金</Text>
              <NumberTicker value="9,899.00" style={styles.metricValue} />
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>可用资金</Text>
              <NumberTicker value="1,000,899.00" style={styles.metricValue} />
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>可提资金</Text>
              <NumberTicker value="5,899.00" style={styles.metricValue} />
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        {/* <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>入金</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>充币</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>交易</Text>
          </TouchableOpacity>
        </View> */}

        {/* Secondary Navigation */}
        <View style={styles.secondaryNav}>
          <TouchableOpacity 
            style={activeTab === 'position' ? styles.navItemActive : styles.navItem}
            onPress={() => setActiveTab('position')}
          >
            <Text style={activeTab === 'position' ? styles.navTextActive : styles.navText}>持仓(2)</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={activeTab === 'order' ? styles.navItemActive : styles.navItem}
            onPress={() => setActiveTab('order')}
          >
            <Text style={activeTab === 'order' ? styles.navTextActive : styles.navText}>挂单(3)</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={activeTab === 'history' ? styles.navItemActive : styles.navItem}
            onPress={() => setActiveTab('history')}
          >
            <Text style={activeTab === 'history' ? styles.navTextActive : styles.navText}>历史</Text>
          </TouchableOpacity>
        </View>

        {/* 持仓列表 */}
        {activeTab === 'position' && positionData.map((position) => (
          <View key={position.id} style={styles.positionCard}>
            <View style={styles.cardTitleRow}>
              <Text style={styles.symbolTitle}>
                {position.symbol} <Text style={styles.symbolSubtitle}>{position.name}</Text>
              </Text>
              <Text style={[styles.profitText, position.isProfit ? styles.greenText : styles.redText]}>
                {position.isProfit ? '+' : ''}{position.profit.toFixed(2)}
              </Text>
            </View>

            <View style={styles.dividerLine} />

            <View style={styles.positionMetrics}>
              <View style={styles.metricRowContainer}>
                <View style={styles.metricCol}>
                  <Text style={styles.metricLabel}>持仓</Text>
                  <Text style={styles.metricValue}>{position.shares}</Text>
                </View>
                <View style={styles.metricCol}>
                  <Text style={styles.metricLabel}>成本价</Text>
                  <Text style={styles.metricValue}>{position.avgPrice.toFixed(2)}</Text>
                </View>
                <View style={styles.metricCol}>
                  <Text style={styles.metricLabel}>现价</Text>
                  <Text style={styles.metricValue}>{position.currentPrice.toFixed(2)}</Text>
                </View>
              </View>

              <View style={styles.metricRowContainer}>
                <View style={styles.metricCol}>
                  <Text style={styles.metricLabel}>市值</Text>
                  <Text style={styles.metricValue}>{position.marketValue.toFixed(2)}</Text>
                </View>
                <View style={styles.metricCol}>
                  <Text style={styles.metricLabel}>盈亏比例</Text>
                  <Text style={[styles.metricValue, position.isProfit ? styles.greenText : styles.redText]}>
                    {position.isProfit ? '+' : ''}{position.profitRate.toFixed(2)}%
                  </Text>
                </View>
                <View style={styles.metricCol} />
              </View>
            </View>
          </View>
        ))}

        {/* 挂单列表 */}
        {activeTab === 'order' && orderData.map((order) => (
          <View key={order.id} style={styles.orderCard}>
            <View style={styles.cardTitleRow}>
              <Text style={styles.symbolTitle}>
                {order.symbol} <Text style={styles.symbolSubtitle}>{order.name}</Text>
              </Text>
              <View style={styles.orderTypeBadge}>
                <Text style={[styles.orderTypeText, order.type === 'buy' ? styles.greenText : styles.redText]}>
                  {order.type === 'buy' ? '买入' : '卖出'}
                </Text>
              </View>
            </View>

            <View style={styles.dividerLine} />

            <View style={styles.orderMetrics}>
              <View style={styles.metricRowContainer}>
                <View style={styles.metricCol}>
                  <Text style={styles.metricLabel}>类型</Text>
                  <Text style={styles.metricValue}>{order.orderType}</Text>
                </View>
                <View style={styles.metricCol}>
                  <Text style={styles.metricLabel}>数量</Text>
                  <Text style={styles.metricValue}>{order.shares}</Text>
                </View>
                <View style={styles.metricCol}>
                  <Text style={styles.metricLabel}>状态</Text>
                  <Text style={styles.metricValue}>{order.status}</Text>
                </View>
              </View>

              <View style={styles.metricRowContainer}>
                {order.orderPrice && (
                  <View style={styles.metricCol}>
                    <Text style={styles.metricLabel}>委托价</Text>
                    <Text style={styles.metricValue}>{order.orderPrice.toFixed(2)}</Text>
                  </View>
                )}
                {order.filledShares && (
                  <View style={styles.metricCol}>
                    <Text style={styles.metricLabel}>已成交</Text>
                    <Text style={styles.metricValue}>{order.filledShares}</Text>
                  </View>
                )}
                <View style={styles.metricCol}>
                  <Text style={styles.metricLabel}>时间</Text>
                  <Text style={styles.metricValue}>{order.time}</Text>
                </View>
              </View>
            </View>

            <TouchableOpacity style={styles.cancelButton}>
              <Text style={styles.cancelButtonText}>撤单</Text>
            </TouchableOpacity>
          </View>
        ))}

        {/* 历史列表 */}
        {activeTab === 'history' && historyData.map((history) => (
          <View key={history.id} style={styles.orderCard}>
            <View style={styles.cardTitleRow}>
              <Text style={styles.symbolTitle}>
                {history.symbol} <Text style={styles.symbolSubtitle}>{history.name}</Text>
              </Text>
              <View style={styles.orderTypeBadge}>
                <Text style={[styles.orderTypeText, history.type === 'buy' ? styles.greenText : styles.redText]}>
                  {history.type === 'buy' ? '买入' : '卖出'}
                </Text>
              </View>
            </View>

            <View style={styles.dividerLine} />

            <View style={styles.positionMetrics}>
              <View style={styles.metricRowContainer}>
                <View style={styles.metricCol}>
                  <Text style={styles.metricLabel}>委托价格</Text>
                  <Text style={styles.metricValue}>{history.orderPrice ? history.orderPrice.toFixed(2) : '市价'}</Text>
                </View>
                <View style={styles.metricCol}>
                  <Text style={styles.metricLabel}>委托数量</Text>
                  <Text style={styles.metricValue}>{history.shares}</Text>
                </View>
                <View style={styles.metricCol}>
                  <Text style={styles.metricLabel}>状态</Text>
                  <Text style={styles.metricValue}>{history.status}</Text>
                </View>
              </View>
              
              <View style={styles.metricRowContainer}>
                 <View style={styles.metricCol}>
                  <Text style={styles.metricLabel}>成交均价</Text>
                  <Text style={styles.metricValue}>{history.avgPrice ? history.avgPrice.toFixed(2) : '-'}</Text>
                </View>
                <View style={styles.metricCol}>
                  <Text style={styles.metricLabel}>时间</Text>
                  <Text style={styles.metricValue}>{history.time}</Text>
                </View>
                 <View style={styles.metricCol} />
              </View>
            </View>
          </View>
        ))}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Account Selection Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showAccountModal}
        onRequestClose={() => setShowAccountModal(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setShowAccountModal(false)}
          />
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              {/* Modal Header */}
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>选择交易所账户</Text>
                <TouchableOpacity onPress={() => setShowAccountModal(false)}>
                  <Ionicons name="close" size={24} color={COLORS.textMain} />
                </TouchableOpacity>
              </View>

              {/* Account List */}
              <ScrollView style={styles.modalScroll}>
                {loadingAccounts ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.textMain} />
                  </View>
                ) : exchangeAccounts.length === 0 ? (
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>暂无已启用的交易所账户</Text>
                    <TouchableOpacity 
                      style={styles.createAccountButton}
                      onPress={() => {
                        setShowAccountModal(false);
                        router.push('/profile/exchange-accounts/edit');
                      }}
                    >
                      <Text style={styles.createAccountButtonText}>创建账户</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  exchangeAccounts.map((account) => {
                    const exchangeIcon = account.exchanges 
                      ? getExchangeIcon(account.exchanges.name)
                      : { icon: 'E', bg: '#666666', color: '#FFFFFF' };
                    const isSelected = selectedAccount?.id === account.id;
                    return (
                      <TouchableOpacity
                        key={account.id}
                        style={[
                          styles.accountItem,
                          isSelected && styles.accountItemSelected
                        ]}
                        onPress={() => handleSelectAccount(account)}
                      >
                        <View style={styles.accountLeft}>
                          <View style={[
                            styles.accountIcon,
                            { backgroundColor: exchangeIcon.bg }
                          ]}>
                            <Text style={[
                              styles.accountIconText,
                              { color: exchangeIcon.color }
                            ]}>
                              {exchangeIcon.icon}
                            </Text>
                          </View>
                          <Text style={styles.accountNameText}>{account.account_nickname}</Text>
                        </View>
                        {isSelected && (
                          <Ionicons name="checkmark-circle" size={24} color={COLORS.textMain} />
                        )}
                      </TouchableOpacity>
                    );
                  })
                )}
              </ScrollView>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: Platform.OS === 'web' ? 0 : 50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 12,
  },
  headerTitle: {
    color: COLORS.textMain,
    fontSize: 20,
    fontWeight: '600',
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  accountInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  okxIcon: {
    width: 36,
    height: 36,
    borderRadius: 6,
    backgroundColor: COLORS.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  okxText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  accountName: {
    color: COLORS.textMain,
    fontSize: 16,
    fontWeight: '600',
  },
  primaryNav: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    marginBottom: 16,
    marginTop: -8,
    marginHorizontal: 16,
    gap: 24,
  },
  navItem: {
    paddingVertical: 8,
  },
  navItemActive: {
    paddingVertical: 8,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.textMain,
  },
  navText: {
    color: COLORS.textMuted,
    fontSize: 14,
  },
  navTextActive: {
    color: COLORS.textMain,
    fontSize: 14,
    fontWeight: '600',
  },
  balanceCard: {
    backgroundColor: COLORS.surfaceLight,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  assetLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  assetLabelText: {
    color: COLORS.textMuted,
    fontSize: 12,
  },
  currencyBadge: {
    backgroundColor: COLORS.surfaceLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  currencyText: {
    color: COLORS.textMain,
    fontSize: 12,
  },
  arrow: {
    color: COLORS.textMuted,
    fontSize: 20,
  },
  mainBalance: {
    color: COLORS.textMain,
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  metricItem: {
    width: '30%',
    marginBottom: 12,
  },
  metricLabel: {
    color: COLORS.textMuted,
    fontSize: 11,
    marginBottom: 4,
  },
  metricValue: {
    color: COLORS.textMain,
    fontSize: 13,
  },
  greenText: {
    color: COLORS.primary,
  },
  redText: {
    color: COLORS.danger,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    backgroundColor: COLORS.textMain,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: COLORS.background,
    fontSize: 14,
    fontWeight: '600',
  },
  secondaryNav: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    marginBottom: 16,
    marginHorizontal: 16,
    gap: 24,
  },
  positionCard: {
    backgroundColor: COLORS.surfaceLight,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  orderCard: {
    backgroundColor: COLORS.surfaceLight,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  cardTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  symbolTitle: {
    color: COLORS.textMain,
    fontSize: 18,
    fontWeight: '600',
  },
  symbolSubtitle: {
    color: COLORS.textMuted,
    fontSize: 14,
    fontWeight: 'normal',
  },
  profitText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  orderTypeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: COLORS.border,
  },
  orderTypeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  positionMetrics: {
    gap: 16,
  },
  orderMetrics: {
    gap: 16,
    marginBottom: 16,
  },
  cancelButton: {
    backgroundColor: COLORS.border,
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 8,
  },
  cancelButtonText: {
    color: COLORS.textMain,
    fontSize: 14,
    fontWeight: '600',
  },
  strategyCard: {
    backgroundColor: COLORS.surfaceLight,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  strategyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingBottom: 16,
  },
  strategyTitle: {
    color: COLORS.textMain,
    fontSize: 18,
    fontWeight: '600',
  },
  strategySubtitle: {
    color: COLORS.textMuted,
    fontSize: 14,
    fontWeight: 'normal',
  },
  strategyProfit: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 4,
  },
  strategyStatus: {
    alignItems: 'flex-end',
  },
  dividerLine: {
    height: 1,
    backgroundColor: COLORS.border,
    marginBottom: 16,
  },
  strategyMetrics: {
    gap: 16,
  },
  metricRowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  metricCol: {
    flex: 1,
  },
  strategyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    flex: 1,
  },
  modalContainer: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    minHeight: '35%',
    maxHeight: '70%',
  },
  modalContent: {
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    minHeight: 280,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textMain,
  },
  modalScroll: {
    maxHeight: 400,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textMuted,
    marginBottom: 20,
  },
  createAccountButton: {
    backgroundColor: COLORS.textMain,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createAccountButtonText: {
    color: COLORS.background,
    fontSize: 16,
    fontWeight: '600',
  },
  accountItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  accountItemSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  accountLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  accountIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  accountIconText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  accountNameText: {
    fontSize: 16,
    color: COLORS.textMain,
    fontWeight: '500',
  },
  exchangeIconSmall: {
    width: 36,
    height: 36,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  exchangeIconTextSmall: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default TradePage;
