import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface EditUserDialogProps {
  user: {
    id: string;
    email: string;
    username?: string;
    isAdmin: boolean;
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (id: string, data: any) => void;
}

export function EditUserDialog({ user, open, onOpenChange, onSubmit }: EditUserDialogProps) {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: "customer",
  });

  const isProtectedAdmin = user?.username === "shrreyango";

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || "",
        email: user.email,
        password: "",
        role: (user as any).role || (user.isAdmin ? "admin" : "customer"),
      });
    }
  }, [user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    const submitData: any = {
      username: formData.username,
      email: formData.email,
      role: formData.role,
      isAdmin: formData.role === "admin",
    };
    
    if (formData.password) {
      submitData.password = formData.password;
    }
    
    onSubmit?.(user.id, submitData);
    onOpenChange(false);
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent data-testid="dialog-edit-user">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>
            Update user information, role, and password.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-username">Username</Label>
              <Input
                id="edit-username"
                type="text"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                placeholder="Username"
                data-testid="input-edit-username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="user@example.com"
                required
                data-testid="input-edit-email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-password">New Password (Optional)</Label>
              <Input
                id="edit-password"
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                placeholder="Leave blank to keep current password"
                data-testid="input-edit-password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-role">Role</Label>
              <Select
                value={formData.role}
                onValueChange={(value) =>
                  setFormData({ ...formData, role: value })
                }
                disabled={isProtectedAdmin}
              >
                <SelectTrigger id="edit-role" data-testid="select-edit-role">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="customer">Customer</SelectItem>
                  <SelectItem value="staff">Staff</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="founder">Founder</SelectItem>
                </SelectContent>
              </Select>
              {isProtectedAdmin && (
                <p className="text-xs text-muted-foreground">
                  This user's role is protected and cannot be changed.
                </p>
              )}
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              data-testid="button-edit-cancel"
            >
              Cancel
            </Button>
            <Button type="submit" data-testid="button-edit-submit">
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
