import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, ExternalLink, Package } from "lucide-react";

interface Product {
  id: string;
  name: string;
  description: string;
  version: string;
  downloadUrl: string;
  redirectUrl?: string;
  category: string;
  status: "available" | "maintenance";
}

const products: Product[] = [
  {
    id: "1",
    name: "Crim Tickets Bot",
    description: "Advanced Discord ticket management system with custom categories, transcripts, and auto-responses.",
    version: "v2.1.0",
    downloadUrl: "https://github.com/your-repo/crim-tickets/releases/latest",
    redirectUrl: "https://discord.com/oauth2/authorize?client_id=YOUR_CLIENT_ID&permissions=8&scope=bot",
    category: "Discord Bot",
    status: "available",
  },
  {
    id: "2",
    name: "Crim Tickets Premium",
    description: "Premium version with advanced analytics, priority support, and custom branding options.",
    version: "v2.1.0 Pro",
    downloadUrl: "https://github.com/your-repo/crim-tickets-pro/releases/latest",
    redirectUrl: "https://discord.com/oauth2/authorize?client_id=YOUR_CLIENT_ID_PRO&permissions=8&scope=bot",
    category: "Discord Bot",
    status: "available",
  },
];

export default function ProductsPage() {
  const handleDownload = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "available":
        return <Badge className="bg-green-500/10 text-green-500 border-green-500/20" data-testid="badge-available">Available</Badge>;
      case "maintenance":
        return <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20" data-testid="badge-maintenance">Maintenance</Badge>;
      default:
        return <Badge variant="outline" data-testid="badge-unknown">Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold" data-testid="text-page-title">Products</h1>
        <p className="text-muted-foreground mt-1">Browse and download available products</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {products.map((product) => (
          <Card key={product.id} data-testid={`card-product-${product.id}`}>
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-md bg-primary/10 flex items-center justify-center">
                    <Package className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-xl" data-testid="text-product-name">{product.name}</CardTitle>
                    <CardDescription data-testid="text-product-version">{product.version}</CardDescription>
                  </div>
                </div>
                {getStatusBadge(product.status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground" data-testid="text-product-description">
                {product.description}
              </p>

              <div className="flex items-center gap-2">
                <Badge variant="outline" data-testid="badge-category">
                  {product.category}
                </Badge>
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <Button
                  onClick={() => handleDownload(product.downloadUrl)}
                  disabled={product.status === "maintenance"}
                  data-testid={`button-download-${product.id}`}
                  className="w-full"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Latest
                </Button>
                
                {product.redirectUrl && (
                  <Button
                    variant="outline"
                    onClick={() => handleDownload(product.redirectUrl!)}
                    disabled={product.status === "maintenance"}
                    data-testid={`button-invite-${product.id}`}
                    className="w-full"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Invite to Discord
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Need Help?</CardTitle>
          <CardDescription>
            Having trouble with downloads or installation?
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Check out our documentation or contact support for assistance with product setup and configuration.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" data-testid="button-documentation">
              <ExternalLink className="h-4 w-4 mr-2" />
              Documentation
            </Button>
            <Button variant="outline" size="sm" data-testid="button-support">
              <ExternalLink className="h-4 w-4 mr-2" />
              Contact Support
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
