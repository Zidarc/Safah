const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const dotenv = require('dotenv');


dotenv.config();

const app = express();


app.use(cors());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


const uploadDir = path.join(__dirname, 'uploads');
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

app.post('/submit', upload.array('files'), (req, res) => {
    const { name, email, message } = req.body;
    const files = req.files;

    if (!email) {
        return res.status(400).send('Error: Email address is required.');
    }

    // Configure Nodemailer
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER, 
            pass: process.env.EMAIL_PASS  
        }
    });
    const attachments = files.map(file => ({
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

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending email:', error);
            return res.status(500).send('Error: ' + error.message);
        }
        console.log('Email sent:', info.response);
        res.status(200).send('Form submitted successfully! A confirmation email has been sent.');
    });
});

// Start the server
app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
