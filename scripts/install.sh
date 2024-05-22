#!/bin/bash

APP_NAME="okmes-webcontainer-desktop"

VERSION="0.0.6"

DOWNLOAD_URL="https://gitee.com/sunpn/okmesh-webcontainer-linux/releases/download/v${VERSION}/okmes-webcontainer-desktop_${VERSION}_arm64.deb"

echo "下载安装包"

curl -sSL ${DOWNLOAD_URL} -o ${APP_NAME}.deb && sudo dpkg -i ${APP_NAME}.deb

sudo /opt/OkMes-WebContainer/${APP_NAME}
