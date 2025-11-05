import { useState, useRef, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { User, Mail, UserCircle, Shield, Image, X, Upload, Camera, ZoomIn, ZoomOut, UserCog, ShoppingBag, Crown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import Cropper from "react-easy-crop";
import type { Area } from "react-easy-crop";

export default function ProfilePage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const effectiveRole = user?.role ?? (user?.isAdmin ? "admin" : "customer");
  const [formData, setFormData] = useState({
    username: "",
    usernamePassword: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      });
      setUploadDialogOpen(false);
      setPreviewUrl(null);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
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

  const onCropComplete = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const createCroppedImage = useCallback(async (imageSrc: string, pixelCrop: Area): Promise<string> => {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new window.Image();
      img.addEventListener('load', () => resolve(img));
      img.addEventListener('error', reject);
      img.src = imageSrc;
    });

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('No 2d context');

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    );

    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Failed to create image blob'));
          return;
        }
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve(reader.result as string);
        };
        reader.readAsDataURL(blob);
      }, 'image/jpeg', 0.95);
    });
  }, []);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid File Type",
        description: "Please upload a PNG, JPG, or WEBP image",
        variant: "destructive",
      });
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast({
        title: "File Too Large",
        description: "Please upload an image smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
    };
    reader.readAsDataURL(file);
  };

  const handleUploadProfilePicture = async () => {
    if (!previewUrl || !croppedAreaPixels) {
      toast({
        title: "Validation Error",
        description: "Please select an image to upload",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const croppedImage = await createCroppedImage(previewUrl, croppedAreaPixels);
      updateProfileMutation.mutate({ profilePicture: croppedImage });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process image",
        variant: "destructive",
      });
    }
  };

  const handleRemoveProfilePicture = () => {
    updateProfileMutation.mutate({ profilePicture: "" });
  };

  const handleAvatarClick = () => {
    setUploadDialogOpen(true);
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
              <div className="relative group">
                <Avatar 
                  className="h-20 w-20 cursor-pointer hover-elevate active-elevate-2" 
                  onClick={handleAvatarClick}
                  data-testid="avatar-upload-trigger"
                >
                  {user?.profilePicture && (
                    <AvatarImage src={user.profilePicture} alt={user.username || "Profile"} />
                  )}
                  <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                    {user ? getUserInitials(user.username || user.email) : "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <Camera className="h-8 w-8 text-white" />
                </div>
              </div>
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
                  {effectiveRole === "founder" && <Crown className="h-4 w-4 text-amber-500 fill-amber-500" />}
                  {effectiveRole === "admin" && <Shield className="h-4 w-4 text-muted-foreground" />}
                  {effectiveRole === "staff" && <UserCog className="h-4 w-4 text-muted-foreground" />}
                  {effectiveRole === "customer" && <ShoppingBag className="h-4 w-4 text-muted-foreground" />}
                  {effectiveRole === "user" && <UserCircle className="h-4 w-4 text-muted-foreground" />}
                  <span className="text-sm text-muted-foreground" data-testid="text-current-role">
                    {effectiveRole === "founder" && "Founder"}
                    {effectiveRole === "admin" && "Administrator"}
                    {effectiveRole === "staff" && "Staff"}
                    {effectiveRole === "customer" && "Customer"}
                    {effectiveRole === "user" && "User"}
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

      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent className="max-w-2xl" data-testid="dialog-upload-picture">
          <DialogHeader>
            <DialogTitle>Upload Profile Picture</DialogTitle>
            <DialogDescription>
              Choose an image, then adjust the crop area and zoom to select your profile picture.
              Supported formats: PNG, JPG, WEBP (max 5MB)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {previewUrl ? (
              <>
                <div className="relative w-full h-96 bg-muted rounded-md overflow-hidden">
                  <Cropper
                    image={previewUrl}
                    crop={crop}
                    zoom={zoom}
                    aspect={1}
                    cropShape="round"
                    showGrid={false}
                    onCropChange={setCrop}
                    onZoomChange={setZoom}
                    onCropComplete={onCropComplete}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <ZoomOut className="h-4 w-4 text-muted-foreground" />
                    <Slider
                      value={[zoom]}
                      min={1}
                      max={3}
                      step={0.1}
                      onValueChange={(value) => setZoom(value[0])}
                      className="flex-1"
                      data-testid="slider-zoom"
                    />
                    <ZoomIn className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="text-xs text-muted-foreground text-center">
                    Drag to reposition • Scroll or use slider to zoom
                  </p>
                </div>
                <div className="flex justify-center">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setPreviewUrl(null);
                      setCrop({ x: 0, y: 0 });
                      setZoom(1);
                      if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                      }
                    }}
                    data-testid="button-clear-preview"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Choose Different Image
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center gap-4 py-8">
                <div className="flex items-center justify-center h-32 w-32 rounded-full bg-muted">
                  <Upload className="h-12 w-12 text-muted-foreground" />
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  onChange={handleFileSelect}
                  className="hidden"
                  data-testid="input-file-upload"
                />
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  data-testid="button-choose-file"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Choose Image
                </Button>
              </div>
            )}
            <div className="flex gap-2 justify-end">
              {user?.profilePicture && (
                <Button
                  variant="outline"
                  onClick={handleRemoveProfilePicture}
                  disabled={updateProfileMutation.isPending}
                  data-testid="button-remove-picture"
                >
                  <X className="h-4 w-4 mr-2" />
                  Remove Current
                </Button>
              )}
              <Button
                onClick={handleUploadProfilePicture}
                disabled={!previewUrl || updateProfileMutation.isPending}
                data-testid="button-upload-picture"
              >
                <Image className="h-4 w-4 mr-2" />
                {updateProfileMutation.isPending ? "Uploading..." : "Upload"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
