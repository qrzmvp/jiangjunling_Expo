import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, SafeAreaView, StatusBar, Modal } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import ImageCropper from './components/ImageCropper';

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
  const [avatarUri, setAvatarUri] = useState("https://lh3.googleusercontent.com/aida-public/AB6AXuAaf9dVjkyC17LtClctTc-4sEEVvnJDQ0sqSp-elCOM8ljGaMwkhTiacOULcPPbYtSTu_lFPmnNtKsVxiOA5eHNZkJE8KHzJP-Ltx4rAvebxj5DVRDSPgWop3DQj8PuIxIIGVG_9IjKOT49af1xYWNvQQvVOeMdNj3kbhN4shXLBHo1Imm3YXyaQ_Bf8Gav9EMWI697UBzvaFwIV24Dxnf9tVPbk9jCB7kc-S_KzV8Gm3EW2a9jUrIkf3nvAt1kgTa8y1UdRtKUfg");
  const [modalVisible, setModalVisible] = useState(false);
  const [cropperVisible, setCropperVisible] = useState(false);
  const [tempImageUri, setTempImageUri] = useState<string | null>(null);

  const pickImage = async () => {
    setModalVisible(false);
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false, // 关闭系统裁剪，使用自定义裁剪
      quality: 1,
    });

    if (!result.canceled) {
      setTempImageUri(result.assets[0].uri);
      setCropperVisible(true);
    }
  };

  const takePhoto = async () => {
    setModalVisible(false);
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    
    if (permissionResult.granted === false) {
      alert("需要相机权限来拍摄照片");
      return;
    }

    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: false, // 关闭系统裁剪，使用自定义裁剪
      quality: 1,
    });

    if (!result.canceled) {
      setTempImageUri(result.assets[0].uri);
      setCropperVisible(true);
    }
  };

  const handleCropComplete = (uri: string) => {
    setAvatarUri(uri);
    setCropperVisible(false);
    setTempImageUri(null);
  };
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
          <TouchableOpacity style={styles.row} onPress={() => setModalVisible(true)}>
            <Text style={styles.label}>头像</Text>
            <View style={styles.rowRight}>
              <View style={styles.avatarContainer}>
                <Image 
                  source={{ uri: avatarUri }} 
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

        {/* Logout Button */}
        <TouchableOpacity 
          style={styles.logoutButton}
          activeOpacity={0.7}
          onPress={() => {
            console.log('Logout pressed');
            // router.replace('/login'); // Uncomment when login page exists
          }}
        >
          <Text style={styles.logoutText}>退出登录</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalButtonsContainer}>
              <TouchableOpacity style={styles.modalButton} onPress={takePhoto}>
                <Text style={styles.modalButtonText}>拍照</Text>
              </TouchableOpacity>
              <View style={styles.modalDivider} />
              <TouchableOpacity style={styles.modalButton} onPress={pickImage}>
                <Text style={styles.modalButtonText}>从手机相册选择</Text>
              </TouchableOpacity>

      <ImageCropper
        visible={cropperVisible}
        imageUri={tempImageUri}
        onCancel={() => setCropperVisible(false)}
        onComplete={handleCropComplete}
      />
            </View>
            
            <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => setModalVisible(false)}>
              <Text style={styles.modalButtonText}>取消</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    padding: 16,
    paddingBottom: 34,
  },
  modalButtonsContainer: {
    backgroundColor: '#1C1C1E',
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 8,
  },
  modalButton: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1C1C1E',
  },
  modalDivider: {
    height: 1,
    backgroundColor: '#2C2C2E',
  },
  cancelButton: {
    borderRadius: 14,
    backgroundColor: '#1C1C1E',
  },
  modalButtonText: {
    fontSize: 17,
    color: '#FFFFFF',
    fontWeight: '400',
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
  logoutButton: {
    marginTop: 24,
    backgroundColor: COLORS.cardDark,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderDark,
  },
  logoutText: {
    color: '#FF4D4F',
    fontSize: 16,
    fontWeight: '600',
  },
});
