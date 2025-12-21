import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export const AddToHomeScreen = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  useEffect(() => {
    if (Platform.OS !== 'web') return;

    // 检查是否已经是 Standalone 模式
    // @ts-ignore
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
    if (isStandalone) return;

    // 检查是否已关闭过
    const hasClosed = localStorage.getItem('hasClosedAddToHomeScreen_v3');
    if (hasClosed) return;

    // @ts-ignore
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // 延迟显示，确保页面加载完成
    setTimeout(() => setIsVisible(true), 1000);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    if (dontShowAgain) {
      localStorage.setItem('hasClosedAddToHomeScreen_v3', 'true');
    }
  };

  if (!isVisible) return null;

  return (
    <View style={[styles.container, isIOS ? styles.containerIOS : styles.containerAndroid]}>
      <View style={styles.content}>
        <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
          <Ionicons name="close" size={20} color="#9ca3af" />
        </TouchableOpacity>
        
        <View style={styles.row}>
          <View style={styles.iconContainer}>
             <Ionicons name={isIOS ? "share-outline" : "add-circle-outline"} size={24} color="#2ebd85" />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.title}>安装到手机</Text>
            <Text style={styles.desc}>
              {isIOS 
                ? '点击底部工具栏的分享按钮\n然后选择“添加到主屏幕”' 
                : '点击浏览器菜单\n选择“安装应用”或“添加到主屏幕”'}
            </Text>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.checkboxContainer} 
          activeOpacity={0.8}
          onPress={() => setDontShowAgain(!dontShowAgain)}
        >
          <Ionicons 
            name={dontShowAgain ? "checkbox" : "square-outline"} 
            size={16} 
            color={dontShowAgain ? "#2ebd85" : "#9ca3af"} 
          />
          <Text style={styles.checkboxText}>不再提示</Text>
        </TouchableOpacity>

        {isIOS && (
          <View style={styles.arrowContainer}>
             <Ionicons name="arrow-down" size={24} color="#2ebd85" />
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 9999,
  },
  containerIOS: {
    bottom: 20, // 调整位置
  },
  containerAndroid: {
    top: 16, // Android 通常在顶部提示，或者也可以放底部
  },
  content: {
    backgroundColor: '#1c1c1e',
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 10,
    borderWidth: 1,
    borderColor: '#27272a',
  },
  closeBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 4,
    zIndex: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(46, 189, 133, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
    marginRight: 20,
  },
  title: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  desc: {
    color: '#9ca3af',
    fontSize: 13,
    lineHeight: 18,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingLeft: 52, // Align with text
  },
  checkboxText: {
    color: '#9ca3af',
    fontSize: 12,
    marginLeft: 6,
  },
  arrowContainer: {
    alignItems: 'center',
    marginTop: 12,
    marginBottom: -8,
  }
});
