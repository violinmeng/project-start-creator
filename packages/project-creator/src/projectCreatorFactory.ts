import { ProjectConfig, LangCreatorPlugin } from 'project-creator-base';
import { CppLangCreatorPlugin } from "cpp-template-plugin";
export class ProjectCreatorFactory {
    static createProjectCreator(lang: string, config: ProjectConfig) {

        const creatorPlugins: LangCreatorPlugin[] = [
            new CppLangCreatorPlugin(config, process.cwd()),
        ];

        const plugin = creatorPlugins.find(plugin => plugin.supportLang() === lang)
        if (plugin) {
            if (plugin.validateTargetTypes()) {
                plugin.createProject();
            } else {
                throw new Error('Exist unsupported target type');
            }
        } else {
            throw new Error('Unsupported language');
        }
    }
}
