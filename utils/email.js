const nodemailer = require('nodemailer');
const hbs = require('nodemailer-express-handlebars');

const sendEmail = async options => {
    //1)create an transporter
    const transport = nodemailer.createTransport({
        // host: 'smtp.mailtrap.io',
        // port: 25,
        service: 'gmail',
        auth: {
            user: 'dasbiswajit56013@gmail.com',
            pass: 'placement'
        }
    });

    // transport.use('compile', hbs({
    //     viewEngine: 'express-handlebars',
    //     viewPath: './../views'
    // }));

    //2)define the email option 
    const mailOptions = {
        from: 'dasbiswajit56013@gmail.com' /*'Jonas Schmedtmann <hello@jonas.io>'*/,
        to: 'biswajit.paapri@gmail.com',
        subject: options.subject,
        // template: 'resetPass',
        text: options.message,
        // html: `
        //     <div class="role-group">
        //         <label for="role">New Password</label>
        //         <input type="text" id="password" class="input_update" placeholder="new password">
        //     </div>
        //     <div class="password-group">
        //         <label for="passwordConfirm">Password Confirm</label>
        //         <input type="password" id="passwordConfirm" class="input_update" placeholder="............">
        //     </div>
        //     <div class="confirm_password-group">
        //         <label for="confirm_password" id="confirm_password">Token</label>
        //         <input id="token" class="input_update" value="${options.message}">
        //     </div>
        //     <button class="reset-btn">Reset Pass</button>
        // `
    };

    //3)send the email
    await transport.sendMail(mailOptions);

}

module.exports = sendEmail;