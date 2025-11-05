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
import { Card, CardContent } from "@/components/ui/card";

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
    <>
      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {licenses.map((license) => (
          <Card key={license.id} data-testid={`row-license-${license.id}`}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex-1 min-w-0">
                  <div className="font-mono text-sm font-medium mb-1 truncate" data-testid={`text-license-key-${license.id}`}>
                    {license.key}
                  </div>
                  <div className="text-sm text-muted-foreground" data-testid={`text-user-${license.id}`}>
                    {license.userName || "Unassigned"}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Badge
                    variant="outline"
                    className={statusColors[license.status]}
                    data-testid={`badge-status-${license.id}`}
                  >
                    <div className="h-1.5 w-1.5 rounded-full bg-current mr-1.5" />
                    {license.status}
                  </Badge>
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
                </div>
              </div>
              <div className="space-y-3 text-sm">
                <div>
                  <div className="text-muted-foreground text-xs mb-1">Guild ID</div>
                  {license.guildId ? (
                    <div className="space-y-1">
                      <div className="font-mono text-sm">{license.guildId}</div>
                      {license.activatedAt && (
                        <div className="text-xs text-muted-foreground">
                          Activated: {new Date(license.activatedAt).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-muted-foreground/50">Not bound</div>
                  )}
                </div>
                <div>
                  <div className="text-muted-foreground text-xs mb-1">Last Heartbeat</div>
                  {license.lastHeartbeat ? (
                    <div className="space-y-1">
                      <div>{new Date(license.lastHeartbeat).toLocaleString()}</div>
                      {license.lastIpAddress && (
                        <div className="text-xs font-mono text-muted-foreground">{license.lastIpAddress}</div>
                      )}
                    </div>
                  ) : (
                    <div className="text-muted-foreground/50">Never</div>
                  )}
                </div>
                <div>
                  <div className="text-muted-foreground text-xs mb-1">Expires</div>
                  <div className="text-muted-foreground">
                    {new Date(license.expiresAt).toLocaleDateString()}
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
    </>
  );
}
