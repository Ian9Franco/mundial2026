import { Team } from "./teams";

export type PlayerRole = "outfield" | "goalkeeper";
export type KnockoutResultMode = "regular" | "et" | "pens";
export type ChungoType = "normal" | "patadas" | "ritmo" | "roja" | "lesion";

export interface KeyPlayer {
  id: string;
  name: string;
  teamId: string;
  attack: number;
  goals: number;
  assists: number;
  role: PlayerRole;
  goalkeeping?: number;
}

export interface KnockoutGoalEvent {
  teamId: string;
  playerId: string;
  playerName: string;
  assistId?: string;
  assistName?: string;
  phase?: "regular" | "et";
}

export interface KnockoutMatchDetail {
  homeTeamId: string;
  awayTeamId: string;
  homeGoals: number;
  awayGoals: number;
  winnerId: string;
  loserId: string;
  resultMode: KnockoutResultMode;
  penalties?: {
    home: number;
    away: number;
  };
  chungoType?: Exclude<ChungoType, "normal">;
  chungoNote?: string;
  events: KnockoutGoalEvent[];
}

export interface TeamCondition {
  level: number;
  note: string;
  type: Exclude<ChungoType, "normal">;
  label: string;
  attackPenalty: number;
  defensePenalty: number;
  staminaPenalty: number;
}

export interface GoldenBootLeader {
  playerId: string;
  playerName: string;
  teamId: string;
  goals: number;
  assists: number;
}

export interface IndividualAwardLeader {
  playerId: string;
  playerName: string;
  teamId: string;
  goals: number;
  assists: number;
}

export interface GoldenGloveLeader {
  playerId: string;
  playerName: string;
  teamId: string;
  cleanSheets: number;
  goalsConceded: number;
}

