# 客服二维码调试指南

## 当前配置

### 文件位置
```
/Users/qrz/jiangjunling_Expo/assets/images/customer-service-qr.jpg
```

### 文件信息
- 大小：216KB
- 格式：JPEG (586x694像素)
- 文件名：customer-service-qr.jpg（英文，避免编码问题）

## 最新修改

### 使用 expo-asset 加载图片
```typescript
const asset = await Asset.fromModule(customerQRImage).downloadAsync();
```

### Web 端下载流程
1. 加载 Asset 资源
2. 使用 fetch 获取图片数据
3. 转换为 Blob
4. 创建下载链接
5. 触发下载

### 移动端保存流程
1. 加载 Asset 资源
2. 请求相册权限
3. 使用 localUri 保存到相册

## 调试步骤

### 1. 重启开发服务器
```bash
# 停止当前服务器（Ctrl+C）
# 清除缓存并重新启动
npx expo start -c
```

### 2. 查看控制台日志

**Web 端应该看到：**
```
开始保存图片, Platform: web
Asset 信息: { localUri: ..., uri: ..., width: 586, height: 694 }
Web端下载开始
下载 URI: ...
Blob 大小: 221184 bytes  <-- 应该看到具体的字节数
Web端下载完成
```

**iOS 端应该看到：**
```
开始保存图片, Platform: ios
Asset 信息: { localUri: file://..., uri: ..., width: 586, height: 694 }
移动端保存开始
权限状态: granted
保存路径: file://...
保存成功: ...
```

### 3. 常见问题

#### Web 端下载空文件
- **问题**：Blob 大小为 0
- **原因**：图片未正确加载到内存
- **解决**：检查 Asset 信息是否包含有效的 URI

#### iOS 端保存失败
- **问题**：Error: Asset couldn't be saved
- **原因**：localUri 为 null 或权限不足
- **解决**：
  1. 检查 `Info.plist` 权限配置
  2. 确保 Asset.downloadAsync() 成功

#### 图片不显示
- **问题**：Image 组件显示空白
- **原因**：require() 路径错误
- **解决**：确认文件路径正确

## 权限配置

### iOS (Info.plist)
确保包含以下权限：
```xml
<key>NSPhotoLibraryAddUsageDescription</key>
<string>我们需要访问您的相册以保存二维码图片</string>
<key>NSPhotoLibraryUsageDescription</key>
<string>我们需要访问您的相册以保存二维码图片</string>
```

### Android (AndroidManifest.xml)
```xml
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE"/>
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE"/>
```

## 测试清单

- [ ] Web 端：图片正常显示
- [ ] Web 端：点击下载按钮，文件正常下载（不是空文件）
- [ ] Web 端：查看控制台日志，Blob 大小应为 ~220KB
- [ ] iOS 端：图片正常显示
- [ ] iOS 端：点击下载按钮，相册中能找到图片
- [ ] iOS 端：查看控制台日志，localUri 不为空
- [ ] Android 端：图片正常显示
- [ ] Android 端：点击下载按钮，相册中能找到图片

## 如果还有问题

请提供以下信息：
1. 平台（Web/iOS/Android）
2. 完整的控制台日志
3. 错误提示截图
