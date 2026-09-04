// 黒龍杯トップページ 登録者数表示設定
// APIキーをこのファイルへ直接書かないでください。
// endpoint に安全なサーバー側API（Cloudflare Worker / Vercel Function等）のURLを設定すると自動取得します。
window.KOKURYU_SUBSCRIBERS = {
  goal: 500,
  fallbackCount: 275,
  fallbackUpdatedAt: "2026-09-03",
  endpoint: "https://kokuryu-subscriber.motoharu-nagata98.workers.dev",
  cacheMinutes: 30
};