const BASE_PLAYERS: Record<string, Array<[string, number]>> = {
  mex: [["Santiago Gimenez", 91], ["Edson Alvarez", 86], ["Julian Quinones", 84], ["Orbelin Pineda", 83], ["Cesar Huerta", 80]],
  rsa: [["Lyle Foster", 82], ["Percy Tau", 81], ["Teboho Mokoena", 80], ["Evidence Makgopa", 76], ["Mihlali Mayambela", 75]],
  kor: [["Son Heung-min", 93], ["Lee Kang-in", 88], ["Hwang Hee-chan", 84], ["Cho Gue-sung", 81], ["Lee Jae-sung", 79]],
  cze: [["Patrik Schick", 90], ["Tomas Soucek", 84], ["Adam Hlozek", 83], ["Vaclav Cerny", 81], ["Lukas Provod", 78]],
  can: [["Jonathan David", 90], ["Alphonso Davies", 89], ["Cyle Larin", 82], ["Tajon Buchanan", 81], ["Stephen Eustaquio", 80]],
  qat: [["Akram Afif", 88], ["Almoez Ali", 85], ["Ahmed Al-Rawi", 77], ["Hasan Al-Haydos", 76], ["Mostafa Meshaal", 74]],
  sui: [["Breel Embolo", 87], ["Dan Ndoye", 84], ["Zeki Amdouni", 83], ["Xherdan Shaqiri", 82], ["Ardon Jashari", 80]],
  bih: [["Edin Dzeko", 86], ["Ermedin Demirovic", 85], ["Amar Dedic", 82], ["Rade Krunic", 79], ["Haris Hajradinovic", 78]],
  bra: [["Vinicius Junior", 95], ["Rodrygo", 92], ["Raphinha", 89], ["Martinelli", 86], ["Bruno Guimaraes", 84]],
  mar: [["Achraf Hakimi", 89], ["Ismael Saibari", 87], ["Youssef En-Nesyri", 86], ["Sofyan Amrabat", 83], ["Brahim Diaz", 88]],
  hai: [["Duckens Nazon", 80], ["Frantzdy Pierrot", 79], ["Leverton Pierre", 75], ["Wilde-Donald Guerrier", 74], ["Louicius Don Deedson", 73]],
  sco: [["Scott McTominay", 87], ["John McGinn", 85], ["Billy Gilmour", 82], ["Che Adams", 81], ["Ryan Christie", 79]],
  usa: [["Christian Pulisic", 90], ["Folarin Balogun", 87], ["Weston McKennie", 84], ["Tim Weah", 83], ["Giovanni Reyna", 82]],
  par: [["Miguel Almiron", 86], ["Julio Enciso", 85], ["Antonio Sanabria", 82], ["Matias Galarza", 77], ["Ramon Sosa", 80]],
  aus: [["Mathew Leckie", 81], ["Kusini Yengi", 80], ["Ajdin Hrustic", 79], ["Craig Goodwin", 78], ["Jackson Irvine", 77]],
  tur: [["Arda Guler", 91], ["Hakan Calhanoglu", 89], ["Kenan Yildiz", 87], ["Kerem Akturkoglu", 84], ["Baris Alper Yilmaz", 82]],
  ger: [["Jamal Musiala", 94], ["Kai Havertz", 90], ["Florian Wirtz", 93], ["Deniz Undav", 88], ["Niclas Fullkrug", 83]],
  cuw: [["Juninho Bacuna", 81], ["Leandro Bacuna", 79], ["Rangelo Janga", 77], ["Gervane Kastaneer", 76], ["Sherel Floranus", 72]],
  civ: [["Sebastien Haller", 86], ["Simon Adingra", 85], ["Nicolas Pepe", 82], ["Franck Kessie", 84], ["Evan Guessand", 80]],
  ecu: [["Enner Valencia", 88], ["Kendry Paez", 86], ["Moises Caicedo", 89], ["Jeremy Sarmiento", 80], ["Gonzalo Plata", 82]],
  ned: [["Cody Gakpo", 91], ["Brian Brobbey", 87], ["Memphis Depay", 86], ["Xavi Simons", 90], ["Donyell Malen", 84]],
  jpn: [["Takefusa Kubo", 90], ["Kaoru Mitoma", 89], ["Daichi Kamada", 84], ["Ayase Ueda", 82], ["Takumi Minamino", 81]],
  tun: [["Elias Achouri", 81], ["Youssef Msakni", 80], ["Seifeddine Jaziri", 77], ["Anis Ben Slimane", 77], ["Hannibal Mejbri", 79]],
  swe: [["Alexander Isak", 92], ["Viktor Gyokeres", 91], ["Dejan Kulusevski", 89], ["Emil Forsberg", 83], ["Jesper Karlsson", 79]],
  bel: [["Jeremy Doku", 89], ["Leandro Trossard", 87], ["Charles De Ketelaere", 86], ["Lois Openda", 88], ["Kevin De Bruyne", 90]],
  egy: [["Mohamed Salah", 94], ["Mostafa Mohamed", 81], ["Omar Marmoush", 88], ["Trezeguet", 78], ["Zizo", 77]],
  irn: [["Mehdi Taremi", 88], ["Sardar Azmoun", 84], ["Alireza Jahanbakhsh", 79], ["Saman Ghoddos", 76], ["Mohammad Mohebi", 77]],
  nzl: [["Chris Wood", 85], ["Sarpreet Singh", 78], ["Joe Bell", 76], ["Liberato Cacace", 77], ["Elijah Just", 74]],
  esp: [["Lamine Yamal", 94], ["Nico Williams", 91], ["Alvaro Morata", 86], ["Pedri", 90], ["Mikel Oyarzabal", 85]],
  cpv: [["Bebe", 78], ["Ryan Mendes", 77], ["Jovane Cabral", 79], ["Kevin Pina", 74], ["Garry Rodrigues", 78]],
  ksa: [["Salem Al-Dawsari", 87], ["Firas Al-Buraikan", 82], ["Musab Al-Juwayr", 78], ["Abdullah Al-Hamdan", 75], ["Mohamed Kanno", 79]],
  uru: [["Darwin Nunez", 91], ["Federico Valverde", 92], ["Maximiliano Araujo", 82], ["Facundo Pellistri", 81], ["Rodrigo Bentancur", 83]],
  fra: [["Kylian Mbappe", 97], ["Ousmane Dembele", 91], ["Michael Olise", 88], ["Marcus Thuram", 86], ["Antoine Griezmann", 85]],
  sen: [["Sadio Mane", 90], ["Nicolas Jackson", 85], ["Ismaila Sarr", 84], ["Habib Diallo", 81], ["Iliman Ndiaye", 82]],
  nor: [["Erling Haaland", 96], ["Martin Odegaard", 92], ["Alexander Sorloth", 84], ["Antonio Nusa", 83], ["Oscar Bobb", 81]],
  irq: [["Aymen Hussein", 82], ["Ali Jasim", 80], ["Zidane Iqbal", 79], ["Amir Al-Ammari", 77], ["Ibrahim Bayesh", 76]],
  arg: [["Lionel Messi", 98], ["Lautaro Martinez", 94], ["Julian Alvarez", 92], ["Alexis Mac Allister", 87], ["Thiago Almada", 84]],
  dza: [["Riyad Mahrez", 90], ["Amine Gouiri", 87], ["Said Benrahma", 82], ["Yacine Brahimi", 79], ["Farid El Melali", 76]],
  aut: [["Marcel Sabitzer", 86], ["Christoph Baumgartner", 85], ["Marko Arnautovic", 82], ["Michael Gregoritsch", 81], ["Konrad Laimer", 80]],
  jor: [["Mousa Al-Tamari", 85], ["Yazan Al-Naimat", 82], ["Mahmoud Al-Mardi", 77], ["Ali Olwan", 76], ["Nizar Al-Rashdan", 73]],
  por: [["Cristiano Ronaldo", 98], ["Bruno Fernandes", 92], ["Rafael Leao", 89], ["Joao Felix", 86], ["Bernardo Silva", 88]],
  uzb: [["Eldor Shomurodov", 84], ["Abbosbek Fayzullaev", 82], ["Otabek Shukurov", 76], ["Jasurbek Yakhshiboev", 75], ["Odiljon Hamrobekov", 74]],
  col: [["Luis Diaz", 92], ["Jhon Duran", 88], ["James Rodriguez", 84], ["Rafael Borre", 80], ["Richard Rios", 79]],
  cod: [["Cedric Bakambu", 82], ["Yoane Wissa", 86], ["Meschack Elia", 80], ["Theo Bongonda", 81], ["Arthur Masuaku", 76]],
  eng: [["Harry Kane", 94], ["Jude Bellingham", 94], ["Bukayo Saka", 92], ["Phil Foden", 91], ["Cole Palmer", 90]],
  cro: [["Luka Modric", 89], ["Josko Gvardiol", 84], ["Andrej Kramaric", 83], ["Lovro Majer", 80], ["Ivan Perisic", 81]],
  gha: [["Mohammed Kudus", 89], ["Antoine Semenyo", 84], ["Inaki Williams", 83], ["Jordan Ayew", 80], ["Ernest Nuamah", 79]],
  pan: [["Adalberto Carrasquilla", 84], ["Jose Fajardo", 80], ["Ismael Diaz", 78], ["Cesar Yanis", 75], ["Edgar Barcenas", 76]],
};

