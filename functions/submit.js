const nodemailer = require('nodemailer');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { parse } = require('querystring');
const { promisify } = require('util');
const parseForm = promisify(require('formidable').parse);

const uploadDir = '/tmp/uploads';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

exports.handler = async (event) => {
    try {
        // Parse the incoming form data
        const { fields, files } = await parseForm(event);

        const { name, email, message } = fields;

        if (!email) {
            return {
                statusCode: 400,
                body: 'Error: Email address is required.'
            };
        }

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const attachments = files.files.map(file => ({
            filename: file.originalFilename,
            path: file.filepath
        }));

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Thank you for your submission!',
            text: `Hi ${name},\n\nThank you for your message: "${message}".\n\nWe have received your submission and will get back to you soon.`,
            attachments: attachments
        };

        await transporter.sendMail(mailOptions);

        // Clean up temporary files
        attachments.forEach(file => fs.unlinkSync(file.path));

        return {
            statusCode: 200,
            body: 'Form submitted successfully! A confirmation email has been sent.'
        };

    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            body: 'Error: ' + error.message
        };
    }
};
