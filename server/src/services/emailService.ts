import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { ComplianceObligation } from '../types/shared';

dotenv.config();

// Configure Transporter
// For Hackathon: Use Gmail App Password or Ethereal (Mock)
const transporter = nodemailer.createTransport({
    service: 'gmail', // or use host/port for generic SMTP
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

export const EmailService = {
    /**
     * Send a generic email
     */
    async sendEmail(to: string, subject: string, html: string) {
        if (!process.env.EMAIL_USER) {
            console.warn('⚠️ EMAIL_USER missing. Printing email to console instead.');
            console.log(`[EMAIL MOCK] To: ${to} | Subject: ${subject}`);
            return { success: true, mock: true };
        }

        try {
            const info = await transporter.sendMail({
                from: `"Tax Copilot" <${process.env.EMAIL_USER}>`,
                to,
                subject,
                html
            });
            console.log('Message sent: %s', info.messageId);
            return { success: true, messageId: info.messageId };
        } catch (error) {
            console.error('Email Error:', error);
            return { success: false, error };
        }
    },

    /**
     * Send Deadline Alert
     */
    async sendDeadlineAlert(userEmail: string, userName: string, deadline: ComplianceObligation) {
        const subject = `⚠️ ACTION REQUIRED: ${deadline.name} Due Soon`;
        const html = `
      <div style="font-family: sans-serif; color: #333;">
        <h2>Hi ${userName},</h2>
        <p>This is a reminder that you have an upcoming compliance deadline.</p>
        
        <div style="border: 1px solid #e2e8f0; padding: 16px; border-radius: 8px; background-color: #f8fafc;">
          <h3 style="margin-top: 0; color: #dc2626;">${deadline.name}</h3>
          <p><strong>Due Date:</strong> ${new Date(deadline.dueDate!).toDateString()}</p>
          <p><strong>Description:</strong> ${deadline.description}</p>
          ${deadline.penalty ? `<p style="color: #ef4444;"><strong>Potential Penalty:</strong> ${deadline.penalty}</p>` : ''}
        </div>

        <p>Please log in to Tax Copilot to mark this as complete.</p>
        <a href="http://localhost:5173" style="background-color: #6366f1; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Open Dashboard</a>
      </div>
    `;
        return this.sendEmail(userEmail, subject, html);
    },

    /**
     * Send Weekly Summary
     */
    async sendWeeklyDigest(userEmail: string, userName: string, pendingCount: number) {
        const subject = `Tax Copilot: Your Weekly Compliance Brief`;
        const html = `
      <h1>Weekly Update for ${userName}</h1>
      <p>You have <strong>${pendingCount}</strong> pending compliance actions this week.</p>
    `;
        return this.sendEmail(userEmail, subject, html);
    }
};
