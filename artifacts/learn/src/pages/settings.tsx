import React, { useEffect } from "react";
import {
  useGetMe, useUpdateMe, useGetMySubscription, useGetDownloadHistory
} from "@workspace/api-client-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Download, User, Settings as SettingsIcon, CreditCard, ShieldCheck, Sparkles, ArrowUpRight, RefreshCw, Clock, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { format, differenceInDays } from "date-fns";
import { Link } from "wouter";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50),
  bio: z.string().max(160, "Bio must be less than 160 characters").optional(),
});
type ProfileFormValues = z.infer<typeof profileSchema>;

export default function SettingsPage() {
  const { data: me, isLoading: isMeLoading } = useGetMe();
  const updateMeMutation = useUpdateMe();
  const { data: subscription, isLoading: isSubLoading } = useGetMySubscription();
  const { data: downloads, isLoading: isDownloadsLoading } = useGetDownloadHistory();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: "", bio: "" },
  });

  useEffect(() => {
    if (me) form.reset({ name: me.name || "", bio: me.bio || "" });
  }, [me, form]);

  const onSubmit = (data: ProfileFormValues) => {
    updateMeMutation.mutate({ data }, {
      onSuccess: () => toast.success("Profile updated"),
      onError: () => toast.error("Failed to update profile"),
    });
  };

  if (isMeLoading) {
    return (
      <div className="container mx-auto px-4 md:px-6 py-10 max-w-5xl">
        <Skeleton className="h-10 w-56 mb-10 bg-white/[0.05]" />
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 space-y-5">
            <Skeleton className="h-72 w-full rounded-2xl bg-white/[0.05]" />
            <Skeleton className="h-48 w-full rounded-2xl bg-white/[0.05]" />
          </div>
          <div className="lg:w-72 space-y-4">
            <Skeleton className="h-52 w-full rounded-2xl bg-white/[0.05]" />
          </div>
        </div>
      </div>
    );
  }

  const isPremium = subscription?.status === "active";
  const daysLeft = subscription?.currentPeriodEnd
    ? differenceInDays(new Date(subscription.currentPeriodEnd), new Date())
    : null;
  const isExpiringSoon = daysLeft !== null && daysLeft <= 7 && daysLeft >= 0;

  return (
    <div className="container mx-auto px-4 md:px-6 py-10 max-w-5xl">
      {/* Header */}
      <div className="mb-10 flex items-center gap-3">
        <div className="h-11 w-11 glass-card rounded-xl flex items-center justify-center">
          <SettingsIcon className="h-5 w-5 text-foreground/50" />
        </div>
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Account Settings</h1>
          <p className="text-foreground/45 text-sm">Manage your profile, subscription, and download history.</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main column */}
        <div className="flex-1 space-y-5">
          {/* Profile Card */}
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-6">
              <User className="h-4 w-4 text-emerald-500" />
              <h2 className="font-bold text-sm uppercase tracking-wider text-foreground/50">Profile Details</h2>
            </div>

            {/* Avatar row */}
            <div className="flex items-center gap-4 mb-7 p-4 glass-card rounded-xl">
              <Avatar className="h-14 w-14 shrink-0 ring-2 ring-emerald-500/20">
                <AvatarImage src={me?.avatarUrl || ""} />
                <AvatarFallback className="font-bold text-lg bg-gradient-to-br from-emerald-400 to-teal-500 text-white">
                  {me?.name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="font-bold text-base">{me?.name || "—"}</div>
                <div className="text-xs text-foreground/45 font-medium">{me?.email}</div>
                <Badge variant="outline" className="mt-1.5 text-[10px] font-bold border-white/[0.1]">
                  {me?.role === "admin" ? "Admin" : "Student"}
                </Badge>
              </div>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold uppercase tracking-wider text-foreground/50">Full Name</FormLabel>
                    <FormControl>
                      <Input {...field} className="rounded-xl h-11 bg-white/50 dark:bg-white/[0.04] border-black/[0.06] dark:border-white/[0.07]" data-testid="input-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="bio" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold uppercase tracking-wider text-foreground/50">Bio <span className="normal-case font-normal">(optional)</span></FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Tell us a bit about yourself" className="resize-none h-20 rounded-xl bg-white/50 dark:bg-white/[0.04] border-black/[0.06] dark:border-white/[0.07]" data-testid="input-bio" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <Button
                  type="submit"
                  disabled={updateMeMutation.isPending}
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white border-0 rounded-xl font-semibold h-11 px-6 btn-glow"
                  data-testid="button-save-profile"
                >
                  {updateMeMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </form>
            </Form>
          </div>

          {/* Download History */}
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-6">
              <Download className="h-4 w-4 text-emerald-500" />
              <h2 className="font-bold text-sm uppercase tracking-wider text-foreground/50">Download History</h2>
            </div>
            {isDownloadsLoading ? (
              <div className="space-y-2">
                {[1,2].map(i => <Skeleton key={i} className="h-11 w-full rounded-xl bg-white/[0.05]" />)}
              </div>
            ) : downloads && downloads.length > 0 ? (
              <div className="rounded-xl overflow-hidden border border-white/[0.06] dark:border-white/[0.05] divide-y divide-white/[0.05] dark:divide-white/[0.04]">
                {downloads.slice(0, 5).map((d) => (
                  <div key={d.id} className="flex justify-between items-center px-4 py-3 hover:bg-white/[0.03] transition-colors">
                    <span className="text-sm font-medium">{d.resourceTitle}</span>
                    <span className="text-xs text-foreground/35 font-medium">{format(new Date(d.downloadedAt), "MMM d, yyyy")}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 glass-card rounded-xl text-foreground/35 text-sm border-dashed">
                No downloads yet. Explore the resource vault.
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:w-72 space-y-5">
          {/* Subscription */}
          <div className={`glass-card rounded-2xl p-6 ${isPremium ? "gradient-border" : ""}`}>
            <div className="flex items-center gap-2 mb-5">
              <CreditCard className="h-4 w-4 text-emerald-500" />
              <h2 className="font-bold text-sm uppercase tracking-wider text-foreground/50">Subscription</h2>
            </div>
            {isSubLoading ? (
              <Skeleton className="h-20 w-full rounded-xl bg-white/[0.05]" />
            ) : isPremium ? (
              <div className="space-y-4">
                <div className="p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/15">
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="h-4 w-4 text-emerald-500" />
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">Premium Active</span>
                  </div>
                  <div className="text-xs text-foreground/45 font-medium capitalize">{subscription?.plan} plan</div>
                </div>

                {subscription?.currentPeriodEnd && (
                  <div className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium ${
                    isExpiringSoon
                      ? "bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400"
                      : "glass-card text-foreground/50"
                  }`}>
                    {isExpiringSoon ? <AlertCircle className="h-3.5 w-3.5 shrink-0" /> : <Clock className="h-3.5 w-3.5 shrink-0" />}
                    {isExpiringSoon
                      ? `Expires in ${daysLeft} day${daysLeft === 1 ? "" : "s"} — renew now`
                      : `Valid until ${format(new Date(subscription.currentPeriodEnd), "MMM d, yyyy")}`}
                  </div>
                )}

                <Link href="/pricing">
                  <Button
                    variant="outline"
                    className="w-full gap-2 rounded-xl font-semibold border-emerald-500/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 h-10 text-sm"
                    data-testid="button-renew"
                  >
                    <RefreshCw className="h-3.5 w-3.5" /> Renew Subscription
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 glass-card rounded-xl">
                  <div className="font-bold text-sm mb-0.5">Free Tier</div>
                  <div className="text-xs text-foreground/40">Limited access to courses</div>
                </div>
                <Link href="/pricing">
                  <Button className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white border-0 rounded-xl font-semibold h-10 gap-2 btn-glow text-sm">
                    <Sparkles className="h-3.5 w-3.5" /> Subscribe via eSewa
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Admin */}
          {me?.role === "admin" && (
            <div className="glass-card rounded-2xl p-6 text-center">
              <div className="h-12 w-12 glass-card rounded-xl flex items-center justify-center mb-4 mx-auto">
                <ShieldCheck className="h-6 w-6 text-emerald-500" />
              </div>
              <h3 className="font-bold text-sm mb-1">Admin Dashboard</h3>
              <p className="text-xs text-foreground/40 mb-4">Manage courses, lessons, and users.</p>
              <Button asChild className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-0 rounded-xl font-semibold gap-2 text-sm">
                <a href="/admin">Go to Admin <ArrowUpRight className="h-3.5 w-3.5" /></a>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
