/**
 * Image Proxy Core Module
 * 
 * 处理图片代理的核心逻辑
 */

'use strict';

class ImageProxy {
  constructor(config, logger) {
    this.config = config;
    this.logger = logger;
    this.proxyUrl = config.proxy_url.endsWith('/') ? config.proxy_url : config.proxy_url + '/';
    this.siteDomain = config.site_domain || '';
    this.forceProxyDomains = config.force_proxy_domains || [];
    this.skipProxyDomains = config.skip_proxy_domains || [];
    this.logEnabled = config.log_enabled || false;
  }

  /**
   * 判断是否需要代理
   */
  needsProxy(url) {
    if (!url || typeof url !== 'string') return false;
    
    // 跳过相对路径和本站图片
    if (url.startsWith('/') || url.startsWith('./') || url.startsWith('../')) {
      return false;
    }
    
    // 跳过已经被代理的图片
    if (url.startsWith(this.proxyUrl)) {
      return false;
    }
    
    // 判断是否为 HTTP/HTTPS 链接
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return false;
    }

    // 检查强制代理域名列表
    for (const domain of this.forceProxyDomains) {
      if (url.includes(domain)) {
        return true;
      }
    }

    // 检查跳过代理域名列表
    for (const domain of this.skipProxyDomains) {
      if (url.includes(domain)) {
        return false;
      }
    }
    
    // 判断是否为本站域名
    if (this.siteDomain && url.includes(this.siteDomain)) {
      return false;
    }
    
    // 默认所有外部域名都需要代理
    return true;
  }

  /**
   * 将图片 URL 转换为代理 URL
   */
  proxyImageUrl(url) {
    if (!this.needsProxy(url)) {
      return url;
    }
    
    const proxiedUrl = this.proxyUrl + url;
    
    if (this.logEnabled && this.logger) {
      this.logger.debug(`[hexo-image-proxy] ${url} -> ${proxiedUrl}`);
    }
    
    return proxiedUrl;
  }

  /**
   * 处理 HTML 内容中的图片
   */
  processImages(htmlContent) {
    if (!htmlContent || typeof htmlContent !== 'string') {
      return htmlContent;
    }
    
    let processedCount = 0;
    
    // 处理 <img> 标签的 src 属性
    htmlContent = htmlContent.replace(
      /<img([^>]*?)src=["']([^"']+)["']([^>]*?)>/gi,
      (match, before, src, after) => {
        const proxiedSrc = this.proxyImageUrl(src);
        if (proxiedSrc !== src) {
          processedCount++;
        }
        return `<img${before}src="${proxiedSrc}"${after}>`;
      }
    );
    
    // 处理 data-lazy-src 属性（懒加载）
    htmlContent = htmlContent.replace(
      /data-lazy-src=["']([^"']+)["']/gi,
      (match, src) => {
        const proxiedSrc = this.proxyImageUrl(src);
        if (proxiedSrc !== src) {
          processedCount++;
        }
        return `data-lazy-src="${proxiedSrc}"`;
      }
    );
    
    // 处理 srcset 属性
    htmlContent = htmlContent.replace(
      /srcset=["']([^"']+)["']/gi,
      (match, srcset) => {
        const proxiedSrcset = srcset.replace(
          /(https?:\/\/[^\s,]+)/g,
          url => {
            const proxied = this.proxyImageUrl(url.trim());
            if (proxied !== url.trim()) {
              processedCount++;
            }
            return proxied;
          }
        );
        return `srcset="${proxiedSrcset}"`;
      }
    );
    
    // 处理 CSS background-image 样式
    htmlContent = htmlContent.replace(
      /background-image:\s*url\((['"]?)([^'"]+)\1\)/gi,
      (match, quote, url) => {
        const proxiedUrl = this.proxyImageUrl(url);
        if (proxiedUrl !== url) {
          processedCount++;
        }
        // 使用原始引号或默认单引号，避免双引号嵌套冲突
        const quoteChar = quote || "'";
        return `background-image: url(${quoteChar}${proxiedUrl}${quoteChar})`;
      }
    );

    // 处理内联样式中的 background 属性
    htmlContent = htmlContent.replace(
      /background:\s*([^;]*?)url\((['"]?)([^'"]+)\2\)([^;]*)/gi,
      (match, before, quote, url, after) => {
        const proxiedUrl = this.proxyImageUrl(url);
        if (proxiedUrl !== url) {
          processedCount++;
        }
        // 使用原始引号或默认单引号，避免双引号嵌套冲突
        const quoteChar = quote || "'";
        return `background: ${before}url(${quoteChar}${proxiedUrl}${quoteChar})${after}`;
      }
    );
    
    if (processedCount > 0 && this.logEnabled && this.logger) {
      this.logger.info(`[hexo-image-proxy] 已代理 ${processedCount} 张跨域图片`);
    }
    
    return htmlContent;
  }

  /**
   * 获取统计信息
   */
  getStats() {
    return {
      proxyUrl: this.proxyUrl,
      siteDomain: this.siteDomain,
      forceProxyDomains: this.forceProxyDomains,
      skipProxyDomains: this.skipProxyDomains
    };
  }
}

module.exports = ImageProxy;
