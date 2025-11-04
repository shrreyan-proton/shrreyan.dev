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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Trash2, RotateCcw } from "lucide-react";

export type License = {
  id: string;
  key: string;
  userId?: string;
  userName?: string;
  status: "active" | "expired" | "suspended";
  createdAt: string;
  expiresAt: string;
  guildId?: string;
  activatedAt?: string;
  lastHeartbeat?: string;
  lastIpAddress?: string;
};

interface LicenseTableProps {
  licenses: License[];
  onEdit?: (license: License) => void;
  onDelete?: (license: License) => void;
  onReset?: (license: License) => void;
}

const statusColors = {
  active: "bg-green-500/10 text-green-500 border-green-500/20",
  expired: "bg-gray-500/10 text-gray-500 border-gray-500/20",
  suspended: "bg-red-500/10 text-red-500 border-red-500/20",
};

export function LicenseTable({ licenses, onEdit, onDelete, onReset }: LicenseTableProps) {
  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>License Key</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Guild ID</TableHead>
            <TableHead>Last Heartbeat</TableHead>
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
              <TableCell className="text-sm text-muted-foreground font-mono">
                {license.guildId ? (
                  <div className="flex flex-col gap-1">
                    <span>{license.guildId}</span>
                    {license.activatedAt && (
                      <span className="text-xs">
                        Activated: {new Date(license.activatedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="text-muted-foreground/50">Not bound</span>
                )}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {license.lastHeartbeat ? (
                  <div className="flex flex-col gap-1">
                    <span>{new Date(license.lastHeartbeat).toLocaleString()}</span>
                    {license.lastIpAddress && (
                      <span className="text-xs font-mono">{license.lastIpAddress}</span>
                    )}
                  </div>
                ) : (
                  <span className="text-muted-foreground/50">Never</span>
                )}
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
                    {license.guildId && onReset && (
                      <DropdownMenuItem
                        onClick={() => onReset?.(license)}
                        data-testid={`button-reset-${license.id}`}
                      >
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Reset Binding
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
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
