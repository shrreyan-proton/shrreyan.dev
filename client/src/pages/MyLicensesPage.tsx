import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Copy, Check, Download, RefreshCw, Package } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export default function MyLicensesPage() {
  const { toast } = useToast();
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const { data: licenses = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/licenses/my"],
  });

  const regenerateMutation = useMutation({
    mutationFn: async (licenseId: string) => {
      const res = await apiRequest("POST", `/api/licenses/${licenseId}/regenerate`, {});
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/licenses/my"] });
      toast({
        title: "Success",
        description: "License key regenerated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to regenerate license key",
        variant: "destructive",
      });
    },
  });

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

  const handleDownload = (downloadUrl: string, productName: string) => {
    window.open(downloadUrl, '_blank');
    toast({
      title: "Download Started",
      description: `Downloading ${productName}`,
    });
  };

  const handleRegenerate = (licenseId: string) => {
    if (confirm("Are you sure you want to regenerate this license key? The old key will no longer work.")) {
      regenerateMutation.mutate(licenseId);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20" data-testid="badge-active">
            <div className="h-1.5 w-1.5 rounded-full bg-current mr-1.5" />
            Active
          </Badge>
        );
      case "expired":
        return (
          <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20" data-testid="badge-expired">
            <div className="h-1.5 w-1.5 rounded-full bg-current mr-1.5" />
            Expired
          </Badge>
        );
      case "suspended":
        return (
          <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20" data-testid="badge-suspended">
            <div className="h-1.5 w-1.5 rounded-full bg-current mr-1.5" />
            Suspended
          </Badge>
        );
      default:
        return <Badge variant="outline" data-testid="badge-inactive">Inactive</Badge>;
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold" data-testid="text-page-title">My Products</h1>
        <p className="text-muted-foreground mt-1">View and manage your licensed products</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Licensed Products
          </CardTitle>
          <CardDescription>
            Products assigned to you with download and license key management
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : licenses.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              You haven't purchased any products yet buy now..
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="md:hidden space-y-4">
                {licenses.map((license) => (
                  <div key={license.id} className="border rounded-md p-4" data-testid={`row-license-${license.id}`}>
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium mb-1" data-testid={`text-product-${license.id}`}>
                          {license.productName}
                        </div>
                        <div className="font-mono text-sm text-muted-foreground truncate" data-testid={`text-key-${license.id}`}>
                          {license.key}
                        </div>
                      </div>
                      {getStatusBadge(license.status)}
                    </div>
                    <div className="text-sm text-muted-foreground mb-3" data-testid={`text-expiry-${license.id}`}>
                      Expires: {license.expiresAt 
                        ? format(new Date(license.expiresAt), "MMM d, yyyy") 
                        : "Never"}
                    </div>
                    <div className="flex items-center gap-2">
                      {license.productDownloadUrl && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownload(license.productDownloadUrl, license.productName)}
                          data-testid={`button-download-${license.id}`}
                          className="flex-1"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopy(license.key)}
                        data-testid={`button-copy-${license.id}`}
                        title="Copy license key"
                      >
                        {copiedKey === license.key ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRegenerate(license.id)}
                        disabled={regenerateMutation.isPending}
                        data-testid={`button-regenerate-${license.id}`}
                        title="Regenerate license key"
                      >
                        <RefreshCw className={`h-4 w-4 ${regenerateMutation.isPending ? 'animate-spin' : ''}`} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>License Key</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Expires</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {licenses.map((license) => (
                      <TableRow key={license.id} data-testid={`row-license-${license.id}`}>
                        <TableCell className="font-medium" data-testid={`text-product-${license.id}`}>
                          {license.productName}
                        </TableCell>
                        <TableCell className="font-mono text-sm" data-testid={`text-key-${license.id}`}>
                          {license.key}
                        </TableCell>
                        <TableCell>{getStatusBadge(license.status)}</TableCell>
                        <TableCell className="text-sm text-muted-foreground" data-testid={`text-expiry-${license.id}`}>
                          {license.expiresAt 
                            ? format(new Date(license.expiresAt), "MMM d, yyyy") 
                            : "Never"}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            {license.productDownloadUrl && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDownload(license.productDownloadUrl, license.productName)}
                                data-testid={`button-download-${license.id}`}
                                title="Download product"
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCopy(license.key)}
                              data-testid={`button-copy-${license.id}`}
                              title="Copy license key"
                            >
                              {copiedKey === license.key ? (
                                <Check className="h-4 w-4" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRegenerate(license.id)}
                              disabled={regenerateMutation.isPending}
                              data-testid={`button-regenerate-${license.id}`}
                              title="Regenerate license key"
                            >
                              <RefreshCw className={`h-4 w-4 ${regenerateMutation.isPending ? 'animate-spin' : ''}`} />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
