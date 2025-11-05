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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Check, ChevronsUpDown } from "lucide-react";
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

interface EditLicenseDialogProps {
  license: any | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
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

export function EditLicenseDialog({ license, open, onOpenChange, onSubmit }: EditLicenseDialogProps) {
  const [userPopoverOpen, setUserPopoverOpen] = useState(false);
  const [formData, setFormData] = useState({
    userId: "",
    status: "active",
    productName: "Crim Tickets",
    productDownloadUrl: "",
    maxActivations: "1",
    discordUserId: "",
    note: "",
    expiresAt: "",
  });

  const { data: users = [], isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ["/api/users"],
    enabled: open,
  });

  // Pre-fill form when license changes
  useEffect(() => {
    if (license) {
      setFormData({
        userId: license.userId || "",
        status: license.status || "active",
        productName: license.productName || "Crim Tickets",
        productDownloadUrl: license.productDownloadUrl || "",
        maxActivations: String(license.maxActivations || 1),
        discordUserId: license.discordUserId || "",
        note: license.note || "",
        expiresAt: license.expiresAt ? new Date(license.expiresAt).toISOString().split('T')[0] : "",
      });
    }
  }, [license]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      maxActivations: parseInt(formData.maxActivations),
      userId: formData.userId || undefined,
      productDownloadUrl: formData.productDownloadUrl || undefined,
      discordUserId: formData.discordUserId || undefined,
      note: formData.note || undefined,
      expiresAt: formData.expiresAt ? new Date(formData.expiresAt).toISOString() : undefined,
    };
    onSubmit?.(submitData);
    onOpenChange(false);
  };

  if (!license) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl" data-testid="dialog-edit-license">
        <DialogHeader>
          <DialogTitle>Edit License</DialogTitle>
          <DialogDescription>
            Update license settings for {license.key}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-key">License Key (Read Only)</Label>
              <Input
                id="edit-key"
                value={license.key}
                disabled
                className="font-mono bg-muted"
                data-testid="input-license-key-readonly"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-productName">Product</Label>
                <Select
                  value={formData.productName}
                  onValueChange={(value) =>
                    setFormData({ ...formData, productName: value })
                  }
                >
                  <SelectTrigger id="edit-productName" data-testid="select-product-name">
                    <SelectValue placeholder="Select product" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Crim Tickets">Crim Tickets</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) =>
                    setFormData({ ...formData, status: value })
                  }
                >
                  <SelectTrigger id="edit-status" data-testid="select-status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-expiresAt">Expiration Date</Label>
              <Input
                id="edit-expiresAt"
                type="date"
                value={formData.expiresAt}
                onChange={(e) =>
                  setFormData({ ...formData, expiresAt: e.target.value })
                }
                data-testid="input-expires-at"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-productDownloadUrl">Product Download URL (Optional)</Label>
              <Input
                id="edit-productDownloadUrl"
                type="url"
                value={formData.productDownloadUrl}
                onChange={(e) =>
                  setFormData({ ...formData, productDownloadUrl: e.target.value })
                }
                placeholder="https://example.com/product.zip"
                data-testid="input-product-download-url"
              />
              <p className="text-xs text-muted-foreground">
                Users will be able to download the product from this URL
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-maxActivations">Max Activations</Label>
                <Input
                  id="edit-maxActivations"
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
                <Label htmlFor="edit-discordUserId">Discord User ID (Optional)</Label>
                <Input
                  id="edit-discordUserId"
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
              <Label htmlFor="edit-user">Assign to User (Optional)</Label>
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
              <Label htmlFor="edit-note">Admin Notes (Optional)</Label>
              <Textarea
                id="edit-note"
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
              onClick={() => onOpenChange(false)}
              data-testid="button-cancel"
            >
              Cancel
            </Button>
            <Button type="submit" data-testid="button-submit">
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
