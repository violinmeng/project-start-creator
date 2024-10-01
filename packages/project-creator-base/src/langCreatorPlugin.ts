import { ProjectConfig, TargetType } from "./projectConfig";

function isSuperset<T>(set: Set<T>, subset: Set<T>): boolean {
    for (const elem of subset) {
        if (!set.has(elem)) {
            return false;
        }
    }
    return true;
}
export abstract class LangCreatorPlugin {
    protected projectConfig: ProjectConfig;
    protected currentWorkDir: string;

    constructor(projectConfig: ProjectConfig, currentWorkDir: string) {
        this.projectConfig = projectConfig;
        this.currentWorkDir = currentWorkDir;
    }

    abstract supportLang(): string;

    abstract supportTargetTypes(): Set<TargetType>;

    abstract createProject(): void;

    validateTargetTypes(): boolean {
        const curTypes = this.projectConfig.targets.reduce((acc, cur) => acc.add(cur.type), new Set<TargetType>())
        return isSuperset<TargetType>(this.supportTargetTypes(), curTypes);
    }
}