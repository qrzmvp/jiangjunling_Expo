import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, SafeAreaView, StatusBar } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';

const COLORS = {
  backgroundDark: "#000000",
  cardDark: "#161616",
  cardHighlight: "#252525",
  textMainDark: "#F0F0F0",
  textSubDark: "#888888",
  borderDark: "#252525",
  white: "#FFFFFF",
};

export default function PersonalInfoPage() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.backgroundDark} />
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={24} color={COLORS.textSubDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>个人信息</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
      >
        <View style={styles.card}>
          
          {/* Avatar Row */}
          <TouchableOpacity style={styles.row}>
            <Text style={styles.label}>头像</Text>
            <View style={styles.rowRight}>
              <View style={styles.avatarContainer}>
                <Image 
                  source={{ uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuAaf9dVjkyC17LtClctTc-4sEEVvnJDQ0sqSp-elCOM8ljGaMwkhTiacOULcPPbYtSTu_lFPmnNtKsVxiOA5eHNZkJE8KHzJP-Ltx4rAvebxj5DVRDSPgWop3DQj8PuIxIIGVG_9IjKOT49af1xYWNvQQvVOeMdNj3kbhN4shXLBHo1Imm3YXyaQ_Bf8Gav9EMWI697UBzvaFwIV24Dxnf9tVPbk9jCB7kc-S_KzV8Gm3EW2a9jUrIkf3nvAt1kgTa8y1UdRtKUfg" }} 
                  style={styles.avatar}
                />
              </View>
              <Ionicons name="chevron-forward" size={20} color={COLORS.textSubDark} />
            </View>
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* Nickname Row */}
          <TouchableOpacity 
            style={styles.row}
            onPress={() => router.push('/profile/edit-nickname')}
          >
            <Text style={styles.label}>昵称</Text>
            <View style={styles.rowRight}>
              <Text style={styles.valueText}>西柚一点甜</Text>
              <Ionicons name="chevron-forward" size={20} color={COLORS.textSubDark} />
            </View>
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* Account Row */}
          <View style={styles.row}>
            <Text style={styles.label}>账号</Text>
            <View style={styles.rowRight}>
              <Text style={styles.valueText}>21356208</Text>
              <TouchableOpacity style={styles.copyButton}>
                <Text style={styles.copyButtonText}>复制</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Phone Row */}
          <View style={styles.row}>
            <Text style={styles.label}>手机号</Text>
            <View style={styles.rowRight}>
              <Text style={styles.valueText}>185****6733</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* QR Code Row */}
          <TouchableOpacity style={styles.row}>
            <Text style={styles.label}>二维码名片</Text>
            <View style={styles.rowRight}>
              <MaterialIcons name="qr-code-2" size={24} color={COLORS.textSubDark} style={{ marginRight: 4 }} />
              <Ionicons name="chevron-forward" size={20} color={COLORS.textSubDark} />
            </View>
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* Bio Row */}
          <TouchableOpacity style={styles.row}>
            <Text style={styles.label}>个人简介</Text>
            <View style={styles.rowRight}>
              <Text style={styles.bioText} numberOfLines={1}>投资是一种艺术，而不是科学</Text>
              <Ionicons name="chevron-forward" size={20} color={COLORS.textSubDark} />
            </View>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundDark,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textMainDark,
  },
  headerRight: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 32,
  },
  card: {
    backgroundColor: COLORS.cardDark,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.borderDark,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: COLORS.cardDark,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(37, 37, 37, 0.5)',
    marginHorizontal: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textMainDark,
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    justifyContent: 'flex-end',
  },
  valueText: {
    fontSize: 14,
    color: COLORS.textSubDark,
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.cardHighlight,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(37, 37, 37, 0.5)',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  copyButton: {
    backgroundColor: COLORS.cardHighlight,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginLeft: 8,
  },
  copyButtonText: {
    fontSize: 12,
    color: COLORS.textMainDark,
  },
  bioText: {
    fontSize: 14,
    color: COLORS.textSubDark,
    textAlign: 'right',
    flex: 1,
  },
});
