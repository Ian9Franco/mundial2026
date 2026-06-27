"use client";

import React, { useState } from "react";
import { Group, Match, Team, getBestThirds, computeGroupStandings, getTeamFlagUrl } from "../data/teams";
import { Swords, Trophy, CheckCircle, Clock, Award, Globe, Users, Flame } from "lucide-react";

interface BracketViewProps {
  groups: Group[];
  allMatches: Record<string, Match[]>;
  manualStandings: Record<string, string[] | null>;
  gdTweaks: Record<string, number>;
  gfTweaks: Record<string, number>;
  hoveredTeam: string | null;
  setHoveredTeam: (teamId: string | null) => void;
  koWinners: Record<string, Team>;
  onSelectKoWinner: (matchId: string, winner: Team, loser: Team) => void;
  compareData?: { username: string; predictions: any } | null;
}

type RoundTab = "r32" | "r16" | "qf" | "sf" | "final";

export default function BracketView({
  groups,
  allMatches,
  manualStandings,
  gdTweaks,
  gfTweaks,
  hoveredTeam,
  setHoveredTeam,
  koWinners,
  onSelectKoWinner,
  compareData,
}: BracketViewProps) {
  const [activeRound, setActiveRound] = useState<RoundTab>("r32");

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

  // Helper to fetch group phase qualifiers
  const getGroupWinner = (gid: string) => winners[gid];
  const getGroupRunnerUp = (gid: string) => runnersUp[gid];
  const getGroupThird = (rankIdx: number) => {
    if (topThirds[rankIdx]) {
      return {
        ...topThirds[rankIdx].team,
        source: `3º Grupo ${topThirds[rankIdx].group} (${rankIdx + 1}º)`
      };
    }
    return null;
  };

  // Define Round of 32 participants (R32-1 to R32-16) with proper local variable narrowing
  const getR32Teams = (matchIdx: number): { t1: Team & { source: string }; t2: Team & { source: string } } => {
    switch (matchIdx) {
      case 1: {
        const wA = getGroupWinner("A");
        const t7 = getGroupThird(7);
        return {
          t1: wA ? { ...wA, source: "1º Grupo A" } : { id: "w-A", name: "1º Grupo A", flag: "placeholder", fifaRank: 99, source: "1º Grupo A" },
          t2: t7 ? { ...t7, source: "8º Mejor 3º" } : { id: "t-7", name: "8º Mejor 3º", flag: "placeholder", fifaRank: 99, source: "8º Mejor 3º" }
        };
      }
      case 2: {
        const rB = getGroupRunnerUp("B");
        const rF = getGroupRunnerUp("F");
        return {
          t1: rB ? { ...rB, source: "2º Grupo B" } : { id: "r-B", name: "2º Grupo B", flag: "placeholder", fifaRank: 99, source: "2º Grupo B" },
          t2: rF ? { ...rF, source: "2º Grupo F" } : { id: "r-F", name: "2º Grupo F", flag: "placeholder", fifaRank: 99, source: "2º Grupo F" }
        };
      }
      case 3: {
        const wC = getGroupWinner("C");
        const t6 = getGroupThird(6);
        return {
          t1: wC ? { ...wC, source: "1º Grupo C" } : { id: "w-C", name: "1º Grupo C", flag: "placeholder", fifaRank: 99, source: "1º Grupo C" },
          t2: t6 ? { ...t6, source: "7º Mejor 3º" } : { id: "t-6", name: "7º Mejor 3º", flag: "placeholder", fifaRank: 99, source: "7º Mejor 3º" }
        };
      }
      case 4: {
        const rD = getGroupRunnerUp("D");
        const rH = getGroupRunnerUp("H");
        return {
          t1: rD ? { ...rD, source: "2º Grupo D" } : { id: "r-D", name: "2º Grupo D", flag: "placeholder", fifaRank: 99, source: "2º Grupo D" },
          t2: rH ? { ...rH, source: "2º Grupo H" } : { id: "r-H", name: "2º Grupo H", flag: "placeholder", fifaRank: 99, source: "2º Grupo H" }
        };
      }
      case 5: {
        const wE = getGroupWinner("E");
        const t5 = getGroupThird(5);
        return {
          t1: wE ? { ...wE, source: "1º Grupo E" } : { id: "w-E", name: "1º Grupo E", flag: "placeholder", fifaRank: 99, source: "1º Grupo E" },
          t2: t5 ? { ...t5, source: "6º Mejor 3º" } : { id: "t-5", name: "6º Mejor 3º", flag: "placeholder", fifaRank: 99, source: "6º Mejor 3º" }
        };
      }
      case 6: {
        const rA = getGroupRunnerUp("A");
        const rC = getGroupRunnerUp("C");
        return {
          t1: rA ? { ...rA, source: "2º Grupo A" } : { id: "r-A", name: "2º Grupo A", flag: "placeholder", fifaRank: 99, source: "2º Grupo A" },
          t2: rC ? { ...rC, source: "2º Grupo C" } : { id: "r-C", name: "2º Grupo C", flag: "placeholder", fifaRank: 99, source: "2º Grupo C" }
        };
      }
      case 7: {
        const wG = getGroupWinner("G");
        const t4 = getGroupThird(4);
        return {
          t1: wG ? { ...wG, source: "1º Grupo G" } : { id: "w-G", name: "1º Grupo G", flag: "placeholder", fifaRank: 99, source: "1º Grupo G" },
          t2: t4 ? { ...t4, source: "5º Mejor 3º" } : { id: "t-4", name: "5º Mejor 3º", flag: "placeholder", fifaRank: 99, source: "5º Mejor 3º" }
        };
      }
      case 8: {
        const rI = getGroupRunnerUp("I");
        const rK = getGroupRunnerUp("K");
        return {
          t1: rI ? { ...rI, source: "2º Grupo I" } : { id: "r-I", name: "2º Grupo I", flag: "placeholder", fifaRank: 99, source: "2º Grupo I" },
          t2: rK ? { ...rK, source: "2º Grupo K" } : { id: "r-K", name: "2º Grupo K", flag: "placeholder", fifaRank: 99, source: "2º Grupo K" }
        };
      }
      case 9: {
        const wB = getGroupWinner("B");
        const t3 = getGroupThird(3);
        return {
          t1: wB ? { ...wB, source: "1º Grupo B" } : { id: "w-B", name: "1º Grupo B", flag: "placeholder", fifaRank: 99, source: "1º Grupo B" },
          t2: t3 ? { ...t3, source: "4º Mejor 3º" } : { id: "t-3", name: "4º Mejor 3º", flag: "placeholder", fifaRank: 99, source: "4º Mejor 3º" }
        };
      }
      case 10: {
        const rE = getGroupRunnerUp("E");
        const rG = getGroupRunnerUp("G");
        return {
          t1: rE ? { ...rE, source: "2º Grupo E" } : { id: "r-E", name: "2º Grupo E", flag: "placeholder", fifaRank: 99, source: "2º Grupo E" },
          t2: rG ? { ...rG, source: "2º Grupo G" } : { id: "r-G", name: "2º Grupo G", flag: "placeholder", fifaRank: 99, source: "2º Grupo G" }
        };
      }
      case 11: {
        const wD = getGroupWinner("D");
        const t2 = getGroupThird(2);
        return {
          t1: wD ? { ...wD, source: "1º Grupo D" } : { id: "w-D", name: "1º Grupo D", flag: "placeholder", fifaRank: 99, source: "1º Grupo D" },
          t2: t2 ? { ...t2, source: "3º Mejor 3º" } : { id: "t-2", name: "3º Mejor 3º", flag: "placeholder", fifaRank: 99, source: "3º Mejor 3º" }
        };
      }
      case 12: {
        const rJ = getGroupRunnerUp("J");
        const rL = getGroupRunnerUp("L");
        return {
          t1: rJ ? { ...rJ, source: "2º Grupo J" } : { id: "r-J", name: "2º Grupo J", flag: "placeholder", fifaRank: 99, source: "2º Grupo J" },
          t2: rL ? { ...rL, source: "2º Grupo L" } : { id: "r-L", name: "2º Grupo L", flag: "placeholder", fifaRank: 99, source: "2º Grupo L" }
        };
      }
      case 13: {
        const wF = getGroupWinner("F");
        const t1 = getGroupThird(1);
        return {
          t1: wF ? { ...wF, source: "1º Grupo F" } : { id: "w-F", name: "1º Grupo F", flag: "placeholder", fifaRank: 99, source: "1º Grupo F" },
          t2: t1 ? { ...t1, source: "2º Mejor 3º" } : { id: "t-1", name: "2º Mejor 3º", flag: "placeholder", fifaRank: 99, source: "2º Mejor 3º" }
        };
      }
      case 14: {
        const wJ = getGroupWinner("J");
        const rI = getGroupRunnerUp("I");
        return {
          t1: wJ ? { ...wJ, source: "1º Grupo J" } : { id: "w-J", name: "1º Grupo J", flag: "placeholder", fifaRank: 99, source: "1º Grupo J" },
          t2: rI ? { ...rI, source: "2º Grupo I" } : { id: "r-I", name: "2º Grupo I", flag: "placeholder", fifaRank: 99, source: "2º Grupo I" }
        };
      }
      case 15: {
        const wH = getGroupWinner("H");
        const t0 = getGroupThird(0);
        return {
          t1: wH ? { ...wH, source: "1º Grupo H" } : { id: "w-H", name: "1º Grupo H", flag: "placeholder", fifaRank: 99, source: "1º Grupo H" },
          t2: t0 ? { ...t0, source: "1º Mejor 3º" } : { id: "t-0", name: "1º Mejor 3º", flag: "placeholder", fifaRank: 99, source: "1º Mejor 3º" }
        };
      }
      case 16: {
        const wI = getGroupWinner("I");
        const rJ = getGroupRunnerUp("J");
        return {
          t1: wI ? { ...wI, source: "1º Grupo I" } : { id: "w-I", name: "1º Grupo I", flag: "placeholder", fifaRank: 99, source: "1º Grupo I" },
          t2: rJ ? { ...rJ, source: "2º Grupo J" } : { id: "r-J", name: "2º Grupo J", flag: "placeholder", fifaRank: 99, source: "2º Grupo J" }
        };
      }
      default:
        return {
          t1: { id: "err", name: "Error", flag: "placeholder", fifaRank: 99, source: "" },
          t2: { id: "err", name: "Error", flag: "placeholder", fifaRank: 99, source: "" }
        };
    }
  };

  // Round of 16 (R16-1 to R16-8)
  const getR16Teams = (matchIdx: number) => {
    const p1 = koWinners[`R32-${2 * matchIdx - 1}`];
    const p2 = koWinners[`R32-${2 * matchIdx}`];
    return {
      t1: p1 || { id: `r16-p1-${matchIdx}`, name: `Ganador 16avo ${2 * matchIdx - 1}`, flag: "placeholder", fifaRank: 99, source: "Fase Anterior" },
      t2: p2 || { id: `r16-p2-${matchIdx}`, name: `Ganador 16avo ${2 * matchIdx}`, flag: "placeholder", fifaRank: 99, source: "Fase Anterior" }
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
    
    const isT1Placeholder = t1.flag === "placeholder";
    const isT2Placeholder = t2.flag === "placeholder";

    const isT1Hovered = hoveredTeam === t1.id;
    const isT2Hovered = hoveredTeam === t2.id;
    const isCardHovered = isT1Hovered || isT2Hovered;

    return (
      <div 
        key={matchId} 
        className="matchup-card"
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
        
        {/* Team 1 */}
        <div 
          onClick={() => !isT1Placeholder && onSelectKoWinner(matchId, t1, t2)}
          className={`matchup-team-row ${isT1Winner ? "matchup-team-row-winner" : ""}`}
          style={{ opacity: isT1Placeholder ? 0.45 : 1, cursor: isT1Placeholder ? "default" : "pointer" }}
          onMouseEnter={() => !isT1Placeholder && setHoveredTeam(t1.id)}
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
          {!isT1Placeholder && (
            <span className="font-mono text-center" style={{ fontSize: "0.65rem", padding: "0.1rem 0.3rem", borderRadius: "3px", background: "rgba(255,255,255,0.05)", color: "var(--text-muted)" }}>
              #{t1.fifaRank}
            </span>
          )}
        </div>

        {/* Team 2 */}
        <div 
          onClick={() => !isT2Placeholder && onSelectKoWinner(matchId, t2, t1)}
          className={`matchup-team-row ${isT2Winner ? "matchup-team-row-winner" : ""}`}
          style={{ opacity: isT2Placeholder ? 0.45 : 1, cursor: isT2Placeholder ? "default" : "pointer" }}
          onMouseEnter={() => !isT2Placeholder && setHoveredTeam(t2.id)}
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
          {!isT2Placeholder && (
            <span className="font-mono text-center" style={{ fontSize: "0.65rem", padding: "0.1rem 0.3rem", borderRadius: "3px", background: "rgba(255,255,255,0.05)", color: "var(--text-muted)" }}>
              #{t2.fifaRank}
            </span>
          )}
        </div>
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
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Banner explicativo */}
      <div className="glass-panel" style={{ padding: "1.25rem" }}>
        <h2 className="flex items-center gap-2" style={{ fontSize: "1.3rem", fontWeight: "800", color: "#fff" }}>
          <Flame className="w-5 h-5 text-indigo-400 animate-pulse" />
          El Cuadro de Eliminación Directa
        </h2>
        <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "0.3rem" }}>
          Se termina el margen de error. Hacé clic sobre la selección que creas que ganará cada duelo para avanzarla a la siguiente ronda. De dieciseisavos a la gran final: vos decidís quién escribe la historia.
        </p>
      </div>

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
            return renderMatchup(`R32-${mIdx}`, `16avo ${mIdx}`, "Cruces Generales", teams.t1, teams.t2);
          })}

        {activeRound === "r16" &&
          Array.from({ length: 8 }).map((_, idx) => {
            const mIdx = idx + 1;
            const teams = getR16Teams(mIdx);
            return renderMatchup(`R16-${mIdx}`, `Octavos ${mIdx}`, "Ganadores 16avos", teams.t1, teams.t2);
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
