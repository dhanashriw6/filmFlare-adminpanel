module.exports = {
  apps: [
    {
      name: 'filmflare-admin-dev',
      script: 'node_modules/.bin/next',
      args: 'start',
      cwd: '/home/ubuntu/services/dev-filmflare-admin',
      watch: false,
      env: {
        NODE_ENV: 'development',
        PORT: 4001,
      },
    },
  ],
}
