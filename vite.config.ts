import {defineConfig, PluginOption, UserConfigExport} from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import Icons from 'unplugin-icons/vite'
import IconsResolver from 'unplugin-icons/resolver'
import {ElementPlusResolver} from "unplugin-vue-components/resolvers";


const src = path.resolve(__dirname, 'src')

const autoImport: PluginOption[] = [
  AutoImport({
    // Auto import functions from Vue, e.g. ref, reactive, toRef...
    // 自动导入 Vue 相关函数，如：ref, reactive, toRef 等
    imports: ['vue'],

    // Auto import functions from Element Plus, e.g. ElMessage, ElMessageBox... (with style)
    // 自动导入 Element Plus 相关函数，如：ElMessage, ElMessageBox... (带样式)
    resolvers: [
      ElementPlusResolver(),
    ],

    dts: path.resolve(src, 'auto-imports.d.ts'),
  }),

  Components({
    resolvers: [
      // Auto register Element Plus components
      // 自动导入 Element Plus 组件
      ElementPlusResolver(),

      // Auto register icon components
      // 自动注册图标组件
      IconsResolver({
        prefix: 'i',
        enabledCollections: ['ep', 'fa6-solid'],
        alias: {
          fas: 'fa6-solid',
        }
      }),
    ],

    dts: path.resolve(src, 'components.d.ts'),
  }),

  Icons({
    autoInstall: true
  })
]

const umd = !!process.env.UMD
const demo = !!process.env.BUILD_DEMO

// https://vitejs.dev/config/
const cfg: UserConfigExport = {
  define: {
    'process.env': {}
  },
  plugins: [vue(), ...autoImport],
  resolve: {
    alias: {'@': src},
  },
  build: demo ? {} : {
    lib: {
      entry: path.resolve(src, 'index.ts'),
      name: 'TgBlog',
      formats: umd ? ['umd'] : ['es', 'cjs'],
      fileName: (format) => `tg-blog.${format}.js`,
    },
    rollupOptions: {
      // external modules won't be bundled into your library
      external: ['vue'], // not every external has a global
      output: {
        // disable warning on src/index.ts using both default and named export
        exports: 'named',
        // Provide global variables to use in the UMD build
        // for externalized deps (not useful if 'umd' is not in lib.formats)
        globals: {
          vue: 'Vue',
        },
        inlineDynamicImports: umd,
      },
    },
    sourcemap: true,
    emptyOutDir: false, // to retain the types folder generated by tsc
  },
}

export default defineConfig(cfg)
