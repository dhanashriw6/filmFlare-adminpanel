module.exports = {
  apps: [
    {
      name: 'filmflare-admin-dev',
      script: 'node_modules/.bin/next',
      args: 'dev',
      watch: false,
      env: {
        NODE_ENV: 'development',
        PORT: 4001,
      },
    },
  ],
}
