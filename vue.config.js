module.exports = {
  // 输出文件目录
  outputDir: 'dist',
  // 静态资源目录
  assetsDir: 'static',
  // 是否在保存时使用eslint-loader检查
  lintOnSave: process.env.NODE_ENV === 'development',
  // 生产环境是否生成 sourceMap 文件
  productionSourceMap: false,
  // webpack-dev-server 相关配置
  devServer: {
    // 禁用自动打开浏览器
    open: false,
    // 设置主机地址
    host: '0.0.0.0',
    // 设置默认端口
    port: 8080,
    // 关闭热更新 (解决sockjs连接问题)
    hot: false,
    // 禁用主机检查
    disableHostCheck: true,
    // WebSocket主机
    sockHost: '0.0.0.0',
    // WebSocket端口
    sockPort: 8080
  },
  // 如果您使用了PWA插件，这里可以设置更多配置
  pwa: {},
  // 第三方插件配置
  pluginOptions: {},
  // transpileDependencies
  transpileDependencies: [],
  // 配置Babel
  configureWebpack: {
    // 性能提示
    performance: {
      hints: false
    }
  },
};
