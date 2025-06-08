module.exports = {
  appId: 'com.smarttask.manager',
  productName: 'スマートタスク管理',
  directories: {
    output: 'dist-electron'
  },
  files: [
    'dist/**/*',
    'electron/dist/**/*',
    {
      from: 'node_modules',
      to: 'node_modules',
      filter: ['!**/electron', '!**/electron-builder']
    }
  ],
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
    ]
  }
};