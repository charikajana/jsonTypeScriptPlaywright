import nodemailer from 'nodemailer';

async function testSMTP() {
    console.log('Generating test SMTP credentials via Ethereal...');

    // Create a test account
    let testAccount = await nodemailer.createTestAccount();

    console.log('--- Test Credentials ---');
    console.log('SMTP_HOST:', testAccount.smtp.host);
    console.log('SMTP_PORT:', testAccount.smtp.port);
    console.log('SMTP_USER:', testAccount.user);
    console.log('SMTP_PASS:', testAccount.pass);
    console.log('------------------------');

    // Create a transporter
    let transporter = nodemailer.createTransport({
        host: testAccount.smtp.host,
        port: testAccount.smtp.port,
        secure: testAccount.smtp.secure,
        auth: {
            user: testAccount.user,
            pass: testAccount.pass
        }
    });

    // Send a sample mail
    let info = await transporter.sendMail({
        from: '"Playwright Tester" <tester@example.com>',
        to: 'recipient@example.com',
        subject: 'Sample Automation Report',
        text: 'This is a test email from the automation framework.',
        html: '<b>This is a test email from the automation framework.</b>'
    });

    console.log('Message sent: %s', info.messageId);
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
}

testSMTP().catch(console.error);
