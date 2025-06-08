module.exports = {
  appId: 'com.smarttask.manager',
  productName: 'スマートタスク管理',
  directories: {
    output: 'dist-electron'
  },
  main: 'electron/dist/main.js',
  files: [
    'dist/**/*',
    'node_modules/**/*',
    'server/**/*',
    'electron/dist/**/*'
  ],
  extraResources: [
    {
      from: 'server',
      to: 'server'
    }
  ],
  mac: {
    category: 'public.app-category.productivity',
    target: [
      {
        target: 'dmg',
        arch: ['x64', 'arm64']
      },
      {
        target: 'zip',
        arch: ['x64', 'arm64']
      }
    ],
    darkModeSupport: true,
    gatekeeperAssess: false,
    hardenedRuntime: true,
    entitlements: 'electron/entitlements.mac.plist'
  },
  dmg: {
    title: 'スマートタスク管理',
    contents: [
      {
        x: 130,
        y: 220
      },
      {
        x: 410,
        y: 220,
        type: 'link',
        path: '/Applications'
      }
    ],
    window: {
      width: 540,
      height: 380
    }
  },
  nsis: {
    oneClick: false,
    allowToChangeInstallationDirectory: true
  },
  publish: {
    provider: 'github',
    owner: 'your-username',
    repo: 'smart-task-manager'
  }
};