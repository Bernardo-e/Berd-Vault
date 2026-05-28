const nodemailer = require('nodemailer');

let transporter = null;

const emailConfigMissing = () => {
  const required = ['EMAIL_HOST', 'EMAIL_PORT', 'EMAIL_USER', 'EMAIL_PASS'];
  const missing = required.filter(key => !process.env[key]);
  return missing;
};

const logMissingEmailConfig = (missing) => {
  console.warn(`
⚠️  EMAIL CONFIGURATION WARNING:
Missing: ${missing.join(', ')}

OTP emails will FAIL unless valid SMTP credentials are configured.

You can use one of these options in server/.env:

Option 1: Ethereal Email (Free Dev SMTP)
EMAIL_HOST=smtp.ethereal.email
EMAIL_PORT=587
EMAIL_USER=your_ethereal_email@ethereal.email
EMAIL_PASS=your_ethereal_password
(Generate at https://ethereal.email/register)

Option 2: Gmail SMTP
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=your-gmail-app-password
(Use an App Password: https://support.google.com/accounts/answer/185833)
`);
};

const buildTransporter = async () => {
  const missing = emailConfigMissing();

  if (missing.length > 0) {
    logMissingEmailConfig(missing);
  }

  const useEnv = missing.length === 0;
  let transportConfig;

  if (useEnv) {
    transportConfig = {
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT) || 587,
      secure: Number(process.env.EMAIL_PORT) === 465,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    };
  }

  const createAndVerify = async (config) => {
    const transporterInstance = nodemailer.createTransport(config);
    try {
      await transporterInstance.verify();
      console.log('✅ Email service ready');
      return transporterInstance;
    } catch (error) {
      console.error('❌ Email transporter verification failed:', error.message);
      throw error;
    }
  };

  if (useEnv) {
    try {
      transporter = await createAndVerify(transportConfig);
      return transporter;
    } catch (error) {
      console.warn('⚠️ Falling back to Ethereal test account because SMTP auth failed.');
    }
  }

  const testAccount = await nodemailer.createTestAccount();
  console.log('ℹ️  Using Ethereal test email account:', testAccount.user);

  transporter = nodemailer.createTransport({
    host: testAccount.smtp.host,
    port: testAccount.smtp.port,
    secure: testAccount.smtp.secure,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });

  await transporter.verify();
  console.log('✅ Ethereal email transporter ready');
  return transporter;
};

const getTransporter = async () => {
  if (transporter) return transporter;
  transporter = await buildTransporter();
  return transporter;
};

const sendWelcomeEmail = async (email, name) => {
  try {
    const mailOptions = {
      from: `"Berd Vault" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Welcome to Berd Vault! 🚀',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #6C63FF;">Welcome to Berd Vault, ${name}!</h2>
          <p>We're thrilled to have you join our community of 120,000+ students.</p>
          <p>With Berd Vault, you can:</p>
          <ul>
            <li>Access thousands of high-quality notes</li>
            <li>Use our immersive <strong>Exam Mode</strong> for deep focus</li>
            <li>Organize your study materials efficiently</li>
          </ul>
          <p style="margin-top: 30px;">Happy studying!</p>
          <hr />
          <p style="font-size: 12px; color: #888;">This is an automated message from Berd Vault. Please do not reply.</p>
        </div>
      `,
    };

    const mailer = await getTransporter();
    const fromAddress = mailer.options?.auth?.user || process.env.EMAIL_USER || 'no-reply@berdvault.com';
    mailOptions.from = `"Berd Vault" <${fromAddress}>`;

    const info = await mailer.sendMail(mailOptions);
    console.log('✅ Welcome email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('❌ Welcome email failed:', error.message);
    throw new Error(`Failed to send welcome email: ${error.message}`);
  }
};

const sendOTPEmail = async (email, otp) => {
  try {
    if (!email || !otp) {
      throw new Error('Email and OTP are required');
    }

    const mailer = await getTransporter();
    const fromAddress = mailer.options?.auth?.user || process.env.EMAIL_USER || 'no-reply@berdvault.com';

    const mailOptions = {
      from: `"Berd Vault" <${fromAddress}>`,
      to: email,
      subject: `Verification Code: ${otp}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 30px; border: 1px solid #eee; border-radius: 16px; text-align: center; background-color: #fcfcff;">
          <h2 style="color: #6C63FF; font-size: 24px; margin-bottom: 20px;">Email Verification</h2>
          <p style="color: #444; font-size: 16px;">Please use the following 6-digit code to complete your verification.</p>
          <div style="background: #f0f0ff; padding: 20px; border-radius: 12px; display: inline-block; margin: 20px 0;">
            <span style="font-family: monospace; font-size: 32px; font-weight: bold; letter-spacing: 10px; color: #6C63FF;">${otp}</span>
          </div>
          <p style="color: #888; font-size: 14px;">This code will expire in <strong>5 minutes</strong>.</p>
          <p style="color: #888; font-size: 12px; margin-top: 40px;">If you didn't request this code, please ignore this email.</p>
          <hr style="margin-top: 30px; border: 0; border-top: 1px solid #eee;" />
          <p style="font-size: 11px; color: #aaa;">© 2026 Berd Vault. All rights reserved.</p>
        </div>
      `,
    };

    const info = await mailer.sendMail(mailOptions);
    console.log('✅ OTP email sent to', email, 'Message ID:', info.messageId);
    return info;
  } catch (error) {
    console.error('❌ OTP email failed for', email, ':', error.message);
    throw new Error(`Failed to send OTP email: ${error.message}`);
  }
};

module.exports = { sendWelcomeEmail, sendOTPEmail };

