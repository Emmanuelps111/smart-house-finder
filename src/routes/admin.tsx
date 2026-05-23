import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { toast } from "sonner";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard" },
      { name: "description", content: "Moderate properties and manage users." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

type Property = {
  id: string;
  title: string;
  address: string;
  price: number;
  status: "pending" | "approved" | "rejected";
  landlord_id: string;
  created_at: string;
};

type Profile = {
  id: string;
  full_name: string | null;
  phone: string | null;
  role: "renter" | "landlord" | "admin";
  created_at: string;
};

type AuthState = "loading" | "unauthenticated" | "forbidden" | "ok";

function AdminPage() {
  const [authState, setAuthState] = useState<AuthState>("loading");
  const [pending, setPending] = useState<Property[]>([]);
  const [allProperties, setAllProperties] = useState<Property[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [bookingsCount, setBookingsCount] = useState(0);

  const loadData = useCallback(async () => {
    const [props, allProps, profs, bookings] = await Promise.all([
      supabase
        .from("properties")
        .select("*")
        .eq("status", "pending")
        .order("created_at", { ascending: false }),
      supabase.from("properties").select("id,status"),
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("bookings").select("id", { count: "exact", head: true }),
    ]);
    if (props.data) setPending(props.data as Property[]);
    if (allProps.data) setAllProperties(allProps.data as Property[]);
    if (profs.data) setProfiles(profs.data as Profile[]);
    if (typeof bookings.count === "number") setBookingsCount(bookings.count);
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!active) return;
      if (!userData.user) {
        setAuthState("unauthenticated");
        return;
      }
      const { data: isAdmin } = await supabase.rpc("has_role", {
        _user_id: userData.user.id,
        _role: "admin",
      });
      if (!active) return;
      if (!isAdmin) {
        setAuthState("forbidden");
        return;
      }
      setAuthState("ok");
      await loadData();
    })();
    return () => {
      active = false;
    };
  }, [loadData]);

  const moderate = async (id: string, status: "approved" | "rejected") => {
    const { error } = await supabase
      .from("properties")
      .update({ status })
      .eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(`Property ${status}`);
    setPending((p) => p.filter((x) => x.id !== id));
    setAllProperties((p) =>
      p.map((x) => (x.id === id ? { ...x, status } : x)),
    );
  };

  if (authState === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading…</p>
      </div>
    );
  }
  if (authState === "unauthenticated") {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Sign in required</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              You need to sign in to access the admin dashboard.
            </p>
            <Button asChild>
              <a href="/login.html">Go to login</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  if (authState === "forbidden") {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Access denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Your account does not have admin privileges.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const approvedCount = allProperties.filter((p) => p.status === "approved").length;
  const pendingCount = allProperties.filter((p) => p.status === "pending").length;
  const rejectedCount = allProperties.filter((p) => p.status === "rejected").length;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="mx-auto max-w-6xl px-6 py-6">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Moderate listings and manage users.
          </p>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="moderation">
              Moderation
              {pendingCount > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {pendingCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard label="Total properties" value={allProperties.length} />
              <StatCard label="Pending" value={pendingCount} />
              <StatCard label="Approved" value={approvedCount} />
              <StatCard label="Rejected" value={rejectedCount} />
              <StatCard label="Users" value={profiles.length} />
              <StatCard label="Bookings" value={bookingsCount} />
            </div>
          </TabsContent>

          <TabsContent value="moderation" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Pending properties</CardTitle>
              </CardHeader>
              <CardContent>
                {pending.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No pending properties.
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Address</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pending.map((p) => (
                        <TableRow key={p.id}>
                          <TableCell className="font-medium">{p.title}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {p.address}
                          </TableCell>
                          <TableCell>${p.price}</TableCell>
                          <TableCell className="text-right space-x-2">
                            <Button
                              size="sm"
                              onClick={() => moderate(p.id, "approved")}
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => moderate(p.id, "rejected")}
                            >
                              Reject
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>All users</CardTitle>
              </CardHeader>
              <CardContent>
                {profiles.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No users yet.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Joined</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {profiles.map((u) => (
                        <TableRow key={u.id}>
                          <TableCell className="font-medium">
                            {u.full_name ?? "—"}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {u.phone ?? "—"}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={u.role === "admin" ? "default" : "secondary"}
                            >
                              {u.role}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {new Date(u.created_at).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}
