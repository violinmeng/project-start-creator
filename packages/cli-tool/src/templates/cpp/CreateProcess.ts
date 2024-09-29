import fs from 'fs';
import path from 'path';
import { IncludeTarget, ExecutableTarget, LibTarget, TestTarget, Target, TargetType } from '../../ProjectConfig';
import Mustache from 'mustache';
import { ProjectConfig } from '../../ProjectConfig';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const templateInfo = {
    path: path.join(__dirname, './templates/cpp'),
    copyLists: [
        '.clang-format',
        '.clang-tidy',
        '.gitignore',
        'Makefile',
    ],
}

export class WorkSpace {
    private dir: string;

    constructor(dir: string) {
        this.dir = dir;
        // if dir not exists, create it
        if (!fs.existsSync(dir)) {
            try {
                fs.mkdirSync(dir);
            } catch (error) {
                console.error(`[ERROR] [Workspace] [Constructor] Failed to create directory ${dir}: ${error}`);
                throw error;
            }
        }
    }

    public mkSubDir(relativePath: string): WorkSpace {
        try {
            fs.mkdirSync(path.join(this.dir, relativePath));
            return new WorkSpace(path.join(this.dir, relativePath));
        } catch (error) {
            console.error(`[ERROR] [Workspace] [mkdir] Failed to create directory ${this.dir}: ${error}`);
            throw error;
        }
    }

    public copyFromTemplate(templatePath: string,): void {
        try {
            fs.copyFileSync(path.join(templateInfo.path, templatePath), path.join(this.dir, templatePath));
        } catch (error) {
            console.error(`[ERROR] [Workspace] [copyFromTemplate] Failed to copy file from ${templatePath} to ${this.dir}: ${error}`);
            throw error;
        }
    }

    public createFromTemplate(mustachePath: string, fileName: string, data: any): void {
        const templatePath = path.join(templateInfo.path, mustachePath);
        const outputPath = path.join(this.dir, fileName);
        const template = fs.readFileSync(templatePath, 'utf8');
        const output = Mustache.render(template, data);
        fs.writeFileSync(outputPath, output);
    }
}

export const targetMustacheData = (data: Target) => ({
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

export const targetActions = {
    include: (rootWorkspace: WorkSpace, targets: IncludeTarget[]) => {
        if (!targets.length) {
            return;
        }
        const includeDir = rootWorkspace.mkSubDir("include");
        targets.forEach(target => {
            const targetDir = includeDir.mkSubDir(target.name);
            targetDir.createFromTemplate("header.hpp.mustache", target.name, targetMustacheData(target));
        });
    },
    executable: (rootWorkspace: WorkSpace, targets: ExecutableTarget[]) => {
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
    library: (rootWorkspace: WorkSpace, targets: LibTarget[]) => {
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
    test: (rootWorkspace: WorkSpace, targets: TestTarget[]) => {
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
    copy: (rootWorkspace: WorkSpace) => {
        templateInfo.copyLists.map(path => {
            rootWorkspace.copyFromTemplate(path);
        });
    }
}

export class CreateProcess {
    private projectConfig: ProjectConfig;
    private rootWorkSpace?: WorkSpace;

    constructor(projectConfig: ProjectConfig, currentWorkDir: string) {
        this.projectConfig = projectConfig;
        if (projectConfig.rootDir.length) {
        } else {

        }
        try {
            this.rootWorkSpace = new WorkSpace(path.join(currentWorkDir, projectConfig.rootDir));
        } catch (error) {
            console.error('create root workspace failed.');
        }
    }

    public create(): void {
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