const CURRENT_TOURNAMENT_FORM: Record<string, { goals: number; assists: number }> = {
  "arg-lionel-messi": { goals: 5, assists: 0 },
  "fra-kylian-mbappe": { goals: 4, assists: 2 },
  "bra-vinicius-junior": { goals: 4, assists: 1 },
  "fra-ousmane-dembele": { goals: 4, assists: 1 },
  "nor-erling-haaland": { goals: 4, assists: 0 },
  "ger-deniz-undav": { goals: 3, assists: 0 },
  "mar-ismael-saibari": { goals: 3, assists: 0 },
  "ned-brian-brobbey": { goals: 3, assists: 0 },
  "can-jonathan-david": { goals: 3, assists: 0 },
  "eng-harry-kane": { goals: 2, assists: 1 },
  "ecu-enner-valencia": { goals: 2, assists: 1 },
  "esp-lamine-yamal": { goals: 2, assists: 2 },
  "por-cristiano-ronaldo": { goals: 2, assists: 0 },
  "ger-kai-havertz": { goals: 2, assists: 0 },
  "ned-cody-gakpo": { goals: 2, assists: 1 },
  "egy-mohamed-salah": { goals: 2, assists: 1 },
};

const GOALKEEPERS: Record<string, { id: string; name: string }> = {
  mex: { id: "mex-luis-malagon", name: "Luis Malagon" },
  rsa: { id: "rsa-ronwen-williams", name: "Ronwen Williams" },
  kor: { id: "kor-jo-hyeon-woo", name: "Jo Hyeon-woo" },
  cze: { id: "cze-jindrich-stanek", name: "Jindrich Stanek" },
  can: { id: "can-maxime-crepeau", name: "Maxime Crepeau" },
  qat: { id: "qat-meshaal-barsham", name: "Meshaal Barsham" },
  sui: { id: "sui-gregor-kobel", name: "Gregor Kobel" },
  bih: { id: "bih-nikola-vasilj", name: "Nikola Vasilj" },
  bra: { id: "bra-alisson", name: "Alisson" },
  mar: { id: "mar-yassine-bounou", name: "Yassine Bounou" },
  hai: { id: "hai-johnny-placide", name: "Johnny Placide" },
  sco: { id: "sco-angus-gunn", name: "Angus Gunn" },
  usa: { id: "usa-matt-turner", name: "Matt Turner" },
  par: { id: "par-roberto-junior-fernandez", name: "Roberto Fernandez" },
  aus: { id: "aus-mathew-ryan", name: "Mathew Ryan" },
  tur: { id: "tur-ugurcan-cakir", name: "Ugurcan Cakir" },
  ger: { id: "ger-marc-andre-ter-stegen", name: "Marc-Andre ter Stegen" },
  cuw: { id: "cuw-eloy-room", name: "Eloy Room" },
  civ: { id: "civ-yahia-fofana", name: "Yahia Fofana" },
  ecu: { id: "ecu-hernan-galindez", name: "Hernan Galindez" },
  ned: { id: "ned-bart-verbruggen", name: "Bart Verbruggen" },
  jpn: { id: "jpn-zion-suzuki", name: "Zion Suzuki" },
  tun: { id: "tun-bechir-ben-said", name: "Bechir Ben Said" },
  swe: { id: "swe-robin-olsen", name: "Robin Olsen" },
  bel: { id: "bel-koen-casteels", name: "Koen Casteels" },
  egy: { id: "egy-mohamed-el-shenawy", name: "Mohamed El Shenawy" },
  irn: { id: "irn-alireza-beiranvand", name: "Alireza Beiranvand" },
  nzl: { id: "nzl-max-crocombe", name: "Max Crocombe" },
  esp: { id: "esp-unai-simon", name: "Unai Simon" },
  cpv: { id: "cpv-vozinha", name: "Vozinha" },
  ksa: { id: "ksa-ahmed-al-kassar", name: "Ahmed Al Kassar" },
  uru: { id: "uru-sergio-rochet", name: "Sergio Rochet" },
  fra: { id: "fra-mike-maignan", name: "Mike Maignan" },
  sen: { id: "sen-edouard-mendy", name: "Edouard Mendy" },
  nor: { id: "nor-orjan-nyland", name: "Orjan Nyland" },
  irq: { id: "irq-jalal-hassan", name: "Jalal Hassan" },
  arg: { id: "arg-emiliano-martinez", name: "Emiliano Martinez" },
  dza: { id: "dza-anthony-mandrea", name: "Anthony Mandrea" },
  aut: { id: "aut-patrick-pentz", name: "Patrick Pentz" },
  jor: { id: "jor-yazid-abu-laila", name: "Yazid Abu Laila" },
  por: { id: "por-diogo-costa", name: "Diogo Costa" },
  uzb: { id: "uzb-utkir-yusupov", name: "Utkir Yusupov" },
  col: { id: "col-camilo-vargas", name: "Camilo Vargas" },
  cod: { id: "cod-lionel-mpasi", name: "Lionel Mpasi" },
  eng: { id: "eng-jordan-pickford", name: "Jordan Pickford" },
  cro: { id: "cro-dominik-livakovic", name: "Dominik Livakovic" },
  gha: { id: "gha-lawrence-ati-zigi", name: "Lawrence Ati-Zigi" },
  pan: { id: "pan-orlando-mosquera", name: "Orlando Mosquera" },
};

