const nodemailer = require('nodemailer');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

exports.handler = async (event) => {
    console.log('Received event:', JSON.stringify(event, null, 2));

    if (event.httpMethod !== 'POST') {
        console.log('Method not allowed:', event.httpMethod);
        return {
            statusCode: 405,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ error: 'Method Not Allowed' }),
        };
    }

    let formData;
    try {
        formData = JSON.parse(event.body);
        console.log('Parsed form data:', formData);
    } catch (error) {
        console.error('Error parsing JSON:', error);
        return {
            statusCode: 400,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ error: 'Invalid JSON' }),
        };
    }

    const { name, email, message } = formData;

    if (!email) {
        console.log('Email address is missing.');
        return {
            statusCode: 400,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ error: 'Email address is required' }),
        };
    }

    try {
        const userMailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Thank you for your submission!',
            text: `Hi ${name},\n\nThank you for your message: "${message}".\n\nWe have received your submission and will get back to you soon.`,
        };

        const adminMailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER,
            subject: 'New Submission Received',
            text: `You have received a new submission from ${name} (${email}).\n\nMessage: ${message}`,
        };

        console.log('Sending user email:', userMailOptions);
        await transporter.sendMail(userMailOptions);

        console.log('Sending admin email:', adminMailOptions);
        await transporter.sendMail(adminMailOptions);

        console.log('Emails sent successfully.');
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: 'Form submitted successfully! A confirmation email has been sent.' }),
        };
    } catch (error) {
        console.error('Error processing submission:', error);
        return {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ error: 'Error: ' + error.message }),
        };
    }
};
