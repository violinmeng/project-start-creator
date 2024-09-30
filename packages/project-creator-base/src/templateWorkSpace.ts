import fs from 'fs';
import path from 'path';
import Mustache from 'mustache';

export class TemplateWorkSpace {
    private dir: string;
    private templateRoot: string;

    constructor(dir: string, templateRoot: string) {
        this.dir = dir;
        this.templateRoot = templateRoot;

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

    public mkSubDir(relativePath: string): TemplateWorkSpace {
        try {
            fs.mkdirSync(path.join(this.dir, relativePath));
            return new TemplateWorkSpace(path.join(this.dir, relativePath), this.templateRoot);
        } catch (error) {
            console.error(`[ERROR] [Workspace] [mkdir] Failed to create directory ${this.dir}: ${error}`);
            throw error;
        }
    }

    public copyFromTemplate(templatePath: string,): void {
        try {
            fs.copyFileSync(path.join(this.templateRoot, templatePath), path.join(this.dir, templatePath));
        } catch (error) {
            console.error(`[ERROR] [Workspace] [copyFromTemplate] Failed to copy file from ${templatePath} to ${this.dir}: ${error}`);
            throw error;
        }
    }

    public createFromTemplate(mustachePath: string, fileName: string, data: any): void {
        const templatePath = path.join(this.templateRoot, mustachePath);
        const outputPath = path.join(this.dir, fileName);
        const template = fs.readFileSync(templatePath, 'utf8');
        const output = Mustache.render(template, data);
        fs.writeFileSync(outputPath, output);
    }
}