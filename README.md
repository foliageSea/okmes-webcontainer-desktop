# OkMes-WebContainer

## 项目开始

### 安装

```bash
$ pnpm install
```

### 开发

```bash
$ pnpm dev
```

### 构建

```bash
# For windows
$ pnpm build:win

# For macOS
$ pnpm build:mac

# For Linux
$ pnpm build:linux
```

### Debian 应用安装

```bash
# 安装
sudo dpkg -i *.deb
# 查看
sudo dpkg -l | grep *
# 卸载
sudo dpkg -r *
```

### 快速安装

```bash
curl -sSL https://gitee.com/sunpn/okmesh-webcontainer-linux/raw/main/scripts/install.sh -o install.sh && sudo bash install.sh
```
