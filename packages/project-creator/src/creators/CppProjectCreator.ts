import { ProjectCreator } from "./ProjectCreator";
import path from 'path';
import { fileURLToPath } from 'url';
import { CppCreateProcess } from "cpp-template-plugin";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class CppProjectCreator extends ProjectCreator {
    createProject(): void {
        console.log('Creating C++ project');
        console.log("DEBUG:", __dirname, __filename);

        // rootDir is required
        if (!this.config.rootDir) {
            console.error('rootDir is required.');
            return;
        }

        const createProcess = new CppCreateProcess(this.config, process.cwd());
        createProcess.create();
    }
}