const nodemailer = require('nodemailer');

// Optional: use SendGrid Web API if SENDGRID_API_KEY is provided in environment
let sgMail;
try {
  sgMail = require('@sendgrid/mail');
} catch (e) {
  // package may not be installed; we'll fall back to SMTP
}

// This function expects a JSON body with the form fields and optional
// `photo` as a data URL (base64). It will use SendGrid (preferred) or SMTP.

exports.handler = async function (event, context) {
  try {
    const body = event.httpMethod === 'POST' ? JSON.parse(event.body) : {};

    const {
      name,
      email,
      date,
      weight,
      exercise1_sets,
      exercise1_details,
      exercise2_sets,
      exercise2_details,
      exercise3_sets,
      exercise3_details,
      exercise4_sets,
      exercise4_details,
      message,
      photo
    } = body;

    const to = process.env.EMAIL_TO || 'talkhanahmed422@gmail.com';

    // Build HTML body
    let html = `<h2>Daily Training Tracker Submission</h2>`;
    html += `<p><strong>Name:</strong> ${name || '-'}<br>`;
    html += `<strong>Email:</strong> ${email || '-'}<br>`;
    html += `<strong>Date:</strong> ${date || '-'}<br>`;
    html += `<strong>Body Weight (kg):</strong> ${weight || '-'}<br></p>`;

    html += `<h3>Incline DB Press</h3>`;
    html += `<p><strong>Effective sets:</strong> ${exercise1_sets || '-'}<br>`;
    html += `<pre>${exercise1_details || '-'}</pre></p>`;

    html += `<h3>Tricep Pushdown</h3>`;
    html += `<p><strong>Effective sets:</strong> ${exercise2_sets || '-'}<br>`;
    html += `<pre>${exercise2_details || '-'}</pre></p>`;

    html += `<h3>Wide Lat Pull Down</h3>`;
    html += `<p><strong>Effective sets:</strong> ${exercise3_sets || '-'}<br>`;
    html += `<pre>${exercise3_details || '-'}</pre></p>`;

    html += `<h3>T-Bar Row</h3>`;
    html += `<p><strong>Effective sets:</strong> ${exercise4_sets || '-'}<br>`;
    html += `<pre>${exercise4_details || '-'}</pre></p>`;

    if (message) {
      html += `<h3>Notes / Message</h3><p>${message}</p>`;
    }

    const subject = `Training Submission - ${name || 'Unknown'} (${date || ''})`;

    // If photo is provided as a data URL, parse it for attachment
    let attachment;
    if (photo && photo.startsWith('data:')) {
      const match = photo.match(/^data:(image\/[^;]+);base64,(.+)$/);
      if (match) {
        const mime = match[1];
        const dataBase64 = match[2];
        const ext = mime.split('/')[1] || 'jpg';
        attachment = {
          filename: `photo.${ext}`,
          content: dataBase64,
          type: mime
        };
      }
    }

    // If SendGrid API key is available, use SendGrid Web API (preferred)
    if (process.env.SENDGRID_API_KEY && sgMail) {
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);
      const msg = {
        to,
        from: process.env.SENDGRID_FROM || process.env.SMTP_FROM || process.env.SMTP_USER || `no-reply@${process.env.SENDGRID_DOMAIN || 'example.com'}`,
        subject,
        html
      };
      if (attachment) {
        msg.attachments = [
          {
            content: attachment.content,
            filename: attachment.filename,
            type: attachment.type,
            disposition: 'attachment'
          }
        ];
      }
      await sgMail.send(msg);
      return {
        statusCode: 200,
        body: JSON.stringify({ ok: true, via: 'sendgrid' })
      };
    }

    // Fallback to SMTP using nodemailer
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject,
      html
    };
    if (attachment) {
      // nodemailer expects Buffer for content
      mailOptions.attachments = [
        {
          filename: attachment.filename,
          content: Buffer.from(attachment.content, 'base64'),
          contentType: attachment.type
        }
      ];
    }

    await transporter.sendMail(mailOptions);

    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true, via: 'smtp' })
    };
  } catch (err) {
    console.error('Error sending email:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ ok: false, error: err.message })
    };
  }
};
