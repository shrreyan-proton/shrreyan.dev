import { useState } from "react";
import { LicenseTable, type License } from "@/components/LicenseTable";
import { CreateLicenseDialog } from "@/components/CreateLicenseDialog";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

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
  {
    id: "6",
    key: "DISC-E1F2-G3H4-I5J6",
    userId: "user4",
    userName: "Alice Johnson",
    status: "active",
    createdAt: "2024-04-12",
    expiresAt: "2025-04-12",
  },
  {
    id: "7",
    key: "DISC-K7L8-M9N0-O1P2",
    status: "expired",
    createdAt: "2023-08-15",
    expiresAt: "2024-08-15",
  },
  {
    id: "8",
    key: "DISC-Q3R4-S5T6-U7V8",
    userId: "user5",
    userName: "Charlie Brown",
    status: "active",
    createdAt: "2024-05-20",
    expiresAt: "2025-05-20",
  },
];

export default function LicensesPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredLicenses = mockLicenses.filter(
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
        <CreateLicenseDialog onSubmit={(data) => console.log("Create:", data)} />
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

      <LicenseTable
        licenses={filteredLicenses}
        onEdit={(license) => console.log("Edit license:", license)}
        onDelete={(license) => console.log("Delete license:", license)}
      />
    </div>
  );
}
