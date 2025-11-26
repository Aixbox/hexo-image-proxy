# hexo-image-proxy

[![npm version](https://badge.fury.io/js/hexo-image-proxy.svg)](https://badge.fury.io/js/hexo-image-proxy)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A Hexo plugin that automatically proxies cross-domain images through your proxy server, solving image access restrictions and acceleration issues.

[中文文档](README.md) | English

## 🚀 Features

- ✅ **Auto-detect Cross-domain Images** - Intelligently identifies external images that need proxying
- ✅ **Multiple Image Format Support** - Supports `<img>`, `background-image`, `srcset`, and more
- ✅ **Lazy Loading Compatible** - Perfect support for `data-lazy-src` attribute
- ✅ **Flexible Configuration** - Supports whitelist, blacklist, and forced proxy configurations
- ✅ **Zero Intrusion** - No need to modify existing articles, automatic processing
- ✅ **Performance Optimized** - Processes during build time, doesn't affect page load speed

## 📦 Installation

```bash
npm install hexo-image-proxy --save
```

## ⚙️ Configuration

Add configuration to `_config.yml` in your Hexo root directory:

### Basic Configuration

```yaml
image_proxy:
  enable: true                              # Enable plugin
  proxy_url: 'https://imgcf.aixbox.top/'   # Proxy server address
  site_domain: 'aixbox.top'                # Your site domain (optional)
  log_enabled: false                       # Enable detailed logging
```

### Advanced Configuration

```yaml
image_proxy:
  enable: true
  proxy_url: 'https://imgcf.aixbox.top/'
  site_domain: 'aixbox.top'
  log_enabled: true
  
  # Force proxy domain list (images from these domains are always proxied)
  force_proxy_domains:
    - 'cdn.nlark.com'
    - 'gcore.jsdelivr.net'
    - 'raw.githubusercontent.com'
  
  # Skip proxy domain list (images from these domains are never proxied)
  skip_proxy_domains:
    - 'npm.onmicrosoft.cn'
    - 'localhost'
    - '127.0.0.1'
```

## 🔧 Usage

After installation and configuration, the plugin will automatically work during Hexo build process without any additional operations.

### Example

**Before**:
```html
<img src="https://cdn.nlark.com/yuque/0/2025/png/example.png">
```

**After**:
```html
<img src="https://imgcf.aixbox.top/https://cdn.nlark.com/yuque/0/2025/png/example.png">
```

### Supported Image Formats

- `<img src="...">` - Regular image tags
- `<img data-lazy-src="...">` - Lazy-loaded images
- `<img srcset="...">` - Responsive images
- `style="background-image: url(...)"` - CSS background images
- `cover` and `top_img` in Front Matter

## 🛠️ Setting Up Proxy Server

Refer to the [img-cf-worker-proxy](https://github.com/Aixbox/img-cf-worker-proxy) project to set up a Cloudflare Workers image proxy server.

### Using Cloudflare Workers

```javascript
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url);
  const imageUrl = url.pathname.substring(1); // Remove leading /
  
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

### Using Vercel

Create `api/proxy.js`:

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

## 📋 Configuration Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `enable` | Boolean | `true` | Enable the plugin |
| `proxy_url` | String | `''` | Proxy server address (required) |
| `site_domain` | String | `''` | Site domain, used to skip local images |
| `log_enabled` | Boolean | `false` | Enable detailed logging |
| `force_proxy_domains` | Array | `[]` | List of domains to always proxy |
| `skip_proxy_domains` | Array | `[]` | List of domains to never proxy |

## 🔍 Debugging

Enable detailed logging:

```yaml
image_proxy:
  log_enabled: true
```

View output when running Hexo:

```bash
hexo clean
hexo generate --debug
```

## 🤝 Contributing

Issues and Pull Requests are welcome!

1. Fork this repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the [MIT License](LICENSE).

## 🙋‍♂️ Author

**Aixbox**

- GitHub: [@Aixbox](https://github.com/Aixbox)
- Blog: [https://blog.aixbox.top](https://blog.aixbox.top)

## ⭐ Support

If this project helps you, please give it a star ⭐️

---

**Tip**: Before using, make sure your proxy server supports CORS and has properly configured caching policies.
