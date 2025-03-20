# Coder Tools Platform

一个基于 Vue.js 构建的开发者工具平台，提供多种常用的开发工具。

## 功能特性

平台目前提供以下工具：

- **JSON 工具**：JSON 格式化、验证、压缩和转换功能
- **时间戳转换**：在不同时间格式之间快速转换，支持多种时区
- **Java 工具**：Java 相关的开发辅助工具，包括代码格式化、类结构分析等

## 界面预览

- 响应式布局，适配不同屏幕尺寸
- 左侧悬浮工具栏，鼠标悬停时显示功能名称
- 毛玻璃效果和渐变色设计

## 安装与运行

### 环境要求

- Node.js 12.x 或更高版本
- npm 6.x 或更高版本

### 本地开发

1. 克隆项目到本地

```bash
git clone https://github.com/yourusername/coder-tools-platform.git
cd coder-tools-platform
```

2. 安装依赖

```bash
npm install
```

3. 安装 Font Awesome 图标库

```bash
npm install @fortawesome/fontawesome-free
```

4. 在 main.js 中导入 Font Awesome

```javascript
import '@fortawesome/fontawesome-free/css/all.min.css'
```

5. 启动开发服务器

```bash
npm run serve
```

访问 `http://localhost:8080` 查看应用。

### 构建生产版本

```bash
npm run build
```

构建完成后，生成的文件将位于 `dist` 目录。

### 代码检查

```bash
npm run lint
```

## Nginx 部署教程

### 1. 构建生产版本

```bash
npm run build
```

### 2. 安装 Nginx

根据您的操作系统安装 Nginx：

#### Ubuntu/Debian

```bash
sudo apt update
sudo apt install nginx
```

#### CentOS/RHEL

```bash
sudo yum install epel-release
sudo yum install nginx
```

#### macOS

```bash
brew install nginx
```

### 3. 配置 Nginx

创建或编辑 Nginx 配置文件：

```bash
sudo nano /etc/nginx/conf.d/coder-tools.conf
```

添加以下配置：

```nginx
server {
    listen 80;
    server_name your-domain.com;  # 替换为您的域名或 IP

    root /path/to/coder-tools-platform/dist;  # 替换为项目 dist 目录的实际路径
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;  # 用于支持 vue-router 的 history 模式
    }

    # 缓存静态资源
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, max-age=31536000";
    }

    # 安全相关头信息
    add_header X-Content-Type-Options "nosniff";
    add_header X-XSS-Protection "1; mode=block";
}
```

### 4. 检查配置并启动 Nginx

```bash
# 检查配置是否有语法错误
sudo nginx -t

# 如果配置无误，重启 Nginx 应用新配置
sudo systemctl restart nginx  # 对于 systemd 系统
# 或
sudo service nginx restart    # 对于 init.d 系统
# 或
sudo nginx -s reload          # 直接使用 nginx 命令
```

### 5. 设置防火墙（如果需要）

如果您的服务器启用了防火墙，请确保开放 HTTP/HTTPS 端口：

```bash
# 对于 ufw（Ubuntu/Debian）
sudo ufw allow 'Nginx HTTP'
sudo ufw allow 'Nginx HTTPS'

# 对于 firewalld（CentOS/RHEL）
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

现在您应该可以通过您的域名或服务器 IP 访问应用了。

## 自定义配置

有关更多自定义配置选项，请参阅 [Vue CLI 配置参考](https://cli.vuejs.org/config/)。

## 许可证

[MIT](LICENSE)
