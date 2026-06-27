import equiposData from "./equipos.json";
import historicalData from "./historial_equipos.json";

export interface Team {
  id: string;
  name: string;
  flag: string; // 2-letter country code
  fifaRank: number;
}

export interface Group {
  id: string; // 'A' | 'B' | ... | 'L'
  name: string; // 'Grupo A'
  teams: Team[];
}

export interface Match {
  id: string; // e.g. 'A-0', 'B-1'
  group: string; // 'A'
  homeTeam: Team;
  awayTeam: Team;
  result: 'H' | 'A' | 'D' | null; // H: Home win, A: Away win, D: Draw, null: Not played
  isOfficial?: boolean;
}

export interface TeamStats {
  team: Team;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  points: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  manualPosition?: number; // 1, 2, 3, 4 (if manual override is active)
}

export const getTeamFlagUrl = (flagCode: string): string => {
  return `https://flagcdn.com/w40/${flagCode.toLowerCase()}.png`;
};

export const TEAMS: Record<string, Team> = {
  // Grupo A
  mex: { id: "mex", name: "México", flag: "mx", fifaRank: 20 },
  rsa: { id: "rsa", name: "Sudáfrica", flag: "za", fifaRank: 38 },
  kor: { id: "kor", name: "Corea del Sur", flag: "kr", fifaRank: 22 },
  cze: { id: "cze", name: "República Checa", flag: "cz", fifaRank: 18 },
  // Grupo B
  can: { id: "can", name: "Canadá", flag: "ca", fifaRank: 34 },
  qat: { id: "qat", name: "Qatar", flag: "qa", fifaRank: 39 },
  sui: { id: "sui", name: "Suiza", flag: "ch", fifaRank: 13 },
  bih: { id: "bih", name: "Bosnia y Herzegovina", flag: "ba", fifaRank: 33 },
  // Grupo C
  bra: { id: "bra", name: "Brasil", flag: "br", fifaRank: 5 },
  mar: { id: "mar", name: "Marruecos", flag: "ma", fifaRank: 12 },
  hai: { id: "hai", name: "Haití", flag: "ht", fifaRank: 48 },
  sco: { id: "sco", name: "Escocia", flag: "gb-sct", fifaRank: 40 },
  // Grupo D
  usa: { id: "usa", name: "Estados Unidos", flag: "us", fifaRank: 14 },
  par: { id: "par", name: "Paraguay", flag: "py", fifaRank: 28 },
  aus: { id: "aus", name: "Australia", flag: "au", fifaRank: 23 },
  tur: { id: "tur", name: "Turquía", flag: "tr", fifaRank: 25 },
  // Grupo E
  ger: { id: "ger", name: "Alemania", flag: "de", fifaRank: 15 },
  cuw: { id: "cuw", name: "Curazao", flag: "cw", fifaRank: 47 },
  civ: { id: "civ", name: "Costa de Marfil", flag: "ci", fifaRank: 26 },
  ecu: { id: "ecu", name: "Ecuador", flag: "ec", fifaRank: 27 },
  // Grupo F
  ned: { id: "ned", name: "Países Bajos", flag: "nl", fifaRank: 6 },
  jpn: { id: "jpn", name: "Japón", flag: "jp", fifaRank: 16 },
  tun: { id: "tun", name: "Túnez", flag: "tn", fifaRank: 30 },
  swe: { id: "swe", name: "Suecia", flag: "se", fifaRank: 19 },
  // Grupo G
  bel: { id: "bel", name: "Bélgica", flag: "be", fifaRank: 8 },
  egy: { id: "egy", name: "Egipto", flag: "eg", fifaRank: 29 },
  irn: { id: "irn", name: "Irán", flag: "ir", fifaRank: 37 },
  nzl: { id: "nzl", name: "Nueva Zelanda", flag: "nz", fifaRank: 45 },
  // Grupo H
  esp: { id: "esp", name: "España", flag: "es", fifaRank: 3 },
  cpv: { id: "cpv", name: "Cabo Verde", flag: "cv", fifaRank: 42 },
  ksa: { id: "ksa", name: "Arabia Saudita", flag: "sa", fifaRank: 32 },
  uru: { id: "uru", name: "Uruguay", flag: "uy", fifaRank: 11 },
  // Grupo I
  fra: { id: "fra", name: "Francia", flag: "fr", fifaRank: 2 },
  sen: { id: "sen", name: "Senegal", flag: "sn", fifaRank: 17 },
  nor: { id: "nor", name: "Noruega", flag: "no", fifaRank: 24 },
  irq: { id: "irq", name: "Irak", flag: "iq", fifaRank: 46 },
  // Grupo J
  arg: { id: "arg", name: "Argentina", flag: "ar", fifaRank: 1 },
  dza: { id: "dza", name: "Argelia", flag: "dz", fifaRank: 31 },
  aut: { id: "aut", name: "Austria", flag: "at", fifaRank: 21 },
  jor: { id: "jor", name: "Jordania", flag: "jo", fifaRank: 44 },
  // Grupo K
  por: { id: "por", name: "Portugal", flag: "pt", fifaRank: 7 },
  uzb: { id: "uzb", name: "Uzbekistán", flag: "uz", fifaRank: 41 },
  col: { id: "col", name: "Colombia", flag: "co", fifaRank: 9 },
  cod: { id: "cod", name: "República Democrática del Congo", flag: "cd", fifaRank: 36 },
  // Grupo L
  eng: { id: "eng", name: "Inglaterra", flag: "gb-eng", fifaRank: 4 },
  cro: { id: "cro", name: "Croacia", flag: "hr", fifaRank: 10 },
  gha: { id: "gha", name: "Ghana", flag: "gh", fifaRank: 35 },
  pan: { id: "pan", name: "Panamá", flag: "pa", fifaRank: 43 },
};

