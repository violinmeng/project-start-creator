import { ProjectCreator } from "./ProjectCreator";
export class SwiftProjectCreator extends ProjectCreator {
    createProject(): void {
        console.log('Creating Swift project');
    }
}