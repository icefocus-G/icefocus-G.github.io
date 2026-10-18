// 云服务公开配置（由 WorkBuddy 云服务开通时下发，可安全置于前端）
window.PUBLIC_CONFIG = {
  endpoint: 'https://wb-task-sync.app.workbuddy.host',
  oauthRelayBaseUrl: 'https://www.workbuddy.cn/v2/as/genie-baas/oauth',
  publishableKey: 'wbpk_zyJNNTGJYID5kzn7Ci8mhk_iRET1pj0IXrx1qMmnUD5kaJM0Cvl7DDy',
};

// 本机采集器地址（collector/collect.js --serve 启动后的地址）
window.LOCAL_BRIDGE = 'http://127.0.0.1:8787';
