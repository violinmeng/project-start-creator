#!/usr/bin/env node

import { Command } from 'commander';
import * as path from 'path';
import { ProjectConfig } from 'project-creator-base';
import { ProjectCreatorFactory, Language } from './ProjectCreatorFactory';

const program = new Command();

program
  .name('create-project')
  .description('CLI to create a project with a specific structure and configuration')
  .version('1.0.0')
  .option('-l, --lang <language>', 'specify the programming language of the created project');

program.parse(process.argv);
const lang = program.opts().lang;
if (lang && !Object.values(Language).includes(lang as Language)) {
  console.error('无效的语言选项');
  process.exit(1);
}

const loadProjectConfig = async () => {
    const currentDir = process.cwd();
    // read project.config.js and transform to ProjectConfig
    const filePath = path.join(currentDir, 'project.config.mjs');

    try {
        const config = await import(filePath);
        return config;
    } catch (error) {
        console.error('未找到project.config.js文件');
        process.exit(1);
    }
}

const jsconfig = await loadProjectConfig();
const configObject = jsconfig.default;
const config = new ProjectConfig(configObject);

if (!config) {
  console.error('未找到project.config.js文件');
  process.exit(1);
}

// only cpp project can have include target
if (config.getIncludeTarget().length > 0 && lang !== Language.CPP) {
    console.error('only cpp project can have include target');
    process.exit(1);
}

const createProject = (lang: Language) => {
    const creator = ProjectCreatorFactory.createProjectCreator(lang, config);
    creator.createProject();
}

createProject(lang as Language);