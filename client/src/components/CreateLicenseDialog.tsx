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
import { Plus, Sparkles, Check, ChevronsUpDown } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";

interface CreateLicenseDialogProps {
  onSubmit?: (data: any) => void;
}

interface User {
  id: string;
  username: string;
  email: string;
  discordId?: string;
  discordUsername?: string;
  isAdmin: boolean;
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
  const [userPopoverOpen, setUserPopoverOpen] = useState(false);
  const [formData, setFormData] = useState({
    key: "",
    userId: "",
    duration: "999",
    productName: "Crim Tickets",
    maxActivations: "1",
    discordUserId: "",
    note: "",
  });

  const { data: users = [], isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ["/api/users"],
    enabled: open,
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
      userId: formData.userId || undefined,
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
              <Popover open={userPopoverOpen} onOpenChange={setUserPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={userPopoverOpen}
                    className="w-full justify-between font-normal"
                    data-testid="select-user"
                  >
                    {formData.userId
                      ? users.find((user) => user.id === formData.userId)?.username || 
                        users.find((user) => user.id === formData.userId)?.email ||
                        "Select user"
                      : "Unassigned"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[400px] p-0">
                  <Command>
                    <CommandInput 
                      placeholder="Search by username, email, or Discord ID..." 
                      data-testid="input-search-user"
                    />
                    <CommandList>
                      <CommandEmpty>
                        {usersLoading ? "Loading users..." : "No users found."}
                      </CommandEmpty>
                      <CommandGroup>
                        <CommandItem
                          value="unassigned"
                          onSelect={() => {
                            setFormData({ ...formData, userId: "" });
                            setUserPopoverOpen(false);
                          }}
                          data-testid="user-option-unassigned"
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              !formData.userId ? "opacity-100" : "opacity-0"
                            )}
                          />
                          <div className="flex flex-col">
                            <span className="font-medium">Unassigned</span>
                            <span className="text-xs text-muted-foreground">
                              No user assigned
                            </span>
                          </div>
                        </CommandItem>
                        {users.map((user) => (
                          <CommandItem
                            key={user.id}
                            value={`${user.username} ${user.email} ${user.discordId || ""} ${user.discordUsername || ""}`}
                            onSelect={() => {
                              setFormData({ ...formData, userId: user.id });
                              setUserPopoverOpen(false);
                            }}
                            data-testid={`user-option-${user.id}`}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                formData.userId === user.id ? "opacity-100" : "opacity-0"
                              )}
                            />
                            <div className="flex flex-col flex-1 min-w-0">
                              <span className="font-medium truncate">
                                {user.username}
                                {user.isAdmin && (
                                  <span className="ml-2 text-xs text-primary">(Admin)</span>
                                )}
                              </span>
                              <span className="text-xs text-muted-foreground truncate">
                                {user.email}
                              </span>
                              {user.discordId && (
                                <span className="text-xs text-muted-foreground truncate font-mono">
                                  Discord: {user.discordUsername || user.discordId}
                                </span>
                              )}
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
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
