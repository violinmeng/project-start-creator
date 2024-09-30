import { ProjectCreator } from "./ProjectCreator";

export class RustProjectCreator extends ProjectCreator {
    createProject(): void {
        console.log('Creating Rust project');
    }
}