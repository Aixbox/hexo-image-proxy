/**
 * Hexo Image Proxy Plugin
 * 
 * Automatically proxies cross-domain images through your proxy server
 * 
 * @author Aixbox
 * @version 1.0.0
 */

'use strict';

const ImageProxy = require('./lib/image-proxy');

// 获取插件配置，支持默认值
const config = Object.assign({
  enable: true,
  proxy_url: '',
  site_domain: '',
  force_proxy_domains: [],
  skip_proxy_domains: [],
  log_enabled: false
}, hexo?.config?.image_proxy || {});

// 如果插件被禁用或未配置代理URL，则跳过
if (!config.enable || !config.proxy_url) {
  // 插件未启用或未配置
} else {
  // 初始化图片代理处理器
  const imageProxy = new ImageProxy(config, hexo.log);

  // 注册过滤器 - 处理文章内容
  hexo.extend.filter.register('after_post_render', function(data) {
    data.content = imageProxy.processImages(data.content);
    
    // 处理文章封面
    if (data.cover && imageProxy.needsProxy(data.cover)) {
      data.cover = imageProxy.proxyImageUrl(data.cover);
    }
    
    // 处理顶部图片
    if (data.top_img && imageProxy.needsProxy(data.top_img)) {
      data.top_img = imageProxy.proxyImageUrl(data.top_img);
    }
    
    return data;
  });

  // 注册过滤器 - 处理整个页面 HTML
  hexo.extend.filter.register('after_render:html', function(htmlContent) {
    return imageProxy.processImages(htmlContent);
  });

  // 启动日志
  if (config.log_enabled) {
    hexo.log.info('[hexo-image-proxy] ✓ 已启用图片代理功能');
    hexo.log.info(`[hexo-image-proxy] 代理服务器: ${config.proxy_url}`);
  }
}
