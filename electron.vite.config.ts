import { resolve } from "path";
import { defineConfig } from "electron-vite";
import vue from "@vitejs/plugin-vue";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import { NaiveUiResolver } from "unplugin-vue-components/resolvers";

export default defineConfig({
  main: {},
  preload: {},
  renderer: {
    resolve: {
      alias: {
        "@": resolve("src/renderer/src"),
      },
    },
    plugins: [
      vue(),
      AutoImport({
        imports: ["vue", "vue-router"],
        dts: "imports/auto-imports.d.ts",
      }),
      Components({
        dirs: ["src/renderer/components"],
        extensions: ["vue"],
        resolvers: [NaiveUiResolver()],
        deep: true,
        dts: "imports/components.d.ts",
      }),
    ],
  },
});
