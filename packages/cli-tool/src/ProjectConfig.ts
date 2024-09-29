// 定义目标类型的枚举
export enum TargetType {
    Executable = 'executable',
    Include = 'include',
    Lib = 'lib',
    Test = 'test'
}

// 基础目标类
export class Target {
    type: TargetType;
    name: string;
    dependencies?: string[];

    constructor(type: TargetType, name: string, dependencies?: string[]) {
        this.type = type;
        this.name = name;
        this.dependencies = dependencies;
    }
}

// 可执行文件目标
export class ExecutableTarget extends Target {
    constructor(name: string, dependencies?: string[]) {
        super(TargetType.Executable, name, dependencies);
    }
}

// 包含文件目标
export class IncludeTarget extends Target {
    constructor(name: string) {
        super(TargetType.Include, name);
    }
}

// 库目标
export class LibTarget extends Target {
    constructor(name: string, dependencies?: string[]) {
        super(TargetType.Lib, name, dependencies);
    }
}

// 测试目标
export class TestTarget extends Target {
    constructor(name: string, dependencies?: string[]) {
        super(TargetType.Test, name, dependencies);
    }
}

// 主配置类
export class ProjectConfig {
    rootDir: string;
    targets: Target[];

    constructor(data: any) {
        this.rootDir = data['rootDir'];
        this.targets = data.targets.map((targetData: any) => {
            switch (targetData.type) {
                case TargetType.Executable:
                    return new ExecutableTarget(targetData.name, targetData.dependencies);
                case TargetType.Include:
                    return new IncludeTarget(targetData.name);
                case TargetType.Lib:
                    return new LibTarget(targetData.name, targetData.dependencies);
                case TargetType.Test:
                    return new TestTarget(targetData.name, targetData.dependencies);
                default:
                    throw new Error(`未知的目标类型: ${targetData.type}`);
            }
        });
    }

    // get the include target
    getIncludeTarget(): IncludeTarget[] {
        return this.targets.filter((target): target is IncludeTarget => target instanceof IncludeTarget);
    }

    // get the executable target
    getExecutableTarget(): ExecutableTarget[] {
        return this.targets.filter((target): target is ExecutableTarget => target instanceof ExecutableTarget);
    }

    // get the lib target
    getLibTarget(): LibTarget[] {
        return this.targets.filter((target): target is LibTarget => target instanceof LibTarget);
    }

    // get the test target
    getTestTarget(): TestTarget[] {
        return this.targets.filter((target): target is TestTarget => target instanceof TestTarget);
    }

    toString(): string {
        return JSON.stringify(this, null, 2);
    }
}