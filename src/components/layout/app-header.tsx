"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Plus,
  BarChart3,
  Settings,
  Bell,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Analytics", href: "#analytics", icon: BarChart3 },
  { label: "Settings", href: "#settings", icon: Settings },
];

export function AppHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-vypr-navy/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-6">
        {/* Logo + Nav */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5">
            <Image
              src="/logo.png"
              alt="Vypr"
              width={120}
              height={32}
              className="h-8 w-auto"
              priority
            />
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "gap-2 text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground",
                      isActive &&
                        "text-foreground bg-white/[0.06]"
                    )}
                  >
                    <Icon className="size-4" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-muted-foreground hover:text-foreground"
          >
            <Search className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-muted-foreground hover:text-foreground"
          >
            <Bell className="size-4" />
          </Button>

          <div className="mx-2 h-6 w-px bg-white/[0.08]" />

          <Link href="/projects/new">
            <Button
              size="sm"
              className="gap-2 bg-vypr-teal text-vypr-navy font-semibold hover:bg-vypr-teal/90 shadow-[0_0_12px_rgba(0,214,198,0.2)]"
            >
              <Plus className="size-4" />
              New Project
            </Button>
          </Link>

          {/* User avatar placeholder */}
          <div className="ml-1 flex size-8 items-center justify-center rounded-full bg-vypr-teal/20 text-xs font-semibold text-vypr-teal">
            AW
          </div>
        </div>
      </div>
    </header>
  );
}
