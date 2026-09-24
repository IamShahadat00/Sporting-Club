"use client";

import { useState, useEffect } from "react";
import { SeasonBanner } from "@/components/tournament-hub/SeasonBanner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button"; // FIXED: Added import
import {
  Trophy,
  Activity,
  AlertCircle,
  Star,
  Users,
  GitBranch,
  ListOrdered,
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { CrudTable } from "@/components/admin/CrudTable";
import { CrudFormDialog } from "@/components/admin/CrudFormDialog";
import { toast } from "sonner";

export default function TournamentsAdminPage() {
  const [seasons, setSeasons] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({
    topScorers: [],
    injured: [],
    mvps: [],
  });
  const [activeSeason, setActiveSeason] = useState<any>(null);
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [editingSeason, setEditingSeason] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const sRes = await fetch("/api/tournaments");
      const seasonsData = await sRes.json();
      setSeasons(seasonsData);

      const active = seasonsData.find((s: any) => s.status === "ACTIVE");
      setActiveSeason(active);

      const pRes = await fetch("/api/players");
      const players = await pRes.json();

      setStats({
        topScorers: players
          .filter((p: any) => p.goals > 0)
          .sort((a: any, b: any) => b.goals - a.goals)
          .slice(0, 5),
        injured: players.filter((p: any) => p.isInjured),
        mvps: players
          .filter((p: any) => (p._count?.mvpAwards || 0) > 0)
          .sort((a: any, b: any) => b._count.mvpAwards - a._count.mvpAwards)
          .slice(0, 3),
      });
    } catch (error) {
      toast.error("Failed to load tournament data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async (values: any) => {
    const method = editingSeason ? "PATCH" : "POST";
    const url = editingSeason
      ? `/api/tournaments/${editingSeason.id}`
      : "/api/tournaments";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    if (res.ok) {
      toast.success(
        values.status === "ACTIVE" ? "Season Activated!" : "Season Saved",
      );
      setDialogOpen(false);
      loadData();
    } else {
      toast.error("Error saving season");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    const res = await fetch(`/api/tournaments/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Season deleted");
      loadData();
    } else {
      const err = await res.json();
      toast.error(err.error || "Delete failed");
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-12 bg-background min-h-screen pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <Link
            href="/admin/dashboard"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-pitch font-black uppercase text-xs mb-4 group transition-all"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />{" "}
            Back to Dashboard
          </Link>
          <h1 className="text-4xl font-black italic uppercase tracking-tighter text-pitch-dark">
            Tournament Management
          </h1>
        </div>
        <Button
          onClick={() => {
            setEditingSeason(null);
            setDialogOpen(true);
          }}
          className="bg-pitch hover:bg-pitch-dark text-white font-black rounded-full px-8 shadow-lg"
        >
          <Plus className="mr-2 h-5 w-5" /> Create New Season
        </Button>
      </div>

      <section className="bg-card border-2 p-8 rounded-[2.5rem] overflow-hidden shadow-sm">
        <CrudTable
          title="All Seasons"
          items={seasons}
          columns={[
            { key: "name", label: "Season Name" },
            {
              key: "status",
              label: "Status",
              render: (s) => (
                <Badge
                  className={
                    s.status === "ACTIVE"
                      ? "bg-pitch"
                      : "bg-muted text-muted-foreground border-none"
                  }
                  variant={s.status === "ACTIVE" ? "default" : "outline"}
                >
                  {s.status}
                </Badge>
              ),
            },
            {
              id: "matches-count",
              key: "_count",
              label: "Matches",
              render: (s: any) => (
                <span className="font-bold">{s._count?.matches || 0}</span>
              ),
            },
            {
              id: "regs-count",
              key: "_count",
              label: "Registrations",
              render: (s: any) => (
                <span className="font-bold text-muted-foreground">
                  {s._count?.registrations || 0}
                </span>
              ),
            },
          ]}
          onCreate={() => {
            setEditingSeason(null);
            setDialogOpen(true);
          }}
          onEdit={(s) => {
            setEditingSeason(s);
            setDialogOpen(true);
          }}
          onDelete={(s) => handleDelete(s.id)}
        />
      </section>

      {activeSeason ? (
        <section className="pt-10 border-t-2 border-dashed">
          <div className="flex items-center gap-3 mb-8">
            <Activity className="h-8 w-8 text-pitch" />
            <h2 className="text-3xl font-black italic uppercase tracking-tighter">
              Live Preview: {activeSeason.name}
            </h2>
          </div>

          <SeasonBanner season={activeSeason} />

          <div className="grid gap-6 sm:grid-cols-3 mt-8">
            <HubTile
              icon={<Users />}
              title="Registration"
              sub={`${activeSeason._count.registrations} Joined`}
            />
            <HubTile
              icon={<GitBranch />}
              title="Playoff Brackets"
              sub="Tournament Tree"
            />
            <HubTile
              icon={<ListOrdered />}
              title="League Standings"
              sub="Points Table"
            />
          </div>

          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <StatBox
              title="Top Scorers"
              icon={<Trophy className="text-gold" />}
            >
              {stats.topScorers.map((p: any) => (
                <div
                  key={p.id}
                  className="flex justify-between items-center border-b last:border-0 py-3"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={p.team?.logoUrl || ""}
                      className="h-8 w-8 rounded-full border bg-white"
                      alt=""
                    />
                    <span className="font-bold text-sm">{p.name}</span>
                  </div>
                  <span className="text-xl font-black text-pitch">
                    {p.goals}
                  </span>
                </div>
              ))}
            </StatBox>

            <StatBox
              title="Injuries"
              icon={<AlertCircle className="text-danger" />}
            >
              {stats.injured.map((p: any) => (
                <div
                  key={p.id}
                  className="flex justify-between items-center py-2 border-b last:border-0"
                >
                  <span className="text-sm font-bold">{p.name}</span>
                  <Badge
                    variant="outline"
                    className="text-[10px] text-danger border-danger uppercase font-black"
                  >
                    Out
                  </Badge>
                </div>
              ))}
            </StatBox>

            <StatBox title="MVP Leader" icon={<Star className="text-sky" />}>
              {stats.mvps.map((p: any) => (
                <div
                  key={p.id}
                  className="flex justify-between items-center py-3 border-b last:border-0"
                >
                  <span className="text-sm font-bold">{p.name}</span>
                  <span className="font-black text-sky-dark bg-sky/10 px-3 py-1 rounded-full text-xs">
                    MVP
                  </span>
                </div>
              ))}
            </StatBox>
          </div>
        </section>
      ) : null}

      <CrudFormDialog
        open={isDialogOpen}
        onOpenChange={setDialogOpen}
        title={editingSeason ? "Edit Season" : "Create New Season"}
        initialValues={editingSeason}
        fields={[
          { name: "name", label: "Season Name", type: "text", required: true },
          {
            name: "status",
            label: "Status",
            type: "select",
            options: [
              { label: "Upcoming", value: "UPCOMING" },
              { label: "Active", value: "ACTIVE" },
              { label: "Completed", value: "COMPLETED" },
            ],
            required: true,
          },
          { name: "startDate", label: "Start Date", type: "date" },
          { name: "endDate", label: "End Date", type: "date" },
          {
            name: "bannerImageUrl",
            label: "Season Banner",
            type: "image",
            bucket: "banners",
          },
        ]}
        onSubmit={handleSave}
      />
    </div>
  );
}

function HubTile({ icon, title, sub }: any) {
  return (
    <div className="p-6 border-2 rounded-3xl bg-card/50 flex flex-col gap-2">
      <div className="text-pitch">{icon}</div>
      <h3 className="font-black uppercase text-sm tracking-tight">{title}</h3>
      <p className="text-xs text-muted-foreground font-bold">{sub}</p>
    </div>
  );
}

function StatBox({ title, icon, children }: any) {
  return (
    <div className="bg-card border-2 rounded-[2.5rem] p-8 shadow-sm h-full">
      <h3 className="font-black flex items-center gap-2 mb-6 uppercase text-[11px] tracking-[0.2em] text-muted-foreground border-b pb-4">
        {icon} {title}
      </h3>
      <div className="space-y-1">{children}</div>
    </div>
  );
}