export const GROUPS: Group[] = [
  { id: "A", name: "Grupo A", teams: [TEAMS.mex, TEAMS.rsa, TEAMS.kor, TEAMS.cze] },
  { id: "B", name: "Grupo B", teams: [TEAMS.can, TEAMS.qat, TEAMS.sui, TEAMS.bih] },
  { id: "C", name: "Grupo C", teams: [TEAMS.bra, TEAMS.mar, TEAMS.hai, TEAMS.sco] },
  { id: "D", name: "Grupo D", teams: [TEAMS.usa, TEAMS.par, TEAMS.aus, TEAMS.tur] },
  { id: "E", name: "Grupo E", teams: [TEAMS.ger, TEAMS.cuw, TEAMS.civ, TEAMS.ecu] },
  { id: "F", name: "Grupo F", teams: [TEAMS.ned, TEAMS.jpn, TEAMS.tun, TEAMS.swe] },
  { id: "G", name: "Grupo G", teams: [TEAMS.bel, TEAMS.egy, TEAMS.irn, TEAMS.nzl] },
  { id: "H", name: "Grupo H", teams: [TEAMS.esp, TEAMS.cpv, TEAMS.ksa, TEAMS.uru] },
  { id: "I", name: "Grupo I", teams: [TEAMS.fra, TEAMS.sen, TEAMS.nor, TEAMS.irq] },
  { id: "J", name: "Grupo J", teams: [TEAMS.arg, TEAMS.dza, TEAMS.aut, TEAMS.jor] },
  { id: "K", name: "Grupo K", teams: [TEAMS.por, TEAMS.uzb, TEAMS.col, TEAMS.cod] },
  { id: "L", name: "Grupo L", teams: [TEAMS.eng, TEAMS.cro, TEAMS.gha, TEAMS.pan] },
];

export const generateMatchesForGroup = (groupId: string, teams: Team[]): Match[] => {
  if (teams.length !== 4) return [];
  const [t1, t2, t3, t4] = teams;
  return [
    { id: `${groupId}-0`, group: groupId, homeTeam: t1, awayTeam: t2, result: null },
    { id: `${groupId}-1`, group: groupId, homeTeam: t3, awayTeam: t4, result: null },
    { id: `${groupId}-2`, group: groupId, homeTeam: t1, awayTeam: t3, result: null },
    { id: `${groupId}-3`, group: groupId, homeTeam: t2, awayTeam: t4, result: null },
    { id: `${groupId}-4`, group: groupId, homeTeam: t4, awayTeam: t1, result: null },
    { id: `${groupId}-5`, group: groupId, homeTeam: t2, awayTeam: t3, result: null },
  ];
};

export const generateAllMatches = (): Record<string, Match[]> => {
  const matches: Record<string, Match[]> = {};
  GROUPS.forEach(g => {
    matches[g.id] = generateMatchesForGroup(g.id, g.teams);
  });
  return matches;
};

