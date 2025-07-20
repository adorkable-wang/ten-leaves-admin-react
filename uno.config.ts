// import { presetSoybeanAdmin } from '@sa/uno-preset';
import presetWind3 from '@unocss/preset-wind3';
import type { Theme } from '@unocss/preset-wind3';
import transformerDirectives from '@unocss/transformer-directives';
import transformerVariantGroup from '@unocss/transformer-variant-group';
import { defineConfig } from '@unocss/vite';

import { themeVars } from './src/theme/vars';

export default defineConfig<Theme>({
  content: {
    pipeline: {
      exclude: ['node_modules', 'dist']
    }
  },
  // presets: [presetWind3({ dark: 'class' }), presetSoybeanAdmin()],
  presets: [presetWind3({ dark: 'class' })],
  rules: [
    [
      /^h-calc\((.*)\)$/, // 匹配 h-clac(xxx) 的正则表达式
      ([, d]) => ({ height: `calc(${d})px` }) // 生成对应的 CSS 样式
    ]
  ],
  shortcuts: {
    'card-wrapper': 'rd-8px shadow-sm'
  },
  theme: {
    ...themeVars,
    fontSize: {
      icon: '1.125rem',
      'icon-large': '1.5rem',
      'icon-small': '1rem',
      'icon-xl': '2rem',
      'icon-xs': '0.875rem'
    }
  },
  transformers: [transformerDirectives(), transformerVariantGroup()]
});
