const nodemailer = require('nodemailer');
const formidable = require('formidable');
const path = require('path');
const fs = require('fs');
const util = require('util');
const { unlink } = require('fs').promises;

// Ensure the uploads directory exists in Netlify's temporary storage
const uploadDir = '/tmp/uploads';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Promisify unlink function
const unlinkAsync = util.promisify(fs.unlink);

exports.handler = async (event) => {
    return new Promise((resolve, reject) => {
        // Create an instance of formidable.IncomingForm
        const form = new formidable.IncomingForm();
        form.uploadDir = uploadDir;  // Specify the temporary upload directory
        form.keepExtensions = true;  // Keep the file extensions
        form.parse(event, async (err, fields, files) => {
            if (err) {
                console.error('Form parsing error:', err);
                return resolve({
                    statusCode: 500,
                    body: 'Form parsing error: ' + err.message
                });
            }

            const { name, email, message } = fields;

            if (!email) {
                return resolve({
                    statusCode: 400,
                    body: 'Error: Email address is required.'
                });
            }

            // Configure Nodemailer
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS
                }
            });

            // Create an array of attachments for the email
            const attachments = Object.values(files).map(file => ({
                filename: file.originalFilename || file.newFilename,
                path: file.filepath
            }));

            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: email,
                subject: 'Thank you for your submission!',
                text: `Hi ${name},\n\nThank you for your message: "${message}".\n\nWe have received your submission and will get back to you soon.`,
                attachments: attachments
            };

            try {
                const info = await transporter.sendMail(mailOptions);
                console.log('Email sent:', info.response);

                // Clean up uploaded files
                await Promise.all(attachments.map(file => unlinkAsync(file.path)));

                resolve({
                    statusCode: 200,
                    body: 'Form submitted successfully! A confirmation email has been sent.'
                });
            } catch (error) {
                console.error('Error sending email:', error);
                resolve({
                    statusCode: 500,
                    body: 'Error: ' + error.message
                });
            }
        });
    });
};
