import nodemailer from "nodemailer";
export const sendMail= async ({ from, to, subject, text, htmlTo,htmlFrom}) => {
        let transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.MAIL_USER, // generated ethereal user
                pass: process.env.MAIL_PASSWORD, // generated ethereal password
            },
        });

        // send mail with defined transport object
    let info = await transporter.sendMail({
        from: `cloudShare <${from}>`, // sender address
        to: to, // list of receivers
        subject: subject, // Subject line
        text: text, // plain text body
        html: htmlTo, // html body
    });
    let info1 = await transporter.sendMail({
        from: `cloudShare <${from}>`, // sender address
        to: from, // list of receivers
        subject: subject, // Subject line
        text: text, // plain text body
        html: htmlFrom, // html body
    });
}