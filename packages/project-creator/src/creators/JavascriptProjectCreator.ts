import { ProjectCreator } from "./ProjectCreator";
export class JavascriptProjectCreator extends ProjectCreator {
    createProject(): void {
        console.log('Creating Javascript project');
    }
}