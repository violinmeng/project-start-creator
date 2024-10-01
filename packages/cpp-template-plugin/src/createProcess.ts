import path from 'path';
import { IncludeTarget, ExecutableTarget, LibTarget, TestTarget, Target, TargetType } from 'project-creator-base';
import { fileURLToPath } from 'url';
import { TemplateWorkSpace } from 'project-creator-base';

import { ProjectConfig, LangCreatorPlugin } from 'project-creator-base';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const templateInfo = {
    path: path.join(__dirname, './template'),
    copyLists: [
        '.clang-format',
        '.clang-tidy',
        '.gitignore',
        'Makefile',
    ],
}

const targetMustacheData = (data: Target) => ({
    ...data,
    libDependencies: data.dependencyTargets?.filter(dependency => dependency.type === TargetType.Lib).map(target => target.name),
    executableDependencies: data.dependencyTargets?.filter(dependency => dependency.type === TargetType.Executable).map(target => target.name),
    includeDependencies: data.dependencyTargets?.filter(dependency => dependency.type === TargetType.Include).map(target => target.name),
    testDependencies: data.dependencyTargets?.filter(dependency => dependency.type === TargetType.Test).map(target => target.name),
    targetName: data.name,
    isLib: data.type === TargetType.Lib,
    isExecutable: data.type === TargetType.Executable,
    isTest: data.type === TargetType.Test,
    isInclude: data.type === TargetType.Include,
    toUpper: () => (text: string, render: (value: string) => string) => render(text).toUpperCase(),
    toLower: () => (text: string, render: (value: string) => string) => render(text).toLowerCase(),
});

const targetActions = {
    include: (rootWorkspace: TemplateWorkSpace, targets: IncludeTarget[]) => {
        if (!targets.length) {
            return;
        }
        const includeDir = rootWorkspace.mkSubDir("include");
        targets.forEach(target => {
            const targetDir = includeDir.mkSubDir(target.name);
            targetDir.createFromTemplate("header.hpp.mustache", target.name, targetMustacheData(target));
        });
    },
    executable: (rootWorkspace: TemplateWorkSpace, targets: ExecutableTarget[]) => {
        if (!targets.length) {
            return;
        }
        const executableDir = rootWorkspace.mkSubDir("bin");
        targets.forEach(target => {
            const targetDir = executableDir.mkSubDir(target.name);
            targetDir.createFromTemplate("impl.cpp.mustache", `${target.name}.cpp`, targetMustacheData(target));
            targetDir.createFromTemplate("bin/cmake.mustache", "CMakeLists.txt", targetMustacheData(target));
        });
    },
    library: (rootWorkspace: TemplateWorkSpace, targets: LibTarget[]) => {
        if (!targets.length) {
            return;
        }
        const libraryDir = rootWorkspace.mkSubDir("lib");
        targets.forEach(target => {
            const targetDir = libraryDir.mkSubDir(target.name);
            targetDir.createFromTemplate("impl.cpp.mustache", `${target.name}.cpp`, targetMustacheData(target));
            targetDir.createFromTemplate("lib/cmake.mustache", "CMakeLists.txt", targetMustacheData(target));
            const includeDir = targetDir.mkSubDir("include");
            includeDir.createFromTemplate("header.hpp.mustache", `${target.name}.hpp`, targetMustacheData(target));
        });
    },
    test: (rootWorkspace: TemplateWorkSpace, targets: TestTarget[]) => {
        if (!targets.length) {
            return;
        }
        const testDir = rootWorkspace.mkSubDir("test");
        targets.forEach(target => {
            const targetDir = testDir.mkSubDir(target.name);
            targetDir.createFromTemplate("impl.cpp.mustache", `${target.name}.cpp`, targetMustacheData(target));
            targetDir.createFromTemplate("tests/cmake.mustache", "CMakeLists.txt", targetMustacheData(target));
        });
    },
    copy: (rootWorkspace: TemplateWorkSpace) => {
        templateInfo.copyLists.map(path => {
            rootWorkspace.copyFromTemplate(path);
        });
    }
}

export class CppLangCreatorPlugin extends LangCreatorPlugin {
    private rootWorkSpace?: TemplateWorkSpace;

    constructor(projectConfig: ProjectConfig, currentWorkDir: string) {
        super(projectConfig, currentWorkDir);
        this.projectConfig = projectConfig;
        if (projectConfig.rootDir.length) {
        } else {

        }
        
        try {
            this.rootWorkSpace = new TemplateWorkSpace(path.join(currentWorkDir, projectConfig.rootDir), templateInfo.path);
        } catch (error) {
            console.error('create root workspace failed.');
        }
    }

    supportLang(): string {
        return 'cpp';
    }

    supportTargetTypes(): Set<TargetType> {
        return new Set([
            TargetType.Executable,
            TargetType.Include,
            TargetType.Lib,
            TargetType.Test
        ])
    }

    createProject(): void {
        if (!this.rootWorkSpace) {
            return;
        }
        targetActions.include(this.rootWorkSpace, this.projectConfig.getIncludeTarget());
        targetActions.executable(this.rootWorkSpace, this.projectConfig.getExecutableTarget());
        targetActions.library(this.rootWorkSpace, this.projectConfig.getLibTarget());
        targetActions.test(this.rootWorkSpace, this.projectConfig.getTestTarget());
        targetActions.copy(this.rootWorkSpace);
        this.rootWorkSpace.createFromTemplate("cmake.mustache", "CMakeLists.txt", {
            projectName: this.projectConfig.rootDir,
            includeTargets: this.projectConfig.getIncludeTarget(),
            executableTargets: this.projectConfig.getExecutableTarget(),
            libTargets: this.projectConfig.getLibTarget(),
            testTargets: this.projectConfig.getTestTarget(),
        });
    }
}