const GOALKEEPER_RATINGS: Record<string, number> = {
  arg: 94,
  bra: 92,
  fra: 91,
  ger: 90,
  mar: 92,
  ned: 89,
  por: 91,
  eng: 89,
  esp: 89,
  sui: 90,
  sen: 88,
  jpn: 86,
  usa: 84,
  uru: 86,
  mex: 84,
  cro: 88,
};

const CHUNGO_LIBRARY: Record<Exclude<ChungoType, "normal">, Omit<TeamCondition, "level">> = {
  patadas: {
    type: "patadas",
    label: "Patadas",
    note: "Partido picante: golpes, amarillas y piernas cansadas.",
    attackPenalty: 0.38,
    defensePenalty: 0.28,
    staminaPenalty: 0.44,
  },
  ritmo: {
    type: "ritmo",
    label: "Ritmo",
    note: "Ida y vuelta total: el que avanza llega con menos piernas.",
    attackPenalty: 0.24,
    defensePenalty: 0.18,
    staminaPenalty: 0.58,
  },
  roja: {
    type: "roja",
    label: "Roja",
    note: "Se lleva una suspensión pesada para el próximo cruce.",
    attackPenalty: 0.72,
    defensePenalty: 0.64,
    staminaPenalty: 0.22,
  },
  lesion: {
    type: "lesion",
    label: "Lesión",
    note: "Sale tocado un jugador clave y el plantel pierde filo.",
    attackPenalty: 0.84,
    defensePenalty: 0.35,
    staminaPenalty: 0.26,
  },
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const getKeeperRating = (teamId: string) => GOALKEEPER_RATINGS[teamId] || 82;

const buildOutfieldPlayer = (teamId: string, name: string, attack: number): KeyPlayer => {
  const id = `${teamId}-${slugify(name)}`;
  const form = CURRENT_TOURNAMENT_FORM[id] || { goals: 0, assists: 0 };
  return {
    id,
    name,
    teamId,
    attack,
    goals: form.goals,
    assists: form.assists,
    role: "outfield",
  };
};

const buildGoalkeeper = (teamId: string): KeyPlayer | null => {
  const keeper = GOALKEEPERS[teamId];
  if (!keeper) return null;
  return {
    id: keeper.id,
    name: keeper.name,
    teamId,
    attack: 12,
    goals: 0,
    assists: 0,
    role: "goalkeeper",
    goalkeeping: getKeeperRating(teamId),
  };
};

export const getOutfieldPlayersForTeam = (teamId: string): KeyPlayer[] =>
  (BASE_PLAYERS[teamId] || []).map(([name, attack]) => buildOutfieldPlayer(teamId, name, attack));

export const getGoalkeeperForTeam = (teamId: string): KeyPlayer | null => buildGoalkeeper(teamId);

export const getTopPlayersForTeam = (teamId: string): KeyPlayer[] => {
  const outfield = getOutfieldPlayersForTeam(teamId);
  const goalkeeper = buildGoalkeeper(teamId);
  return goalkeeper ? [...outfield, goalkeeper] : outfield;
};

const randomWeightedPick = <T,>(items: T[], getWeight: (item: T) => number): T => {
  const weights = items.map(item => Math.max(0.01, getWeight(item)));
  const total = weights.reduce((sum, weight) => sum + weight, 0);
  let threshold = Math.random() * total;
  for (let i = 0; i < items.length; i += 1) {
    threshold -= weights[i];
    if (threshold <= 0) return items[i];
  }
  return items[items.length - 1];
};

export const buildTournamentPlayerTotals = (
  knockoutDetails: Record<string, KnockoutMatchDetail>
) => {
  const totals: Record<string, { goals: number; assists: number; playerName?: string; teamId?: string }> = {};
  Object.values(knockoutDetails).forEach(detail => {
    detail.events.forEach(event => {
      totals[event.playerId] = totals[event.playerId] || { goals: 0, assists: 0, playerName: event.playerName, teamId: event.teamId };
      totals[event.playerId].goals += 1;
      totals[event.playerId].playerName = event.playerName;
      totals[event.playerId].teamId = event.teamId;
      if (event.assistId) {
        totals[event.assistId] = totals[event.assistId] || { goals: 0, assists: 0, playerName: event.assistName, teamId: event.teamId };
        totals[event.assistId].assists += 1;
        totals[event.assistId].playerName = event.assistName;
        totals[event.assistId].teamId = event.teamId;
      }
    });
  });
  return totals;
};

export const getGoldenBootLeader = (
  knockoutDetails: Record<string, KnockoutMatchDetail>
): GoldenBootLeader | null => {
  const totals = buildTournamentPlayerTotals(knockoutDetails);
  const ranked = Object.entries(totals)
    .map(([playerId, value]) => ({
      playerId,
      playerName: value.playerName || "Jugador",
      teamId: value.teamId || "",
      goals: value.goals,
      assists: value.assists,
    }))
    .sort((a, b) => {
      if (b.goals !== a.goals) return b.goals - a.goals;
      if (b.assists !== a.assists) return b.assists - a.assists;
      return a.playerName.localeCompare(b.playerName);
    });

  return ranked[0] || null;
};

export const getAssistLeader = (
  knockoutDetails: Record<string, KnockoutMatchDetail>
): IndividualAwardLeader | null => {
  const totals = buildTournamentPlayerTotals(knockoutDetails);
  const ranked = Object.entries(totals)
    .map(([playerId, value]) => ({
      playerId,
      playerName: value.playerName || "Jugador",
      teamId: value.teamId || "",
      goals: value.goals,
      assists: value.assists,
    }))
    .sort((a, b) => {
      if (b.assists !== a.assists) return b.assists - a.assists;
      if (b.goals !== a.goals) return b.goals - a.goals;
      return a.playerName.localeCompare(b.playerName);
    });

  return ranked[0] || null;
};

export const getMvpLeader = (
  knockoutDetails: Record<string, KnockoutMatchDetail>,
  championTeamId?: string | null
): IndividualAwardLeader | null => {
  const totals = buildTournamentPlayerTotals(knockoutDetails);
  const ranked = Object.entries(totals)
    .map(([playerId, value]) => {
      const playerName = value.playerName || "Jugador";
      const teamId = value.teamId || "";
      const topPlayers = getTopPlayersForTeam(teamId);
      const player = topPlayers.find(item => item.id === playerId);
      const playerImpact = player?.role === "goalkeeper" ? (player.goalkeeping || 82) : player?.attack || 75;
      const championBonus = championTeamId && championTeamId === teamId ? 6 : 0;
      const score = value.goals * 5 + value.assists * 3 + playerImpact * 0.12 + championBonus;
      return {
        playerId,
        playerName,
        teamId,
        goals: value.goals,
        assists: value.assists,
        score,
      };
    })
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (b.goals !== a.goals) return b.goals - a.goals;
      if (b.assists !== a.assists) return b.assists - a.assists;
      return a.playerName.localeCompare(b.playerName);
    });

  const leader = ranked[0];
  if (!leader) return null;
  return {
    playerId: leader.playerId,
    playerName: leader.playerName,
    teamId: leader.teamId,
    goals: leader.goals,
    assists: leader.assists,
  };
};

