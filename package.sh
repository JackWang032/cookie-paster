#!/bin/bash

# 定义颜色
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 定义打包目标文件名
PACKAGE_NAME="cookie-paster.zip"

echo -e "${BLUE}开始打包 Cookie Paster 扩展...${NC}"

# 创建临时目录
TEMP_DIR="temp_package"
echo "创建临时目录..."
rm -rf $TEMP_DIR
mkdir -p $TEMP_DIR

# 列出需要包含的文件
echo "复制必要文件到临时目录..."
cp manifest.json $TEMP_DIR/
cp popup.html $TEMP_DIR/
cp popup.js $TEMP_DIR/
cp background.js $TEMP_DIR/
cp README.md $TEMP_DIR/

# 复制图标文件夹
echo "复制图标文件..."
mkdir -p $TEMP_DIR/icons
cp -r icons/*.png $TEMP_DIR/icons/ 2>/dev/null

# 删除旧的zip文件
if [ -f "$PACKAGE_NAME" ]; then
  echo "删除已存在的zip文件..."
  rm "$PACKAGE_NAME"
fi

# 进入临时目录并创建zip文件
echo "创建zip文件..."
cd $TEMP_DIR
zip -r "../$PACKAGE_NAME" .
cd ..

# 清理临时目录
echo "清理临时文件..."
rm -rf $TEMP_DIR

# 检查是否成功
if [ -f "$PACKAGE_NAME" ]; then
  echo -e "${GREEN}打包完成!${NC}"
  echo -e "文件已保存为: $(pwd)/$PACKAGE_NAME"
  echo -e "文件大小: $(du -h $PACKAGE_NAME | cut -f1)"
else
  echo "打包失败!"
fi 