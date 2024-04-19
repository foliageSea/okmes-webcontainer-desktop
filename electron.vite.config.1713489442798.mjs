// electron.vite.config.mjs
import { resolve } from "path";
import { defineConfig, externalizeDepsPlugin } from "electron-vite";
import vue from "@vitejs/plugin-vue";
import Unocss from "@unocss/vite";
import { presetAttributify, presetUno } from "unocss";
import VueDevTools from "vite-plugin-vue-devtools";
var electron_vite_config_default = defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    resolve: {
      alias: {
        "@main": resolve("src/main"),
        "@preload": resolve("src/preload"),
        "@resources": resolve("resources")
      }
    }
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    resolve: {
      alias: {
        "@main": resolve("src/main"),
        "@preload": resolve("src/preload"),
        "@resources": resolve("resources")
      }
    }
  },
  renderer: {
    resolve: {
      alias: {
        "@renderer": resolve("src/renderer/src")
      }
    },
    plugins: [
      // VueDevTools(),
      vue(),
      Unocss({
        presets: [presetUno(), presetAttributify()]
      })
    ]
  }
});
export {
  electron_vite_config_default as default
};
