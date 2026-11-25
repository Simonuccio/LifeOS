import React, { useState, useEffect } from 'react';
import {
  Plus, Check, Trash2, X, Flame, Activity,
  Droplets, Dumbbell, ArrowUp, ArrowDown, ClipboardList
} from 'lucide-react';

// ==========================================
// UTILITY CONDIVISE: LOCALSTORAGE & TEMA PASTELLO
// ==========================================
export const loadLocal = (key, fallback) => {
  try {
    const raw = localStorage.getItem(`lifeos_${key}`);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

export const saveLocal = (key, val) => {
  try {
    localStorage.setItem(`lifeos_${key}`, JSON.stringify(val));
  } catch {}
};

export function useLocalState(key, fallback) {
  const [state, setState] = useState(() => loadLocal(key, fallback));
  useEffect(() => {
    saveLocal(key, state);
  }, [key, state]);
  return [state, setState];
}

export const getTheme = (darkMode) => ({
  cardMain: darkMode ? 'bg-[#1E1E24] text-zinc-100 border-white/5' : 'bg-white text-[#18181D] border-black/5',
  cardSub: darkMode ? 'bg-zinc-900 text-zinc-100' : 'bg-[#F7F5F0] text-[#18181D]',
  pillSurface: darkMode ? 'bg-zinc-800 text-zinc-100' : 'bg-white text-[#18181D]',
  pastelPeach: darkMode ? 'bg-[#7C2D12]/35 text-orange-100 border-orange-400/20' : 'bg-[#FFEDD5]/90 text-[#9A3412] border-orange-200',
  pastelMint: darkMode ? 'bg-[#064E3B]/40 text-emerald-100 border-emerald-400/20' : 'bg-[#DCFCE7]/90 text-[#065F46] border-emerald-200',
  pastelLavender: darkMode ? 'bg-[#4C1D95]/35 text-purple-100 border-purple-400/20' : 'bg-[#F3E8FF]/90 text-[#5B21B6] border-purple-200',
  pastelBlue: darkMode ? 'bg-[#0C4A6E]/40 text-sky-100 border-sky-400/20' : 'bg-[#E0F2FE]/90 text-[#075985] border-sky-200',
  pastelRose: darkMode ? 'bg-[#831843]/35 text-pink-100 border-pink-400/20' : 'bg-[#FCE7F3]/90 text-[#9D174D] border-pink-200'
});

// Estrae l'elenco di tutti i muscoli principali di un esercizio (supporta selezione multipla)
export const parsePrimaryMuscles = (ex) => {
  if (!ex) return [];
  if (Array.isArray(ex.primary_muscles) && ex.primary_muscles.length > 0) return ex.primary_muscles;
  if (typeof ex.muscle_group === 'string' && ex.muscle_group.trim()) {
    return ex.muscle_group.split(',').map((s) => s.trim()).filter(Boolean);
  }
  return ['Petto'];
};

// ==========================================
// ANIMAZIONE CORIANDOLI PASTELLO
// ==========================================
export function PastelConfetti({ active }) {
  if (!active) return null;
  const colors = ['#6EE7B7', '#FDBA74', '#C4B5FD', '#7DD3FC', '#F9A8D4', '#FDE047'];

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {Array.from({ length: 36 }, (_, i) => {
        const size = 7 + (i % 5) * 2;
        return (
          <span
            key={i}
            style={{
              left: `${(i * 97) % 100}%`,
              width: `${size}px`,
              height: `${size * 1.4}px`,
              backgroundColor: colors[i % colors.length],
              animationDelay: `${(i % 7) * 0.06}s`,
              animationDuration: `${1.4 + (i % 5) * 0.25}s`
            }}
            className="absolute -top-4 rounded-full opacity-90 animate-confetti"
          />
        );
      })}
    </div>
  );
}

// ==========================================
// WIDGET BICCHIERI D'ACQUA INTERATTIVO
// ==========================================
export function WaterGlassesWidget({ waterMl, targetMl = 2500, onChangeWater, darkMode }) {
  const { pastelBlue } = getTheme(darkMode);
  const glassSize = 250;
  const totalGlasses = Math.max(8, Math.round(targetMl / glassSize));
  const filledGlasses = Math.floor((Number(waterMl) || 0) / glassSize);
  const pct = Math.min(100, Math.round(((Number(waterMl) || 0) / targetMl) * 100));

  return (
    <div className={`${pastelBlue} border rounded-[30px] p-5 space-y-3.5 transition-all`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className={`w-9 h-9 rounded-2xl flex items-center justify-center ${darkMode ? 'bg-sky-400/20 text-sky-300' : 'bg-white text-sky-500 shadow-2xs'}`}>
            <Droplets className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold leading-none">Idratazione Giornaliera</h3>
            <p className="text-[11px] mt-1 opacity-75">Tocca un bicchiere per riempirlo (250 ml)</p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-lg font-bold">{waterMl}</span>
          <span className="text-xs opacity-75"> / {targetMl} ml ({pct}%)</span>
        </div>
      </div>

      <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 pt-1">
        {Array.from({ length: totalGlasses }, (_, idx) => {
          const isFilled = idx < filledGlasses;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => onChangeWater((idx + 1 === filledGlasses ? idx : idx + 1) * glassSize)}
              className={`group relative h-12 rounded-2xl border flex flex-col items-center justify-end p-1.5 overflow-hidden cursor-pointer spring-btn ${
                isFilled
                  ? darkMode ? 'border-sky-400/60 bg-sky-950/60' : 'border-sky-400 bg-white shadow-2xs'
                  : darkMode ? 'border-sky-300/15 bg-black/20 opacity-60' : 'border-sky-300/50 bg-white/50 opacity-70'
              }`}
            >
              <div
                style={{ height: isFilled ? '82%' : '0%' }}
                className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#38BDF8] to-[#7DD3FC] transition-all duration-500 rounded-b-xl"
              />
              <span className={`relative z-10 text-[10px] font-bold ${isFilled ? 'text-[#075985]' : 'opacity-60'}`}>
                {idx + 1}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ==========================================
// DIAGRAMMA CARTESIANO COSTANZA SINGOLA ABITUDINE (SEZIONE ROUTINE)
// ==========================================
export function HabitCartesianChart({ habits, habitLogs, selectedDate, darkMode }) {
  const { cardSub, pillSurface, pastelMint, pastelLavender } = getTheme(darkMode);
  const [selectedHabitId, setSelectedHabitId] = useState(habits[0]?.id || '');

  useEffect(() => {
    if (!habits.some((h) => h.id === selectedHabitId) && habits[0]) {
      setSelectedHabitId(habits[0].id);
    }
  }, [habits, selectedHabitId]);

  const activeHabit = habits.find((h) => h.id === selectedHabitId) || habits[0];
  if (!activeHabit) return null;

  const addDaysHelper = (dateStr, days) => {
    const [y, m, d] = dateStr.split('-').map(Number);
    const dt = new Date(y, m - 1, d);
    dt.setDate(dt.getDate() + days);
    return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
  };

  const getIsoDay = (dateStr) => {
    const [y, m, d] = dateStr.split('-').map(Number);
    const day = new Date(y, m - 1, d).getDay();
    return day === 0 ? 7 : day;
  };

  // Costruisce i 14 punti (X = giorno, Y = % di costanza cumulativa / progresso giornaliero da 0 a 100%)
  const freq = activeHabit.frequency_days || [1, 2, 3, 4, 5, 6, 7];
  let runningScheduled = 0;
  let runningCompleted = 0;

  const points = Array.from({ length: 14 }, (_, idx) => {
    const d = addDaysHelper(selectedDate, -(13 - idx));
    const iso = getIsoDay(d);
    const isScheduled = freq.includes(iso);
    const log = habitLogs.find((l) => l.habit_id === activeHabit.id && l.log_date === d);
    const isDone = Boolean(log && log.completed);

    if (isScheduled) {
      runningScheduled += 1;
      if (isDone) runningCompleted += 1;
    }

    // Se è numerica (es. Acqua) mostra la % reale del target raggiunto quel giorno o la curva di costanza
    const dailyPct = activeHabit.habit_type === 'numeric'
      ? Math.min(100, Math.round(((Number(log?.current_value) || 0) / (Number(activeHabit.target_value) || 1)) * 100))
      : runningScheduled > 0
      ? Math.round((runningCompleted / runningScheduled) * 100)
      : isDone ? 100 : 0;

    return {
      date: d.slice(8) + '/' + d.slice(5, 7),
      yVal: dailyPct,
      isDone,
      isScheduled
    };
  });

  const latestY = points[points.length - 1]?.yVal || 0;

  return (
    <div className={`${cardSub} p-5 rounded-3xl space-y-4 text-xs`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <span className="font-bold text-zinc-500 block">
            Diagramma Cartesiano • Costanza per Singola Abitudine (14 giorni)
          </span>
          <p className="text-[11px] text-zinc-400">
            Asse X: Giorni • Asse Y: {activeHabit.habit_type === 'numeric' ? '% Obiettivo giornaliero raggiunto' : '% Costanza cumulativa'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={activeHabit.id}
            onChange={(e) => setSelectedHabitId(e.target.value)}
            className={`${pillSurface} px-3.5 py-2 rounded-full font-bold text-xs outline-none shadow-2xs`}
          >
            {habits.map((h) => (
              <option key={h.id} value={h.id}>{h.name}</option>
            ))}
          </select>
          <span className={`px-3 py-1.5 rounded-full font-bold border ${latestY >= 75 ? pastelMint : pastelLavender}`}>
            {latestY}%
          </span>
        </div>
      </div>

      {/* Piano Cartesiano SVG con Assi X / Y e Griglia */}
      <div className={`${pillSurface} p-4 rounded-2xl`}>
        <svg viewBox="0 0 520 190" className="w-full h-44 overflow-visible">
          {/* Griglia Cartesiana Orizzontale e Valori Asse Y (0%, 25%, 50%, 75%, 100%) */}
          {[0, 25, 50, 75, 100].map((yTick) => {
            const yPos = 150 - (yTick / 100) * 125;
            return (
              <g key={yTick}>
                <line
                  x1="38"
                  y1={yPos}
                  x2="500"
                  y2={yPos}
                  stroke={darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)'}
                  strokeDasharray={yTick === 0 ? 'none' : '3 3'}
                  strokeWidth={yTick === 0 ? '1.5' : '1'}
                />
                <text x="32" y={yPos + 3} textAnchor="end" fill="#888" fontSize="9" fontWeight="bold">
                  {yTick}%
                </text>
              </g>
            );
          })}

          {/* Asse Y Verticale */}
          <line
            x1="38"
            y1="18"
            x2="38"
            y2="150"
            stroke={darkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'}
            strokeWidth="1.5"
          />

          {(() => {
            const coords = points.map((pt, idx) => {
              const x = 48 + (idx / (points.length - 1)) * 442;
              const y = 150 - (pt.yVal / 100) * 125;
              return { x, y, ...pt };
            });

            const linePoints = coords.map((c) => `${c.x},${c.y}`).join(' ');
            const areaPoints = `48,150 ${linePoints} ${coords[coords.length - 1].x},150`;

            return (
              <>
                <defs>
                  <linearGradient id="cartesianAreaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.32" />
                    <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Area Sottesa alla Curva Cartesiana */}
                <polygon points={areaPoints} fill="url(#cartesianAreaGrad)" />

                {/* Griglia Verticale Leggera per ogni punto X */}
                {coords.map((c, idx) => (
                  <line
                    key={`v-${idx}`}
                    x1={c.x}
                    y1="25"
                    x2={c.x}
                    y2="150"
                    stroke={darkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'}
                    strokeWidth="1"
                  />
                ))}

                {/* Curva Cartesiana */}
                <polyline
                  fill="none"
                  stroke="#8B5CF6"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={linePoints}
                />

                {/* Punti (x, y) ed Etichette Asse X */}
                {coords.map((c, idx) => (
                  <g key={idx}>
                    <circle
                      cx={c.x}
                      cy={c.y}
                      r={c.isDone ? '4.5' : '3.5'}
                      fill={c.isDone ? '#10B981' : '#8B5CF6'}
                      stroke={darkMode ? '#18181D' : '#FFFFFF'}
                      strokeWidth="1.5"
                    />
                    {(idx % 2 === 0 || idx === coords.length - 1) && (
                      <text x={c.x} y={c.y - 8} textAnchor="middle" fill={c.isDone ? '#10B981' : '#8B5CF6'} fontSize="8.5" fontWeight="bold">
                        {c.yVal}%
                      </text>
                    )}
                    <text x={c.x} y="168" textAnchor="middle" fill="#888" fontSize="8.5">
                      {c.date.slice(0, 2)}
                    </text>
                  </g>
                ))}
              </>
            );
          })()}
        </svg>
      </div>
    </div>
  );
}

// ==========================================
// 1. MAPPA DI CALORE ANATOMICA DEL CORPO (FRONTE & RETRO)
// ==========================================
export function MuscleHeatmap({ exercises, allWorkoutSets, workouts, selectedDate, darkMode }) {
  const [selectedMuscleDetail, setSelectedMuscleDetail] = useState(null);

  const anatomicalZones = [
    { id: 'Petto', label: 'Petto', aliases: ['petto'] },
    { id: 'Spalle', label: 'Spalle / Deltoidi', aliases: ['spalle', 'deltoidi'] },
    { id: 'Bicipiti', label: 'Bicipiti', aliases: ['bicipiti', 'braccia'] },
    { id: 'Tricipiti', label: 'Tricipiti', aliases: ['tricipiti', 'braccia'] },
    { id: 'Core', label: 'Addome & Core', aliases: ['core', 'addome'] },
    { id: 'Quadricipiti', label: 'Quadricipiti', aliases: ['quadricipiti', 'gambe'] },
    { id: 'Dorso', label: 'Dorso & Trapezio', aliases: ['dorso', 'schiena', 'trapezio'] },
    { id: 'Glutei', label: 'Glutei', aliases: ['glutei', 'gambe'] },
    { id: 'Femorali', label: 'Femorali', aliases: ['femorali', 'gambe'] },
    { id: 'Polpacci', label: 'Polpacci', aliases: ['polpacci'] }
  ];

  // Calcola giorno per giorno lo stato di freschezza/stanchezza di ogni fascio muscolare
  const computeZoneState = (zone) => {
    const [y, m, d] = selectedDate.split('-').map(Number);
    const refDate = new Date(y, m - 1, d);

    let fatigueScore = 0; // >= 1.5 -> Rosso (Stanco/Primario), >= 0.5 -> Giallo (In recupero/Secondario), < 0.5 -> Grigio/Fresco
    let weeklySets = 0;
    let lastDaysAgo = 99;

    workouts.forEach((w) => {
      if (!w.completed) return;
      const [wy, wm, wd] = w.workout_date.split('-').map(Number);
      const diffDays = Math.round((refDate - new Date(wy, wm - 1, wd)) / 86400000);

      if (diffDays >= 0 && diffDays <= 7) {
        allWorkoutSets
          .filter((s) => s.workout_id === w.id && s.completed && s.set_type !== 'warmup')
          .forEach((s) => {
            const ex = exercises.find((e) => e.id === s.exercise_id);
            if (!ex) return;

            const primList = parsePrimaryMuscles(ex).map((x) => x.toLowerCase());
            const secList = (ex.secondary_muscles || []).map((x) => x.toLowerCase());

            const isPrimary = zone.aliases.some((al) => primList.some((pm) => pm.includes(al)));
            const isSecondary = !isPrimary && zone.aliases.some((al) => secList.some((sm) => sm.includes(al)));

            if (isPrimary || isSecondary) {
              const weight = isPrimary ? 1 : 0.5;
              weeklySets += weight;
              if (diffDays < lastDaysAgo) lastDaysAgo = diffDays;

              // Stanchezza del giorno selezionato (oggi = pieno carico, ieri = metà carico, 2 giorni fa = residuo)
              if (diffDays === 0) fatigueScore += isPrimary ? 1.6 : 0.75;
              else if (diffDays === 1) fatigueScore += isPrimary ? 0.85 : 0.4;
              else if (diffDays === 2) fatigueScore += isPrimary ? 0.35 : 0.15;
            }
          });
      }
    });

    weeklySets = Math.round(weeklySets * 10) / 10;
    const freshnessPct = Math.max(15, Math.min(100, Math.round(100 - fatigueScore * 22)));

    // Colori identici alla tua immagine di riferimento: Rosso (#EF4444), Giallo (#FACC15), Grigio Scuro (#3F3F46)
    let fillColor = '#3F3F46';
    let stateLabel = 'Fresco (100% Riposato)';
    let pillCls = 'bg-zinc-800 text-zinc-300';

    if (fatigueScore >= 1.5) {
      fillColor = '#EF4444'; // Rosso: Muscolo Primario / Affaticato Oggi
      stateLabel = `Stanco / Primario (${freshnessPct}% Freschezza)`;
      pillCls = 'bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/40';
    } else if (fatigueScore >= 0.45) {
      fillColor = '#FACC15'; // Giallo: Muscolo Secondario / In Recupero
      stateLabel = `In Recupero / Secondario (${freshnessPct}% Freschezza)`;
      pillCls = 'bg-[#FACC15]/20 text-[#FACC15] border border-[#FACC15]/40';
    }

    return { ...zone, weeklySets, lastDaysAgo, freshnessPct, fillColor, stateLabel, pillCls };
  };

  const zoneMap = {};
  anatomicalZones.forEach((z) => {
    zoneMap[z.id] = computeZoneState(z);
  });

  const activeDetail = selectedMuscleDetail ? zoneMap[selectedMuscleDetail] : null;

  return (
    <div className="bg-[#141418] text-white rounded-[36px] p-6 shadow-2xl border border-white/10 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <span className="text-xs text-zinc-400 font-medium">Stato Muscolare del Giorno ({selectedDate})</span>
          <h3 className="text-lg font-bold">Mappa Anatomica Freschezza & Fatica</h3>
        </div>
        <span className="px-3 py-1 rounded-full bg-zinc-800 text-zinc-300 text-[11px] font-semibold">
          Tocca un muscolo sul corpo
        </span>
      </div>

      {/* SAGOMA ANATOMICA FRONTE & RETRO IN STILE DARK PRO */}
      <div className="bg-[#0E0E11] rounded-[28px] p-4 border border-white/5">
        <svg viewBox="0 0 420 350" className="w-full max-w-[440px] mx-auto h-80 select-none">
          {/* Etichette Fronte / Retro */}
          <text x="105" y="16" textAnchor="middle" fill="#71717A" fontSize="10" fontWeight="bold" letterSpacing="1">
            FRONTE
          </text>
          <text x="315" y="16" textAnchor="middle" fill="#71717A" fontSize="10" fontWeight="bold" letterSpacing="1">
            RETRO
          </text>

          {/* ================= SAGOMA ANTERIORE (SINISTRA, Centro X=105) ================= */}
          <g className="cursor-pointer">
            {/* Testa e Collo */}
            <ellipse cx="105" cy="40" rx="14" ry="17" fill="#1F1F26" stroke="#71717A" strokeWidth="1.3" />
            <path d="M 98 56 L 112 56 L 115 68 L 95 68 Z" fill="#1F1F26" stroke="#71717A" strokeWidth="1.2" />

            {/* Trapezio Anteriore */}
            <polygon
              onClick={() => setSelectedMuscleDetail('Dorso')}
              points="95,68 80,75 92,77"
              fill={zoneMap.Dorso.fillColor}
              stroke="#18181D"
              strokeWidth="1.2"
            />
            <polygon
              onClick={() => setSelectedMuscleDetail('Dorso')}
              points="115,68 130,75 118,77"
              fill={zoneMap.Dorso.fillColor}
              stroke="#18181D"
              strokeWidth="1.2"
            />

            {/* Spalle / Deltoidi Anteriori */}
            <path
              onClick={() => setSelectedMuscleDetail('Spalle')}
              d="M 80 75 Q 63 79 61 97 L 77 101 L 83 82 Z"
              fill={zoneMap.Spalle.fillColor}
              stroke="#18181D"
              strokeWidth="1.4"
            />
            <path
              onClick={() => setSelectedMuscleDetail('Spalle')}
              d="M 130 75 Q 147 79 149 97 L 133 101 L 127 82 Z"
              fill={zoneMap.Spalle.fillColor}
              stroke="#18181D"
              strokeWidth="1.4"
            />

            {/* Petto / Pettorali Sinistro e Destro */}
            <path
              onClick={() => setSelectedMuscleDetail('Petto')}
              d="M 83 77 L 104 77 L 104 106 Q 87 109 79 97 Z"
              fill={zoneMap.Petto.fillColor}
              stroke="#18181D"
              strokeWidth="1.4"
            />
            <path
              onClick={() => setSelectedMuscleDetail('Petto')}
              d="M 127 77 L 106 77 L 106 106 Q 123 109 131 97 Z"
              fill={zoneMap.Petto.fillColor}
              stroke="#18181D"
              strokeWidth="1.4"
            />

            {/* Bicipiti */}
            <path
              onClick={() => setSelectedMuscleDetail('Bicipiti')}
              d="M 61 99 L 76 102 L 71 132 L 55 128 Z"
              fill={zoneMap.Bicipiti.fillColor}
              stroke="#18181D"
              strokeWidth="1.4"
            />
            <path
              onClick={() => setSelectedMuscleDetail('Bicipiti')}
              d="M 149 99 L 134 102 L 139 132 L 155 128 Z"
              fill={zoneMap.Bicipiti.fillColor}
              stroke="#18181D"
              strokeWidth="1.4"
            />

            {/* Avambracci Anteriori */}
            <path
              onClick={() => setSelectedMuscleDetail('Bicipiti')}
              d="M 54 130 L 70 134 L 61 167 L 47 162 Z"
              fill={zoneMap.Bicipiti.fillColor}
              opacity="0.85"
              stroke="#18181D"
              strokeWidth="1.3"
            />
            <path
              onClick={() => setSelectedMuscleDetail('Bicipiti')}
              d="M 156 130 L 140 134 L 149 167 L 163 162 Z"
              fill={zoneMap.Bicipiti.fillColor}
              opacity="0.85"
              stroke="#18181D"
              strokeWidth="1.3"
            />

            {/* Addome & Core (6-Pack + Obliqui) */}
            <path
              onClick={() => setSelectedMuscleDetail('Core')}
              d="M 88 108 L 104 108 L 104 162 L 91 160 Z"
              fill={zoneMap.Core.fillColor}
              stroke="#18181D"
              strokeWidth="1.4"
            />
            <path
              onClick={() => setSelectedMuscleDetail('Core')}
              d="M 122 108 L 106 108 L 106 162 L 119 160 Z"
              fill={zoneMap.Core.fillColor}
              stroke="#18181D"
              strokeWidth="1.4"
            />
            {/* Obliqui */}
            <path
              onClick={() => setSelectedMuscleDetail('Core')}
              d="M 80 104 L 87 109 L 89 158 L 82 152 Z"
              fill={zoneMap.Core.fillColor}
              opacity="0.8"
              stroke="#18181D"
              strokeWidth="1.2"
            />
            <path
              onClick={() => setSelectedMuscleDetail('Core')}
              d="M 130 104 L 123 109 L 121 158 L 128 152 Z"
              fill={zoneMap.Core.fillColor}
              opacity="0.8"
              stroke="#18181D"
              strokeWidth="1.2"
            />

            {/* Quadricipiti (Vasto Esterno e Interno) */}
            <path
              onClick={() => setSelectedMuscleDetail('Quadricipiti')}
              d="M 82 164 L 102 166 L 98 242 L 79 238 Q 74 200 82 164 Z"
              fill={zoneMap.Quadricipiti.fillColor}
              stroke="#18181D"
              strokeWidth="1.5"
            />
            <path
              onClick={() => setSelectedMuscleDetail('Quadricipiti')}
              d="M 128 164 L 108 166 L 112 242 L 131 238 Q 136 200 128 164 Z"
              fill={zoneMap.Quadricipiti.fillColor}
              stroke="#18181D"
              strokeWidth="1.5"
            />

            {/* Polpacci / Tibiali Anteriori */}
            <path
              onClick={() => setSelectedMuscleDetail('Polpacci')}
              d="M 80 248 L 96 248 L 93 316 L 82 316 Q 76 280 80 248 Z"
              fill={zoneMap.Polpacci.fillColor}
              stroke="#18181D"
              strokeWidth="1.3"
            />
            <path
              onClick={() => setSelectedMuscleDetail('Polpacci')}
              d="M 130 248 L 114 248 L 117 316 L 128 316 Q 134 280 130 248 Z"
              fill={zoneMap.Polpacci.fillColor}
              stroke="#18181D"
              strokeWidth="1.3"
            />
          </g>

          {/* ================= SAGOMA POSTERIORE (DESTRA, Centro X=315) ================= */}
          <g className="cursor-pointer">
            {/* Testa e Collo */}
            <ellipse cx="315" cy="40" rx="14" ry="17" fill="#1F1F26" stroke="#71717A" strokeWidth="1.3" />
            <path d="M 308 56 L 322 56 L 325 68 L 305 68 Z" fill="#1F1F26" stroke="#71717A" strokeWidth="1.2" />

            {/* Deltoidi Posteriori */}
            <path
              onClick={() => setSelectedMuscleDetail('Spalle')}
              d="M 290 75 Q 273 79 271 97 L 287 101 L 293 82 Z"
              fill={zoneMap.Spalle.fillColor}
              stroke="#18181D"
              strokeWidth="1.4"
            />
            <path
              onClick={() => setSelectedMuscleDetail('Spalle')}
              d="M 340 75 Q 357 79 359 97 L 343 101 L 337 82 Z"
              fill={zoneMap.Spalle.fillColor}
              stroke="#18181D"
              strokeWidth="1.4"
            />

            {/* Trapezio e Centro Schiena */}
            <polygon
              onClick={() => setSelectedMuscleDetail('Dorso')}
              points="315,66 292,76 315,118 338,76"
              fill={zoneMap.Dorso.fillColor}
              stroke="#18181D"
              strokeWidth="1.4"
            />

            {/* Gran Dorsale (Lats) Sinistro e Destro */}
            <path
              onClick={() => setSelectedMuscleDetail('Dorso')}
              d="M 291 84 L 314 118 L 314 152 L 293 144 Q 285 115 291 84 Z"
              fill={zoneMap.Dorso.fillColor}
              stroke="#18181D"
              strokeWidth="1.4"
            />
            <path
              onClick={() => setSelectedMuscleDetail('Dorso')}
              d="M 339 84 L 316 118 L 316 152 L 337 144 Q 345 115 339 84 Z"
              fill={zoneMap.Dorso.fillColor}
              stroke="#18181D"
              strokeWidth="1.4"
            />

            {/* Tricipiti */}
            <path
              onClick={() => setSelectedMuscleDetail('Tricipiti')}
              d="M 271 99 L 286 102 L 281 132 L 265 128 Z"
              fill={zoneMap.Tricipiti.fillColor}
              stroke="#18181D"
              strokeWidth="1.4"
            />
            <path
              onClick={() => setSelectedMuscleDetail('Tricipiti')}
              d="M 359 99 L 344 102 L 349 132 L 365 128 Z"
              fill={zoneMap.Tricipiti.fillColor}
              stroke="#18181D"
              strokeWidth="1.4"
            />

            {/* Avambracci Posteriori */}
            <path
              onClick={() => setSelectedMuscleDetail('Tricipiti')}
              d="M 264 130 L 280 134 L 271 167 L 257 162 Z"
              fill={zoneMap.Tricipiti.fillColor}
              opacity="0.8"
              stroke="#18181D"
              strokeWidth="1.3"
            />
            <path
              onClick={() => setSelectedMuscleDetail('Tricipiti')}
              d="M 366 130 L 350 134 L 359 167 L 373 162 Z"
              fill={zoneMap.Tricipiti.fillColor}
              opacity="0.8"
              stroke="#18181D"
              strokeWidth="1.3"
            />

            {/* Glutei */}
            <path
              onClick={() => setSelectedMuscleDetail('Glutei')}
              d="M 292 154 L 314 154 L 314 188 L 289 185 Q 284 169 292 154 Z"
              fill={zoneMap.Glutei.fillColor}
              stroke="#18181D"
              strokeWidth="1.5"
            />
            <path
              onClick={() => setSelectedMuscleDetail('Glutei')}
              d="M 338 154 L 316 154 L 316 188 L 341 185 Q 346 169 338 154 Z"
              fill={zoneMap.Glutei.fillColor}
              stroke="#18181D"
              strokeWidth="1.5"
            />

            {/* Femorali (Bicipite Femorale) */}
            <path
              onClick={() => setSelectedMuscleDetail('Femorali')}
              d="M 290 190 L 312 190 L 308 244 L 290 242 Q 286 216 290 190 Z"
              fill={zoneMap.Femorali.fillColor}
              stroke="#18181D"
              strokeWidth="1.5"
            />
            <path
              onClick={() => setSelectedMuscleDetail('Femorali')}
              d="M 340 190 L 318 190 L 322 244 L 340 242 Q 344 216 340 190 Z"
              fill={zoneMap.Femorali.fillColor}
              stroke="#18181D"
              strokeWidth="1.5"
            />

            {/* Polpacci Posteriori (Gastrocnemio) */}
            <path
              onClick={() => setSelectedMuscleDetail('Polpacci')}
              d="M 290 250 L 307 250 L 303 316 L 292 316 Q 284 282 290 250 Z"
              fill={zoneMap.Polpacci.fillColor}
              stroke="#18181D"
              strokeWidth="1.4"
            />
            <path
              onClick={() => setSelectedMuscleDetail('Polpacci')}
              d="M 340 250 L 323 250 L 327 316 L 338 316 Q 346 282 340 250 Z"
              fill={zoneMap.Polpacci.fillColor}
              stroke="#18181D"
              strokeWidth="1.4"
            />
          </g>
        </svg>

        {/* Legenda Colori (Identica alla foto allegata) */}
        <div className="flex flex-wrap items-center justify-center gap-5 pt-3 border-t border-white/5 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-full bg-[#EF4444] inline-block" />
            <span className="text-zinc-300 font-medium">Muscoli Primari / Affaticati</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-full bg-[#FACC15] inline-block" />
            <span className="text-zinc-300 font-medium">Secondari / In Recupero</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-full bg-[#3F3F46] inline-block" />
            <span className="text-zinc-400 font-medium">Freschi (100% Riposati)</span>
          </div>
        </div>
      </div>

      {/* Dettaglio Muscolo Selezionato al Tocco */}
      {activeDetail && (
        <div className="bg-zinc-900/90 border border-white/10 rounded-3xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div>
            <span className="text-[10px] uppercase font-bold text-zinc-400">Dettaglio Fascio Muscolare</span>
            <h4 className="text-base font-bold text-white mt-0.5">{activeDetail.label}</h4>
            <p className="text-zinc-400 mt-0.5">
              Volume ultimi 7 giorni: <strong className="text-white">{activeDetail.weeklySets} serie</strong>
              {activeDetail.lastDaysAgo < 99 ? ` • Ultimo stimolo: ${activeDetail.lastDaysAgo === 0 ? 'Oggi' : `${activeDetail.lastDaysAgo}g fa`}` : ' • Nessun allenamento recente'}
            </p>
          </div>
          <span className={`px-3.5 py-1.5 rounded-full font-bold ${activeDetail.pillCls}`}>
            {activeDetail.stateLabel}
          </span>
        </div>
      )}

      {/* Griglia Rapida di tutti i Muscoli */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
        {anatomicalZones.map((z) => {
          const st = zoneMap[z.id];
          return (
            <button
              key={z.id}
              type="button"
              onClick={() => setSelectedMuscleDetail(z.id)}
              className={`p-2.5 rounded-2xl border text-left transition cursor-pointer ${
                selectedMuscleDetail === z.id ? 'bg-zinc-800 border-white/30' : 'bg-zinc-900/60 border-white/5'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold truncate">{z.id}</span>
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: st.fillColor }} />
              </div>
              <span className="text-[10px] text-zinc-400 block mt-0.5">
                {st.freshnessPct}% fresco • {st.weeklySets} set
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ==========================================
// 2. GRAFICI PROGRESSI PASTELLO
// ==========================================
export function ProgressCharts({ exercises, allWorkoutSets, workouts, bodyMetrics, selectedDate, darkMode }) {
  const { cardMain, cardSub, pastelBlue } = getTheme(darkMode);
  const [selectedExId, setSelectedExId] = useState(exercises[0]?.id || '');

  const exSets = allWorkoutSets.filter(
    (s) => s.exercise_id === selectedExId && s.completed && s.set_type !== 'warmup'
  );

  const sessionPoints = [];
  const seenWorkouts = new Set();
  exSets.forEach((s) => {
    if (!seenWorkouts.has(s.workout_id)) {
      seenWorkouts.add(s.workout_id);
      const w = workouts.find((wk) => wk.id === s.workout_id);
      const bestInWorkout = Math.max(
        ...exSets.filter((x) => x.workout_id === s.workout_id).map((x) => Number(x.estimated_1rm || 0))
      );
      sessionPoints.push({ date: w ? w.workout_date.slice(5) : 'Oggi', value: bestInWorkout });
    }
  });

  const weightPoints = [...bodyMetrics]
    .filter((b) => b.weight_kg)
    .reverse()
    .slice(-8)
    .map((b) => ({ date: b.log_date.slice(5), value: Number(b.weight_kg) }));

  const latest1RM = sessionPoints.length ? sessionPoints[sessionPoints.length - 1].value : 0;
  const latestWeight = weightPoints.length ? weightPoints[weightPoints.length - 1].value : 0;

  return (
    <div className="space-y-5">
      <MuscleHeatmap exercises={exercises} allWorkoutSets={allWorkoutSets} workouts={workouts} selectedDate={selectedDate} darkMode={darkMode} />

      <div className="bg-[#18181D] text-white rounded-[32px] p-6 shadow-xl space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="text-xs text-zinc-400 font-medium">Massimale Stimato (1RM)</span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <h3 className="text-4xl font-light tracking-tight text-white">{latest1RM} kg</h3>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#6EE7B7]/20 text-[#6EE7B7] font-semibold">Curva Palestra</span>
            </div>
          </div>
          <select
            value={selectedExId}
            onChange={(e) => setSelectedExId(e.target.value)}
            className="bg-zinc-800 text-white border border-zinc-700 rounded-full px-4 py-2 text-xs font-medium outline-none"
          >
            {exercises.map((ex) => (<option key={ex.id} value={ex.id}>{ex.name}</option>))}
          </select>
        </div>

        {sessionPoints.length === 0 ? (
          <div className="h-32 flex items-center justify-center text-xs text-zinc-400 bg-zinc-900/70 rounded-3xl px-4 text-center">
            Completa almeno una serie con carico per generare il grafico.
          </div>
        ) : (
          <div className="pt-2">
            <div className="h-36 flex items-end justify-around gap-3 px-2">
              {sessionPoints.slice(-8).map((pt, i) => {
                const maxVal = Math.max(...sessionPoints.map((p) => p.value), 1);
                const hPct = Math.max(20, Math.round((pt.value / maxVal) * 100));
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2">
                    <span className="text-[11px] font-semibold text-zinc-200">{pt.value}</span>
                    <div className="w-full max-w-[28px] h-24 bg-zinc-800 rounded-full flex items-end overflow-hidden p-0.5">
                      <div style={{ height: `${hPct}%` }} className="w-full rounded-full bg-gradient-to-t from-[#6EE7B7] via-[#C4B5FD] to-[#F9A8D4] transition-all duration-700 ease-out" />
                    </div>
                    <span className="text-[10px] text-zinc-400">{pt.date}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className={`${cardMain} rounded-[32px] p-6 shadow-sm border space-y-4`}>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs text-zinc-400 font-medium">Andamento Peso Corporeo</span>
            <h3 className="text-4xl font-light tracking-tight mt-0.5">{latestWeight ? `${latestWeight} kg` : '-- kg'}</h3>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${pastelBlue}`}>Corpo</span>
        </div>

        {weightPoints.length === 0 ? (
          <div className={`${cardSub} h-28 flex items-center justify-center text-xs text-zinc-400 rounded-3xl px-4 text-center`}>
            Registra il tuo peso nella scheda "Misure" per vedere la curva.
          </div>
        ) : (
          <div className={`${cardSub} p-4 rounded-3xl`}>
            <svg viewBox="0 0 460 130" className="w-full h-32 overflow-visible">
              {(() => {
                const vals = weightPoints.map((p) => p.value);
                const minV = Math.min(...vals) - 1;
                const maxV = Math.max(...vals) + 1;
                const coords = weightPoints.map((p, idx) => ({
                  x: weightPoints.length === 1 ? 230 : 25 + (idx / (weightPoints.length - 1)) * 410,
                  y: 100 - ((p.value - minV) / (maxV - minV || 1)) * 75,
                  ...p
                }));
                return (
                  <>
                    <polyline fill="none" stroke="#0EA5E9" strokeWidth="3" strokeLinecap="round" points={coords.map((c) => `${c.x},${c.y}`).join(' ')} />
                    {coords.map((c, idx) => (
                      <g key={idx}>
                        <circle cx={c.x} cy={c.y} r="5" fill="#EC4899" />
                        <text x={c.x} y={c.y - 10} textAnchor="middle" fill="#0EA5E9" fontSize="10" fontWeight="bold">{c.value}kg</text>
                        <text x={c.x} y={122} textAnchor="middle" fill="#888" fontSize="9">{c.date}</text>
                      </g>
                    ))}
                  </>
                );
              })()}
            </svg>
          </div>
        )}
      </div>
    </div>
  );
}

// ==========================================
// 3. COSTRUTTORE E MODIFICATORE MANUALE SCHEDE (MULTI-MUSCOLO)
// ==========================================
export function ManualRoutineBuilder({ exercises, editingRoutine, onCancelEdit, onSaveRoutine, darkMode }) {
  const { cardMain, cardSub, pillSurface, pastelPeach } = getTheme(darkMode);
  const [routineName, setRoutineName] = useState('');
  const [routineNotes, setRoutineNotes] = useState('');
  const [items, setItems] = useState([]);

  const [selectedExId, setSelectedExId] = useState(exercises[0]?.id || '');
  const [customExMode, setCustomExMode] = useState(false);
  const [customEx, setCustomEx] = useState({
    name: '',
    primary_muscles: ['Petto'],
    secondary_muscles: [],
    equip: 'Bilanciere'
  });
  const [rowSpec, setRowSpec] = useState({ sets: '4', reps: '8-10', rest: '90', note: '' });

  useEffect(() => {
    setRoutineName(editingRoutine?.name || '');
    setRoutineNotes(editingRoutine?.description || '');
    setItems(editingRoutine?.items || []);
  }, [editingRoutine]);

  const toggleCustomMuscle = (field, mus) => {
    setCustomEx((prev) => {
      const list = prev[field] || [];
      const next = list.includes(mus) ? list.filter((x) => x !== mus) : [...list, mus];
      return { ...prev, [field]: next };
    });
  };

  const addExerciseRow = () => {
    if (customExMode && !customEx.name.trim()) {
      alert('Inserisci il nome del nuovo esercizio.');
      return;
    }
    const primList = customEx.primary_muscles.length ? customEx.primary_muscles : ['Petto'];
    const exObj = customExMode
      ? {
          id: null,
          name: customEx.name.trim(),
          muscle_group: primList.join(', '),
          primary_muscles: primList,
          secondary_muscles: customEx.secondary_muscles,
          equipment: customEx.equip
        }
      : exercises.find((e) => e.id === selectedExId) || exercises[0];
    if (!exObj) return;

    setItems((prev) => [
      ...prev,
      {
        exercise_id: exObj.id,
        name: exObj.name,
        muscle_group: exObj.muscle_group,
        primary_muscles: parsePrimaryMuscles(exObj),
        secondary_muscles: exObj.secondary_muscles || [],
        equipment: exObj.equipment,
        target_sets: Math.max(1, Number(rowSpec.sets) || 3),
        target_reps: rowSpec.reps.trim() || '8-10',
        rest_seconds: Math.max(15, Number(rowSpec.rest) || 90),
        note: rowSpec.note.trim()
      }
    ]);
    setCustomEx((p) => ({ ...p, name: '' }));
    setRowSpec((p) => ({ ...p, note: '' }));
  };

  const updateItemField = (index, field, value) => {
    setItems((prev) => prev.map((it, i) => (i === index ? { ...it, [field]: value } : it)));
  };

  const moveItem = (index, direction) => {
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= items.length) return;
    const next = [...items];
    [next[index], next[targetIdx]] = [next[targetIdx], next[index]];
    setItems(next);
  };

  const handleSaveManualRoutine = async (e) => {
    e.preventDefault();
    if (!routineName.trim() || items.length === 0) {
      alert('Inserisci il nome della scheda e almeno un esercizio.');
      return;
    }
    await onSaveRoutine({
      id: editingRoutine?.id || null,
      name: routineName.trim(),
      description: routineNotes.trim(),
      items
    });
    setRoutineName('');
    setRoutineNotes('');
    setItems([]);
  };

  const allMuscles = ['Petto', 'Dorso', 'Spalle', 'Bicipiti', 'Tricipiti', 'Quadricipiti', 'Femorali', 'Glutei', 'Polpacci', 'Core'];

  return (
    <div className="space-y-5">
      <div className={`${pastelPeach} rounded-[32px] p-6 shadow-sm border flex flex-wrap items-center justify-between gap-4`}>
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#F97316] text-white flex items-center justify-center shrink-0 shadow-sm">
            <ClipboardList className="w-6 h-6" />
          </div>
          <div>
            <span className="px-2.5 py-0.5 rounded-full bg-[#F97316]/20 text-[10px] font-bold uppercase">
              {editingRoutine ? 'Modifica Scheda Esistente' : 'Gestione Manuale'}
            </span>
            <h3 className="font-bold text-lg mt-0.5">
              {editingRoutine ? `Modifica: ${editingRoutine.name}` : "Crea la Tua Scheda d'Allenamento"}
            </h3>
            <p className="text-xs opacity-75">Aggiungi, riordina o modifica serie, ripetizioni e recuperi</p>
          </div>
        </div>

        {editingRoutine && onCancelEdit && (
          <button type="button" onClick={onCancelEdit} className={`px-4 py-2 rounded-full ${pillSurface} text-xs font-bold cursor-pointer spring-btn`}>
            Annulla Modifica
          </button>
        )}
      </div>

      <form onSubmit={handleSaveManualRoutine} className={`${cardMain} rounded-[36px] p-6 shadow-sm border space-y-5 text-xs`}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className={`${cardSub} p-3.5 rounded-2xl`}>
            <label className="text-zinc-400 block mb-1">Nome della Scheda *</label>
            <input type="text" required placeholder="Es. Scheda A • Petto, Spalle e Tricipiti" value={routineName} onChange={(e) => setRoutineName(e.target.value)} className="w-full bg-transparent font-bold text-sm outline-none" />
          </div>
          <div className={`${cardSub} p-3.5 rounded-2xl`}>
            <label className="text-zinc-400 block mb-1">Note o Giorno abbinato (opzionale)</label>
            <input type="text" placeholder="Es. Lunedì e Giovedì" value={routineNotes} onChange={(e) => setRoutineNotes(e.target.value)} className="w-full bg-transparent font-semibold text-sm outline-none" />
          </div>
        </div>

        <div className={`${cardSub} p-4 rounded-3xl space-y-3.5 border border-black/5`}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h4 className="font-bold text-sm flex items-center gap-2">
              <Dumbbell className="w-4 h-4 text-[#F97316]" /> Aggiungi un esercizio alla scheda
            </h4>
            <button type="button" onClick={() => setCustomExMode(!customExMode)} className={`px-3 py-1 rounded-full font-bold text-[11px] cursor-pointer ${pillSurface}`}>
              {customExMode ? "← Scegli dall'Archivio" : '+ Scrivi un esercizio nuovo'}
            </button>
          </div>

          {!customExMode ? (
            <div className={`${pillSurface} p-3 rounded-2xl`}>
              <label className="text-zinc-400 block mb-1">Seleziona esercizio dal tuo archivio</label>
              <select value={selectedExId} onChange={(e) => setSelectedExId(e.target.value)} className="w-full bg-transparent font-bold text-xs outline-none">
                {exercises.map((ex) => (
                  <option key={ex.id} value={ex.id}>
                    {ex.name} ({parsePrimaryMuscles(ex).join(', ')} • {ex.equipment})
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className={`${pillSurface} p-3 rounded-2xl`}>
                  <label className="text-zinc-400 block mb-1">Nome nuovo esercizio</label>
                  <input type="text" placeholder="Es. Dip alle parallele..." value={customEx.name} onChange={(e) => setCustomEx({ ...customEx, name: e.target.value })} className="w-full bg-transparent font-bold outline-none" />
                </div>
                <div className={`${pillSurface} p-3 rounded-2xl`}>
                  <label className="text-zinc-400 block mb-1">Attrezzo</label>
                  <select value={customEx.equip} onChange={(e) => setCustomEx({ ...customEx, equip: e.target.value })} className="w-full bg-transparent font-bold outline-none">
                    {['Bilanciere', 'Manubri', 'Macchina', 'Cavi', 'Corpo Libero', 'Multipower'].map((eq) => (<option key={eq} value={eq}>{eq}</option>))}
                  </select>
                </div>
              </div>

              <div className={`${pillSurface} p-3 rounded-2xl space-y-1.5`}>
                <label className="text-zinc-400 block">Muscoli Primari (puoi selezionarne più di uno):</label>
                <div className="flex flex-wrap gap-1.5">
                  {allMuscles.map((m) => {
                    const active = customEx.primary_muscles.includes(m);
                    return (
                      <button
                        key={m}
                        type="button"
                        onClick={() => toggleCustomMuscle('primary_muscles', m)}
                        className={`px-2.5 py-1 rounded-full font-bold transition cursor-pointer ${active ? 'bg-[#EF4444] text-white' : `${cardSub} text-zinc-400`}`}
                      >
                        {active ? '✓ ' : '+ '}{m}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className={`${pillSurface} p-3 rounded-2xl space-y-1.5`}>
                <label className="text-zinc-400 block">Muscoli Secondari:</label>
                <div className="flex flex-wrap gap-1.5">
                  {allMuscles.filter((m) => !customEx.primary_muscles.includes(m)).map((m) => {
                    const active = customEx.secondary_muscles.includes(m);
                    return (
                      <button
                        key={m}
                        type="button"
                        onClick={() => toggleCustomMuscle('secondary_muscles', m)}
                        className={`px-2.5 py-1 rounded-full font-bold transition cursor-pointer ${active ? 'bg-[#FACC15] text-zinc-900' : `${cardSub} text-zinc-400`}`}
                      >
                        {active ? '✓ ' : '+ '}{m}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
            {[
              { k: 'sets', l: 'Numero Serie', type: 'number', ph: '4' },
              { k: 'reps', l: 'Ripetizioni', type: 'text', ph: '8-10' },
              { k: 'rest', l: 'Recupero (sec)', type: 'number', ph: '90' },
              { k: 'note', l: 'Nota personale', type: 'text', ph: 'Es. Buffer 1...', span: 'col-span-3 sm:col-span-1' }
            ].map((f) => (
              <div key={f.k} className={`${f.span || ''} ${pillSurface} p-3 rounded-2xl`}>
                <label className="text-zinc-400 block mb-1">{f.l}</label>
                <input type={f.type} placeholder={f.ph} value={rowSpec[f.k]} onChange={(e) => setRowSpec({ ...rowSpec, [f.k]: e.target.value })} className="w-full bg-transparent font-bold outline-none" />
              </div>
            ))}
          </div>

          <button type="button" onClick={addExerciseRow} className="w-full py-3 rounded-full bg-[#18181D] text-white font-bold flex items-center justify-center gap-1.5 cursor-pointer spring-btn">
            <Plus className="w-4 h-4 text-[#FDBA74]" /> Aggiungi Esercizio alla Scheda ({items.length})
          </button>
        </div>

        {items.length > 0 && (
          <div className="space-y-2.5">
            <h4 className="font-bold text-sm">Esercizi nella scheda ({items.length}):</h4>
            {items.map((it, idx) => (
              <div key={idx} className={`${cardSub} p-3.5 rounded-2xl space-y-2`}>
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="font-bold text-sm">{idx + 1}. {it.name}</p>
                    <span className="text-[10px] text-zinc-400">{it.muscle_group}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button type="button" onClick={() => moveItem(idx, -1)} className={`p-1.5 rounded-full ${pillSurface}`}><ArrowUp className="w-3.5 h-3.5" /></button>
                    <button type="button" onClick={() => moveItem(idx, 1)} className={`p-1.5 rounded-full ${pillSurface}`}><ArrowDown className="w-3.5 h-3.5" /></button>
                    <button type="button" onClick={() => setItems((p) => p.filter((_, i) => i !== idx))} className="p-1.5 text-zinc-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {[
                    { k: 'target_sets', l: 'Serie:', type: 'number', w: 'w-12' },
                    { k: 'target_reps', l: 'Rep:', type: 'text', w: 'w-16' },
                    { k: 'rest_seconds', l: 'Rec(s):', type: 'number', w: 'w-14' }
                  ].map((f) => (
                    <div key={f.k} className={`${pillSurface} px-3 py-1.5 rounded-xl flex items-center justify-between`}>
                      <span className="text-[10px] text-zinc-400">{f.l}</span>
                      <input type={f.type} value={it[f.k]} onChange={(e) => updateItemField(idx, f.k, e.target.value)} className={`${f.w} bg-transparent font-bold text-right outline-none`} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <button type="submit" className="w-full py-4 rounded-full bg-[#F97316] text-white font-bold text-sm flex items-center justify-center gap-2 cursor-pointer shadow-md spring-btn">
          <Check className="w-4 h-4" />
          {editingRoutine ? 'Salva Modifiche alla Scheda' : 'Salva Nuova Scheda'}
        </button>
      </form>
    </div>
  );
}

// ==========================================
// 4. GESTORE DIETA MANUALE + TDEE REALE
// ==========================================
export function ManualDietManager({ foodLogs, bodyMetrics, settings, onLogDirectMeal, darkMode }) {
  const { cardMain, cardSub, pillSurface, pastelMint, pastelLavender } = getTheme(darkMode);
  const [openMyDiet, setOpenMyDiet] = useState(false);
  const [myDietPlan, setMyDietPlan] = useLocalState('manual_diet_plan_v1', { on: [], off: [] });
  const [planDayTab, setPlanDayTab] = useState('on');
  const [mealForm, setMealForm] = useState({
    meal_type: 'colazione', food_name: '', grams: '250', kcal: '', protein: '', carbs: '', fat: ''
  });

  const computeAdaptiveTDEE = () => {
    const byDate = {};
    foodLogs.forEach((f) => { byDate[f.log_date] = (byDate[f.log_date] || 0) + Number(f.kcal || 0); });
    const loggedDates = Object.keys(byDate).filter((d) => byDate[d] > 800);
    const avgKcal = loggedDates.length
      ? Math.round(loggedDates.reduce((s, d) => s + byDate[d], 0) / loggedDates.length)
      : Math.round(((Number(settings.kcal_on) || 2600) + (Number(settings.kcal_off) || 2100)) / 2);

    const validWeights = bodyMetrics.filter((b) => b.weight_kg).slice(0, 14);
    const weightDelta = validWeights.length >= 2
      ? Math.round((Number(validWeights[0].weight_kg) - Number(validWeights[validWeights.length - 1].weight_kg)) * 100) / 100
      : 0;

    const daysSpan = Math.max(7, validWeights.length * 2);
    const adaptiveTdee = Math.max(1400, Math.min(4200, avgKcal - Math.round((weightDelta * 7700) / daysSpan)));
    return { adaptiveTdee, avgKcal, weightDelta, daysTracked: loggedDates.length, ready: loggedDates.length >= 3 && validWeights.length >= 2 };
  };

  const tdeeStats = computeAdaptiveTDEE();

  const handleAddMealToMyDiet = (e) => {
    e.preventDefault();
    if (!mealForm.food_name.trim()) return;
    const newItem = {
      id: crypto.randomUUID(),
      meal_type: mealForm.meal_type,
      food_name: mealForm.food_name.trim(),
      grams: Number(mealForm.grams) || 250,
      kcal: Math.round(Number(mealForm.kcal) || 0),
      protein: Math.round((Number(mealForm.protein) || 0) * 10) / 10,
      carbs: Math.round((Number(mealForm.carbs) || 0) * 10) / 10,
      fat: Math.round((Number(mealForm.fat) || 0) * 10) / 10
    };
    setMealForm((p) => ({ ...p, food_name: '', kcal: '', protein: '', carbs: '', fat: '' }));
    setMyDietPlan((prev) => ({ ...prev, [planDayTab]: [...(prev[planDayTab] || []), newItem] }));
  };

  const currentPlanList = myDietPlan[planDayTab] || [];
  const planTotals = currentPlanList.reduce(
    (acc, it) => ({
      kcal: acc.kcal + Number(it.kcal || 0),
      protein: Math.round((acc.protein + Number(it.protein || 0)) * 10) / 10,
      carbs: Math.round((acc.carbs + Number(it.carbs || 0)) * 10) / 10,
      fat: Math.round((acc.fat + Number(it.fat || 0)) * 10) / 10
    }),
    { kcal: 0, protein: 0, carbs: 0, fat: 0 }
  );

  return (
    <div className="space-y-4">
      <div className={`${pastelMint} rounded-[30px] p-5 shadow-2xs border flex flex-wrap items-center justify-between gap-4`}>
        <div className="flex items-center gap-3.5">
          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${darkMode ? 'bg-emerald-400/20 text-[#6EE7B7]' : 'bg-white text-emerald-600 shadow-2xs'}`}>
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold">TDEE Adattivo Reale</h3>
              <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold ${darkMode ? 'bg-emerald-950 text-[#6EE7B7]' : 'bg-white text-emerald-700'}`}>
                Calcolo Matematico
              </span>
            </div>
            <p className="text-xs opacity-75 mt-0.5">
              {tdeeStats.ready
                ? `Calibrato su ${tdeeStats.daysTracked}gg di diario (media ${tdeeStats.avgKcal} kcal) e variazione peso (${tdeeStats.weightDelta >= 0 ? '+' : ''}${tdeeStats.weightDelta} kg)`
                : 'Media attuale • Registra almeno 3gg di dieta e 2 pesate per la calibrazione dinamica'}
            </p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-2xl font-bold tracking-tight">{tdeeStats.adaptiveTdee}</span>
          <span className="text-xs opacity-70 block">kcal / giorno</span>
        </div>
      </div>

      <button
        onClick={() => setOpenMyDiet(!openMyDiet)}
        className={`px-4 py-2.5 rounded-full text-xs font-bold flex items-center gap-2 transition cursor-pointer spring-btn ${
          openMyDiet ? 'bg-[#8B5CF6] text-white shadow-sm' : `${pastelLavender} border`
        }`}
      >
        <ClipboardList className="w-4 h-4" /> La Mia Tabella Dieta ({myDietPlan.on.length + myDietPlan.off.length})
      </button>

      {openMyDiet && (
        <div className={`${cardMain} rounded-[36px] p-6 shadow-xl border space-y-5 text-xs`}>
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-black/5">
            <div>
              <span className="text-[10px] font-bold uppercase text-[#8B5CF6]">Piano Alimentare Personale</span>
              <h3 className="font-bold text-lg">La Mia Dieta (Giorno ON & OFF)</h3>
              <p className="text-zinc-400">Inserisci i tuoi pasti fissi per caricarli nel diario giornaliero con un clic</p>
            </div>
            <div className="flex items-center gap-2">
              <div className={`flex gap-1 ${cardSub} p-1 rounded-full`}>
                {[
                  { id: 'on', l: 'Piano Giorno ON', active: 'bg-[#F97316] text-white' },
                  { id: 'off', l: 'Piano Giorno OFF', active: 'bg-[#10B981] text-white' }
                ].map((t) => (
                  <button key={t.id} type="button" onClick={() => setPlanDayTab(t.id)} className={`px-3.5 py-1.5 rounded-full font-bold cursor-pointer ${planDayTab === t.id ? t.active : 'text-zinc-400'}`}>
                    {t.l}
                  </button>
                ))}
              </div>
              <button onClick={() => setOpenMyDiet(false)} className={`w-8 h-8 rounded-full ${cardSub} flex items-center justify-center`}><X className="w-4 h-4" /></button>
            </div>
          </div>

          <form onSubmit={handleAddMealToMyDiet} className={`${cardSub} p-4 rounded-3xl space-y-3`}>
            <div className="flex items-center gap-2">
              <span className="font-bold">Pasto:</span>
              <select value={mealForm.meal_type} onChange={(e) => setMealForm({ ...mealForm, meal_type: e.target.value })} className={`${pillSurface} rounded-full px-3 py-1.5 font-bold capitalize outline-none`}>
                {['colazione', 'pranzo', 'cena', 'spuntini'].map((m) => (<option key={m} value={m}>{m}</option>))}
              </select>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className={`col-span-2 ${pillSurface} p-3 rounded-2xl`}>
                <label className="text-zinc-400 block mb-1">Descrizione Pasto / Alimenti</label>
                <input type="text" required placeholder="Es. 100g Riso Basmati + 150g Pollo + 10g Olio EVO" value={mealForm.food_name} onChange={(e) => setMealForm({ ...mealForm, food_name: e.target.value })} className="w-full bg-transparent font-bold outline-none" />
              </div>
              <div className={`${pillSurface} p-3 rounded-2xl`}>
                <label className="text-zinc-400 block mb-1">Grammi tot.</label>
                <input type="number" placeholder="260" value={mealForm.grams} onChange={(e) => setMealForm({ ...mealForm, grams: e.target.value })} className="w-full bg-transparent font-bold outline-none" />
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {[
                { k: 'kcal', l: 'Kcal', ph: '550' },
                { k: 'protein', l: 'Prot (g)', ph: '42', step: '0.1' },
                { k: 'carbs', l: 'Carb (g)', ph: '78', step: '0.1' },
                { k: 'fat', l: 'Grassi (g)', ph: '12', step: '0.1' }
              ].map((f) => (
                <div key={f.k} className={`${pillSurface} p-2.5 rounded-2xl`}>
                  <label className="text-zinc-400 block">{f.l}</label>
                  <input type="number" step={f.step || '1'} placeholder={f.ph} value={mealForm[f.k]} onChange={(e) => setMealForm({ ...mealForm, [f.k]: e.target.value })} className="w-full bg-transparent font-bold outline-none" />
                </div>
              ))}
            </div>

            <button type="submit" className="w-full py-3 rounded-full bg-[#8B5CF6] text-white font-bold flex items-center justify-center gap-1.5 cursor-pointer spring-btn">
              <Plus className="w-4 h-4" /> Aggiungi al Mio Piano ({planDayTab === 'on' ? 'Giorno ON' : 'Giorno OFF'})
            </button>
          </form>

          <div className="bg-[#18181D] text-white rounded-3xl p-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="text-[10px] uppercase font-bold text-[#C4B5FD]">
                Totale Pianificato ({planDayTab === 'on' ? 'Giorno ON' : 'Giorno OFF'})
              </span>
              <p className="text-lg font-bold">
                {planTotals.kcal} kcal • <span className="text-[#6EE7B7]">P:{planTotals.protein}g</span> • <span className="text-[#FDBA74]">C:{planTotals.carbs}g</span> • <span className="text-[#C4B5FD]">G:{planTotals.fat}g</span>
              </p>
            </div>
            {currentPlanList.length > 0 && (
              <button
                type="button"
                onClick={async () => {
                  for (const item of currentPlanList) await onLogDirectMeal(item, item.meal_type);
                  alert('Tutti i pasti del piano sono stati registrati nel diario di oggi!');
                }}
                className="px-4 py-2 rounded-full bg-[#6EE7B7] text-zinc-900 font-bold cursor-pointer spring-btn"
              >
                + Registra Tutta la Giornata Oggi
              </button>
            )}
          </div>

          {['colazione', 'pranzo', 'cena', 'spuntini'].map((mType) => {
            const slotItems = currentPlanList.filter((x) => x.meal_type === mType);
            if (!slotItems.length) return null;
            return (
              <div key={mType} className="space-y-2">
                <h4 className="font-bold text-sm capitalize text-[#8B5CF6]">{mType}</h4>
                {slotItems.map((it) => (
                  <div key={it.id} className={`${cardSub} px-4 py-3 rounded-2xl flex flex-wrap items-center justify-between gap-2`}>
                    <div>
                      <p className="font-bold text-sm">{it.food_name}</p>
                      <p className="text-[11px] text-zinc-400">{it.kcal} kcal • P:{it.protein}g C:{it.carbs}g G:{it.fat}g</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={() => onLogDirectMeal(it, it.meal_type)} className={`px-3 py-1.5 rounded-full ${pillSurface} font-bold text-[11px] cursor-pointer spring-btn`}>
                        + Registra Oggi
                      </button>
                      <button type="button" onClick={() => setMyDietPlan((p) => ({ ...p, [planDayTab]: p[planDayTab].filter((x) => x.id !== it.id) }))} className="p-1 text-zinc-400 hover:text-red-500">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}