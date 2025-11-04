import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Key, Sparkles, Copy, Check } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

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

export default function MyLicensesPage() {
  const { toast } = useToast();
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    key: "",
    duration: "999",
    productName: "Crim Tickets",
    maxActivations: "1",
  });

  const { data: licenses = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/licenses/my"],
  });

  const createLicenseMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/licenses", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/licenses/my"] });
      toast({
        title: "Success",
        description: "License key generated successfully",
      });
      setFormData({
        key: "",
        duration: "999",
        productName: "Crim Tickets",
        maxActivations: "1",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to generate license",
        variant: "destructive",
      });
    },
  });

  const handleGenerate = () => {
    setFormData({ ...formData, key: generateLicenseKey() });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.key) {
      toast({
        title: "Validation Error",
        description: "Please generate a license key first",
        variant: "destructive",
      });
      return;
    }

    const submitData = {
      key: formData.key,
      duration: parseInt(formData.duration),
      maxActivations: parseInt(formData.maxActivations),
      productName: formData.productName,
    };
    
    createLicenseMutation.mutate(submitData);
  };

  const handleCopy = async (key: string) => {
    try {
      await navigator.clipboard.writeText(key);
      setCopiedKey(key);
      toast({
        title: "Copied",
        description: "License key copied to clipboard",
      });
      setTimeout(() => setCopiedKey(null), 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500/10 text-green-500 border-green-500/20" data-testid="badge-active">Active</Badge>;
      case "expired":
        return <Badge className="bg-red-500/10 text-red-500 border-red-500/20" data-testid="badge-expired">Expired</Badge>;
      default:
        return <Badge variant="outline" data-testid="badge-inactive">Inactive</Badge>;
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold" data-testid="text-page-title">My Licenses</h1>
        <p className="text-muted-foreground mt-1">Generate and manage your license keys</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Generate New License</CardTitle>
          <CardDescription>
            Create a new license key for Crim Tickets
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
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

            <Button type="submit" disabled={createLicenseMutation.isPending} data-testid="button-create-license">
              <Key className="h-4 w-4 mr-2" />
              {createLicenseMutation.isPending ? "Generating..." : "Generate License"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>My License Keys</CardTitle>
          <CardDescription>
            All your generated license keys
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : licenses.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No licenses yet. Generate your first license key above.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>License Key</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {licenses.map((license) => (
                  <TableRow key={license.id} data-testid={`row-license-${license.id}`}>
                    <TableCell className="font-mono text-sm" data-testid="text-license-key">{license.key}</TableCell>
                    <TableCell data-testid="text-product-name">{license.productName}</TableCell>
                    <TableCell>{getStatusBadge(license.status)}</TableCell>
                    <TableCell data-testid="text-created-date">
                      {license.createdAt ? format(new Date(license.createdAt), "MMM d, yyyy") : "N/A"}
                    </TableCell>
                    <TableCell data-testid="text-expiry-date">
                      {license.expiryDate ? format(new Date(license.expiryDate), "MMM d, yyyy") : "Never"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopy(license.key)}
                        data-testid={`button-copy-${license.id}`}
                      >
                        {copiedKey === license.key ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
