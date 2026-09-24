export function MvpCard({ mvpAward }: { mvpAward: any }) {
  if (!mvpAward) return null;

  return (
    <div className="rounded-[2rem] border-2 border-gold/20 bg-gradient-to-br from-gold/5 to-transparent p-6 flex gap-6 items-center shadow-sm">
      {/* Only render img if photoUrl is a valid non-empty string */}
      {mvpAward.photoUrl && mvpAward.photoUrl.trim() !== "" ? (
        <img
          src={mvpAward.photoUrl}
          alt={mvpAward.player.name}
          className="h-20 w-20 rounded-full object-cover border-4 border-gold shadow-md"
        />
      ) : (
        <div className="h-20 w-20 rounded-full bg-muted border-4 border-gold/20 flex items-center justify-center font-black text-gold/20">
          MVP
        </div>
      )}
      <div>
        <span className="text-[10px] font-black text-gold uppercase tracking-[0.3em]">
          Man of the match
        </span>
        <h4 className="text-xl font-black uppercase italic italic">
          {mvpAward.player.name}
        </h4>
        <p className="text-sm text-muted-foreground italic mt-1 font-medium leading-tight">
          "{mvpAward.citation}"
        </p>
      </div>
    </div>
  );
}
