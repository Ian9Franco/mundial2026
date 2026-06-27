"use client";

import React from "react";
import { motion } from "framer-motion";
import { Group, Match, TeamStats, computeGroupStandings, getTeamFlagUrl } from "../data/teams";
import { getTopPlayersForTeam } from "../data/players";
import { ArrowUp, ArrowDown, Sliders, Zap, RotateCcw, Plus, Minus, CheckCircle, Clock, Award, XCircle, Users } from "lucide-react";

interface GroupCardProps {
  group: Group;
  groupMatches: Match[];
  manualOrder: string[] | null;
  gdTweaks: Record<string, number>;
  gfTweaks: Record<string, number>;
  collapsed?: boolean;
  hoveredTeam: string | null;
  setHoveredTeam: (teamId: string | null) => void;
  onToggleCollapsed?: (groupId: string) => void;
  onMatchResultChange: (matchId: string, result: "H" | "A" | "D" | null) => void;
  onSwapTeams: (groupId: string, index: number, direction: "up" | "down") => void;
  onToggleMode: (groupId: string) => void;
  onTweakGd: (teamId: string, delta: number) => void;
  onTweakGf: (teamId: string, delta: number) => void;
  searchQuery: string;
  compareData?: { username: string; predictions: any } | null;
  qualifiedThirdTeamIds?: string[];
}

