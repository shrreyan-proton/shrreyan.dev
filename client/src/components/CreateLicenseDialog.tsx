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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";

interface CreateLicenseDialogProps {
  onSubmit?: (data: any) => void;
}

export function CreateLicenseDialog({ onSubmit }: CreateLicenseDialogProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    userId: "",
    duration: "12",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Creating license:", formData);
    onSubmit?.(formData);
    setOpen(false);
    setFormData({ userId: "", duration: "12" });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button data-testid="button-create-license">
          <Plus className="h-4 w-4 mr-2" />
          Create License
        </Button>
      </DialogTrigger>
      <DialogContent data-testid="dialog-create-license">
        <DialogHeader>
          <DialogTitle>Create New License</DialogTitle>
          <DialogDescription>
            Generate a new license key for a user. The key will be automatically created.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
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
              <Label htmlFor="duration">Duration (months)</Label>
              <Input
                id="duration"
                type="number"
                value={formData.duration}
                onChange={(e) =>
                  setFormData({ ...formData, duration: e.target.value })
                }
                placeholder="12"
                data-testid="input-duration"
              />
            </div>
          </div>
          <DialogFooter>
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