export const getPreloadedMatches = (): Record<string, Match[]> => {
  const allMatches = generateAllMatches();
  
  const setOfficialResult = (group: string, idx: number, res: 'H' | 'A' | 'D') => {
    allMatches[group][idx].result = res;
    allMatches[group][idx].isOfficial = true;
  };

  // Grupo A
  setOfficialResult("A", 0, "H");
  setOfficialResult("A", 1, "H");
  setOfficialResult("A", 2, "H");
  setOfficialResult("A", 3, "D");
  setOfficialResult("A", 4, "A");
  setOfficialResult("A", 5, "H");
  
  // Grupo B
  setOfficialResult("B", 0, "H");
  setOfficialResult("B", 1, "H");
  setOfficialResult("B", 2, "A");
  setOfficialResult("B", 3, "A");
  setOfficialResult("B", 4, "D");
  setOfficialResult("B", 5, "D");

  // Grupo C
  setOfficialResult("C", 0, "D");
  setOfficialResult("C", 1, "A");
  setOfficialResult("C", 2, "H");
  setOfficialResult("C", 3, "H");
  setOfficialResult("C", 4, "A");
  setOfficialResult("C", 5, "H");

  // Grupo D
  setOfficialResult("D", 0, "H");
  setOfficialResult("D", 1, "H");
  setOfficialResult("D", 2, "H");
  setOfficialResult("D", 3, "H");
  setOfficialResult("D", 4, "H");
  setOfficialResult("D", 5, "D");

  // Grupo E
  setOfficialResult("E", 0, "H");
  setOfficialResult("E", 1, "H");
  setOfficialResult("E", 2, "H");
  setOfficialResult("E", 3, "D");
  setOfficialResult("E", 4, "H");
  setOfficialResult("E", 5, "A");

  // Grupo F
  setOfficialResult("F", 0, "D");
  setOfficialResult("F", 1, "A");
  setOfficialResult("F", 2, "H");
  setOfficialResult("F", 3, "D");
  setOfficialResult("F", 4, "A");
  setOfficialResult("F", 5, "H");

  // Grupo G
  setOfficialResult("G", 0, "D");
  setOfficialResult("G", 1, "D");
  setOfficialResult("G", 2, "D");
  setOfficialResult("G", 3, "H");
  setOfficialResult("G", 4, "A");
  setOfficialResult("G", 5, "D");

  // Grupo H
  setOfficialResult("H", 0, "D");
  setOfficialResult("H", 1, "D");
  setOfficialResult("H", 2, "H");
  setOfficialResult("H", 3, "D");
  setOfficialResult("H", 4, "A");
  setOfficialResult("H", 5, "D");

  // Grupo I
  setOfficialResult("I", 0, "H");
  setOfficialResult("I", 1, "H");
  setOfficialResult("I", 2, "H");
  setOfficialResult("I", 3, "H");
  setOfficialResult("I", 4, "A");
  setOfficialResult("I", 5, "A");

  // Grupo J
  setOfficialResult("J", 0, "H");
  setOfficialResult("J", 1, "H");
  setOfficialResult("J", 2, "H");
  setOfficialResult("J", 3, "H");

  // Grupo K
  setOfficialResult("K", 0, "H");
  setOfficialResult("K", 1, "H");
  setOfficialResult("K", 4, "D");
  setOfficialResult("K", 5, "A");

  // Grupo L
  setOfficialResult("L", 0, "H");
  setOfficialResult("L", 1, "H");
  setOfficialResult("L", 2, "D");
  setOfficialResult("L", 3, "H");

  return allMatches;
};

export const computeGroupStandings = (
  group: Group,
  groupMatches: Match[],
  manualOrder: string[] | null,
  gdTweaks: Record<string, number>,
  gfTweaks: Record<string, number>
): TeamStats[] => {
  const statsMap: Record<string, TeamStats> = {};
  group.teams.forEach(team => {
    statsMap[team.id] = {
      team,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      points: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: gdTweaks[team.id] || 0,
    };
  });

  groupMatches.forEach(match => {
    if (match.result === null) return;
    const home = statsMap[match.homeTeam.id];
    const away = statsMap[match.awayTeam.id];
    if (!home || !away) return;

    home.played += 1;
    away.played += 1;

    if (match.result === "H") {
      home.won += 1;
      home.points += 3;
      home.goalsFor += 1;
      home.goalDifference += 1;

      away.lost += 1;
      away.goalsAgainst += 1;
      away.goalDifference -= 1;
    } else if (match.result === "A") {
      away.won += 1;
      away.points += 3;
      away.goalsFor += 1;
      away.goalDifference += 1;

      home.lost += 1;
      home.goalsAgainst += 1;
      home.goalDifference -= 1;
    } else if (match.result === "D") {
      home.drawn += 1;
      home.points += 1;
      away.drawn += 1;
      away.points += 1;
    }
  });

  const statsList = Object.values(statsMap);

  if (manualOrder) {
    return [...statsList].sort((a, b) => {
      const idxA = manualOrder.indexOf(a.team.id);
      const idxB = manualOrder.indexOf(b.team.id);
      return idxA - idxB;
    });
  } else {
    return [...statsList].sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
      
      const gfA = a.goalsFor + (gfTweaks[a.team.id] || 0);
      const gfB = b.goalsFor + (gfTweaks[b.team.id] || 0);
      if (gfB !== gfA) return gfB - gfA;

      return a.team.fifaRank - b.team.fifaRank;
    });
  }
};

