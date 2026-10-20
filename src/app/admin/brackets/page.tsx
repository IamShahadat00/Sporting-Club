"use client";

import { useState, useEffect } from "react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ArrowLeft, RefreshCcw } from "lucide-react";
import Link from "next/link";

export default function BracketsAdminPage() {
  const [seasons, setSeasons] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [selectedSeason, setSelectedSeason] = useState("");
  const [nodes, setNodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/tournaments")
      .then((r) => r.json())
      .then(setSeasons);
    fetch("/api/matches")
      .then((r) => r.json())
      .then(setMatches);
  }, []);

  const loadBracket = async (id: string) => {
    const res = await fetch(`/api/brackets?seasonId=${id}`);
    const data = await res.json();
    // FIX: API now returns a flat array, so no .flat() needed
    setNodes(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    if (selectedSeason) loadBracket(selectedSeason);
  }, [selectedSeason]);

  const handleGenerate = async () => {
    if (!selectedSeason) return;
    setLoading(true);
    const res = await fetch("/api/brackets", {
      method: "POST",
      body: JSON.stringify({ seasonId: selectedSeason }),
    });
    setLoading(false);
    if (res.ok) {
      toast.success("Standard Playoff Slots created!");
      loadBracket(selectedSeason);
    }
  };

  const updateSlot = async (nodeId: string, matchId: string) => {
    await fetch("/api/brackets", {
      method: "PATCH",
      body: JSON.stringify({ nodeId, matchId }),
    });
    toast.success("Slot updated");
    loadBracket(selectedSeason);
  };

  return (
    <div className="max-w-5xl mx-auto p-8 space-y-10">
      <Link
        href="/admin/dashboard"
        className="inline-flex items-center gap-2 text-muted-foreground hover:text-pitch font-black uppercase text-xs transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Dashboard
      </Link>

      <div className="flex justify-between items-center bg-card p-6 border-2 rounded-[2rem]">
        <h1 className="text-2xl font-black uppercase italic tracking-tighter">
          Playoff Setup
        </h1>
        <div className="flex gap-4">
          <Select
            value={selectedSeason || ""}
            onValueChange={(val: any) => setSelectedSeason(val || "")}
          >
            <SelectTrigger className="w-64 h-12 rounded-xl">
              <SelectValue placeholder="Select Season" />
            </SelectTrigger>
            <SelectContent>
              {/* FIX: Displays s.name instead of ID */}
              {seasons.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            onClick={handleGenerate}
            disabled={!selectedSeason || loading}
            className="bg-pitch h-12 rounded-xl"
          >
            <RefreshCcw
              className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`}
            />{" "}
            Initialize Slots
          </Button>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        {nodes.map((node) => (
          <div
            key={node.id}
            className="p-6 border-2 rounded-[2rem] bg-card space-y-4 shadow-sm"
          >
            <p className="font-black text-pitch uppercase text-[10px] tracking-[0.2em]">
              {node.label}
            </p>
            <Select
              value={node.matchId || "none"}
              onValueChange={(val) => updateSlot(node.id, val)}
            >
              <SelectTrigger className="h-12 rounded-xl">
                <SelectValue placeholder="Assign a match..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Empty / To Be Decided</SelectItem>
                {matches
                  .filter((m) => m.seasonId === selectedSeason)
                  .map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      Match #{m.matchNumber}: {m.homeTeam.name} v{" "}
                      {m.awayTeam.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        ))}
      </div>
    </div>
  );
}
