import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";
import { viteSingleFile } from "vite-plugin-singlefile";
import { resolve } from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), tailwindcss(), viteSingleFile()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  define: {
    __VUE_I18N_LEGACY_API__: false,
  },
  build: {
    assetsInlineLimit: 100 * 1024 * 1024,
  },
  server: {
    host: "0.0.0.0",
  },
});
