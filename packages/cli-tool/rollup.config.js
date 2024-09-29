import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import copy from 'rollup-plugin-copy';

export default {
  input: 'src/index.ts',
  output: {
    dir: 'dist',
    format: 'esm',
    sourcemap: true
  },
  plugins: [
    typescript(),
    resolve(),
    commonjs(),
    copy({
      targets: [
        { src: 'src/templates/*', dest: 'dist/templates' },
        { src: 'src/templates/app/*', dest: 'dist/templates/app' }
      ]
    })
  ],
  external: ['path', 'fs', 'mustache'] // 外部依赖，不打包进最终文件
};
