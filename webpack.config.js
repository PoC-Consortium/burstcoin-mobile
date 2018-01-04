const { resolve, join  } = require("path");
const fs = require('fs');
const webpack = require("webpack");
const nsWebpack = require("nativescript-dev-webpack");
const nativescriptTarget = require("nativescript-dev-webpack/nativescript-target");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");
const { NativeScriptWorkerPlugin } = require("nativescript-worker-loader/NativeScriptWorkerPlugin");

module.exports = env => {
    const platform = env && (env.android && "android" || env.ios && "ios");
    if (!platform) {
        throw new Error("You need to provide a target platform!");
    }
    const platforms = ["ios", "android"];
    const { snapshot, uglify, report, aot } = env;
    const ngToolsWebpackOptions = { tsConfigPath: "tsconfig.json" };
    const mainSheet = getMainSheet(platform)
    const extensions = getExtensions(platform);
    const plugins = getPlugins(platform, platforms, env, mainSheet, aot, ngToolsWebpackOptions);

    const config = {
        context: resolve("./app"),
        target: nativescriptTarget,
        entry: {
            bundle: aot ? "./main.aot.ts" : "./main.ts",
            vendor: "./vendor",
            // Entry for stylesheet with global application styles
            [mainSheet]: `./${mainSheet}`,
        },
        output: {
            pathinfo: true,
            // Default destination inside platforms/<platform>/...
            path: resolve(nsWebpack.getAppPath(platform)),
            libraryTarget: "commonjs2",
            filename: "[name].js",
        },
        resolve: {
            extensions,
            // Resolve {N} system modules from tns-core-modules
            modules: [
                "node_modules/tns-core-modules",
                "node_modules",
            ],
            alias: {
                '~': resolve("./app")
            },
            // don't resolve symlinks to symlinked modules
            symlinks: false
        },
        resolveLoader: {
            // don't resolve symlinks to symlinked loaders
            symlinks: false
        },
        node: {
            // Disable node shims that conflict with NativeScript
            "http": false,
            "timers": false,
            "setImmediate": false,
            "fs": "empty",
        },
        module: {
            rules: [
                { test: /\.html$|\.xml$/, use: "raw-loader" },

                // tns-core-modules reads the app.css and its imports using css-loader
                { test: /\/app\.css$/, use: "css-loader?url=false" },
                { test: /\/app\.scss$/, use: ["css-loader?url=false", "sass-loader"] },

                // Angular components reference css files and their imports using raw-loader
                { test: /\.css$/, exclude: /\/app\.css$/, use: "raw-loader" },
                { test: /\.scss$/, exclude: /\/app\.scss$/, use: ["raw-loader", "resolve-url-loader", "sass-loader"] },

                // Compile TypeScript files with ahead-of-time compiler.
                { test: /.ts$/, use: [
                    "nativescript-dev-webpack/moduleid-compat-loader",
                    { loader: "@ngtools/webpack", options: ngToolsWebpackOptions },
                ]},
            ],
        },
        plugins,
    };
    if (report) {
        // Generate report files for bundles content
        config.plugins.push(new BundleAnalyzerPlugin({
            analyzerMode: "static",
            openAnalyzer: false,
            generateStatsFile: true,
            reportFilename: join(__dirname, "report", `report.html`),
            statsFilename: join(__dirname, "report", `stats.json`),
        }));
    }
    if (snapshot) {
        config.plugins.push(new nsWebpack.NativeScriptSnapshotPlugin({
            chunk: "vendor",
            projectRoot: __dirname,
            webpackConfig: config,
            targetArchs: ["arm", "arm64", "ia32"],
            tnsJavaClassesOptions: { packages: ["tns-core-modules" ] },
            useLibs: false
        }));
    }
    if (uglify) {
        config.plugins.push(new webpack.LoaderOptionsPlugin({ minimize: true }));

        // Work around an Android issue by setting compress = false
        const compress = platform !== "android";
        config.plugins.push(new webpack.optimize.UglifyJsPlugin({
            mangle: { except: nsWebpack.uglifyMangleExcludes },
            compress,
        }));
    }
    return config;
};

function getMainSheet(platform) {
    const mainSheet = `app.${platform}.css`;
    return fs.existsSync(join(__dirname, 'app', mainSheet)) ?
        mainSheet : 'app.css';
}

// Resolve platform-specific modules like module.android.js
function getExtensions(platform) {
    return Object.freeze([
        `.${platform}.ts`,
        `.${platform}.js`,
        ".aot.ts",
        ".ts",
        ".js",
        ".css",
        `.${platform}.css`,
    ]);
}

function getPlugins(platform, platforms, env, mainSheet, aot, ngToolsWebpackOptions) {
    let plugins = [
        new ExtractTextPlugin(mainSheet),

        // Vendor libs go to the vendor.js chunk
        new webpack.optimize.CommonsChunkPlugin({
            name: ["vendor"],
        }),

        // Define useful constants like TNS_WEBPACK
        new webpack.DefinePlugin({
            "global.TNS_WEBPACK": "true",
        }),

        // Copy assets to out dir. Add your own globs as needed.
        new CopyWebpackPlugin([
            { from: mainSheet },
            { from: "fonts/**" },
            { from: "**/*.jpg" },
            { from: "**/*.png" },
            { from: "**/*.xml" },
            { from: "assets/**" },
        ], {
            ignore: ["App_Resources/**"]
        }),

        // Generate a bundle starter script and activate it in package.json
        new nsWebpack.GenerateBundleStarterPlugin([
            "./vendor",
            "./bundle",
        ]),

        // Support for web workers since v3.2
        new NativeScriptWorkerPlugin(),

        // Generate report files for bundles content
        new BundleAnalyzerPlugin({
            analyzerMode: "static",
            openAnalyzer: false,
            generateStatsFile: true,
            reportFilename: join(__dirname, "report", `report.html`),
            statsFilename: join(__dirname, "report", `stats.json`),
        }),

        // AngularCompilerPlugin with augmented NativeScript filesystem to handle platform specific resource resolution.
        new nsWebpack.NativeScriptAngularCompilerPlugin(
            Object.assign({
                entryModule: resolve(__dirname, "app/app.module#AppModule"),
                skipCodeGeneration: !aot,
                platformOptions: {
                    platform,
                    platforms,
                    // ignore: ["App_Resources"]
                },
            }, ngToolsWebpackOptions)
        ),
    ];

    return plugins;
}
