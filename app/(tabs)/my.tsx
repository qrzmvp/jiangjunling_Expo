import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { UserInfo, Stats } from '../../types';

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

const MyPage: React.FC = () => {
  const router = useRouter();
  // 使用类型定义的数据
  const userInfo: UserInfo = {
    username: 'VGro6220',
    accountId: '5886220',
    verified: true,
  };

  const stats: Stats = {
    subscriptions: 36,
    following: 5,
    friends: 16,
    favorites: 99,
  };
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.myHeader}>
        <View style={{ width: 24 }} />
        <Text style={styles.myHeaderTitle}>个人中心</Text>
        <View style={{ width: 24 }} />
        {/* <View style={styles.myHeaderRight}>
          <Ionicons name="chatbubble-outline" size={24} color="#EAEBEF" />
          <View style={styles.badge}>
            <Text style={styles.badgeText}>3</Text>
          </View>
        </View> */}
      </View>

      <ScrollView style={styles.myScrollView}>
        {/* Profile Section */}
        <TouchableOpacity 
          style={styles.profileSection}
          onPress={() => router.push('/profile')}
          activeOpacity={0.8}
        >
          <View style={styles.profileInfo}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>V</Text>
              </View>
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark" size={12} color="#FFFFFF" />
              </View>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.username}>VGro6220</Text>
              <View style={styles.accountRow}>
                <Text style={styles.accountId}>账号:5886220</Text>
                <Ionicons name="copy-outline" size={16} color="#8A919E" style={{ marginLeft: 4 }} />
              </View>
            </View>
          </View>
          <TouchableOpacity 
            style={styles.qrCode}
            onPress={() => router.push('/qrcode')}
          >
            <Ionicons name="qr-code-outline" size={24} color="#8A919E" />
            <Ionicons name="chevron-forward" size={20} color="#8A919E" />
          </TouchableOpacity>
        </TouchableOpacity>

        {/* Stats Section */}
        <View style={styles.statsCard}>
          <View style={styles.statsRow}>
            <TouchableOpacity 
              style={styles.statItem}
              onPress={() => router.push('/(tabs)?tab=copy&filter=已订阅')}
            >
              <Text style={styles.statNumber}>36</Text>
              <Text style={styles.statLabel}>订阅</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.statItem}
              onPress={() => router.push('/(tabs)?tab=copy&filter=已关注')}
            >
              <Text style={styles.statNumber}>5</Text>
              <Text style={styles.statLabel}>关注</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.statItem} onPress={() => router.push('/invite-friends')}>
              <Text style={styles.statNumber}>16</Text>
              <Text style={styles.statLabel}>朋友</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.statItem} onPress={() => router.push('/profile/exchange-accounts')}>
              <Text style={styles.statNumber}>99+</Text>
              <Text style={styles.statLabel}>交易账户</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Promotion Banner */}
        {/* <View style={styles.promoBanner}>
          <View>
            <Text style={styles.promoTitle}>新人开户赢好礼</Text>
            <Text style={styles.promoSubtitle}>行情卡、免佣卡等你来拿！</Text>
          </View>
          <Text style={styles.promoIcon}>🎁</Text>
        </View> */}

        {/* Quick Actions */}
        {/* <View style={styles.quickActions}>
          <View style={styles.actionCard}>
            <View style={[styles.actionIcon, { backgroundColor: '#4A90E2' }]}>
              <Ionicons name="gift" size={24} color="#FFFFFF" />
            </View>
            <Text style={styles.actionTitle}>活动中心</Text>
            <Text style={styles.actionSubtitle}>精彩活动等您参与</Text>
          </View>
          <View style={styles.actionCard}>
            <View style={[styles.actionIcon, { backgroundColor: '#E5404A' }]}>
              <Ionicons name="ticket" size={24} color="#FFFFFF" />
            </View>
            <Text style={styles.actionTitle}>邀请好友</Text>
            <Text style={styles.actionSubtitle}>邀请越多奖励越多</Text>
          </View>
          <View style={styles.actionCard}>
            <View style={[styles.actionIcon, { backgroundColor: '#F5A623' }]}>
              <Ionicons name="wallet" size={24} color="#FFFFFF" />
            </View>
            <Text style={styles.actionTitle}>我的酱币</Text>
            <Text style={styles.actionSubtitle}>用酱币兑换好礼</Text>
          </View>
        </View> */}

        {/* VIP Card */}
        <TouchableOpacity 
          style={styles.vipCard}
          onPress={() => router.push('/vip-purchase')}
          activeOpacity={0.9}
        >
          <View style={styles.vipContent}>
            <View style={styles.vipTitleRow}>
              <Ionicons name="diamond" size={20} color="#ffffff" />
              <Text style={styles.vipTitle}>VIP 会员中心</Text>
            </View>
            <Text style={styles.vipSubtitle}>尊享更低手续费与专属客服服务</Text>
          </View>
          <View style={styles.vipButton}>
            <Text style={styles.vipButtonText}>立即开通 {'>'}</Text>
          </View>
        </TouchableOpacity>

        {/* Menu List 1 */}
        <View style={styles.menuCard}>
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => router.push('/profile/exchange-accounts')}
          >
            <View style={styles.menuLeft}>
              <Ionicons name="pricetag" size={22} color="#8A919E" />
              <Text style={styles.menuText}>交易所账户</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#8A919E" />
          </TouchableOpacity>
          <View style={styles.menuDivider} />
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => router.push('/purchase-history')}
          >
            <View style={styles.menuLeft}>
              <Ionicons name="receipt-outline" size={22} color="#8A919E" />
              <Text style={styles.menuText}>购买记录</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#8A919E" />
          </TouchableOpacity>
          <View style={styles.menuDivider} />
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => router.push('/profile/redemption-history')}
          >
            <View style={styles.menuLeft}>
              <Ionicons name="gift-outline" size={22} color="#8A919E" />
              <Text style={styles.menuText}>兑换记录</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#8A919E" />
          </TouchableOpacity>
        </View>

        {/* Menu List 2 */}
        <View style={styles.menuCard}>
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => router.push('/invite-friends')}
          >
            <View style={styles.menuLeft}>
              <Ionicons name="person-add-outline" size={22} color="#8A919E" />
              <Text style={styles.menuText}>邀请好友</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#8A919E" />
          </TouchableOpacity>
          <View style={styles.menuDivider} />
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => router.push('/qrcode')}
          >
            <View style={styles.menuLeft}>
              <Ionicons name="call-outline" size={22} color="#8A919E" />
              <Text style={styles.menuText}>联系客服</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#8A919E" />
          </TouchableOpacity>
          <View style={styles.menuDivider} />
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuLeft}>
              <Ionicons name="settings-outline" size={22} color="#8A919E" />
              <Text style={styles.menuText}>设置</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#8A919E" />
          </TouchableOpacity>
        </View>

        {/* Footer */}
        {/* <View style={styles.myFooter}>
          <Ionicons name="information-circle-outline" size={14} color="#8A919E" />
          <Text style={styles.footerText}>中咨证券拥有香港证券全牌照</Text>
        </View> */}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: Platform.OS === 'web' ? 0 : 50,
  },
  myHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  myHeaderTitle: {
    color: COLORS.textMain,
    fontSize: 18,
    fontWeight: '600',
  },
  myHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: COLORS.danger,
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: COLORS.textMain,
    fontSize: 10,
    fontWeight: 'bold',
  },
  myScrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  profileSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#4A90E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: COLORS.textMain,
    fontSize: 28,
    fontWeight: 'bold',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: COLORS.yellow,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.background,
  },
  userInfo: {
    justifyContent: 'center',
  },
  username: {
    color: COLORS.textMain,
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  accountRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  accountId: {
    color: COLORS.textMuted,
    fontSize: 13,
  },
  qrCode: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statsCard: {
    backgroundColor: COLORS.surfaceLight,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    color: COLORS.textMain,
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    color: COLORS.textMuted,
    fontSize: 12,
  },
  promoBanner: {
    backgroundColor: '#3A2D1F',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  promoTitle: {
    color: '#F5A623',
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  promoSubtitle: {
    color: '#D4A574',
    fontSize: 12,
  },
  promoIcon: {
    fontSize: 48,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  actionCard: {
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 12,
    padding: 12,
    width: '31%',
    alignItems: 'center',
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionTitle: {
    color: COLORS.textMain,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center',
  },
  actionSubtitle: {
    color: COLORS.textMuted,
    fontSize: 10,
    textAlign: 'center',
  },
  menuCard: {
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 12,
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuText: {
    color: COLORS.textMain,
    fontSize: 15,
    marginLeft: 12,
  },
  menuDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginLeft: 54,
  },
  myFooter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
  },
  footerText: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginLeft: 4,
  },
  vipCard: {
    backgroundColor: '#1c1c1e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  vipContent: {
    flex: 1,
  },
  vipTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  vipTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  vipSubtitle: {
    color: '#9ca3af',
    fontSize: 12,
  },
  vipButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#ffffff',
  },
  vipButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default MyPage;
