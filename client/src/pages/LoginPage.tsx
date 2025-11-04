import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SiDiscord } from "react-icons/si";
import { useToast } from "@/hooks/use-toast";
import logoImage from "@assets/logo_1762262685070.png";
import { useAuth } from "@/hooks/useAuth";

export default function LoginPage() {
  const { toast } = useToast();
  const { login, isLoggingIn, loginError } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(formData);
      toast({
        title: "Success",
        description: "Logged in successfully",
      });
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message || "Invalid email or password",
        variant: "destructive",
      });
    }
  };

  const handleDiscordLogin = () => {
    toast({
      title: "Discord Login",
      description: "Discord OAuth integration coming soon",
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <img src={logoImage} alt="Logo" className="h-16 w-16" />
          </div>
          <div>
            <CardTitle className="text-2xl">License Manager</CardTitle>
            <CardDescription>Sign in to manage your Discord bot licenses</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <Button
            onClick={handleDiscordLogin}
            className="w-full bg-[#5865F2] hover:bg-[#4752C4] text-white"
            size="lg"
            data-testid="button-discord-login"
          >
            <SiDiscord className="h-5 w-5 mr-2" />
            Continue with Discord
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                Or continue with email
              </span>
            </div>
          </div>

          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="admin@example.com"
                required
                data-testid="input-email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                placeholder="••••••••"
                required
                data-testid="input-password"
              />
            </div>
            <Button type="submit" className="w-full" data-testid="button-email-login" disabled={isLoggingIn}>
              {isLoggingIn ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="text-xs text-center text-muted-foreground">
            Admin: shrreyangO@gmail.com
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