export default function GroupCard({
  group,
  groupMatches,
  manualOrder,
  gdTweaks,
  gfTweaks,
  collapsed = false,
  hoveredTeam,
  setHoveredTeam,
  onToggleCollapsed,
  onMatchResultChange,
  onSwapTeams,
  onToggleMode,
  onTweakGd,
  onTweakGf,
  searchQuery,
  compareData,
  qualifiedThirdTeamIds,
}: GroupCardProps) {
  const standings = computeGroupStandings(group, groupMatches, manualOrder, gdTweaks, gfTweaks);
  const isManual = manualOrder !== null;
  const isGroupComplete = isManual || groupMatches.every(m => m.isOfficial || m.result !== null);

  // Dynamically compute standings for the user we are comparing with
  const getOtherStandings = () => {
    if (!compareData || !compareData.predictions) return null;
    const otherMatches = groupMatches.map(m => {
      const otherRes = compareData.predictions.matches?.[m.id];
      return otherRes !== undefined ? { ...m, result: otherRes } : m;
    });
    const otherManual = compareData.predictions.manualStandings?.[group.id] || null;
    const otherGd = compareData.predictions.gdTweaks || {};
    const otherGf = compareData.predictions.gfTweaks || {};
    return computeGroupStandings(group, otherMatches, otherManual, otherGd, otherGf);
  };

  const otherStandings = getOtherStandings();

  // Highlight if searched team is in this group
  const matchesSearch = searchQuery
    ? group.teams.some((t) => t.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : false;

  return (
    <motion.section
      className="glass-panel"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      style={{
        animation: "fadeInUp 0.4s ease-out",
        borderColor: matchesSearch ? "var(--primary)" : undefined,
        boxShadow: matchesSearch ? "0 0 15px rgba(99, 102, 241, 0.25)" : undefined,
      }}
    >
      {/* Group Header */}
      <div
        className="flex items-center justify-between gap-2"
        style={{ borderBottom: collapsed ? "none" : "1px solid rgba(255,255,255,0.05)", paddingBottom: collapsed ? 0 : "0.5rem", marginBottom: collapsed ? 0 : "0.75rem", cursor: "pointer" }}
        onClick={() => onToggleCollapsed?.(group.id)}
      >
        <h3 className="semibold flex items-center gap-2" style={{ fontSize: "1.1rem", color: "#fff" }}>
          <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--primary)", display: "inline-block" }}></span>
          {group.name}
        </h3>
        <div className="flex items-center gap-2">
          {isGroupComplete ? (
            <span className="badge badge-success flex items-center gap-1" style={{ fontSize: "0.7rem", padding: "0.2rem 0.5rem", height: "26px" }}>
              <CheckCircle className="w-3.5 h-3.5" /> Completado
            </span>
          ) : (
            <span className="badge flex items-center gap-1" style={{ fontSize: "0.7rem", padding: "0.2rem 0.5rem", height: "26px", backgroundColor: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.05)", color: "var(--text-muted)" }}>
              <Clock className="w-3.5 h-3.5" /> En juego
            </span>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleMode(group.id);
            }}
            className="btn btn-secondary"
            style={{ 
              height: "26px", 
              minHeight: "26px", 
              fontSize: "0.7rem", 
              padding: "0 0.4rem",
              backgroundColor: isManual ? "rgba(139, 92, 246, 0.15)" : undefined,
              borderColor: isManual ? "rgba(139, 92, 246, 0.4)" : undefined,
              color: isManual ? "#c084fc" : undefined
            }}
            title={isManual ? "Cambiar a simulación automática" : "Ordenar posiciones a mano"}
          >
            {isManual ? <Sliders className="w-3 h-3 text-purple-400" /> : <Zap className="w-3 h-3 text-indigo-400" />}
            <span>{isManual ? "Manual" : "Sim."}</span>
          </button>
        </div>
      </div>

      {!collapsed && (
        <>
      {/* Standings Table */}
      <div className="standings-table-container">
        <table className="standings-table">
          <thead>
            <tr>
              <th style={{ width: "24px", textAlign: "center" }}>Pos</th>
              <th>Equipo</th>
              <th style={{ textAlign: "center", width: "24px" }}>PJ</th>
              <th style={{ textAlign: "center", width: "52px" }} title="Diferencia de Goles">DG</th>
              <th style={{ textAlign: "center", width: "52px" }} title="Goles a Favor">GF</th>
              <th style={{ textAlign: "center", width: "28px" }}>Pts</th>
              {isManual && <th style={{ textAlign: "center", width: "52px" }}>Orden</th>}
            </tr>
          </thead>
          <tbody>
            {standings.map((stat, index) => {
              const isHovered = hoveredTeam === stat.team.id;
              const isSearchMatch = searchQuery && stat.team.name.toLowerCase().includes(searchQuery.toLowerCase());
              
              // Qualifiers colors
              let posColor = "var(--text-muted)";
              let rowStyle: React.CSSProperties = {};
              if (index === 0) {
                posColor = "var(--success)";
                rowStyle = { backgroundColor: "rgba(16, 185, 129, 0.02)" };
              } else if (index === 1) {
                posColor = "#2dd4bf"; // Teal
                rowStyle = { backgroundColor: "rgba(45, 212, 191, 0.02)" };
              } else if (index === 2) {
                posColor = "var(--warning)";
                rowStyle = { backgroundColor: "rgba(245, 158, 11, 0.01)" };
              }

              if (isHovered) {
                rowStyle.backgroundColor = "rgba(99, 102, 241, 0.1)";
                rowStyle.color = "#fff";
              }
              if (isSearchMatch) {
                rowStyle.border = "1px solid rgba(99, 102, 241, 0.4)";
                rowStyle.backgroundColor = "rgba(99, 102, 241, 0.08)";
              }

              return (
                <tr
                  key={stat.team.id}
                  style={rowStyle}
                  onMouseEnter={() => setHoveredTeam(stat.team.id)}
                  onMouseLeave={() => setHoveredTeam(null)}
                >
                  {/* Position */}
                  <td className="pos-badge" style={{ color: posColor }}>
                    {index + 1}º
                  </td>
                  {/* Team Flag + Name */}
                  <td>
                    <div className="row-team-cell flex-wrap">
                      <img 
                        src={getTeamFlagUrl(stat.team.flag)} 
                        alt={stat.team.name} 
                        className="flag-img" 
                      />
                      <span className="team-name-text" title={`${stat.team.name} (FIFA #${stat.team.fifaRank})`}>
                        {stat.team.name}
                      </span>
                      {isGroupComplete && (
                        index === 0 ? (
                          <span className="badge badge-success" style={{ fontSize: "0.6rem", padding: "0.15rem 0.35rem", marginLeft: "0.5rem", display: "inline-flex", alignItems: "center", gap: "2px" }}>
                            <Award className="w-2.5 h-2.5" /> Directo
                          </span>
                        ) : index === 1 ? (
                          <span className="badge" style={{ fontSize: "0.6rem", padding: "0.15rem 0.35rem", marginLeft: "0.5rem", backgroundColor: "rgba(45, 212, 191, 0.1)", borderColor: "rgba(45, 212, 191, 0.3)", color: "#2dd4bf", display: "inline-flex", alignItems: "center", gap: "2px" }}>
                            <Award className="w-2.5 h-2.5" /> Directo
                          </span>
                        ) : index === 2 ? (
                          qualifiedThirdTeamIds?.includes(stat.team.id) ? (
                            <span className="badge badge-success" style={{ fontSize: "0.6rem", padding: "0.15rem 0.35rem", marginLeft: "0.5rem", display: "inline-flex", alignItems: "center", gap: "2px" }}>
                              <CheckCircle className="w-2.5 h-2.5" /> Mejor 3º
                            </span>
                          ) : (
                            <span className="badge badge-danger" style={{ fontSize: "0.6rem", padding: "0.15rem 0.35rem", marginLeft: "0.5rem", display: "inline-flex", alignItems: "center", gap: "2px" }}>
                              <XCircle className="w-2.5 h-2.5" /> Fuera
                            </span>
                          )
                        ) : (
                          <span className="badge badge-danger" style={{ fontSize: "0.6rem", padding: "0.15rem 0.35rem", marginLeft: "0.5rem", display: "inline-flex", alignItems: "center", gap: "2px" }}>
                            <XCircle className="w-2.5 h-2.5" /> Fuera
                          </span>
                        )
                      )}
                      {otherStandings && (() => {
                        const otherIdx = otherStandings.findIndex((s) => s.team.id === stat.team.id);
                        if (otherIdx !== -1 && otherIdx !== index) {
                          return (
                            <span className="comparison-rank-badge" title={`${compareData?.username} predijo este equipo en ${otherIdx + 1}º lugar`}>
                              {compareData?.username?.substring(0, 8)}: {otherIdx + 1}º
                            </span>
                          );
                        }
                        return null;
                      })()}
                    </div>
                  </td>
                  {/* Played */}
                  <td className="font-mono text-center" style={{ color: "var(--text-secondary)" }}>
                    {stat.played}
                  </td>
                  {/* GD with tweaking buttons */}
                  <td className="font-mono text-center">
                    <div className="adjust-btn-group">
                      {!isManual && (
                        <button
                          onClick={() => onTweakGd(stat.team.id, -1)}
                          className="adjust-btn"
                          title="Restar 1 Diferencia de Goles"
                        >
                          <Minus style={{ width: "8px", height: "8px" }} />
                        </button>
                      )}
                      <span style={{ 
                        color: stat.goalDifference > 0 
                          ? "var(--success)" 
                          : stat.goalDifference < 0 
                            ? "var(--danger)" 
                            : "var(--text-muted)"
                      }}>
                        {stat.goalDifference > 0 ? `+${stat.goalDifference}` : stat.goalDifference}
                      </span>
                      {!isManual && (
                        <button
                          onClick={() => onTweakGd(stat.team.id, 1)}
                          className="adjust-btn"
                          title="Sumar 1 Diferencia de Goles"
                        >
                          <Plus style={{ width: "8px", height: "8px" }} />
                        </button>
                      )}
                    </div>
                  </td>
                  {/* GF with tweaking buttons */}
                  <td className="font-mono text-center">
                    <div className="adjust-btn-group">
                      {!isManual && (
                        <button
                          onClick={() => onTweakGf(stat.team.id, -1)}
                          className="adjust-btn"
                          title="Restar 1 Gol a Favor"
                        >
                          <Minus style={{ width: "8px", height: "8px" }} />
                        </button>
                      )}
                      <span style={{ color: "var(--text-secondary)" }}>
                        {stat.goalsFor + (gfTweaks[stat.team.id] || 0)}
                      </span>
                      {!isManual && (
                        <button
                          onClick={() => onTweakGf(stat.team.id, 1)}
                          className="adjust-btn"
                          title="Sumar 1 Gol a Favor"
                        >
                          <Plus style={{ width: "8px", height: "8px" }} />
                        </button>
                      )}
                    </div>
                  </td>
                  {/* Points */}
                  <td className="font-mono text-center semibold" style={{ color: "#a5b4fc" }}>
                    {stat.points}
                  </td>
                  {/* Manual Sorting Actions */}
                  {isManual && (
                    <td>
                      <div className="flex justify-center gap-1">
                        <button
                          onClick={() => onSwapTeams(group.id, index, "up")}
                          disabled={index === 0}
                          className="adjust-btn"
                          style={{ width: "20px", height: "20px" }}
                          title="Mover arriba"
                        >
                          <ArrowUp style={{ width: "12px", height: "12px" }} />
                        </button>
                        <button
                          onClick={() => onSwapTeams(group.id, index, "down")}
                          disabled={index === 3}
                          className="adjust-btn"
                          style={{ width: "20px", height: "20px" }}
                          title="Mover abajo"
                        >
                          <ArrowDown style={{ width: "12px", height: "12px" }} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Matches / Fixture */}
      {!isManual ? (
        <div className="fixture-section">
          <div className="fixture-title">Partidos del Grupo</div>
          <div className="matches-list">
            {groupMatches.map((match) => {
              const homeHovered = hoveredTeam === match.homeTeam.id;
              const awayHovered = hoveredTeam === match.awayTeam.id;
              const isOfficial = match.isOfficial;
              const hasPlayed = isOfficial || match.result !== null;

              return (
                <motion.div
                  key={match.id}
                  className={`match-item ${homeHovered || awayHovered ? "hover-highlight" : ""}`}
                  whileHover={{ y: -1, scale: 1.01 }}
                  transition={{ duration: 0.18 }}
                >
                  <div className="match-meta-row">
                    <span>{match.id.replace("-", " - P")}</span>
                    <span style={{ color: isOfficial ? "var(--primary)" : hasPlayed ? "var(--success)" : "var(--text-muted)" }}>
                      {isOfficial ? "Oficial" : hasPlayed ? "Simulado" : "Pendiente"}
                    </span>
                  </div>
                  <div className="match-teams-row">
                    {/* Home Team */}
                    <div
                      className="match-team home"
                      style={{ cursor: "pointer" }}
                      onMouseEnter={() => setHoveredTeam(match.homeTeam.id)}
                      onMouseLeave={() => setHoveredTeam(null)}
                    >
                      <img 
                        src={getTeamFlagUrl(match.homeTeam.flag)} 
                        alt={match.homeTeam.name} 
                        className="flag-img" 
                      />
                      <span className="match-team-name" style={{ color: homeHovered ? "#fff" : undefined }}>
                        {match.homeTeam.name}
                      </span>
                    </div>

                    {/* Result Selector */}
                    <div className="selector-group" style={{ 
                      opacity: isOfficial ? 0.75 : 1,
                      pointerEvents: isOfficial ? "none" : "auto"
                    }} title={isOfficial ? "Resultado oficial bloqueado" : undefined}>
                      <button
                        onClick={() => onMatchResultChange(match.id, match.result === "H" ? null : "H")}
                        disabled={isOfficial}
                        className={`selector-btn ${match.result === "H" ? "selector-btn-active-h" : ""}`}
                        title={isOfficial ? undefined : `Gana ${match.homeTeam.name}`}
                      >
                        1
                      </button>
                      <button
                        onClick={() => onMatchResultChange(match.id, match.result === "D" ? null : "D")}
                        disabled={isOfficial}
                        className={`selector-btn ${match.result === "D" ? "selector-btn-active-d" : ""}`}
                        title={isOfficial ? undefined : "Empate"}
                      >
                        X
                      </button>
                      <button
                        onClick={() => onMatchResultChange(match.id, match.result === "A" ? null : "A")}
                        disabled={isOfficial}
                        className={`selector-btn ${match.result === "A" ? "selector-btn-active-a" : ""}`}
                        title={isOfficial ? undefined : `Gana ${match.awayTeam.name}`}
                      >
                        2
                      </button>
                    </div>

                    {/* Away Team */}
                    <div
                      className="match-team away"
                      style={{ cursor: "pointer" }}
                      onMouseEnter={() => setHoveredTeam(match.awayTeam.id)}
                      onMouseLeave={() => setHoveredTeam(null)}
                    >
                      <span className="match-team-name" style={{ color: awayHovered ? "#fff" : undefined }}>
                        {match.awayTeam.name}
                      </span>
                      <img 
                        src={getTeamFlagUrl(match.awayTeam.flag)} 
                        alt={match.awayTeam.name} 
                        className="flag-img" 
                      />
                    </div>
                  </div>
                  {compareData && (() => {
                    const otherRes = compareData.predictions?.matches?.[match.id];
                    if (otherRes !== undefined && otherRes !== match.result) {
                      return (
                        <div style={{ display: "flex", justifyContent: "center", marginTop: "0.25rem" }}>
                          <span className="comparison-pill" style={{ margin: 0, display: "inline-flex", alignItems: "center" }}>
                            <Users className="w-3 h-3 text-amber-400 mr-1" /> {compareData.username}: {otherRes === "H" ? "1" : otherRes === "D" ? "X" : "2"}
                          </span>
                        </div>
                      );
                    }
                    return null;
                  })()}
                </motion.div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-center" style={{ 
          marginTop: "1rem", 
          padding: "1rem", 
          background: "rgba(139, 92, 246, 0.03)", 
          border: "1px dashed rgba(139, 92, 246, 0.15)",
          borderRadius: "8px"
        }}>
          <p style={{ fontSize: "0.75rem", color: "#c084fc", marginBottom: "0.5rem" }}>
            El orden de las posiciones se define a mano. Las simulaciones de partidos están desactivadas.
          </p>
          <button
            onClick={() => onToggleMode(group.id)}
            className="btn btn-secondary"
            style={{ height: "30px", minHeight: "30px", fontSize: "0.7rem", padding: "0 0.5rem" }}
          >
            <RotateCcw className="w-3 h-3" />
            Restaurar simulación
          </button>
        </div>
      )}

      {!collapsed && (
        <div className="fixture-section" style={{ marginTop: "0.9rem" }}>
          <div className="fixture-title">Top 5 + arquero</div>
          <div className="flex flex-col gap-2">
            {group.teams.map(team => {
              const players = getTopPlayersForTeam(team.id);
              return (
                <div key={team.id} className="match-item" style={{ padding: "0.65rem 0.75rem" }}>
                  <div className="flex items-center gap-2" style={{ marginBottom: "0.45rem" }}>
                    <img src={getTeamFlagUrl(team.flag)} alt={team.name} className="flag-img" />
                    <span className="semibold" style={{ fontSize: "0.78rem" }}>{team.name}</span>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                    {players.map(player => (
                      <span
                        key={player.id}
                        className="badge"
                        style={{
                          background: "rgba(255,255,255,0.04)",
                          border: "1px solid rgba(255,255,255,0.06)",
                          color: "var(--text-primary)",
                        }}
                        title={
                          player.role === "goalkeeper"
                            ? `Arquero ${player.goalkeeping || 82}`
                            : `Ataque ${player.attack}${player.goals || player.assists ? ` | Mundial: ${player.goals}G ${player.assists}A` : ""}`
                        }
                      >
                        {player.name}
                        {player.role === "goalkeeper" && (
                          <span style={{ color: "var(--accent)" }}> ARQ</span>
                        )}
                        {player.role !== "goalkeeper" && (player.goals > 0 || player.assists > 0) && (
                          <span style={{ color: "var(--primary)" }}>
                            {` ${player.goals}G/${player.assists}A`}
                          </span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
        </>
      )}
    </motion.section>
  );
}