export const getGoldenGloveLeader = (
  knockoutDetails: Record<string, KnockoutMatchDetail>
): GoldenGloveLeader | null => {
  const keeperStats: Record<string, GoldenGloveLeader> = {};

  Object.values(knockoutDetails).forEach(detail => {
    const home = keeperStats[detail.homeTeamId] || (GOALKEEPERS[detail.homeTeamId]
      ? {
          playerId: GOALKEEPERS[detail.homeTeamId].id,
          playerName: GOALKEEPERS[detail.homeTeamId].name,
          teamId: detail.homeTeamId,
          cleanSheets: 0,
          goalsConceded: 0,
        }
      : undefined);
    const away = keeperStats[detail.awayTeamId] || (GOALKEEPERS[detail.awayTeamId]
      ? {
          playerId: GOALKEEPERS[detail.awayTeamId].id,
          playerName: GOALKEEPERS[detail.awayTeamId].name,
          teamId: detail.awayTeamId,
          cleanSheets: 0,
          goalsConceded: 0,
        }
      : undefined);

    if (home) keeperStats[detail.homeTeamId] = home;
    if (away) keeperStats[detail.awayTeamId] = away;
  });

  Object.values(knockoutDetails).forEach(detail => {
    const homeStats = keeperStats[detail.homeTeamId];
    const awayStats = keeperStats[detail.awayTeamId];
    if (!homeStats || !awayStats) return;

    homeStats.goalsConceded += detail.awayGoals;
    awayStats.goalsConceded += detail.homeGoals;

    if (detail.awayGoals === 0) homeStats.cleanSheets += 1;
    if (detail.homeGoals === 0) awayStats.cleanSheets += 1;
  });

  const ranked = Object.values(keeperStats).sort((a, b) => {
    if (b.cleanSheets !== a.cleanSheets) return b.cleanSheets - a.cleanSheets;
    if (a.goalsConceded !== b.goalsConceded) return a.goalsConceded - b.goalsConceded;
    return a.playerName.localeCompare(b.playerName);
  });

  return ranked[0] || null;
};

