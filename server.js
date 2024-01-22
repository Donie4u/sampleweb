const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();

// Middleware to parse POST request body
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the 'public' directory
app.use(express.static(__dirname + '/public'));
// app.use(express.static("public"));

// Read the email and password from the config file
const config = JSON.parse(fs.readFileSync('config.json', 'utf-8'));

// Serve your HTML form
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

// Handle form submission
app.post('/send-email', (req, res) => {
    const { name, email, message } = req.body;

    console.log('send-email is invoked');

    // Create a Nodemailer transporter
    const transporter = nodemailer.createTransport({
        service: 'Gmail', // Use your email service provider or SMTP server details
        debug: true,
        logger: true,
        auth: {
            user: config.email, // Read email from config.json
            pass: config.password, // Read password from config.json
        },
    });

    // Email data
    const mailOptions = {
        from: config.email, // Use the email from config.json as the sender
        to: 'hdttechnologies@gmail.com', // Destination email address
        subject: 'New Contact Form Submission',
        text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
    };

    // Send the email
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error(error);
            res.status(500).send('Error sending email');
        } else {
            console.log('Email sent: ' + info.response);
            res.json({ success: true, message: 'Email Sent Successfully' });
        }
    });
});

// Start the server
const port = 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
