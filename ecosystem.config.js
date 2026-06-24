module.exports = {
  apps: [
    {
      name: 'quickbooks-on-prem-api',
      script: 'src/server.js',
      cwd: __dirname,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '300M',
      env: {
        NODE_ENV: 'production',
        PORT: process.env.PORT || '3001'
      }
    }
  ]
};
