"use client";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const navItems = [
  { label: "Home", href: "/" },
  { label: "Companions", href: "/companions" },
  { label: "My Journey", href: "/my-journey" },
];
const NavItems = () => {
  const pathname = usePathname();
  const { user, isLoading, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    window.location.href = "/";
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-4">
        {navItems.map(({ label }) => (
          <Skeleton key={label} className="w-16 h-6" />
        ))}
        <Skeleton className="h-10 w-10 rounded-full" />
      </div>
    );
  }
  return (
    <nav className="flex items-center gap-4">
      {navItems.map(({ label, href }) => (
        <Link
          key={label}
          href={href}
          className={cn(pathname === href && "text-blue-600 font-semibold")}
        >
          {label}
        </Link>
      ))}
      {user ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="rounded-full relative h-8 w-8">
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src="/icons/avatar.svg"
                  alt={user.email || "User"}
                />
                <AvatarFallback>
                  {user.email ? user.email.slice(0, 2).toUpperCase() : "U"}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <div className="p-2">
              <p className="text-sm font-semibold">{user.email || "User"}</p>
            </div>
            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <Link href="/login" className={cn("text-primary font-semibold")}>
          Login
        </Link>
      )}
    </nav>
  );
};

export default NavItems;
