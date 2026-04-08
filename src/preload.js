const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  startGeneration: (options) => ipcRenderer.invoke("start-generation", options),

  loadJsonProducts: (options) => ipcRenderer.invoke("load-json-products", options),

  generateAtIndices: (options) => ipcRenderer.invoke("generate-at-indices", options),

  onProgress: (callback) => {
    ipcRenderer.on("generation-progress", (_event, data) => callback(data));
  }
});
