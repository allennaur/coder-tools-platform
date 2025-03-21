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
    // 禁用热模块更换的WebSocket客户端
    client: {
      webSocketURL: false,
    },
    // 启用静默模式 (减少WebSocket依赖)
    liveReload: false,
    // 失败回退，让开发服务器在无法使用WebSocket时回退到轮询模式
    watchOptions: {
      poll: false,
    },
    // 允许所有来源访问
    allowedHosts: 'all',
    // 额外的配置来减少不必要的日志输出
    webSocketServer: false,
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
