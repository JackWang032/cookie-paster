# Cookie Paster - Chrome 扩展

一个简单的 Chrome 扩展，可以一键从当前访问的页面中拷贝 cookies，并且可以在其他网站写入拷贝的 cookies。

## 功能特点

- 一键复制当前网站的 cookies
- 一键粘贴 cookies 到其他网站
- 自动处理 cookie 的域名适配
- 简单易用的弹出窗口界面

## 安装方法

### 从 Chrome 网上应用店安装
（尚未发布到应用商店）

### 手动安装
1. 下载此仓库的所有文件
2. 打开 Chrome 浏览器，进入扩展程序页面（chrome://extensions/）
3. 打开右上角的"开发者模式"
4. 点击"加载已解压的扩展程序"按钮
5. 选择包含此项目文件的文件夹

## 使用方法

1. 在想要复制 cookies 的网站上，点击扩展图标
2. 点击"复制当前网站的 Cookies"按钮
3. 导航到想要粘贴 cookies 的网站
4. 点击扩展图标
5. 点击"粘贴 Cookies 到当前网站"按钮

## 注意事项

- 扩展需要访问网站 cookies 的权限才能正常工作
- 跨域写入 cookies 时会自动调整 domain 为目标网站的域名
- 某些具有安全限制的 cookies 可能无法被正确复制或粘贴

## 开发

### 图标生成

项目包含一个简单的图标生成器，位于 `icons/icon_generator.html`。您可以使用此工具生成扩展所需的图标。

### 项目结构

- `manifest.json`: 扩展配置文件
- `popup.html`: 弹出窗口的 HTML
- `popup.js`: 弹出窗口的 JavaScript 逻辑
- `background.js`: 后台脚本，处理 cookie 操作
- `icons/`: 图标文件夹

## 技术详情

- 使用 Chrome 扩展 Manifest V3 规范
- 使用 Chrome cookies API 进行 cookie 操作
- 使用 Chrome storage API 存储临时数据

## 隐私政策

此扩展不会收集或传输任何个人数据或 cookie 信息到外部服务器。所有操作都在本地完成。 