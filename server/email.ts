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
    console.log(`Sending email from: ${fromEmail} to: ${params.userEmail}`);
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; 
              line-height: 1.6; 
              color: #1f2937; 
              margin: 0;
              padding: 0;
              background-color: #f3f4f6;
            }
            .email-wrapper { 
              background-color: #f3f4f6; 
              padding: 40px 20px; 
            }
            .container { 
              max-width: 600px; 
              margin: 0 auto; 
              background: white;
              border-radius: 12px;
              overflow: hidden;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .brand-header { 
              background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); 
              color: white; 
              padding: 30px 40px; 
              text-align: center;
            }
            .brand-logo {
              font-size: 32px;
              font-weight: bold;
              margin-bottom: 10px;
              letter-spacing: -0.5px;
            }
            .brand-tagline {
              font-size: 14px;
              opacity: 0.9;
              margin: 0;
            }
            .alert-badge {
              display: inline-block;
              background: rgba(255, 255, 255, 0.2);
              padding: 8px 16px;
              border-radius: 20px;
              font-size: 13px;
              font-weight: 600;
              margin-top: 15px;
              backdrop-filter: blur(10px);
            }
            .content { 
              padding: 40px; 
            }
            .greeting {
              font-size: 18px;
              font-weight: 600;
              color: #111827;
              margin-bottom: 20px;
            }
            .alert { 
              background: #fef2f2; 
              border-left: 4px solid #ef4444; 
              padding: 20px; 
              margin: 25px 0; 
              border-radius: 6px;
            }
            .alert-title {
              font-weight: 700;
              color: #991b1b;
              font-size: 16px;
              margin-bottom: 8px;
            }
            .alert-text {
              color: #7f1d1d;
              margin: 0;
              font-size: 14px;
            }
            .details { 
              background: #f9fafb; 
              padding: 25px; 
              border-radius: 8px; 
              margin: 25px 0;
              border: 1px solid #e5e7eb;
            }
            .details-title {
              font-size: 16px;
              font-weight: 700;
              color: #111827;
              margin-bottom: 15px;
            }
            .detail-row { 
              display: flex; 
              padding: 12px 0; 
              border-bottom: 1px solid #e5e7eb; 
            }
            .detail-row:last-child {
              border-bottom: none;
            }
            .detail-label { 
              font-weight: 600; 
              min-width: 170px; 
              color: #6b7280;
              font-size: 14px;
            }
            .detail-value {
              color: #111827;
              font-size: 14px;
              word-break: break-word;
            }
            .info-section {
              margin: 25px 0;
            }
            .info-section h3 {
              font-size: 16px;
              color: #111827;
              font-weight: 700;
              margin-bottom: 12px;
            }
            .info-section ul {
              margin: 0;
              padding-left: 20px;
            }
            .info-section li {
              color: #4b5563;
              margin-bottom: 8px;
              font-size: 14px;
            }
            .info-section p {
              color: #4b5563;
              margin: 10px 0;
              font-size: 14px;
            }
            .button { 
              display: inline-block; 
              background: #2563eb; 
              color: white !important; 
              padding: 14px 32px; 
              text-decoration: none; 
              border-radius: 8px; 
              margin-top: 25px;
              font-weight: 600;
              font-size: 15px;
              transition: background 0.3s;
            }
            .button:hover {
              background: #1d4ed8;
            }
            .footer { 
              text-align: center; 
              padding: 30px 40px;
              background: #f9fafb;
              border-top: 1px solid #e5e7eb;
            }
            .footer-text {
              color: #6b7280; 
              font-size: 13px;
              margin: 8px 0;
            }
            .footer-brand {
              font-weight: 600;
              color: #374151;
              margin-top: 15px;
            }
            @media only screen and (max-width: 600px) {
              .content, .brand-header, .footer { 
                padding: 25px !important; 
              }
              .detail-row {
                flex-direction: column;
              }
              .detail-label {
                margin-bottom: 5px;
              }
            }
          </style>
        </head>
        <body>
          <div class="email-wrapper">
            <div class="container">
              <div class="brand-header">
                <div style="margin-bottom: 20px;">
                  <div style="background: white; width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 15px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.2);">
                    <span style="font-size: 42px;">🔐</span>
                  </div>
                </div>
                <div class="brand-logo">License Manager</div>
                <p class="brand-tagline">by Shrreyan</p>
                <div class="alert-badge">⚠️ SECURITY ALERT</div>
              </div>
            <div class="content">
              <p class="greeting">Hello ${params.userName},</p>
              
              <div class="alert">
                <div class="alert-title">Unauthorized License Usage Attempt</div>
                <p class="alert-text">We detected an attempt to use your license on multiple Discord servers simultaneously. Your security is our priority.</p>
              </div>
              
              <p>Your license <strong>${params.licenseKey}</strong> for <strong>${params.productName}</strong> is limited to <strong>${params.maxActivations} active server(s)</strong> at a time.</p>
              
              <div class="details">
                <div class="details-title">📋 Violation Details</div>
                <div class="detail-row">
                  <span class="detail-label">License Key</span>
                  <span class="detail-value">${params.licenseKey}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Product</span>
                  <span class="detail-value">${params.productName}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Current Server ID</span>
                  <span class="detail-value">${params.currentGuildId}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Attempted Server ID</span>
                  <span class="detail-value">${params.attemptedGuildId}</span>
                </div>
                ${params.attemptedGuildName ? `
                <div class="detail-row">
                  <span class="detail-label">Attempted Server Name</span>
                  <span class="detail-value">${params.attemptedGuildName}</span>
                </div>
                ` : ''}
                <div class="detail-row">
                  <span class="detail-label">Attempt Time</span>
                  <span class="detail-value">${params.attemptedAt.toLocaleString()}</span>
                </div>
              </div>
              
              <div class="info-section">
                <h3>🛡️ What This Means</h3>
                <ul>
                  <li>Your license is already activated on a different server</li>
                  <li>The activation attempt on the new server was <strong>blocked</strong></li>
                  <li>Your existing bot continues to work normally</li>
                </ul>
              </div>
              
              <div class="info-section">
                <h3>🔄 Need to Use This License on a Different Server?</h3>
                <p>To switch servers, please contact our support team. We'll help you reset the license binding so you can activate it on your desired server.</p>
              </div>
              
              <div class="info-section">
                <h3>📈 Need Multiple Activations?</h3>
                <p>If you need to run the bot on multiple servers simultaneously, please contact our team about upgrading your license or purchasing additional licenses.</p>
              </div>
              
              <a href="mailto:support@shrreyan.dev" class="button">Contact Support</a>
              
            </div>
            <div class="footer">
              <p class="footer-text">This is an automated security notification. If you did not attempt this activation, please contact support immediately.</p>
              <p class="footer-brand">🔐 License Manager by Shrreyan</p>
              <p class="footer-text">&copy; ${new Date().getFullYear()} License Management System. All rights reserved.</p>
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

    const response = await client.emails.send({
      from: `Licence Manager | Shrreyan <${fromEmail}>`,
      to: params.userEmail,
      subject: `⚠️ License Violation Detected - ${params.licenseKey}`,
      html,
      text,
    });

    console.log(`✅ License violation email sent to ${params.userEmail}`);
    console.log('Resend response:', JSON.stringify(response, null, 2));
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
