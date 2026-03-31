# hexo-image-proxy

[![npm version](https://badge.fury.io/js/hexo-image-proxy.svg)](https://badge.fury.io/js/hexo-image-proxy)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

一个 Hexo 插件，自动将跨域图片通过代理服务器加载，解决图片访问限制和加速问题。

中文文档 | [English](README_EN.md)

## 🚀 功能特性

- ✅ **自动检测跨域图片** - 智能识别需要代理的外部图片
- ✅ **多种图片格式支持** - 支持 `<img>`、`background-image`、`srcset` 等
- ✅ **懒加载兼容** - 完美支持 `data-lazy-src` 属性
- ✅ **配置灵活** - 支持白名单、黑名单、强制代理等配置
- ✅ **零侵入** - 无需修改现有文章，自动处理
- ✅ **性能优化** - 构建时处理，不影响页面加载速度

## 📦 安装

```bash
npm install hexo-image-proxy --save
```

## ⚙️ 配置

在 Hexo 根目录的 `_config.yml` 中添加配置：

### 基础配置

```yaml
image_proxy:
  enable: true                              # 启用插件
  proxy_url: 'https://imgcf.aixbox.top/'   # 代理服务器地址
  site_domain: 'aixbox.top'                # 您的站点域名（可选）
  log_enabled: false                       # 是否启用详细日志
```
可以使用cf进行代理，参考：https://github.com/Aixbox/img-cf-worker-proxy
### 高级配置

```yaml
image_proxy:
  enable: true
  proxy_url: 'https://imgcf.aixbox.top/'
  site_domain: 'aixbox.top'
  log_enabled: true
  
  # 强制代理域名列表（这些域名的图片总是被代理）
  force_proxy_domains:
    - 'cdn.nlark.com'
    - 'gcore.jsdelivr.net'
    - 'raw.githubusercontent.com'
  
  # 跳过代理域名列表（这些域名的图片永不代理）
  skip_proxy_domains:
    - 'npm.onmicrosoft.cn'
    - 'localhost'
    - '127.0.0.1'
```

## 🔧 使用方法

安装并配置后，插件会在 Hexo 构建时自动工作，无需额外操作。

### 效果示例

**转换前**：
```html
<img src="https://cdn.nlark.com/yuque/0/2025/png/example.png">
```

**转换后**：
```html
<img src="https://imgcf.aixbox.top/https://cdn.nlark.com/yuque/0/2025/png/example.png">
```

### 支持的图片格式

- `<img src="...">` - 普通图片标签
- `<img data-lazy-src="...">` - 懒加载图片
- `<img srcset="...">` - 响应式图片
- `style="background-image: url(...)"` - CSS 背景图
- Front Matter 中的 `cover` 和 `top_img`

## 🛠️ 代理服务器搭建

参考项目[img-cf-worker-proxy](https://github.com/Aixbox/img-cf-worker-proxy)搭建Cloudflare Workers图片代理服务器。

### 使用 Cloudflare Workers

```javascript
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url);
  const imageUrl = url.pathname.substring(1); // 移除开头的 /
  
  if (!imageUrl || !imageUrl.startsWith('http')) {
    return new Response('Invalid image URL', { status: 400 });
  }
  
  try {
    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ImageProxy/1.0)',
        'Referer': ''
      }
    });
    
    if (!response.ok) {
      return new Response('Image not found', { status: 404 });
    }
    
    const headers = new Headers(response.headers);
    headers.set('Cache-Control', 'public, max-age=31536000');
    headers.set('Access-Control-Allow-Origin', '*');
    
    return new Response(response.body, {
      status: response.status,
      headers
    });
  } catch (error) {
    return new Response('Proxy error', { status: 500 });
  }
}
```

### 使用 Vercel

创建 `api/proxy.js`：

```javascript
export default async function handler(req, res) {
  const { url } = req.query;
  
  if (!url || !url.startsWith('http')) {
    return res.status(400).json({ error: 'Invalid URL' });
  }
  
  try {
    const response = await fetch(url);
    const buffer = await response.arrayBuffer();
    
    res.setHeader('Cache-Control', 'public, max-age=31536000');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', response.headers.get('content-type'));
    
    res.send(Buffer.from(buffer));
  } catch (error) {
    res.status(500).json({ error: 'Proxy failed' });
  }
}
```

## 📋 配置参数详解

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `enable` | Boolean | `true` | 是否启用插件 |
| `proxy_url` | String | `''` | 代理服务器地址（必需） |
| `site_domain` | String | `''` | 站点域名，用于跳过本站图片 |
| `log_enabled` | Boolean | `false` | 是否启用详细日志输出 |
| `force_proxy_domains` | Array | `[]` | 强制代理的域名列表 |
| `skip_proxy_domains` | Array | `[]` | 跳过代理的域名列表 |

## 🔍 调试

启用详细日志：

```yaml
image_proxy:
  log_enabled: true
```

运行 Hexo 时查看输出：

```bash
hexo clean
hexo generate --debug
```

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

1. Fork 本项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

本项目采用 [MIT 许可证](LICENSE)。

## 🙋‍♂️ 作者

**Aixbox**

- GitHub: [@Aixbox](https://github.com/Aixbox)
- Blog: [https://blog.aixbox.top](https://blog.aixbox.top)

## ⭐ 支持

如果这个项目对您有帮助，请给个星标 ⭐️

---

**提示**：使用前请确保您的代理服务器支持 CORS 并已正确配置缓存策略。
