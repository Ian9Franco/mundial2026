"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Group, Match, Team, getBestThirds, computeGroupStandings, getTeamFlagUrl } from "../data/teams";
import { ChungoType, KnockoutMatchDetail, KnockoutResultMode, TeamCondition } from "../data/players";
import { Trophy, CheckCircle, Clock, Award, Globe, Users, Flame, ShieldAlert, Siren, Activity, HeartCrack } from "lucide-react";

interface BracketViewProps {
  groups: Group[];
  allMatches: Record<string, Match[]>;
  manualStandings: Record<string, string[] | null>;
  gdTweaks: Record<string, number>;
  gfTweaks: Record<string, number>;
  hoveredTeam: string | null;
  setHoveredTeam: (teamId: string | null) => void;
  koWinners: Record<string, Team>;
  koMatchDetails: Record<string, KnockoutMatchDetail>;
  teamConditions: Record<string, TeamCondition>;
  onSelectKoWinner: (matchId: string, winner: Team, loser: Team) => void;
  onSetKoScore: (
    matchId: string,
    homeTeam: Team,
    awayTeam: Team,
    homeGoals: number,
    awayGoals: number,
    resultMode: KnockoutResultMode,
    chungoType: ChungoType
  ) => void;
  compareData?: { username: string; predictions: any } | null;
  readOnly?: boolean;
}

type RoundTab = "r32" | "r16" | "qf" | "sf" | "final";
type TeamWithSource = Team & { source: string };
type ScoreDraft = { home: string; away: string; mode: KnockoutResultMode; chungoType: ChungoType };

const CHUNGO_OPTIONS: Array<{
  value: ChungoType;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
}> = [
  { value: "normal", label: "Limpio" },
  { value: "patadas", label: "Patadas", icon: ShieldAlert },
  { value: "ritmo", label: "Ritmo", icon: Activity },
  { value: "roja", label: "Roja", icon: Siren },
  { value: "lesion", label: "Lesión", icon: HeartCrack },
];

const getChungoOption = (type?: ChungoType) =>
  CHUNGO_OPTIONS.find(option => option.value === type);

const placeholderTeam = (id: string, name: string, source = name): TeamWithSource => ({
  id,
  name,
  flag: "placeholder",
  fifaRank: 99,
  source,
});

const R32_BRACKET = [
  { matchNo: 73, home: { type: "runner" as const, group: "A" }, away: { type: "runner" as const, group: "B" } },
  { matchNo: 74, home: { type: "winner" as const, group: "E" }, away: { type: "third" as const, slot: "M74", allowed: ["A", "B", "C", "D", "F"] } },
  { matchNo: 75, home: { type: "winner" as const, group: "F" }, away: { type: "runner" as const, group: "C" } },
  { matchNo: 76, home: { type: "winner" as const, group: "C" }, away: { type: "runner" as const, group: "F" } },
  { matchNo: 77, home: { type: "winner" as const, group: "I" }, away: { type: "third" as const, slot: "M77", allowed: ["C", "D", "F", "G", "H"] } },
  { matchNo: 78, home: { type: "runner" as const, group: "E" }, away: { type: "runner" as const, group: "I" } },
  { matchNo: 79, home: { type: "winner" as const, group: "A" }, away: { type: "third" as const, slot: "M79", allowed: ["C", "E", "F", "H", "I"] } },
  { matchNo: 80, home: { type: "winner" as const, group: "L" }, away: { type: "third" as const, slot: "M80", allowed: ["E", "H", "I", "J", "K"] } },
  { matchNo: 81, home: { type: "winner" as const, group: "D" }, away: { type: "third" as const, slot: "M81", allowed: ["B", "E", "F", "I", "J"] } },
  { matchNo: 82, home: { type: "winner" as const, group: "G" }, away: { type: "third" as const, slot: "M82", allowed: ["A", "E", "H", "I", "J"] } },
  { matchNo: 83, home: { type: "runner" as const, group: "K" }, away: { type: "runner" as const, group: "L" } },
  { matchNo: 84, home: { type: "winner" as const, group: "H" }, away: { type: "runner" as const, group: "J" } },
  { matchNo: 85, home: { type: "winner" as const, group: "B" }, away: { type: "third" as const, slot: "M85", allowed: ["E", "F", "G", "I", "J"] } },
  { matchNo: 86, home: { type: "winner" as const, group: "J" }, away: { type: "runner" as const, group: "H" } },
  { matchNo: 87, home: { type: "winner" as const, group: "K" }, away: { type: "third" as const, slot: "M87", allowed: ["D", "E", "I", "J", "L"] } },
  { matchNo: 88, home: { type: "runner" as const, group: "D" }, away: { type: "runner" as const, group: "G" } },
] as const;

