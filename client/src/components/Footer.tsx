import { Link } from "wouter";
import { ExternalLink } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-background">
      <div className="container max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl">
          <div>
            <h3 className="text-sm font-semibold mb-3" data-testid="text-footer-heading-company">Company</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/products" data-testid="link-footer-products">
                  <span className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                    Products
                  </span>
                </Link>
              </li>
              <li>
                <a
                  href="#about"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  data-testid="link-footer-about"
                >
                  About Us
                </a>
              </li>
              <li>
                <a
                  href="#contact"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  data-testid="link-footer-contact"
                >
                  Contact
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-3" data-testid="text-footer-heading-support">Support</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="#documentation"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  data-testid="link-footer-documentation"
                >
                  Documentation
                </a>
              </li>
              <li>
                <a
                  href="#faq"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  data-testid="link-footer-faq"
                >
                  FAQ
                </a>
              </li>
              <li>
                <a
                  href="#support"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  data-testid="link-footer-support"
                >
                  Get Support
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t text-center text-sm text-muted-foreground">
          <p data-testid="text-copyright">
            &copy; {currentYear} Shrreyan Dev. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
