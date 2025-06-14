import path from 'path';
import esbuild from "esbuild";
import vuePlugin from "esbuild-plugin-vue3";
import alias from 'esbuild-plugin-alias';

esbuild.build({
    entryPoints: ["dist/client/frontend.js"],
    bundle: true,
    outfile: "dist/client/dist_frontend.js",
    plugins: [
        vuePlugin(),
        alias({
            vue: path.resolve('node_modules/vue/dist/vue.esm-bundler.js')
        })
    ]
});
