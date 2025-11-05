import { useState } from "react";
import { LicenseTable } from "@/components/LicenseTable";
import { CreateLicenseDialog } from "@/components/CreateLicenseDialog";
import { EditLicenseDialog } from "@/components/EditLicenseDialog";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function LicensesPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [editingLicense, setEditingLicense] = useState<any | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const { data: licenses = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/licenses"],
  });

  const createLicenseMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/licenses/admin", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/licenses"] });
      toast({
        title: "Success",
        description: "License created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create license",
        variant: "destructive",
      });
    },
  });

  const deleteLicenseMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("DELETE", `/api/licenses/${id}`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/licenses"] });
      toast({
        title: "Success",
        description: "License deleted successfully",
      });
    },
  });

  const resetLicenseMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("POST", `/api/licenses/${id}/reset`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/licenses"] });
      toast({
        title: "Success",
        description: "License binding reset successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to reset license",
        variant: "destructive",
      });
    },
  });

  const editLicenseMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await apiRequest("PATCH", `/api/licenses/${id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/licenses"] });
      toast({
        title: "Success",
        description: "License updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update license",
        variant: "destructive",
      });
    },
  });

  const filteredLicenses = licenses.filter(
    (license) =>
      license.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
      license.userName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-semibold" data-testid="text-page-title">Licenses</h1>
          <p className="text-muted-foreground mt-1">Manage all Discord bot licenses</p>
        </div>
        <CreateLicenseDialog onSubmit={(data) => createLicenseMutation.mutate(data)} />
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search licenses..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
          data-testid="input-search"
        />
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Loading...</div>
      ) : (
        <LicenseTable
          licenses={filteredLicenses}
          onEdit={(license) => {
            setEditingLicense(license);
            setEditDialogOpen(true);
          }}
          onDelete={(license) => deleteLicenseMutation.mutate(license.id)}
          onReset={(license) => resetLicenseMutation.mutate(license.id)}
        />
      )}

      <EditLicenseDialog
        license={editingLicense}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSubmit={(data) => {
          if (editingLicense) {
            editLicenseMutation.mutate({ id: editingLicense.id, data });
          }
        }}
      />
    </div>
  );
}
