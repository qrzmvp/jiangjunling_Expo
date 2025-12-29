# 客服二维码下载功能修复总结

## 问题描述
1. **Web端**: 点击下载按钮时下载的是空白文件（0字节）
2. **iOS端**: 点击联系客服后图片无法显示，点击下载报错

## 根本原因

### iOS 问题
- **缺少相册写入权限**: `Info.plist` 中只有 `NSPhotoLibraryUsageDescription`（读取相册权限），缺少 `NSPhotoLibraryAddUsageDescription`（保存到相册权限）
- iOS 系统要求保存照片时必须声明此权限，否则 `MediaLibrary.createAssetAsync()` 会失败

### Web 问题
- **Asset 加载方式不适用**: `Asset.fromModule()` 在 Web 环境下无法正确加载本地图片数据
- Web 环境下需要直接使用 `require()` 返回的路径进行 fetch

## 修复方案

### 1. iOS 权限修复
**文件**: `ios/jijiangling/Info.plist`

添加相册保存权限：
```xml
<key>NSPhotoLibraryAddUsageDescription</key>
<string>Allow $(PRODUCT_NAME) to save photos to your album</string>
```

### 2. Web 下载逻辑优化
**文件**: `app/qrcode.tsx`

**修改前**:
```typescript
// 先加载 Asset，然后在 Web 和移动端都使用
const asset = await Asset.fromModule(customerQRImage).downloadAsync();

if (Platform.OS === 'web') {
  const imageUri = asset.localUri || asset.uri; // ❌ Web 下可能为空或无效
  const response = await fetch(imageUri);
  // ...
}
```

**修改后**:
```typescript
if (Platform.OS === 'web') {
  // ✅ Web 端直接使用 require 返回的路径
  const imageModule = customerQRImage;
  const imagePath = typeof imageModule === 'number' 
    ? imageModule 
    : (imageModule.uri || imageModule);
  
  const response = await fetch(imagePath); // 直接 fetch 本地资源
  const blob = await response.blob();
  // ... 创建下载链接
} else {
  // ✅ 移动端才使用 Asset 加载
  const asset = await Asset.fromModule(customerQRImage).downloadAsync();
  await MediaLibrary.createAssetAsync(asset.localUri);
}
```

### 3. 代码清理
- 移除未使用的 `import * as FileSystem from 'expo-file-system'`
- Web 端不再需要加载 Asset，减少不必要的异步操作

## 技术细节

### Web 环境下的资源处理
在 Expo Web 环境中：
- `require('../assets/images/xxx.jpg')` 返回的是可以直接 fetch 的路径
- 通过 `fetch(imagePath)` 获取图片 Blob 数据
- 使用 `window.URL.createObjectURL(blob)` 创建下载链接
- 通过动态创建 `<a>` 标签触发下载

### iOS 相册权限说明
- `NSPhotoLibraryUsageDescription`: 读取相册权限（查看照片）
- `NSPhotoLibraryAddUsageDescription`: 写入相册权限（保存照片）✅ 新增
- 两者都需要声明才能完整支持相册功能

## 测试验证

### Web 端
1. 点击"下载二维码"按钮
2. 检查下载的文件大小应为 ~216KB（不是0字节）
3. 打开下载的图片应能正常显示客服二维码

### iOS 端
1. 点击"联系客服"应正常显示二维码图片
2. 点击"下载二维码"首次会弹出权限请求
3. 授权后图片应保存到相册
4. 在相册中找到刚保存的客服二维码图片

### Android 端
应该无需修改，原有逻辑已支持（与 iOS 使用相同的 Asset 加载方式）

## 注意事项

1. **iOS 需要重新构建**: 修改了 `Info.plist`，需要重新运行 iOS 构建
   ```bash
   npx expo run:ios
   # 或
   cd ios && pod install && cd ..
   ```

2. **Web 无需额外配置**: 修改后直接刷新即可生效

3. **权限处理**: iOS/Android 首次保存时会弹出权限请求，用户拒绝后需引导到设置中手动开启

## 文件变更清单
- ✅ `ios/jijiangling/Info.plist` - 添加相册保存权限
- ✅ `app/qrcode.tsx` - 优化 Web/移动端下载逻辑
- ✅ 移除未使用的 FileSystem 导入

## 相关文件
- 图片资源: `assets/images/customer-service-qr.jpg` (216KB, 586x694px)
- 调试指南: `QR_CODE_DEBUG_GUIDE.md`