export const buildTeamConditions = (
  knockoutDetails: Record<string, KnockoutMatchDetail>
) => {
  const conditions: Record<string, TeamCondition> = {};
  Object.values(knockoutDetails).forEach(detail => {
    if (!detail.chungoType) return;
    const effect = CHUNGO_LIBRARY[detail.chungoType];
    const current = conditions[detail.winnerId];
    conditions[detail.winnerId] = {
      type: effect.type,
      label: effect.label,
      level: (current?.level || 0) + 1,
      note: effect.note,
      attackPenalty: (current?.attackPenalty || 0) + effect.attackPenalty,
      defensePenalty: (current?.defensePenalty || 0) + effect.defensePenalty,
      staminaPenalty: (current?.staminaPenalty || 0) + effect.staminaPenalty,
    };
  });
  return conditions;
};

const getPlayerScoreWeight = (
  player: KeyPlayer,
  tournamentStats: Record<string, { goals: number; assists: number }>
) => {
  const live = tournamentStats[player.id] || { goals: 0, assists: 0 };
  const totalGoals = player.goals + live.goals;
  const totalAssists = player.assists + live.assists;
  return player.attack * 1.15 + totalGoals * 24 + totalAssists * 8;
};

const getPlayerAssistWeight = (
  player: KeyPlayer,
  tournamentStats: Record<string, { goals: number; assists: number }>
) => {
  const live = tournamentStats[player.id] || { goals: 0, assists: 0 };
  const totalGoals = player.goals + live.goals;
  const totalAssists = player.assists + live.assists;
  return player.attack * 0.9 + totalAssists * 20 + totalGoals * 5;
};

