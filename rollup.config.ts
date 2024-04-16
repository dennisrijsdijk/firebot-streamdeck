import commonjs from "@rollup/plugin-commonjs";
import copy from "rollup-plugin-copy";
import nodeResolve from "@rollup/plugin-node-resolve";
import terser from "@rollup/plugin-terser";
import typescript from "@rollup/plugin-typescript";
import path from "node:path";
import url from "node:url";
import generatePi from "./rollup-plugin-gen-pi";
import {RollupOptions} from "rollup";

const isWatching = !!process.env.ROLLUP_WATCH || process.env.BUILD === "DEBUG";
const pluginId = "gg.dennis.firebot";
const sdPlugin = `${pluginId}.sdPlugin`;

/**
 * @type {import('rollup').RollupOptions}
 */
const plugin: RollupOptions = {
	input: "src/plugin/index.ts",
	output: {
		file: `${sdPlugin}/bin/plugin.js`,
		sourcemap: isWatching,
		sourcemapPathTransform: (relativeSourcePath, sourcemapPath) => {
			return url.pathToFileURL(path.resolve(path.dirname(sourcemapPath), relativeSourcePath)).href;
		}
	},
	plugins: [
		{
			name: "watch-externals",
			buildStart: function () {
				this.addWatchFile(`${sdPlugin}/manifest.json`);
			},
		},
		typescript({
			tsconfig: "src/plugin/tsconfig.json",
			mapRoot: isWatching ? "./" : undefined
		}),
		nodeResolve({
			browser: false,
			exportConditions: ["node"],
			preferBuiltins: true
		}),
		commonjs(),
		!isWatching && terser(),
		{
			name: "emit-module-package-file",
			generateBundle() {
				this.emitFile({ fileName: "package.json", source: `{ "type": "module" }`, type: "asset" });
			}
		}
	]
};

const pi: RollupOptions = {
	input: "src/pi/index.ts",
	output: {
		file: `${sdPlugin}/bin/pi.js`,
		format: 'iife',
		sourcemap: isWatching,
		sourcemapPathTransform: (relativeSourcePath, sourcemapPath) => {
			return url.pathToFileURL(path.resolve(path.dirname(sourcemapPath), relativeSourcePath)).href;
		}
	},
	plugins: [
		generatePi({
			base: "src/pi/template.html",
			actionsDir: "src/pi/templates",
			pluginId: pluginId,
			titleRows: {
				default: 2,
				map: {
					display: 6
				}
			}
		}),
		{
			name: "watch-externals",
			buildStart: function () {
				this.addWatchFile(`${sdPlugin}/manifest.json`);
			},
		},
		typescript({
			tsconfig: "src/pi/tsconfig.json",
			mapRoot: isWatching ? "./" : undefined
		}),
		nodeResolve({
			browser: true
		}),
		commonjs(),
		copy({
			targets: [
				{ src: "src/pi/assets", dest: `${sdPlugin}/bin` },
				{ src: "src/pi/sdpi.css", dest: `${sdPlugin}/bin` }
			]
		}),
		!isWatching && terser()
	]
};

export default [
	plugin,
	pi
];
