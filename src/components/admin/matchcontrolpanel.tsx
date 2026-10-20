"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
}
from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Flag, Plus, Trash2, Video, Trophy, Upload } from "lucide-react";
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

  // Finalize / Highlights state
  const [report, setReport] = useState(match.report || "");
  const [highlightsUrl, setHighlightsUrl] = useState(match.highlightsUrl || "");
  const [highlightsTitle, setHighlightsTitle] = useState(
    match.highlightsTitle || "",
  );
  const [mvpPlayerId, setMvpPlayerId] = useState(
    match.mvpAward?.playerId || "",
  );
  const [mvpCitation, setMvpCitation] = useState(
    match.mvpAward?.citation || "",
  );
  const [mvpPhotoUrl, setMvpPhotoUrl] = useState(
    match.mvpAward?.photoUrl || "",
  );

  // Event Input Form state
  const [eventMin, setEventMin] = useState("");
  const [eventType, setEventType] = useState("GOAL");
  const [eventTeam, setEventTeam] = useState<"HOME" | "AWAY">("HOME");
  const [eventPlayer, setEventPlayer] = useState("");

  const addEvent = () => {
    if (!eventMin || !eventPlayer) {
      toast.error("Please provide minute and player");
      return;
    }
    const newEvent = {
      id: crypto.randomUUID(),
      minute: Number(eventMin),
      type: eventType,
      team: eventTeam,
      player: eventPlayer,
    };
    const updatedEvents = [...events, newEvent].sort(
      (a, b) => a.minute - b.minute,
    );
    setEvents(updatedEvents);

    // Auto-increment score if it's a Goal
    if (eventType === "GOAL") {
      if (eventTeam === "HOME") setHomeScore((prev: number) => prev + 1);
      else setAwayScore((prev: number) => prev + 1);
    }

    setEventMin("");
    setEventPlayer("");
    toast.success("Event added. Remember to click 'Sync Live'.");
  };

  const removeEvent = (index: number) => {
    setEvents(events.filter((_, i) => i !== index));
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);

    const toastId = toast.loading("Uploading video highlight...");
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.url) {
        setHighlightsUrl(data.url);
        toast.success("Highlights video uploaded!", { id: toastId });
      }
    } catch {
      toast.error("Video upload failed", { id: toastId });
    }
  };

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
    toast.success("Live Match Data Synced Online!");
  };

  const finalize = async () => {
    const res = await fetch(`/api/matches/${match.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "finalize",
        report,
        highlightsUrl,
        highlightsTitle,
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
      toast.success("Match marked as FINISHED and Highlights Published!");
      location.reload();
    }
  };

  return (
    <div className="space-y-8">
      {/* 1. Real-Time Score Stepper */}
      <div className="rounded-[2rem] border-2 p-8 space-y-6 bg-card">
        <div className="flex justify-between items-center">
          <h3 className="font-black italic uppercase tracking-tighter">
            Live Scoreboard
          </h3>
          <Button
            onClick={saveLiveState}
            className="bg-pitch hover:bg-pitch-dark text-white rounded-xl font-bold"
          >
            Sync Live Feed
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

        {/* Penalty Shootout Switch */}
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
            <div className="flex items-center gap-8 bg-muted/50 p-4 rounded-2xl border border-sky/20">
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

      {/* 2. Sofascore / FotMob Match Timeline Editor */}
      <div className="rounded-[2rem] border-2 p-8 space-y-6 bg-card">
        <h3 className="font-black uppercase tracking-tight text-sm flex items-center gap-2">
          ⚡ Match Event Feed (FotMob Style)
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <Input
            type="number"
            placeholder="Min '"
            value={eventMin}
            onChange={(e) => setEventMin(e.target.value)}
          />
          <Select value={eventType} onValueChange={setEventType}>
            <SelectTrigger>
              <SelectValue placeholder="Event" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="GOAL">⚽ Goal</SelectItem>
              <SelectItem value="YELLOW">🟨 Yellow Card</SelectItem>
              <SelectItem value="RED">🟥 Red Card</SelectItem>
              <SelectItem value="SUB">🔄 Substitution</SelectItem>
            </SelectContent>
          </Select>
          <Select value={eventTeam} onValueChange={(v: any) => setEventTeam(v)}>
            <SelectTrigger>
              <SelectValue placeholder="Team" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="HOME">{match.homeTeam.name}</SelectItem>
              <SelectItem value="AWAY">{match.awayTeam.name}</SelectItem>
            </SelectContent>
          </Select>
          <Input
            placeholder="Player Name"
            value={eventPlayer}
            onChange={(e) => setEventPlayer(e.target.value)}
          />
          <Button onClick={addEvent} className="bg-pitch text-white">
            <Plus className="h-4 w-4 mr-1" /> Add
          </Button>
        </div>

        {/* List of active events */}
        <div className="space-y-2 pt-4">
          {events.map((e, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 rounded-xl border bg-muted/20 text-xs font-bold"
            >
              <span>
                {e.minute}' •{" "}
                {e.type === "GOAL" ? "⚽" : e.type === "YELLOW" ? "🟨" : "🟥"}{" "}
                {e.player} (
                {e.team === "HOME" ? match.homeTeam.name : match.awayTeam.name})
              </span>
              <button
                onClick={() => removeEvent(index)}
                className="text-danger hover:opacity-80"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Finalize & Video Media Highlights */}
      <Button
        onClick={() => setFinalizeOpen(true)}
        variant="destructive"
        className="w-full h-14 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-danger/20"
      >
        <Flag className="mr-2 h-5 w-5" /> End Match & Publish Highlights Video
      </Button>

      {/* Finalize Modal */}
      <Dialog open={finalizeOpen} onOpenChange={setFinalizeOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-black uppercase">
              Publish Match Highlights & Finalize
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-3">
            {/* Highlights Section */}
            <div className="p-4 rounded-xl border bg-pitch/5 space-y-3">
              <label className="text-xs font-black uppercase text-pitch flex items-center gap-2">
                <Video className="h-4 w-4" /> Match Highlights Video
              </label>
              <Input
                placeholder="Video Title (e.g., Grand Final Highlights & Goals)"
                value={highlightsTitle}
                onChange={(e) => setHighlightsTitle(e.target.value)}
              />
              <Input
                placeholder="YouTube / Video Embed URL (e.g., https://youtube.com/watch?v=...)"
                value={highlightsUrl}
                onChange={(e) => setHighlightsUrl(e.target.value)}
              />
              <div className="text-center text-xs font-bold text-muted-foreground">
                - OR UPLOAD LOCAL MP4 -
              </div>
              <input
                type="file"
                accept="video/mp4,video/webm"
                onChange={handleVideoUpload}
                className="text-xs"
              />
            </div>

            {/* MVP Details */}
            <div>
              <label className="text-xs font-bold">
                Man of the Match (Player)
              </label>
              <Select value={mvpPlayerId} onValueChange={setMvpPlayerId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select MVP..." />
                </SelectTrigger>
                <SelectContent>
                  {players.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Input
              placeholder="MVP Citation / Comment"
              value={mvpCitation}
              onChange={(e) => setMvpCitation(e.target.value)}
            />
            <Textarea
              placeholder="Official Match Report / Summary..."
              value={report}
              onChange={(e) => setReport(e.target.value)}
              rows={4}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setFinalizeOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={finalize}
              className="bg-pitch hover:bg-pitch-dark text-white font-bold"
            >
              Confirm & Publish
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ScoreStepper({ label, value, onChange }: any) {
  return (
    <div className="flex flex-col items-center gap-3">
      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
        {label}
      </span>
      <div className="flex items-center gap-4 bg-muted p-2 rounded-2xl border">
        <button
          className="h-10 w-10 bg-card rounded-xl font-bold hover:bg-pitch hover:text-white"
          onClick={() => onChange(Math.max(0, value - 1))}
        >
          −
        </button>
        <span className="w-10 text-center text-4xl font-black italic">
          {value}
        </span>
        <button
          className="h-10 w-10 bg-card rounded-xl font-bold hover:bg-pitch hover:text-white"
          onClick={() => onChange(value + 1)}
        >
          +
        </button>
      </div>
    </div>
  );
}
