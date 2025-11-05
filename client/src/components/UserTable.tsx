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
import { MoreHorizontal, Pencil, Trash2, Shield, User as UserIcon, Crown, Briefcase } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";

export type User = {
  id: string;
  email: string;
  username?: string;
  discordId?: string;
  discordUsername?: string;
  role: "user" | "customer" | "staff" | "admin" | "founder";
  isAdmin: boolean;
  profilePicture?: string;
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

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "founder":
        return (
          <Badge variant="outline" className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30" data-testid="badge-role-founder">
            <Crown className="h-3 w-3 mr-1 fill-amber-500" />
            Founder
          </Badge>
        );
      case "admin":
        return (
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20" data-testid="badge-role-admin">
            <Shield className="h-3 w-3 mr-1" />
            Admin
          </Badge>
        );
      case "staff":
        return (
          <Badge variant="outline" className="bg-accent/50 text-accent-foreground border-accent" data-testid="badge-role-staff">
            <Briefcase className="h-3 w-3 mr-1" />
            Staff
          </Badge>
        );
      case "customer":
        return (
          <Badge variant="outline" className="bg-muted/50" data-testid="badge-role-customer">
            <Crown className="h-3 w-3 mr-1" />
            Customer
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" data-testid="badge-role-user">
            <UserIcon className="h-3 w-3 mr-1" />
            User
          </Badge>
        );
    }
  };

  return (
    <>
      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {users.map((user) => (
          <Card key={user.id} data-testid={`row-user-${user.id}`}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <Avatar className="h-10 w-10 flex-shrink-0">
                    {user.profilePicture && (
                      <AvatarImage src={user.profilePicture} alt={user.username || user.email} />
                    )}
                    <AvatarFallback>{getInitials(user.email, user.discordUsername)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate" data-testid={`text-email-${user.id}`}>
                      {user.username || user.email}
                    </div>
                    <div className="text-sm text-muted-foreground" data-testid={`text-discord-${user.id}`}>
                      {user.discordUsername || "Not linked"}
                    </div>
                  </div>
                </div>
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
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-muted-foreground text-xs mb-1">Role</div>
                  {getRoleBadge(user.role)}
                </div>
                <div>
                  <div className="text-muted-foreground text-xs mb-1">Licenses</div>
                  <div className="font-medium" data-testid={`text-licenses-${user.id}`}>{user.licensesCount}</div>
                </div>
                <div className="col-span-2">
                  <div className="text-muted-foreground text-xs mb-1">Joined</div>
                  <div className="text-muted-foreground">
                    {new Date(user.joinedAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block border rounded-md">
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
                      {user.profilePicture && (
                        <AvatarImage src={user.profilePicture} alt={user.username || user.email} />
                      )}
                      <AvatarFallback>{getInitials(user.email, user.discordUsername)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium" data-testid={`text-email-${user.id}`}>
                        {user.username || user.email}
                      </div>
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
                  {getRoleBadge(user.role)}
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
    </>
  );
}
