import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import nodemailer from 'nodemailer';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, '..');

async function sendEmail() {
    const resultsPath = path.join(projectRoot, 'results.xml');
    let summary = {
        total: 0,
        passed: 0,
        failed: 0,
        duration: 'N/A'
    };

    if (fs.existsSync(resultsPath)) {
        const xmlData = fs.readFileSync(resultsPath, 'utf8');
        // Simple regex-based parsing to avoid extra dependencies if possible
        const testsMatch = xmlData.match(/tests="(\d+)"/);
        const failuresMatch = xmlData.match(/failures="(\d+)"/);
        const timeMatch = xmlData.match(/time="([\d\.]+)"/);

        summary.total = testsMatch ? parseInt(testsMatch[1]) : 0;
        summary.failed = failuresMatch ? parseInt(failuresMatch[1]) : 0;
        summary.passed = summary.total - summary.failed;
        summary.duration = timeMatch ? `${timeMatch[1]}s` : 'N/A';
    }

    const env = process.env.TEST_ENV || 'DEV';
    const browser = process.env.BROWSER || 'chromium';
    const tags = process.env.BDD_TAGS || 'N/A';
    const buildNumber = process.env.BUILD_NUMBER || 'Local';
    const reportUrl = process.env.REPORT_URL || '#';

    const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
    const smtpPort = parseInt(process.env.SMTP_PORT || '587');
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const recipientRaw = process.env.EMAIL_RECIPIENT || '';

    // Replace semicolons with commas for Nodemailer multi-recipient support
    const recipient = recipientRaw.replace(/;/g, ',');

    const checkVar = (name, val) => {
        if (!val || val.startsWith('$(') || val.includes('{{')) {
            console.warn(`[Warning] Variable "${name}" is missing or unresolved (value: "${val}").`);
            return false;
        }
        return true;
    };

    const ok = checkVar('SMTP_HOST', smtpHost) &&
        checkVar('SMTP_USER', smtpUser) &&
        checkVar('SMTP_PASS', smtpPass) &&
        checkVar('EMAIL_RECIPIENT', recipient);

    if (!ok) {
        console.warn('Skipping email notification due to missing variables. Please define them in Azure Pipeline UI.');
        return;
    }

    const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: { user: smtpUser, pass: smtpPass }
    });

    const status = summary.failed > 0 ? '❌ FAILED' : '✅ PASSED';

    const mailOptions = {
        from: `"Playwright CI" <${smtpUser}>`,
        to: recipient,
        subject: `Automation Report: ${status} | Build: ${buildNumber} | Env: ${env}`,
        html: `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
                <div style="background-color: ${summary.failed > 0 ? '#d9534f' : '#4CAF50'}; color: white; padding: 20px; text-align: center;">
                    <h1 style="margin: 0;">Test Execution ${status}</h1>
                    <p style="margin: 5px 0 0 0;">Build Number: ${buildNumber}</p>
                </div>
                <div style="padding: 20px; color: #333;">
                    <h2 style="border-bottom: 2px solid #eee; padding-bottom: 10px;">Execution Details</h2>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr><td style="padding: 8px 0;"><strong>Environment:</strong></td><td>${env}</td></tr>
                        <tr><td style="padding: 8px 0;"><strong>Browser:</strong></td><td>${browser}</td></tr>
                        <tr><td style="padding: 8px 0;"><strong>Tags:</strong></td><td>${tags}</td></tr>
                        <tr><td style="padding: 8px 0;"><strong>Duration:</strong></td><td>${summary.duration}</td></tr>
                    </table>
                    
                    <h2 style="border-bottom: 2px solid #eee; padding-bottom: 10px; margin-top: 20px;">Summary</h2>
                    <div style="display: flex; justify-content: space-around; text-align: center; margin-top: 15px;">
                        <div style="flex: 1; background: #f8f9fa; margin: 5px; padding: 15px; border-radius: 5px;">
                            <div style="font-size: 24px; font-weight: bold; color: #333;">${summary.total}</div>
                            <div style="font-size: 12px; color: #666;">TOTAL</div>
                        </div>
                        <div style="flex: 1; background: #e8f5e9; margin: 5px; padding: 15px; border-radius: 5px;">
                            <div style="font-size: 24px; font-weight: bold; color: #2e7d32;">${summary.passed}</div>
                            <div style="font-size: 12px; color: #666;">PASSED</div>
                        </div>
                        <div style="flex: 1; background: #ffebee; margin: 5px; padding: 15px; border-radius: 5px;">
                            <div style="font-size: 24px; font-weight: bold; color: #c62828;">${summary.failed}</div>
                            <div style="font-size: 12px; color: #666;">FAILED</div>
                        </div>
                    </div>

                    <div style="margin-top: 30px; text-align: center;">
                        <a href="${reportUrl}" style="background-color: #0078d4; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">View Azure DevOps Pipeline Report</a>
                    </div>
                </div>
                <div style="background-color: #f4f4f4; color: #888; padding: 15px; text-align: center; font-size: 12px;">
                    This is an automated message. Please do not reply.
                </div>
            </div>
        `
    };

    try {
        let info = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully');
        if (smtpHost.includes('ethereal.email')) {
            console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
        }
    } catch (error) {
        console.error('Error sending email:', error);
    }
}

sendEmail().catch(console.error);
