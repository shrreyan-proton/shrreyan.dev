import { useState } from "react";
import { UserTable, type User } from "@/components/UserTable";
import { CreateUserDialog } from "@/components/CreateUserDialog";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

// TODO: Remove mock functionality
const mockUsers: User[] = [
  {
    id: "1",
    email: "shrreyangO@gmail.com",
    discordId: "123456789",
    discordUsername: "shrreyangO",
    isAdmin: true,
    licensesCount: 5,
    joinedAt: "2024-01-01",
  },
  {
    id: "2",
    email: "john.doe@example.com",
    discordId: "987654321",
    discordUsername: "johndoe",
    isAdmin: false,
    licensesCount: 2,
    joinedAt: "2024-02-15",
  },
  {
    id: "3",
    email: "jane.smith@example.com",
    discordId: "456789123",
    discordUsername: "janesmith",
    isAdmin: false,
    licensesCount: 1,
    joinedAt: "2024-03-10",
  },
  {
    id: "4",
    email: "bob.wilson@example.com",
    isAdmin: false,
    licensesCount: 1,
    joinedAt: "2024-03-20",
  },
  {
    id: "5",
    email: "alice.johnson@example.com",
    discordId: "789123456",
    discordUsername: "alicejohnson",
    isAdmin: false,
    licensesCount: 1,
    joinedAt: "2024-04-05",
  },
  {
    id: "6",
    email: "charlie.brown@example.com",
    discordId: "321654987",
    discordUsername: "charliebrown",
    isAdmin: false,
    licensesCount: 1,
    joinedAt: "2024-05-12",
  },
  {
    id: "7",
    email: "david.lee@example.com",
    isAdmin: false,
    licensesCount: 0,
    joinedAt: "2024-06-01",
  },
  {
    id: "8",
    email: "emma.white@example.com",
    discordId: "654987321",
    discordUsername: "emmawhite",
    isAdmin: false,
    licensesCount: 0,
    joinedAt: "2024-06-15",
  },
];

export default function UsersPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredUsers = mockUsers.filter(
    (user) =>
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.discordUsername?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-semibold" data-testid="text-page-title">Users</h1>
          <p className="text-muted-foreground mt-1">Manage all users and their permissions</p>
        </div>
        <CreateUserDialog onSubmit={(data) => console.log("Create:", data)} />
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
          data-testid="input-search"
        />
      </div>

      <UserTable
        users={filteredUsers}
        onEdit={(user) => console.log("Edit user:", user)}
        onDelete={(user) => console.log("Delete user:", user)}
      />
    </div>
  );
}
