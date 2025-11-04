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
import { Plus } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CreateLicenseDialogProps {
  onSubmit?: (data: any) => void;
}

export function CreateLicenseDialog({ onSubmit }: CreateLicenseDialogProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    userId: "",
    duration: "12",
    productName: "Discord Bot",
    licenseType: "custom",
    maxActivations: "",
    hwid: "",
    ipWhitelist: "",
    discordServerId: "",
    note: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      duration: parseInt(formData.duration),
      maxActivations: formData.maxActivations ? parseInt(formData.maxActivations) : undefined,
      ipWhitelist: formData.ipWhitelist ? formData.ipWhitelist.split(',').map(ip => ip.trim()).filter(Boolean) : undefined,
      hwid: formData.hwid || undefined,
      discordServerId: formData.discordServerId || undefined,
      note: formData.note || undefined,
    };
    console.log("Creating license:", submitData);
    onSubmit?.(submitData);
    setOpen(false);
    setFormData({
      userId: "",
      duration: "12",
      productName: "Discord Bot",
      licenseType: "custom",
      maxActivations: "",
      hwid: "",
      ipWhitelist: "",
      discordServerId: "",
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
      <DialogContent className="max-w-2xl max-h-[90vh]" data-testid="dialog-create-license">
        <DialogHeader>
          <DialogTitle>Create New License</DialogTitle>
          <DialogDescription>
            Generate a new license key for a user. The key will be automatically created.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="productName">Product Name</Label>
                  <Input
                    id="productName"
                    value={formData.productName}
                    onChange={(e) =>
                      setFormData({ ...formData, productName: e.target.value })
                    }
                    placeholder="Discord Bot"
                    required
                    data-testid="input-product-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="licenseType">License Type</Label>
                  <Select
                    value={formData.licenseType}
                    onValueChange={(value) =>
                      setFormData({ ...formData, licenseType: value })
                    }
                  >
                    <SelectTrigger id="licenseType" data-testid="select-license-type">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lifetime">Lifetime</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (months)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={formData.duration}
                    onChange={(e) =>
                      setFormData({ ...formData, duration: e.target.value })
                    }
                    placeholder="12"
                    required
                    data-testid="input-duration"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxActivations">Max Activations (Optional)</Label>
                  <Input
                    id="maxActivations"
                    type="number"
                    value={formData.maxActivations}
                    onChange={(e) =>
                      setFormData({ ...formData, maxActivations: e.target.value })
                    }
                    placeholder="Unlimited"
                    data-testid="input-max-activations"
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
                <Label htmlFor="hwid">Hardware ID (Optional)</Label>
                <Input
                  id="hwid"
                  value={formData.hwid}
                  onChange={(e) =>
                    setFormData({ ...formData, hwid: e.target.value })
                  }
                  placeholder="Bind to specific hardware"
                  data-testid="input-hwid"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="discordServerId">Discord Server ID (Optional)</Label>
                <Input
                  id="discordServerId"
                  value={formData.discordServerId}
                  onChange={(e) =>
                    setFormData({ ...formData, discordServerId: e.target.value })
                  }
                  placeholder="Restrict to specific Discord server"
                  data-testid="input-discord-server-id"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ipWhitelist">IP Whitelist (Optional)</Label>
                <Textarea
                  id="ipWhitelist"
                  value={formData.ipWhitelist}
                  onChange={(e) =>
                    setFormData({ ...formData, ipWhitelist: e.target.value })
                  }
                  placeholder="Enter IP addresses separated by commas (e.g., 192.168.1.1, 10.0.0.1)"
                  rows={2}
                  data-testid="input-ip-whitelist"
                />
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
          </ScrollArea>
          <DialogFooter className="mt-4">
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
