import { ProjectConfig } from 'project-creator-base';
export abstract class ProjectCreator {
    protected config: ProjectConfig;

    constructor(config: ProjectConfig) {
        this.config = config;
    }

    abstract createProject(): void;
}