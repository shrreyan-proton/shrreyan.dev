import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, AlertTriangle, Mail, MailX, Calendar, Server } from "lucide-react";
import { format } from "date-fns";

interface Violation {
  _id: string;
  licenseKey: string;
  violationType: string;
  attemptedGuildId: string;
  attemptedGuildName?: string;
  currentGuildId?: string;
  ipAddress?: string;
  emailSent: boolean;
  createdAt: string;
  userId?: {
    username: string;
    email: string;
  };
  licenseId?: {
    key: string;
    productName: string;
  };
}

export default function ViolationsPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: violations = [], isLoading } = useQuery<Violation[]>({
    queryKey: ["/api/violations"],
  });

  const { data: stats } = useQuery<any>({
    queryKey: ["/api/violations/stats"],
  });

  const filteredViolations = violations.filter(
    (v) =>
      v.licenseKey?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.attemptedGuildId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.userId?.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getViolationTypeLabel = (type: string) => {
    switch (type) {
      case "max_activations_exceeded":
        return "Max Activations Exceeded";
      case "expired_license":
        return "Expired License";
      case "suspended_license":
        return "Suspended License";
      case "invalid_license":
        return "Invalid License";
      default:
        return type;
    }
  };

  const getViolationColor = (type: string) => {
    switch (type) {
      case "max_activations_exceeded":
        return "bg-orange-500/10 text-orange-500 border-orange-500/20";
      case "expired_license":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      case "suspended_license":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "invalid_license":
        return "bg-gray-500/10 text-gray-500 border-gray-500/20";
      default:
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold" data-testid="text-page-title">License Violations</h1>
        <p className="text-muted-foreground mt-1">Monitor unauthorized license usage attempts</p>
      </div>

      {stats && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Violations</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold" data-testid="text-total-violations">
                {stats.total || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Last 24 Hours</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold" data-testid="text-last-24h">
                {stats.last24Hours || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Last 7 Days</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold" data-testid="text-last-7d">
                {stats.last7Days || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Emails Sent</CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold" data-testid="text-emails-sent">
                {violations.filter(v => v.emailSent).length}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by license key, guild ID, or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
          data-testid="input-search"
        />
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Loading violations...</div>
      ) : filteredViolations.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertTriangle className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-lg font-medium">No violations found</p>
            <p className="text-sm text-muted-foreground">
              {searchQuery ? "Try adjusting your search" : "All licenses are being used correctly"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredViolations.map((violation) => (
            <Card key={violation._id} className="hover-elevate" data-testid={`card-violation-${violation._id}`}>
              <CardHeader>
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <CardTitle className="text-lg">
                        License: {violation.licenseKey}
                      </CardTitle>
                      <Badge className={getViolationColor(violation.violationType)}>
                        {getViolationTypeLabel(violation.violationType)}
                      </Badge>
                      {violation.emailSent ? (
                        <Badge variant="outline" className="gap-1">
                          <Mail className="h-3 w-3" />
                          Email Sent
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="gap-1 text-muted-foreground">
                          <MailX className="h-3 w-3" />
                          No Email
                        </Badge>
                      )}
                    </div>
                    <CardDescription>
                      {violation.userId?.email || "Unknown user"} • {format(new Date(violation.createdAt), "PPp")}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Server className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Attempted Server</span>
                    </div>
                    <div className="pl-6 space-y-1">
                      <p className="text-sm text-muted-foreground">
                        ID: <code className="text-xs bg-muted px-1 py-0.5 rounded">{violation.attemptedGuildId}</code>
                      </p>
                      {violation.attemptedGuildName && (
                        <p className="text-sm text-muted-foreground">Name: {violation.attemptedGuildName}</p>
                      )}
                    </div>
                  </div>

                  {violation.currentGuildId && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Server className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Current Server</span>
                      </div>
                      <div className="pl-6">
                        <p className="text-sm text-muted-foreground">
                          ID: <code className="text-xs bg-muted px-1 py-0.5 rounded">{violation.currentGuildId}</code>
                        </p>
                      </div>
                    </div>
                  )}

                  {violation.ipAddress && (
                    <div className="space-y-2">
                      <span className="text-sm font-medium">IP Address</span>
                      <p className="text-sm text-muted-foreground">
                        <code className="text-xs bg-muted px-1 py-0.5 rounded">{violation.ipAddress}</code>
                      </p>
                    </div>
                  )}

                  {violation.licenseId?.productName && (
                    <div className="space-y-2">
                      <span className="text-sm font-medium">Product</span>
                      <p className="text-sm text-muted-foreground">{violation.licenseId.productName}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
