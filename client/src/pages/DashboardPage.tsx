import { StatsCard } from "@/components/StatsCard";
import { Key, Users, CheckCircle, XCircle } from "lucide-react";
import { LicenseTable } from "@/components/LicenseTable";
import { useQuery } from "@tanstack/react-query";

export default function DashboardPage() {
  const { data: licenses = [] } = useQuery<any[]>({
    queryKey: ["/api/licenses"],
  });

  const { data: users = [] } = useQuery<any[]>({
    queryKey: ["/api/users"],
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
          onEdit={(license) => console.log("Edit license:", license)}
          onDelete={(license) => console.log("Delete license:", license)}
        />
      </div>
    </div>
  );
}
