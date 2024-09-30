// import copy from 'rollup-plugin-copy';
// import path from "path";
// import { fileURLToPath } from "url";



import { builtinModules } from 'module';

// eslint-disable-next-line import/no-extraneous-dependencies
import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
/**
 * Create a base rollup config
 * @param {Record<string,any>} pkg Imported package.json
 * @param {string[]} external Imported package.json
 * @returns {import('rollup').RollupOptions}
 */
export function createConfig({ pkg, external = [] }) {
  return {
    input: 'src/index.ts',
    external: Object.keys(pkg.dependencies || {})
      .concat(Object.keys(pkg.peerDependencies || {}))
      .concat(builtinModules)
      .concat(external),
    // onwarn: (warning) => {
    //   throw Object.assign(new Error(), warning);
    // },
    strictDeprecations: true,
    output: [
      // {
      //   format: 'cjs',
      //   file: pkg.main,
      //   exports: 'named',
      //   footer: 'module.exports = Object.assign(exports.default, exports);',
      //   sourcemap: true
      // },
      {
        format: 'es',
        file: pkg.module,
        // plugins: [emitModulePackageFile()],
        sourcemap: true
      }
    ],
    plugins: [
      typescript({ sourceMap: true }),
      resolve(),
      commonjs()
    ]
  };
}

export function emitModulePackageFile() {
  return {
    name: 'emit-module-package-file',
    generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: 'package.json',
        source: `{"type":"module"}`
      });
    }
  };
}


// const tasks = subModuleNames.map((name) => ({
//   input: path.resolve(packagesDir, name, "src", `${libraryName}.ts`),
//   output: {
//     dir: path.resolve(packagesDir, name, "dist"),
//     name: libraryName,
//     format: "esm",
//     sourcemap: true,
//   },
//   // Indicate here external modules you don't wanna include in your bundle (i.e.: 'lodash')
//   external: ['path', 'fs'],
//   watch: {
//     include: `packages/${name}/src/**`,
//   },
//   plugins: [
//     typescript(),
//     resolve(),
//     commonjs(),
//     // copy({
//     //   targets: [
//     //     { src: 'src/templates/*', dest: 'dist/templates' },
//     //     { src: 'src/templates/app/*', dest: 'dist/templates/app' }
//     //   ]
//     // })
//   ],
// }));

// export default tasks;
