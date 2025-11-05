import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SiDiscord } from "react-icons/si";
import { Key, Copy, Trash2, Plus, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface DiscordConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

interface BotApiKey {
  id: string;
  name: string;
  keyHash: string;
  keyPrefix: string;
  isActive: boolean;
  lastUsedAt?: string;
  lastUsedIp?: string;
  createdAt: string;
  key?: string; // Only present on creation
}

interface DatabaseStatus {
  connected: boolean;
  state: string;
  host: string;
  dbName: string;
  readyState: number;
}

export default function SettingsPage() {
  const { toast } = useToast();
  const [config, setConfig] = useState<DiscordConfig>({
    clientId: "",
    clientSecret: "",
    redirectUri: "",
  });
  const [newApiKeyName, setNewApiKeyName] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedApiKey, setSelectedApiKey] = useState<BotApiKey | null>(null);
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null);
  const [showKeyDialog, setShowKeyDialog] = useState(false);

  const { data: discordConfig, isLoading } = useQuery<DiscordConfig>({
    queryKey: ["/api/discord-config"],
  });

  const { data: apiKeys = [], isLoading: isLoadingKeys } = useQuery<BotApiKey[]>({
    queryKey: ["/api/bot-api-keys"],
  });

  const { data: dbStatus, isLoading: isLoadingDbStatus } = useQuery<DatabaseStatus>({
    queryKey: ["/api/database-status"],
    refetchInterval: 5000, // Refresh every 5 seconds for real-time status
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

  const createApiKeyMutation = useMutation({
    mutationFn: async (name: string) => {
      const res = await apiRequest("POST", "/api/bot-api-keys", { name });
      return await res.json();
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/bot-api-keys"] });
      setNewApiKeyName("");
      if (data.key) {
        setNewlyCreatedKey(data.key);
        setShowKeyDialog(true);
        // Try to auto-copy, but don't rely on it
        navigator.clipboard.writeText(data.key).catch(() => {
          // Silently fail - user can copy manually from dialog
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create API key",
        variant: "destructive",
      });
    },
  });

  const deleteApiKeyMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/bot-api-keys/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bot-api-keys"] });
      toast({
        title: "Success",
        description: "API key deleted successfully",
      });
      setDeleteDialogOpen(false);
      setSelectedApiKey(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete API key",
        variant: "destructive",
      });
    },
  });

  const handleCreateApiKey = () => {
    if (!newApiKeyName.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a name for the API key",
        variant: "destructive",
      });
      return;
    }
    createApiKeyMutation.mutate(newApiKeyName);
  };

  const handleCopyKey = (keyPrefix: string) => {
    toast({
      title: "Cannot Copy",
      description: "Full API key is only shown once at creation. This shows the prefix only.",
      variant: "destructive",
    });
  };

  const handleCopyNewKey = () => {
    if (newlyCreatedKey) {
      navigator.clipboard.writeText(newlyCreatedKey).then(() => {
        toast({
          title: "Copied!",
          description: "API key copied to clipboard",
        });
      }).catch(() => {
        toast({
          title: "Copy Failed",
          description: "Please manually select and copy the key",
          variant: "destructive",
        });
      });
    }
  };

  const handleCloseKeyDialog = () => {
    setShowKeyDialog(false);
    setNewlyCreatedKey(null);
  };

  const handleDeleteKey = (apiKey: BotApiKey) => {
    setSelectedApiKey(apiKey);
    setDeleteDialogOpen(true);
  };

  const sendTestEmailMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/test-email", {});
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Test email sent successfully! Check your inbox.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send test email",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold" data-testid="text-page-title">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your application settings</p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Email Testing
            </CardTitle>
            <CardDescription>
              Send a test license violation email to verify email integration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => sendTestEmailMutation.mutate()}
              disabled={sendTestEmailMutation.isPending}
              data-testid="button-send-test-email"
            >
              <Mail className="h-4 w-4 mr-2" />
              {sendTestEmailMutation.isPending ? "Sending..." : "Send Test Email"}
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              This will send a sample license violation email to your account email
            </p>
          </CardContent>
        </Card>

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
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Bot API Keys
            </CardTitle>
            <CardDescription>
              Manage API keys for your Discord bot to verify licenses
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Enter API key name (e.g., My Discord Bot)"
                value={newApiKeyName}
                onChange={(e) => setNewApiKeyName(e.target.value)}
                data-testid="input-api-key-name"
              />
              <Button
                onClick={handleCreateApiKey}
                disabled={createApiKeyMutation.isPending || isLoadingKeys}
                data-testid="button-create-api-key"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create
              </Button>
            </div>

            {isLoadingKeys ? (
              <div className="text-sm text-muted-foreground">Loading API keys...</div>
            ) : apiKeys.length === 0 ? (
              <div className="text-sm text-muted-foreground">
                No API keys yet. Create one to get started.
              </div>
            ) : (
              <div className="space-y-3">
                {apiKeys.map((apiKey) => (
                  <div
                    key={apiKey.id}
                    className="flex items-center justify-between p-3 border rounded-md"
                    data-testid={`api-key-item-${apiKey.id}`}
                  >
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{apiKey.name}</span>
                        <Badge variant={apiKey.isActive ? "default" : "secondary"}>
                          {apiKey.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground font-mono">
                        {apiKey.keyPrefix}••••••••••••••••••••••••••••••••••••••••
                      </div>
                      {apiKey.lastUsedAt && (
                        <div className="text-xs text-muted-foreground">
                          Last used: {new Date(apiKey.lastUsedAt).toLocaleString()}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleCopyKey(apiKey.keyPrefix)}
                        data-testid={`button-copy-key-${apiKey.id}`}
                        disabled
                        title="Full key only shown once at creation"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDeleteKey(apiKey)}
                        data-testid={`button-delete-key-${apiKey.id}`}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Database Configuration</CardTitle>
            <CardDescription>
              MongoDB database connection settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoadingDbStatus ? (
              <div className="text-sm text-muted-foreground">Loading database status...</div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label>Database Status</Label>
                  <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${dbStatus?.connected ? 'bg-green-500' : 'bg-red-500'}`} />
                    <span className="text-sm text-muted-foreground">
                      {dbStatus?.connected ? 'Connected to MongoDB' : 'Disconnected from MongoDB'}
                    </span>
                  </div>
                </div>
                
                {dbStatus?.connected && (
                  <>
                    <div className="space-y-2">
                      <Label>Database Name</Label>
                      <div className="text-sm text-muted-foreground font-mono">
                        {dbStatus.dbName}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Host</Label>
                      <div className="text-sm text-muted-foreground font-mono">
                        {dbStatus.host}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Connection State</Label>
                      <Badge variant="outline" className="capitalize">
                        {dbStatus.state}
                      </Badge>
                    </div>
                  </>
                )}
              </>
            )}
            <Separator />
            <div className="text-sm text-muted-foreground">
              Database connection is managed automatically. Real-time status updates every 5 seconds.
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

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete API Key</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the API key "{selectedApiKey?.name}"?
              This action cannot be undone and will revoke access for any bot using this key.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedApiKey && deleteApiKeyMutation.mutate(selectedApiKey.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showKeyDialog} onOpenChange={setShowKeyDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Key className="h-5 w-5 text-primary" />
              API Key Created Successfully
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <p className="text-destructive font-semibold">
                  ⚠️ Save this key now! You won't be able to see it again.
                </p>
                <p>Copy this API key and store it securely. You'll need it to authenticate your Discord bot.</p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="my-4">
            <div className="relative">
              <div className="p-3 bg-muted rounded-md border">
                <code className="text-sm font-mono break-all select-all">
                  {newlyCreatedKey}
                </code>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="absolute top-2 right-2"
                onClick={handleCopyNewKey}
                data-testid="button-copy-new-key"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleCloseKeyDialog} data-testid="button-close-key-dialog">
              I've Saved the Key
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
