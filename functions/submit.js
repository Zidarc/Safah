const nodemailer = require('nodemailer');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

dotenv.config();

const uploadDir = path.join('/tmp/uploads');
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

exports.handler = async (event, context) => {
    return new Promise((resolve, reject) => {
        const multerMiddleware = upload.array('files');

        multerMiddleware(event, {}, async (err) => {
            if (err) {
                console.error('Multer error:', err);
                return resolve({
                    statusCode: 500,
                    body: 'File upload error: ' + err.message
                });
            }

            const { name, email, message } = JSON.parse(event.body);

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

            const attachments = event.files.map(file => ({
                filename: file.originalname,
                path: file.path
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

                attachments.forEach(file => fs.unlinkSync(file.path));

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
