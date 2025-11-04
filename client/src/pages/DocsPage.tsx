import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Code, Key, Shield, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function DocsPage() {
  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-3xl font-semibold" data-testid="text-page-title">Bot Integration Documentation</h1>
        <p className="text-muted-foreground mt-1">
          Learn how to integrate secure license verification into your Discord bot
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Key className="h-5 w-5" />
              API Key
            </CardTitle>
            <CardDescription>
              Get your API key from Settings to authenticate your bot
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Shield className="h-5 w-5" />
              Secure by Design
            </CardTitle>
            <CardDescription>
              License binds to Discord server ID preventing unauthorized use
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Zap className="h-5 w-5" />
              Real-time Verification
            </CardTitle>
            <CardDescription>
              Heartbeat system ensures licenses stay valid and active
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Code className="h-5 w-5" />
              Easy Integration
            </CardTitle>
            <CardDescription>
              Simple REST API endpoints for activation and verification
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Start Guide</CardTitle>
          <CardDescription>
            Follow these steps to integrate license verification into your Discord bot
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Badge className="mt-1">1</Badge>
              <div>
                <h3 className="font-semibold">Get Your API Key</h3>
                <p className="text-sm text-muted-foreground">
                  Go to Settings and create a new Bot API Key. Copy it immediately as it won't be shown again.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Badge className="mt-1">2</Badge>
              <div>
                <h3 className="font-semibold">Store API Key Securely</h3>
                <p className="text-sm text-muted-foreground">
                  Save your API key in environment variables, never hardcode it in your bot's code.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Badge className="mt-1">3</Badge>
              <div>
                <h3 className="font-semibold">Activate License on Startup</h3>
                <p className="text-sm text-muted-foreground">
                  When your bot starts, call the activation endpoint to bind the license to the server.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Badge className="mt-1">4</Badge>
              <div>
                <h3 className="font-semibold">Send Heartbeats</h3>
                <p className="text-sm text-muted-foreground">
                  Periodically verify the license (every 1-6 hours) to ensure it remains valid.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>API Endpoints</CardTitle>
          <CardDescription>
            Base URL: {window.location.origin}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="default">POST</Badge>
                <code className="text-sm font-mono">/api/bot/activate</code>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Activate and bind a license to your Discord server
              </p>
              <div className="bg-muted p-4 rounded-md space-y-2">
                <p className="text-xs font-semibold">Request Headers:</p>
                <pre className="text-xs font-mono overflow-x-auto">
{`x-api-key: your_api_key_here`}
                </pre>
                <p className="text-xs font-semibold mt-3">Request Body:</p>
                <pre className="text-xs font-mono overflow-x-auto">
{`{
  "licenseKey": "DISC-XXXX-XXXX-XXXX",
  "guildId": "1234567890123456789"
}`}
                </pre>
                <p className="text-xs font-semibold mt-3">Response:</p>
                <pre className="text-xs font-mono overflow-x-auto">
{`{
  "success": true,
  "message": "License activated successfully",
  "license": {
    "key": "DISC-XXXX-XXXX-XXXX",
    "productName": "Discord Bot",
    "expiresAt": "2025-12-31T23:59:59.000Z",
    "status": "active",
    "guildId": "1234567890123456789"
  }
}`}
                </pre>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="default">POST</Badge>
                <code className="text-sm font-mono">/api/bot/verify</code>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Verify license validity (heartbeat check)
              </p>
              <div className="bg-muted p-4 rounded-md space-y-2">
                <p className="text-xs font-semibold">Request Headers:</p>
                <pre className="text-xs font-mono overflow-x-auto">
{`x-api-key: your_api_key_here`}
                </pre>
                <p className="text-xs font-semibold mt-3">Request Body:</p>
                <pre className="text-xs font-mono overflow-x-auto">
{`{
  "licenseKey": "DISC-XXXX-XXXX-XXXX",
  "guildId": "1234567890123456789"
}`}
                </pre>
                <p className="text-xs font-semibold mt-3">Response (Valid):</p>
                <pre className="text-xs font-mono overflow-x-auto">
{`{
  "valid": true,
  "license": {
    "key": "DISC-XXXX-XXXX-XXXX",
    "productName": "Discord Bot",
    "expiresAt": "2025-12-31T23:59:59.000Z",
    "status": "active",
    "guildId": "1234567890123456789"
  }
}`}
                </pre>
                <p className="text-xs font-semibold mt-3">Response (Invalid):</p>
                <pre className="text-xs font-mono overflow-x-auto">
{`{
  "valid": false,
  "error": "License expired"
}`}
                </pre>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Example Code (Python)</CardTitle>
          <CardDescription>
            Discord.py bot integration example
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-muted p-4 rounded-md">
            <pre className="text-xs font-mono overflow-x-auto whitespace-pre-wrap">
{`import discord
from discord.ext import commands, tasks
import requests
import os

API_KEY = os.getenv("LICENSE_API_KEY")
BASE_URL = "${window.location.origin}"
LICENSE_KEY = os.getenv("BOT_LICENSE_KEY")

class LicenseManager:
    def __init__(self, bot):
        self.bot = bot
        self.is_valid = False
        self.guild_id = None
        
    async def activate_license(self, guild_id: str):
        """Activate the license for this guild"""
        headers = {"x-api-key": API_KEY}
        data = {
            "licenseKey": LICENSE_KEY,
            "guildId": guild_id
        }
        
        try:
            response = requests.post(
                f"{BASE_URL}/api/bot/activate",
                headers=headers,
                json=data
            )
            result = response.json()
            
            if response.status_code == 200 and result.get("success"):
                self.is_valid = True
                self.guild_id = guild_id
                print(f"✅ License activated for guild {guild_id}")
                return True
            else:
                print(f"❌ License activation failed: {result.get('error')}")
                return False
        except Exception as e:
            print(f"❌ License activation error: {e}")
            return False
    
    async def verify_license(self):
        """Verify license is still valid (heartbeat)"""
        if not self.guild_id:
            return False
            
        headers = {"x-api-key": API_KEY}
        data = {
            "licenseKey": LICENSE_KEY,
            "guildId": self.guild_id
        }
        
        try:
            response = requests.post(
                f"{BASE_URL}/api/bot/verify",
                headers=headers,
                json=data
            )
            result = response.json()
            
            self.is_valid = result.get("valid", False)
            
            if not self.is_valid:
                print(f"⚠️ License invalid: {result.get('error')}")
                
            return self.is_valid
        except Exception as e:
            print(f"❌ License verification error: {e}")
            return False

# Create bot instance
intents = discord.Intents.default()
bot = commands.Bot(command_prefix="!", intents=intents)
license_manager = LicenseManager(bot)

@bot.event
async def on_ready():
    print(f"Bot logged in as {bot.user}")
    
    # Get the first guild the bot is in
    if bot.guilds:
        guild_id = str(bot.guilds[0].id)
        activated = await license_manager.activate_license(guild_id)
        
        if activated:
            # Start heartbeat task
            heartbeat_task.start()
        else:
            print("❌ Failed to activate license. Bot shutting down.")
            await bot.close()
    else:
        print("❌ Bot not in any guilds!")
        await bot.close()

@tasks.loop(hours=3)  # Check every 3 hours
async def heartbeat_task():
    """Periodic license verification"""
    valid = await license_manager.verify_license()
    if not valid:
        print("❌ License invalid! Shutting down bot.")
        await bot.close()

@bot.command()
async def ping(ctx):
    """Example command with license check"""
    if not license_manager.is_valid:
        await ctx.send("❌ Bot license is invalid!")
        return
    
    await ctx.send(f"🏓 Pong! Latency: {round(bot.latency * 1000)}ms")

# Run the bot
bot.run(os.getenv("DISCORD_TOKEN"))`}
            </pre>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Example Code (JavaScript/Node.js)</CardTitle>
          <CardDescription>
            Discord.js bot integration example
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-muted p-4 rounded-md">
            <pre className="text-xs font-mono overflow-x-auto whitespace-pre-wrap">
{`const { Client, GatewayIntentBits } = require('discord.js');
const axios = require('axios');

const API_KEY = process.env.LICENSE_API_KEY;
const BASE_URL = "${window.location.origin}";
const LICENSE_KEY = process.env.BOT_LICENSE_KEY;

class LicenseManager {
  constructor(client) {
    this.client = client;
    this.isValid = false;
    this.guildId = null;
  }

  async activateLicense(guildId) {
    try {
      const response = await axios.post(
        \`\${BASE_URL}/api/bot/activate\`,
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
        console.log(\`✅ License activated for guild \${guildId}\`);
        return true;
      }
      
      console.log(\`❌ License activation failed: \${response.data.error}\`);
      return false;
    } catch (error) {
      console.error(\`❌ License activation error:\`, error.message);
      return false;
    }
  }

  async verifyLicense() {
    if (!this.guildId) return false;

    try {
      const response = await axios.post(
        \`\${BASE_URL}/api/bot/verify\`,
        {
          licenseKey: LICENSE_KEY,
          guildId: this.guildId
        },
        {
          headers: { 'x-api-key': API_KEY }
        }
      );

      this.isValid = response.data.valid;

      if (!this.isValid) {
        console.log(\`⚠️ License invalid: \${response.data.error}\`);
      }

      return this.isValid;
    } catch (error) {
      console.error(\`❌ License verification error:\`, error.message);
      return false;
    }
  }
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const licenseManager = new LicenseManager(client);

client.once('ready', async () => {
  console.log(\`Bot logged in as \${client.user.tag}\`);

  // Activate license for first guild
  if (client.guilds.cache.size > 0) {
    const guildId = client.guilds.cache.first().id;
    const activated = await licenseManager.activateLicense(guildId);

    if (activated) {
      // Start heartbeat checks every 3 hours
      setInterval(async () => {
        const valid = await licenseManager.verifyLicense();
        if (!valid) {
          console.error('❌ License invalid! Shutting down bot.');
          process.exit(1);
        }
      }, 3 * 60 * 60 * 1000); // 3 hours
    } else {
      console.error('❌ Failed to activate license. Bot shutting down.');
      process.exit(1);
    }
  } else {
    console.error('❌ Bot not in any guilds!');
    process.exit(1);
  }
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith('!')) return;

  const args = message.content.slice(1).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  if (command === 'ping') {
    if (!licenseManager.isValid) {
      await message.reply('❌ Bot license is invalid!');
      return;
    }
    
    await message.reply(\`🏓 Pong! Latency: \${client.ws.ping}ms\`);
  }
});

client.login(process.env.DISCORD_TOKEN);`}
            </pre>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Security Best Practices</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-3">
            <Shield className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-sm">Never expose your API key</h4>
              <p className="text-sm text-muted-foreground">
                Store API keys in environment variables, never commit them to version control
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Shield className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-sm">Implement heartbeat checks</h4>
              <p className="text-sm text-muted-foreground">
                Verify license validity every 1-6 hours to catch revocations or expirations
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Shield className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-sm">Handle errors gracefully</h4>
              <p className="text-sm text-muted-foreground">
                Shut down the bot if license verification fails to prevent unauthorized use
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Shield className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-sm">One license per server</h4>
              <p className="text-sm text-muted-foreground">
                Each license binds to one Discord server ID and cannot be shared
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
