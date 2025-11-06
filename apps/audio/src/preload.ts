import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  getCredentials: () => ipcRenderer.invoke('get-credentials'),
  saveCredentials: (credentials: any) => ipcRenderer.invoke('save-credentials', credentials),
  loadDsmUrl: (url: string) => ipcRenderer.invoke('load-dsm-url', url),
  loadAudioUrl: (url: string) => ipcRenderer.invoke('load-audio-url', url),
  loadPhotosUrl: (url: string) => ipcRenderer.invoke('load-photos-url', url)
});