const pickGoalEventsForTeam = (
  teamId: string,
  goalCount: number,
  tournamentStats: Record<string, { goals: number; assists: number }>,
  phase: "regular" | "et" = "regular"
): KnockoutGoalEvent[] => {
  const players = getOutfieldPlayersForTeam(teamId);
  if (players.length === 0) return [];

  const events: KnockoutGoalEvent[] = [];
  for (let i = 0; i < goalCount; i += 1) {
    const scorer = randomWeightedPick(players, player => getPlayerScoreWeight(player, tournamentStats));
    const assisted = Math.random() < 0.78;
    let assistant: KeyPlayer | undefined;
    if (assisted) {
      const candidates = players.filter(player => player.id !== scorer.id);
      assistant = candidates.length > 0
        ? randomWeightedPick(candidates, player => getPlayerAssistWeight(player, tournamentStats))
        : undefined;
    }

    events.push({
      teamId,
      playerId: scorer.id,
      playerName: scorer.name,
      assistId: assistant?.id,
      assistName: assistant?.name,
      phase,
    });

    tournamentStats[scorer.id] = tournamentStats[scorer.id] || { goals: 0, assists: 0 };
    tournamentStats[scorer.id].goals += 1;
    if (assistant?.id) {
      tournamentStats[assistant.id] = tournamentStats[assistant.id] || { goals: 0, assists: 0 };
      tournamentStats[assistant.id].assists += 1;
    }
  }

  return events;
};

const buildMatchEvents = (
  homeTeamId: string,
  awayTeamId: string,
  homeGoals: number,
  awayGoals: number,
  resultMode: KnockoutResultMode,
  tournamentStats: Record<string, { goals: number; assists: number }>
) => {
  if (resultMode === "regular" || resultMode === "pens") {
    return [
      ...pickGoalEventsForTeam(homeTeamId, homeGoals, tournamentStats, "regular"),
      ...pickGoalEventsForTeam(awayTeamId, awayGoals, tournamentStats, "regular"),
    ];
  }

  const commonGoals = Math.min(homeGoals, awayGoals);
  const homeEtGoals = homeGoals - commonGoals;
  const awayEtGoals = awayGoals - commonGoals;

  return [
    ...pickGoalEventsForTeam(homeTeamId, commonGoals, tournamentStats, "regular"),
    ...pickGoalEventsForTeam(awayTeamId, commonGoals, tournamentStats, "regular"),
    ...pickGoalEventsForTeam(homeTeamId, homeEtGoals, tournamentStats, "et"),
    ...pickGoalEventsForTeam(awayTeamId, awayEtGoals, tournamentStats, "et"),
  ];
};

const getPenaltyShooterWeight = (
  player: KeyPlayer,
  tournamentStats: Record<string, { goals: number; assists: number }>
) => {
  const live = tournamentStats[player.id] || { goals: 0, assists: 0 };
  const pressureBoost = (player.goals + live.goals) * 7 + (player.assists + live.assists) * 2.5;
  return player.attack * 1.3 + pressureBoost;
};

const getPenaltyConversionChance = (
  shooter: KeyPlayer,
  opponentKeeperRating: number,
  opponentCondition?: TeamCondition
) => {
  const defensiveDrag = (opponentCondition?.defensePenalty || 0) * 2.5;
  return clamp(
    0.62 + shooter.attack / 260 - opponentKeeperRating / 420 + defensiveDrag / 20,
    0.46,
    0.9
  );
};

