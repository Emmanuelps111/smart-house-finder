import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell,
} from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
  description: string | null;
  address: string;
  price: number;
  status: "pending" | "approved" | "rejected";
  occupancy: "vacant" | "occupied";
  landlord_id: string;
  city: string | null;
  neighbourhood: string | null;
  furnishing: string | null;
  beds: number | null;
  baths: number | null;
  size_sqm: number | null;
  deposit_months: number | null;
  available_from: string | null;
  contact_phone: string | null;
  lat: number | null;
  lng: number | null;
  amenities: string[] | null;
  image_urls: string[] | null;
  property_type: string | null;
  created_at: string;
};

type Profile = {
  id: string;
  full_name: string | null;
  phone: string | null;
  national_id: string | null;
  selfie_url: string | null;
  bio: string | null;
  role: "renter" | "landlord" | "admin";
  created_at: string;
};

type AuthState = "loading" | "unauthenticated" | "forbidden" | "ok";

function AdminPage() {
  const [authState, setAuthState] = useState<AuthState>("loading");
  const [allProperties, setAllProperties] = useState<Property[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [bookingsCount, setBookingsCount] = useState(0);
  const [selected, setSelected] = useState<Property | null>(null);
  const [selectedLandlord, setSelectedLandlord] = useState<Profile | null>(null);

  const loadData = useCallback(async () => {
    const [allProps, profs, bookings] = await Promise.all([
      supabase.from("properties").select("*").order("created_at", { ascending: false }),
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("bookings").select("id", { count: "exact", head: true }),
    ]);
    if (allProps.data) setAllProperties(allProps.data as unknown as Property[]);
    if (profs.data) setProfiles(profs.data as unknown as Profile[]);
    if (typeof bookings.count === "number") setBookingsCount(bookings.count);
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!active) return;
      if (!userData.user) { setAuthState("unauthenticated"); return; }
      const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: userData.user.id, _role: "admin" });
      if (!active) return;
      if (!isAdmin) { setAuthState("forbidden"); return; }
      setAuthState("ok");
      await loadData();
    })();
    return () => { active = false; };
  }, [loadData]);

  const openProperty = async (p: Property) => {
    setSelected(p);
    const { data } = await supabase.from("profiles").select("*").eq("id", p.landlord_id).maybeSingle();
    setSelectedLandlord((data as unknown as Profile) || null);
  };

  const moderate = async (id: string, status: "approved" | "rejected") => {
    const { error } = await supabase.from("properties").update({ status }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success(`Property ${status}`);
    setAllProperties((p) => p.map((x) => (x.id === id ? { ...x, status } : x)));
    setSelected((s) => (s && s.id === id ? { ...s, status } : s));
  };

  if (authState === "loading") return <div className="flex min-h-screen items-center justify-center"><p className="text-muted-foreground">Loading…</p></div>;
  if (authState === "unauthenticated") return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="max-w-md"><CardHeader><CardTitle>Sign in required</CardTitle></CardHeader>
        <CardContent><p className="text-sm text-muted-foreground mb-4">You need to sign in to access the admin dashboard.</p>
          <Button asChild><a href="/login.html">Go to login</a></Button>
        </CardContent>
      </Card>
    </div>
  );
  if (authState === "forbidden") return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="max-w-md"><CardHeader><CardTitle>Access denied</CardTitle></CardHeader>
        <CardContent><p className="text-sm text-muted-foreground">Your account does not have admin privileges.</p></CardContent>
      </Card>
    </div>
  );

  const approvedCount = allProperties.filter((p) => p.status === "approved").length;
  const pendingCount = allProperties.filter((p) => p.status === "pending").length;
  const rejectedCount = allProperties.filter((p) => p.status === "rejected").length;
  const pending = allProperties.filter((p) => p.status === "pending");

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="mx-auto max-w-6xl px-6 py-6">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-sm text-muted-foreground">Moderate listings and manage users.</p>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="moderation">Moderation{pendingCount > 0 && <Badge variant="secondary" className="ml-2">{pendingCount}</Badge>}</TabsTrigger>
            <TabsTrigger value="all">All properties</TabsTrigger>
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
            <PropertyTable items={pending} onOpen={openProperty} showActions onModerate={moderate} />
          </TabsContent>

          <TabsContent value="all" className="mt-6">
            <PropertyTable items={allProperties} onOpen={openProperty} />
          </TabsContent>

          <TabsContent value="users" className="mt-6">
            <Card><CardHeader><CardTitle>All users</CardTitle></CardHeader>
              <CardContent>
                {profiles.length === 0 ? <p className="text-sm text-muted-foreground">No users yet.</p> : (
                  <Table>
                    <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Phone</TableHead><TableHead>National ID</TableHead><TableHead>Role</TableHead><TableHead>Joined</TableHead></TableRow></TableHeader>
                    <TableBody>
                      {profiles.map((u) => (
                        <TableRow key={u.id}>
                          <TableCell className="font-medium flex items-center gap-2">
                            {u.selfie_url ? <img src={u.selfie_url} alt="" className="w-8 h-8 rounded-full object-cover" /> : <div className="w-8 h-8 rounded-full bg-muted" />}
                            {u.full_name ?? "—"}
                          </TableCell>
                          <TableCell className="text-muted-foreground">{u.phone ?? "—"}</TableCell>
                          <TableCell className="text-muted-foreground font-mono text-xs">{u.national_id ?? "—"}</TableCell>
                          <TableCell><Badge variant={u.role === "admin" ? "default" : "secondary"}>{u.role}</Badge></TableCell>
                          <TableCell className="text-muted-foreground">{new Date(u.created_at).toLocaleDateString()}</TableCell>
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

      <Dialog open={!!selected} onOpenChange={(o) => { if (!o) { setSelected(null); setSelectedLandlord(null); } }}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{selected?.title}</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-4 text-sm">
              {selected.image_urls && selected.image_urls.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {selected.image_urls.map((u, i) => (
                    <a key={i} href={u} target="_blank" rel="noreferrer"><img src={u} alt="" className="w-full aspect-square object-cover rounded" /></a>
                  ))}
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <Field label="Status">{selected.status}</Field>
                <Field label="Occupancy">{selected.occupancy}</Field>
                <Field label="Price">TSh {Number(selected.price).toLocaleString()}</Field>
                <Field label="Type">{selected.property_type ?? "—"}</Field>
                <Field label="Furnishing">{selected.furnishing ?? "—"}</Field>
                <Field label="Beds / Baths">{selected.beds ?? "—"} / {selected.baths ?? "—"}</Field>
                <Field label="Size (sqm)">{selected.size_sqm ?? "—"}</Field>
                <Field label="Deposit (months)">{selected.deposit_months ?? "—"}</Field>
                <Field label="Available from">{selected.available_from ?? "—"}</Field>
                <Field label="Contact phone">{selected.contact_phone ?? "—"}</Field>
                <Field label="City">{selected.city ?? "—"}</Field>
                <Field label="Neighbourhood">{selected.neighbourhood ?? "—"}</Field>
                <Field label="Latitude">{selected.lat ?? "—"}</Field>
                <Field label="Longitude">{selected.lng ?? "—"}</Field>
                <Field label="Address" wide>{selected.address}</Field>
                <Field label="Amenities" wide>{selected.amenities?.length ? selected.amenities.join(", ") : "—"}</Field>
                <Field label="Description" wide>{selected.description ?? "—"}</Field>
                <Field label="Created">{new Date(selected.created_at).toLocaleString()}</Field>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold mb-2">Landlord</h4>
                {selectedLandlord ? (
                  <div className="flex gap-4">
                    {selectedLandlord.selfie_url ? <img src={selectedLandlord.selfie_url} alt="" className="w-20 h-20 rounded-full object-cover" /> : <div className="w-20 h-20 rounded-full bg-muted" />}
                    <div className="grid grid-cols-2 gap-3 flex-1">
                      <Field label="Name">{selectedLandlord.full_name ?? "—"}</Field>
                      <Field label="Phone">{selectedLandlord.phone ?? "—"}</Field>
                      <Field label="National ID">{selectedLandlord.national_id ?? "—"}</Field>
                      <Field label="Bio" wide>{selectedLandlord.bio ?? "—"}</Field>
                      <Field label="Landlord ID" wide><span className="font-mono text-xs">{selectedLandlord.id}</span></Field>
                    </div>
                  </div>
                ) : <p className="text-muted-foreground">Loading landlord…</p>}
              </div>

              <div className="flex gap-2 pt-2">
                {selected.status === "pending" && <>
                  <Button onClick={() => moderate(selected.id, "approved")}>Approve</Button>
                  <Button variant="destructive" onClick={() => moderate(selected.id, "rejected")}>Reject</Button>
                </>}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Field({ label, children, wide }: { label: string; children: React.ReactNode; wide?: boolean }) {
  return (
    <div className={wide ? "col-span-2" : ""}>
      <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="font-medium break-words">{children}</div>
    </div>
  );
}

function PropertyTable({ items, onOpen, showActions, onModerate }: {
  items: Property[]; onOpen: (p: Property) => void;
  showActions?: boolean; onModerate?: (id: string, s: "approved" | "rejected") => void;
}) {
  if (!items.length) return <Card><CardContent className="py-8"><p className="text-sm text-muted-foreground text-center">No properties.</p></CardContent></Card>;
  return (
    <Card><CardContent className="p-0">
      <Table>
        <TableHeader><TableRow><TableHead>Title</TableHead><TableHead>City</TableHead><TableHead>Price</TableHead><TableHead>Status</TableHead><TableHead>Occupancy</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
        <TableBody>
          {items.map((p) => (
            <TableRow key={p.id} className="cursor-pointer" onClick={() => onOpen(p)}>
              <TableCell className="font-medium">{p.title}</TableCell>
              <TableCell className="text-muted-foreground">{p.city ?? p.address}</TableCell>
              <TableCell>TSh {Number(p.price).toLocaleString()}</TableCell>
              <TableCell><Badge variant={p.status === "approved" ? "default" : p.status === "rejected" ? "destructive" : "secondary"}>{p.status}</Badge></TableCell>
              <TableCell><Badge variant={p.occupancy === "occupied" ? "destructive" : "secondary"}>{p.occupancy}</Badge></TableCell>
              <TableCell className="text-right space-x-2" onClick={(e) => e.stopPropagation()}>
                <Button size="sm" variant="outline" onClick={() => onOpen(p)}>View</Button>
                {showActions && onModerate && p.status === "pending" && <>
                  <Button size="sm" onClick={() => onModerate(p.id, "approved")}>Approve</Button>
                  <Button size="sm" variant="destructive" onClick={() => onModerate(p.id, "rejected")}>Reject</Button>
                </>}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </CardContent></Card>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle></CardHeader>
      <CardContent><p className="text-3xl font-bold">{value}</p></CardContent>
    </Card>
  );
}
