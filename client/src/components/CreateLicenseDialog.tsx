import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Sparkles } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CreateLicenseDialogProps {
  onSubmit?: (data: any) => void;
}

// Generate a random license key
function generateLicenseKey(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const segments = 4;
  const segmentLength = 4;
  
  const key = Array.from({ length: segments }, () => {
    return Array.from({ length: segmentLength }, () => 
      chars.charAt(Math.floor(Math.random() * chars.length))
    ).join('');
  }).join('-');
  
  return `CRIM-${key}`;
}

export function CreateLicenseDialog({ onSubmit }: CreateLicenseDialogProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    key: "",
    userId: "",
    duration: "999",
    productName: "Crim Tickets",
    maxActivations: "1",
    discordUserId: "",
    note: "",
  });

  const handleGenerate = () => {
    setFormData({ ...formData, key: generateLicenseKey() });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      duration: parseInt(formData.duration),
      maxActivations: parseInt(formData.maxActivations),
      discordUserId: formData.discordUserId || undefined,
      note: formData.note || undefined,
    };
    console.log("Creating license:", submitData);
    onSubmit?.(submitData);
    setOpen(false);
    setFormData({
      key: "",
      userId: "",
      duration: "999",
      productName: "Crim Tickets",
      maxActivations: "1",
      discordUserId: "",
      note: "",
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button data-testid="button-create-license">
          <Plus className="h-4 w-4 mr-2" />
          Create License
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl" data-testid="dialog-create-license">
        <DialogHeader>
          <DialogTitle>Create New License</DialogTitle>
          <DialogDescription>
            Create a new license key for Crim Tickets. You can manually enter a key or generate one automatically.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="key">License Key</Label>
              <div className="flex gap-2">
                <Input
                  id="key"
                  value={formData.key}
                  onChange={(e) =>
                    setFormData({ ...formData, key: e.target.value.toUpperCase() })
                  }
                  placeholder="CRIM-XXXX-XXXX-XXXX-XXXX"
                  required
                  data-testid="input-license-key"
                  className="font-mono"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGenerate}
                  data-testid="button-generate-key"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="productName">Product</Label>
                <Select
                  value={formData.productName}
                  onValueChange={(value) =>
                    setFormData({ ...formData, productName: value })
                  }
                >
                  <SelectTrigger id="productName" data-testid="select-product-name">
                    <SelectValue placeholder="Select product" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Crim Tickets">Crim Tickets</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Duration</Label>
                <Select
                  value={formData.duration}
                  onValueChange={(value) =>
                    setFormData({ ...formData, duration: value })
                  }
                >
                  <SelectTrigger id="duration" data-testid="select-duration">
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Month</SelectItem>
                    <SelectItem value="3">3 Months</SelectItem>
                    <SelectItem value="6">6 Months</SelectItem>
                    <SelectItem value="12">12 Months</SelectItem>
                    <SelectItem value="24">24 Months</SelectItem>
                    <SelectItem value="36">36 Months</SelectItem>
                    <SelectItem value="999">Lifetime</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="maxActivations">Max Activations</Label>
                <Input
                  id="maxActivations"
                  type="number"
                  value={formData.maxActivations}
                  onChange={(e) =>
                    setFormData({ ...formData, maxActivations: e.target.value })
                  }
                  placeholder="1"
                  required
                  min="1"
                  data-testid="input-max-activations"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="discordUserId">Discord User ID (Optional)</Label>
                <Input
                  id="discordUserId"
                  value={formData.discordUserId}
                  onChange={(e) =>
                    setFormData({ ...formData, discordUserId: e.target.value })
                  }
                  placeholder="Discord user ID"
                  data-testid="input-discord-user-id"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="user">Assign to User (Optional)</Label>
              <Select
                value={formData.userId}
                onValueChange={(value) =>
                  setFormData({ ...formData, userId: value })
                }
              >
                <SelectTrigger id="user" data-testid="select-user">
                  <SelectValue placeholder="Select a user" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  <SelectItem value="user1">John Doe</SelectItem>
                  <SelectItem value="user2">Jane Smith</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="note">Admin Notes (Optional)</Label>
              <Textarea
                id="note"
                value={formData.note}
                onChange={(e) =>
                  setFormData({ ...formData, note: e.target.value })
                }
                placeholder="Add any additional notes about this license"
                rows={3}
                data-testid="input-note"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              data-testid="button-cancel"
            >
              Cancel
            </Button>
            <Button type="submit" data-testid="button-submit">
              Create License
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
