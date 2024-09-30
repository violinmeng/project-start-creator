import { readFileSync } from 'fs';

import { createConfig } from '../../shared/rollup.config.mjs';

import copy from 'rollup-plugin-copy';

const config = createConfig({
    pkg: JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8'))
});
export default {
    ...config,
    plugins: [...config.plugins,
    copy({
      targets: [
        { src: 'src/template/.*', dest: 'dist/template' },
        { src: 'src/template/**/*', dest: 'dist/template' },
      ]
    })]
};