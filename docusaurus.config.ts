import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'Login With Domain',
  tagline: 'Use your domain as your identity',
  favicon: 'img/favicon.ico',

  future: {
    v4: true,
    faster: false,
  },

  url: 'https://docs.loginwithdomain.com',
  baseUrl: '/',

  organizationName: 'Falci',
  projectName: 'loginwithdomain-docs',

  onBrokenLinks: 'throw',
  trailingSlash: false,

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  markdown: {
    mermaid: true,
  },

  themes: ['@docusaurus/theme-mermaid'],

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          routeBasePath: '/',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: 'img/logo.svg',
    colorMode: {
      respectPrefersColorScheme: true,
    },
    mermaid: {
      theme: { light: 'neutral', dark: 'dark' },
    },
    navbar: {
      title: 'Login With Domain',
      logo: {
        alt: 'Login With Domain',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'mainSidebar',
          position: 'left',
          label: 'Docs',
        },
        {
          href: 'https://loginwithdomain.com',
          label: 'loginwithdomain.com',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Protocol',
          items: [
            { label: 'Overview', to: '/protocol/overview' },
            { label: 'DNS Records', to: '/protocol/dns-records' },
            { label: 'Challenge Code', to: '/protocol/challenge-code' },
            { label: 'Service Provider', to: '/protocol/service-provider' },
          ],
        },
        {
          title: 'OAuth Integration',
          items: [
            { label: 'Overview', to: '/oauth/overview' },
            { label: 'Authorization Flow', to: '/oauth/authorization-flow' },
            { label: 'validation_data', to: '/oauth/validation-data' },
          ],
        },
        {
          title: 'Guides',
          items: [
            { label: 'Sign Up', to: '/guides/signup' },
            { label: 'Integrate OAuth', to: '/guides/integrate-oauth' },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Login With Domain.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['bash', 'json', 'http'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
