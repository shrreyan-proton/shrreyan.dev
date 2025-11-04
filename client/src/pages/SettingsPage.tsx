import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SiDiscord } from "react-icons/si";

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold" data-testid="text-page-title">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your application settings</p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Discord Integration</CardTitle>
            <CardDescription>
              Configure Discord OAuth settings for user authentication
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="client-id">Discord Client ID</Label>
              <Input
                id="client-id"
                placeholder="Enter your Discord application client ID"
                data-testid="input-client-id"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="client-secret">Discord Client Secret</Label>
              <Input
                id="client-secret"
                type="password"
                placeholder="Enter your Discord application client secret"
                data-testid="input-client-secret"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="redirect-uri">Redirect URI</Label>
              <Input
                id="redirect-uri"
                placeholder="https://yourapp.com/auth/discord/callback"
                data-testid="input-redirect-uri"
              />
            </div>
            <Button data-testid="button-save-discord">
              <SiDiscord className="h-4 w-4 mr-2" />
              Save Discord Settings
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Database Configuration</CardTitle>
            <CardDescription>
              PostgreSQL database connection settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Database Status</Label>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <span className="text-sm text-muted-foreground">Connected to PostgreSQL</span>
              </div>
            </div>
            <Separator />
            <div className="text-sm text-muted-foreground">
              Database connection is managed automatically via environment variables.
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Admin Account</CardTitle>
            <CardDescription>
              Default administrator account information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                value="shrreyangO@gmail.com"
                disabled
                data-testid="input-admin-email"
              />
            </div>
            <div className="text-sm text-muted-foreground">
              This is the default admin account configured for the system.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
