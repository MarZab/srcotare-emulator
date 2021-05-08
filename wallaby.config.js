module.export = {
  autoDetect: true,
  testFramework: {
    configFile: './jest.config.js',
  },
  env: {
    type: 'node',
    params: {
      runner: '-r ./.pnp.js',
    },
  },
};
