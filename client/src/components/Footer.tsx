import { Link } from "wouter";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-background">
      <div className="container max-w-7xl mx-auto px-6 py-6">
        <div className="flex flex-col items-center gap-3 text-sm">
          <div className="font-semibold text-foreground">
            Crimson Studios
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 text-muted-foreground">
            <Link href="/products" data-testid="link-footer-products">
              <span className="hover:text-foreground transition-colors cursor-pointer">Products</span>
            </Link>
            <span className="text-muted-foreground/40">•</span>
            <a href="#about" className="hover:text-foreground transition-colors" data-testid="link-footer-about">
              About Us
            </a>
            <span className="text-muted-foreground/40">•</span>
            <a href="#contact" className="hover:text-foreground transition-colors" data-testid="link-footer-contact">
              Contact
            </a>
            <span className="text-muted-foreground/40">•</span>
            <a href="#documentation" className="hover:text-foreground transition-colors" data-testid="link-footer-documentation">
              Documentation
            </a>
            <span className="text-muted-foreground/40">•</span>
            <a href="#support" className="hover:text-foreground transition-colors" data-testid="link-footer-support">
              Support
            </a>
          </div>
          <div className="text-muted-foreground" data-testid="text-copyright">
            &copy; {currentYear} Crimson Studios. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
