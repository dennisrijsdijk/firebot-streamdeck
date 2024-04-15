import fsp from 'fs/promises';
// TODO: Write declaration or replace
// @ts-ignore
import formatter from 'html-formatter';
import {Plugin} from "rollup";

function url(file: string) {
    return new URL(file, import.meta.url);
}

type GeneratePropertyInspectorOptions = {
    base: string;
    actionsDir: string;
    pluginId: string;
    titleRows: {
        default: number;
        map: Record<string, number>;
    }
}

export default function generatePi(options: GeneratePropertyInspectorOptions): Plugin {
    return {
        name: 'generate-pi',
        buildStart() {
            this.addWatchFile(options.actionsDir);
            this.addWatchFile(options.base);
        },
        async generateBundle() {
            const base = await fsp.readFile(url(options.base), 'utf-8');
            const actionFiles = await fsp.readdir(url(options.actionsDir));
            await Promise.all(actionFiles.map(async file => {
                if (!file.endsWith(".html")) {
                    return;
                }
                const path = url(`${options.actionsDir}/${file}`);
                const stats = await fsp.stat(path);
                if (!stats.isFile()) {
                    return;
                }
                const action = await fsp.readFile(path, 'utf-8');
                const name = file.replace(".html", "");
                const rows = options.titleRows.map[name] ?? options.titleRows.default;
                const output = base
                    .replace('{{ACTION_UUID}}', `${options.pluginId}.${name}`)
                    .replace("{{TITLE_ROWS}}", rows.toString())
                    .replace("{{ACTION_HTML_TEMPLATE}}", action);

                this.emitFile({ fileName: file, source: formatter.render(output), type: "asset" });
            }));
        }
    }
}