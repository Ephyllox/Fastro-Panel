import FS from "fs";
import Path from "path";

import { promisify } from "util";

export default abstract class FileToolbox {
    static async requireDirectory(dir: string, recursive: boolean = true): Promise<object[]> {
        const files = await promisify(FS.readdir)(dir);
        let filesArray: object[] = [];

        return new Promise<object[]>((resolve, reject) => {
            Promise.all(files.map(async file => {
                const fullPath = Path.resolve(dir, file);

                // Make sure that TypeScript does not pick up stale files
                if (file.match(/\.(js)$/)) {
                    const required = require(fullPath) as object;
                    filesArray.push(required);
                }
                else if (recursive) {
                    const isDirectory = await promisify(FS.stat)(fullPath).then(f => f.isDirectory());

                    if (isDirectory) {
                        await this.requireDirectory(Path.join(dir, file), recursive)
                            .then(files => filesArray = filesArray.concat(files));
                    }
                }
            })).then(() => resolve(filesArray)).catch(reject);
        });
    }
};