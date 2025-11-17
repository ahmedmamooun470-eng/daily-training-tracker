const nodemailer = require('nodemailer');

// This function expects a JSON body with the form fields and optional
// `photo` as a data URL (base64). It sends an email using SMTP credentials set
// in environment variables on Netlify.

exports.handler = async function (event, context) {
  try {
    const body = event.httpMethod === 'POST' ? JSON.parse(event.body) : {};

    const {
      name,
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

    // Create transporter using SMTP credentials set in Netlify environment variables
    // Recommended: use SendGrid SMTP, Mailgun SMTP, or Gmail App Password (if using Gmail)
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    // Build HTML body
    let html = `<h2>Daily Training Tracker Submission</h2>`;
    html += `<p><strong>Name:</strong> ${name || '-'}<br>`;
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

    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject: `Training Submission - ${name || 'Unknown'} (${date || ''})`,
      html
    };

    // If photo is provided as a data URL, attach it
    if (photo && photo.startsWith('data:')) {
      // parse data URL
      const match = photo.match(/^data:(image\/[^;]+);base64,(.+)$/);
      if (match) {
        const mime = match[1];
        const data = Buffer.from(match[2], 'base64');
        mailOptions.attachments = [
          {
            filename: `photo.${mime.split('/')[1]}`,
            content: data,
            contentType: mime
          }
        ];
      }
    }

    await transporter.sendMail(mailOptions);

    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true })
    };
  } catch (err) {
    console.error('Error sending email:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ ok: false, error: err.message })
    };
  }
};
