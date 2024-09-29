import { ProjectCreator } from "./ProjectCreator";
import path from 'path';
import fs from 'fs';
import Mustache from 'mustache';
import { Target, TargetType } from "../ProjectConfig";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TEMPLATE_DIR = path.join(__dirname, './templates/cpp');
const BIN_DIR = path.join(TEMPLATE_DIR, 'bin');
const LIB_DIR = path.join(TEMPLATE_DIR, 'lib');
const TESTS_DIR = path.join(TEMPLATE_DIR, 'tests');

const BIN_NAME = 'bin';
const BIN_MAIN_FILE = 'main';
const INCLUDE_NAME = 'include';
const CMAKE_LIST_FILE = 'CMakeLists.txt';
const LIB_NAME = 'lib';
const TESTS_NAME = 'tests';

const HEADER_HPP_MUSTACHE = 'header.hpp.mustache';
const IMPL_CPP_MUSTACHE = 'impl.cpp.mustache';
const CMAKE_MUSTACHE = 'cmake.mustache';

const COPY_FILES = [
    '.clang-format',
    '.clang-tidy',
    '.gitignore',
    'Makefile',
];

export class CppProjectCreator extends ProjectCreator {
    createProject(): void {
        console.log('Creating C++ project');
        console.log("DEBUG:", __dirname, __filename);

        // rootDir is required
        if (!this.config.rootDir) {
            console.error('rootDir is required.');
            return;
        }

        // create project dir in current dir
        const projectDir = path.join(process.cwd(), this.config.rootDir);
        // if project dir exists, inform user and exit
        if (fs.existsSync(projectDir)) {
            console.error(`Project directory ${projectDir} already exists. Please choose a different rootDir.`);
            process.exit(1);
        }

        fs.mkdirSync(projectDir);
        this.createIncludeDirIfNeeded(projectDir);
        this.createExcutableDirIfNeeded(projectDir);
        this.createLibDirIfNeeded(projectDir);
        this.createTestsDirIfNeeded(projectDir);

        // create CMakeLists.txt in project dir
        const cmakeListsFile = path.join(projectDir, CMAKE_LIST_FILE);
        fs.writeFileSync(
            cmakeListsFile, 
            Mustache.render(
                fs.readFileSync(path.join(TEMPLATE_DIR, CMAKE_MUSTACHE), 'utf-8'), 
                createViewHelpers({
                    projectName: this.config.rootDir,
                    includeDependencies: this.config.getIncludeTarget(),
                    executableTargets: this.config.getExecutableTarget(),
                    libTargets: this.config.getLibTarget(),
                    testTargets: this.config.getTestTarget(),
                })
            )
        );

        // create README.md in project dir
        const readmeFile = path.join(projectDir, 'README.md');
        fs.writeFileSync(
            readmeFile, 
            `# ${this.config.rootDir}`
        );

        // copy files from template dir to project dir
        COPY_FILES.forEach(file => {
            this.copyFileFromTemplateDir(TEMPLATE_DIR, projectDir, file);
        });
    }

    // create include dir if needed
    private createIncludeDirIfNeeded(projectDir: string): void {
        // if include target is not empty, create include dir
        const includeTarget = this.config.getIncludeTarget();
        if (includeTarget.length > 0) {
            const includeDir = path.join(projectDir, INCLUDE_NAME);
            fs.mkdirSync(includeDir);
            
            // create targets dir in include dir
            includeTarget.forEach(target => {
                const targetDir = path.join(includeDir, target.name);
                fs.mkdirSync(targetDir);
                // create source file in target dir
                // remove file extension
                this.createHeaderFileInDir(targetDir, target.name);
            });
        }
    }

    // create excutable dir if needed
    private createExcutableDirIfNeeded(projectDir: string): void {
        const excutableDir = path.join(projectDir, BIN_NAME);
        fs.mkdirSync(excutableDir);

        if (this.config.getExecutableTarget().length != 1) {
            console.error('Exactly one executable target is required.');
            return;
        }
        const target = this.config.getExecutableTarget()[0];

        // create main.cpp in excutable dir
        this.createSourceFileInDir(excutableDir, BIN_MAIN_FILE, target);

        // create CMakeLists.txt in bin dir
        const cmakeListsFile = path.join(excutableDir, CMAKE_LIST_FILE);
        fs.writeFileSync(
            cmakeListsFile, 
            Mustache.render(
                fs.readFileSync(path.join(BIN_DIR, CMAKE_MUSTACHE), 'utf-8'), 
                createViewHelpers({
                    targetName: target.name,
                    dependencies: target.dependencies,
                })
            )
        );
    }

