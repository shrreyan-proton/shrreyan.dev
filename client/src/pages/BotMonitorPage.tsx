import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Server, 
  Power, 
  PowerOff, 
  ExternalLink, 
  Activity, 
  Clock,
  Copy,
  Eye,
  RefreshCw
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Bot {
  id: string;
  licenseKey: string;
  productName: string;
  guildId?: string;
  guildName?: string;
  guildInviteUrl?: string;
  botVersion?: string;
  status: "online" | "offline" | "shutting_down";
  lastHeartbeat?: string;
  lastIpAddress?: string;
  activatedAt?: string;
  isShutdownRequested?: boolean;
  shutdownReason?: string;
  shutdownRequestedAt?: string;
}

interface BotEvent {
  id: string;
  licenseId: string;
  eventType: string;
  timestamp: string;
  reason?: string;
  metadata?: any;
}

export default function BotMonitorPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [shutdownDialogOpen, setShutdownDialogOpen] = useState(false);
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const [eventsDialogOpen, setEventsDialogOpen] = useState(false);
  const [selectedBot, setSelectedBot] = useState<Bot | null>(null);
  const [shutdownReason, setShutdownReason] = useState("");

  const { data: bots = [], isLoading, refetch } = useQuery<Bot[]>({
    queryKey: ["/api/admin/bots"],
    refetchInterval: 30000, // Auto-refresh every 30 seconds
  });

  const { data: events = [] } = useQuery<BotEvent[]>({
    queryKey: ["/api/admin/bots", selectedBot?.id, "events"],
    enabled: !!selectedBot && eventsDialogOpen,
  });

  const shutdownMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      return apiRequest("POST", `/api/admin/bots/${id}/shutdown`, { reason });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/bots"] });
      setShutdownDialogOpen(false);
      setShutdownReason("");
      toast({
        title: "Shutdown Request Sent",
        description: "The bot will shut down on its next heartbeat check.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to shutdown bot",
        variant: "destructive",
      });
    },
  });

  const clearShutdownMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("POST", `/api/admin/bots/${id}/clear-shutdown`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/bots"] });
      setClearDialogOpen(false);
      toast({
        title: "Shutdown Cleared",
        description: "The bot can now restart normally.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to clear shutdown",
        variant: "destructive",
      });
    },
  });

  const handleShutdown = (bot: Bot) => {
    setSelectedBot(bot);
    setShutdownDialogOpen(true);
  };

  const handleClearShutdown = (bot: Bot) => {
    setSelectedBot(bot);
    setClearDialogOpen(true);
  };

  const handleViewEvents = (bot: Bot) => {
    setSelectedBot(bot);
    setEventsDialogOpen(true);
  };

  const handleCopyInvite = (url?: string) => {
    if (url) {
      navigator.clipboard.writeText(url);
      toast({
        title: "Copied!",
        description: "Discord invite link copied to clipboard",
      });
    }
  };

  const filteredBots = bots.filter(
    (bot) =>
      bot.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bot.guildName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bot.guildId?.includes(searchQuery)
  );

  const onlineBots = bots.filter(b => b.status === "online").length;
  const offlineBots = bots.filter(b => b.status === "offline").length;
  const shuttingDownBots = bots.filter(b => b.status === "shutting_down").length;

  const statusColors = {
    online: "bg-green-500/10 text-green-500 border-green-500/20",
    offline: "bg-gray-500/10 text-gray-500 border-gray-500/20",
    shutting_down: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-semibold" data-testid="text-page-title">
            Bot Monitor
          </h1>
          <p className="text-muted-foreground mt-1">
            Real-time monitoring and control of all running Discord bots
          </p>
        </div>
        <Button
          onClick={() => refetch()}
          variant="outline"
          data-testid="button-refresh"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Online Bots</CardTitle>
            <Activity className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{onlineBots}</div>
            <p className="text-xs text-muted-foreground">
              Active in last 2 minutes
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Offline Bots</CardTitle>
            <PowerOff className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{offlineBots}</div>
            <p className="text-xs text-muted-foreground">
              No recent heartbeat
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Shutting Down</CardTitle>
            <Power className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{shuttingDownBots}</div>
            <p className="text-xs text-muted-foreground">
              Shutdown requested
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Bots</CardTitle>
          <CardDescription>
            All bots that have been activated or have recent heartbeats
          </CardDescription>
          <div className="pt-4">
            <Input
              placeholder="Search by product name, server name, or guild ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              data-testid="input-search"
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading bots...
            </div>
          ) : filteredBots.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No bots found
            </div>
          ) : (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Discord Server</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Seen</TableHead>
                    <TableHead>Version</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBots.map((bot) => (
                    <TableRow key={bot.id} data-testid={`row-bot-${bot.id}`}>
                      <TableCell>
                        <div className="font-medium">{bot.productName}</div>
                        <div className="text-xs text-muted-foreground font-mono">
                          {bot.licenseKey}
                        </div>
                      </TableCell>
                      <TableCell>
                        {bot.guildId ? (
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Server className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">
                                {bot.guildName || "Unknown Server"}
                              </span>
                            </div>
                            <div className="text-xs text-muted-foreground font-mono">
                              ID: {bot.guildId}
                            </div>
                            {bot.guildInviteUrl && (
                              <div className="flex gap-1">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-6 text-xs"
                                  onClick={() => window.open(bot.guildInviteUrl, "_blank")}
                                  data-testid={`button-open-server-${bot.id}`}
                                >
                                  <ExternalLink className="h-3 w-3 mr-1" />
                                  Visit
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-6 text-xs"
                                  onClick={() => handleCopyInvite(bot.guildInviteUrl)}
                                  data-testid={`button-copy-invite-${bot.id}`}
                                >
                                  <Copy className="h-3 w-3 mr-1" />
                                  Copy
                                </Button>
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Not activated</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={statusColors[bot.status]}
                          data-testid={`badge-status-${bot.id}`}
                        >
                          <div className="h-1.5 w-1.5 rounded-full bg-current mr-1.5" />
                          {bot.status.replace("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {bot.lastHeartbeat ? (
                          <div className="text-sm">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3 text-muted-foreground" />
                              {formatDistanceToNow(new Date(bot.lastHeartbeat), {
                                addSuffix: true,
                              })}
                            </div>
                            {bot.lastIpAddress && (
                              <div className="text-xs text-muted-foreground">
                                {bot.lastIpAddress}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Never</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {bot.botVersion || "Unknown"}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleViewEvents(bot)}
                            data-testid={`button-view-events-${bot.id}`}
                            title="View Events"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {bot.isShutdownRequested ? (
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleClearShutdown(bot)}
                              data-testid={`button-clear-shutdown-${bot.id}`}
                              title="Clear Shutdown"
                            >
                              <Power className="h-4 w-4 text-green-500" />
                            </Button>
                          ) : (
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleShutdown(bot)}
                              data-testid={`button-shutdown-${bot.id}`}
                              title="Shutdown Bot"
                            >
                              <PowerOff className="h-4 w-4 text-destructive" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={shutdownDialogOpen} onOpenChange={setShutdownDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Shutdown Bot</AlertDialogTitle>
            <AlertDialogDescription>
              This will send a shutdown request to the bot. The bot will gracefully shut down on its next heartbeat check.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="shutdown-reason">Reason (optional)</Label>
              <Textarea
                id="shutdown-reason"
                placeholder="Enter reason for shutdown..."
                value={shutdownReason}
                onChange={(e) => setShutdownReason(e.target.value)}
                data-testid="input-shutdown-reason"
              />
            </div>
            {selectedBot && (
              <div className="text-sm text-muted-foreground">
                <div><strong>Product:</strong> {selectedBot.productName}</div>
                <div><strong>Server:</strong> {selectedBot.guildName || "Unknown"}</div>
              </div>
            )}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                selectedBot &&
                shutdownMutation.mutate({
                  id: selectedBot.id,
                  reason: shutdownReason,
                })
              }
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-shutdown"
            >
              Shutdown Bot
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={clearDialogOpen} onOpenChange={setClearDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear Shutdown Request</AlertDialogTitle>
            <AlertDialogDescription>
              This will clear the shutdown flag, allowing the bot to restart normally.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {selectedBot && (
            <div className="text-sm space-y-2">
              <div><strong>Product:</strong> {selectedBot.productName}</div>
              <div><strong>Server:</strong> {selectedBot.guildName || "Unknown"}</div>
              {selectedBot.shutdownReason && (
                <div className="p-2 bg-muted rounded">
                  <strong>Shutdown Reason:</strong> {selectedBot.shutdownReason}
                </div>
              )}
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                selectedBot && clearShutdownMutation.mutate(selectedBot.id)
              }
              data-testid="button-confirm-clear"
            >
              Clear Shutdown
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={eventsDialogOpen} onOpenChange={setEventsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Bot Events</DialogTitle>
            <DialogDescription>
              Recent activity and events for {selectedBot?.productName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            {events.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No events recorded
              </div>
            ) : (
              events.map((event) => (
                <div
                  key={event.id}
                  className="p-3 border rounded-md space-y-1"
                  data-testid={`event-${event.id}`}
                >
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">
                      {event.eventType.replace(/_/g, " ")}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(event.timestamp), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                  {event.reason && (
                    <div className="text-sm text-muted-foreground">
                      {event.reason}
                    </div>
                  )}
                  {event.metadata?.triggeredBy && (
                    <div className="text-xs text-muted-foreground">
                      By: {event.metadata.triggeredBy}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
