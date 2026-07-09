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
  video_url: string | null;
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
  cleanliness_preference: string | null;
  sleep_schedule: string | null;
  created_at: string;
  updated_at: string;
  verification_status?: "pending" | "approved" | "rejected" | null;
  ocr_attempts?: number | null;
  ocr_data?: Record<string, unknown> | null;
  nid_front_url?: string | null;
  nid_back_url?: string | null;
  university?: string | null;
  student_reg_no?: string | null;
  student_id_url?: string | null;
  rejection_reason?: string | null;
  verified_at?: string | null;
};

type AppRole = "student" | "landlord" | "admin";
type RolesByUser = Record<string, AppRole[]>;
type ContactMessage = {
  id: string;
  name: string;
  email: string;
  callback_email: string;
  message: string;
  status: string;
  created_at: string;
};

type RoommateDetails = { name?: string; phone?: string; cleanliness?: string; sleep?: string; bio?: string; notes?: string; property_title?: string };
type RoommateRequest = {
  id: string;
  student_id: string;
  property_id: string | null;
  property_key: string | null;
  status: "searching" | "matched";
  match_partner_id: string | null;
  details: RoommateDetails | null;
  created_at: string;
};


type PendingAgency = { id: string; full_name: string | null; phone: string | null; email: string | null; created_at: string };

type AuthState = "loading" | "unauthenticated" | "forbidden" | "ok";

function displayRoles(roles: AppRole[] | undefined, fallback: string): string {
  if (!roles || roles.length === 0) return fallback;
  if (roles.includes("admin")) return "admin";
  const hasStudent = roles.includes("student");
  const hasLandlord = roles.includes("landlord");
  if (hasStudent && hasLandlord) return "renter / landlord";
  if (hasLandlord) return "landlord";
  if (hasStudent) return "renter";
  return fallback;
}

