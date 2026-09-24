"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { Radio, Flag, Plus, Trash2, Trophy, SwitchCamera } from "lucide-react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export function MatchControlPanel({
  match,
  players,
}: {
  match: any;
  players: any[];
}) {
  const [finalizeOpen, setFinalizeOpen] = useState(false);
  const [homeScore, setHomeScore] = useState(match.homeScore);
  const [awayScore, setAwayScore] = useState(match.awayScore);
  const [isPenalty, setIsPenalty] = useState(match.isPenalty || false);
  const [homePens, setHomePens] = useState(match.homePens || 0);
  const [awayPens, setAwayPens] = useState(match.awayPens || 0);
  const [events, setEvents] = useState<any[]>(match.events || []);
  const [report, setReport] = useState(match.report || "");
  const [mvpPlayerId, setMvpPlayerId] = useState(
    match.mvpAward?.playerId || "",
  );
  const [mvpCitation, setMvpCitation] = useState(
    match.mvpAward?.citation || "",
  );
  const [mvpPhotoUrl, setMvpPhotoUrl] = useState(
    match.mvpAward?.photoUrl || "",
  );

  const saveLiveState = async () => {
    await fetch(`/api/matches/${match.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "score",
        homeScore,
        awayScore,
        events,
        isPenalty,
        homePens,
        awayPens,
      }),
    });
    toast.success("Live Match Data Synced");
  };

  const finalize = async () => {
    const res = await fetch(`/api/matches/${match.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "finalize",
        report,
        mvpPlayerId,
        mvpCitation,
        mvpPhotoUrl,
        homeScore,
        awayScore,
        events,
        isPenalty,
        homePens,
        awayPens,
      }),
    });
    if (res.ok) {
      toast.success("Result Published!");
      location.reload();
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Scoreboard */}
      <div className="rounded-[2rem] border-2 p-8 space-y-6 bg-card">
        <div className="flex justify-between items-center">
          <h3 className="font-black italic uppercase tracking-tighter">
            Live Scoreboard
          </h3>
          <Button
            size="sm"
            onClick={saveLiveState}
            className="bg-pitch text-white rounded-xl font-bold"
          >
            Sync Live
          </Button>
        </div>

        <div className="flex items-center gap-12 justify-center py-6">
          <ScoreStepper
            label={match.homeTeam.name}
            value={homeScore}
            onChange={setHomeScore}
          />
          <div className="text-4xl font-black opacity-20">:</div>
          <ScoreStepper
            label={match.awayTeam.name}
            value={awayScore}
            onChange={setAwayScore}
          />
        </div>

        {/* Penalty Section */}
        <div className="pt-6 border-t flex flex-col items-center gap-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="penalty-mode"
              checked={isPenalty}
              onCheckedChange={setIsPenalty}
            />
            <Label
              htmlFor="penalty-mode"
              className="text-[10px] font-black uppercase"
            >
              Enable Penalty Shootout
            </Label>
          </div>

          {isPenalty && (
            <div className="flex items-center gap-8 bg-muted/50 p-4 rounded-2xl border border-sky/20 scale-90 transition-all">
              <input
                type="number"
                className="w-12 bg-transparent text-center font-black text-2xl"
                value={homePens}
                onChange={(e) => setHomePens(Number(e.target.value))}
              />
              <span className="text-xs font-black opacity-40">PENALTIES</span>
              <input
                type="number"
                className="w-12 bg-transparent text-center font-black text-2xl"
                value={awayPens}
                onChange={(e) => setAwayPens(Number(e.target.value))}
              />
            </div>
          )}
        </div>
      </div>

      {/* 2. Timeline Editor (Logic already provided in your file) */}
      {/* ... Add event logic here ... */}

      <Button
        onClick={() => setFinalizeOpen(true)}
        variant="destructive"
        className="w-full h-14 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-danger/20"
      >
        <Flag className="mr-2 h-5 w-5" /> End Match & Finalize MVP
      </Button>

      {/* Finalize Dialog logic remains similar to previous version, ensuring it sends isPenalty/Pens */}
      <Dialog open={finalizeOpen} onOpenChange={setFinalizeOpen}>
        {/* ... Dialog Content ... */}
        <Button onClick={finalize} className="bg-pitch text-white w-full">
          Publish to Website
        </Button>
      </Dialog>
    </div>
  );
}

function ScoreStepper({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex flex-col items-center gap-3">
      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
        {label}
      </span>
      <div className="flex items-center gap-4 bg-muted p-2 rounded-2xl border">
        <button
          className="h-10 w-10 bg-card rounded-xl font-bold hover:bg-pitch hover:text-white transition-colors"
          onClick={() => onChange(Math.max(0, value - 1))}
        >
          −
        </button>
        <span className="w-10 text-center text-4xl font-black italic">
          {value}
        </span>
        <button
          className="h-10 w-10 bg-card rounded-xl font-bold hover:bg-pitch hover:text-white transition-colors"
          onClick={() => onChange(value + 1)}
        >
          +
        </button>
      </div>
    </div>
  );
}
