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
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";

export type License = {
  id: string;
  key: string;
  userId?: string;
  userName?: string;
  status: "active" | "expired" | "suspended";
  createdAt: string;
  expiresAt: string;
};

interface LicenseTableProps {
  licenses: License[];
  onEdit?: (license: License) => void;
  onDelete?: (license: License) => void;
}

const statusColors = {
  active: "bg-green-500/10 text-green-500 border-green-500/20",
  expired: "bg-gray-500/10 text-gray-500 border-gray-500/20",
  suspended: "bg-red-500/10 text-red-500 border-red-500/20",
};

export function LicenseTable({ licenses, onEdit, onDelete }: LicenseTableProps) {
  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>License Key</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Expires</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {licenses.map((license) => (
            <TableRow key={license.id} data-testid={`row-license-${license.id}`}>
              <TableCell className="font-mono text-sm" data-testid={`text-license-key-${license.id}`}>
                {license.key}
              </TableCell>
              <TableCell data-testid={`text-user-${license.id}`}>
                {license.userName || "Unassigned"}
              </TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={statusColors[license.status]}
                  data-testid={`badge-status-${license.id}`}
                >
                  <div className="h-1.5 w-1.5 rounded-full bg-current mr-1.5" />
                  {license.status}
                </Badge>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {new Date(license.createdAt).toLocaleDateString()}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {new Date(license.expiresAt).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      data-testid={`button-actions-${license.id}`}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => onEdit?.(license)}
                      data-testid={`button-edit-${license.id}`}
                    >
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onDelete?.(license)}
                      className="text-destructive"
                      data-testid={`button-delete-${license.id}`}
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
