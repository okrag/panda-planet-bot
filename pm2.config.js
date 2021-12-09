module.exports = {
  apps: [
    {
      name: "panda-planet-bot",
      script: "./build/index.js",
      env: {
        NODE_ENV: "development",
      },
      env_production: {
        NODE_ENV: "production",
      },
      watch: true,
    },
  ],
};