export const getBestThirds = (
  groups: Group[],
  allMatches: Record<string, Match[]>,
  manualStandings: Record<string, string[] | null>,
  gdTweaks: Record<string, number>,
  gfTweaks: Record<string, number>
) => {
  const thirds: {
    team: Team;
    group: string;
    points: number;
    goalDifference: number;
    goalsFor: number;
    played: number;
    won: number;
    drawn: number;
    lost: number;
  }[] = [];

  groups.forEach(group => {
    const standings = computeGroupStandings(
      group,
      allMatches[group.id],
      manualStandings[group.id],
      gdTweaks,
      gfTweaks
    );
    if (standings.length >= 3) {
      const thirdPlace = standings[2];
      const gf = thirdPlace.goalsFor + (gfTweaks[thirdPlace.team.id] || 0);
      thirds.push({
        team: thirdPlace.team,
        group: group.id,
        points: thirdPlace.points,
        goalDifference: thirdPlace.goalDifference,
        goalsFor: gf,
        played: thirdPlace.played,
        won: thirdPlace.won,
        drawn: thirdPlace.drawn,
        lost: thirdPlace.lost,
      });
    }
  });

  return thirds.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
    if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
    return a.team.fifaRank - b.team.fifaRank;
  });
};

interface EquipoStats {
  id: string;
  nombre: string;
  grupo: string;
  puntos_fifa: number;
  forma_reciente: number;
}

export interface HistoricalStats {
  win_rate: number;
  gd_average: number;
  strength_of_schedule: number;
  h2h: Record<string, { played: number; won: number; drawn: number; lost: number }>;
}

const equiposMap: Record<string, EquipoStats> = {};
(equiposData.equipos as EquipoStats[]).forEach(eq => {
  equiposMap[eq.id.toUpperCase()] = eq;
});

export const historicalMap = historicalData as Record<string, HistoricalStats>;

export const getTeamPower = (team: Team): number => {
  const stats = equiposMap[team.id.toUpperCase()];
  if (!stats) {
    return 1400;
  }
  const hist = historicalMap[team.id.toUpperCase()];
  if (!hist) {
    return stats.puntos_fifa + (stats.forma_reciente * 10);
  }

  // Enriched historical score calculation
  const gdNormalized = Math.tanh(hist.gd_average); // bounds between [-1, 1]
  const historicalScore = (hist.win_rate * 0.40) + (gdNormalized * 0.35) + (hist.strength_of_schedule * 0.25);
  
  // Enriched Power: 60% FIFA points, 40% Historical performance, plus recent form offset
  const power = (stats.puntos_fifa * 0.60) + (historicalScore * 400) + (stats.forma_reciente * 5);
  return power;
};

export const simulateGroupMatch = (home: Team, away: Team): "H" | "A" | "D" => {
  const powerA = getTeamPower(home);
  const powerB = getTeamPower(away);
  const diff = powerA - powerB;

  let rawA = 0.4 + (diff / 1000);
  let rawB = 0.4 - (diff / 1000);

  // H2H correction
  const histA = historicalMap[home.id.toUpperCase()];
  if (histA && histA.h2h?.[away.id.toUpperCase()]) {
    const h2hRecord = histA.h2h[away.id.toUpperCase()];
    const h2hNet = h2hRecord.won - h2hRecord.lost;
    const h2hAdjustment = h2hNet * 0.05;
    const clampedAdjustment = Math.max(-0.15, Math.min(0.15, h2hAdjustment));
    rawA += clampedAdjustment;
    rawB -= clampedAdjustment;
  }

  const rawDraw = 0.2;

  const clampedA = Math.max(0.05, Math.min(0.90, rawA));
  const clampedB = Math.max(0.05, Math.min(0.90, rawB));
  const clampedDraw = Math.max(0.05, Math.min(0.40, rawDraw));

  const total = clampedA + clampedB + clampedDraw;
  const probA = clampedA / total;
  const probB = clampedB / total;

  const rand = Math.random();
  if (rand < probA) {
    return "H";
  } else if (rand < probA + probB) {
    return "A";
  } else {
    return "D";
  }
};

export const simulateKnockoutMatch = (teamA: Team, teamB: Team): Team => {
  const powerA = getTeamPower(teamA);
  const powerB = getTeamPower(teamB);
  const diff = powerA - powerB;

  let rawA = 0.5 + (diff / 1000);

  // H2H correction
  const histA = historicalMap[teamA.id.toUpperCase()];
  if (histA && histA.h2h?.[teamB.id.toUpperCase()]) {
    const h2hRecord = histA.h2h[teamB.id.toUpperCase()];
    const h2hNet = h2hRecord.won - h2hRecord.lost;
    const h2hAdjustment = h2hNet * 0.05;
    const clampedAdjustment = Math.max(-0.15, Math.min(0.15, h2hAdjustment));
    rawA += clampedAdjustment;
  }

  const probA = Math.max(0.05, Math.min(0.95, rawA));

  const rand = Math.random();
  return rand < probA ? teamA : teamB;
};
