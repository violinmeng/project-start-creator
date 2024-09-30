import { ProjectCreator } from "./creators/ProjectCreator";
import { CppProjectCreator } from "./creators/CppProjectCreator";
import { SwiftProjectCreator } from "./creators/SwiftProjectCreator";
import { RustProjectCreator } from "./creators/RustProjectCreator";
import { JavascriptProjectCreator } from "./creators/JavascriptProjectCreator";
import { TypescriptProjectCreator } from "./creators/TypescriptProjectCreator";
import { ProjectConfig } from 'project-creator-base';

export enum Language {
    CPP = 'cpp',
    SWIFT = 'swift',
    RUST = 'rust',
    JAVASCRIPT = 'javascript',
    TYPESCRIPT = 'typescript',
}

export class ProjectCreatorFactory {
    static createProjectCreator(lang: Language, config: ProjectConfig): ProjectCreator {
        switch (lang) {
            case Language.CPP:
                return new CppProjectCreator(config);
            case Language.SWIFT:
                return new SwiftProjectCreator(config);
            case Language.RUST:
                return new RustProjectCreator(config);
            case Language.JAVASCRIPT:
                return new JavascriptProjectCreator(config);
            case Language.TYPESCRIPT:
                return new TypescriptProjectCreator(config);
            default:
                throw new Error('Unsupported language');
        }
    }
}
