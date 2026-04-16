export default ({
  plugins: ['@snowpack/plugin-typescript'],
  packageOptions : {
    external: [
      '@web/dev-server-core',
      '@web/dev-server-esbuild',
      'esbuild',
      'crypto',
      '@openscd/open-scd-core',
      '@openscd/oscd-scl',
    ],
  },
  exclude: [
    "**/node_modules/**/*",
    ".editorconfig",
    ".eslintrc.cjs",
    ".travis.yml",
    "**/karma.conf.cjs",
    "**/Dockerfile",
    "**/package*",
    "**/tsconfig.json",
    "**/workbox-config.cjs",
    "**/*.@(spec|test).@(js|mjs)",
    "**/__snapshots__/**/*",
    "**/coverage/**/*",
    "**/out-tsc/**/*",
    "**/test/**/*",
    ".gitignore",
    "**/.git/**",
    "**/.github/**",
    "**/.idea/**",
    "**/web-test-runner.config.mjs",
    "**/oscd-plugins/auto-doc/**/*",
  ],
  workspaceRoot: "../../",
  mount: {
    '../../node_modules/@compas-oscd/plugins/': '/plugins/',
    '../external-plugins/': '/external-plugins/',
    "./": "/",
  },
  buildOptions: {
    htmlFragments: true,
  }
});