const simulatePenaltyShootout = (
  homeTeamId: string,
  awayTeamId: string,
  tournamentStats: Record<string, { goals: number; assists: number }>,
  conditions: Record<string, TeamCondition>
) => {
  const homeShooters = getOutfieldPlayersForTeam(homeTeamId);
  const awayShooters = getOutfieldPlayersForTeam(awayTeamId);
  const homeKeeperRating = getKeeperRating(homeTeamId);
  const awayKeeperRating = getKeeperRating(awayTeamId);

  let home = 0;
  let away = 0;

  for (let round = 0; round < 5; round += 1) {
    const homeShooter = randomWeightedPick(homeShooters, player => getPenaltyShooterWeight(player, tournamentStats));
    const awayShooter = randomWeightedPick(awayShooters, player => getPenaltyShooterWeight(player, tournamentStats));

    if (Math.random() < getPenaltyConversionChance(homeShooter, awayKeeperRating, conditions[awayTeamId])) home += 1;
    if (Math.random() < getPenaltyConversionChance(awayShooter, homeKeeperRating, conditions[homeTeamId])) away += 1;

    const roundsLeft = 4 - round;
    if (home > away + roundsLeft) break;
    if (away > home + roundsLeft) break;
  }

  let suddenDeath = 0;
  while (home === away && suddenDeath < 8) {
    suddenDeath += 1;
    const homeShooter = randomWeightedPick(homeShooters, player => getPenaltyShooterWeight(player, tournamentStats));
    const awayShooter = randomWeightedPick(awayShooters, player => getPenaltyShooterWeight(player, tournamentStats));
    const homeScored = Math.random() < getPenaltyConversionChance(homeShooter, awayKeeperRating, conditions[awayTeamId]);
    const awayScored = Math.random() < getPenaltyConversionChance(awayShooter, homeKeeperRating, conditions[homeTeamId]);
    if (homeScored) home += 1;
    if (awayScored) away += 1;
  }

  if (home === away) {
    if (Math.random() < 0.5) home += 1;
    else away += 1;
  }

  return {
    home,
    away,
    winnerId: home > away ? homeTeamId : awayTeamId,
  };
};

const getChungoEffect = (chungoType: ChungoType) =>
  chungoType === "normal" ? undefined : CHUNGO_LIBRARY[chungoType];

export const generateKnockoutMatchDetail = (
  homeTeam: Team,
  awayTeam: Team,
  homeGoals: number,
  awayGoals: number,
  resultMode: KnockoutResultMode,
  chungoType: ChungoType,
  existingDetails: Record<string, KnockoutMatchDetail>
): KnockoutMatchDetail => {
  const tournamentStats = buildTournamentPlayerTotals(existingDetails);
  const conditions = buildTeamConditions(existingDetails);
  let winner: Team;
  let loser: Team;
  let penalties: KnockoutMatchDetail["penalties"];

  if (resultMode === "pens") {
    const shootout = simulatePenaltyShootout(homeTeam.id, awayTeam.id, tournamentStats, conditions);
    penalties = { home: shootout.home, away: shootout.away };
    winner = shootout.winnerId === homeTeam.id ? homeTeam : awayTeam;
    loser = shootout.winnerId === homeTeam.id ? awayTeam : homeTeam;
  } else {
    winner = homeGoals > awayGoals ? homeTeam : awayTeam;
    loser = homeGoals > awayGoals ? awayTeam : homeTeam;
  }

  const events = buildMatchEvents(
    homeTeam.id,
    awayTeam.id,
    homeGoals,
    awayGoals,
    resultMode,
    tournamentStats
  );
  const chungoEffect = getChungoEffect(chungoType);

  return {
    homeTeamId: homeTeam.id,
    awayTeamId: awayTeam.id,
    homeGoals,
    awayGoals,
    winnerId: winner.id,
    loserId: loser.id,
    resultMode,
    penalties,
    chungoType: chungoEffect?.type,
    chungoNote: chungoEffect?.note,
    events,
  };
};

export const getConditionPenalty = (
  teamId: string,
  knockoutDetails: Record<string, KnockoutMatchDetail>
) => {
  const conditions = buildTeamConditions(knockoutDetails);
  const current = conditions[teamId];
  if (!current) return 0;
  return current.attackPenalty + current.defensePenalty * 0.85 + current.staminaPenalty * 0.7 + current.level * 0.3;
};
