const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  // Ürün üretimini başlat (sürüklenen dosya yolu ile)
  startGeneration: (options) => ipcRenderer.invoke("start-generation", options),

  // Üretim ilerlemesini dinle
  onProgress: (callback) => {
    ipcRenderer.on("generation-progress", (_event, data) => callback(data));
  }
});
