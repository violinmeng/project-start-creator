import { ProjectConfig } from "../ProjectConfig";
export abstract class ProjectCreator {
    protected config: ProjectConfig;

    constructor(config: ProjectConfig) {
        this.config = config;
    }

    abstract createProject(): void;
}