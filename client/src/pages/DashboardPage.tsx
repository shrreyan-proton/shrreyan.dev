import { StatsCard } from "@/components/StatsCard";
import { Key, Users, CheckCircle, XCircle } from "lucide-react";
import { LicenseTable, type License } from "@/components/LicenseTable";

// TODO: Remove mock functionality
const mockLicenses: License[] = [
  {
    id: "1",
    key: "DISC-A1B2-C3D4-E5F6",
    userId: "user1",
    userName: "John Doe",
    status: "active",
    createdAt: "2024-01-15",
    expiresAt: "2025-01-15",
  },
  {
    id: "2",
    key: "DISC-G7H8-I9J0-K1L2",
    status: "active",
    createdAt: "2024-02-20",
    expiresAt: "2025-02-20",
  },
  {
    id: "3",
    key: "DISC-M3N4-O5P6-Q7R8",
    userId: "user2",
    userName: "Jane Smith",
    status: "expired",
    createdAt: "2023-06-10",
    expiresAt: "2024-06-10",
  },
  {
    id: "4",
    key: "DISC-S9T0-U1V2-W3X4",
    userId: "user3",
    userName: "Bob Wilson",
    status: "active",
    createdAt: "2024-03-05",
    expiresAt: "2025-03-05",
  },
  {
    id: "5",
    key: "DISC-Y5Z6-A7B8-C9D0",
    status: "suspended",
    createdAt: "2024-01-25",
    expiresAt: "2025-01-25",
  },
];

export default function DashboardPage() {
  const totalLicenses = mockLicenses.length;
  const activeLicenses = mockLicenses.filter((l) => l.status === "active").length;
  const expiredLicenses = mockLicenses.filter((l) => l.status === "expired").length;
  const totalUsers = 8;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold" data-testid="text-page-title">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Overview of your license management system</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
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
          licenses={mockLicenses}
          onEdit={(license) => console.log("Edit license:", license)}
          onDelete={(license) => console.log("Delete license:", license)}
        />
      </div>
    </div>
  );
}
