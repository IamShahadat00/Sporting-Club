"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Shield, Users } from "lucide-react";
import { toast } from "sonner";

export default function RegistrationsAdminPage() {
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [filter, setFilter] = useState<"PENDING" | "APPROVED" | "REJECTED">(
    "PENDING",
  );
  const [selectedTeams, setSelectedTeams] = useState<Record<string, string>>(
    {},
  );

  const load = async () => {
    const [rRes, tRes] = await Promise.all([
      fetch(`/api/registrations?status=${filter}`).then((r) => r.json()),
      fetch("/api/teams").then((r) => r.json()),
    ]);
    const regs = Array.isArray(rRes) ? rRes : [];
    setRegistrations(regs);
    setTeams(Array.isArray(tRes) ? tRes : []);

    const initialTeams: Record<string, string> = {};
    regs.forEach((r) => {
      initialTeams[r.id] = r.player?.teamId || "none";
    });
    setSelectedTeams(initialTeams);
  };

  useEffect(() => {
    load();
  }, [filter]);

  const decide = async (id: string, status: "APPROVED" | "REJECTED") => {
    const assignedTeamId = selectedTeams[id];

    const res = await fetch("/api/registrations", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id,
        status,
        teamId: assignedTeamId === "none" ? null : assignedTeamId,
      }),
    });

    if (res.ok) {
      toast.success(
        status === "APPROVED"
          ? "Player approved and assigned to squad!"
          : "Registration rejected.",
      );
      load();
    } else {
      toast.error("Failed to update registration.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-foreground">
            Player Registration & Squad Entry
          </h1>
          <p className="text-xs text-muted-foreground font-medium">
            Review registered athletes and assign them directly into official
            team squads.
          </p>
        </div>

        <div className="flex gap-2">
          {(["PENDING", "APPROVED", "REJECTED"] as const).map((s) => (
            <Button
              key={s}
              size="sm"
              variant={filter === s ? "default" : "outline"}
              onClick={() => setFilter(s)}
              className={
                filter === s
                  ? "bg-pitch text-white font-black"
                  : "text-xs font-bold"
              }
            >
              {s}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {registrations.map((reg) => {
          const currentTeam = teams.find(
            (t) => t.id === (selectedTeams[reg.id] || reg.player?.teamId),
          );

          return (
            <Card
              key={reg.id}
              className="border border-border rounded-2xl overflow-hidden shadow-sm bg-card flex flex-col justify-between"
            >
              <CardContent className="p-5 space-y-4">
                {/* Player Photo + Team Frame */}
                <div className="flex items-start gap-3.5">
                  <div className="relative shrink-0">
                    <div className="h-14 w-14 rounded-2xl overflow-hidden bg-muted border-2 border-border shadow-sm">
                      {reg.player?.photoUrl ? (
                        <img
                          src={reg.player.photoUrl}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center font-black text-sm text-muted-foreground">
                          {reg.player?.name?.[0] || "?"}
                        </div>
                      )}
                    </div>

                    {/* Team Crest Frame Badge */}
                    {currentTeam?.logoUrl ? (
                      <div className="absolute -bottom-2 -right-2 h-7 w-7 rounded-full bg-background border-2 border-pitch p-0.5 shadow-md">
                        <img
                          src={currentTeam.logoUrl}
                          alt=""
                          className="h-full w-full object-contain rounded-full"
                        />
                      </div>
                    ) : (
                      <div className="absolute -bottom-2 -right-2 h-6 w-6 rounded-full bg-muted border border-border flex items-center justify-center text-[9px] font-bold text-muted-foreground">
                        FA
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="font-black text-base uppercase truncate text-foreground">
                      {reg.player?.name}
                    </p>
                    <p className="text-xs font-bold text-pitch uppercase tracking-wider">
                      {reg.player?.position} • #
                      {reg.player?.jerseyNumber ?? "-"}
                    </p>
                    <Badge
                      variant="outline"
                      className="mt-1 text-[10px] font-bold border-border"
                    >
                      {reg.season?.name}
                    </Badge>
                  </div>
                </div>

                {/* Team Assignment Selector */}
                <div className="space-y-1.5 pt-2 border-t border-border">
                  <label className="text-[10px] font-black uppercase text-muted-foreground tracking-wider flex items-center gap-1">
                    <Shield className="h-3 w-3 text-pitch" /> Squad Assignment:
                  </label>
                  <select
                    value={
                      selectedTeams[reg.id] ?? reg.player?.teamId ?? "none"
                    }
                    onChange={(e) =>
                      setSelectedTeams((prev) => ({
                        ...prev,
                        [reg.id]: e.target.value,
                      }))
                    }
                    className="w-full bg-background border border-border rounded-xl px-3 py-1.5 text-xs font-bold text-foreground focus:border-pitch outline-none cursor-pointer"
                  >
                    <option value="none">-- Free Agent / Unassigned --</option>
                    {teams.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Actions */}
                <div className="pt-2 flex items-center justify-between gap-2 border-t border-border">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">
                    Status:{" "}
                    <strong className="text-foreground">{reg.status}</strong>
                  </span>

                  <div className="flex gap-1.5">
                    {filter === "PENDING" ? (
                      <>
                        <Button
                          size="sm"
                          onClick={() => decide(reg.id, "APPROVED")}
                          className="h-8 bg-pitch hover:bg-pitch-dark text-white font-bold text-xs rounded-xl"
                        >
                          <Check className="h-3.5 w-3.5 mr-1" /> Approve & Add
                          to Squad
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => decide(reg.id, "REJECTED")}
                          className="h-8 rounded-xl px-2.5"
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => decide(reg.id, reg.status)}
                        className="h-8 text-xs font-bold rounded-xl border-border hover:bg-muted"
                      >
                        Update Squad
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {registrations.length === 0 && (
          <div className="col-span-full py-16 text-center border-2 border-dashed border-border rounded-3xl text-xs text-muted-foreground uppercase font-bold">
            No {filter.toLowerCase()} registrations.
          </div>
        )}
      </div>
    </div>
  );
}