const R16_PAIRINGS = [
  [1, 3],
  [2, 5],
  [4, 6],
  [7, 8],
  [11, 12],
  [9, 10],
  [14, 16],
  [13, 15],
] as const;

export default function BracketView({
  groups,
  allMatches,
  manualStandings,
  gdTweaks,
  gfTweaks,
  hoveredTeam,
  setHoveredTeam,
  koWinners,
  koMatchDetails,
  teamConditions,
  onSelectKoWinner,
  onSetKoScore,
  compareData,
  readOnly = false,
}: BracketViewProps) {
  const [activeRound, setActiveRound] = useState<RoundTab>("r32");
  const [scoreDrafts, setScoreDrafts] = useState<Record<string, ScoreDraft>>({});

  // Compute winners, runners-up, and best thirds from Group Stage
  const winners: Record<string, Team> = {};
  const runnersUp: Record<string, Team> = {};
  
  groups.forEach(g => {
    const standings = computeGroupStandings(g, allMatches[g.id], manualStandings[g.id], gdTweaks, gfTweaks);
    if (standings.length >= 2) {
      winners[g.id] = standings[0].team;
      runnersUp[g.id] = standings[1].team;
    }
  });

  const thirds = getBestThirds(groups, allMatches, manualStandings, gdTweaks, gfTweaks);
  const topThirds = thirds.slice(0, 8);

  const thirdSlots = R32_BRACKET
    .flatMap(match => [match.home, match.away])
    .filter((entry): entry is Extract<typeof R32_BRACKET[number]["home" | "away"], { type: "third" }> => entry.type === "third");

  const assignThirds = () => {
    const assignment: Record<string, typeof topThirds[number]> = {};

    const solve = (slotIdx: number, usedGroups: Set<string>): boolean => {
      if (slotIdx >= thirdSlots.length) return true;
      const slot = thirdSlots[slotIdx];
      const candidates = topThirds.filter(third => (slot.allowed as readonly string[]).includes(third.group) && !usedGroups.has(third.group));

      for (const candidate of candidates) {
        assignment[slot.slot] = candidate;
        usedGroups.add(candidate.group);
        if (solve(slotIdx + 1, usedGroups)) return true;
        usedGroups.delete(candidate.group);
        delete assignment[slot.slot];
      }

      return false;
    };

    if (topThirds.length >= thirdSlots.length && solve(0, new Set())) {
      return assignment;
    }

    const usedGroups = new Set<string>();
    thirdSlots.forEach(slot => {
      const candidate = topThirds.find(third => (slot.allowed as readonly string[]).includes(third.group) && !usedGroups.has(third.group));
      if (candidate) {
        assignment[slot.slot] = candidate;
        usedGroups.add(candidate.group);
      }
    });
    return assignment;
  };

  const thirdAssignments = assignThirds();

  const resolveSeed = (seed: typeof R32_BRACKET[number]["home" | "away"]): TeamWithSource => {
    if (seed.type === "winner") {
      return winners[seed.group]
        ? { ...winners[seed.group], source: `1º Grupo ${seed.group}` }
        : placeholderTeam(`w-${seed.group}`, `1º Grupo ${seed.group}`);
    }

    if (seed.type === "runner") {
      return runnersUp[seed.group]
        ? { ...runnersUp[seed.group], source: `2º Grupo ${seed.group}` }
        : placeholderTeam(`r-${seed.group}`, `2º Grupo ${seed.group}`);
    }

    const third = thirdAssignments[seed.slot];
    return third
      ? { ...third.team, source: `3º Grupo ${third.group}` }
      : placeholderTeam(`t-${seed.slot}`, `3º Grupo ${seed.allowed.join("/")}`, `3º de ${seed.allowed.join("/")}`);
  };

  const getR32Teams = (matchIdx: number): { t1: TeamWithSource; t2: TeamWithSource; matchNo?: number } => {
    const match = R32_BRACKET[matchIdx - 1];
    if (!match) {
      return {
        t1: placeholderTeam("err-1", "Error"),
        t2: placeholderTeam("err-2", "Error"),
      };
    }

    return {
      t1: resolveSeed(match.home),
      t2: resolveSeed(match.away),
      matchNo: match.matchNo,
    };
  };

  // Round of 16 (R16-1 to R16-8)
  const getR16Teams = (matchIdx: number) => {
    const pairing = R16_PAIRINGS[matchIdx - 1];
    const leftMatch = pairing?.[0];
    const rightMatch = pairing?.[1];
    const p1 = leftMatch ? koWinners[`R32-${leftMatch}`] : undefined;
    const p2 = rightMatch ? koWinners[`R32-${rightMatch}`] : undefined;
    return {
      t1: p1 || { id: `r16-p1-${matchIdx}`, name: `Ganador Llave ${leftMatch ?? "?"}`, flag: "placeholder", fifaRank: 99, source: "Fase Anterior" },
      t2: p2 || { id: `r16-p2-${matchIdx}`, name: `Ganador Llave ${rightMatch ?? "?"}`, flag: "placeholder", fifaRank: 99, source: "Fase Anterior" }
    };
  };

  // Quarterfinals (QF-1 to QF-4)
  const getQFTeams = (matchIdx: number) => {
    const p1 = koWinners[`R16-${2 * matchIdx - 1}`];
    const p2 = koWinners[`R16-${2 * matchIdx}`];
    return {
      t1: p1 || { id: `qf-p1-${matchIdx}`, name: `Ganador Octavos ${2 * matchIdx - 1}`, flag: "placeholder", fifaRank: 99, source: "Fase Anterior" },
      t2: p2 || { id: `qf-p2-${matchIdx}`, name: `Ganador Octavos ${2 * matchIdx}`, flag: "placeholder", fifaRank: 99, source: "Fase Anterior" }
    };
  };

  // Semifinals (SF-1 to SF-2)
  const getSFTeams = (matchIdx: number) => {
    const p1 = koWinners[`QF-${2 * matchIdx - 1}`];
    const p2 = koWinners[`QF-${2 * matchIdx}`];
    return {
      t1: p1 || { id: `sf-p1-${matchIdx}`, name: `Ganador Cuartos ${2 * matchIdx - 1}`, flag: "placeholder", fifaRank: 99, source: "Fase Anterior" },
      t2: p2 || { id: `sf-p2-${matchIdx}`, name: `Ganador Cuartos ${2 * matchIdx}`, flag: "placeholder", fifaRank: 99, source: "Fase Anterior" }
    };
  };

  // Third Place Playoff (TP-1)
  const getTPTeams = () => {
    const sf1Winner = koWinners[`SF-1`];
    const sf2Winner = koWinners[`SF-2`];
    const sf1Part1 = koWinners[`QF-1`];
    const sf1Part2 = koWinners[`QF-2`];
    const sf2Part1 = koWinners[`QF-3`];
    const sf2Part2 = koWinners[`QF-4`];

    const loser1 = sf1Winner && (sf1Winner.id === sf1Part1?.id ? sf1Part2 : sf1Part1);
    const loser2 = sf2Winner && (sf2Winner.id === sf2Part1?.id ? sf2Part2 : sf2Part1);

    return {
      t1: loser1 || { id: `tp-p1`, name: "Perdedor Semifinal 1", flag: "placeholder", fifaRank: 99, source: "Semifinal" },
      t2: loser2 || { id: `tp-p2`, name: "Perdedor Semifinal 2", flag: "placeholder", fifaRank: 99, source: "Semifinal" }
    };
  };

  // Final (F-1)
  const getFinalTeams = () => {
    const p1 = koWinners[`SF-1`];
    const p2 = koWinners[`SF-2`];
    return {
      t1: p1 || { id: `f-p1`, name: "Ganador Semifinal 1", flag: "placeholder", fifaRank: 99, source: "Semifinal" },
      t2: p2 || { id: `f-p2`, name: "Ganador Semifinal 2", flag: "placeholder", fifaRank: 99, source: "Semifinal" }
    };
  };

  // Champion (F-1 Winner)
  const champion = koWinners[`F-1`];

  // Helper to render Matchup Item
  const renderMatchup = (matchId: string, label: string, desc: string, t1: Team & { source?: string }, t2: Team & { source?: string }) => {
    const isT1Winner = koWinners[matchId]?.id === t1.id;
    const isT2Winner = koWinners[matchId]?.id === t2.id;
    const isCompleted = isT1Winner || isT2Winner;
    const detail = koMatchDetails[matchId];
    const draft = scoreDrafts[matchId] || {
      home: detail ? String(detail.homeGoals) : "",
      away: detail ? String(detail.awayGoals) : "",
      mode: detail?.resultMode || "regular",
      chungoType: detail?.chungoType || "normal",
    };
    
    const isT1Placeholder = t1.flag === "placeholder";
    const isT2Placeholder = t2.flag === "placeholder";

    const isT1Hovered = hoveredTeam === t1.id;
    const isT2Hovered = hoveredTeam === t2.id;
    const isCardHovered = isT1Hovered || isT2Hovered;

    const t1Condition = teamConditions[t1.id];
    const t2Condition = teamConditions[t2.id];
    const T1ConditionIcon = t1Condition ? getChungoOption(t1Condition.type)?.icon : undefined;
    const T2ConditionIcon = t2Condition ? getChungoOption(t2Condition.type)?.icon : undefined;

    return (
      <motion.div 
        key={matchId} 
        className="matchup-card"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
        whileHover={{ y: -3 }}
        style={{
          borderColor: isCardHovered ? "var(--primary)" : undefined,
          boxShadow: isCardHovered ? "0 0 12px rgba(99,102,241,0.2)" : undefined
        }}
      >
        <div className="matchup-card-header font-mono flex items-center justify-between">
          <span style={{ color: "var(--primary)" }}>{label}</span>
          <div className="flex items-center gap-1.5">
            {isCompleted ? (
              <span className="badge badge-success flex items-center gap-1" style={{ fontSize: "0.55rem", padding: "0.05rem 0.25rem", border: "none" }}>
                <CheckCircle className="w-2.5 h-2.5" /> Ok
              </span>
            ) : (
              <span className="badge flex items-center gap-1" style={{ fontSize: "0.55rem", padding: "0.05rem 0.25rem", border: "none", backgroundColor: "rgba(255,255,255,0.01)", color: "var(--text-muted)" }}>
                <Clock className="w-2.5 h-2.5" /> Pend.
              </span>
            )}
            <span>{desc}</span>
          </div>
        </div>

        {!readOnly && !isT1Placeholder && !isT2Placeholder && (
          <div className="matchup-score-editor">
            <div className="matchup-score-row">
              <input
                type="number"
                min="0"
                inputMode="numeric"
                className="matchup-score-input"
                value={draft.home}
                onChange={(e) =>
                  setScoreDrafts(prev => ({
                    ...prev,
                    [matchId]: { ...draft, home: e.target.value },
                  }))
                }
                aria-label={`Goles de ${t1.name}`}
              />
              <span className="matchup-score-sep">-</span>
              <input
                type="number"
                min="0"
                inputMode="numeric"
                className="matchup-score-input"
                value={draft.away}
                onChange={(e) =>
                  setScoreDrafts(prev => ({
                    ...prev,
                    [matchId]: { ...draft, away: e.target.value },
                  }))
                }
                aria-label={`Goles de ${t2.name}`}
              />
              <div className="matchup-mode-tabs">
                {(["regular", "et", "pens"] as KnockoutResultMode[]).map(mode => (
                  <button
                    key={mode}
                    type="button"
                    className={`matchup-mode-chip ${draft.mode === mode ? "matchup-mode-chip-active" : ""}`}
                    onClick={() =>
                      setScoreDrafts(prev => ({
                        ...prev,
                        [matchId]: { ...draft, mode },
                      }))
                    }
                  >
                    {mode === "regular" ? "90'" : mode === "et" ? "ET" : "PEN"}
                  </button>
                ))}
              </div>
            </div>
            <div className="matchup-chungo-row">
              {CHUNGO_OPTIONS.map(option => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.value}
                    type="button"
                    className={`matchup-chungo-chip ${draft.chungoType === option.value ? "matchup-chungo-chip-active" : ""}`}
                    onClick={() =>
                      setScoreDrafts(prev => ({
                        ...prev,
                        [matchId]: { ...draft, chungoType: option.value },
                      }))
                    }
                    title={option.label}
                  >
                    {Icon ? <Icon className="w-3 h-3" /> : null}
                    <span>{option.label}</span>
                  </button>
                );
              })}
            </div>
            <button
              type="button"
              className="btn btn-primary"
              style={{ width: "100%", minHeight: "36px" }}
              onClick={() => {
                const homeGoals = Number(draft.home);
                const awayGoals = Number(draft.away);
                if (Number.isNaN(homeGoals) || Number.isNaN(awayGoals)) return;
                onSetKoScore(matchId, t1, t2, homeGoals, awayGoals, draft.mode, draft.chungoType);
              }}
            >
              Aplicar resultado
            </button>
          </div>
        )}
        
        {/* Team 1 */}
        <div 
          onClick={() => !readOnly && !isT1Placeholder && onSelectKoWinner(matchId, t1, t2)}
          className={`matchup-team-row ${isT1Winner ? "matchup-team-row-winner" : ""}`}
          style={{ opacity: isT1Placeholder ? 0.45 : 1, cursor: (readOnly || isT1Placeholder) ? "default" : "pointer" }}
          onMouseEnter={() => !readOnly && !isT1Placeholder && setHoveredTeam(t1.id)}
          onMouseLeave={() => setHoveredTeam(null)}
        >
          <div className="flex items-center gap-2 min-w-0">
            {isT1Placeholder ? (
              <Globe className="w-4 h-4 text-slate-600 flex-shrink-0" />
            ) : (
              <img src={getTeamFlagUrl(t1.flag)} alt={t1.name} className="flag-img" />
            )}
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="matchup-team-name-text truncate">{t1.name}</span>
                {isT1Winner && <Award className="w-3 h-3 text-yellow-400 flex-shrink-0" />}
              </div>
              <span className="matchup-team-source truncate">{t1.source || "Fase Anterior"}</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {t1Condition && (
              <span className="badge badge-danger" title={t1Condition.note}>
                {T1ConditionIcon ? <T1ConditionIcon className="w-3 h-3" /> : null}
                {t1Condition.label} x{t1Condition.level}
              </span>
            )}
            {!isT1Placeholder && (
              <span className="font-mono text-center" style={{ fontSize: "0.65rem", padding: "0.1rem 0.3rem", borderRadius: "3px", background: "rgba(255,255,255,0.05)", color: "var(--text-muted)" }}>
                #{t1.fifaRank}
              </span>
            )}
          </div>
        </div>

        {/* Team 2 */}
        <div 
          onClick={() => !readOnly && !isT2Placeholder && onSelectKoWinner(matchId, t2, t1)}
          className={`matchup-team-row ${isT2Winner ? "matchup-team-row-winner" : ""}`}
          style={{ opacity: isT2Placeholder ? 0.45 : 1, cursor: (readOnly || isT2Placeholder) ? "default" : "pointer" }}
          onMouseEnter={() => !readOnly && !isT2Placeholder && setHoveredTeam(t2.id)}
          onMouseLeave={() => setHoveredTeam(null)}
        >
          <div className="flex items-center gap-2 min-w-0">
            {isT2Placeholder ? (
              <Globe className="w-4 h-4 text-slate-600 flex-shrink-0" />
            ) : (
              <img src={getTeamFlagUrl(t2.flag)} alt={t2.name} className="flag-img" />
            )}
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="matchup-team-name-text truncate">{t2.name}</span>
                {isT2Winner && <Award className="w-3 h-3 text-yellow-400 flex-shrink-0" />}
              </div>
              <span className="matchup-team-source truncate">{t2.source || "Fase Anterior"}</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {t2Condition && (
              <span className="badge badge-danger" title={t2Condition.note}>
                {T2ConditionIcon ? <T2ConditionIcon className="w-3 h-3" /> : null}
                {t2Condition.label} x{t2Condition.level}
              </span>
            )}
            {!isT2Placeholder && (
              <span className="font-mono text-center" style={{ fontSize: "0.65rem", padding: "0.1rem 0.3rem", borderRadius: "3px", background: "rgba(255,255,255,0.05)", color: "var(--text-muted)" }}>
                #{t2.fifaRank}
              </span>
            )}
          </div>
        </div>
        {detail && (
          <div className="flex flex-col gap-1" style={{ marginTop: "0.35rem" }}>
            <div className="badge" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", color: "#fff", width: "fit-content" }}>
              {detail.homeGoals}-{detail.awayGoals}
              {detail.resultMode === "et" && <span style={{ color: "var(--accent)" }}> | ET</span>}
              {detail.resultMode === "pens" && detail.penalties && (
                <span style={{ color: "var(--accent)" }}>{` | Pen ${detail.penalties.home}-${detail.penalties.away}`}</span>
              )}
              {detail.chungoType && <span style={{ color: "var(--warning)" }}>{` | ${getChungoOption(detail.chungoType)?.label || "Chungo"}`}</span>}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem" }}>
              {detail.events.map((event, index) => (
                <span
                  key={`${event.playerId}-${index}`}
                  className="comparison-pill"
                  style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)", color: "var(--text-primary)" }}
                >
                  {event.playerName}
                  {event.phase === "et" ? " ET" : ""}
                  {event.assistName ? ` a: ${event.assistName}` : ""}
                </span>
              ))}
            </div>
          </div>
        )}
        {compareData && (() => {
          const otherWinnerId = compareData.predictions?.koWinners?.[matchId];
          if (otherWinnerId && otherWinnerId !== koWinners[matchId]?.id) {
            const otherWinnerName = otherWinnerId === t1.id ? t1.name : otherWinnerId === t2.id ? t2.name : "Fase Anterior";
            return (
              <div style={{ display: "flex", justifyContent: "center", marginTop: "0.25rem" }}>
                <span className="comparison-pill" style={{ margin: 0, display: "inline-flex", alignItems: "center" }}>
                  <Users className="w-3 h-3 text-amber-400 mr-1" /> {compareData.username}: avanza {otherWinnerName}
                </span>
              </div>
            );
          }
          return null;
        })()}
      </motion.div>
    );
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Banner explicativo */}
      {readOnly ? (
        <div className="glass-panel" style={{ padding: "1.25rem", border: "1px solid rgba(245, 158, 11, 0.3)", background: "rgba(245, 158, 11, 0.03)" }}>
          <h2 className="flex items-center gap-2" style={{ fontSize: "1.2rem", fontWeight: "800", color: "#fbbf24" }}>
            <Award className="w-5 h-5 text-amber-400" />
            Predicción Guardada (Solo Lectura)
          </h2>
          <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "0.3rem" }}>
            Estás visualizando las elecciones de este usuario para la fase eliminatoria directa. Las pestañas de ronda siguen siendo interactivas.
          </p>
        </div>
      ) : (
        <div className="glass-panel" style={{ padding: "1.25rem" }}>
          <h2 className="flex items-center gap-2" style={{ fontSize: "1.3rem", fontWeight: "800", color: "#fff" }}>
            <Flame className="w-5 h-5 text-indigo-400 animate-pulse" />
            El Cuadro de Eliminación Directa
          </h2>
        </div>
      )}

      {/* Champion Podium Display */}
      {champion && (
        <div className="champion-podium">
          <div className="trophy-glow flex justify-center items-center" style={{ minHeight: "80px" }}>
            <Trophy className="w-16 h-16 text-yellow-400 animate-bounce" />
          </div>
          <img 
            src={getTeamFlagUrl(champion.flag)} 
            alt={champion.name} 
            className="champion-flag" 
          />
          <h2 className="champion-title">{champion.name}</h2>
          <p className="champion-sub font-mono semibold">CAMPEÓN DEL MUNDO</p>
        </div>
      )}

      {/* Round Tabs Navigation */}
      <div className="bracket-rounds-nav">
        <button
          onClick={() => setActiveRound("r32")}
          className={`bracket-round-btn ${activeRound === "r32" ? "bracket-round-btn-active" : ""}`}
        >
          16avos (32)
        </button>
        <button
          onClick={() => setActiveRound("r16")}
          className={`bracket-round-btn ${activeRound === "r16" ? "bracket-round-btn-active" : ""}`}
        >
          Octavos (16)
        </button>
        <button
          onClick={() => setActiveRound("qf")}
          className={`bracket-round-btn ${activeRound === "qf" ? "bracket-round-btn-active" : ""}`}
        >
          Cuartos (8)
        </button>
        <button
          onClick={() => setActiveRound("sf")}
          className={`bracket-round-btn ${activeRound === "sf" ? "bracket-round-btn-active" : ""}`}
        >
          Semifinales (4)
        </button>
        <button
          onClick={() => setActiveRound("final")}
          className={`bracket-round-btn ${activeRound === "final" ? "bracket-round-btn-active" : ""}`}
        >
          Finales (2)
        </button>
      </div>

      {/* Bracket Active View */}
      <div className="bracket-grid">
        {activeRound === "r32" &&
          Array.from({ length: 16 }).map((_, idx) => {
            const mIdx = idx + 1;
            const teams = getR32Teams(mIdx);
            return renderMatchup(`R32-${mIdx}`, `16avo ${mIdx}`, `Partido FIFA ${teams.matchNo ?? mIdx}`, teams.t1, teams.t2);
          })}

        {activeRound === "r16" &&
          Array.from({ length: 8 }).map((_, idx) => {
            const mIdx = idx + 1;
            const teams = getR16Teams(mIdx);
            return renderMatchup(`R16-${mIdx}`, `Octavos ${mIdx}`, "Ganadores de llaves FIFA", teams.t1, teams.t2);
          })}

        {activeRound === "qf" &&
          Array.from({ length: 4 }).map((_, idx) => {
            const mIdx = idx + 1;
            const teams = getQFTeams(mIdx);
            return renderMatchup(`QF-${mIdx}`, `Cuartos ${mIdx}`, "Ganadores Octavos", teams.t1, teams.t2);
          })}

        {activeRound === "sf" &&
          Array.from({ length: 2 }).map((_, idx) => {
            const mIdx = idx + 1;
            const teams = getSFTeams(mIdx);
            return renderMatchup(`SF-${mIdx}`, `Semifinal ${mIdx}`, "Ganadores Cuartos", teams.t1, teams.t2);
          })}

        {activeRound === "final" && (
          <>
            {/* Third Place Match */}
            {(() => {
              const teams = getTPTeams();
              return renderMatchup("TP-1", "Tercer Puesto", "Perdedores Semis", teams.t1, teams.t2);
            })()}

            {/* Final Match */}
            {(() => {
              const teams = getFinalTeams();
              return renderMatchup("F-1", "Gran Final", "Ganadores Semis", teams.t1, teams.t2);
            })()}
          </>
        )}
      </div>
    </div>
  );
}
