import nodemailer from 'nodemailer';
import { EnvironmentConfig } from '../executor/EnvironmentConfig.js';

export class EmailService {
    /**
     * Sends a test execution report email.
     */
    static async sendReport(recipient: string, summary: {
        total: number,
        passed: number,
        failed: number,
        duration: string,
        env: string,
        reportUrl: string
    }) {
        // These should ideally be set in your Environment JSON or System Env
        const smtpHost = EnvironmentConfig.get('SMTP_HOST', 'smtp.gmail.com');
        const smtpPort = parseInt(EnvironmentConfig.get('SMTP_PORT', '587'));
        const smtpUser = EnvironmentConfig.get('SMTP_USER', '');
        const smtpPass = EnvironmentConfig.get('SMTP_PASS', '');

        if (!smtpUser || !smtpPass) {
            console.warn('[EmailService] SMTP credentials missing. Skipping email sending.');
            return;
        }

        const transporter = nodemailer.createTransport({
            host: smtpHost,
            port: smtpPort,
            secure: smtpPort === 465,
            auth: {
                user: smtpUser,
                pass: smtpPass
            }
        });

        const status = summary.failed > 0 ? '❌ FAILED' : '✅ PASSED';

        const mailOptions = {
            from: `"Playwright BDD Reporter" <${smtpUser}>`,
            to: recipient,
            subject: `Test Execution Report: ${status} - ${summary.env}`,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd;">
                    <h2 style="color: ${summary.failed > 0 ? '#d9534f' : '#5cb85c'};">Test Execution Summary</h2>
                    <p><strong>Environment:</strong> ${summary.env}</p>
                    <p><strong>Status:</strong> ${status}</p>
                    <hr/>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 8px; border: 1px solid #eee;"><strong>Total Tests</strong></td>
                            <td style="padding: 8px; border: 1px solid #eee;">${summary.total}</td>
                        </tr>
                        <tr style="background-color: #f9f9f9;">
                            <td style="padding: 8px; border: 1px solid #eee; color: green;"><strong>Passed</strong></td>
                            <td style="padding: 8px; border: 1px solid #eee;">${summary.passed}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px; border: 1px solid #eee; color: red;"><strong>Failed</strong></td>
                            <td style="padding: 8px; border: 1px solid #eee;">${summary.failed}</td>
                        </tr>
                        <tr style="background-color: #f9f9f9;">
                            <td style="padding: 8px; border: 1px solid #eee;"><strong>Duration</strong></td>
                            <td style="padding: 8px; border: 1px solid #eee;">${summary.duration}</td>
                        </tr>
                    </table>
                    <p style="margin-top: 20px;">
                        <a href="${summary.reportUrl}" style="background-color: #0275d8; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">View Full Report</a>
                    </p>
                </div>
            `
        };

        try {
            await transporter.sendMail(mailOptions);
            console.log(`[EmailService] Report successfully sent to: ${recipient}`);
        } catch (error) {
            console.error('[EmailService] Failed to send email:', error);
        }
    }
}
