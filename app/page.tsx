"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { 
  GROUPS, 
  Match, 
  Team,
  getPreloadedMatches, 
  generateAllMatches,
  computeGroupStandings,
  getBestThirds,
  simulateGroupMatch,
  simulateKnockoutMatch,
  getTeamPower,
  historicalMap,
  getTeamFlagUrl
} from "../data/teams";
import GroupCard from "../components/GroupCard";
import equiposData from "../data/equipos.json";
import BestThirdsTable from "../components/BestThirdsTable";
import BracketView from "../components/BracketView";
import { supabase } from "../lib/supabase";
import { 
  Trophy, 
  Swords, 
  Play, 
  Trash2, 
  RefreshCw, 
  Search, 
  Award,
  Calendar,
  AlertCircle,
  User,
  Users,
  CheckCircle,
  AlertTriangle,
  Info,
  X,
  Camera,
  Check,
  Clock,
  Globe,
  LayoutGrid,
  Flame,
  BarChart2,
  Zap,
  Sliders
} from "lucide-react";

export default function Home() {
  // Simulator states
  const [matches, setMatches] = useState<Record<string, Match[]>>(() => getPreloadedMatches());
  const [manualStandings, setManualStandings] = useState<Record<string, string[] | null>>({});
  const [gdTweaks, setGdTweaks] = useState<Record<string, number>>({});
  const [gfTweaks, setGfTweaks] = useState<Record<string, number>>({});
  const [koWinners, setKoWinners] = useState<Record<string, Team>>({});

  // UI state
  const [activeTab, setActiveTab] = useState<"groups" | "thirds" | "bracket" | "stats" | "community">("groups");
  const [searchQuery, setSearchQuery] = useState("");
  const [hoveredTeam, setHoveredTeam] = useState<string | null>(null);

  // Supabase & User states
  const [username, setUsername] = useState("");
  const [userId, setUserId] = useState("");
  const [avatar, setAvatar] = useState("");
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [allPredictions, setAllPredictions] = useState<any[]>([]);
  const [selectedCompareUser, setSelectedCompareUser] = useState("");
  const [viewingUserBracket, setViewingUserBracket] = useState<any | null>(null);
  const [isBracketSimulated, setIsBracketSimulated] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const [simulationComment, setSimulationComment] = useState<{ text: string; type: "info" | "warning" | "success" } | null>(null);

  // Steam-like Cropper states
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [baseSize, setBaseSize] = useState({ width: 200, height: 200, scaleToCover: 1 });
  const imageRef = useRef<HTMLImageElement | null>(null);

  const handleDragStart = (clientX: number, clientY: number) => {
    setIsDragging(true);
    setDragStart({
      x: clientX - pan.x,
      y: clientY - pan.y
    });
  };

  const handleDragMove = (clientX: number, clientY: number) => {
    if (!isDragging) return;
    const imgWidth = baseSize.width * zoom;
    const imgHeight = baseSize.height * zoom;
    const limitX = Math.max(0, (imgWidth - 200) / 2);
    const limitY = Math.max(0, (imgHeight - 200) / 2);
    setPan({
      x: Math.min(Math.max(clientX - dragStart.x, -limitX), limitX),
      y: Math.min(Math.max(clientY - dragStart.y, -limitY), limitY)
    });
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleCropperImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    const naturalWidth = img.naturalWidth;
    const naturalHeight = img.naturalHeight;
    const scaleToCover = Math.max(200 / naturalWidth, 200 / naturalHeight);
    setBaseSize({
      width: naturalWidth * scaleToCover,
      height: naturalHeight * scaleToCover,
      scaleToCover
    });
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleCropSave = () => {
    if (!imageRef.current || !cropImageSrc) return;
    const img = imageRef.current;
    const canvas = document.createElement("canvas");
    const CROP_SIZE = 120;
    canvas.width = CROP_SIZE;
    canvas.height = CROP_SIZE;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const viewSize = 200;
    const { width: baseWidth, height: baseHeight, scaleToCover } = baseSize;
    const rx = -100;
    const ry = -100;
    const ix = (rx - pan.x) / zoom;
    const iy = (ry - pan.y) / zoom;
    const displayedX = ix + baseWidth / 2;
    const displayedY = iy + baseHeight / 2;
    const sx = displayedX / scaleToCover;
    const sy = displayedY / scaleToCover;
    const sw = (viewSize / zoom) / scaleToCover;
    const sh = (viewSize / zoom) / scaleToCover;
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, CROP_SIZE, CROP_SIZE);
    const croppedDataUrl = canvas.toDataURL("image/jpeg", 0.75);
    setAvatar(croppedDataUrl);
    setCropImageSrc(null);
  };

  // Auto-dismiss simulation commentary after 7 seconds
  useEffect(() => {
    if (simulationComment) {
      const timer = setTimeout(() => {
        setSimulationComment(null);
      }, 7000);
      return () => clearTimeout(timer);
    }
  }, [simulationComment]);

  // Load cached username, fetch comparison data, and select random accent color theme
  useEffect(() => {
    // Shifting accent color theme mechanic
    const themes = [
      { name: "indigo", primary: "#6366f1", primaryRgb: "99, 102, 241", accent: "#8b5cf6", accentRgb: "139, 92, 246" },
      { name: "amarillo", primary: "#fbbf24", primaryRgb: "251, 191, 36", accent: "#f59e0b", accentRgb: "245, 158, 11" },
      { name: "rojo", primary: "#ef4444", primaryRgb: "239, 68, 68", accent: "#f87171", accentRgb: "248, 113, 113" },
      { name: "verde", primary: "#10b981", primaryRgb: "16, 185, 129", accent: "#34d399", accentRgb: "52, 211, 153" },
      { name: "naranja", primary: "#f97316", primaryRgb: "249, 115, 22", accent: "#fb923c", accentRgb: "251, 146, 60" },
      { name: "blanco", primary: "#f3f4f6", primaryRgb: "243, 244, 246", accent: "#38bdf8", accentRgb: "56, 189, 248" },
      { name: "rosado", primary: "#ec4899", primaryRgb: "236, 72, 153", accent: "#f472b6", accentRgb: "244, 114, 182" },
      { name: "cian", primary: "#06b6d4", primaryRgb: "6, 182, 212", accent: "#22d3ee", accentRgb: "34, 211, 238" }
    ];
    const randomTheme = themes[Math.floor(Math.random() * themes.length)];
    const root = document.documentElement;
    root.style.setProperty("--primary", randomTheme.primary);
    root.style.setProperty("--primary-rgb", randomTheme.primaryRgb);
    root.style.setProperty("--accent", randomTheme.accent);
    root.style.setProperty("--accent-rgb", randomTheme.accentRgb);
    root.style.setProperty("--border-color", `rgba(${randomTheme.primaryRgb}, 0.15)`);
    root.style.setProperty("--border-glow", `rgba(${randomTheme.accentRgb}, 0.4)`);

    let storedId = localStorage.getItem("wc_user_id");
    if (!storedId) {
      storedId = "usr_" + Math.random().toString(36).substring(2, 11) + "_" + Date.now();
      localStorage.setItem("wc_user_id", storedId);
    }
    setUserId(storedId);

    const initProfile = async (uId: string) => {
      try {
        const { data: myData } = await supabase
          .from("predictions")
          .select("username, avatar, predictions")
          .eq("id", uId)
          .maybeSingle();

        if (myData) {
          setUsername(myData.username);
          setAvatar(myData.avatar || "");
          localStorage.setItem("wc_username", myData.username);
          if (myData.predictions) {
            if (myData.predictions.matches) {
              setMatches(prev => {
                const updated = { ...prev };
                Object.keys(myData.predictions.matches).forEach(mId => {
                  Object.keys(updated).forEach(gId => {
                    const match = updated[gId].find(m => m.id === mId);
                    if (match) match.result = myData.predictions.matches[mId];
                  });
                });
                return updated;
              });
            }
            if (myData.predictions.manualStandings) setManualStandings(myData.predictions.manualStandings);
            if (myData.predictions.gdTweaks) setGdTweaks(myData.predictions.gdTweaks);
            if (myData.predictions.gfTweaks) setGfTweaks(myData.predictions.gfTweaks);
            if (myData.predictions.koWinners) setKoWinners(myData.predictions.koWinners);
            if (myData.predictions.isBracketSimulated !== undefined) {
              setIsBracketSimulated(myData.predictions.isBracketSimulated);
            }
          }
        } else {
          const cachedName = localStorage.getItem("wc_username");
          if (cachedName) {
            setUsername(cachedName);
          } else {
            setShowLoginModal(true);
          }
        }
      } catch (err) {
        console.error("Error loading user profile:", err);
      }
    };

    initProfile(storedId);
    loadPredictions();
  }, []);

  const loadPredictions = async () => {
    try {
      const { data, error } = await supabase
        .from("predictions")
        .select("id, username, avatar, predictions, updated_at")
        .order("updated_at", { ascending: false });
      if (error) {
        console.error("Error fetching predictions from Supabase:", error);
      } else if (data) {
        setAllPredictions(data);
      }
    } catch (err) {
      console.error("Exception loading predictions:", err);
    }
  };

  const handleSavePrediction = async () => {
    if (!username) {
      setShowLoginModal(true);
      return;
    }
    setIsSaving(true);
    setSaveMessage(null);

    const payload = {
      matches: Object.keys(matches).reduce((acc, groupId) => {
        matches[groupId].forEach(m => {
          acc[m.id] = m.result;
        });
        return acc;
      }, {} as Record<string, "H" | "A" | "D" | null>),
      manualStandings,
      gdTweaks,
      gfTweaks,
      koWinners: Object.keys(koWinners).reduce((acc, mId) => {
        acc[mId] = koWinners[mId];
        return acc;
      }, {} as Record<string, Team>),
      isBracketSimulated
    };

    try {
      const { error } = await supabase
        .from("predictions")
        .upsert(
          { 
            id: userId,
            username, 
            avatar: avatar || null,
            predictions: payload, 
            updated_at: new Date().toISOString() 
          }, 
          { onConflict: "id" }
        );

      if (error) {
        setSaveMessage({ text: `Error al guardar: ${error.message}`, type: "error" });
      } else {
        setSaveMessage({ text: "¡Predicción guardada con éxito!", type: "success" });
        loadPredictions();
      }
    } catch (err: any) {
      setSaveMessage({ text: `Error inesperado: ${err.message || err}`, type: "error" });
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveMessage(null), 4000);
    }
  };

  const compareData = useMemo(() => {
    if (!selectedCompareUser) return null;
    return allPredictions.find(p => p.id === selectedCompareUser) || null;
  }, [allPredictions, selectedCompareUser]);

  const teamStatsList = useMemo(() => {
    const rawEquipos = equiposData.equipos || [];
    const list = GROUPS.flatMap(g => g.teams).map(team => {
      const stats = rawEquipos.find((eq: any) => eq.id.toUpperCase() === team.id.toUpperCase()) || { puntos_fifa: 1400, forma_reciente: 0, grupo: "A" };
      const hist = historicalMap[team.id.toUpperCase()] || { win_rate: 0.5, gd_average: 0.0, strength_of_schedule: 1.0 };
      const power = Math.round(getTeamPower(team));
      return {
        team,
        grupo: stats.grupo,
        puntosFifa: stats.puntos_fifa,
        formaReciente: stats.forma_reciente,
        winRate: hist.win_rate,
        gdAverage: hist.gd_average,
        sos: hist.strength_of_schedule,
        power
      };
    });
    return list.sort((a, b) => b.power - a.power);
  }, []);

  // Trigger simulation feedback comments
  const triggerSimulationComment = (teamA: Team, teamB: Team, outcome: string, isKnockout: boolean) => {
    let winner: Team | null = null;
    let loser: Team | null = null;
    let isDraw = false;

    if (isKnockout) {
      if (outcome === teamA.id) {
        winner = teamA;
        loser = teamB;
      } else {
        winner = teamB;
        loser = teamA;
      }
    } else {
      if (outcome === "H") {
        winner = teamA;
        loser = teamB;
      } else if (outcome === "A") {
        winner = teamB;
        loser = teamA;
      } else if (outcome === "D") {
        isDraw = true;
      }
    }

    if (isDraw) {
      const drawComments = [
        `Che wachin, metiste un empate cantado. Mucho respeto y poco fútbol acá entre ${teamA.name} y ${teamB.name}.`,
        `¿Empate, wachin? Se nota que te dio miedo arriesgar por alguno en el ${teamA.name} vs ${teamB.name}.`,
        `Tablas, wachin. Un puntito para cada uno en el clásico ${teamA.name} - ${teamB.name} y a rezar a la iglesia.`,
        `Qué pecho frío ese empate, wachin. Ponelo a ganar a alguno del partido ${teamA.name} - ${teamB.name}, no seas cagón.`
      ];
      const randomDraw = drawComments[Math.floor(Math.random() * drawComments.length)];
      setSimulationComment({ text: randomDraw, type: "info" });
      return;
    }

    if (!winner || !loser) return;

    const wId = winner.id.toLowerCase();
    const lId = loser.id.toLowerCase();

    // Custom classic matchups
    if (wId === "arg" && lId === "bra") {
      setSimulationComment({
        text: "¡Hermoso, wachin! Le ganamos a Brasil. ¡El clásico es nuestro y que la sigan mamando!",
        type: "success"
      });
      return;
    }
    if (wId === "bra" && lId === "arg") {
      setSimulationComment({
        text: "¡Pará, wachin! ¿Cómo vas a poner a ganar a Brasil contra nosotros? ¡Te falta patria!",
        type: "warning"
      });
      return;
    }
    if (wId === "arg" && lId === "ger") {
      setSimulationComment({
        text: "¡Revancha de 2014, wachin! Le ganamos la final a los alemanes. ¡Vamo' arriba!",
        type: "success"
      });
      return;
    }
    if (wId === "ger" && lId === "bra") {
      setSimulationComment({
        text: "¡Fua, wachin! ¿Otro 7-1? Los alemanes son la pesadilla histórica de Brasil.",
        type: "info"
      });
      return;
    }
    if (wId === "arg" && lId === "fra") {
      setSimulationComment({
        text: "¡Como en Qatar, wachin! Los atendimos de nuevo a los franceses. ¿Trajiste los parlantes?",
        type: "success"
      });
      return;
    }
    if (wId === "fra" && lId === "arg") {
      setSimulationComment({
        text: "No, wachin, no me hagas acordar de Mbappé. Dolor país absoluto.",
        type: "warning"
      });
      return;
    }

    const rankDiff = winner.fifaRank - loser.fifaRank; // positive means winner has worse rank (underdog)

    // Giant killer / Miracle (rankDiff > 30)
    if (rankDiff > 30) {
      const miracleComments = [
        `¿Qué tomaste, wachin? ¿Cómo va a ganar ${winner.name} (#${winner.fifaRank}) contra ${loser.name} (#${loser.fifaRank})? ¡Es el delirio místico del año!`,
        `Pará la mano, wachin. ${winner.name} ganándole a ${loser.name} es más imposible que ver un chancho volar. Te fuiste al pasto.`,
        `Sos un wachin delirante. ${winner.name} no le gana a ${loser.name} ni aunque jueguen con 12 arqueros. ¡Tremendo flash metiste!`,
        `¡Dejá de jugar al revés, wachin! Eso no se lo cree nadie. ${winner.name} metiendo semejante batacazo ante la potencia mundial de ${loser.name}.`
      ];
      const comment = miracleComments[Math.floor(Math.random() * miracleComments.length)];
      setSimulationComment({ text: comment, type: "warning" });
    }
    // Shock / Batacazo (rankDiff > 15)
    else if (rankDiff > 15) {
      const shockComments = [
        `Epa, wachin, ¡qué batacazo metiste! ${winner.name} (#${winner.fifaRank}) dando el golpe de su vida contra ${loser.name} (#${loser.fifaRank}).`,
        `Mirá que te tengo fe, wachin, pero poner a ganar a ${winner.name} sobre ${loser.name} es jugársela muy fuerte. ¡Sorpresón!`,
        `La fe mueve montañas, wachin. Pusiste a ${winner.name} ganándole a la jerarquía de ${loser.name}. Rompiste todos los papeles.`,
        `¡Qué loco lindo que sos, wachin! Se cae el estadio con este triunfo de ${winner.name} contra ${loser.name}.`
      ];
      const comment = shockComments[Math.floor(Math.random() * shockComments.length)];
      setSimulationComment({ text: comment, type: "warning" });
    }
    // Underdog surprise (rankDiff > 6)
    else if (rankDiff > 6) {
      const underdogComments = [
        `Ojo ahí, wachin, ganaron los menos pensados. ${winner.name} (#${winner.fifaRank}) le arruinó la tarde a ${loser.name} (#${loser.fifaRank}).`,
        `Interesante jugada, wachin. ${winner.name} tiene con qué ganarle a ${loser.name} si se alinean los planetas.`,
        `Le tiraste unos mangos al underdog, ¿no, wachin? ${winner.name} da la nota venciendo a ${loser.name}.`
      ];
      const comment = underdogComments[Math.floor(Math.random() * underdogComments.length)];
      setSimulationComment({ text: comment, type: "info" });
    }
    // Peer match (rankDiff >= -6 && rankDiff <= 6)
    else if (rankDiff >= -6 && rankDiff <= 6) {
      const peerComments = [
        `Partido re picante, wachin. Cualquiera de los dos podía ganar, pero te la jugaste por ${winner.name}.`,
        `Duelo parejo, wachin. ${winner.name} y ${loser.name} se dan con todo, pero para vos festeja la banda de ${winner.name}.`,
        `Acá no hay favoritos, wachin. ${winner.name} se lo lleva por pura garra contra ${loser.name}.`
      ];
      const comment = peerComments[Math.floor(Math.random() * peerComments.length)];
      setSimulationComment({ text: comment, type: "info" });
    }
    // Expected Logic (rankDiff < -6 && rankDiff >= -20)
    else if (rankDiff < -6 && rankDiff >= -20) {
      const logicComments = [
        `Predicción re lógica, wachin. ${winner.name} le tira la chapa encima a ${loser.name} y a cobrar.`,
        `No te querés complicar la vida, ¿no, wachin? ${winner.name} es favorito y hace lo que tiene que hacer ante ${loser.name}.`,
        `Resultado cantado, wachin. La jerarquía de ${winner.name} (#${winner.fifaRank}) es demasiada para ${loser.name} (#${loser.fifaRank}).`
      ];
      const comment = logicComments[Math.floor(Math.random() * logicComments.length)];
      setSimulationComment({ text: comment, type: "success" });
    }
    // Giant stomping (rankDiff < -20)
    else {
      const stompComments = [
        `Sos un wachin abusivo, ¿cómo vas a dudar acá? ${winner.name} (#${winner.fifaRank}) pasa por arriba a ${loser.name} (#${loser.fifaRank}) con los ojos cerrados.`,
        `Trámite total, wachin. ${winner.name} le da un paseo histórico a ${loser.name}.`,
        `Ni los parientes de ${loser.name} pensaban que ganaban, wachin. Paseo total de ${winner.name}.`
      ];
      const comment = stompComments[Math.floor(Math.random() * stompComments.length)];
      setSimulationComment({ text: comment, type: "success" });
    }
  };

  // Match Change Handler
  const handleMatchResultChange = (matchId: string, result: "H" | "A" | "D" | null) => {
    if (result !== null) {
      const groupId = matchId.split("-")[0];
      const match = matches[groupId]?.find(m => m.id === matchId);
      if (match) {
        triggerSimulationComment(match.homeTeam, match.awayTeam, result, false);
      }
    }
    const groupId = matchId.split("-")[0];
    setMatches(prev => {
      const updated = prev[groupId].map(m => m.id === matchId ? { ...m, result } : m);
      return { ...prev, [groupId]: updated };
    });
    // Invalidate knockout bracket downstream when group stages change
    setKoWinners({});
    setIsBracketSimulated(false);
  };

  // Toggle Mode (Automatic Match Sim vs Manual Ordering)
  const handleToggleMode = (groupId: string) => {
    setManualStandings(prev => {
      const current = prev[groupId];
      if (current !== undefined && current !== null) {
        return { ...prev, [groupId]: null };
      } else {
        const group = GROUPS.find(g => g.id === groupId);
        if (!group) return prev;
        
        const computed = computeGroupStandings(
          group,
          matches[groupId],
          null,
          gdTweaks,
          gfTweaks
        );
        const order = computed.map((s) => s.team.id);
        return { ...prev, [groupId]: order };
      }
    });
    setKoWinners({});
    setIsBracketSimulated(false);
  };

  // Swap Teams in Manual Mode
  const handleSwapTeams = (groupId: string, index: number, direction: "up" | "down") => {
    const group = GROUPS.find(g => g.id === groupId);
    if (!group) return;

    let order = manualStandings[groupId];
    if (!order) {
      const computed = computeGroupStandings(
        group,
        matches[groupId],
        null,
        gdTweaks,
        gfTweaks
      );
      order = computed.map((s) => s.team.id);
    }

    const newOrder = [...order];
    const targetIndex = direction === "up" ? index - 1 : index + 1;

    if (targetIndex >= 0 && targetIndex < newOrder.length) {
      const temp = newOrder[index];
      newOrder[index] = newOrder[targetIndex];
      newOrder[targetIndex] = temp;

      setManualStandings(prev => ({
        ...prev,
        [groupId]: newOrder
      }));
      setKoWinners({});
      setIsBracketSimulated(false);
    }
  };

  // Tweak Goal Difference (GD)
  const handleTweakGd = (teamId: string, delta: number) => {
    setGdTweaks(prev => ({
      ...prev,
      [teamId]: (prev[teamId] || 0) + delta
    }));
    setKoWinners({});
    setIsBracketSimulated(false);
  };

  // Tweak Goals For (GF)
  const handleTweakGf = (teamId: string, delta: number) => {
    setGfTweaks(prev => ({
      ...prev,
      [teamId]: (prev[teamId] || 0) + delta
    }));
    setKoWinners({});
    setIsBracketSimulated(false);
  };

  // Action: Clear all matches
  const handleClearMatches = () => {
    setMatches(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(groupId => {
        updated[groupId] = updated[groupId].map(match => 
          match.isOfficial ? match : { ...match, result: null }
        );
      });
      return updated;
    });
    setManualStandings({});
    setGdTweaks({});
    setGfTweaks({});
    setKoWinners({});
    setIsBracketSimulated(false);
  };

  // Action: Preload the scenario from detalles.txt
  const handlePreload = () => {
    setMatches(getPreloadedMatches());
    setManualStandings({});
    setGdTweaks({});
    setGfTweaks({});
    setKoWinners({});
    setIsBracketSimulated(false);
  };

  // Action: Select Winner in Knockout Match
  const handleSelectKoWinner = (matchId: string, winner: Team, loser: Team) => {
    triggerSimulationComment(winner, loser, winner.id, true);
    setIsBracketSimulated(false);
    setKoWinners(prev => {
      const next = { ...prev, [matchId]: winner };
      
      // Cascade-invalidate downstream matches if winner of parent changed
      // Round of 16 validation
      for (let i = 1; i <= 8; i++) {
        const p1 = next[`R32-${2 * i - 1}`];
        const p2 = next[`R32-${2 * i}`];
        const w = next[`R16-${i}`];
        if (w && w.id !== p1?.id && w.id !== p2?.id) {
          delete next[`R16-${i}`];
        }
      }
      
      // Quarterfinals validation
      for (let i = 1; i <= 4; i++) {
        const p1 = next[`R16-${2 * i - 1}`];
        const p2 = next[`R16-${2 * i}`];
        const w = next[`QF-${i}`];
        if (w && w.id !== p1?.id && w.id !== p2?.id) {
          delete next[`QF-${i}`];
        }
      }
      
      // Semifinals validation
      for (let i = 1; i <= 2; i++) {
        const p1 = next[`QF-${2 * i - 1}`];
        const p2 = next[`QF-${2 * i}`];
        const w = next[`SF-${i}`];
        if (w && w.id !== p1?.id && w.id !== p2?.id) {
          delete next[`SF-${i}`];
        }
      }
      
      // Final & Third Place validation
      const sf1 = next[`SF-1`];
      const sf2 = next[`SF-2`];
      
      const finalWinner = next[`F-1`];
      if (finalWinner && finalWinner.id !== sf1?.id && finalWinner.id !== sf2?.id) {
        delete next[`F-1`];
      }
      
      const tpWinner = next[`TP-1`];
      if (tpWinner) {
        const sf1Part1 = next[`QF-1`];
        const sf1Part2 = next[`QF-2`];
        const sf2Part1 = next[`QF-3`];
        const sf2Part2 = next[`QF-4`];
        const sf1Loser = sf1 ? (sf1.id === sf1Part1?.id ? sf1Part2 : sf1Part1) : null;
        const sf2Loser = sf2 ? (sf2.id === sf2Part1?.id ? sf2Part2 : sf2Part1) : null;
        if (tpWinner.id !== sf1Loser?.id && tpWinner.id !== sf2Loser?.id) {
          delete next[`TP-1`];
        }
      }

      return next;
    });
  };

  // Action: Simulate all remaining/blank matches using FIFA points & form (including Knockout Bracket!)
  const handleSimulateAllRandom = () => {
    const simulatedMatches: Record<string, Match[]> = {};

    GROUPS.forEach(g => {
      simulatedMatches[g.id] = matches[g.id].map(match => {
        if (match.isOfficial) return match;
        const outcome = simulateGroupMatch(match.homeTeam, match.awayTeam);
        return { ...match, result: outcome };
      });
    });

    setMatches(simulatedMatches);
    setManualStandings({});
    setGdTweaks({});
    setGfTweaks({});

    // Now, let's simulate the entire knockout stage step-by-step using FIFA ratings
    // Compute qualifiers first
    const winnersObj: Record<string, Team> = {};
    const runnersUpObj: Record<string, Team> = {};
    
    GROUPS.forEach(g => {
      const standings = computeGroupStandings(g, simulatedMatches[g.id], null, {}, {});
      if (standings.length >= 2) {
        winnersObj[g.id] = standings[0].team;
        runnersUpObj[g.id] = standings[1].team;
      }
    });

    const thirdsList = getBestThirds(GROUPS, simulatedMatches, {}, {}, {}).slice(0, 8);

    const getW = (gid: string) => winnersObj[gid];
    const getR = (gid: string) => runnersUpObj[gid];
    const getT = (rankIdx: number) => thirdsList[rankIdx]?.team;

    const simulatedKo: Record<string, Team> = {};
    const pickLoser = (winner: Team, t1: Team, t2: Team): Team => winner.id === t1.id ? t2 : t1;

    // R32 Pairings
    const r32Matches: [Team, Team][] = [
      [getW("A"), getT(7)],
      [getR("B"), getR("F")],
      [getW("C"), getT(6)],
      [getR("D"), getR("H")],
      [getW("E"), getT(5)],
      [getR("A"), getR("C")],
      [getW("G"), getT(4)],
      [getR("I"), getR("K")],
      [getW("B"), getT(3)],
      [getR("E"), getR("G")],
      [getW("D"), getT(2)],
      [getR("J"), getR("L")],
      [getW("F"), getT(1)],
      [getW("J"), getR("I")],
      [getW("H"), getT(0)],
      [getW("I"), getR("J")],
    ].map(([t1, t2]) => {
      const team1 = t1 || { id: "f-1", name: "Equipo A", flag: "mx", fifaRank: 99 };
      const team2 = t2 || { id: "f-2", name: "Equipo B", flag: "br", fifaRank: 99 };
      return [team1, team2];
    });

    // Run R32
    for (let i = 1; i <= 16; i++) {
      const [t1, t2] = r32Matches[i - 1];
      simulatedKo[`R32-${i}`] = simulateKnockoutMatch(t1, t2);
    }

    // Run R16
    for (let i = 1; i <= 8; i++) {
      const t1 = simulatedKo[`R32-${2 * i - 1}`];
      const t2 = simulatedKo[`R32-${2 * i}`];
      simulatedKo[`R16-${i}`] = simulateKnockoutMatch(t1, t2);
    }

    // Run QF
    for (let i = 1; i <= 4; i++) {
      const t1 = simulatedKo[`R16-${2 * i - 1}`];
      const t2 = simulatedKo[`R16-${2 * i}`];
      simulatedKo[`QF-${i}`] = simulateKnockoutMatch(t1, t2);
    }

    // Run SF
    for (let i = 1; i <= 2; i++) {
      const t1 = simulatedKo[`QF-${2 * i - 1}`];
      const t2 = simulatedKo[`QF-${2 * i}`];
      simulatedKo[`SF-${i}`] = simulateKnockoutMatch(t1, t2);
    }

    // Run TP & Final
    const sf1Winner = simulatedKo[`SF-1`];
    const sf2Winner = simulatedKo[`SF-2`];
    const sf1Loser = pickLoser(sf1Winner, simulatedKo[`QF-1`], simulatedKo[`QF-2`]);
    const sf2Loser = pickLoser(sf2Winner, simulatedKo[`QF-3`], simulatedKo[`QF-4`]);

    simulatedKo[`TP-1`] = simulateKnockoutMatch(sf1Loser, sf2Loser);
    simulatedKo[`F-1`] = simulateKnockoutMatch(sf1Winner, sf2Winner);

    setKoWinners(simulatedKo);
    setIsBracketSimulated(true);
  };

  // Compute Total Progress Stats
  const progressStats = useMemo(() => {
    let totalMatches = 0;
    let playedMatches = 0;

    Object.values(matches).forEach(groupMatches => {
      groupMatches.forEach(m => {
        totalMatches += 1;
        if (m.result !== null) playedMatches += 1;
      });
    });

    return {
      total: totalMatches,
      played: playedMatches,
      percentage: Math.round((playedMatches / totalMatches) * 100)
    };
  }, [matches]);

  // Best thirds IDs in the top 8
  const bestThirdsIds = useMemo(() => {
    return getBestThirds(GROUPS, matches, manualStandings, gdTweaks, gfTweaks)
      .slice(0, 8)
      .map(t => t.team.id);
  }, [matches, manualStandings, gdTweaks, gfTweaks]);

  // Reconstruct matches for viewing user bracket
  const viewingUserBracketMatches = useMemo(() => {
    if (!viewingUserBracket) return {};
    const baseMatches = getPreloadedMatches();
    const savedMatches = viewingUserBracket.predictions?.matches || {};
    
    // Update match results
    Object.keys(baseMatches).forEach(groupId => {
      baseMatches[groupId] = baseMatches[groupId].map(m => ({
        ...m,
        result: savedMatches[m.id] !== undefined ? savedMatches[m.id] : null
      }));
    });
    
    return baseMatches;
  }, [viewingUserBracket]);

  return (
    <main className="app-container">
      {/* Premium Header */}
      <header className="app-header">
        <div className="flex items-center justify-between gap-2 w-full">
          <div className="title-badge" style={{ margin: 0, display: "inline-flex", alignItems: "center", gap: "6px" }}>
            <Trophy className="w-3.5 h-3.5 text-yellow-500" /> Fixture Interactivo 2026
          </div>
          {username && (
            <div 
              onClick={() => setShowProfileModal(true)}
              className="profile-bar font-mono" 
              style={{ 
                display: "inline-flex", 
                alignItems: "center", 
                gap: "10px", 
                cursor: "pointer",
                padding: "4px 16px 4px 4px",
                borderRadius: "30px",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                backdropFilter: "blur(10px)",
                transition: "all 0.2s ease"
              }}
              title="Configurar perfil"
            >
              {avatar ? (
                <img 
                  src={avatar} 
                  style={{ 
                    width: "36px", 
                    height: "36px", 
                    borderRadius: "50%", 
                    objectFit: "cover", 
                    border: "2px solid var(--primary)",
                    boxShadow: "0 0 8px rgba(99, 102, 241, 0.4)",
                    flexShrink: 0
                  }} 
                />
              ) : (
                <div 
                  style={{ 
                    width: "36px", 
                    height: "36px", 
                    borderRadius: "50%", 
                    background: "rgba(99, 102, 241, 0.15)", 
                    border: "2px solid rgba(99, 102, 241, 0.4)",
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center",
                    flexShrink: 0
                  }}
                >
                  <User className="w-5 h-5 text-primary" style={{ width: "18px", height: "18px" }} />
                </div>
              )}
              <span style={{ fontWeight: "700", color: "#fff", fontSize: "0.95rem" }}>{username}</span>
            </div>
          )}
        </div>
        
        <h1 className="main-title">
          Simulador del Mundial 2026
        </h1>
        <p className="sub-title">
         Pronostica los resultados de los 12 grupos, reordena posiciones a mano si preferís cambiar el destino de una selección, y definí las llaves de eliminación directa hasta consagrar al Campeón del Mundo.
        </p>

        {/* Global Stats bar */}
        <div className="stats-bar">
          <div className="flex justify-between w-full">
            <div className="stat-item">
              <Calendar style={{ width: "14px", height: "14px", color: "var(--primary)" }} />
              <span className="bold" style={{ color: "#fff" }}>Partidos: {progressStats.played} / {progressStats.total}</span>
            </div>
            <div className="stat-item">
              <Award style={{ width: "14px", height: "14px", color: "var(--success)" }} />
              <span className="bold" style={{ color: "var(--success)" }}>Simulado: {progressStats.percentage}%</span>
            </div>
          </div>
          <div className="progress-track">
            <div 
              className="progress-fill"
              style={{ width: `${progressStats.percentage}%` }}
            ></div>
          </div>
          {saveMessage && (
            <div 
              style={{
                padding: "0.5rem 1rem",
                borderRadius: "8px",
                fontSize: "0.75rem",
                textAlign: "center",
                marginTop: "0.75rem",
                background: saveMessage.type === "success" ? "rgba(16, 185, 129, 0.15)" : "rgba(244, 63, 94, 0.15)",
                border: saveMessage.type === "success" ? "1px solid rgba(16, 185, 129, 0.3)" : "1px solid rgba(244, 63, 94, 0.3)",
                color: saveMessage.type === "success" ? "#a7f3d0" : "#fecdd3"
              }}
            >
              {saveMessage.text}
            </div>
          )}
        </div>
      </header>

      {/* Control bar / Search / Navigation */}
      <div className="nav-section">
        {/* Row 1: Tabs */}
        <div className="tab-row">
          <div className="tab-nav">
            <button
              onClick={() => setActiveTab("groups")}
              className={`tab-btn ${activeTab === "groups" ? "tab-btn-active" : ""}`}
            >
              <LayoutGrid style={{ width: "14px", height: "14px", flexShrink: 0 }} />
              <span>Grupos</span>
            </button>
            <button
              onClick={() => setActiveTab("thirds")}
              className={`tab-btn ${activeTab === "thirds" ? "tab-btn-active" : ""}`}
            >
              <Award style={{ width: "14px", height: "14px", flexShrink: 0 }} />
              <span>Terceros</span>
            </button>
            <button
              onClick={() => setActiveTab("bracket")}
              className={`tab-btn ${activeTab === "bracket" ? "tab-btn-active" : ""}`}
            >
              <Flame style={{ width: "14px", height: "14px", flexShrink: 0 }} />
              <span>Cruces</span>
            </button>
            <button
              onClick={() => setActiveTab("stats")}
              className={`tab-btn ${activeTab === "stats" ? "tab-btn-active" : ""}`}
            >
              <BarChart2 style={{ width: "14px", height: "14px", flexShrink: 0 }} />
              <span>Historial FIFA</span>
            </button>
            <button
              onClick={() => setActiveTab("community")}
              className={`tab-btn ${activeTab === "community" ? "tab-btn-active" : ""}`}
            >
              <Users style={{ width: "14px", height: "14px", flexShrink: 0 }} />
              <span>Comunidad</span>
            </button>
          </div>
        </div>

        {/* Row 2: Controls */}
        <div className="controls-row">
          {/* Inputs Group: Search & Compare */}
          <div className="inputs-group">
            {/* Search box (only relevant for groups) */}
            {activeTab === "groups" ? (
              <div className="search-wrapper">
                <Search className="search-icon" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Buscar equipo..."
                  className="search-input"
                />
              </div>
            ) : (
              /* Invisible placeholder to maintain layout alignment if needed, or null */
              null
            )}

            {/* Comparar dropdown */}
            <select
              value={selectedCompareUser}
              onChange={(e) => setSelectedCompareUser(e.target.value)}
              className="user-select-dropdown"
              style={{ width: activeTab === "groups" ? undefined : "100%" }}
              title="Seleccionar un usuario para comparar fixture"
            >
              <option value="">Comparar con...</option>
              {allPredictions
                .filter(p => p.id !== userId)
                .map(p => (
                  <option key={p.id || p.username} value={p.id || p.username}>
                    {p.username}
                  </option>
                ))}
            </select>
          </div>

          {/* Buttons Group */}
          <div className="buttons-group">
            {/* Guardar button */}
            <button
              onClick={handleSavePrediction}
              disabled={isSaving}
              className="btn btn-primary"
              style={{ 
                background: "linear-gradient(135deg, #10b981, #059669)", 
                borderColor: "#10b981", 
                boxShadow: "0 0 10px rgba(16, 185, 129, 0.2)" 
              }}
              title="Guardar mi predicción en Supabase"
            >
              <span>{isSaving ? "Guardando..." : "Guardar"}</span>
            </button>

            <button
              onClick={handlePreload}
              className="btn btn-secondary"
              title="Pre-cargar escenario con Suecia, Ecuador, Bosnia, Croacia en 3º lugar..."
            >
              <RefreshCw className="w-3.5 h-3.5" style={{ flexShrink: 0 }} />
              <span>Escenario</span>
            </button>
            
            <button
              onClick={handleSimulateAllRandom}
              className="btn btn-primary"
              title="Simular aleatoriamente todos los partidos del fixture y del bracket"
            >
              <Play className="w-3.5 h-3.5" style={{ flexShrink: 0 }} />
              <span>Simular Todo</span>
            </button>

            <button
              onClick={handleClearMatches}
              className="btn btn-danger-outline"
              title="Limpiar todos los partidos del fixture"
            >
              <Trash2 className="w-3.5 h-3.5" style={{ flexShrink: 0 }} />
              <span>Limpiar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Comparison Active Banner */}
      {compareData && (
        <div className="comparison-banner" style={{ display: "flex", alignItems: "center", gap: "8px", justifyContent: "space-between" }}>
          <span className="comparison-banner-text" style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
            <Users className="w-4 h-4 text-amber-400" />
            {compareData.avatar ? (
              <img 
                src={compareData.avatar} 
                style={{ 
                  width: "28px", 
                  height: "28px", 
                  borderRadius: "50%", 
                  objectFit: "cover", 
                  border: "1px solid rgba(255,255,255,0.2)",
                  flexShrink: 0 
                }} 
              />
            ) : (
              <div 
                style={{ 
                  width: "28px", 
                  height: "28px", 
                  borderRadius: "50%", 
                  background: "rgba(255,255,255,0.05)", 
                  border: "1px solid rgba(255,255,255,0.1)",
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "center",
                  flexShrink: 0 
                }}
              >
                <User style={{ width: "14px", height: "14px", color: "var(--text-secondary)" }} />
              </div>
            )}
            Comparando tu fixture con el de <strong>{compareData.username}</strong>
          </span>
          <button 
            onClick={() => setSelectedCompareUser("")} 
            className="btn btn-secondary"
            style={{ height: "28px", minHeight: "28px", fontSize: "0.7rem", padding: "0 0.5rem" }}
          >
            Salir de Comparación
          </button>
        </div>
      )}

      {/* Main View Area */}
      {activeTab === "groups" && (
        <div className="grid-groups">
          {GROUPS.map(group => (
            <GroupCard
              key={group.id}
              group={group}
              groupMatches={matches[group.id]}
              manualOrder={manualStandings[group.id] || null}
              gdTweaks={gdTweaks}
              gfTweaks={gfTweaks}
              hoveredTeam={hoveredTeam}
              setHoveredTeam={setHoveredTeam}
              onMatchResultChange={handleMatchResultChange}
              onSwapTeams={handleSwapTeams}
              onToggleMode={handleToggleMode}
              onTweakGd={handleTweakGd}
              onTweakGf={handleTweakGf}
              searchQuery={searchQuery}
              compareData={compareData}
              qualifiedThirdTeamIds={bestThirdsIds}
            />
          ))}
        </div>
      )}

      {activeTab === "thirds" && (
        <BestThirdsTable
          allMatches={matches}
          manualStandings={manualStandings}
          gdTweaks={gdTweaks}
          gfTweaks={gfTweaks}
          hoveredTeam={hoveredTeam}
          setHoveredTeam={setHoveredTeam}
        />
      )}

      {activeTab === "bracket" && (
        <BracketView
          groups={GROUPS}
          allMatches={matches}
          manualStandings={manualStandings}
          gdTweaks={gdTweaks}
          gfTweaks={gfTweaks}
          hoveredTeam={hoveredTeam}
          setHoveredTeam={setHoveredTeam}
          koWinners={koWinners}
          onSelectKoWinner={handleSelectKoWinner}
          compareData={compareData}
        />
      )}

      {activeTab === "stats" && (
        <div className="glass-panel" style={{ padding: "1.25rem", animation: "fadeInUp 0.4s ease-out" }}>
          <div className="flex flex-col gap-2" style={{ marginBottom: "1.25rem" }}>
            <h2 className="flex items-center gap-2" style={{ fontSize: "1.3rem", fontWeight: "800", color: "#fff" }}>
              <BarChart2 className="w-5 h-5 text-indigo-400 animate-pulse" />
              Rendimiento y Datos de Selecciones
            </h2>
            <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
              Análisis completo de las 48 selecciones clasificadas. Descubrí su Win-rate real (2021-2026), Diferencia de Goles Promedio, Fuerza de Oponentes (SoS) y el Poder Enriquecido final calculado por el algoritmo de simulación.
            </p>
          </div>

          <div className="standings-table-container">
            <table className="standings-table">
              <thead>
                <tr>
                  <th style={{ width: "32px", textAlign: "center" }}>#</th>
                  <th>Selección</th>
                  <th style={{ textAlign: "center", width: "40px" }}>Grupo</th>
                  <th style={{ textAlign: "center", width: "70px" }}>Ranking</th>
                  <th style={{ textAlign: "center", width: "80px" }} title="Puntos oficiales FIFA">Pts FIFA</th>
                  <th style={{ textAlign: "center", width: "80px" }} title="Win-rate en partidos clase A (2021-2026)">Win-Rate</th>
                  <th style={{ textAlign: "center", width: "80px" }} title="Diferencia de Goles Promedio">DG Prom.</th>
                  <th style={{ textAlign: "center", width: "85px" }} title="Strength of Schedule (Fuerza de Rivales)">Fuerza Oponentes</th>
                  <th style={{ textAlign: "center", width: "80px" }} title="Racha Reciente (últimos partidos)">Racha</th>
                  <th style={{ textAlign: "center", width: "90px" }} title="Poder final usado por el simulador">Poder Total</th>
                </tr>
              </thead>
              <tbody>
                {teamStatsList.map((item, index) => {
                  const wrPercent = (item.winRate * 100).toFixed(1) + "%";
                  const gdSign = item.gdAverage > 0 ? `+${item.gdAverage}` : item.gdAverage;
                  const sosFormatted = `${item.sos.toFixed(2)}x`;
                  const formaSign = item.formaReciente > 0 ? `+${item.formaReciente}` : item.formaReciente;
                  
                  return (
                    <tr 
                      key={item.team.id} 
                      onMouseEnter={() => setHoveredTeam(item.team.id)} 
                      onMouseLeave={() => setHoveredTeam(null)} 
                      style={{ 
                        backgroundColor: hoveredTeam === item.team.id ? "rgba(99, 102, 241, 0.1)" : undefined,
                        cursor: "pointer"
                      }}
                    >
                      <td style={{ textAlign: "center", fontWeight: "600", color: "var(--text-muted)" }}>{index + 1}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          <img src={getTeamFlagUrl(item.team.flag)} alt={item.team.name} className="flag-img" />
                          <span className="font-semibold text-white">{item.team.name}</span>
                        </div>
                      </td>
                      <td style={{ textAlign: "center", fontWeight: "bold" }}>{item.grupo}</td>
                      <td style={{ textAlign: "center" }} className="font-mono text-xs">#{item.team.fifaRank}</td>
                      <td style={{ textAlign: "center" }} className="font-mono">{item.puntosFifa}</td>
                      <td style={{ textAlign: "center" }} className="font-mono text-emerald-400">{wrPercent}</td>
                      <td style={{ textAlign: "center", color: item.gdAverage >= 0 ? "var(--success)" : "var(--danger)" }} className="font-mono">{wrPercent === "50.0%" && item.gdAverage === 0 ? "—" : gdSign}</td>
                      <td style={{ textAlign: "center" }} className="font-mono text-purple-300">{wrPercent === "50.0%" && item.sos === 1.0 ? "—" : sosFormatted}</td>
                      <td style={{ textAlign: "center", color: item.formaReciente >= 0 ? "var(--success)" : "var(--danger)" }} className="font-mono">{formaSign}</td>
                      <td style={{ textAlign: "center" }}>
                        <span className="badge badge-success font-mono font-bold" style={{ backgroundColor: "rgba(99, 102, 241, 0.15)", borderColor: "rgba(99, 102, 241, 0.4)", color: "var(--primary)" }}>
                          {item.power}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "community" && (
        <div className="glass-panel" style={{ padding: "1.25rem", animation: "fadeInUp 0.4s ease-out" }}>
          <div className="flex flex-col gap-2" style={{ marginBottom: "1.25rem" }}>
            <h2 className="flex items-center gap-2" style={{ fontSize: "1.3rem", fontWeight: "800", color: "#fff", margin: 0 }}>
              <Users className="w-5 h-5 text-indigo-400" />
              Pronósticos de la Comunidad
            </h2>
            <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", margin: 0 }}>
              Visualizá y compará tus predicciones con las de otros aficionados en tiempo real. Hacé clic en "Comparar Fixture" para ver las diferencias.
            </p>
          </div>

          {allPredictions.length === 0 ? (
            <div className="text-center" style={{ padding: "3rem 1rem", color: "var(--text-secondary)" }}>
              No hay predicciones guardadas por otros usuarios aún. ¡Sé el primero en guardar la tuya!
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem" }}>
              {allPredictions.map(p => {
                const champion = p.predictions?.koWinners?.['F-1'];
                const playedCount = p.predictions?.matches 
                  ? Object.values(p.predictions.matches).filter(res => res !== null).length 
                  : 0;
                
                const totalCount = 72; // 72 matches in 12 groups of 4 (6 matches per group)
                const pct = Math.round((playedCount / totalCount) * 100);
                const isMe = p.id === userId;
                
                return (
                  <div 
                    key={p.id || p.username} 
                    className={`glass-panel community-card ${isMe ? 'is-me-card' : ''}`}
                    style={{ 
                      padding: "1.25rem", 
                      border: isMe ? "1px solid rgba(99, 102, 241, 0.4)" : "1px solid rgba(255,255,255,0.05)",
                      background: isMe ? "linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(139, 92, 246, 0.03) 100%)" : "linear-gradient(135deg, rgba(255, 255, 255, 0.02) 0%, rgba(255, 255, 255, 0.01) 100%)",
                      position: "relative",
                      display: "flex",
                      flexDirection: "column",
                      gap: "1rem",
                      justifyContent: "space-between"
                    }}
                  >
                    {/* User info header */}
                    <div className="flex items-center gap-3">
                      {p.avatar ? (
                        <img 
                          src={p.avatar} 
                          style={{ 
                            width: "72px", 
                            height: "72px", 
                            borderRadius: "50%", 
                            objectFit: "cover", 
                            border: "2px solid rgba(255,255,255,0.15)",
                            boxShadow: "0 0 12px rgba(255,255,255,0.08)",
                            flexShrink: 0 
                          }} 
                        />
                      ) : (
                        <div 
                          style={{ 
                            width: "72px", 
                            height: "72px", 
                            borderRadius: "50%", 
                            background: "rgba(255,255,255,0.05)", 
                            border: "2px solid rgba(255,255,255,0.1)",
                            display: "flex", 
                            alignItems: "center", 
                            justifyContent: "center",
                            flexShrink: 0 
                          }}
                        >
                          <User style={{ width: "32px", height: "32px", color: "var(--text-secondary)" }} />
                        </div>
                      )}
                      <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                        <span className="font-semibold text-white" style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "1.05rem" }}>
                          {p.username} {isMe && <span className="badge" style={{ fontSize: "0.65rem", padding: "2px 6px", background: "rgba(99, 102, 241, 0.25)", borderColor: "var(--primary)", color: "#a5b4fc", border: "1px solid" }}>Tú</span>}
                        </span>
                        <span style={{ fontSize: "0.72rem", color: "var(--text-secondary)" }}>
                          Act: {new Date(p.updated_at).toLocaleDateString()} {new Date(p.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>

                    {/* Stats & prediction info */}
                    <div className="flex flex-col gap-3" style={{ fontSize: "0.82rem", padding: "0.75rem 0", borderTop: "1px solid rgba(255,255,255,0.06)", borderBottom: "1px solid rgba(255,255,255,0.06)", margin: "0.15rem 0" }}>
                      <div className="flex justify-between items-center" style={{ minHeight: "26px" }}>
                        <span style={{ color: "var(--text-secondary)", fontWeight: "500" }}>Fase de Grupos:</span>
                        <span className="font-semibold text-white" style={{ fontSize: "0.85rem" }}>{playedCount} / {totalCount} ({pct}%)</span>
                      </div>
                      <div className="flex justify-between items-center" style={{ minHeight: "26px" }}>
                        <span style={{ color: "var(--text-secondary)", fontWeight: "500" }}>Campeón Predicho:</span>
                        {champion ? (
                          <span className="font-semibold text-amber-400 flex items-center gap-1.5" style={{ fontSize: "0.85rem" }}>
                            <img src={getTeamFlagUrl(champion.flag)} className="flag-img" style={{ border: "1px solid rgba(255,255,255,0.15)", flexShrink: 0 }} />
                            {champion.name}
                          </span>
                        ) : (
                          <span style={{ color: "var(--text-muted)", fontStyle: "italic" }}>Sin definir</span>
                        )}
                      </div>
                      <div className="flex justify-between items-center" style={{ minHeight: "30px" }}>
                        <span style={{ color: "var(--text-secondary)", fontWeight: "500" }}>Método de Cruces:</span>
                        {p.predictions?.isBracketSimulated ? (
                          <span className="badge flex items-center gap-1" style={{ fontSize: "0.68rem", padding: "3px 8px", background: "rgba(99, 102, 241, 0.15)", borderColor: "rgba(99, 102, 241, 0.4)", color: "#a5b4fc", border: "1px solid", borderRadius: "20px" }}>
                            <Zap className="w-3 h-3 text-indigo-300" style={{ flexShrink: 0 }} /> Simulador
                          </span>
                        ) : (
                          <span className="badge flex items-center gap-1" style={{ fontSize: "0.68rem", padding: "3px 8px", background: "rgba(245, 158, 11, 0.15)", borderColor: "rgba(245, 158, 11, 0.4)", color: "#fcd34d", border: "1px solid", borderRadius: "20px" }}>
                            <User className="w-3 h-3 text-amber-300" style={{ flexShrink: 0 }} /> Manual
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action button */}
                    {!isMe ? (
                      <div className="flex gap-2" style={{ marginTop: "0.25rem" }}>
                        <button 
                          onClick={() => {
                            setSelectedCompareUser(p.id);
                            setActiveTab("groups");
                          }}
                          className="btn btn-primary"
                          style={{ 
                            flex: 1, 
                            fontSize: "0.72rem", 
                            padding: "0.35rem 0.5rem", 
                            height: "auto", 
                            whiteSpace: "nowrap",
                            background: selectedCompareUser === p.id ? "linear-gradient(135deg, #10b981, #059669)" : undefined 
                          }}
                        >
                          {selectedCompareUser === p.id ? "Comparando" : "Comparar"}
                        </button>
                        <button 
                          onClick={() => {
                            setViewingUserBracket(p);
                          }}
                          className="btn btn-secondary flex items-center justify-center gap-1"
                          style={{ 
                            flex: 1, 
                            fontSize: "0.72rem", 
                            padding: "0.35rem 0.5rem", 
                            height: "auto",
                            whiteSpace: "nowrap"
                          }}
                        >
                          <Flame className="w-3.5 h-3.5" style={{ flexShrink: 0 }} />
                          <span>Ver Cruces</span>
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2" style={{ marginTop: "0.25rem", width: "100%" }}>
                        <button 
                          onClick={() => {
                            setViewingUserBracket(p);
                          }}
                          className="btn btn-secondary flex items-center justify-center gap-1"
                          style={{ 
                            width: "100%", 
                            fontSize: "0.72rem", 
                            padding: "0.35rem 0.5rem", 
                            height: "auto",
                            whiteSpace: "nowrap"
                          }}
                        >
                          <Flame className="w-3.5 h-3.5" style={{ flexShrink: 0 }} />
                          <span>Ver mis Cruces</span>
                        </button>
                        <div className="text-center text-xs" style={{ color: "var(--text-secondary)", fontStyle: "italic" }}>
                          Tu predicción actual activa
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Alert Banner / Helpful Tips */}
      <footer className="help-footer">
        <Info className="w-5 h-5 text-amber-400" style={{ flexShrink: 0, marginTop: "2px" }} />
        <div>
          <span className="semibold" style={{ color: "#fff" }}>Tip de Pro:</span> Pasa el cursor o mantén presionado sobre cualquier equipo para iluminar su camino en tiempo real. En la pestaña <span style={{ color: "var(--primary)", fontWeight: "600" }}>Cruces (16avos)</span>, elegí a tus ganadores con un clic hasta consagrar al Campeón del Mundo.
        </div>
      </footer>

      {/* Login Username Modal */}
      {showLoginModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 className="modal-title flex items-center gap-2">
              <Trophy className="w-6 h-6 text-yellow-400" /> ¡Bienvenido al Simulador!
            </h2>
            <p className="modal-desc">
              Elegí tu apodo y una foto de perfil para empezar a simular. Tus pronósticos se guardarán bajo esta identidad para que puedas compartirlos.
            </p>
            <form onSubmit={async (e) => {
              e.preventDefault();
              const input = (e.currentTarget.elements.namedItem("usernameInput") as HTMLInputElement).value.trim();
              if (input.length < 3) {
                alert("El nombre debe tener al menos 3 caracteres.");
                return;
              }

              const { data: nameCheck } = await supabase
                .from("predictions")
                .select("id")
                .eq("username", input)
                .maybeSingle();

              if (nameCheck && nameCheck.id !== userId) {
                alert("Este apodo ya está en uso. Elegí otro.");
                return;
              }

              localStorage.setItem("wc_username", input);
              setUsername(input);

              try {
                await supabase
                  .from("predictions")
                  .upsert({
                    id: userId,
                    username: input,
                    avatar: avatar || null,
                    predictions: { matches: {}, manualStandings: {}, gdTweaks: {}, gfTweaks: {}, koWinners: {} },
                    updated_at: new Date().toISOString()
                  });
              } catch (err) {
                console.error("Error creating initial profile:", err);
              }

              setShowLoginModal(false);
              loadPredictions();
            }}>
              {/* Avatar upload inside login */}
              <div className="flex flex-col items-center gap-2" style={{ marginBottom: "1.25rem" }}>
                <div style={{ position: "relative", cursor: "pointer" }} onClick={() => document.getElementById("login-avatar-file-input")?.click()}>
                  {avatar ? (
                    <img 
                      src={avatar} 
                      style={{ 
                        width: "80px", 
                        height: "80px", 
                        borderRadius: "50%", 
                        objectFit: "cover", 
                        border: "2.5px solid var(--primary)",
                        boxShadow: "0 0 12px rgba(99, 102, 241, 0.4)",
                        flexShrink: 0 
                      }} 
                    />
                  ) : (
                    <div 
                      style={{ 
                        width: "80px", 
                        height: "80px", 
                        borderRadius: "50%", 
                        background: "rgba(255,255,255,0.05)", 
                        border: "2px solid rgba(255,255,255,0.1)",
                        display: "flex", 
                        alignItems: "center", 
                        justifyContent: "center",
                        flexShrink: 0 
                      }}
                    >
                      <User style={{ width: "36px", height: "36px", color: "var(--text-secondary)" }} />
                    </div>
                  )}
                  <div className="avatar-edit-badge" style={{ position: "absolute", bottom: 0, right: 0, background: "var(--primary)", borderRadius: "50%", padding: "0.25rem", border: "2px solid #0b0f19" }}>
                    <Camera className="w-3.5 h-3.5 text-white" />
                  </div>
                </div>
                <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Elegir foto de perfil (opcional)</span>
                <input 
                  id="login-avatar-file-input"
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const url = URL.createObjectURL(file);
                      setCropImageSrc(url);
                    }
                  }}
                />
              </div>

              <div style={{ marginBottom: "1.25rem" }}>
                <input 
                  name="usernameInput" 
                  type="text" 
                  placeholder="Ej: JuanGol, Messi10..." 
                  className="modal-input" 
                  required 
                  maxLength={20}
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>
                ¡Empezar a simular!
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {showProfileModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="flex justify-between items-center" style={{ marginBottom: "1rem" }}>
              <h2 className="modal-title flex items-center gap-2" style={{ margin: 0, fontSize: "1.3rem" }}>
                <User className="w-5 h-5 text-primary" /> Editar Perfil
              </h2>
              <button 
                onClick={() => setShowProfileModal(false)} 
                className="btn btn-secondary" 
                style={{ padding: "0.25rem", borderRadius: "50%", width: "28px", height: "28px", display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={async (e) => {
              e.preventDefault();
              const newName = (e.currentTarget.elements.namedItem("profileNameInput") as HTMLInputElement).value.trim();
              if (newName.length < 3) {
                alert("El apodo debe tener al menos 3 caracteres.");
                return;
              }

              // Check if username is taken by another user
              if (newName.toLowerCase() !== username.toLowerCase()) {
                const { data: nameCheck } = await supabase
                  .from("predictions")
                  .select("id")
                  .eq("username", newName)
                  .maybeSingle();

                if (nameCheck && nameCheck.id !== userId) {
                  alert("Este apodo ya está en uso. Elegí otro.");
                  return;
                }
              }

              setUsername(newName);
              localStorage.setItem("wc_username", newName);
              
              try {
                const payload = {
                  matches: Object.keys(matches).reduce((acc, groupId) => {
                    matches[groupId].forEach(m => {
                      acc[m.id] = m.result;
                    });
                    return acc;
                  }, {} as Record<string, "H" | "A" | "D" | null>),
                  manualStandings,
                  gdTweaks,
                  gfTweaks,
                  koWinners: Object.keys(koWinners).reduce((acc, mId) => {
                    acc[mId] = koWinners[mId];
                    return acc;
                  }, {} as Record<string, Team>)
                };

                const { error } = await supabase
                  .from("predictions")
                  .upsert({
                    id: userId,
                    username: newName,
                    avatar: avatar || null,
                    predictions: payload,
                    updated_at: new Date().toISOString()
                  });

                if (error) {
                  alert("Error al actualizar perfil: " + error.message);
                } else {
                  setShowProfileModal(false);
                  loadPredictions();
                }
              } catch (err: any) {
                alert("Error: " + err.message);
              }
            }}>
              {/* Avatar Selector */}
              <div className="flex flex-col items-center gap-2" style={{ marginBottom: "1.25rem" }}>
                <div style={{ position: "relative", cursor: "pointer" }} onClick={() => document.getElementById("avatar-file-input")?.click()}>
                  {avatar ? (
                    <img 
                      src={avatar} 
                      style={{ 
                        width: "80px", 
                        height: "80px", 
                        borderRadius: "50%", 
                        objectFit: "cover", 
                        border: "2.5px solid var(--primary)",
                        boxShadow: "0 0 12px rgba(99, 102, 241, 0.4)",
                        flexShrink: 0 
                      }} 
                    />
                  ) : (
                    <div 
                      style={{ 
                        width: "80px", 
                        height: "80px", 
                        borderRadius: "50%", 
                        background: "rgba(255,255,255,0.05)", 
                        border: "2px solid rgba(255,255,255,0.1)",
                        display: "flex", 
                        alignItems: "center", 
                        justifyContent: "center",
                        flexShrink: 0 
                      }}
                    >
                      <User style={{ width: "36px", height: "36px", color: "var(--text-secondary)" }} />
                    </div>
                  )}
                  <div className="avatar-edit-badge" style={{ position: "absolute", bottom: 0, right: 0, background: "var(--primary)", borderRadius: "50%", padding: "0.25rem", border: "2px solid #0b0f19" }}>
                    <Camera className="w-3.5 h-3.5 text-white" />
                  </div>
                </div>
                <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Hacé clic para cambiar la foto</span>
                <input 
                  id="avatar-file-input"
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const url = URL.createObjectURL(file);
                      setCropImageSrc(url);
                    }
                  }}
                />
              </div>

              {/* Username Input */}
              <div style={{ marginBottom: "1.25rem" }}>
                <label style={{ display: "block", fontSize: "0.75rem", color: "var(--text-secondary)", marginBottom: "0.5rem" }}>Tu apodo</label>
                <input 
                  name="profileNameInput" 
                  type="text" 
                  defaultValue={username}
                  placeholder="Ej: JuanGol, Messi10..." 
                  className="modal-input" 
                  required 
                  maxLength={20}
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>
                Guardar Cambios
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Analista FIFA commentary banner */}
      {simulationComment && (
        <div className="analista-banner">
          <span className="analista-banner-icon">
            {simulationComment.type === "warning" ? "⚠️" : simulationComment.type === "success" ? "✅" : "💡"}
          </span>
          <div className="analista-banner-body">
            <h4 className="analista-banner-title" style={{ color: simulationComment.type === "warning" ? "var(--warning)" : simulationComment.type === "success" ? "var(--success)" : "var(--primary)" }}>
              El Analista FIFA
            </h4>
            <p className="analista-banner-desc">
              {simulationComment.text}
            </p>
          </div>
          <button 
            onClick={() => setSimulationComment(null)} 
            className="analista-banner-close"
            title="Cerrar"
          >
            &times;
          </button>
        </div>
      )}
      {/* Steam-like Crop Modal */}
      {cropImageSrc && (
        <div className="modal-overlay" style={{ zIndex: 1100 }}>
          <div className="modal-content" style={{ maxWidth: "320px", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <h3 className="modal-title flex items-center gap-2" style={{ fontSize: "1.1rem", marginBottom: "0.5rem" }}>
              <Camera className="w-5 h-5 text-primary" /> Ajustar Avatar
            </h3>
            <p className="modal-desc" style={{ textAlign: "center", marginBottom: "1rem" }}>
              Arrastrá para centrar y deslizá para hacer zoom en tu foto.
            </p>
            
            {/* Viewport Box (200x200) */}
            <div 
              style={{
                width: "200px",
                height: "200px",
                overflow: "hidden",
                position: "relative",
                borderRadius: "50%",
                border: "2px dashed var(--primary)",
                background: "#0b0f19",
                cursor: "move",
                userSelect: "none",
                touchAction: "none"
              }}
              onMouseDown={(e) => handleDragStart(e.clientX, e.clientY)}
              onMouseMove={(e) => handleDragMove(e.clientX, e.clientY)}
              onMouseUp={handleDragEnd}
              onMouseLeave={handleDragEnd}
              onTouchStart={(e) => {
                const touch = e.touches[0];
                handleDragStart(touch.clientX, touch.clientY);
              }}
              onTouchMove={(e) => {
                const touch = e.touches[0];
                handleDragMove(touch.clientX, touch.clientY);
              }}
              onTouchEnd={handleDragEnd}
            >
              {/* Image inside viewport */}
              <img
                ref={imageRef}
                src={cropImageSrc}
                alt="Para recortar"
                onLoad={handleCropperImageLoad}
                style={{
                  position: "absolute",
                  left: `${(200 - baseSize.width) / 2}px`,
                  top: `${(200 - baseSize.height) / 2}px`,
                  width: `${baseSize.width}px`,
                  height: `${baseSize.height}px`,
                  transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                  transformOrigin: "center center",
                  pointerEvents: "none",
                  maxWidth: "none"
                }}
              />
            </div>
            
            {/* Zoom Slider */}
            <div className="flex flex-col w-full gap-1" style={{ marginTop: "1.25rem", marginBottom: "1.25rem" }}>
              <div className="flex justify-between text-xs" style={{ color: "var(--text-secondary)" }}>
                <span>Zoom</span>
                <span>{Math.round(zoom * 100)}%</span>
              </div>
              <input
                type="range"
                min="1"
                max="3"
                step="0.01"
                value={zoom}
                onChange={(e) => {
                  const newZoom = parseFloat(e.target.value);
                  const imgWidth = baseSize.width * newZoom;
                  const imgHeight = baseSize.height * newZoom;
                  const limitX = Math.max(0, (imgWidth - 200) / 2);
                  const limitY = Math.max(0, (imgHeight - 200) / 2);
                  
                  setZoom(newZoom);
                  setPan(prev => ({
                    x: Math.min(Math.max(prev.x, -limitX), limitX),
                    y: Math.min(Math.max(prev.y, -limitY), limitY)
                  }));
                }}
                style={{
                  width: "100%",
                  accentColor: "var(--primary)"
                }}
              />
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-2 w-full">
              <button 
                type="button" 
                onClick={() => setCropImageSrc(null)} 
                className="btn btn-secondary" 
                style={{ flex: 1 }}
              >
                Cancelar
              </button>
              <button 
                type="button" 
                onClick={handleCropSave} 
                className="btn btn-primary" 
                style={{ flex: 1 }}
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pop-up view for another user's knockout prediction bracket */}
      {viewingUserBracket && (
        <div className="modal-overlay" style={{ zIndex: 1100 }}>
          <div className="modal-content" style={{ maxWidth: "1000px", width: "95vw", maxHeight: "90vh", overflowY: "auto", padding: "1.5rem" }}>
            {/* Header */}
            <div className="flex justify-between items-center" style={{ marginBottom: "1.5rem", borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "1.0rem" }}>
              <div className="flex items-center gap-3">
                {viewingUserBracket.avatar ? (
                  <img 
                    src={viewingUserBracket.avatar} 
                    style={{ 
                      width: "48px", 
                      height: "48px", 
                      borderRadius: "50%", 
                      objectFit: "cover", 
                      border: "2px solid var(--primary)",
                      boxShadow: "0 0 10px rgba(99, 102, 241, 0.3)",
                      flexShrink: 0 
                    }} 
                  />
                ) : (
                  <div 
                    style={{ 
                      width: "48px", 
                      height: "48px", 
                      borderRadius: "50%", 
                      background: "rgba(255,255,255,0.05)", 
                      border: "2px solid rgba(255,255,255,0.1)",
                      display: "flex", 
                      alignItems: "center", 
                      justifyContent: "center",
                      flexShrink: 0 
                    }}
                  >
                    <User style={{ width: "24px", height: "24px", color: "var(--text-secondary)" }} />
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="modal-title" style={{ margin: 0, fontSize: "1.3rem", fontWeight: "800" }}>
                      Duelos de {viewingUserBracket.username}
                    </h2>
                    {viewingUserBracket.predictions?.isBracketSimulated ? (
                      <span className="badge flex items-center gap-1" style={{ fontSize: "0.65rem", padding: "2px 8px", background: "rgba(99, 102, 241, 0.15)", borderColor: "rgba(99, 102, 241, 0.4)", color: "#a5b4fc", border: "1px solid" }}>
                        <Zap className="w-3 h-3" style={{ flexShrink: 0 }} /> Simulador
                      </span>
                    ) : (
                      <span className="badge flex items-center gap-1" style={{ fontSize: "0.65rem", padding: "2px 8px", background: "rgba(245, 158, 11, 0.15)", borderColor: "rgba(245, 158, 11, 0.4)", color: "#fcd34d", border: "1px solid" }}>
                        <User className="w-3 h-3" style={{ flexShrink: 0 }} /> Manual
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                    Predicción guardada el {new Date(viewingUserBracket.updated_at).toLocaleDateString()} a las {new Date(viewingUserBracket.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setViewingUserBracket(null)} 
                className="btn btn-secondary flex items-center justify-center" 
                style={{ padding: 0, borderRadius: "50%", width: "32px", height: "32px" }}
                title="Cerrar modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Read-Only Bracket View */}
            <BracketView
              groups={GROUPS}
              allMatches={viewingUserBracketMatches}
              manualStandings={viewingUserBracket.predictions?.manualStandings || {}}
              gdTweaks={viewingUserBracket.predictions?.gdTweaks || {}}
              gfTweaks={viewingUserBracket.predictions?.gfTweaks || {}}
              hoveredTeam={hoveredTeam}
              setHoveredTeam={setHoveredTeam}
              koWinners={viewingUserBracket.predictions?.koWinners || {}}
              onSelectKoWinner={() => {}} // Read-only, no-op
              readOnly={true}
            />
          </div>
        </div>
      )}
    </main>
  );
}

// Native HTML5 Canvas compression utility to resize and crop avatars to a 120x120 JPEG
const compressImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_SIZE = 120;
        let width = img.width;
        let height = img.height;

        const size = Math.min(width, height);
        const sourceX = (width - size) / 2;
        const sourceY = (height - size) / 2;

        canvas.width = MAX_SIZE;
        canvas.height = MAX_SIZE;
        
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, sourceX, sourceY, size, size, 0, 0, MAX_SIZE, MAX_SIZE);
          const compressed = canvas.toDataURL("image/jpeg", 0.7);
          resolve(compressed);
        } else {
          reject(new Error("No se pudo obtener el contexto de dibujo"));
        }
      };
      img.onerror = () => reject(new Error("Error al cargar la imagen"));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error("Error al leer el archivo"));
    reader.readAsDataURL(file);
  });
};
