import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, TextInput, Alert, ActivityIndicator, Platform } from 'react-native';
import { useRouter, useNavigation } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useProtectedRoute } from '../hooks/useProtectedRoute';
import { useAuth } from '../contexts/AuthContext';
import { redeemCode } from '../lib/redemptionService';
import Toast from '../components/Toast';
import { supabase } from '../lib/supabase';

interface PriceInfo {
  id: string;
  amount: number;
  currency: string;
  type: string;
  recurring: {
    interval: string;
    interval_count: number;
  } | null;
}

interface ProductInfo {
  id: string;
  name: string;
  description: string;
  prices: PriceInfo[];
}

interface PackageOption {
  id: string;
  name: string;
  price: string;
  originalPrice: string;
  recommend?: boolean;
  stripeProductId?: string;
  stripePriceId?: string;
  currency?: string;
}

const COLORS = {
  primary: "#2ebd85",
  background: "#000000",
  surface: "#1c1c1e",
  textMain: "#ffffff",
  textMuted: "#9ca3af",
  gold: "#ffffff",
  goldLight: "#fce7f3", // Just a placeholder, maybe not used
  border: "#27272a",
};

// 硬编码数据（用于移动端）
const HARDCODED_PACKAGES: PackageOption[] = [
  { 
    id: 'monthly', 
    name: '月度会员', 
    price: '9.99', 
    originalPrice: '19.99',
    stripeProductId: 'prod_TiZg6JMSWBqjnJ',
    stripePriceId: 'price_1Sl8XqCsOgdwU6DQtB1V6h0M',
    currency: 'usd'
  },
  { 
    id: 'quarterly', 
    name: '季度会员', 
    price: '24.99', 
    originalPrice: '49.99',
    stripeProductId: 'prod_TiZgY1wcR0zPqN',
    stripePriceId: 'price_1Sl8XsCsOgdwU6DQCExHCkgf',
    currency: 'usd'
  },
  { 
    id: 'yearly', 
    name: '年度会员', 
    price: '89.99', 
    originalPrice: '199.99', 
    recommend: true,
    stripeProductId: 'prod_TiZgDpYCzRrCdF',
    stripePriceId: 'price_1Sl8XsCsOgdwU6DQnThbTY5R',
    currency: 'usd'
  },
];

