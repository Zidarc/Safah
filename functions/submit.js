const nodemailer = require('nodemailer');
const Busboy = require('busboy');
const { promises: fs } = require('fs');
const path = require('path');

const uploadDir = '/tmp/uploads';  // Netlify's writable directory

// Ensure the uploads directory exists
fs.mkdir(uploadDir, { recursive: true }).catch(console.error);

exports.handler = async (event) => {
    return new Promise((resolve, reject) => {
        const busboy = new Busboy({ headers: event.headers });
        const files = [];
        const formData = {};

        busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
            const filePath = path.join(uploadDir, filename);
            files.push({ fieldname, filePath, filename });

            file.pipe(fs.createWriteStream(filePath));
        });

        busboy.on('field', (fieldname, value) => {
            formData[fieldname] = value;
        });

        busboy.on('finish', async () => {
            const { name, email, message } = formData;

            if (!email) {
                return resolve({
                    statusCode: 400,
                    body: 'Error: Email address is required.'
                });
            }

            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS
                }
            });

            const attachments = files.map(file => ({
                filename: file.filename,
                path: file.filePath
            }));

            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: email,
                subject: 'Thank you for your submission!',
                text: `Hi ${name},\n\nThank you for your message: "${message}".\n\nWe have received your submission and will get back to you soon.`,
                attachments: attachments
            };

            try {
                await transporter.sendMail(mailOptions);
                console.log('Email sent successfully.');

                // Clean up uploaded files
                await Promise.all(files.map(file => fs.unlink(file.filePath)));

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

        event.body.pipe(busboy);
    });
};