function AdminPage() {
  const [authState, setAuthState] = useState<AuthState>("loading");
  const [allProperties, setAllProperties] = useState<Property[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [rolesByUser, setRolesByUser] = useState<RolesByUser>({});
  const [bookingsCount, setBookingsCount] = useState(0);
  const [selected, setSelected] = useState<Property | null>(null);
  const [selectedLandlord, setSelectedLandlord] = useState<Profile | null>(null);
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [roommates, setRoommates] = useState<RoommateRequest[]>([]);
  const [matchSelection, setMatchSelection] = useState<string[]>([]);
  const [announceTitle, setAnnounceTitle] = useState("");
  const [announceBody, setAnnounceBody] = useState("");
  const [announceLink, setAnnounceLink] = useState("");
  const [sendingAnnounce, setSendingAnnounce] = useState(false);
  const [pendingAgencies, setPendingAgencies] = useState<PendingAgency[]>([]);


  const loadData = useCallback(async () => {
    const [allProps, profs, bookings, roles, msgs, rooms] = await Promise.all([
      supabase.from("properties").select("*").order("created_at", { ascending: false }),
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("bookings").select("id", { count: "exact", head: true }),
      supabase.from("user_roles").select("user_id, role"),
      supabase.from("contact_messages").select("*").order("created_at", { ascending: false }),
      supabase.from("roommate_requests").select("*").order("created_at", { ascending: false }),
    ]);
    if (allProps.data) setAllProperties(allProps.data as unknown as Property[]);
    if (profs.data) setProfiles(profs.data as unknown as Profile[]);
    if (typeof bookings.count === "number") setBookingsCount(bookings.count);
    if (roles.data) {
      const map: RolesByUser = {};
      for (const r of roles.data as { user_id: string; role: AppRole }[]) {
        (map[r.user_id] ||= []).push(r.role);
      }
      setRolesByUser(map);
    }
    if (msgs.data) setMessages(msgs.data as unknown as ContactMessage[]);
    if (rooms.data) setRoommates(rooms.data as unknown as RoommateRequest[]);
    const { data: agencies } = await (supabase as unknown as { rpc: (n: string) => Promise<{ data: PendingAgency[] | null }> }).rpc("list_pending_agencies");
    if (agencies) setPendingAgencies(agencies);
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

  const [selectedVideoUrl, setSelectedVideoUrl] = useState<string | null>(null);
  const openProperty = async (p: Property) => {
    setSelected(p);
    setSelectedVideoUrl(null);
    const { data } = await supabase.from("profiles").select("*").eq("id", p.landlord_id).maybeSingle();
    setSelectedLandlord((data as unknown as Profile) || null);
    if (p.video_url) {
      const { data: signed } = await supabase.storage.from("property-videos").createSignedUrl(p.video_url, 60 * 60 * 6);
      if (signed?.signedUrl) setSelectedVideoUrl(signed.signedUrl);
    }
  };

  const moderate = async (id: string, status: "approved" | "rejected") => {
    const { error } = await supabase.from("properties").update({ status }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success(`Property ${status}`);
    setAllProperties((p) => p.map((x) => (x.id === id ? { ...x, status } : x)));
    setSelected((s) => (s && s.id === id ? { ...s, status } : s));
  };

  const setVerification = async (userId: string, decision: "approved" | "rejected", reason?: string) => {
    const patch: Record<string, unknown> = {
      verification_status: decision,
      rejection_reason: decision === "rejected" ? reason ?? null : null,
    };
    if (decision === "approved") patch.verified_at = new Date().toISOString();
    const { error } = await supabase.from("profiles").update(patch as never).eq("id", userId);
    if (error) { toast.error(error.message); return; }
    toast.success(`User ${decision}`);
    setProfiles((arr) => arr.map((u) => (u.id === userId ? { ...u, ...patch } as Profile : u)));
    setSelectedUser((u) => (u && u.id === userId ? { ...u, ...patch } as Profile : u));
  };

  const toggleMatchSelect = (id: string) => {
    setMatchSelection((sel) => sel.includes(id) ? sel.filter(x => x !== id) : sel.length < 2 ? [...sel, id] : [sel[1], id]);
  };

  const matchSelected = async () => {
    if (matchSelection.length !== 2) { toast.error("Select exactly two requests to match."); return; }
    const [a, b] = matchSelection;
    const { error } = await supabase.rpc("match_roommate_requests", { _a: a, _b: b });
    if (error) { toast.error(error.message); return; }
    toast.success("Matched! Both students have been notified.");
    setMatchSelection([]);
    await loadData();
  };

  const sendAnnouncement = async () => {
    if (!announceTitle.trim() || !announceBody.trim()) { toast.error("Title and message are required."); return; }
    setSendingAnnounce(true);
    const { data, error } = await supabase.rpc("send_announcement", {
      _title: announceTitle.trim(), _body: announceBody.trim(),
      _link: announceLink.trim() || undefined,
    });
    setSendingAnnounce(false);
    if (error) { toast.error(error.message); return; }
    toast.success(`Announcement sent to ${data ?? 0} users.`);
    setAnnounceTitle(""); setAnnounceBody(""); setAnnounceLink("");
  };

  const approveAgency = async (userId: string) => {
    const { error } = await (supabase as unknown as { rpc: (n: string, a: Record<string, unknown>) => Promise<{ error: { message: string } | null }> }).rpc("approve_agency", { _user_id: userId });
    if (error) { toast.error(error.message); return; }
    toast.success("Agency approved");
    setPendingAgencies((arr) => arr.filter((a) => a.id !== userId));
  };
  const declineAgency = async (userId: string) => {
    const { error } = await (supabase as unknown as { rpc: (n: string, a: Record<string, unknown>) => Promise<{ error: { message: string } | null }> }).rpc("decline_agency", { _user_id: userId });
    if (error) { toast.error(error.message); return; }
    toast.success("Agency request declined");
    setPendingAgencies((arr) => arr.filter((a) => a.id !== userId));
  };



  if (authState === "loading") return <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-white"><p className="text-blue-600">Loading…</p></div>;
  if (authState === "unauthenticated") return (
    <div className="flex min-h-screen items-center justify-center px-4 bg-gradient-to-br from-blue-50 to-white">
      <Card className="max-w-md border-blue-200"><CardHeader><CardTitle>Sign in required</CardTitle></CardHeader>
        <CardContent><p className="text-sm text-muted-foreground mb-4">You need to sign in to access the admin dashboard.</p>
          <Button asChild className="bg-blue-600 hover:bg-blue-700"><a href="/login.html">Go to login</a></Button>
        </CardContent>
      </Card>
    </div>
  );
  if (authState === "forbidden") return (
    <div className="flex min-h-screen items-center justify-center px-4 bg-gradient-to-br from-blue-50 to-white">
      <Card className="max-w-md border-blue-200"><CardHeader><CardTitle>Access denied</CardTitle></CardHeader>
        <CardContent><p className="text-sm text-muted-foreground">Your account does not have admin privileges.</p></CardContent>
      </Card>
    </div>
  );

  const approvedCount = allProperties.filter((p) => p.status === "approved").length;
  const pendingCount = allProperties.filter((p) => p.status === "pending").length;
  const rejectedCount = allProperties.filter((p) => p.status === "rejected").length;
  const pending = allProperties.filter((p) => p.status === "pending");
  const pendingVerifications = profiles.filter(
    (u) => u.verification_status === "pending" &&
      (u.nid_front_url || u.student_id_url || u.ocr_data || u.university)
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-sky-50">
      <header className="border-b border-blue-200 bg-gradient-to-r from-blue-600 to-sky-500 text-white shadow-lg">
        <div className="mx-auto max-w-6xl px-6 py-6 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2"><span>🛡️</span> Admin Dashboard</h1>
            <p className="text-sm text-blue-50/90">Moderate listings and manage users.</p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="secondary" className="bg-white text-blue-700 hover:bg-blue-50">
              <a href="/home.html">← Back to Home</a>
            </Button>
            <Button asChild variant="secondary" className="bg-white/10 text-white hover:bg-white/20 border border-white/30">
              <a href="/listings.html">View Listings</a>
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">
        <Tabs defaultValue="overview">
          <TabsList className="bg-blue-100/60 border border-blue-200">
            <TabsTrigger value="overview" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">Overview</TabsTrigger>
            <TabsTrigger value="moderation" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">Moderation{pendingCount > 0 && <Badge variant="secondary" className="ml-2 bg-amber-500 text-white">{pendingCount}</Badge>}</TabsTrigger>
            <TabsTrigger value="all" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">All properties</TabsTrigger>
            <TabsTrigger value="verifications" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              Verifications{pendingVerifications.length > 0 && <Badge variant="secondary" className="ml-2 bg-amber-500 text-white">{pendingVerifications.length}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">Users</TabsTrigger>
            <TabsTrigger value="messages" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              Messages{messages.filter(m => m.status === 'new').length > 0 && <Badge variant="secondary" className="ml-2 bg-amber-500 text-white">{messages.filter(m => m.status === 'new').length}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="roommates" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              Roommates{roommates.filter(r => r.status === 'searching').length > 0 && <Badge variant="secondary" className="ml-2 bg-amber-500 text-white">{roommates.filter(r => r.status === 'searching').length}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="agencies" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              Agencies{pendingAgencies.length > 0 && <Badge variant="secondary" className="ml-2 bg-amber-500 text-white">{pendingAgencies.length}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="announce" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">📣 Announce</TabsTrigger>
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

          <TabsContent value="verifications" className="mt-6">
            <Card className="border-blue-200">
              <CardHeader><CardTitle className="text-blue-900">Pending identity verifications</CardTitle></CardHeader>
              <CardContent>
                {pendingVerifications.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No pending verifications.</p>
                ) : (
                  <div className="space-y-3">
                    {pendingVerifications.map((u) => {
                      const roles = displayRoles(rolesByUser[u.id], u.role);
                      const ocr = u.ocr_data as { confidence?: number; detected_name?: string; detected_nid?: string; reasoning?: string } | null;
                      return (
                        <div key={u.id} className="flex items-start gap-4 p-3 border border-blue-100 rounded-lg bg-blue-50/30">
                          {u.selfie_url ? <img src={u.selfie_url} alt="" className="w-16 h-16 rounded-full object-cover ring-2 ring-blue-200" /> : <div className="w-16 h-16 rounded-full bg-blue-100" />}
                          <div className="flex-1 text-sm">
                            <div className="font-semibold text-blue-900">{u.full_name ?? "—"} <Badge className="ml-2 bg-amber-500 hover:bg-amber-600">{roles}</Badge></div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {u.phone && <>📞 {u.phone} · </>}{u.national_id && <>NID: <span className="font-mono">{u.national_id}</span></>}
                            </div>
                            {u.university && <div className="text-xs mt-1">🎓 {u.university} · Reg #: {u.student_reg_no}</div>}
                            {ocr && (
                              <div className="text-xs mt-1 text-slate-700">
                                OCR ({u.ocr_attempts ?? 0} attempts) confidence: <strong>{ocr.confidence ?? "?"}%</strong>. Detected: {ocr.detected_name ?? "?"} / {ocr.detected_nid ?? "?"}
                              </div>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-50" onClick={() => setSelectedUser(u)}>Review</Button>
                            <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={() => setVerification(u.id, "approved")}>Approve</Button>
                            <Button size="sm" variant="destructive" onClick={() => {
                              const reason = window.prompt("Reason for rejection (optional):") ?? "";
                              setVerification(u.id, "rejected", reason);
                            }}>Reject</Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>


          <TabsContent value="users" className="mt-6">
            <Card className="border-blue-200"><CardHeader><CardTitle className="text-blue-900">All users</CardTitle></CardHeader>
              <CardContent>
                {profiles.length === 0 ? <p className="text-sm text-muted-foreground">No users yet.</p> : (
                  <Table>
                    <TableHeader><TableRow className="bg-blue-50"><TableHead>Name</TableHead><TableHead>Phone</TableHead><TableHead>National ID</TableHead><TableHead>Role</TableHead><TableHead>Joined</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                    <TableBody>
                      {profiles.map((u) => {
                        const roles = rolesByUser[u.id];
                        const roleLabel = displayRoles(roles, u.role);
                        const isCombo = roleLabel.includes("/");
                        return (
                          <TableRow key={u.id} className="hover:bg-blue-50/50">
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-2">
                                {u.selfie_url ? <img src={u.selfie_url} alt="" className="w-8 h-8 rounded-full object-cover ring-2 ring-blue-200" /> : <div className="w-8 h-8 rounded-full bg-blue-100" />}
                                {u.full_name ?? "—"}
                              </div>
                            </TableCell>
                            <TableCell className="text-muted-foreground">{u.phone ?? "—"}</TableCell>
                            <TableCell className="text-muted-foreground font-mono text-xs">{u.national_id ?? "—"}</TableCell>
                            <TableCell>
                              <Badge className={
                                roleLabel === "admin" ? "bg-purple-600 hover:bg-purple-700" :
                                isCombo ? "bg-gradient-to-r from-blue-600 to-emerald-500 hover:from-blue-700 hover:to-emerald-600 text-white" :
                                roleLabel === "landlord" ? "bg-emerald-600 hover:bg-emerald-700" :
                                "bg-blue-600 hover:bg-blue-700"
                              }>{roleLabel}</Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground">{new Date(u.created_at).toLocaleDateString()}</TableCell>
                            <TableCell className="text-right">
                              <Button size="sm" variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-50" onClick={() => setSelectedUser(u)}>
                                View more
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="messages" className="mt-6">
            <Card className="border-blue-200">
              <CardHeader><CardTitle className="text-blue-900">Contact form messages</CardTitle></CardHeader>
              <CardContent>
                {messages.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No messages yet.</p>
                ) : (
                  <div className="space-y-3">
                    {messages.map((m) => (
                      <div key={m.id} className={`p-4 border rounded-lg ${m.status === 'new' ? 'border-blue-300 bg-blue-50/40' : 'border-slate-200 bg-white'}`}>
                        <div className="flex items-start justify-between gap-3 flex-wrap">
                          <div className="text-sm">
                            <div className="font-semibold text-blue-900">{m.name} {m.status === 'new' && <Badge className="ml-2 bg-amber-500">new</Badge>}</div>
                            <div className="text-xs text-muted-foreground mt-0.5">
                              From: <a href={`mailto:${m.email}`} className="text-blue-700 underline">{m.email}</a>
                              {' · '}Reply to: <a href={`mailto:${m.callback_email}`} className="text-blue-700 underline font-medium">{m.callback_email}</a>
                            </div>
                            <div className="text-xs text-muted-foreground mt-0.5">{new Date(m.created_at).toLocaleString()}</div>
                          </div>
                          <div className="flex gap-2">
                            {m.status === 'new' && (
                              <Button size="sm" variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-50" onClick={async () => {
                                const { error } = await supabase.from('contact_messages').update({ status: 'read' }).eq('id', m.id);
                                if (error) { toast.error(error.message); return; }
                                setMessages((arr) => arr.map((x) => x.id === m.id ? { ...x, status: 'read' } : x));
                              }}>Mark read</Button>
                            )}
                            <Button size="sm" variant="destructive" onClick={async () => {
                              if (!window.confirm('Delete this message?')) return;
                              const { error } = await supabase.from('contact_messages').delete().eq('id', m.id);
                              if (error) { toast.error(error.message); return; }
                              setMessages((arr) => arr.filter((x) => x.id !== m.id));
                            }}>Delete</Button>
                          </div>
                        </div>
                        <p className="text-sm mt-3 whitespace-pre-wrap text-slate-800">{m.message}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="roommates" className="mt-6">
            <Card className="border-blue-200">
              <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <CardTitle className="text-blue-900">Roommate requests</CardTitle>
                  <div className="flex gap-2 items-center text-sm">
                    <span className="text-blue-700/80">Selected: <strong>{matchSelection.length}/2</strong></span>
                    <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" disabled={matchSelection.length !== 2} onClick={matchSelected}>
                      🤝 Match selected & notify
                    </Button>
                    {matchSelection.length > 0 && (
                      <Button size="sm" variant="outline" onClick={() => setMatchSelection([])}>Clear</Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {roommates.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No roommate requests yet.</p>
                ) : (
                  <div className="space-y-3">
                    {(() => {
                      // group by property
                      const groups: Record<string, RoommateRequest[]> = {};
                      for (const r of roommates) {
                        const key = (r.property_id || r.property_key || 'unknown') as string;
                        (groups[key] ||= []).push(r);
                      }
                      return Object.entries(groups).map(([key, items]) => {
                        const title = items[0]?.details?.property_title
                          || allProperties.find(p => p.id === items[0].property_id)?.title
                          || `Property ${key.slice(0,8)}`;
                        const searching = items.filter(i => i.status === 'searching');
                        const matched = items.filter(i => i.status === 'matched');
                        return (
                          <div key={key} className="border border-blue-200 rounded-lg overflow-hidden">
                            <div className="bg-gradient-to-r from-blue-600 to-sky-500 text-white px-4 py-2 flex items-center justify-between flex-wrap gap-2">
                              <div className="font-semibold">🏠 {title}</div>
                              <div className="text-xs opacity-90">{searching.length} searching · {matched.length} matched</div>
                            </div>
                            <div className="divide-y divide-blue-100">
                              {items.map(r => {
                                const prof = profiles.find(p => p.id === r.student_id);
                                const d = r.details || {};
                                const selected = matchSelection.includes(r.id);
                                return (
                                  <div key={r.id} className={`p-3 flex items-start gap-3 ${selected ? 'bg-emerald-50' : ''}`}>
                                    {r.status === 'searching' && (
                                      <input type="checkbox" checked={selected} onChange={() => toggleMatchSelect(r.id)} className="mt-1 h-4 w-4 accent-emerald-600" />
                                    )}
                                    {prof?.selfie_url
                                      ? <img src={prof.selfie_url} alt="" className="w-12 h-12 rounded-full object-cover ring-2 ring-blue-200" />
                                      : <div className="w-12 h-12 rounded-full bg-blue-100 grid place-items-center text-blue-400">👤</div>}
                                    <div className="flex-1 text-sm min-w-0">
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <strong className="text-blue-900">{d.name || prof?.full_name || '—'}</strong>
                                        <Badge className={r.status === 'matched' ? 'bg-emerald-600' : 'bg-amber-500'}>{r.status}</Badge>
                                        {d.cleanliness && <Badge variant="outline" className="text-xs">🧹 {d.cleanliness}</Badge>}
                                        {d.sleep && <Badge variant="outline" className="text-xs">😴 {d.sleep}</Badge>}
                                      </div>
                                      <div className="text-xs text-muted-foreground mt-0.5">📞 {d.phone || prof?.phone || '—'} · {new Date(r.created_at).toLocaleString()}</div>
                                      {d.bio && <div className="text-xs mt-1 italic text-slate-700">"{d.bio}"</div>}
                                      {d.notes && <div className="text-xs mt-1 text-slate-800"><strong>Notes:</strong> {d.notes}</div>}
                                    </div>
                                    <Button size="sm" variant="outline" className="border-red-300 text-red-600 hover:bg-red-50" onClick={async () => {
                                      if (!window.confirm('Delete this request?')) return;
                                      const { error } = await supabase.from('roommate_requests').delete().eq('id', r.id);
                                      if (error) { toast.error(error.message); return; }
                                      setRoommates(arr => arr.filter(x => x.id !== r.id));
                                    }}>Delete</Button>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="announce" className="mt-6">
            <Card className="border-blue-200 max-w-2xl">
              <CardHeader>
                <CardTitle className="text-blue-900 flex items-center gap-2">📣 Send an announcement to all users</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-xs font-semibold uppercase text-blue-700/70">Title</label>
                  <input value={announceTitle} onChange={e => setAnnounceTitle(e.target.value)} maxLength={120}
                    className="w-full mt-1 px-3 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="e.g. New listings added this week" />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase text-blue-700/70">Message</label>
                  <textarea value={announceBody} onChange={e => setAnnounceBody(e.target.value)} rows={4} maxLength={600}
                    className="w-full mt-1 px-3 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 font-sans"
                    placeholder="Share important updates, maintenance windows, new features…" />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase text-blue-700/70">Link (optional)</label>
                  <input value={announceLink} onChange={e => setAnnounceLink(e.target.value)} maxLength={200}
                    className="w-full mt-1 px-3 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="/listings.html or /home.html#features" />
                </div>
                <Button onClick={sendAnnouncement} disabled={sendingAnnounce} className="bg-blue-600 hover:bg-blue-700">
                  {sendingAnnounce ? "Sending…" : `📣 Send to ${profiles.length} users`}
                </Button>
                <p className="text-xs text-muted-foreground">Each user will get a notification in their bell + notifications page.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

      </main>

      <Dialog open={!!selected} onOpenChange={(o) => { if (!o) { setSelected(null); setSelectedLandlord(null); setSelectedVideoUrl(null); } }}>
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
              {selected.video_url && (
                <div>
                  <div className="text-xs font-semibold uppercase text-muted-foreground mb-1">Video tour</div>
                  {selectedVideoUrl ? (
                    <video src={selectedVideoUrl} controls preload="metadata" className="w-full max-h-[480px] rounded bg-black" />
                  ) : (
                    <div className="text-xs text-muted-foreground">Loading video…</div>
                  )}
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
                  <Button onClick={() => moderate(selected.id, "approved")} className="bg-blue-600 hover:bg-blue-700">Approve</Button>
                  <Button variant="destructive" onClick={() => moderate(selected.id, "rejected")}>Reject</Button>
                </>}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!selectedUser} onOpenChange={(o) => { if (!o) setSelectedUser(null); }}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>User profile — {selectedUser?.full_name ?? "—"}</DialogTitle></DialogHeader>
          {selectedUser && (
            <div className="space-y-5 text-sm">
              <div className="flex items-start gap-4">
                {selectedUser.selfie_url ? (
                  <a href={selectedUser.selfie_url} target="_blank" rel="noreferrer">
                    <img src={selectedUser.selfie_url} alt="Profile selfie" className="w-32 h-32 rounded-xl object-cover ring-2 ring-blue-300" />
                  </a>
                ) : (
                  <div className="w-32 h-32 rounded-xl bg-blue-100 flex items-center justify-center text-blue-400 text-xs">No selfie</div>
                )}
                <div className="flex-1 grid grid-cols-2 gap-3">
                  <Field label="Full name">{selectedUser.full_name ?? "—"}</Field>
                  <Field label="Role(s)">{displayRoles(rolesByUser[selectedUser.id], selectedUser.role)}</Field>
                  <Field label="Phone">{selectedUser.phone ?? "—"}</Field>
                  <Field label="National ID">{selectedUser.national_id ?? "—"}</Field>
                  <Field label="Cleanliness">{selectedUser.cleanliness_preference ?? "—"}</Field>
                  <Field label="Sleep schedule">{selectedUser.sleep_schedule ?? "—"}</Field>
                  <Field label="Joined">{new Date(selectedUser.created_at).toLocaleString()}</Field>
                  <Field label="Updated">{new Date(selectedUser.updated_at).toLocaleString()}</Field>
                </div>
              </div>
              <Field label="Bio" wide>{selectedUser.bio ?? "—"}</Field>
              <Field label="User ID" wide><span className="font-mono text-xs">{selectedUser.id}</span></Field>

              <div className="border-t pt-4 space-y-3">
                <h4 className="font-semibold text-blue-900">Identity verification</h4>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Status">
                    <Badge className={
                      selectedUser.verification_status === "approved" ? "bg-emerald-600" :
                      selectedUser.verification_status === "rejected" ? "bg-red-600" :
                      "bg-amber-500"
                    }>{selectedUser.verification_status ?? "pending"}</Badge>
                  </Field>
                  <Field label="OCR attempts">{selectedUser.ocr_attempts ?? 0} / 3</Field>
                  {selectedUser.university && <Field label="University">{selectedUser.university}</Field>}
                  {selectedUser.student_reg_no && <Field label="Reg #">{selectedUser.student_reg_no}</Field>}
                </div>
                {selectedUser.ocr_data && (
                  <pre className="text-xs bg-slate-50 border border-slate-200 rounded p-2 overflow-auto max-h-40">{JSON.stringify(selectedUser.ocr_data, null, 2)}</pre>
                )}
                <div className="grid grid-cols-3 gap-2">
                  {selectedUser.nid_front_url && <a href={selectedUser.nid_front_url} target="_blank" rel="noreferrer"><img src={selectedUser.nid_front_url} alt="NID front" className="w-full aspect-video object-cover rounded border" /><div className="text-xs text-center mt-1">NID front</div></a>}
                  {selectedUser.nid_back_url && <a href={selectedUser.nid_back_url} target="_blank" rel="noreferrer"><img src={selectedUser.nid_back_url} alt="NID back" className="w-full aspect-video object-cover rounded border" /><div className="text-xs text-center mt-1">NID back</div></a>}
                  {selectedUser.student_id_url && <a href={selectedUser.student_id_url} target="_blank" rel="noreferrer"><img src={selectedUser.student_id_url} alt="Student ID" className="w-full aspect-video object-cover rounded border" /><div className="text-xs text-center mt-1">Student ID</div></a>}
                </div>
                {selectedUser.verification_status !== "approved" && (
                  <div className="flex gap-2">
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={() => setVerification(selectedUser.id, "approved")}>Approve</Button>
                    <Button size="sm" variant="destructive" onClick={() => {
                      const reason = window.prompt("Reason for rejection (optional):") ?? "";
                      setVerification(selectedUser.id, "rejected", reason);
                    }}>Reject</Button>
                  </div>
                )}
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
      <div className="text-xs uppercase tracking-wide text-blue-700/70 font-semibold">{label}</div>
      <div className="font-medium break-words text-slate-800">{children}</div>
    </div>
  );
}

function PropertyTable({ items, onOpen, showActions, onModerate }: {
  items: Property[]; onOpen: (p: Property) => void;
  showActions?: boolean; onModerate?: (id: string, s: "approved" | "rejected") => void;
}) {
  if (!items.length) return <Card className="border-blue-200"><CardContent className="py-8"><p className="text-sm text-muted-foreground text-center">No properties.</p></CardContent></Card>;
  return (
    <Card className="border-blue-200"><CardContent className="p-0">
      <Table>
        <TableHeader><TableRow className="bg-blue-50"><TableHead>Title</TableHead><TableHead>City</TableHead><TableHead>Price</TableHead><TableHead>Status</TableHead><TableHead>Occupancy</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
        <TableBody>
          {items.map((p) => (
            <TableRow key={p.id} className="cursor-pointer hover:bg-blue-50/50" onClick={() => onOpen(p)}>
              <TableCell className="font-medium">{p.title}</TableCell>
              <TableCell className="text-muted-foreground">{p.city ?? p.address}</TableCell>
              <TableCell>TSh {Number(p.price).toLocaleString()}</TableCell>
              <TableCell><Badge variant={p.status === "approved" ? "default" : p.status === "rejected" ? "destructive" : "secondary"} className={p.status === "approved" ? "bg-blue-600 hover:bg-blue-700" : ""}>{p.status}</Badge></TableCell>
              <TableCell><Badge variant={p.occupancy === "occupied" ? "destructive" : "secondary"}>{p.occupancy}</Badge></TableCell>
              <TableCell className="text-right space-x-2" onClick={(e) => e.stopPropagation()}>
                <Button size="sm" variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-50" onClick={() => onOpen(p)}>View</Button>
                {showActions && onModerate && p.status === "pending" && <>
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={() => onModerate(p.id, "approved")}>Approve</Button>
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
    <Card className="border-blue-200 bg-gradient-to-br from-white to-blue-50 hover:shadow-md transition-shadow">
      <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-blue-700/80">{label}</CardTitle></CardHeader>
      <CardContent><p className="text-3xl font-bold text-blue-900">{value}</p></CardContent>
    </Card>
  );
}
