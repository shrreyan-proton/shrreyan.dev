import { Resend } from 'resend';

let connectionSettings: any;

async function getCredentials() {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=resend',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  if (!connectionSettings || (!connectionSettings.settings.api_key)) {
    throw new Error('Resend not connected');
  }
  return {apiKey: connectionSettings.settings.api_key, fromEmail: connectionSettings.settings.from_email};
}

async function getUncachableResendClient() {
  const credentials = await getCredentials();
  return {
    client: new Resend(credentials.apiKey),
    fromEmail: credentials.fromEmail
  };
}

interface LicenseViolationEmailParams {
  userEmail: string;
  userName: string;
  licenseKey: string;
  productName: string;
  maxActivations: number;
  attemptedGuildId: string;
  attemptedGuildName?: string;
  currentGuildId: string;
  attemptedAt: Date;
}

interface LicenseExpiringSoonEmailParams {
  userEmail: string;
  userName: string;
  licenseKey: string;
  productName: string;
  expiresAt: Date;
  daysRemaining: number;
}

export async function sendLicenseViolationEmail(params: LicenseViolationEmailParams): Promise<void> {
  try {
    const { client, fromEmail } = await getUncachableResendClient();
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #ef4444; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .alert { background: #fee2e2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; }
            .details { background: white; padding: 15px; border-radius: 4px; margin: 20px 0; }
            .detail-row { display: flex; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
            .detail-label { font-weight: bold; min-width: 150px; }
            .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 12px; }
            .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>⚠️ License Violation Detected</h1>
            </div>
            <div class="content">
              <p>Hello ${params.userName},</p>
              
              <div class="alert">
                <strong>Unauthorized License Usage Attempt</strong><br>
                We detected an attempt to use your license on multiple Discord servers simultaneously.
              </div>
              
              <p>Your license <strong>${params.licenseKey}</strong> for <strong>${params.productName}</strong> is limited to <strong>${params.maxActivations} active server(s)</strong> at a time.</p>
              
              <div class="details">
                <h3>Violation Details:</h3>
                <div class="detail-row">
                  <span class="detail-label">License Key:</span>
                  <span>${params.licenseKey}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Product:</span>
                  <span>${params.productName}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Current Server ID:</span>
                  <span>${params.currentGuildId}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Attempted Server ID:</span>
                  <span>${params.attemptedGuildId}</span>
                </div>
                ${params.attemptedGuildName ? `
                <div class="detail-row">
                  <span class="detail-label">Attempted Server Name:</span>
                  <span>${params.attemptedGuildName}</span>
                </div>
                ` : ''}
                <div class="detail-row">
                  <span class="detail-label">Attempt Time:</span>
                  <span>${params.attemptedAt.toLocaleString()}</span>
                </div>
              </div>
              
              <h3>What This Means:</h3>
              <ul>
                <li>Your license is already activated on a different server</li>
                <li>The activation attempt on the new server was <strong>blocked</strong></li>
                <li>Your existing bot continues to work normally</li>
              </ul>
              
              <h3>Need to Use This License on a Different Server?</h3>
              <p>To switch servers, please contact our support team. We'll help you reset the license binding so you can activate it on your desired server.</p>
              
              <h3>Need Multiple Activations?</h3>
              <p>If you need to run the bot on multiple servers simultaneously, please contact our team about upgrading your license or purchasing additional licenses.</p>
              
              <a href="mailto:support@example.com" class="button">Contact Support</a>
              
              <div class="footer">
                <p>This is an automated security notification. If you did not attempt this activation, please contact support immediately.</p>
                <p>&copy; ${new Date().getFullYear()} License Management System. All rights reserved.</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    const text = `
License Violation Detected

Hello ${params.userName},

We detected an attempt to use your license on multiple Discord servers simultaneously.

Your license ${params.licenseKey} for ${params.productName} is limited to ${params.maxActivations} active server(s) at a time.

Violation Details:
- License Key: ${params.licenseKey}
- Product: ${params.productName}
- Current Server ID: ${params.currentGuildId}
- Attempted Server ID: ${params.attemptedGuildId}
${params.attemptedGuildName ? `- Attempted Server Name: ${params.attemptedGuildName}\n` : ''}- Attempt Time: ${params.attemptedAt.toLocaleString()}

What This Means:
- Your license is already activated on a different server
- The activation attempt on the new server was blocked
- Your existing bot continues to work normally

Need to Use This License on a Different Server?
To switch servers, please contact our support team. We'll help you reset the license binding.

Need Multiple Activations?
If you need to run the bot on multiple servers simultaneously, please contact our team about upgrading your license.

Contact Support: support@example.com

This is an automated security notification. If you did not attempt this activation, please contact support immediately.
    `;

    await client.emails.send({
      from: fromEmail,
      to: params.userEmail,
      subject: `⚠️ License Violation Detected - ${params.licenseKey}`,
      html,
      text,
    });

    console.log(`✅ License violation email sent to ${params.userEmail}`);
  } catch (error) {
    console.error('Failed to send license violation email:', error);
    throw error;
  }
}

export async function sendLicenseExpiringSoonEmail(params: LicenseExpiringSoonEmailParams): Promise<void> {
  try {
    const { client, fromEmail } = await getUncachableResendClient();
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #f59e0b; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
            .details { background: white; padding: 15px; border-radius: 4px; margin: 20px 0; }
            .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin-top: 20px; }
            .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>⏰ License Expiring Soon</h1>
            </div>
            <div class="content">
              <p>Hello ${params.userName},</p>
              
              <div class="warning">
                <strong>Your license will expire in ${params.daysRemaining} day(s)</strong>
              </div>
              
              <p>Your license <strong>${params.licenseKey}</strong> for <strong>${params.productName}</strong> will expire on <strong>${params.expiresAt.toLocaleDateString()}</strong>.</p>
              
              <h3>What Happens When It Expires:</h3>
              <ul>
                <li>Your bot will stop working</li>
                <li>You'll need to renew to continue using the service</li>
              </ul>
              
              <p>To avoid any interruption, please renew your license before it expires.</p>
              
              <a href="mailto:support@example.com" class="button">Renew License</a>
              
              <div class="footer">
                <p>&copy; ${new Date().getFullYear()} License Management System. All rights reserved.</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    await client.emails.send({
      from: fromEmail,
      to: params.userEmail,
      subject: `⏰ License Expiring in ${params.daysRemaining} Days - ${params.licenseKey}`,
      html,
    });

    console.log(`✅ License expiring email sent to ${params.userEmail}`);
  } catch (error) {
    console.error('Failed to send license expiring email:', error);
  }
}
