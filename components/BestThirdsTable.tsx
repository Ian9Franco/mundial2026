"use client";

import React from "react";
import { Team, TeamStats, GROUPS, Match, getBestThirds, getTeamFlagUrl } from "../data/teams";
import { Trophy, CheckCircle2, XCircle } from "lucide-react";

interface BestThirdsTableProps {
  allMatches: Record<string, Match[]>;
  manualStandings: Record<string, string[] | null>;
  gdTweaks: Record<string, number>;
  gfTweaks: Record<string, number>;
  hoveredTeam: string | null;
  setHoveredTeam: (teamId: string | null) => void;
}

export default function BestThirdsTable({
  allMatches,
  manualStandings,
  gdTweaks,
  gfTweaks,
  hoveredTeam,
  setHoveredTeam,
}: BestThirdsTableProps) {
  const thirds = getBestThirds(GROUPS, allMatches, manualStandings, gdTweaks, gfTweaks);

  return (
    <div className="glass-panel" style={{ padding: "1.25rem" }}>
      {/* Title */}
      <div className="thirds-header">
        <div>
          <h2 className="flex items-center gap-2" style={{ fontSize: "1.3rem", fontWeight: "800", color: "#fff" }}>
            <Trophy className="w-5 h-5" style={{ color: "#fbbf24" }} />
            Tabla de Mejores Terceros
          </h2>
          <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "0.2rem" }}>
            Los mejores 8 terceros clasifican a los dieciseisavos de final (16avos).
          </p>
        </div>
        <div className="flex gap-3" style={{ fontSize: "0.75rem", fontWeight: "600", marginTop: "0.5rem" }}>
          <span className="badge badge-success">Clasifica (Top 8)</span>
          <span className="badge badge-danger">Eliminado (Últimos 4)</span>
        </div>
      </div>

      {/* Table */}
      <div className="standings-table-container">
        <table className="standings-table">
          <thead>
            <tr>
              <th style={{ width: "40px", textAlign: "center" }}>Rank</th>
              <th>Equipo</th>
              <th style={{ textAlign: "center", width: "40px" }}>Grupo</th>
              <th style={{ textAlign: "center", width: "30px" }}>PJ</th>
              <th style={{ textAlign: "center", width: "30px" }}>G</th>
              <th style={{ textAlign: "center", width: "30px" }}>E</th>
              <th style={{ textAlign: "center", width: "30px" }}>P</th>
              <th style={{ textAlign: "center", width: "30px" }}>DG</th>
              <th style={{ textAlign: "center", width: "30px" }}>GF</th>
              <th style={{ textAlign: "center", width: "30px" }}>Pts</th>
              <th style={{ textAlign: "center", width: "50px" }}>FIFA</th>
              <th style={{ textAlign: "center", width: "90px" }}>Estado</th>
            </tr>
          </thead>
          <tbody>
            {thirds.map((item, index) => {
              const isQualified = index < 8;
              const isHovered = hoveredTeam === item.team.id;
              
              let rowStyle: React.CSSProperties = {};
              let rankColor = "var(--text-muted)";
              
              if (isQualified) {
                rowStyle.backgroundColor = "rgba(16, 185, 129, 0.02)";
                rankColor = "var(--success)";
              } else {
                rowStyle.backgroundColor = "rgba(244, 63, 94, 0.01)";
                rankColor = "var(--danger)";
              }

              if (isHovered) {
                rowStyle.backgroundColor = "rgba(99, 102, 241, 0.1)";
                rowStyle.color = "#fff";
              }

              return (
                <tr
                  key={item.team.id}
                  style={rowStyle}
                  onMouseEnter={() => setHoveredTeam(item.team.id)}
                  onMouseLeave={() => setHoveredTeam(null)}
                >
                  {/* Rank */}
                  <td className="pos-badge text-center" style={{ color: rankColor }}>
                    {index + 1}º
                  </td>
                  {/* Team Flag + Name */}
                  <td>
                    <div className="row-team-cell">
                      <img 
                        src={getTeamFlagUrl(item.team.flag)} 
                        alt={item.team.name} 
                        className="flag-img" 
                      />
                      <span className="team-name-text" title={`${item.team.name}`}>
                        {item.team.name}
                      </span>
                    </div>
                  </td>
                  {/* Source Group */}
                  <td className="text-center bold" style={{ color: "#a5b4fc" }}>
                    {item.group}
                  </td>
                  {/* Record */}
                  <td className="text-center font-mono" style={{ color: "var(--text-secondary)" }}>{item.played}</td>
                  <td className="text-center font-mono" style={{ color: "var(--text-muted)" }}>{item.won}</td>
                  <td className="text-center font-mono" style={{ color: "var(--text-muted)" }}>{item.drawn}</td>
                  <td className="text-center font-mono" style={{ color: "var(--text-muted)" }}>{item.lost}</td>
                  {/* Goal Difference */}
                  <td className="text-center font-mono bold" style={{ 
                    color: item.goalDifference > 0 
                      ? "var(--success)" 
                      : item.goalDifference < 0 
                        ? "var(--danger)" 
                        : "var(--text-muted)"
                  }}>
                    {item.goalDifference > 0 ? `+${item.goalDifference}` : item.goalDifference}
                  </td>
                  {/* Goals For */}
                  <td className="text-center font-mono" style={{ color: "var(--text-secondary)" }}>{item.goalsFor}</td>
                  {/* Points */}
                  <td className="text-center font-mono bold" style={{ color: "#fff" }}>{item.points}</td>
                  {/* FIFA Rank */}
                  <td className="text-center font-mono" style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>#{item.team.fifaRank}</td>
                  {/* Status Indicator */}
                  <td className="text-center">
                    {isQualified ? (
                      <span className="badge badge-success" style={{ gap: "0.25rem", padding: "0.15rem 0.4rem", fontSize: "0.65rem" }}>
                        <CheckCircle2 style={{ width: "10px", height: "10px" }} />
                        Clasificado
                      </span>
                    ) : (
                      <span className="badge badge-danger" style={{ gap: "0.25rem", padding: "0.15rem 0.4rem", fontSize: "0.65rem" }}>
                        <XCircle style={{ width: "10px", height: "10px" }} />
                        Eliminado
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
