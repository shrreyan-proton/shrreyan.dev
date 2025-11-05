import { useState } from "react";
import { StatsCard } from "@/components/StatsCard";
import { Key, Users, CheckCircle, XCircle } from "lucide-react";
import { LicenseTable } from "@/components/LicenseTable";
import { EditLicenseDialog } from "@/components/EditLicenseDialog";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { usePermissions } from "@/hooks/usePermissions";

export default function DashboardPage() {
  const { toast } = useToast();
  const { can } = usePermissions();
  const [editingLicense, setEditingLicense] = useState<any | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const { data: licenses = [] } = useQuery<any[]>({
    queryKey: ["/api/licenses"],
  });

  const { data: users = [] } = useQuery<any[]>({
    queryKey: ["/api/users"],
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

  const totalLicenses = licenses.length;
  const activeLicenses = licenses.filter((l) => l.status === "active").length;
  const expiredLicenses = licenses.filter((l) => l.status === "expired").length;
  const totalUsers = users.length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold" data-testid="text-page-title">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Overview of your license management system</p>
      </div>

      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Licenses"
          value={totalLicenses}
          icon={Key}
          description={`${activeLicenses} active`}
          testId="card-total-licenses"
        />
        <StatsCard
          title="Active Licenses"
          value={activeLicenses}
          icon={CheckCircle}
          description="Currently in use"
          testId="card-active-licenses"
        />
        <StatsCard
          title="Expired Licenses"
          value={expiredLicenses}
          icon={XCircle}
          description="Need renewal"
          testId="card-expired-licenses"
        />
        <StatsCard
          title="Total Users"
          value={totalUsers}
          icon={Users}
          description="+2 this month"
          testId="card-total-users"
        />
      </div>

      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">Recent Licenses</h2>
          <p className="text-sm text-muted-foreground">Latest license activity</p>
        </div>
        <LicenseTable
          licenses={licenses.slice(0, 5)}
          onEdit={can.editLicense() ? (license) => {
            setEditingLicense(license);
            setEditDialogOpen(true);
          } : undefined}
          onDelete={can.deleteLicense() ? (license) => deleteLicenseMutation.mutate(license.id) : undefined}
          onReset={can.editLicense() ? (license) => resetLicenseMutation.mutate(license.id) : undefined}
        />
      </div>

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
