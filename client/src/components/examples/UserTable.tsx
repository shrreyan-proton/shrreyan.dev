import { UserTable } from "../UserTable";

const mockUsers = [
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
    email: "user@example.com",
    discordUsername: "user123",
    isAdmin: false,
    licensesCount: 2,
    joinedAt: "2024-02-15",
  },
  {
    id: "3",
    email: "another@example.com",
    isAdmin: false,
    licensesCount: 0,
    joinedAt: "2024-03-20",
  },
];

export default function UserTableExample() {
  return (
    <UserTable
      users={mockUsers}
      onEdit={(user) => console.log("Edit user:", user)}
      onDelete={(user) => console.log("Delete user:", user)}
    />
  );
}
