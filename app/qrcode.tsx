import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Svg, { Path, Rect, Circle } from 'react-native-svg';

const { width } = Dimensions.get('window');

const COLORS = {
  background: "#000000",
  cardDark: "#161616",
  cardHighlight: "#252525",
  textMain: "#F0F0F0",
  textSub: "#888888",
  accentOrange: "#F0B90B",
  borderDark: "#252525",
  white: "#ffffff",
  black: "#000000",
};

export default function QRCodePage() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <MaterialIcons name="arrow-back-ios" size={20} color={COLORS.textMain} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>二维码名片</Text>
        <View style={{ width: 40 }} /> 
      </View>

      <View style={styles.content}>
        {/* Card */}
        <View style={styles.card}>
          {/* Card Top (White) */}
          <View style={styles.cardTop}>
            <View style={styles.logoContainer}>
              <View style={styles.logoIcon}>
                <MaterialIcons name="sports-motorsports" size={24} color="white" />
              </View>
              <View style={styles.logoTextContainer}>
                <Text style={styles.appName}>将军令</Text>
                <Text style={styles.appSlogan}>GENERAL'S ORDER</Text>
              </View>
            </View>
            {/* Decorative Gradient/Shape */}
            <View style={styles.decorativeShape} />
          </View>

          {/* Card Bottom (Dark) */}
          <View style={styles.cardBottom}>
            {/* Avatar */}
            <View style={styles.avatarWrapper}>
              <View style={styles.avatarContainer}>
                <Image 
                  source={{ uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuAd41aAXypJ-KoThdlQwaGvekk668Wn24nqPwjwrYnBoIOw9pU3-LQYE9Fsl8_qQILrWGjvZyQITeAQOBevDrIemfVF3QzYQpYfK1w5ZOOhnFMSx6XdJI_f4eLVb5Pd4PZyDEhf5-VCRsq-Oqx2lYS1BPhzGVQWlahH0z-uyOAo3QeC4LaKCSbr-e5l55Ch6YEltOtm-mWr9rnLtfioCWZP9g0iH6wA-kJ2MSoJl36o4IVmy332j2yZ3eD-iy5BIINUrxaacF_rUA" }} 
                  style={styles.avatar} 
                />
              </View>
            </View>

            <Text style={styles.username}>Alex_Trader</Text>
            <View style={styles.uidBadge}>
              <Text style={styles.uidText}>UID: 82910</Text>
            </View>

            {/* QR Code Area */}
            <View style={styles.qrCodeContainer}>
              <Svg width="180" height="180" viewBox="0 0 100 100" color="black">
                <Path d="M10,10 h20 v20 h-20 z M15,15 v10 h10 v-10 z" fill="currentColor" />
                <Path d="M70,10 h20 v20 h-20 z M75,15 v10 h10 v-10 z" fill="currentColor" />
                <Path d="M10,70 h20 v20 h-20 z M15,75 v10 h10 v-10 z" fill="currentColor" />
                <Path d="M12.5,12.5 h15 v15 h-15 z M72.5,12.5 h15 v15 h-15 z M12.5,72.5 h15 v15 h-15 z" fill="none" stroke="currentColor" strokeWidth="5" />
                
                {/* Random rects to simulate QR code data */}
                <Rect x="40" y="10" width="5" height="5" fill="currentColor" />
                <Rect x="50" y="10" width="5" height="5" fill="currentColor" />
                <Rect x="60" y="15" width="5" height="5" fill="currentColor" />
                <Rect x="45" y="20" width="5" height="5" fill="currentColor" />
                <Rect x="55" y="25" width="5" height="5" fill="currentColor" />
                <Rect x="40" y="40" width="5" height="5" fill="currentColor" />
                <Rect x="50" y="45" width="5" height="5" fill="currentColor" />
                <Rect x="60" y="40" width="5" height="5" fill="currentColor" />
                <Rect x="70" y="50" width="5" height="5" fill="currentColor" />
                <Rect x="80" y="45" width="5" height="5" fill="currentColor" />
                <Rect x="10" y="50" width="5" height="5" fill="currentColor" />
                <Rect x="20" y="45" width="5" height="5" fill="currentColor" />
                <Rect x="30" y="50" width="5" height="5" fill="currentColor" />
                <Rect x="75" y="70" width="5" height="5" fill="currentColor" />
                <Rect x="85" y="80" width="5" height="5" fill="currentColor" />
                <Rect x="70" y="85" width="5" height="5" fill="currentColor" />
                <Rect x="50" y="75" width="5" height="5" fill="currentColor" />
                <Rect x="60" y="80" width="5" height="5" fill="currentColor" />
                <Rect x="45" y="60" width="5" height="5" fill="currentColor" />
                <Rect x="55" y="65" width="5" height="5" fill="currentColor" />

                {/* Center Logo */}
                <Circle cx="50" cy="50" r="7" fill="white" />
                <Circle cx="50" cy="50" r="5" fill="black" />
              </Svg>
            </View>

            <Text style={styles.scanText}>扫码上方二维码，好友加我</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.actionButtonOutline}>
            <Text style={styles.actionButtonTextOutline}>保存图片</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButtonPrimary}>
            <Text style={styles.actionButtonTextPrimary}>分享</Text>
          </TouchableOpacity>
        </View>
      </View>
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
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textMain,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.borderDark,
    backgroundColor: COLORS.cardDark,
  },
  cardTop: {
    height: 128,
    backgroundColor: COLORS.white,
    padding: 24,
    position: 'relative',
    flexDirection: 'row',
  },
  logoContainer: {
    flexDirection: 'row',
    gap: 12,
    zIndex: 2,
  },
  logoIcon: {
    width: 40,
    height: 40,
    backgroundColor: COLORS.black,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  logoTextContainer: {
    justifyContent: 'center',
  },
  appName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.black,
    lineHeight: 20,
  },
  appSlogan: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#6b7280', // gray-500
    marginTop: 2,
    letterSpacing: 1,
  },
  decorativeShape: {
    position: 'absolute',
    right: -20,
    top: 0,
    width: 128,
    height: '100%',
    backgroundColor: '#f3f4f6', // gray-100
    opacity: 0.5,
    transform: [{ skewX: '-12deg' }, { translateX: 40 }],
  },
  cardBottom: {
    backgroundColor: '#1A1A1A',
    alignItems: 'center',
    paddingTop: 56,
    paddingBottom: 40,
    paddingHorizontal: 24,
    position: 'relative',
  },
  avatarWrapper: {
    position: 'absolute',
    top: -48,
    left: '50%',
    marginLeft: -48, // half of width
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#1A1A1A',
    padding: 6,
    zIndex: 10,
  },
  avatarContainer: {
    width: '100%',
    height: '100%',
    borderRadius: 48,
    overflow: 'hidden',
    backgroundColor: COLORS.cardHighlight,
    borderWidth: 2,
    borderColor: COLORS.borderDark,
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  username: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textMain,
    marginBottom: 4,
  },
  uidBadge: {
    backgroundColor: COLORS.cardHighlight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(37, 37, 37, 0.5)',
    marginBottom: 24,
  },
  uidText: {
    fontSize: 12,
    color: COLORS.textSub,
  },
  qrCodeContainer: {
    padding: 16,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  scanText: {
    fontSize: 12,
    color: COLORS.textSub,
    letterSpacing: 0.5,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 32,
    width: '100%',
    maxWidth: 400,
  },
  actionButtonOutline: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: 'rgba(240, 240, 240, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonTextOutline: {
    color: COLORS.textMain,
    fontSize: 14,
    fontWeight: '600',
  },
  actionButtonPrimary: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 100,
    backgroundColor: COLORS.accentOrange,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.accentOrange,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 5,
  },
  actionButtonTextPrimary: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
});
