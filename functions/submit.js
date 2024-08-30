const nodemailer = require('nodemailer');
const { parse } = require('querystring');

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const formData = parse(event.body);
    const { name, email, message } = formData;

    if (!email) {
        return { statusCode: 400, body: 'Email address is required.' };
    }

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Thank you for your submission!',
        text: `Hi ${name},\n\nThank you for your message: "${message}".\n\nWe have received your submission and will get back to you soon.`
    };

    try {
        await transporter.sendMail(mailOptions);
        return { statusCode: 200, body: 'Email sent successfully!' };
    } catch (error) {
        console.error('Error sending email:', error);
        return { statusCode: 500, body: 'Error: ' + error.message };
    }
};
