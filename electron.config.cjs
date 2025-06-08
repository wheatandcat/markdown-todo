module.exports = {
  appId: 'com.smarttask.manager',
  productName: 'スマートタスク管理',
  directories: {
    output: 'dist-electron'
  },
  files: [
    'dist/**/*',
    'electron/dist/**/*',
    'node_modules/**/*',
    '!node_modules/electron/**/*',
    '!node_modules/electron-builder/**/*',
    '!**/{.git,.DS_Store,*.log,*.tmp}',
    '!**/node_modules/*/{CHANGELOG.md,README.md,readme.md,changelog.md}',
    '!**/node_modules/*/{test,__tests__,tests,powered-test,example,examples}',
    '!**/node_modules/*.d.ts'
  ],
  extraMetadata: {
    main: 'electron/dist/main.js',
    type: undefined
  },
  mac: {
    category: 'public.app-category.productivity',
    target: [
      {
        target: 'dmg',
        arch: ['x64', 'arm64']
      }
    ],
    darkModeSupport: true,
    gatekeeperAssess: false
  },
  dmg: {
    title: 'スマートタスク管理'
  }
};