    // create lib dir if needed
    private createLibDirIfNeeded(projectDir: string): void {
        const libDir = path.join(projectDir, LIB_NAME);
        fs.mkdirSync(libDir);

        // create sub dir in lib dir
        const libTarget = this.config.getLibTarget();
        libTarget.forEach(target => {
            const targetDir = path.join(libDir, target.name);
            fs.mkdirSync(targetDir);

            // create source file in target dir
            this.createSourceFileInDir(targetDir, target.name, target);

            // create sub include dir in target dir
            const includeDir = path.join(targetDir, INCLUDE_NAME);
            fs.mkdirSync(includeDir);

            // create header file in include dir
            this.createHeaderFileInDir(includeDir, target.name);

            // create CMakeLists.txt in lib dir
            const cmakeListsFile = path.join(libDir, CMAKE_LIST_FILE);
            fs.writeFileSync(
                cmakeListsFile, 
                Mustache.render(
                    fs.readFileSync(path.join(LIB_DIR, CMAKE_MUSTACHE), 'utf-8'), 
                    createViewHelpers({
                        targetName: target.name,
                        includeDependencies: target?.dependencies?.filter(dependency => dependency === TargetType.Include),
                        libDependencies: target?.dependencies?.filter(dependency => dependency === TargetType.Lib),
                    })
                )
            );
        });
    }

    // create tests dir if needed
    private createTestsDirIfNeeded(projectDir: string): void {
        const testsDir = path.join(projectDir, TESTS_NAME);
        fs.mkdirSync(testsDir);

        // create sub dir in tests dir
        const testsTarget = this.config.getTestTarget();
        testsTarget.forEach(target => {
            const targetDir = path.join(testsDir, target.name);
            fs.mkdirSync(targetDir);

            // create source file in target dir
            this.createSourceFileInDir(targetDir, target.name, target);

            // create CMakeLists.txt in tests dir
            const cmakeListsFile = path.join(testsDir, CMAKE_LIST_FILE);
            fs.writeFileSync(
                cmakeListsFile, 
                Mustache.render(
                    fs.readFileSync(path.join(TESTS_DIR, CMAKE_MUSTACHE), 'utf-8'), 
                    createViewHelpers({
                        targetName: target.name,
                        includeDependencies: target?.dependencies?.filter(dependency => dependency === TargetType.Include),
                        libDependencies: target?.dependencies?.filter(dependency => dependency === TargetType.Lib),
                    })
                )
            );
        });
    }

    

    // create header file in given dir
    private createHeaderFileInDir(dir: string, fileName: string): void {
        const view = createViewHelpers({
            fileName: fileName,
        });
        const targetHeaderFile = path.join(dir, `${fileName}.hpp`);
        fs.writeFileSync(
            targetHeaderFile, 
            Mustache.render(
                fs.readFileSync(path.join(TEMPLATE_DIR, HEADER_HPP_MUSTACHE), 'utf-8'), 
                view
            )
        );
    }

    // create source file in given dir with given target
    private createSourceFileInDir(dir: string, fileName: string, target: Target): void {
        const view = createViewHelpers({
            fileName: fileName,
            targetName: target.name,
            dependencies: target.dependencies,
            isMain: target.type === TargetType.Executable,
            isTest: target.type === TargetType.Test,
        });
        const targetSourceFile = path.join(dir, `${fileName}.cpp`);
        console.log("DEBUG:", TEMPLATE_DIR, path.join(TEMPLATE_DIR, IMPL_CPP_MUSTACHE));
        // handle write file error
        try {
            fs.writeFileSync(
                targetSourceFile, 
            Mustache.render(
                fs.readFileSync(path.join(TEMPLATE_DIR, IMPL_CPP_MUSTACHE), 'utf-8'), 
                view
            )
            );
        } catch (error) {
            console.error(`Error creating source file ${targetSourceFile}: ${error}`);
        }
    }

    // copy file from template dir to target dir
    private copyFileFromTemplateDir(templateDir: string, targetDir: string, fileName: string): void {
        const targetFile = path.join(targetDir, fileName);
        fs.copyFileSync(path.join(templateDir, fileName), targetFile);
    }
}

export const createViewHelpers = (data: any) => ({
    ...data,
    toUpper: () => (text: string, render: (value: string) => string) => render(text).toUpperCase(),
    toLower: () => (text: string, render: (value: string) => string) => render(text).toLowerCase(),
    // 可以添加更多辅助函数
});