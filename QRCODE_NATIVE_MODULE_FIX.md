# QR Code 页面原生模块修复总结

## 修复日期
2026年1月2日

## 问题描述

### 1. 缺少原生模块 ExpoMediaLibrary
```
ERROR [Error: Cannot find native module 'ExpoMediaLibrary']
```

### 2. 路由警告
```
WARN [Layout children]: No route named "qrcode" exists in nested children
WARN Route "./qrcode.tsx" is missing the required default export
```

## 根本原因

1. **原生模块未链接**: 虽然 `expo-media-library` 已在 `package.json` 中，但原生 iOS 代码未正确链接
2. **缺少插件配置**: `app.json` 中缺少 `expo-media-library` 插件配置

## 解决方案

### 1. 添加插件配置到 app.json

在 `app.json` 的 `plugins` 数组中添加:

```json
[
  "expo-media-library",
  {
    "photosPermission": "Allow $(PRODUCT_NAME) to access your photos",
    "savePhotosPermission": "Allow $(PRODUCT_NAME) to save photos to your album",
    "isAccessMediaLocationEnabled": true
  }
]
```

### 2. 重新安装依赖

```bash
npx expo install expo-media-library
```

### 3. 重新安装 CocoaPods

```bash
cd ios && pod install && cd ..
```

### 4. 重新构建 iOS 应用

```bash
npx expo run:ios
```

## 修改的文件

### `/app.json`
添加了 `expo-media-library` 插件配置，包含:
- 相册访问权限描述
- 保存照片权限描述
- 启用媒体位置访问

## 技术细节

### iOS 权限
Info.plist 已包含必要的权限:
- `NSPhotoLibraryUsageDescription` - 访问相册
- `NSPhotoLibraryAddUsageDescription` - 保存到相册

### 原生模块链接
通过以下步骤确保原生模块正确链接:
1. 在 app.json 中配置插件
2. 运行 `pod install` 更新 CocoaPods 依赖
3. 重新构建应用以链接原生代码

## 功能说明

qrcode.tsx 页面提供以下功能:
- 📸 显示客服二维码
- 📋 复制电报ID到剪贴板
- 💾 保存二维码图片到相册
  - iOS/Android: 使用 `expo-media-library`
  - Web: 使用浏览器下载API

## 预期结果

✅ iOS 应用可以正常导入 `expo-media-library`
✅ 用户可以保存二维码到相册
✅ 应用启动时不再显示模块缺失错误
✅ qrcode 路由正常工作

## 测试建议

1. **iOS 设备测试**
   - [ ] 应用正常启动，无报错
   - [ ] 点击"保存图片"按钮
   - [ ] 首次使用时请求相册权限
   - [ ] 授权后图片成功保存到相册
   - [ ] 显示成功提示

2. **Android 测试**
   - [ ] 应用正常启动
   - [ ] 保存图片功能正常
   - [ ] 权限请求正常

3. **Web 测试**
   - [ ] 点击"保存图片"触发下载
   - [ ] 文件名为"客服二维码.jpg"

## 注意事项

1. 每次修改 `app.json` 中的插件配置后，需要:
   - 重新运行 `pod install` (iOS)
   - 重新构建应用

2. 原生模块只能在原生构建中使用，Expo Go 可能不支持

3. 确保用户授予相册访问权限，否则保存功能会失败
