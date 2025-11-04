import { LicenseTable } from "../LicenseTable";

const mockLicenses = [
  {
    id: "1",
    key: "XXXX-YYYY-ZZZZ-1234",
    userId: "user1",
    userName: "John Doe",
    status: "active" as const,
    createdAt: "2024-01-15",
    expiresAt: "2025-01-15",
  },
  {
    id: "2",
    key: "XXXX-YYYY-ZZZZ-5678",
    status: "expired" as const,
    createdAt: "2023-06-20",
    expiresAt: "2024-06-20",
  },
  {
    id: "3",
    key: "XXXX-YYYY-ZZZZ-9012",
    userId: "user2",
    userName: "Jane Smith",
    status: "suspended" as const,
    createdAt: "2024-03-10",
    expiresAt: "2025-03-10",
  },
];

export default function LicenseTableExample() {
  return (
    <LicenseTable
      licenses={mockLicenses}
      onEdit={(license) => console.log("Edit license:", license)}
      onDelete={(license) => console.log("Delete license:", license)}
    />
  );
}
