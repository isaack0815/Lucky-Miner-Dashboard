/**
 * Dynamische Angular Proxy Konfiguration für LuckyMiner
 * 
 * Erlaubt es, Anfragen an mehrere Miner-IPs zu senden, ohne in CORS-Probleme zu laufen.
 * Beispiel: /api-proxy/192.168.178.50/api/system/info
 * -> Wird zu: http://192.168.178.50/api/system/info
 */

const PROXY_CONFIG = {
  "/api-proxy": {
    target: "http://localhost", // Dummy, wird durch router überschrieben
    secure: false,
    changeOrigin: true,
    router: function (req) {
      const parts = req.url.split('/');
      // parts = ["", "api-proxy", "192.168.178.50", "api", "system", "statistics"]
      const ip = parts[2];
      return `http://${ip}`;
    },
    pathRewrite: function (path, req) {
      const parts = path.split('/');
      const ip = parts[2];
      return path.replace(`/api-proxy/${ip}`, '');
    }
  }
};

module.exports = PROXY_CONFIG;