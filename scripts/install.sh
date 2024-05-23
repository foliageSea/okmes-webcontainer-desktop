version="0.0.9"
url="https://gitee.com/sunpn/okmesh-webcontainer-linux/releases/download/v${version}/okmes-webcontainer-desktop_${version}_arm64.deb"


echo "📡 正在下载安装包... ${url}"
curl -L -o install.deb "${url}"
if [ $? -ne 0 ]; then
    echo "下载失败"
    exit 1
fi

# 检查下载的文件是否存在且非空
if [ ! -s install.deb ]; then
    echo "下载的文件不存在或为空"
    exit 1
fi

echo "📦 正在安装..."
sudo dpkg -i install.deb
if [ $? -ne 0 ]; then
    echo "安装失败，尝试修复依赖..."
    sudo apt-get install -f -y
    if [ $? -ne 0 ]; then
        echo "修复依赖失败"
        exit 1
    fi
    # 再次尝试安装
    sudo dpkg -i install.deb
    if [ $? -ne 0 ]; then
        echo "安装仍然失败"
        exit 1
    fi
fi

echo "🚀 正在启动..."
if [ -x "/opt/OkMes-WebContainer/okmes-webcontainer-desktop" ]; then
    /opt/OkMes-WebContainer/okmes-webcontainer-desktop --no-sandbox
else
    echo "启动文件不存在或不可执行"
    exit 1
fi
