import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

let transporter: Transporter | null = null;

// Configure email transporter
const configureEmail = () => {
  const emailService = process.env.EMAIL_SERVICE; // 'gmail', 'sendgrid', etc.
  const emailUser = process.env.EMAIL_USER;
  const emailPassword = process.env.EMAIL_PASSWORD;
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT;

  if (!emailUser || !emailPassword) {
    console.warn('⚠️  Email not configured - notifications will be disabled');
    return false;
  }

  // Configure based on service
  if (emailService === 'gmail') {
    transporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: emailUser,
        pass: emailPassword,
      },
    });
  } else if (smtpHost && smtpPort) {
    // Custom SMTP
    transporter = nodemailer.createTransporter({
      host: smtpHost,
      port: parseInt(smtpPort),
      secure: smtpPort === '465', // true for 465, false for other ports
      auth: {
        user: emailUser,
        pass: emailPassword,
      },
    });
  } else {
    console.warn('⚠️  Invalid email configuration');
    return false;
  }

  console.log('✅ Email service configured');
  return true;
};

const isConfigured = configureEmail();

/**
 * Send an email
 */
export const sendEmail = async (options: EmailOptions): Promise<boolean> => {
  if (!isConfigured || !transporter) {
    console.warn('Email not configured - skipping email send');
    return false;
  }

  try {
    const mailOptions = {
      from: `"Settlement App" <${process.env.EMAIL_USER}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || options.html.replace(/<[^>]*>/g, ''), // Strip HTML for text version
    };

    await transporter.sendMail(mailOptions);
    console.log(`✉️  Email sent to ${options.to}`);
    return true;
  } catch (error) {
    console.error('Email send error:', error);
    return false;
  }
};

/**
 * Send welcome email to new user
 */
export const sendWelcomeEmail = async (
  email: string,
  name: string
): Promise<boolean> => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #667eea;">Welcome to Settlement App!</h2>
      <p>Hi ${name},</p>
      <p>Thanks for joining Settlement App! We're excited to help you manage your group expenses and settlements.</p>
      <h3>Get Started:</h3>
      <ol>
        <li>Create your first group</li>
        <li>Invite your friends</li>
        <li>Start tracking expenses</li>
        <li>Let us handle the settlement calculations</li>
      </ol>
      <p>If you have any questions, feel free to reply to this email.</p>
      <p>Happy settling!<br>The Settlement App Team</p>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: 'Welcome to Settlement App!',
    html,
  });
};

/**
 * Send group invite email
 */
export const sendGroupInviteEmail = async (
  email: string,
  inviterName: string,
  groupName: string,
  inviteCode: string,
  appUrl: string
): Promise<boolean> => {
  const inviteLink = `${appUrl}/join-group?code=${inviteCode}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #667eea;">You've been invited to join a group!</h2>
      <p>${inviterName} has invited you to join <strong>${groupName}</strong> on Settlement App.</p>
      <p>Settlement App makes it easy to track shared expenses and settle up with your group.</p>
      <div style="margin: 30px 0; text-align: center;">
        <a href="${inviteLink}" style="background-color: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Join ${groupName}</a>
      </div>
      <p>Or copy and paste this link into your browser:</p>
      <p style="background-color: #f3f4f6; padding: 10px; border-radius: 4px; word-break: break-all;">${inviteLink}</p>
      <p style="color: #6b7280; font-size: 14px;">This invite code is: <strong>${inviteCode}</strong></p>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: `${inviterName} invited you to join ${groupName}`,
    html,
  });
};

/**
 * Send expense added notification
 */
export const sendExpenseNotification = async (
  email: string,
  userName: string,
  expenseDescription: string,
  amount: number,
  currency: string,
  paidByName: string,
  groupName: string
): Promise<boolean> => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #667eea;">New Expense Added</h2>
      <p>Hi ${userName},</p>
      <p><strong>${paidByName}</strong> added a new expense to <strong>${groupName}</strong>:</p>
      <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 0; font-size: 16px; color: #374151;"><strong>${expenseDescription}</strong></p>
        <p style="margin: 10px 0 0 0; font-size: 24px; color: #667eea; font-weight: bold;">${currency} ${amount.toFixed(2)}</p>
        <p style="margin: 10px 0 0 0; font-size: 14px; color: #6b7280;">Paid by ${paidByName}</p>
      </div>
      <p>Check the app to see your updated balance.</p>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: `New expense in ${groupName}: ${expenseDescription}`,
    html,
  });
};

/**
 * Send settlement completed notification
 */
export const sendSettlementNotification = async (
  email: string,
  userName: string,
  fromUserName: string,
  toUserName: string,
  amount: number,
  currency: string,
  groupName: string
): Promise<boolean> => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #10b981;">Payment Completed!</h2>
      <p>Hi ${userName},</p>
      <p>A settlement has been marked as paid in <strong>${groupName}</strong>:</p>
      <div style="background-color: #d1fae5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
        <p style="margin: 0; font-size: 18px;"><strong>${fromUserName}</strong> paid <strong>${toUserName}</strong></p>
        <p style="margin: 10px 0 0 0; font-size: 24px; color: #059669; font-weight: bold;">${currency} ${amount.toFixed(2)}</p>
      </div>
      <p>Your balances have been updated.</p>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: `Payment completed in ${groupName}`,
    html,
  });
};

/**
 * Send payment reminder email
 */
export const sendPaymentReminderEmail = async (
  email: string,
  userName: string,
  owedToName: string,
  amount: number,
  currency: string,
  groupName: string
): Promise<boolean> => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #667eea;">Payment Reminder</h2>
      <p>Hi ${userName},</p>
      <p>This is a friendly reminder about your outstanding balance in <strong>${groupName}</strong>:</p>
      <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
        <p style="margin: 0; font-size: 16px;">You owe <strong>${owedToName}</strong>:</p>
        <p style="margin: 10px 0 0 0; font-size: 24px; color: #d97706; font-weight: bold;">${currency} ${amount.toFixed(2)}</p>
      </div>
      <p>Please settle up when you get a chance!</p>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: `Payment reminder for ${groupName}`,
    html,
  });
};

/**
 * Check if email service is configured
 */
export const isEmailConfigured = (): boolean => {
  return isConfigured;
};

export default {
  sendEmail,
  sendWelcomeEmail,
  sendGroupInviteEmail,
  sendExpenseNotification,
  sendSettlementNotification,
  sendPaymentReminderEmail,
  isEmailConfigured,
};
