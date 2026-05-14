import React from "react";
import AdminLayout from "@/components/admin-layout";
import { useGetAdminStats, useListAdminUsers, useListAdminSubscriptions, useUpdateUserRole } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, CreditCard, BookOpen, Video, FileText, TrendingUp, ShieldAlert, Check } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function AdminDashboard() {
  const { data: stats, isLoading: isStatsLoading } = useGetAdminStats();
  const { data: users, isLoading: isUsersLoading, refetch: refetchUsers } = useListAdminUsers();
  const { data: subscriptions, isLoading: isSubsLoading } = useListAdminSubscriptions();
  const updateRoleMutation = useUpdateUserRole();

  const handleRoleChange = (clerkId: string, role: string) => {
    updateRoleMutation.mutate({ clerkId, data: { role } }, {
      onSuccess: () => {
        toast.success(`User role updated to ${role}`);
        refetchUsers();
      },
      onError: () => {
        toast.error("Failed to update user role");
      }
    });
  };

  return (
    <AdminLayout title="Overview">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Users" value={stats?.totalUsers} icon={<Users className="h-4 w-4" />} isLoading={isStatsLoading} />
        <StatCard title="Active Subscriptions" value={stats?.activeSubscriptions} icon={<CreditCard className="h-4 w-4" />} isLoading={isStatsLoading} />
        <StatCard title="Total Courses" value={stats?.totalCourses} icon={<BookOpen className="h-4 w-4" />} isLoading={isStatsLoading} />
        <StatCard title="Monthly Revenue (NPR)" value={`NPR ${(stats?.monthlyRevenue || 0).toLocaleString()}`} icon={<TrendingUp className="h-4 w-4" />} isLoading={isStatsLoading} />
      </div>

      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full max-w-[400px] grid-cols-2 mb-8">
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
        </TabsList>
        
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
            </CardHeader>
            <CardContent>
              {isUsersLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-12 w-full" />)}
                </div>
              ) : (
                <div className="rounded-md border overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-zinc-50 dark:bg-zinc-900 text-muted-foreground">
                      <tr>
                        <th className="px-4 py-3 font-medium">Name</th>
                        <th className="px-4 py-3 font-medium">Email</th>
                        <th className="px-4 py-3 font-medium">Role</th>
                        <th className="px-4 py-3 font-medium">Status</th>
                        <th className="px-4 py-3 font-medium">Joined</th>
                        <th className="px-4 py-3 font-medium text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {users?.map(user => (
                        <tr key={user.clerkId} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50">
                          <td className="px-4 py-3 font-medium">{user.name || "-"}</td>
                          <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
                          <td className="px-4 py-3">
                            <Badge variant={user.role === 'admin' ? 'default' : 'secondary'} className="capitalize">
                              {user.role}
                            </Badge>
                          </td>
                          <td className="px-4 py-3">
                            {user.subscriptionStatus === 'active' ? (
                              <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-0">Premium</Badge>
                            ) : (
                              <span className="text-muted-foreground text-xs uppercase tracking-wider">Free</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">
                            {format(new Date(user.createdAt), "MMM d, yyyy")}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">Edit Role</Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleRoleChange(user.clerkId, "user")}>
                                  Set to User {user.role === "user" && <Check className="ml-auto h-4 w-4" />}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleRoleChange(user.clerkId, "admin")} className="text-red-600 focus:text-red-600">
                                  Set to Admin {user.role === "admin" && <Check className="ml-auto h-4 w-4" />}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="subscriptions">
          <Card>
            <CardHeader>
              <CardTitle>Active Subscriptions</CardTitle>
            </CardHeader>
            <CardContent>
              {isSubsLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
                </div>
              ) : (
                <div className="rounded-md border overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-zinc-50 dark:bg-zinc-900 text-muted-foreground">
                      <tr>
                        <th className="px-4 py-3 font-medium">User</th>
                        <th className="px-4 py-3 font-medium">Plan</th>
                        <th className="px-4 py-3 font-medium">Status</th>
                        <th className="px-4 py-3 font-medium">Expires</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {(subscriptions as any[])?.map(sub => (
                        <tr key={sub.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50">
                          <td className="px-4 py-3">
                            <div className="font-medium text-sm">{sub.userName || "—"}</div>
                            <div className="text-xs text-muted-foreground">{sub.userEmail || sub.userId}</div>
                          </td>
                          <td className="px-4 py-3 capitalize font-medium">{sub.plan}</td>
                          <td className="px-4 py-3">
                            <Badge className={sub.status === 'active' ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-amber-500 hover:bg-amber-600'}>
                              {sub.status}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">
                            {sub.currentPeriodEnd ? format(new Date(sub.currentPeriodEnd), "MMM d, yyyy") : "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
}

function StatCard({ title, value, icon, isLoading }: { title: string, value: string | number | undefined, icon: React.ReactNode, isLoading: boolean }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className="text-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 p-2 rounded-md">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-8 w-20" />
        ) : (
          <div className="text-2xl font-bold">{value || 0}</div>
        )}
      </CardContent>
    </Card>
  );
}