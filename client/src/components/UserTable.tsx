import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Trash2, Shield } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export type User = {
  id: string;
  email: string;
  discordId?: string;
  discordUsername?: string;
  isAdmin: boolean;
  licensesCount: number;
  joinedAt: string;
};

interface UserTableProps {
  users: User[];
  onEdit?: (user: User) => void;
  onDelete?: (user: User) => void;
}

export function UserTable({ users, onEdit, onDelete }: UserTableProps) {
  const getInitials = (email: string, username?: string) => {
    if (username) {
      return username.slice(0, 2).toUpperCase();
    }
    return email.slice(0, 2).toUpperCase();
  };

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Discord</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Licenses</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id} data-testid={`row-user-${user.id}`}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.email}`} />
                    <AvatarFallback>{getInitials(user.email, user.discordUsername)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium" data-testid={`text-email-${user.id}`}>{user.email}</div>
                  </div>
                </div>
              </TableCell>
              <TableCell data-testid={`text-discord-${user.id}`}>
                {user.discordUsername ? (
                  <span className="text-sm">{user.discordUsername}</span>
                ) : (
                  <span className="text-sm text-muted-foreground">Not linked</span>
                )}
              </TableCell>
              <TableCell>
                {user.isAdmin ? (
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                    <Shield className="h-3 w-3 mr-1" />
                    Admin
                  </Badge>
                ) : (
                  <Badge variant="outline">User</Badge>
                )}
              </TableCell>
              <TableCell data-testid={`text-licenses-${user.id}`}>
                <span className="font-medium">{user.licensesCount}</span>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {new Date(user.joinedAt).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      data-testid={`button-actions-${user.id}`}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => onEdit?.(user)}
                      data-testid={`button-edit-${user.id}`}
                    >
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onDelete?.(user)}
                      className="text-destructive"
                      data-testid={`button-delete-${user.id}`}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
