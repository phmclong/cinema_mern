const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  // service: 'smtp.gmail.com', //smtp.gmail.com  //in place of service use host...
  service: 'gmail', //smtp.gmail.com  //in place of service use host...
  secure: false, //true
  // secure: true, //true
  port: 25, //465
  // port: 465, //465
  auth: {
    // user: process.env.GMAIL_USER,
    user: 'phmclong',
    // pass: process.env.GMAIL_PASSWORD,
    pass: 'kldcudgynbrmfluc',
  },
  tls: {
    rejectUnauthorized: false,
  },
});

transporter.sendEMail = function(mailRequest) {
  return new Promise(function(resolve, reject) {
    transporter.sendMail(mailRequest, (error, info) => {
      if (error) {
        reject(error);
      } else {
        resolve('The message was sent!');
      }
    });
  });
};

module.exports = transporter;
