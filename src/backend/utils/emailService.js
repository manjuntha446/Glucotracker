// utils/emailService.js
const nodemailer = require('nodemailer');

const {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASS,
  SMTP_SECURE,   // "true" or "false"
  FROM_EMAIL,
  EMAIL_DEBUG    // "true" to log successful sends
} = process.env;

const secureFlag = String(SMTP_SECURE || '').toLowerCase() === 'true';

let transporter;
if (SMTP_HOST) {
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT) || (secureFlag ? 465 : 587),
    secure: secureFlag,
    auth: (SMTP_USER && SMTP_PASS) ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
  });

  // Verify connection at startup (non-blocking)
  transporter.verify()
    .then(() => console.info('[emailService] SMTP transport ready'))
    .catch(err => console.warn('[emailService] SMTP verify failed:', err?.message || err));
} else {
  console.warn('[emailService] No SMTP_HOST configured. Emails will be skipped.');
}

async function sendEmail(to, subject, html) {
  const toList = Array.isArray(to) ? to.filter(Boolean).join(',') : to;
  const fromAddr = FROM_EMAIL || SMTP_USER;

  if (!transporter || !fromAddr || !toList) {
    console.warn('[emailService] Missing config or recipients. Skipping send.', {
      hasTransport: !!transporter, fromAddr, toList
    });
    return;
  }

  const info = await transporter.sendMail({
    from: fromAddr,
    to: toList,
    subject,
    html,
  });

  if (EMAIL_DEBUG === 'true') {
    console.log('[emailService] sent', { messageId: info.messageId, to: toList, subject });
  }
}

/**
 * Sends a lightweight email when a user VIEWS glucose readings.
 * Opt-in via user.notificationPreferences.email.onView === true
 */
async function sendGlucoseViewEmail(user, reading) {
  try {
    if (!user || !user.email) return;

    const emailPrefs = user.notificationPreferences?.email || {};
    const onView = emailPrefs.onView === true; // default OFF
    if (!onView) return;

    const ts = new Date((reading && reading.timestamp) || Date.now()).toLocaleString();
    const valuePart = reading ? `${reading.value} ${reading.unit || 'mg/dL'}` : '—';

    const subject = `You viewed your glucose readings`;
    const html = `
      <div style="font-family:Arial,Helvetica,sans-serif">
        <h3 style="margin:0 0 8px 0;">Recent reading: ${valuePart}</h3>
        <p><strong>When:</strong> ${ts}</p>
        ${reading?.notes ? `<p style="margin:6px 0;"><strong>Notes:</strong> ${reading.notes}</p>` : ''}
        <p style="color:#555;margin-top:10px;">Tip: You can turn this email on/off in Settings.</p>
      </div>
    `;

    await sendEmail(user.email, subject, html);
  } catch (err) {
    console.warn('[emailService] sendGlucoseViewEmail failed:', err?.message || err);
  }
}

module.exports = { sendEmail, sendGlucoseViewEmail };

