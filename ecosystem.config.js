module.exports = {
  apps : [{
    name   : "PaymentProcessor",
    script : "./app.js"
  }],
  deploy: {
    production: {
      user: 'ubuntu',
      host: 'ec2-18-237-86-164.us-west-2.compute.amazonaws.com',
      key: 'C:/Users/gmzel/Desktop/PaymentProcessor.pem',
      ref: 'origin/master',
      repo: 'https://github.com/gmzelias/DashPaymentV1.git',
      path: '/home/ubuntu/Code/DashPayment',
      'post-deploy': 'npm install && pm2 startOrRestart ecosystem.config.js'
    }
  }
}
