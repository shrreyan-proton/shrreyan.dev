import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Mail, UserCircle, Shield, Image, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";

export default function ProfilePage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    username: "",
    usernamePassword: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    profilePicture: "",
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: { username?: string; password?: string; currentPassword?: string; oldPassword?: string; profilePicture?: string }) => {
      return apiRequest("PATCH", "/api/profile", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
      setFormData({
        username: "",
        usernamePassword: "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
        profilePicture: "",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    },
  });

  const handleUpdateUsername = () => {
    if (!formData.username.trim()) {
      toast({
        title: "Validation Error",
        description: "Username cannot be empty",
        variant: "destructive",
      });
      return;
    }
    
    if (formData.username === user?.username) {
      toast({
        title: "No Changes",
        description: `Your username is already "${user.username}"`,
        variant: "default",
      });
      return;
    }
    
    if (!formData.usernamePassword) {
      toast({
        title: "Validation Error",
        description: "Please enter your password to confirm",
        variant: "destructive",
      });
      return;
    }
    
    updateProfileMutation.mutate({ 
      username: formData.username, 
      currentPassword: formData.usernamePassword 
    });
  };

  const handleUpdatePassword = () => {
    if (!formData.currentPassword) {
      toast({
        title: "Validation Error",
        description: "Please enter your current password",
        variant: "destructive",
      });
      return;
    }
    
    if (!formData.newPassword || !formData.confirmPassword) {
      toast({
        title: "Validation Error",
        description: "Please fill in all password fields",
        variant: "destructive",
      });
      return;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      toast({
        title: "Validation Error",
        description: "New passwords do not match",
        variant: "destructive",
      });
      return;
    }
    if (formData.newPassword.length < 6) {
      toast({
        title: "Validation Error",
        description: "Password must be at least 6 characters",
        variant: "destructive",
      });
      return;
    }
    updateProfileMutation.mutate({ 
      password: formData.newPassword,
      oldPassword: formData.currentPassword
    });
  };

  const handleUpdateProfilePicture = () => {
    if (!formData.profilePicture.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid image URL",
        variant: "destructive",
      });
      return;
    }
    
    updateProfileMutation.mutate({ profilePicture: formData.profilePicture });
  };

  const handleRemoveProfilePicture = () => {
    updateProfileMutation.mutate({ profilePicture: "" });
  };

  const getUserInitials = (username?: string) => {
    if (!username) return "U";
    return username.substring(0, 2).toUpperCase();
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold" data-testid="text-page-title">Profile</h1>
        <p className="text-muted-foreground mt-1">Manage your account information</p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Account Overview</CardTitle>
            <CardDescription>
              Your current account information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                {user?.profilePicture && (
                  <AvatarImage src={user.profilePicture} alt={user.username || "Profile"} />
                )}
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                  {user ? getUserInitials(user.username || user.email) : "U"}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium" data-testid="text-current-username">
                    {user?.username || "Not set"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground" data-testid="text-current-email">
                    {user?.email}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground" data-testid="text-current-role">
                    {user?.isAdmin ? "Administrator" : "User"}
                  </span>
                </div>
              </div>
            </div>
            {user?.discordUsername && (
              <>
                <Separator />
                <div className="space-y-2">
                  <Label>Discord Account</Label>
                  <div className="flex items-center gap-2">
                    <UserCircle className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm" data-testid="text-discord-username">
                      {user.discordUsername}
                    </span>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Profile Picture</CardTitle>
            <CardDescription>
              Set your profile picture using an image URL
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-24 w-24">
                {user?.profilePicture && (
                  <AvatarImage src={user.profilePicture} alt={user.username || "Profile"} />
                )}
                <AvatarFallback className="bg-primary text-primary-foreground text-3xl">
                  {user ? getUserInitials(user.username || user.email) : "U"}
                </AvatarFallback>
              </Avatar>
              {user?.profilePicture && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRemoveProfilePicture}
                  disabled={updateProfileMutation.isPending}
                  data-testid="button-remove-picture"
                >
                  <X className="h-4 w-4 mr-2" />
                  Remove Picture
                </Button>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile-picture">Image URL</Label>
              <Input
                id="profile-picture"
                type="url"
                placeholder="https://example.com/image.jpg"
                data-testid="input-profile-picture"
                value={formData.profilePicture}
                onChange={(e) => setFormData({ ...formData, profilePicture: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Enter a URL to an image you want to use as your profile picture
              </p>
            </div>
            <Button
              data-testid="button-update-picture"
              onClick={handleUpdateProfilePicture}
              disabled={updateProfileMutation.isPending}
            >
              <Image className="h-4 w-4 mr-2" />
              {updateProfileMutation.isPending ? "Updating..." : "Update Profile Picture"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Update Username</CardTitle>
            <CardDescription>
              Change your display name
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">New Username</Label>
              <Input
                id="username"
                placeholder="Enter new username"
                data-testid="input-new-username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="username-password">Password Confirmation</Label>
              <Input
                id="username-password"
                type="password"
                placeholder="Enter your password to confirm"
                data-testid="input-username-password"
                value={formData.usernamePassword}
                onChange={(e) => setFormData({ ...formData, usernamePassword: e.target.value })}
              />
            </div>
            <Button
              data-testid="button-update-username"
              onClick={handleUpdateUsername}
              disabled={updateProfileMutation.isPending}
            >
              <User className="h-4 w-4 mr-2" />
              {updateProfileMutation.isPending ? "Updating..." : "Update Username"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
            <CardDescription>
              Update your account password
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Current Password</Label>
              <Input
                id="current-password"
                type="password"
                placeholder="Enter your current password"
                data-testid="input-current-password"
                value={formData.currentPassword}
                onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                placeholder="Enter new password"
                data-testid="input-new-password"
                value={formData.newPassword}
                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="Confirm new password"
                data-testid="input-confirm-password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              />
            </div>
            <Button
              data-testid="button-update-password"
              onClick={handleUpdatePassword}
              disabled={updateProfileMutation.isPending}
            >
              {updateProfileMutation.isPending ? "Updating..." : "Update Password"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
