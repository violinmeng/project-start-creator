import { ProjectCreator } from "./ProjectCreator";
export class TypescriptProjectCreator extends ProjectCreator {
    createProject(): void {
        console.log('Creating Typescript project');
    }
}