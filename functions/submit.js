const nodemailer = require('nodemailer');
const axios = require('axios');
const fs = require('fs');
const archiver = require('archiver');
const path = require('path');

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method Not Allowed' }),
        };
    }

    let formData;
    try {
        formData = JSON.parse(event.body);
    } catch (error) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Invalid JSON' }),
        };
    }

    const { name, email, message, fileUrls } = formData;

    if (!email) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Email address is required' }),
        };
    }

    // Download images from URLs and create a ZIP file
    const downloadedFiles = [];
    try {
        for (const [index, url] of fileUrls.entries()) {
            const response = await axios({
                url: url,
                responseType: 'stream',
            });
            const filePath = path.join('/tmp', `image${index + 1}.jpg`);
            const writer = fs.createWriteStream(filePath);
            response.data.pipe(writer);
            await new Promise((resolve, reject) => {
                writer.on('finish', resolve);
                writer.on('error', reject);
            });
            downloadedFiles.push({ path: filePath, name: `image${index + 1}.jpg` });
        }

        // Create ZIP file
        const zipPath = path.join('/tmp', 'images.zip');
        await new Promise((resolve, reject) => {
            const output = fs.createWriteStream(zipPath);
            const archive = archiver('zip', { zlib: { level: 9 } });
            output.on('close', resolve);
            archive.on('error', reject);
            archive.pipe(output);
            downloadedFiles.forEach(file => archive.file(file.path, { name: file.name }));
            archive.finalize();
        });

        // Send emails with ZIP file attached
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

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
            attachments: [{ filename: 'images.zip', path: zipPath }],
        };

        await transporter.sendMail(userMailOptions);
        await transporter.sendMail(adminMailOptions);

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Form submitted successfully! A confirmation email with the ZIP file has been sent.' }),
        };
    } catch (error) {
        console.error('Error processing submission:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Error: ' + error.message }),
        };
    }
};
