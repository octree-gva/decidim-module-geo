module.exports = {
    apps : [{
      name: "puma",
      script: "bundle",
      args: 'exec rails server -b 0.0.0.0',
      interpreter: "ruby",
      restart_delay: 10000,
      max_restarts: 3,
      max_memory_restart: "900M",
      min_uptime: 20000
    }, {
       name: 'webpack',
       script: 'bundle',
       args: 'exec webpack-dev-server',
       interpreter: "ruby",
       restart_delay: 10000,
       max_restarts: 3,
       max_memory_restart: "900M",
       min_uptime: 20000
    }]
  }