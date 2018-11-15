module.exports = {
  apps: [{
    name: 'PaymentProcessor',
    script: './app.js'
  }],
  deploy: {
    production: {
      user: 'ubuntu',
      host: 'ec2-52-24-139-164.us-west-2.compute.amazonaws.com',
      key: '~/.ssh/PaymentProcessor.pem',
      ref: 'origin/master',
      repo: 'github.com/gmzelias/DashPaymentV1.git',
      path: '/home/ubuntu/PaymentProcessor',
      'post-deploy': 'npm install && pm2 startOrRestart ecosystem.config.js'
    }
  }
}