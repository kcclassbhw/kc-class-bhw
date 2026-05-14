import { Link, useLocation } from "wouter";
import { LayoutDashboard, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdminLayout({ children, title }: { children: React.ReactNode, title: string }) {
  const [location] = useLocation();
  
  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-background">
      <div className="w-64 border-r bg-zinc-50/50 dark:bg-zinc-950/50 p-4 flex flex-col gap-2">
        <div className="font-semibold px-2 mb-4 text-xs text-muted-foreground uppercase tracking-wider">Admin Panel</div>
        <Link href="/admin" className={cn("flex items-center gap-2 px-3 py-2 rounded-md transition-colors", location === "/admin" ? "bg-indigo-100 text-indigo-900 dark:bg-indigo-500/20 dark:text-indigo-300 font-medium" : "hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-600 dark:text-zinc-400")}>
          <LayoutDashboard className="h-4 w-4" /> Overview
        </Link>
        <Link href="/admin/courses" className={cn("flex items-center gap-2 px-3 py-2 rounded-md transition-colors", location.startsWith("/admin/courses") ? "bg-indigo-100 text-indigo-900 dark:bg-indigo-500/20 dark:text-indigo-300 font-medium" : "hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-600 dark:text-zinc-400")}>
          <BookOpen className="h-4 w-4" /> Course Manager
        </Link>
      </div>
      <div className="flex-1 p-8 max-w-7xl mx-auto w-full">
        <h1 className="text-3xl font-bold tracking-tight mb-8">{title}</h1>
        {children}
      </div>
    </div>
  );
}