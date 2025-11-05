# Discord Bot License Integration Guide

## Overview

This guide explains how to integrate the license verification system into your Discord.js bot. The bot will verify its license every 60 seconds by sending heartbeat requests to the license management API.

## Prerequisites

- Node.js Discord bot (Discord.js v14+)
- License key from your license management dashboard
- Bot API key from your license management dashboard

## Installation

Install the required dependency:

```bash
npm install axios
```

## Environment Variables

Add these variables to your `.env` file:

```env
LICENSE_API_KEY=your_api_key_here
BOT_LICENSE_KEY=DISC-XXXX-XXXX-XXXX
LICENSE_API_URL=https://your-license-api-url.repl.co
DISCORD_TOKEN=your_discord_bot_token
```

## Complete Implementation

Add this code to your bot's main file:

```javascript
const { Client, GatewayIntentBits } = require('discord.js');
const axios = require('axios');

const API_KEY = process.env.LICENSE_API_KEY;
const BASE_URL = process.env.LICENSE_API_URL;
const LICENSE_KEY = process.env.BOT_LICENSE_KEY;

class LicenseManager {
  constructor(client) {
    this.client = client;
    this.isValid = false;
    this.guildId = null;
  }

  /**
   * Activate the license for a specific guild
   * @param {string} guildId - Discord guild ID
   * @returns {Promise<boolean>} - True if activation successful
   */
  async activateLicense(guildId) {
    try {
      const response = await axios.post(
        `${BASE_URL}/api/bot/activate`,
        {
          licenseKey: LICENSE_KEY,
          guildId: guildId
        },
        {
          headers: { 'x-api-key': API_KEY }
        }
      );

      if (response.data.success) {
        this.isValid = true;
        this.guildId = guildId;
        console.log(`✅ License activated for guild ${guildId}`);
        return true;
      }
      
      console.log(`❌ License activation failed: ${response.data.error}`);
      return false;
    } catch (error) {
      console.error(`❌ License activation error:`, error.message);
      return false;
    }
  }

  /**
   * Verify the license is still valid (heartbeat)
   * @returns {Promise<boolean|string>} - True if valid, false if invalid, 'shutdown' if remote shutdown requested
   */
  async verifyLicense() {
    if (!this.guildId) return false;

    try {
      const guild = this.client.guilds.cache.get(this.guildId);
      
      const response = await axios.post(
        `${BASE_URL}/api/bot/verify`,
        {
          licenseKey: LICENSE_KEY,
          guildId: this.guildId,
          botVersion: "1.0.0",  // Update with your bot version
          guildName: guild?.name || "Unknown",
          guildInviteUrl: null  // Optional: Add Discord invite link
        },
        {
          headers: { 'x-api-key': API_KEY }
        }
      );

      this.isValid = response.data.valid;

      if (!this.isValid) {
        console.log(`⚠️ License invalid: ${response.data.error}`);
        return false;
      }

      // Check for remote shutdown request
      const action = response.data.action;
      if (action && action.type === 'shutdown') {
        const reason = action.reason || 'Unknown';
        console.log(`🛑 Remote shutdown requested: ${reason}`);
        await this.acknowledgeShutdown();
        return 'shutdown';
      }

      console.log(`✅ License verified successfully`);
      return true;
    } catch (error) {
      console.error(`❌ License verification error:`, error.message);
      return false;
    }
  }

  /**
   * Acknowledge a remote shutdown request
   */
  async acknowledgeShutdown() {
    try {
      await axios.post(
        `${BASE_URL}/api/bot/shutdown-ack`,
        { licenseKey: LICENSE_KEY },
        { headers: { 'x-api-key': API_KEY } }
      );
      console.log('✅ Shutdown acknowledged');
    } catch (error) {
      console.error(`❌ Failed to acknowledge shutdown:`, error.message);
    }
  }
}

// Create Discord client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const licenseManager = new LicenseManager(client);

client.once('ready', async () => {
  console.log(`Bot logged in as ${client.user.tag}`);

  // Activate license for first guild
  if (client.guilds.cache.size > 0) {
    const guildId = client.guilds.cache.first().id;
    const activated = await licenseManager.activateLicense(guildId);

    if (activated) {
      // Start heartbeat checks every 60 seconds
      setInterval(async () => {
        const result = await licenseManager.verifyLicense();
        if (result === 'shutdown') {
          console.error('🛑 Shutting down bot as requested by administrator...');
          process.exit(0);
        } else if (!result) {
          console.error('❌ License invalid! Shutting down bot.');
          process.exit(1);
        }
      }, 60 * 1000); // 60 seconds
    } else {
      console.error('❌ Failed to activate license. Bot shutting down.');
      process.exit(1);
    }
  } else {
    console.error('❌ Bot not in any guilds!');
    process.exit(1);
  }
});

// Optional: Add license check to commands
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith('!')) return;

  const args = message.content.slice(1).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  if (command === 'ping') {
    // Check license before executing command
    if (!licenseManager.isValid) {
      await message.reply('❌ Bot license is invalid!');
      return;
    }
    
    await message.reply(`🏓 Pong! Latency: ${client.ws.ping}ms`);
  }
});

client.login(process.env.DISCORD_TOKEN);
```

