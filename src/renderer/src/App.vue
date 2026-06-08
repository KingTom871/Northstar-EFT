<script setup lang="ts">
const ipcHandle = (): void => window.electron.ipcRenderer.send("ping");
</script>

<template>
  <img alt="logo" class="logo" src="./assets/icon.svg" />
  <div class="creator">Powered by electron-vite</div>
  <p class="tip">Please try pressing <code>F12</code> to open the devTool</p>
  <div class="actions">
    <div class="action">
      <a href="https://github.com/KingTom871/Northstar-EFT" target="_blank" rel="noreferrer"
        >Github</a
      >
    </div>
    <div class="action">
      <a target="_blank" rel="noreferrer" @click="ipcHandle">Send IPC</a>
    </div>
  </div>
  <Versions />
</template>
