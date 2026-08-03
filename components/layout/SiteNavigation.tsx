"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Container } from "@/components/layout/Container";
import { SiteBrand } from "@/components/layout/SiteBrand";
import { LanguageToggle } from "@/components/ui/LanguageToggle";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { islamChristianityHrefs, primaryNavItems } from "@/lib/navigation";
import { cn } from "@/lib/utils";

export function SiteNavigation() {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isBrowseOpen, setIsBrowseOpen] = useState(false);

  useEffect(() => {
    if (!isMobileOpen && !isBrowseOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsMobileOpen(false);
        setIsBrowseOpen(false);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isBrowseOpen, isMobileOpen]);

  function closeMenus() {
    setIsMobileOpen(false);
    setIsBrowseOpen(false);
  }

  return (
    <>
      <Container className="flex h-14 items-center gap-3 py-2">
        <SiteBrand compact onClick={closeMenus} />
        <HeaderSearch className="hidden min-w-0 max-w-md flex-1 sm:flex" />
        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            className="hidden h-9 items-center justify-center gap-2 rounded-md border border-border bg-card px-3 text-sm font-semibold text-foreground transition hover:bg-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent lg:inline-flex"
            aria-controls="desktop-navigation"
            aria-expanded={isBrowseOpen}
            onClick={() => {
              setIsBrowseOpen((current) => !current);
              setIsMobileOpen(false);
            }}
          >
            {isBrowseOpen ? (
              <X aria-hidden="true" className="h-4 w-4" />
            ) : (
              <Menu aria-hidden="true" className="h-4 w-4" />
            )}
            Browse
          </button>
          <LanguageToggle className="hidden sm:inline-flex" />
          <ThemeToggle className="h-9 w-9" />
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-card text-foreground transition hover:bg-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent lg:hidden"
            aria-controls="mobile-navigation"
            aria-expanded={isMobileOpen}
            aria-label={isMobileOpen ? "Close navigation menu" : "Open navigation menu"}
            onClick={() => {
              setIsMobileOpen((current) => !current);
              setIsBrowseOpen(false);
            }}
          >
            {isMobileOpen ? (
              <X aria-hidden="true" className="h-5 w-5" />
            ) : (
              <Menu aria-hidden="true" className="h-5 w-5" />
            )}
          </button>
        </div>
      </Container>

      <div
        id="desktop-navigation"
        hidden={!isBrowseOpen}
        className={cn("border-t border-border", isBrowseOpen ? "block" : "hidden")}
      >
        <Container className="py-3">
          <nav aria-label="Primary navigation" className="grid gap-1 sm:grid-cols-2 lg:grid-cols-3">
            {primaryNavItems.map((item) => (
              <HeaderLink
                key={item.href}
                href={item.href}
                active={isPrimaryNavActive(pathname, item.href)}
                onClick={() => setIsBrowseOpen(false)}
                panel
              >
                {item.label}
              </HeaderLink>
            ))}
          </nav>
        </Container>
      </div>

      <div
        id="mobile-navigation"
        hidden={!isMobileOpen}
        className={cn("border-t border-border lg:hidden", isMobileOpen ? "block" : "hidden")}
      >
        <Container className="py-4">
          <HeaderSearch className="mb-4 flex sm:hidden" onSubmit={closeMenus} />
          <div className="mb-4 flex items-center justify-between border-b border-border pb-4 sm:hidden">
            <span className="text-sm font-semibold text-foreground">Language</span>
            <LanguageToggle />
          </div>
          <nav aria-label="Mobile navigation" className="grid gap-1">
            {primaryNavItems.map((item) => (
              <HeaderLink
                key={item.href}
                href={item.href}
                active={isPrimaryNavActive(pathname, item.href)}
                onClick={closeMenus}
                mobile
              >
                {item.label}
              </HeaderLink>
            ))}
          </nav>
        </Container>
      </div>
    </>
  );
}

function isPrimaryNavActive(pathname: string, href: string) {
  if (pathname === href) {
    return true;
  }

  if (href === "/islam-christianity") {
    return islamChristianityHrefs.includes(pathname);
  }

  return false;
}

type HeaderLinkProps = {
  href: string;
  active?: boolean;
  mobile?: boolean;
  panel?: boolean;
  onClick?: () => void;
  children: string;
};

function HeaderLink({
  href,
  active = false,
  mobile = false,
  panel = false,
  onClick,
  children,
}: HeaderLinkProps) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      onClick={onClick}
      className={cn(
        "rounded-md px-3 py-2 text-sm font-medium no-underline transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
        "text-muted-foreground hover:bg-muted hover:text-foreground",
        active && "bg-muted text-foreground",
        mobile && "block py-3",
        panel && "block",
      )}
    >
      {children}
    </Link>
  );
}

function HeaderSearch({
  className,
  onSubmit,
}: {
  className?: string;
  onSubmit?: () => void;
}) {
  return (
    <form
      action="/search"
      role="search"
      onSubmit={onSubmit}
      className={cn(
        "items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-muted-foreground no-underline transition hover:bg-muted hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
        className,
      )}
    >
      <Search aria-hidden="true" className="h-4 w-4 shrink-0" />
      <input
        type="search"
        name="q"
        aria-label="Search the library"
        placeholder="Search library..."
        className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
      />
    </form>
  );
}
