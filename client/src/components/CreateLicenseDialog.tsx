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
    maxActivations: "1",
    discordServerId: "",
    note: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      duration: parseInt(formData.duration),
      maxActivations: parseInt(formData.maxActivations),
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
      maxActivations: "1",
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
