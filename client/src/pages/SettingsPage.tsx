import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SiDiscord } from "react-icons/si";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface DiscordConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

export default function SettingsPage() {
  const { toast } = useToast();
  const [config, setConfig] = useState<DiscordConfig>({
    clientId: "",
    clientSecret: "",
    redirectUri: "",
  });

  const { data: discordConfig, isLoading } = useQuery<DiscordConfig>({
    queryKey: ["/api/discord-config"],
  });

  useEffect(() => {
    if (discordConfig) {
      setConfig(discordConfig);
    }
  }, [discordConfig]);

  const saveConfigMutation = useMutation({
    mutationFn: async (data: DiscordConfig) => {
      return apiRequest("POST", "/api/discord-config", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/discord-config"] });
      toast({
        title: "Success",
        description: "Discord OAuth settings saved successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save Discord settings",
        variant: "destructive",
      });
    },
  });

  const handleSaveDiscord = () => {
    if (!config.clientId || !config.clientSecret || !config.redirectUri) {
      toast({
        title: "Validation Error",
        description: "All fields are required",
        variant: "destructive",
      });
      return;
    }
    saveConfigMutation.mutate(config);
  };

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
                value={config.clientId}
                onChange={(e) => setConfig({ ...config, clientId: e.target.value })}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="client-secret">Discord Client Secret</Label>
              <Input
                id="client-secret"
                type="password"
                placeholder="Enter your Discord application client secret"
                data-testid="input-client-secret"
                value={config.clientSecret}
                onChange={(e) => setConfig({ ...config, clientSecret: e.target.value })}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="redirect-uri">Redirect URI</Label>
              <Input
                id="redirect-uri"
                placeholder="https://yourapp.com/api/auth/discord/callback"
                data-testid="input-redirect-uri"
                value={config.redirectUri}
                onChange={(e) => setConfig({ ...config, redirectUri: e.target.value })}
                disabled={isLoading}
              />
            </div>
            <Button 
              data-testid="button-save-discord"
              onClick={handleSaveDiscord}
              disabled={saveConfigMutation.isPending || isLoading}
            >
              <SiDiscord className="h-4 w-4 mr-2" />
              {saveConfigMutation.isPending ? "Saving..." : "Save Discord Settings"}
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
                value="shrreyango@gmail.com"
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
