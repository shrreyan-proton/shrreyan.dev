import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, ExternalLink, Package } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Product {
  id: string;
  name: string;
  description: string;
  version: string;
  category: string;
  status: "available" | "maintenance";
}

const products: Product[] = [
  {
    id: "1",
    name: "Crim Ticket Bot",
    description: "Advanced Discord ticket management system with custom categories, transcripts, and auto-responses.",
    version: "v2.1.0",
    category: "Discord Bot",
    status: "available",
  },
];

export default function ProductsPage() {
  const { toast } = useToast();

  const handleBuyNow = () => {
    toast({
      title: "Contact Administrator",
      description: "Please contact an administrator to purchase this product.",
    });
  };

  const handleDocumentation = () => {
    toast({
      title: "Coming Soon",
      description: "Documentation will be available soon.",
    });
  };

  const handleSupport = () => {
    toast({
      title: "Contact Support",
      description: "Please reach out to your administrator for support.",
    });
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

              <div className="pt-2">
                <Button
                  onClick={handleBuyNow}
                  disabled={product.status === "maintenance"}
                  data-testid={`button-buy-${product.id}`}
                  className="w-full"
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Buy Now
                </Button>
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
            <Button variant="outline" size="sm" data-testid="button-documentation" onClick={handleDocumentation}>
              <ExternalLink className="h-4 w-4 mr-2" />
              Documentation
            </Button>
            <Button variant="outline" size="sm" data-testid="button-support" onClick={handleSupport}>
              <ExternalLink className="h-4 w-4 mr-2" />
              Contact Support
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
