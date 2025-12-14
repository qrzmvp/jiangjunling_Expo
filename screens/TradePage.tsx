import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const TradePage: React.FC = () => {
  return (
    <>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>账户</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity>
            <Ionicons name="search" size={24} color="#EAEBEF" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Account Selector */}
        <View style={styles.accountSelector}>
          <View style={styles.accountInfo}>
            <View style={styles.okxIcon}>
              <Text style={styles.okxText}>OKX</Text>
            </View>
            <Text style={styles.accountName}>我的账户(1001)</Text>
          </View>
          <Ionicons name="chevron-down" size={20} color="#8A919E" />
        </View>

        {/* Primary Navigation */}
        <View style={styles.primaryNav}>
          <TouchableOpacity style={styles.navItemActive}>
            <Text style={styles.navTextActive}>资产</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem}>
            <Text style={styles.navText}>资产分析</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem}>
            <Text style={styles.navText}>历史</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem}>
            <Text style={styles.navText}>更多</Text>
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
          
          <Text style={styles.mainBalance}>2,019,899.00</Text>
          
          <View style={styles.metricsGrid}>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>持仓市值</Text>
              <Text style={styles.metricValue}>1,019,899.00</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>持仓盈亏</Text>
              <Text style={[styles.metricValue, styles.greenText]}>+15,987.09</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>今日盈亏</Text>
              <Text style={[styles.metricValue, styles.greenText]}>+1,987.09/0.14%</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>冻结资金</Text>
              <Text style={styles.metricValue}>9,899.00</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>可用资金</Text>
              <Text style={styles.metricValue}>1,000,899.00</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>可提资金</Text>
              <Text style={styles.metricValue}>5,899.00</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>入金</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>充币</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>交易</Text>
          </TouchableOpacity>
        </View>

        {/* Secondary Navigation */}
        <View style={styles.secondaryNav}>
          <TouchableOpacity style={styles.navItem}>
            <Text style={styles.navText}>持仓(2)</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem}>
            <Text style={styles.navText}>订单(3)</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItemActive}>
            <Text style={styles.navTextActive}>策略订单</Text>
          </TouchableOpacity>
        </View>

        {/* Strategy Order Card */}
        <View style={styles.strategyCard}>
          <View style={styles.strategyHeader}>
            <View>
              <Text style={styles.strategyTitle}>
                BTC/USD <Text style={styles.strategySubtitle}>Bitcoin</Text>
              </Text>
              <Text style={[styles.metricLabel, styles.greenText, { marginTop: 8 }]}>累计盈亏</Text>
              <Text style={[styles.strategyProfit, styles.greenText]}>+2,200.09</Text>
            </View>
            <View style={styles.strategyStatus}>
              <Text style={styles.metricLabel}>网格交易</Text>
              <Text style={[styles.greenText, { fontSize: 12 }]}>进行中</Text>
            </View>
          </View>

          <View style={styles.strategyMetrics}>
            <View style={styles.strategyRow}>
              <Text style={styles.metricLabel}>监控区间</Text>
              <Text style={styles.metricLabel}>现价</Text>
              <Text style={styles.metricLabel}>当前基准价</Text>
            </View>
            <View style={styles.strategyRow}>
              <Text style={styles.metricValue}>109,000.00</Text>
              <Text style={styles.metricValue}>109,384.00</Text>
              <Text style={styles.metricValue}>90,000~120,000</Text>
            </View>
            <View style={styles.strategyRow}>
              <Text style={styles.metricLabel}>现价距基准价</Text>
              <Text style={styles.metricLabel}></Text>
              <Text style={[styles.metricValue, styles.greenText]}>+100.00/+0.09%</Text>
            </View>
            <View style={styles.strategyRow}>
              <Text style={styles.metricLabel}>触发次数</Text>
              <Text style={styles.metricLabel}>累计买入</Text>
              <Text style={styles.metricLabel}>累计卖出</Text>
            </View>
            <View style={styles.strategyRow}>
              <Text style={styles.metricValue}>139</Text>
              <Text style={styles.metricValue}>3</Text>
              <Text style={styles.metricValue}>2</Text>
            </View>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    color: '#EAEBEF',
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
  accountSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
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
    backgroundColor: '#000000',
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
    color: '#EAEBEF',
    fontSize: 14,
    fontWeight: '600',
  },
  primaryNav: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#40434D',
    marginBottom: 16,
    gap: 24,
  },
  navItem: {
    paddingVertical: 8,
  },
  navItemActive: {
    paddingVertical: 8,
    borderBottomWidth: 2,
    borderBottomColor: '#FFFFFF',
  },
  navText: {
    color: '#8A919E',
    fontSize: 14,
  },
  navTextActive: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  balanceCard: {
    backgroundColor: '#2C2E36',
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
    color: '#8A919E',
    fontSize: 12,
  },
  currencyBadge: {
    backgroundColor: '#2C2E36',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#40434D',
  },
  currencyText: {
    color: '#EAEBEF',
    fontSize: 12,
  },
  arrow: {
    color: '#8A919E',
    fontSize: 20,
  },
  mainBalance: {
    color: '#EAEBEF',
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
    color: '#8A919E',
    fontSize: 11,
    marginBottom: 4,
  },
  metricValue: {
    color: '#EAEBEF',
    fontSize: 13,
  },
  greenText: {
    color: '#28C78C',
  },
  redText: {
    color: '#E5404A',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#1E2026',
    fontSize: 14,
    fontWeight: '600',
  },
  secondaryNav: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#40434D',
    marginBottom: 16,
    gap: 24,
  },
  strategyCard: {
    backgroundColor: '#2C2E36',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  strategyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  strategyTitle: {
    color: '#EAEBEF',
    fontSize: 18,
    fontWeight: '600',
  },
  strategySubtitle: {
    color: '#8A919E',
    fontSize: 14,
    fontWeight: 'normal',
  },
  strategyProfit: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 4,
  },
  strategyStatus: {
    alignItems: 'flex-end',
  },
  strategyMetrics: {
    gap: 8,
  },
  strategyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
});

export default TradePage;
