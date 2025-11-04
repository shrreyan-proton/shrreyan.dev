import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Code, Key, Shield, Zap, Database, Users, Settings, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function DocsPage() {
  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-3xl font-semibold" data-testid="text-page-title">API Documentation</h1>
        <p className="text-muted-foreground mt-1">
          Complete API reference for bot integration and license management
        </p>
      </div>

      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <Code className="h-8 w-8 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-2">Interactive API Explorer</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Try out the API endpoints directly in your browser with our interactive Swagger UI documentation. 
                Test requests, view responses, and explore all available endpoints.
              </p>
              <a 
                href="/api-docs" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover-elevate active-elevate-2 font-medium text-sm"
                data-testid="link-swagger-docs"
              >
                <Zap className="h-4 w-4" />
                Open Swagger UI
              </a>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="bot-api" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="bot-api" data-testid="tab-bot-api">Bot Integration API</TabsTrigger>
          <TabsTrigger value="management-api" data-testid="tab-management-api">License Management API</TabsTrigger>
        </TabsList>

        <TabsContent value="bot-api" className="space-y-8 mt-8">
          <BotApiDocs />
        </TabsContent>

        <TabsContent value="management-api" className="space-y-8 mt-8">
          <ManagementApiDocs />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function BotApiDocs() {
  return (
    <>
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
    </>
  );
}

function ManagementApiDocs() {
  return (
    <>
      <div>
        <h2 className="text-2xl font-semibold mb-2">License Management API</h2>
        <p className="text-muted-foreground">
          RESTful API for managing licenses, users, and system configuration. Requires authentication.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Database className="h-5 w-5" />
              License Management
            </CardTitle>
            <CardDescription>
              Create, update, and manage licenses
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="h-5 w-5" />
              User Management
            </CardTitle>
            <CardDescription>
              Manage users and permissions
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Settings className="h-5 w-5" />
              Configuration
            </CardTitle>
            <CardDescription>
              System and OAuth settings
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Authentication</CardTitle>
          <CardDescription>
            All API requests require session-based authentication
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="default">POST</Badge>
              <code className="text-sm font-mono">/api/auth/login</code>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              Authenticate user and create session
            </p>
            <div className="bg-muted p-4 rounded-md space-y-2">
              <p className="text-xs font-semibold">Request Body:</p>
              <pre className="text-xs font-mono overflow-x-auto">
{`{
  "username": "admin",
  "password": "your_password"
}`}
              </pre>
              <p className="text-xs font-semibold mt-3">Response:</p>
              <pre className="text-xs font-mono overflow-x-auto">
{`{
  "user": {
    "id": "1",
    "username": "admin",
    "email": "admin@example.com",
    "isAdmin": true,
    "role": "admin"
  }
}`}
              </pre>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="default">POST</Badge>
              <code className="text-sm font-mono">/api/auth/logout</code>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              Logout and destroy session
            </p>
            <div className="bg-muted p-4 rounded-md space-y-2">
              <p className="text-xs font-semibold">Response:</p>
              <pre className="text-xs font-mono overflow-x-auto">
{`{
  "success": true
}`}
              </pre>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="default">GET</Badge>
              <code className="text-sm font-mono">/api/auth/me</code>
              <Badge variant="outline" className="text-xs">Authenticated</Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              Get current authenticated user
            </p>
            <div className="bg-muted p-4 rounded-md space-y-2">
              <p className="text-xs font-semibold">Response:</p>
              <pre className="text-xs font-mono overflow-x-auto">
{`{
  "user": {
    "id": "1",
    "username": "admin",
    "email": "admin@example.com",
    "isAdmin": true,
    "role": "admin"
  }
}`}
              </pre>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="default">GET</Badge>
              <code className="text-sm font-mono">/api/auth/discord</code>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              Initiate Discord OAuth login flow (requires Discord OAuth to be configured)
            </p>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="default">GET</Badge>
              <code className="text-sm font-mono">/api/auth/discord/callback</code>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              Discord OAuth callback endpoint (redirects to home after authentication)
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>License Endpoints</CardTitle>
          <CardDescription>
            Base URL: {window.location.origin}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="default">GET</Badge>
                <code className="text-sm font-mono">/api/licenses</code>
                <Badge variant="outline" className="text-xs">Admin</Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Get all licenses with user information
              </p>
              <div className="bg-muted p-4 rounded-md space-y-2">
                <p className="text-xs font-semibold">Response:</p>
                <pre className="text-xs font-mono overflow-x-auto">
{`[
  {
    "id": "1",
    "key": "DISC-XXXX-XXXX-XXXX",
    "userId": "user123",
    "userName": "john_doe",
    "status": "active",
    "productName": "Discord Bot",
    "expiresAt": "2025-12-31T23:59:59.000Z",
    "guildId": "1234567890",
    "activatedAt": "2024-01-15T10:30:00.000Z"
  }
]`}
                </pre>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="default">GET</Badge>
                <code className="text-sm font-mono">/api/licenses/my</code>
                <Badge variant="outline" className="text-xs">User</Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Get licenses owned by the current authenticated user
              </p>
              <div className="bg-muted p-4 rounded-md space-y-2">
                <p className="text-xs font-semibold">Response:</p>
                <pre className="text-xs font-mono overflow-x-auto">
{`[
  {
    "id": "1",
    "key": "DISC-XXXX-XXXX-XXXX",
    "userId": "user123",
    "status": "active",
    "productName": "Discord Bot",
    "expiresAt": "2025-12-31T23:59:59.000Z",
    "guildId": "1234567890",
    "activatedAt": "2024-01-15T10:30:00.000Z"
  }
]`}
                </pre>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="default">POST</Badge>
                <code className="text-sm font-mono">/api/licenses/admin</code>
                <Badge variant="outline" className="text-xs">Admin</Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Create a new license
              </p>
              <div className="bg-muted p-4 rounded-md space-y-2">
                <p className="text-xs font-semibold">Request Body:</p>
                <pre className="text-xs font-mono overflow-x-auto">
{`{
  "userId": "user123",
  "productName": "Discord Bot Premium",
  "duration": 12,
  "licenseType": "yearly",
  "status": "active"
}`}
                </pre>
                <p className="text-xs font-semibold mt-3">Response:</p>
                <pre className="text-xs font-mono overflow-x-auto">
{`{
  "id": "2",
  "key": "DISC-ABCD-EFGH-IJKL",
  "userId": "user123",
  "status": "active",
  "productName": "Discord Bot Premium",
  "expiresAt": "2026-01-15T23:59:59.000Z"
}`}
                </pre>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="default">PATCH</Badge>
                <code className="text-sm font-mono">/api/licenses/:id</code>
                <Badge variant="outline" className="text-xs">Admin</Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Update a license
              </p>
              <div className="bg-muted p-4 rounded-md space-y-2">
                <p className="text-xs font-semibold">Request Body:</p>
                <pre className="text-xs font-mono overflow-x-auto">
{`{
  "status": "suspended",
  "note": "Payment failed"
}`}
                </pre>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="default">DELETE</Badge>
                <code className="text-sm font-mono">/api/licenses/:id</code>
                <Badge variant="outline" className="text-xs">Admin</Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Delete a license
              </p>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="default">POST</Badge>
                <code className="text-sm font-mono">/api/licenses/:id/reset</code>
                <Badge variant="outline" className="text-xs">Admin</Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Reset license binding (unbind from guild and clear activation data)
              </p>
              <div className="bg-muted p-4 rounded-md space-y-2">
                <p className="text-xs font-semibold">Response:</p>
                <pre className="text-xs font-mono overflow-x-auto">
{`{
  "success": true,
  "license": {
    "id": "1",
    "key": "DISC-XXXX-XXXX-XXXX",
    "userId": "user123",
    "status": "active",
    "productName": "Discord Bot",
    "expiresAt": "2025-12-31T23:59:59.000Z",
    "guildId": null,
    "activatedAt": null,
    "lastHeartbeat": null
  }
}`}
                </pre>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="default">POST</Badge>
                <code className="text-sm font-mono">/api/licenses/:id/regenerate</code>
                <Badge variant="outline" className="text-xs">User</Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Regenerate license key (users can only regenerate their own licenses)
              </p>
              <div className="bg-muted p-4 rounded-md space-y-2">
                <p className="text-xs font-semibold">Response:</p>
                <pre className="text-xs font-mono overflow-x-auto">
{`{
  "id": "1",
  "key": "CRIM-XXXX-XXXX-XXXX-XXXX",
  "userId": "user123",
  "status": "active",
  "productName": "Discord Bot",
  "expiresAt": "2025-12-31T23:59:59.000Z"
}`}
                </pre>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>User Management Endpoints</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="default">GET</Badge>
              <code className="text-sm font-mono">/api/users</code>
              <Badge variant="outline" className="text-xs">Admin</Badge>
            </div>
            <p className="text-sm text-muted-foreground">Get all users with license counts</p>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="default">POST</Badge>
              <code className="text-sm font-mono">/api/users</code>
              <Badge variant="outline" className="text-xs">Admin</Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-3">Create a new user</p>
            <div className="bg-muted p-4 rounded-md space-y-2">
              <p className="text-xs font-semibold">Request Body:</p>
              <pre className="text-xs font-mono overflow-x-auto">
{`{
  "username": "newuser",
  "email": "user@example.com",
  "password": "secure_password",
  "role": "customer",
  "isAdmin": false
}`}
              </pre>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="default">PATCH</Badge>
              <code className="text-sm font-mono">/api/users/:id</code>
              <Badge variant="outline" className="text-xs">Admin</Badge>
            </div>
            <p className="text-sm text-muted-foreground">Update user details</p>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="default">DELETE</Badge>
              <code className="text-sm font-mono">/api/users/:id</code>
              <Badge variant="outline" className="text-xs">Admin</Badge>
            </div>
            <p className="text-sm text-muted-foreground">Delete a user</p>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="default">PATCH</Badge>
              <code className="text-sm font-mono">/api/profile</code>
              <Badge variant="outline" className="text-xs">User</Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-3">Update own profile</p>
            <div className="bg-muted p-4 rounded-md space-y-2">
              <p className="text-xs font-semibold">Request Body:</p>
              <pre className="text-xs font-mono overflow-x-auto">
{`{
  "username": "newusername",
  "currentPassword": "old_password",
  "profilePicture": "https://example.com/avatar.png"
}`}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Bot API Keys Endpoints</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="default">GET</Badge>
              <code className="text-sm font-mono">/api/bot-api-keys</code>
              <Badge variant="outline" className="text-xs">Admin</Badge>
            </div>
            <p className="text-sm text-muted-foreground">List all bot API keys</p>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="default">POST</Badge>
              <code className="text-sm font-mono">/api/bot-api-keys</code>
              <Badge variant="outline" className="text-xs">Admin</Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-3">Create a new bot API key</p>
            <div className="bg-muted p-4 rounded-md space-y-2">
              <p className="text-xs font-semibold">Request Body:</p>
              <pre className="text-xs font-mono overflow-x-auto">
{`{
  "name": "Production Bot Key"
}`}
              </pre>
              <p className="text-xs font-semibold mt-3">Response (key shown only once):</p>
              <pre className="text-xs font-mono overflow-x-auto">
{`{
  "id": "1",
  "name": "Production Bot Key",
  "key": "lm_abc123...",
  "keyPrefix": "lm_abc123...",
  "isActive": true
}`}
              </pre>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="default">PATCH</Badge>
              <code className="text-sm font-mono">/api/bot-api-keys/:id</code>
              <Badge variant="outline" className="text-xs">Admin</Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-3">Update API key (e.g., deactivate)</p>
            <div className="bg-muted p-4 rounded-md space-y-2">
              <p className="text-xs font-semibold">Request Body:</p>
              <pre className="text-xs font-mono overflow-x-auto">
{`{
  "isActive": false,
  "name": "Deactivated Key"
}`}
              </pre>
              <p className="text-xs font-semibold mt-3">Response:</p>
              <pre className="text-xs font-mono overflow-x-auto">
{`{
  "id": "1",
  "name": "Deactivated Key",
  "keyPrefix": "lm_abc123...",
  "isActive": false,
  "lastUsedAt": "2024-01-15T10:30:00.000Z"
}`}
              </pre>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="default">DELETE</Badge>
              <code className="text-sm font-mono">/api/bot-api-keys/:id</code>
              <Badge variant="outline" className="text-xs">Admin</Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-3">Delete an API key</p>
            <div className="bg-muted p-4 rounded-md space-y-2">
              <p className="text-xs font-semibold">Response:</p>
              <pre className="text-xs font-mono overflow-x-auto">
{`{
  "success": true
}`}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Discord OAuth Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="default">GET</Badge>
              <code className="text-sm font-mono">/api/discord-config</code>
              <Badge variant="outline" className="text-xs">Admin</Badge>
            </div>
            <p className="text-sm text-muted-foreground">Get Discord OAuth configuration</p>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="default">POST</Badge>
              <code className="text-sm font-mono">/api/discord-config</code>
              <Badge variant="outline" className="text-xs">Admin</Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-3">Save Discord OAuth configuration</p>
            <div className="bg-muted p-4 rounded-md space-y-2">
              <p className="text-xs font-semibold">Request Body:</p>
              <pre className="text-xs font-mono overflow-x-auto">
{`{
  "clientId": "your_discord_client_id",
  "clientSecret": "your_discord_client_secret",
  "redirectUri": "https://yourdomain.com/api/auth/discord/callback"
}`}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Common Response Codes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="font-mono">200</Badge>
              <span>OK - Request successful</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="font-mono">400</Badge>
              <span>Bad Request - Invalid request data</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="font-mono">401</Badge>
              <span>Unauthorized - Authentication required</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="font-mono">403</Badge>
              <span>Forbidden - Admin access required</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="font-mono">404</Badge>
              <span>Not Found - Resource not found</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="font-mono">500</Badge>
              <span>Server Error - Internal error occurred</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
