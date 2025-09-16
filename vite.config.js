import { defineConfig, loadEnv } from 'vite';
import { resolve } from 'path';
import vue from '@vitejs/plugin-vue';
import eslintPlugin from 'vite-plugin-eslint';
import {fileURLToPath, URL} from "url";
import Components from 'unplugin-vue-components/vite';
import { AntDesignVueResolver } from 'unplugin-vue-components/resolvers';
import { lazyImport, VxeResolver } from 'vite-plugin-lazy-import';
import AutoImport from 'unplugin-auto-import/vite';
import Less2CssVariablePlugin from 'antd-less-to-css-variable';
import vueJsx from '@vitejs/plugin-vue-jsx';

import {
    name,
    version,
    engines,
    dependencies,
    devDependencies,
} from "./package.json";

//  ant-design-vue 的 less 变量，通过兼容包将 v4 变量转译成 v3 版本，并通过 less-loader 注入
import { theme } from 'ant-design-vue/lib';
import convertLegacyToken from 'ant-design-vue/lib/theme/convertLegacyToken';
const { defaultAlgorithm, defaultSeed } = theme;
const mapToken = defaultAlgorithm(defaultSeed);
const v3Token = convertLegacyToken(mapToken);

/** 平台的名称、版本、运行所需的`node`版本、依赖、构建时间的类型提示 */
const __APP_INFO__ = {
    pkg: { name, version, engines, dependencies, devDependencies },
    buildTimestamp: Date.now(),
};
export const r = (...args) => resolve(__dirname, '.', ...args);



/**  Vite配置 @see https://cn.vitejs.dev/config */
export default ({ mode }) => {
    // 获取环境变量
    const env = loadEnv(mode, process.cwd());
    return defineConfig({
        plugins: [
            vue(),
            vueJsx(),
            eslintPlugin({cache: false}),
            Components({
                resolvers: [
                    AntDesignVueResolver({
                        importStyle: false, // css in js
                    }),
                    {
                        dirs: [r('src/components')],
                        dts: false,
                        resolvers: []
                    },
                ],
            }),
            lazyImport({
                resolvers: [
                    VxeResolver({ // vxe-table组件的按需导入
                        libraryName: 'vxe-table',
                    }),
                    VxeResolver({ //  vxeUI组件的按需导入
                        libraryName: 'vxe-pc-ui',

                    }),
                ],
            }),
            AutoImport({
                imports: ['vue'],
                eslintrc: {
                    enabled: true, // 生成 ESLint 配置文件
                },
                include: [/\.[j]s?$/, /\.vue$/], // 包含的文件类型
                dts: r('src/auto-imports.d.ts') // 生成的类型声明文件
            }),
        ],
        resolve: {
            alias: {
                "@": fileURLToPath(new URL("./src", import.meta.url)),
            },
        },
        base: env.VITE_BASE_URL, // 应用程序在服务器上的根目录位置，设置的连接前缀
       
        css: {
            preprocessorOptions: {
                less: {
                    javascriptEnabled: true,
                    plugins: [
                        new Less2CssVariablePlugin({
                            // TODO：有必要用的情况下，是否需要传入 variables，可能会造成重复引用
                            //variables: { ...v3Token }
                        })
                    ],
                    modifyVars: v3Token
                }
            }
        },

        server: {
            port: 9098, // 设置服务启动端口号
            // open: true, // 设置服务启动时是否自动打开浏览器
            cors: true, // 允许跨域
            // 设置代理，根据我们项目实际情况配置
            proxy: {
                '/api': {
                    target: `${env.VITE_API_URL}`,
                    ws: true,
                    changeOrigin: true,
                    secure: false,
                    rewrite: (path) => path.replace(/^\/api/, ''),
                },
            },
        },
        // 构建配置
        build: {
            chunkSizeWarningLimit: 1000, // 消除打包大小超过500kb警告
            minify: "terser", // 当设置为 'terser' 时必须先安装 Terser。Vite 2.6.x 以上需要配置 minify: "terser", terserOptions 才能生效
            terserOptions: {
                compress: {
                    keep_infinity: true, // 防止 Infinity 被压缩成 1/0，这可能会导致 Chrome 上的性能问题
                    drop_console: true, // 生产环境去除 console
                    drop_debugger: true, // 生产环境去除 debugger
                },
                format: {
                    comments: false, // 删除注释
                },
            },
            rollupOptions: {
                output: {
                    // 用于从入口点创建的块的打包输出格式[name]表示文件名,[hash]表示该文件内容hash值
                    entryFileNames: "js/[name].[hash].js",
                    // 用于命名代码拆分时创建的共享块的输出命名
                    chunkFileNames: "js/[name].[hash].js",
                    // 用于输出静态资源的命名，[ext]表示文件扩展名
                    assetFileNames: (assetInfo) => {
                        const info = assetInfo.name.split(".");
                        let extType = info[info.length - 1];
                        if (
                            /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/i.test(assetInfo.name)
                        ) {
                            extType = "media";
                        } else if (/\.(png|jpe?g|gif|svg)(\?.*)?$/.test(assetInfo.name)) {
                            extType = "img";
                        } else if (/\.(woff2?|eot|ttf|otf)(\?.*)?$/i.test(assetInfo.name)) {
                            extType = "fonts";
                        }
                        return `${extType}/[name].[hash].[ext]`;
                    },
                },
            },
            define: {
                __APP_INFO__: JSON.stringify(__APP_INFO__),
            },
        },
    });
};
