import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Image, Dimensions, ScrollView, ActivityIndicator } from 'react-native';
import * as ImageManipulator from 'expo-image-manipulator';
import Svg, { Defs, Mask, Rect, Circle } from 'react-native-svg';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CROP_SIZE = SCREEN_WIDTH - 40; // 裁剪区域大小
const MASK_COLOR = 'rgba(0, 0, 0, 0.7)';

interface ImageCropperProps {
  visible: boolean;
  imageUri: string | null;
  onCancel: () => void;
  onComplete: (uri: string) => void;
}

export default function ImageCropper({ visible, imageUri, onCancel, onComplete }: ImageCropperProps) {
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  
  // 缩放比例和偏移量
  const [scale, setScale] = useState(1);
  const [contentOffset, setContentOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (imageUri) {
      Image.getSize(imageUri, (width, height) => {
        // 计算适应屏幕的初始尺寸
        const ratio = width / height;
        let displayWidth = SCREEN_WIDTH;
        let displayHeight = SCREEN_WIDTH / ratio;
        
        // 如果高度太小，基于高度计算
        if (displayHeight < CROP_SIZE) {
            displayHeight = CROP_SIZE;
            displayWidth = CROP_SIZE * ratio;
        }

        setImageSize({ width: displayWidth, height: displayHeight });
      });
    }
  }, [imageUri]);

  const handleCrop = async () => {
    if (!imageUri) return;
    setLoading(true);

    try {
      const originalSize = await new Promise<{width: number, height: number}>((resolve) => {
          Image.getSize(imageUri, (width, height) => resolve({width, height}));
      });

      // 计算当前显示的图片相对于原图的缩放比例
      const baseScale = imageSize.width / originalSize.width;
      const totalScale = baseScale * scale;

      // 裁剪区域在内容中的坐标
      // ScrollView 的 contentOffset 是视口左上角相对于内容左上角的偏移
      // 裁剪框中心始终在屏幕中心
      // 屏幕中心相对于视口左上角是 (SCREEN_WIDTH/2, SCREEN_HEIGHT/2)
      // 所以裁剪框中心相对于内容左上角是 (contentOffset.x + SCREEN_WIDTH/2, contentOffset.y + SCREEN_HEIGHT/2)
      
      // 裁剪区域左上角相对于内容左上角：
      const cropX_in_content = contentOffset.x + (SCREEN_WIDTH - CROP_SIZE) / 2;
      const cropY_in_content = contentOffset.y + (SCREEN_HEIGHT - CROP_SIZE) / 2;
      
      // 映射回原图坐标
      const originX = cropX_in_content / totalScale;
      const originY = cropY_in_content / totalScale;
      const cropWidth = CROP_SIZE / totalScale;
      const cropHeight = CROP_SIZE / totalScale;

      const result = await ImageManipulator.manipulateAsync(
        imageUri,
        [
          {
            crop: {
              originX: Math.max(0, originX),
              originY: Math.max(0, originY),
              width: cropWidth,
              height: cropHeight,
            },
          },
          { resize: { width: 500, height: 500 } }
        ],
        { compress: 0.9, format: ImageManipulator.SaveFormat.JPEG }
      );

      onComplete(result.uri);
    } catch (error) {
      console.error(error);
      alert('裁剪失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  if (!visible || !imageUri) return null;

  const paddingH = (SCREEN_WIDTH - CROP_SIZE) / 2;
  const paddingV = (SCREEN_HEIGHT - CROP_SIZE) / 2;

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <View style={styles.container}>
        <ScrollView
          ref={scrollRef}
          style={styles.scrollView}
          contentContainerStyle={{
            paddingHorizontal: paddingH,
            paddingVertical: paddingV,
          }}
          maximumZoomScale={3}
          minimumZoomScale={1}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          bounces={false}
          onScroll={(e) => {
            setContentOffset(e.nativeEvent.contentOffset);
            // @ts-ignore
            if (e.nativeEvent.zoomScale) {
                // @ts-ignore
                setScale(e.nativeEvent.zoomScale);
            }
          }}
          scrollEventThrottle={16}
        >
          <Image
            source={{ uri: imageUri }}
            style={{ width: imageSize.width, height: imageSize.height }}
            resizeMode="contain"
          />
        </ScrollView>

        {/* SVG 遮罩层 */}
        <View style={styles.maskContainer} pointerEvents="none">
          <Svg height="100%" width="100%" style={StyleSheet.absoluteFill}>
            <Defs>
              <Mask id="mask">
                <Rect x="0" y="0" width="100%" height="100%" fill="white" />
                <Circle cx={SCREEN_WIDTH / 2} cy={SCREEN_HEIGHT / 2} r={CROP_SIZE / 2} fill="black" />
              </Mask>
            </Defs>
            <Rect x="0" y="0" width="100%" height="100%" fill={MASK_COLOR} mask="url(#mask)" />
            {/* 绘制一个白色边框圆圈，增强视觉效果 */}
            <Circle 
                cx={SCREEN_WIDTH / 2} 
                cy={SCREEN_HEIGHT / 2} 
                r={CROP_SIZE / 2} 
                stroke="rgba(255,255,255,0.5)" 
                strokeWidth="1" 
                fill="transparent" 
            />
          </Svg>
        </View>

        {/* 底部按钮 */}
        <View style={styles.footer}>
          <TouchableOpacity onPress={onCancel} style={styles.button}>
            <Text style={styles.buttonText}>取消</Text>
          </TouchableOpacity>
          <Text style={styles.title}>移动和缩放</Text>
          <TouchableOpacity onPress={handleCrop} style={styles.button} disabled={loading}>
            {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>完成</Text>}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  scrollView: {
    flex: 1,
  },
  maskContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  button: {
    padding: 10,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '500',
  },
});
