
export default {
    rootDir: "cpp-design-pattern",
    targets: [
        {
            type: "executable",
            name: "main",
            dependencies: ["base", "common"]
        },
        {
            type: "lib",
            name: "base"
        },
        {
            type: "lib",
            name: "common",
            dependencies: ["base"]
        },
    ]
}
