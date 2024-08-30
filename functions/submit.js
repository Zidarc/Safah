const nodemailer = require('nodemailer');

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: 'Method Not Allowed',
        };
    }

    // Parse the request body
    let formData;
    try {
        formData = JSON.parse(event.body);
    } catch (error) {
        return {
            statusCode: 400,
            body: 'Invalid JSON',
        };
    }

    const { name, email, message } = formData;

    if (!email) {
        return {
            statusCode: 400,
            body: 'Error: Email address is required.',
        };
    }

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    // Email to the user
    const userMailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Thank you for your submission!',
        text: `Hi ${name},\n\nThank you for your message: "${message}".\n\nWe have received your submission and will get back to you soon.`,
    };

    // Email to the admin
    const adminMailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_USER, // Replace with your email if different
        subject: 'New Submission Received',
        text: `You have received a new submission from ${name} (${email}).\n\nMessage: ${message}`,
    };

    try {
        // Send confirmation email to the user
        await transporter.sendMail(userMailOptions);
        console.log('Confirmation email sent successfully.');

        // Send email with submission details to admin
        await transporter.sendMail(adminMailOptions);
        console.log('Admin email sent successfully.');

        return {
            statusCode: 200,
            body: 'Form submitted successfully! A confirmation email has been sent.',
        };
    } catch (error) {
        console.error('Error sending email:', error);
        return {
            statusCode: 500,
            body: 'Error: ' + error.message,
        };
    }
};