## API Endpoints

### 1. Activate License
**Endpoint:** `POST /api/bot/activate`

**Headers:**
```
x-api-key: YOUR_API_KEY
```

**Request Body:**
```json
{
  "licenseKey": "DISC-XXXX-XXXX-XXXX",
  "guildId": "123456789012345678"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "License activated successfully"
}
```

### 2. Verify License (Heartbeat)
**Endpoint:** `POST /api/bot/verify`

**Headers:**
```
x-api-key: YOUR_API_KEY
```

**Request Body:**
```json
{
  "licenseKey": "DISC-XXXX-XXXX-XXXX",
  "guildId": "123456789012345678",
  "botVersion": "1.0.0",
  "guildName": "My Server",
  "guildInviteUrl": null
}
```

**Response (Valid):**
```json
{
  "valid": true,
  "message": "License is valid"
}
```

**Response (Shutdown Requested):**
```json
{
  "valid": true,
  "action": {
    "type": "shutdown",
    "reason": "Admin requested shutdown"
  }
}
```

### 3. Acknowledge Shutdown
**Endpoint:** `POST /api/bot/shutdown-ack`

**Headers:**
```
x-api-key: YOUR_API_KEY
```

**Request Body:**
```json
{
  "licenseKey": "DISC-XXXX-XXXX-XXXX"
}
```

## How It Works

1. **Bot Startup:** When the bot starts, it activates the license with the guild ID
2. **Heartbeat:** Every 60 seconds, the bot sends a heartbeat to verify the license
3. **License Checks:** The API verifies:
   - License exists and matches the API key
   - License is not expired
   - License is not suspended
   - License is assigned to the correct guild
4. **Remote Control:** Admins can request bot shutdown through the dashboard
5. **Auto Shutdown:** Bot automatically shuts down if license becomes invalid

## Monitoring

You can monitor your bot in real-time through the dashboard:

- **Bot Monitor Page:** See all active bots, last heartbeat time, and online status
- **Bot is considered online** if heartbeat received within last 2 minutes
- **Remote shutdown** can be triggered from the Licenses page

## Error Handling

The bot will automatically shut down if:
- License activation fails on startup
- License expires during operation
- License is suspended by admin
- Remote shutdown is requested
- Heartbeat verification fails

## Testing

1. Start your bot
2. Check the Bot Monitor page in the dashboard
3. You should see your bot appear as "Online" within 2 minutes
4. The "Last Seen" column updates every 60 seconds
5. Try suspending the license to test auto-shutdown
6. Try the remote shutdown feature

## Rate Limiting

- API allows 100 requests per minute per API key
- With 60-second heartbeats, you can run multiple bots on the same API key

## Security Best Practices

- Never hardcode API keys or license keys in your code
- Use environment variables for all sensitive data
- Keep your API key secret - it has full access to your license system
- Rotate API keys periodically for security

## Troubleshooting

**Bot won't start:**
- Check that all environment variables are set correctly
- Verify your API key is valid
- Ensure the license key exists and is active

**Bot keeps shutting down:**
- Check license status in the dashboard
- Verify license is not expired or suspended
- Check bot logs for specific error messages

**Bot not appearing in dashboard:**
- Verify heartbeat is running (check console logs)
- Ensure API URL is correct
- Check for network/firewall issues

## Support

For issues or questions, contact your license management system administrator.
