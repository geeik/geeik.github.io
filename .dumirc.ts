import { defineConfig } from 'dumi';
import { readdirSync } from 'fs';
import { join } from 'path';

//////////// 自动扫描子包 /////////////

const packages = readdirSync(join(__dirname, 'packages')).filter(
  (pkg) => pkg.charAt(0) !== '.',
);

const alias = packages.reduce((pre, pkg) => {
  pre[`@chao/${pkg}`] = join(__dirname, 'packages', pkg, 'src');
  return {
    ...pre,
  };
}, {} as Record<string, string>);

const uiComponents = packages
  .filter((name) => name.startsWith('ui-'))
  .map((name) => {
    return `packages/${name}/src`;
  });


 
//////////// 配置 /////////////

export default defineConfig({
  outputPath: 'docs-dist',
  themeConfig: {
    name: 'blog',
    nav: [
      {
        title: '编码规范',
        link: '/code-styles',
      },
      {
        title: '使用说明',
        link: '/guide',
      },
      {
        title: 'TypeScript',
        link: '/typescripts',
      },
      {
        title: '组件',
        link: '/components/example',
      },
    ],
  },
  alias,
  resolve: {
    docDirs: ['docs', ...uiComponents],
    atomDirs: [
      {
        type: 'service',
        dir: 'packages/service/src',
      },
      {
        type: 'typescript',
        dir: 'packages/typescript/src',
      },
    ],
  },
  theme: {
    '@dumi-theme-antd-style': {
      apiHeader: false,
    },
  },
});