export default function VipPurchasePage() {
  useProtectedRoute(); // 保护路由
  const router = useRouter();
  const navigation = useNavigation();
  const { user, refreshProfile } = useAuth();
  const [selectedPackage, setSelectedPackage] = useState('yearly');
  const [redemptionCode, setRedemptionCode] = useState('');
  const [redeeming, setRedeeming] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [packages, setPackages] = useState<PackageOption[]>(HARDCODED_PACKAGES);
  const [loading, setLoading] = useState(Platform.OS === 'web');

  // Web端：从Stripe获取产品和价格信息
  useEffect(() => {
    if (Platform.OS === 'web') {
      fetchStripeProducts();
    }
  }, []);

  const fetchStripeProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('get-stripe-products');
      
      if (error) throw error;
      
      if (data?.products) {
        // 将Stripe产品数据映射为套餐数据
        const mappedPackages: PackageOption[] = data.products.map((product: ProductInfo) => {
          const price = product.prices[0];
          const amount = price?.amount ? (price.amount / 100).toFixed(2) : '0.00';
          
          // 根据产品名称确定套餐类型和推荐状态
          let id = 'monthly';
          let recommend = false;
          let originalPrice = (parseFloat(amount) * 2).toFixed(2);
          
          if (product.name.includes('年度')) {
            id = 'yearly';
            recommend = true;
            originalPrice = (parseFloat(amount) * 2.2).toFixed(2);
          } else if (product.name.includes('季度')) {
            id = 'quarterly';
            originalPrice = (parseFloat(amount) * 2).toFixed(2);
          }
          
          return {
            id,
            name: product.name,
            price: amount,
            originalPrice,
            recommend,
            stripeProductId: product.id,
            stripePriceId: price?.id,
            currency: price?.currency || 'usd',
          };
        });
        
        // 按照月度、季度、年度排序
        const sortOrder = { monthly: 1, quarterly: 2, yearly: 3 };
        mappedPackages.sort((a, b) => sortOrder[a.id as keyof typeof sortOrder] - sortOrder[b.id as keyof typeof sortOrder]);
        
        setPackages(mappedPackages);
      }
    } catch (error: any) {
      console.error('获取Stripe产品失败:', error);
      // 失败时使用硬编码数据
      setToastType('error');
      setToastMessage('加载产品信息失败，使用默认数据');
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  const handleRedeem = async () => {
    if (!redemptionCode.trim()) {
      setToastType('error');
      setToastMessage('请输入兑换码');
      setShowToast(true);
      return;
    }

    if (!user?.id) {
      setToastType('error');
      setToastMessage('用户信息不完整，请重新登录');
      setShowToast(true);
      return;
    }

    setRedeeming(true);
    
    try {
      // 执行兑换
      await redeemCode(user.id, redemptionCode);
      
      // 刷新用户信息
      await refreshProfile();
      
      // 清空输入框
      setRedemptionCode('');
      
      // 显示成功提示
      setToastType('success');
      setToastMessage('兑换成功！VIP会员已激活');
      setShowToast(true);
      
      // 延迟跳转到兑换记录页面
      setTimeout(() => {
        router.push('/profile/redemption-history');
      }, 1500);
    } catch (error: any) {
      setToastType('error');
      setToastMessage(error.message || '兑换失败，请重试');
      setShowToast(true);
    } finally {
      setRedeeming(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => {
            if (navigation.canGoBack()) {
              navigation.goBack();
            } else {
              router.replace('/(tabs)/my');
            }
          }} 
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>开通会员</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={() => router.push('/purchase-history')} style={styles.headerIcon}>
            <Ionicons name="receipt-outline" size={22} color="#fff" />
          </TouchableOpacity>
          {/* 兑换记录入口 - 暂时隐藏 */}
          {/* <TouchableOpacity onPress={() => router.push('/profile/redemption-history')} style={styles.headerIcon}>
            <Ionicons name="gift-outline" size={22} color="#fff" />
          </TouchableOpacity> */}
        </View>
      </View>

      <ScrollView style={styles.content}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.gold} />
            <Text style={styles.loadingText}>加载中...</Text>
          </View>
        ) : (
          <>
            <View style={styles.vipHeader}>
              <View style={styles.vipIconContainer}>
                <Ionicons name="diamond" size={30} color={COLORS.gold} />
              </View>
              <Text style={styles.vipTitle}>尊享VIP会员权益</Text>
              <Text style={styles.vipSubtitle}>开启您的专属特权之旅</Text>
            </View>

        <View style={styles.benefitsContainer}>
          <View style={styles.benefitsRow}>
            <View style={styles.benefitItem}>
              <View style={styles.benefitIcon}>
                <Ionicons name="people" size={18} color={COLORS.gold} />
              </View>
              <Text style={styles.benefitText}>交易员集合</Text>
            </View>
            <View style={styles.benefitItem}>
              <View style={styles.benefitIcon}>
                <Ionicons name="pie-chart" size={18} color={COLORS.gold} />
              </View>
              <Text style={styles.benefitText}>实时持仓</Text>
            </View>
            <View style={styles.benefitItem}>
              <View style={styles.benefitIcon}>
                <Ionicons name="list" size={18} color={COLORS.gold} />
              </View>
              <Text style={styles.benefitText}>实时挂单</Text>
            </View>
            <View style={styles.benefitItem}>
              <View style={styles.benefitIcon}>
                <Ionicons name="time" size={18} color={COLORS.gold} />
              </View>
              <Text style={styles.benefitText}>历史调仓</Text>
            </View>
          </View>

          <View style={[styles.benefitsRow, { marginTop: 12 }]}>
            <View style={styles.benefitItem}>
              <View style={styles.benefitIcon}>
                <Ionicons name="flash" size={18} color={COLORS.gold} />
              </View>
              <Text style={styles.benefitText}>极速交易</Text>
            </View>
            <View style={styles.benefitItem}>
              <View style={styles.benefitIcon}>
                <Ionicons name="analytics" size={18} color={COLORS.gold} />
              </View>
              <Text style={styles.benefitText}>专业行情</Text>
            </View>
            <View style={styles.benefitItem}>
              <View style={styles.benefitIcon}>
                <Ionicons name="headset" size={18} color={COLORS.gold} />
              </View>
              <Text style={styles.benefitText}>专属客服</Text>
            </View>
            <View style={styles.benefitItem}>
              <View style={styles.benefitIcon}>
                <Ionicons name="shield-checkmark" size={18} color={COLORS.gold} />
              </View>
              <Text style={styles.benefitText}>安全保障</Text>
            </View>
          </View>

        </View>

            <Text style={styles.sectionTitle}>选择套餐</Text>
            
            <View style={styles.packagesContainer}>
              {packages.map((pkg) => (
            <TouchableOpacity 
              key={pkg.id} 
              style={[
                styles.packageCard, 
                selectedPackage === pkg.id && styles.selectedPackageCard
              ]}
              onPress={() => setSelectedPackage(pkg.id)}
            >
              {pkg.recommend && (
                <View style={styles.recommendBadge}>
                  <Text style={styles.recommendText}>推荐</Text>
                </View>
              )}
              <Text style={[styles.packageName, selectedPackage === pkg.id && styles.selectedText]}>{pkg.name}</Text>
              <View style={styles.priceContainer}>
              <Text style={[styles.price, selectedPackage === pkg.id && styles.selectedText]}>{pkg.price}</Text>
                <Text style={[styles.currency, selectedPackage === pkg.id && styles.selectedText, { marginLeft: 4 }]}>{(pkg.currency || 'usd').toUpperCase()}</Text>
              </View>
              <Text style={styles.originalPrice}>{pkg.originalPrice} {(pkg.currency || 'usd').toUpperCase()}</Text>
            </TouchableOpacity>
              ))}
            </View>

        {/* 兑换码区域 - 暂时隐藏 */}
        {/* <View style={styles.redemptionContainer}>
          <Text style={styles.sectionTitle}>兑换码</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="请输入兑换码"
              placeholderTextColor={COLORS.textMuted}
              value={redemptionCode}
              onChangeText={setRedemptionCode}
              autoCapitalize="characters"
              editable={!redeeming}
            />
            <TouchableOpacity 
              style={[styles.redeemButton, redeeming && styles.redeemButtonDisabled]} 
              onPress={handleRedeem}
              disabled={redeeming}
            >
              {redeeming ? (
                <ActivityIndicator size="small" color={COLORS.gold} />
              ) : (
                <Text style={styles.redeemButtonText}>兑换</Text>
              )}
            </TouchableOpacity>
          </View>
        </View> */}

            <View style={styles.description}>
              <Text style={styles.descriptionText}>
                1. 会员权益将在支付成功后立即生效。
              </Text>
              <Text style={styles.descriptionText}>
                2. 如有任何疑问，请联系客服。
              </Text>
            </View>
          </>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.payButton}>
          <Text style={styles.payButtonText}>立即开通</Text>
        </TouchableOpacity>
      </View>

      {/* Toast 提示 */}
      <Toast
        visible={showToast}
        message={toastMessage}
        type={toastType}
        onHide={() => setShowToast(false)}
      />
    </SafeAreaView>
  );
}

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
  headerRight: {
    flexDirection: 'row',
    gap: 12,
  },
  headerIcon: {
    padding: 4,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  vipHeader: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 5,
  },
  vipIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  vipTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.gold,
    marginBottom: 6,
  },
  vipSubtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  benefitsContainer: {
    marginBottom: 24,
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 16,
  },
  benefitsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  benefitItem: {
    flex: 1,
    alignItems: 'center',
  },
  benefitIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  benefitText: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textMain,
    marginBottom: 16,
  },
  packagesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  packageCard: {
    width: '31%',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.surface,
    position: 'relative',
  },
  selectedPackageCard: {
    borderColor: COLORS.gold,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  recommendBadge: {
    position: 'absolute',
    top: -10,
    backgroundColor: COLORS.gold,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  recommendText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#000',
  },
  packageName: {
    fontSize: 14,
    color: COLORS.textMain,
    marginBottom: 8,
    marginTop: 4,
  },
  selectedText: {
    color: COLORS.gold,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  currency: {
    fontSize: 12,
    color: COLORS.textMain,
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textMain,
  },
  period: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  originalPrice: {
    fontSize: 12,
    color: COLORS.textMuted,
    textDecorationLine: 'line-through',
  },
  description: {
    marginTop: 12,
  },
  descriptionText: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: 4,
    lineHeight: 18,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  payButton: {
    backgroundColor: COLORS.gold,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  payButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  redemptionContainer: {
    marginBottom: 20,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  input: {
    flex: 1,
    height: 44,
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    paddingHorizontal: 12,
    color: COLORS.textMain,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...(Platform.OS === 'web' && {
      outlineStyle: 'none' as any,
    }),
  },
  redeemButton: {
    height: 44,
    paddingHorizontal: 20,
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.gold,
    minWidth: 80,
  },
  redeemButtonDisabled: {
    opacity: 0.5,
  },
  redeemButtonText: {
    color: COLORS.gold,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: COLORS.textMuted,
  },
  platformBadge: {
    marginTop: 8,
    fontSize: 11,
    color: COLORS.primary,
    backgroundColor: 'rgba(46, 189, 133, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
});
