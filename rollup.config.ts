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

const banner = `/**!
 * @author Dennis Rijsdijk
 * @module gg.dennis.firebot
 * @license GPLv3
 * @copyright Copyright (c) 2024 Dennis Rijsdijk
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */`;

/**
 * @type {import('rollup').RollupOptions}
 */
const plugin: RollupOptions = {
	input: "src/plugin/index.ts",
	output: {
		file: `${sdPlugin}/bin/plugin.js`,
		banner,
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
		banner,
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
					display: 5
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
			targets: [ { src: "src/pi/sdpi.css", dest: `${sdPlugin}/bin` } ]
		}),
		!isWatching && terser()
	]
};

export default [
	plugin,
	pi
];
