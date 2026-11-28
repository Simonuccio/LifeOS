import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './supabaseClient';
import {
  ProgressCharts, ManualRoutineBuilder, ManualDietManager,
  PastelConfetti, WaterGlassesWidget, HabitCartesianChart,
  useLocalState, getTheme, saveLocal, parsePrimaryMuscles
} from './ModulesExtra';
import {
  Home, CheckSquare, Dumbbell, Utensils, Settings, Plus, Trash2, Check,
  Trophy, Timer, Copy, ChevronLeft, ChevronRight,
  Play, Pause, RotateCcw, Scale, X, Cloud, CloudOff, RefreshCw,
  Moon, Sun, Camera, Search, Zap, Edit3, ShieldAlert, Calendar, ArrowUp, ArrowDown, BarChart3, Image as ImageIcon
} from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';

const DEFAULT_EXERCISES = [
  { id: 'ex-1', name: 'Panca Piana con Bilanciere', muscle_group: 'Petto', primary_muscles: ['Petto'], secondary_muscles: ['Tricipiti', 'Spalle'], equipment: 'Bilanciere' },
  { id: 'ex-2', name: 'Squat con Bilanciere', muscle_group: 'Quadricipiti, Glutei', primary_muscles: ['Quadricipiti', 'Glutei'], secondary_muscles: ['Femorali', 'Core'], equipment: 'Bilanciere' },
  { id: 'ex-3', name: 'Stacco da Terra', muscle_group: 'Dorso, Femorali, Glutei', primary_muscles: ['Dorso', 'Femorali', 'Glutei'], secondary_muscles: ['Core'], equipment: 'Bilanciere' },
  { id: 'ex-4', name: 'Lat Machine Avanti', muscle_group: 'Dorso', primary_muscles: ['Dorso'], secondary_muscles: ['Bicipiti'], equipment: 'Macchina' },
  { id: 'ex-5', name: 'Military Press', muscle_group: 'Spalle', primary_muscles: ['Spalle'], secondary_muscles: ['Tricipiti', 'Core'], equipment: 'Bilanciere' },
  { id: 'ex-6', name: 'Alzate Laterali con Manubri', muscle_group: 'Spalle', primary_muscles: ['Spalle'], secondary_muscles: [], equipment: 'Manubri' },
  { id: 'ex-7', name: 'Curl con Manubri', muscle_group: 'Bicipiti', primary_muscles: ['Bicipiti'], secondary_muscles: [], equipment: 'Manubri' },
  { id: 'ex-8', name: 'Pushdown Tricipiti ai Cavi', muscle_group: 'Tricipiti', primary_muscles: ['Tricipiti'], secondary_muscles: [], equipment: 'Cavi' }
];

const DEFAULT_HABITS = [
  { id: 'hab-1', name: 'Completare Allenamento', habit_type: 'boolean', target_value: 1, unit: '', frequency_days: [1,2,3,4,5,6,7], auto_trigger: 'workout_done' },
  { id: 'hab-2', name: 'Rispettare Target Dieta', habit_type: 'boolean', target_value: 1, unit: '', frequency_days: [1,2,3,4,5,6,7], auto_trigger: 'diet_goal_met' },
  { id: 'hab-3', name: 'Bere Acqua', habit_type: 'numeric', target_value: 2500, unit: 'ml', frequency_days: [1,2,3,4,5,6,7], auto_trigger: 'none' },
  { id: 'hab-4', name: 'Prendere Creatina (5g)', habit_type: 'boolean', target_value: 1, unit: '', frequency_days: [1,2,3,4,5,6,7], auto_trigger: 'none' },
  { id: 'hab-5', name: 'Zero Zuccheri Raffinati / Junk Food', habit_type: 'bad', target_value: 1, unit: '', frequency_days: [1,2,3,4,5,6,7], auto_trigger: 'none' }
];

const DAY_LABELS = [
  { iso: 1, short: 'L', full: 'Lun' },
  { iso: 2, short: 'M', full: 'Mar' },
  { iso: 3, short: 'M', full: 'Mer' },
  { iso: 4, short: 'G', full: 'Gio' },
  { iso: 5, short: 'V', full: 'Ven' },
  { iso: 6, short: 'S', full: 'Sab' },
  { iso: 7, short: 'D', full: 'Dom' }
];

const DAILY_GREETINGS = {
  1: 'Buon lunedì, Simone',
  2: 'Buon martedì, Simone',
  3: 'Buon mercoledì, Simone',
  4: 'Buon giovedì, Simone',
  5: 'Buon venerdì, Simone',
  6: 'Buon sabato, Simone',
  7: 'Buona domenica, Simone'
};

const MUSCLE_LIST = ['Petto', 'Dorso', 'Spalle', 'Bicipiti', 'Tricipiti', 'Quadricipiti', 'Femorali', 'Glutei', 'Polpacci', 'Core'];
const EQUIPMENT_LIST = ['Bilanciere', 'Manubri', 'Macchina', 'Cavi', 'Corpo Libero', 'Kettlebell', 'Multipower'];

const formatDate = (dateObj) => {
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const addDays = (dateStr, days) => {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + days);
  return formatDate(dt);
};

const getIsoDayOfWeek = (dateStr) => {
  const [y, m, d] = dateStr.split('-').map(Number);
  const day = new Date(y, m - 1, d).getDay();
  return day === 0 ? 7 : day;
};

const getWeekDays = (dateStr) => {
  const iso = getIsoDayOfWeek(dateStr);
  const monday = addDays(dateStr, -(iso - 1));
  const labels = ['L', 'M', 'M', 'G', 'V', 'S', 'D'];
  return Array.from({ length: 7 }, (_, i) => {
    const d = addDays(monday, i);
    return { date: d, dayNum: d.slice(8), label: labels[i] };
  });
};

const formatSeconds = (totalSec) => {
  const mins = Math.floor(totalSec / 60);
  const secs = totalSec % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

// Ridimensiona e converte le foto dell'iPhone (HEIC / 48MP) in JPEG leggero con bordo bianco per la lettura del barcode
const prepareImageForBarcode = (file, maxDim = 1200, addQuietZone = false) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        let w = img.width;
        let h = img.height;
        if (w > h && w > maxDim) {
          h = Math.round((h * maxDim) / w);
          w = maxDim;
        } else if (h > maxDim) {
          w = Math.round((w * maxDim) / h);
          h = maxDim;
        }
        const pad = addQuietZone ? 70 : 0;
        const canvas = document.createElement('canvas');
        canvas.width = w + pad * 2;
        canvas.height = h + pad * 2;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, pad, pad, w, h);
        canvas.toBlob(
          (blob) => {
            if (!blob) return reject(new Error('Conversion error'));
            resolve(new File([blob], 'barcode_scan.jpg', { type: 'image/jpeg' }));
          },
          'image/jpeg',
          0.92
        );
      };
      img.onerror = reject;
      img.src = ev.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

function AnimatedNumber({ value }) {
  const [displayVal, setDisplayVal] = useState(value);
  useEffect(() => {
    const start = Number(displayVal) || 0;
    const end = Number(value) || 0;
    if (start === end) return;
    const duration = 350;
    const startTime = performance.now();
    let raf;
    const step = (now) => {
      const progress = Math.min(1, (now - startTime) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayVal(Math.round(start + (end - start) * eased));
      if (progress < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return <>{displayVal}</>;
}

function CircularGauge({ percentage, color = '#F97316', darkMode, size = 44 }) {
  const pct = Math.min(100, Math.max(0, Number(percentage) || 0));
  const r = 18;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <svg style={{ width: size, height: size }} className="-rotate-90 shrink-0" viewBox="0 0 44 44">
      <circle
        cx="22"
        cy="22"
        r={r}
        fill="none"
        stroke={darkMode ? 'rgba(255,255,255,0.12)' : 'rgba(24,24,29,0.08)'}
        strokeWidth="4.5"
      />
      <circle
        cx="22"
        cy="22"
        r={r}
        fill="none"
        stroke={color}
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        className="transition-all duration-700 ease-out"
      />
    </svg>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedDate, setSelectedDate] = useState(formatDate(new Date()));
  const [cloudConnected, setCloudConnected] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshToast, setRefreshToast] = useState('');
  const [confettiActive, setConfettiActive] = useState(false);

  const [darkMode, setDarkMode] = useLocalState('darkMode', false);
  const [syncQueue, setSyncQueue] = useLocalState('sync_queue', []);
  const [settings, setSettings] = useLocalState('settings', {
    kcal_on: 2600, protein_on: 180, carbs_on: 320, fat_on: 65,
    kcal_off: 2100, protein_off: 180, carbs_off: 200, fat_off: 65
  });
  const [habits, setHabits] = useLocalState('habits', DEFAULT_HABITS);
  const [habitLogs, setHabitLogs] = useLocalState('habitLogs', []);
  const [exerciseRpe, setExerciseRpe] = useLocalState('exercise_rpe', {});
  const [exercises, setExercises] = useLocalState('exercises', DEFAULT_EXERCISES);
  const [routines, setRoutines] = useLocalState('routines', []);
  const [routineExercises, setRoutineExercises] = useLocalState('routineExercises', []);
  const [workouts, setWorkouts] = useLocalState('workouts', []);
  const [allWorkoutSets, setAllWorkoutSets] = useLocalState('allWorkoutSets', []);
  const [cardioLogs, setCardioLogs] = useLocalState('cardioLogs', []);
  const [bodyMetrics, setBodyMetrics] = useLocalState('bodyMetrics', []);
  const [foodLogs, setFoodLogs] = useLocalState('foodLogs', []);
  const [foodsDb, setFoodsDb] = useLocalState('foodsDb', []);

  const syncQueueRef = useRef(syncQueue);
  const debounceTimersRef = useRef({});
  const wakeLockRef = useRef(null);
  const qrInstanceRef = useRef(null);

  useEffect(() => {
    syncQueueRef.current = syncQueue;
  }, [syncQueue]);

  const triggerConfetti = () => {
    setConfettiActive(true);
    setTimeout(() => setConfettiActive(false), 2400);
  };

  const [showDietTargetsPanel, setShowDietTargetsPanel] = useState(false);
  const [showAllDaysHabits, setShowAllDaysHabits] = useState(false);
  const [showHabitModal, setShowHabitModal] = useState(false);
  const [editingHabitId, setEditingHabitId] = useState(null);
  const [habitForm, setHabitForm] = useState({
    name: '', habit_type: 'boolean', target_value: '1', unit: '',
    frequency_days: [1, 2, 3, 4, 5, 6, 7], auto_trigger: 'none'
  });

  const [numericDrafts, setNumericDrafts] = useState({});
  const [focusTimer, setFocusTimer] = useState({
    habitId: null, remaining: 900, total: 900, running: false, endTime: null
  });

  const [forzaSubTab, setForzaSubTab] = useState('workout');
  const [editingRoutine, setEditingRoutine] = useState(null);
  const [activeWorkout, setActiveWorkout] = useState(null);
  const [restTimer, setRestTimer] = useState({ active: false, remaining: 90, total: 90, endTime: null });
  const [prBanner, setPrBanner] = useState(null);

  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [editingExerciseId, setEditingExerciseId] = useState(null);
  const [exerciseForm, setExerciseForm] = useState({
    name: '',
    primary_muscles: ['Petto'],
    secondary_muscles: [],
    equipment: 'Bilanciere'
  });

  const [cardioForm, setCardioForm] = useState({ activity_name: 'Camminata Inclinata', duration_minutes: '30', distance_km: '3', calories_burned: '220' });
  const [bodyForm, setBodyForm] = useState({ weight_kg: '', waist_cm: '', chest_cm: '', arm_cm: '', thigh_cm: '', body_fat_pct: '' });

  const [foodModal, setFoodModal] = useState({ open: false, meal_type: 'colazione', tab: 'search' });
  const [searchQuery, setSearchQuery] = useState('');
  const [offResults, setOffResults] = useState([]);
  const [searchingOff, setSearchingOff] = useState(false);
  const [selectedFoodGrams, setSelectedFoodGrams] = useState('100');
  const [newFoodModalForm, setNewFoodModalForm] = useState({
    name: '', brand: '', kcal_100g: '', protein_100g: '', carbs_100g: '', fat_100g: '',
    grams_now: '100', save_for_future: true
  });

  const [cameraRunning, setCameraRunning] = useState(false);
  const [barcodeStatusMsg, setBarcodeStatusMsg] = useState('');
  const [manualBarcodeInput, setManualBarcodeInput] = useState('');
  const [barcodeLoading, setBarcodeLoading] = useState(false);

  // ==========================================
  // CODA DI SINCRONIZZAZIONE OFFLINE
  // ==========================================
  const executeSupabaseOp = async (op) => {
    const { table, action, payload, onConflict, matchCol, matchVal } = op;
    if (action === 'upsert') {
      return onConflict
        ? await supabase.from(table).upsert(payload, { onConflict })
        : await supabase.from(table).upsert(payload);
    }
    if (action === 'insert') return await supabase.from(table).insert(payload);
    if (action === 'delete') return await supabase.from(table).delete().eq(matchCol || 'id', matchVal);
    return { error: null };
  };

  const enqueueSyncOperation = (op) => {
    setSyncQueue((prev) => {
      if (op.dedupeKey) {
        return [...prev.filter((item) => item.dedupeKey !== op.dedupeKey), { ...op, qId: crypto.randomUUID() }];
      }
      return [...prev, { ...op, qId: crypto.randomUUID() }];
    });
  };

  const syncOrQueue = async (op) => {
    if (!navigator.onLine) {
      setCloudConnected(false);
      enqueueSyncOperation(op);
      return;
    }
    try {
      const { error } = await executeSupabaseOp(op);
      if (error) {
        setCloudConnected(false);
        enqueueSyncOperation(op);
      } else {
        setCloudConnected(true);
      }
    } catch {
      setCloudConnected(false);
      enqueueSyncOperation(op);
    }
  };

  const flushOfflineQueue = async () => {
    const currentQueue = syncQueueRef.current;
    if (!currentQueue.length || !navigator.onLine) return;
    const remaining = [];
    for (const op of currentQueue) {
      try {
        const { error } = await executeSupabaseOp(op);
        if (error) remaining.push(op);
      } catch {
        remaining.push(op);
      }
    }
    setSyncQueue(remaining);
    if (remaining.length === 0) setCloudConnected(true);
  };

  useEffect(() => {
    const handleOnline = () => flushOfflineQueue();
    const handleOffline = () => setCloudConnected(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // ==========================================
  // SCHERMO SEMPRE ATTIVO IN PALESTRA (WAKE LOCK)
  // ==========================================
  const shouldKeepScreenAwake = Boolean(activeWorkout || restTimer.active || focusTimer.running);

  useEffect(() => {
    const requestWakeLock = async () => {
      if (!shouldKeepScreenAwake || !('wakeLock' in navigator)) return;
      try {
        if (!wakeLockRef.current) {
          wakeLockRef.current = await navigator.wakeLock.request('screen');
          wakeLockRef.current.addEventListener('release', () => { wakeLockRef.current = null; });
        }
      } catch {}
    };

    const releaseWakeLock = async () => {
      if (wakeLockRef.current) {
        try { await wakeLockRef.current.release(); } catch {}
        wakeLockRef.current = null;
      }
    };

    if (shouldKeepScreenAwake) requestWakeLock();
    else releaseWakeLock();

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && shouldKeepScreenAwake) requestWakeLock();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (!shouldKeepScreenAwake) releaseWakeLock();
    };
  }, [shouldKeepScreenAwake]);

  // ==========================================
  // TIMER DI RECUPERO & FOCUS (ORARIO DI SISTEMA, SENZA AUDIO)
  // ==========================================
  const startRestCountdown = (seconds) => {
    const sec = Math.max(5, Number(seconds) || 90);
    setRestTimer({ active: true, remaining: sec, total: sec, endTime: Date.now() + sec * 1000 });
  };

  const adjustRestCountdown = (deltaSec) => {
    setRestTimer((prev) => {
      if (!prev.active || !prev.endTime) return prev;
      const newEndTime = prev.endTime + deltaSec * 1000;
      const newRemaining = Math.max(0, Math.ceil((newEndTime - Date.now()) / 1000));
      if (newRemaining <= 0) return { active: false, remaining: 90, total: 90, endTime: null };
      return {
        ...prev,
        endTime: newEndTime,
        remaining: newRemaining,
        total: Math.max(prev.total, newRemaining)
      };
    });
  };

  useEffect(() => {
    if (!restTimer.active || !restTimer.endTime) return;
    const syncRest = () => {
      const left = Math.max(0, Math.ceil((restTimer.endTime - Date.now()) / 1000));
      if (left <= 0) {
        setRestTimer({ active: false, remaining: 90, total: 90, endTime: null });
      } else {
        setRestTimer((prev) => (prev.remaining !== left ? { ...prev, remaining: left } : prev));
      }
    };
    syncRest();
    const interval = setInterval(syncRest, 300);
    document.addEventListener('visibilitychange', syncRest);
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', syncRest);
    };
  }, [restTimer.active, restTimer.endTime]);

  const toggleFocusTimerRun = () => {
    setFocusTimer((prev) => {
      if (!prev.running) {
        return { ...prev, running: true, endTime: Date.now() + prev.remaining * 1000 };
      }
      const left = prev.endTime ? Math.max(0, Math.ceil((prev.endTime - Date.now()) / 1000)) : prev.remaining;
      return { ...prev, running: false, remaining: left, endTime: null };
    });
  };

  useEffect(() => {
    if (!focusTimer.running || !focusTimer.endTime) return;
    const syncFocus = () => {
      const left = Math.max(0, Math.ceil((focusTimer.endTime - Date.now()) / 1000));
      if (left <= 0) {
        triggerConfetti();
        const completedHabit = habits.find((h) => h.id === focusTimer.habitId);
        if (completedHabit) updateHabitProgress(completedHabit, completedHabit.target_value);
        setFocusTimer((prev) => ({ ...prev, running: false, remaining: prev.total, endTime: null }));
      } else {
        setFocusTimer((prev) => (prev.remaining !== left ? { ...prev, remaining: left } : prev));
      }
    };
    syncFocus();
    const interval = setInterval(syncFocus, 300);
    document.addEventListener('visibilitychange', syncFocus);
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', syncFocus);
    };
  }, [focusTimer.running, focusTimer.endTime]);

  // ==========================================
  // MOTORE BARCODE (FOTOCAMERA DIRETTA + FOTO RIDIMENSIONATA + CODICE MANUALE)
  // ==========================================
  const stopBarcodeCamera = async () => {
    if (qrInstanceRef.current) {
      try {
        if (qrInstanceRef.current.isScanning) {
          await qrInstanceRef.current.stop();
        }
        qrInstanceRef.current.clear();
      } catch {}
      qrInstanceRef.current = null;
    }
    setCameraRunning(false);
  };

  useEffect(() => {
    if (!foodModal.open || foodModal.tab !== 'barcode') {
      stopBarcodeCamera();
      setBarcodeStatusMsg('');
    }
    return () => {
      stopBarcodeCamera();
    };
  }, [foodModal.open, foodModal.tab]);

  const handleBarcodeDecoded = async (rawCode) => {
    const cleanCode = String(rawCode || '').trim();
    if (!cleanCode) return;

    await stopBarcodeCamera();
    setBarcodeLoading(true);
    setBarcodeStatusMsg(`Codice ${cleanCode} letto! Ricerca prodotto in corso...`);

    try {
      const localMatch = foodsDb.find((f) => f.barcode === cleanCode);
      if (localMatch) {
        await logFoodItem(localMatch, Number(selectedFoodGrams) || 100, foodModal.meal_type);
        setBarcodeLoading(false);
        setBarcodeStatusMsg('');
        return;
      }

      const res = await fetch(`https://world.openfoodfacts.org/api/v0/product/${encodeURIComponent(cleanCode)}.json`);
      const data = await res.json();
      if (data.status === 1 && data.product) {
        const p = data.product;
        const n = p.nutriments || {};
        const scannedFood = {
          name: p.product_name_it || p.product_name || `Prodotto ${cleanCode}`,
          brand: p.brands || '',
          barcode: cleanCode,
          kcal_100g: Math.round(n['energy-kcal_100g'] || 0),
          protein_100g: Math.round((n.proteins_100g || 0) * 10) / 10,
          carbs_100g: Math.round((n.carbohydrates_100g || 0) * 10) / 10,
          fat_100g: Math.round((n.fat_100g || 0) * 10) / 10
        };
        const saved = await addNewFoodToDb(scannedFood);
        await logFoodItem(saved, Number(selectedFoodGrams) || 100, foodModal.meal_type);
        setBarcodeStatusMsg('');
      } else {
        setBarcodeStatusMsg('');
        alert(`Codice ${cleanCode} letto, ma il prodotto non è su OpenFoodFacts. Inserisci i valori qui per salvarlo per sempre!`);
        setNewFoodModalForm((prev) => ({ ...prev, name: '', barcode: cleanCode }));
        setFoodModal((prev) => ({ ...prev, tab: 'create_food' }));
      }
    } catch {
      setBarcodeStatusMsg('Errore di rete durante la ricerca del codice a barre.');
    }
    setBarcodeLoading(false);
  };

  const startBarcodeLiveCamera = async () => {
    setBarcodeStatusMsg('Richiesta permesso fotocamera in corso...');
    await stopBarcodeCamera();

    try {
      const html5QrCode = new Html5Qrcode('barcode-live-box');
      qrInstanceRef.current = html5QrCode;
      setCameraRunning(true);

      await html5QrCode.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 240, height: 120 },
          aspectRatio: 1.5
        },
        (decodedText) => {
          handleBarcodeDecoded(decodedText);
        },
        () => {}
      );
      setBarcodeStatusMsg('Inquadra il codice a barre al centro del riquadro.');
    } catch {
      setCameraRunning(false);
      setBarcodeStatusMsg(
        'Permesso fotocamera negato o bloccato da Safari. Controlla Impostazioni iPhone > Safari > Fotocamera (imposta su Chiedi o Consenti), oppure usa il pulsante "Carica/Scatta Foto" o inserisci i numeri qui sotto.'
      );
    }
  };

  const handleBarcodeImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    await stopBarcodeCamera();
    setBarcodeLoading(true);
    setBarcodeStatusMsg('Ottimizzazione foto e lettura codice a barre...');

    try {
      if ('BarcodeDetector' in window) {
        try {
          const detector = new window.BarcodeDetector();
          const bitmap = await createImageBitmap(file);
          const barcodes = await detector.detect(bitmap);
          if (barcodes && barcodes.length > 0 && barcodes[0].rawValue) {
            await handleBarcodeDecoded(barcodes[0].rawValue);
            e.target.value = '';
            return;
          }
        } catch {}
      }

      const tempScanner = new Html5Qrcode('barcode-photo-temp');
      try {
        const cleanJpeg = await prepareImageForBarcode(file, 1200, false);
        const decoded = await tempScanner.scanFile(cleanJpeg, false);
        tempScanner.clear();
        await handleBarcodeDecoded(decoded);
        e.target.value = '';
        return;
      } catch {
        const paddedJpeg = await prepareImageForBarcode(file, 900, true);
        const decodedRetry = await tempScanner.scanFile(paddedJpeg, false);
        tempScanner.clear();
        await handleBarcodeDecoded(decodedRetry);
        e.target.value = '';
        return;
      }
    } catch {
      setBarcodeLoading(false);
      setBarcodeStatusMsg(
        'Impossibile leggere le barre dalla foto (immagine sfocata o riflesso di luce). Riprova tenendo il codice ben dritto oppure digita i 13 numeri scritti sotto al codice nella casella qui sotto!'
      );
    }
    e.target.value = '';
  };

  const handleManualRefresh = async (showNotice = true) => {
    setIsRefreshing(true);
    try {
      await flushOfflineQueue();

      const { data: exData, error: exErr } = await supabase.from('exercises').select('*').order('name');
      if (exErr) {
        setCloudConnected(false);
        setIsRefreshing(false);
        return;
      }
      setCloudConnected(true);
      if (exData && exData.length > 0) {
        setExercises((prevLocal) =>
          exData.map((remoteEx) => {
            const localMatch = prevLocal.find((l) => l.id === remoteEx.id);
            const primList = localMatch?.primary_muscles?.length
              ? localMatch.primary_muscles
              : parsePrimaryMuscles(remoteEx);
            return {
              ...remoteEx,
              muscle_group: primList.join(', '),
              primary_muscles: primList,
              secondary_muscles: localMatch?.secondary_muscles || []
            };
          })
        );
      }

      const [
        { data: settingsData }, { data: habitsData }, { data: habitLogsData },
        { data: routData }, { data: routExData }, { data: workData },
        { data: setsData }, { data: cardioData }, { data: bodyData },
        { data: foodsData }, { data: fLogsData }
      ] = await Promise.all([
        supabase.from('user_settings').select('*').eq('id', 1).single(),
        supabase.from('habits').select('*').order('created_at'),
        supabase.from('habit_logs').select('*'),
        supabase.from('routines').select('*').order('created_at'),
        supabase.from('routine_exercises').select('*').order('order_index'),
        supabase.from('workouts').select('*').order('workout_date', { ascending: false }),
        supabase.from('workout_sets').select('*').order('set_number'),
        supabase.from('cardio_logs').select('*').order('log_date', { ascending: false }),
        supabase.from('body_metrics').select('*').order('log_date', { ascending: false }),
        supabase.from('foods').select('*').order('name'),
        supabase.from('food_logs').select('*')
      ]);

      if (settingsData) setSettings(settingsData);
      if (habitsData && habitsData.length > 0) {
        setHabits((prevLocal) => {
          const orderMap = new Map(prevLocal.map((item, idx) => [item.id, idx]));
          return [...habitsData].sort((a, b) => (orderMap.get(a.id) ?? 999) - (orderMap.get(b.id) ?? 999));
        });
      }
      if (habitLogsData) setHabitLogs(habitLogsData);
      if (routData) setRoutines(routData);
      if (routExData) setRoutineExercises(routExData);
      if (workData) setWorkouts(workData);
      if (setsData) setAllWorkoutSets(setsData);
      if (cardioData) setCardioLogs(cardioData);
      if (bodyData) setBodyMetrics(bodyData);
      if (foodsData) setFoodsDb(foodsData);
      if (fLogsData) setFoodLogs(fLogsData);

      if (showNotice) {
        setRefreshToast('Sincronizzato ✓');
        setTimeout(() => setRefreshToast(''), 2000);
      }
    } catch {
      setCloudConnected(false);
    }
    setTimeout(() => setIsRefreshing(false), 400);
  };

  useEffect(() => { handleManualRefresh(false); }, []);

  const workoutsToday = workouts.filter((w) => w.workout_date === selectedDate && w.completed);
  const hasCompletedSetInActive = Boolean(
    activeWorkout?.exercises?.some((ex) => ex.sets.some((s) => s.completed))
  );
  const isTrainingDay = workoutsToday.length > 0 || hasCompletedSetInActive;

  const currentTargets = {
    kcal: Number(isTrainingDay ? settings.kcal_on : settings.kcal_off) || 2100,
    protein: Number(isTrainingDay ? settings.protein_on : settings.protein_off) || 180,
    carbs: Number(isTrainingDay ? settings.carbs_on : settings.carbs_off) || 200,
    fat: Number(isTrainingDay ? settings.fat_on : settings.fat_off) || 65
  };

  const todayFoods = foodLogs.filter((f) => f.log_date === selectedDate);
  const totals = todayFoods.reduce(
    (acc, item) => ({
      kcal: acc.kcal + Number(item.kcal || 0),
      protein: acc.protein + Number(item.protein || 0),
      carbs: acc.carbs + Number(item.carbs || 0),
      fat: acc.fat + Number(item.fat || 0)
    }),
    { kcal: 0, protein: 0, carbs: 0, fat: 0 }
  );

  const currentIsoDay = getIsoDayOfWeek(selectedDate);
  const dailyGreeting = DAILY_GREETINGS[currentIsoDay] || 'Buona giornata, Simone';

  const goodHabitsAll = habits.filter((h) => h.habit_type !== 'bad');
  const badHabitsAll = habits.filter((h) => h.habit_type === 'bad');

  const todaysGoodHabits = goodHabitsAll.filter((h) =>
    (h.frequency_days || [1, 2, 3, 4, 5, 6, 7]).includes(currentIsoDay)
  );
  const doneHabitsCount = todaysGoodHabits.filter((h) =>
    habitLogs.some((l) => l.habit_id === h.id && l.log_date === selectedDate && l.completed)
  ).length;

  const moveHabitOrder = (habitId, direction, currentDisplayedList) => {
    const posInDisplayed = currentDisplayedList.findIndex((h) => h.id === habitId);
    const targetPos = posInDisplayed + direction;
    if (posInDisplayed < 0 || targetPos < 0 || targetPos >= currentDisplayedList.length) return;

    const targetHabitId = currentDisplayedList[targetPos].id;
    setHabits((prev) => {
      const next = [...prev];
      const idxA = next.findIndex((h) => h.id === habitId);
      const idxB = next.findIndex((h) => h.id === targetHabitId);
      if (idxA < 0 || idxB < 0) return prev;
      [next[idxA], next[idxB]] = [next[idxB], next[idxA]];
      return next;
    });
  };

  const waterHabit = habits.find((h) => h.name.toLowerCase().includes('acqua') || h.unit === 'ml');
  const waterLogEntry = waterHabit ? habitLogs.find((l) => l.habit_id === waterHabit.id && l.log_date === selectedDate) : null;
  const currentWaterMl = waterLogEntry ? Number(waterLogEntry.current_value) : 0;
  const targetWaterMl = waterHabit ? Number(waterHabit.target_value) || 2500 : 2500;

  const handleWaterUpdate = (newMl) => {
    if (waterHabit) updateHabitProgress(waterHabit, newMl);
  };

  const calculateReadinessAndBriefing = () => {
    const yesterday = addDays(selectedDate, -1);
    const twoDaysAgo = addDays(selectedDate, -2);
    const workedOutYesterday = workouts.some((w) => w.workout_date === yesterday && w.completed);
    const workedOutTwoDaysAgo = workouts.some((w) => w.workout_date === twoDaysAgo && w.completed);

    let score = 88;
    if (workedOutYesterday && workedOutTwoDaysAgo) score -= 14;
    else if (workedOutYesterday) score -= 5;
    score = Math.min(100, Math.max(45, score + Math.min(12, doneHabitsCount * 3)));

    const remainingKcal = Math.max(0, currentTargets.kcal - totals.kcal);
    let briefingText = '';
    if (activeWorkout && hasCompletedSetInActive) {
      briefingText = `Sessione "${activeWorkout.name}" in corso: usa il selettore RPE a fine esercizio per calibrare i carichi!`;
    } else if (workoutsToday.length > 0) {
      briefingText = `Ottimo lavoro con "${workoutsToday[0].name}"! Il profilo è passato a Giorno ON (${currentTargets.kcal} kcal).`;
    } else if (workedOutYesterday) {
      briefingText = `Ieri ti sei allenato: oggi prontezza al ${score}%. Ti restano ${remainingKcal} kcal e ${Math.max(0, todaysGoodHabits.length - doneHabitsCount)} Routine.`;
    } else {
      briefingText = `Muscoli freschi e recupero al ${score}%: giornata ideale per dare il massimo in Palestra!`;
    }

    return { score, briefingText };
  };

  const { score: readinessScore, briefingText } = calculateReadinessAndBriefing();

  const triggerHabitAutomation = async (triggerType) => {
    const targetHabits = habits.filter((h) => h.auto_trigger === triggerType);
    if (!targetHabits.length) return;
    let updatedLogs = [...habitLogs];
    for (const h of targetHabits) {
      const idx = updatedLogs.findIndex((l) => l.habit_id === h.id && l.log_date === selectedDate);
      const logEntry = {
        id: idx >= 0 ? updatedLogs[idx].id : crypto.randomUUID(),
        habit_id: h.id, log_date: selectedDate, current_value: Number(h.target_value) || 1, completed: true
      };
      if (idx >= 0) updatedLogs[idx] = logEntry; else updatedLogs.push(logEntry);
      syncOrQueue({
        table: 'habit_logs',
        action: 'upsert',
        payload: logEntry,
        onConflict: 'habit_id,log_date',
        dedupeKey: `habit_log_${h.id}_${selectedDate}`
      });
    }
    setHabitLogs(updatedLogs);
  };

  useEffect(() => {
    if (!habits.length) return;
    const kcalDiffRatio = Math.abs(totals.kcal - currentTargets.kcal) / (currentTargets.kcal || 1);
    const proteinMet = totals.protein >= currentTargets.protein * 0.9;
    if (totals.kcal > 0 && kcalDiffRatio <= 0.1 && proteinMet) triggerHabitAutomation('diet_goal_met');
  }, [totals.kcal, totals.protein, currentTargets.kcal, currentTargets.protein, selectedDate]);

  const updateHabitProgress = (habit, newValue) => {
    const val = Math.max(0, Number(newValue) || 0);
    const completed = val >= Number(habit.target_value || 1);
    const existingIdx = habitLogs.findIndex((l) => l.habit_id === habit.id && l.log_date === selectedDate);
    const entry = {
      id: existingIdx >= 0 ? habitLogs[existingIdx].id : crypto.randomUUID(),
      habit_id: habit.id, log_date: selectedDate, current_value: val, completed
    };
    const nextLogs = [...habitLogs];
    if (existingIdx >= 0) nextLogs[existingIdx] = entry; else nextLogs.push(entry);
    setHabitLogs(nextLogs);

    if (habit.habit_type !== 'bad') {
      const allCompletedNow = todaysGoodHabits.every((th) =>
        th.id === habit.id ? completed : nextLogs.some((l) => l.habit_id === th.id && l.log_date === selectedDate && l.completed)
      );
      if (completed && allCompletedNow && todaysGoodHabits.length > 0) triggerConfetti();
    }

    const debounceKey = `habit_${habit.id}_${selectedDate}`;
    if (debounceTimersRef.current[debounceKey]) clearTimeout(debounceTimersRef.current[debounceKey]);
    debounceTimersRef.current[debounceKey] = setTimeout(() => {
      syncOrQueue({
        table: 'habit_logs',
        action: 'upsert',
        payload: entry,
        onConflict: 'habit_id,log_date',
        dedupeKey: debounceKey
      });
      delete debounceTimersRef.current[debounceKey];
    }, 800);
  };

  const calculateGoodStreak = (habit) => {
    const freq = habit.frequency_days || [1, 2, 3, 4, 5, 6, 7];
    let streak = 0;
    for (let i = 0; i < 30; i++) {
      const d = addDays(selectedDate, -i);
      if (!freq.includes(getIsoDayOfWeek(d))) continue;
      const log = habitLogs.find((l) => l.habit_id === habit.id && l.log_date === d);
      if (log && log.completed) streak++;
      else if (i > 0) break;
    }
    return streak;
  };

  const calculateBadHabitCleanStreak = (habit) => {
    let cleanDays = 0;
    const createdDate = habit.created_at ? habit.created_at.slice(0, 10) : addDays(selectedDate, -7);
    for (let i = 0; i < 60; i++) {
      const d = addDays(selectedDate, -i);
      if (d < createdDate && i > 0) break;
      const log = habitLogs.find((l) => l.habit_id === habit.id && l.log_date === d);
      if (!(log && log.completed)) cleanDays++;
      else break;
    }
    return cleanDays;
  };

  const last7DaysHabitSeries = Array.from({ length: 7 }, (_, idx) => {
    const d = addDays(selectedDate, -(6 - idx));
    const iso = getIsoDayOfWeek(d);
    const scheduled = goodHabitsAll.filter((h) => (h.frequency_days || [1,2,3,4,5,6,7]).includes(iso));
    const completed = scheduled.filter((h) =>
      habitLogs.some((l) => l.habit_id === h.id && l.log_date === d && l.completed)
    ).length;
    const pct = scheduled.length ? Math.round((completed / scheduled.length) * 100) : 0;
    return {
      date: d,
      shortDay: DAY_LABELS.find((dl) => dl.iso === iso)?.short || '',
      dayNum: d.slice(8),
      pct
    };
  });

  const weeklyHabitAvgPct = Math.round(last7DaysHabitSeries.reduce((acc, item) => acc + item.pct, 0) / 7);

  const openCreateHabitModal = (defaultType = 'boolean') => {
    setEditingHabitId(null);
    setHabitForm({
      name: '', habit_type: defaultType, target_value: defaultType === 'numeric' ? '2500' : '1',
      unit: defaultType === 'numeric' ? 'ml' : '', frequency_days: [1, 2, 3, 4, 5, 6, 7], auto_trigger: 'none'
    });
    setShowHabitModal(true);
  };

  const openEditHabitModal = (h) => {
    setEditingHabitId(h.id);
    setHabitForm({
      name: h.name, habit_type: h.habit_type || 'boolean', target_value: String(h.target_value ?? 1),
      unit: h.unit || '', frequency_days: h.frequency_days || [1, 2, 3, 4, 5, 6, 7], auto_trigger: h.auto_trigger || 'none'
    });
    setShowHabitModal(true);
  };

  const handleSaveHabit = async (e) => {
    e.preventDefault();
    if (!habitForm.name.trim()) return;
    const payload = {
      id: editingHabitId || crypto.randomUUID(),
      name: habitForm.name.trim(),
      habit_type: habitForm.habit_type,
      target_value: Math.max(1, Number(habitForm.target_value) || 1),
      unit: habitForm.unit,
      frequency_days: habitForm.frequency_days.length ? habitForm.frequency_days : [1, 2, 3, 4, 5, 6, 7],
      auto_trigger: habitForm.auto_trigger,
      created_at: editingHabitId
        ? habits.find((x) => x.id === editingHabitId)?.created_at || new Date().toISOString()
        : new Date().toISOString()
    };

    if (editingHabitId) setHabits((prev) => prev.map((x) => (x.id === editingHabitId ? payload : x)));
    else setHabits((prev) => [...prev, payload]);
    setShowHabitModal(false);
    await syncOrQueue({ table: 'habits', action: 'upsert', payload: [payload], dedupeKey: `habit_def_${payload.id}` });
  };

  const handleDeleteHabit = async (id) => {
    setHabits((prev) => prev.filter((h) => h.id !== id));
    await syncOrQueue({ table: 'habits', action: 'delete', matchCol: 'id', matchVal: id });
  };

  const calc1RM = (weight, reps) => {
    const w = Number(weight) || 0, r = Number(reps) || 0;
    if (w <= 0 || r <= 0) return 0;
    return r === 1 ? w : Math.round(w * (1 + r / 30) * 10) / 10;
  };

  const getPreviousSetsForExercise = (exerciseId) => {
    const pastSets = allWorkoutSets.filter((s) => s.exercise_id === exerciseId && s.completed);
    if (!pastSets.length) return [];
    const lastWorkoutId = pastSets[pastSets.length - 1].workout_id;
    return pastSets.filter((s) => s.workout_id === lastWorkoutId);
  };

  const getProgressiveOverloadTip = (exerciseId) => {
    const prevSets = getPreviousSetsForExercise(exerciseId);
    if (!prevSets.length) return null;
    const topSet = prevSets.reduce((best, cur) => (Number(cur.weight_kg) >= Number(best.weight_kg) ? cur : best), prevSets[0]);
    const w = Number(topSet.weight_kg) || 0;
    const r = Number(topSet.reps) || 8;
    const lastRpe = exerciseRpe[exerciseId];
    if (w === 0) return null;

    if (lastRpe === 'hard') return { label: `RPE "Al Limite": consolida ${w}kg × ${r} rep`, nextWeight: String(w), nextReps: String(r) };
    if (lastRpe === 'easy') return { label: `RPE "Leggero": sali a ${w + 2.5}kg × ${r} rep`, nextWeight: String(w + 2.5), nextReps: String(r) };
    if (r >= 10) return { label: `Overload: ${w + 2.5}kg × ${Math.max(6, r - 2)}`, nextWeight: String(w + 2.5), nextReps: String(Math.max(6, r - 2)) };
    return { label: `Overload: ${w}kg × ${r + 1} rep`, nextWeight: String(w), nextReps: String(r + 1) };
  };

  const getHistoricalMax1RM = (exerciseId) => {
    const pastSets = allWorkoutSets.filter((s) => s.exercise_id === exerciseId && s.completed && s.set_type !== 'warmup');
    return pastSets.length ? Math.max(...pastSets.map((s) => Number(s.estimated_1rm || 0))) : 0;
  };

  const startWorkout = (routine = null) => {
    let workoutExercises = [];
    if (routine) {
      const rItems = routineExercises.filter((re) => re.routine_id === routine.id);
      workoutExercises = rItems.map((item) => {
        const exInfo = exercises.find((e) => e.id === item.exercise_id);
        const prevSets = getPreviousSetsForExercise(item.exercise_id);
        const isBodyweight = exInfo?.equipment === 'Corpo Libero';
        const defaultRepNum = String(item.target_reps || '8').split('-')[0].trim() || '8';

        const sets = Array.from({ length: Number(item.target_sets) || 3 }, (_, idx) => ({
          set_number: idx + 1,
          set_type: 'normal',
          weight_kg: prevSets[idx] && Number(prevSets[idx].weight_kg) > 0 ? String(prevSets[idx].weight_kg) : '',
          reps: prevSets[idx] ? String(prevSets[idx].reps) : defaultRepNum,
          completed: false,
          is_pr: false
        }));
        return {
          exercise_id: item.exercise_id,
          name: exInfo ? exInfo.name : 'Esercizio',
          target_reps_label: item.target_reps || '8-10',
          is_bodyweight: isBodyweight,
          rest_seconds: Number(item.rest_seconds) || 90,
          rpe_feedback: exerciseRpe[item.exercise_id] || 'good',
          sets
        };
      });
    }
    setActiveWorkout({
      routine_id: routine ? routine.id : null,
      name: routine ? routine.name : 'Allenamento Libero',
      exercises: workoutExercises
    });
    setActiveTab('forza');
    setForzaSubTab('workout');
  };

  const addExerciseToActiveWorkout = (exerciseId) => {
    const exInfo = exercises.find((e) => e.id === exerciseId);
    if (!exInfo || !activeWorkout) return;
    const prevSets = getPreviousSetsForExercise(exerciseId);
    setActiveWorkout({
      ...activeWorkout,
      exercises: [
        ...activeWorkout.exercises,
        {
          exercise_id: exInfo.id,
          name: exInfo.name,
          target_reps_label: '8-10',
          is_bodyweight: exInfo.equipment === 'Corpo Libero',
          rest_seconds: 90,
          rpe_feedback: exerciseRpe[exInfo.id] || 'good',
          sets: [{
            set_number: 1,
            set_type: 'normal',
            weight_kg: prevSets[0] && Number(prevSets[0].weight_kg) > 0 ? String(prevSets[0].weight_kg) : '',
            reps: prevSets[0] ? String(prevSets[0].reps) : '',
            completed: false,
            is_pr: false
          }]
        }
      ]
    });
  };

  const toggleSetComplete = (exIndex, setIndex) => {
    const updated = { ...activeWorkout };
    const exBlock = updated.exercises[exIndex];
    const currentSet = exBlock.sets[setIndex];
    currentSet.completed = !currentSet.completed;
    if (currentSet.completed) {
      const current1RM = calc1RM(currentSet.weight_kg, currentSet.reps);
      const bestPast1RM = getHistoricalMax1RM(exBlock.exercise_id);
      if (currentSet.set_type !== 'warmup' && current1RM > bestPast1RM && current1RM > 0) {
        currentSet.is_pr = true;
        setPrBanner(`Nuovo record • ${exBlock.name}`);
        setTimeout(() => setPrBanner(null), 3500);
      }
      startRestCountdown(exBlock.rest_seconds || 90);
    } else {
      currentSet.is_pr = false;
    }
    setActiveWorkout(updated);
  };

  const setExerciseRpeFeedback = (exIndex, rpeLevel) => {
    const updated = { ...activeWorkout };
    const exBlock = updated.exercises[exIndex];
    exBlock.rpe_feedback = rpeLevel;
    setActiveWorkout(updated);
    setExerciseRpe((prev) => ({ ...prev, [exBlock.exercise_id]: rpeLevel }));
  };

  const cycleSetType = (exIndex, setIndex) => {
    const order = ['normal', 'warmup', 'dropset', 'failure'];
    const updated = { ...activeWorkout };
    const current = updated.exercises[exIndex].sets[setIndex].set_type;
    updated.exercises[exIndex].sets[setIndex].set_type = order[(order.indexOf(current) + 1) % order.length];
    setActiveWorkout(updated);
  };

  const finishAndSaveWorkout = async () => {
    if (!activeWorkout) return;
    triggerConfetti();
    const newWorkoutObj = {
      id: crypto.randomUUID(), routine_id: activeWorkout.routine_id, name: activeWorkout.name,
      workout_date: selectedDate, duration_minutes: 0, completed: true, created_at: new Date().toISOString()
    };
    const setsToInsert = [];
    activeWorkout.exercises.forEach((ex) => {
      ex.sets.forEach((s, idx) => {
        if (s.completed) {
          setsToInsert.push({
            id: crypto.randomUUID(), workout_id: newWorkoutObj.id, exercise_id: ex.exercise_id,
            set_number: idx + 1, set_type: s.set_type,
            weight_kg: ex.is_bodyweight ? 0 : (Number(s.weight_kg) || 0),
            reps: Number(s.reps) || 0,
            estimated_1rm: ex.is_bodyweight ? 0 : calc1RM(s.weight_kg, s.reps),
            is_pr: s.is_pr, completed: true
          });
        }
      });
    });
    setWorkouts((prev) => [newWorkoutObj, ...prev]);
    setAllWorkoutSets((prev) => [...prev, ...setsToInsert]);

    await syncOrQueue({ table: 'workouts', action: 'insert', payload: [newWorkoutObj] });
    if (setsToInsert.length > 0) await syncOrQueue({ table: 'workout_sets', action: 'insert', payload: setsToInsert });
    await triggerHabitAutomation('workout_done');
    setActiveWorkout(null);
    setRestTimer({ active: false, remaining: 90, total: 90, endTime: null });
  };

  const openCreateExerciseModal = () => {
    setEditingExerciseId(null);
    setExerciseForm({ name: '', primary_muscles: ['Petto'], secondary_muscles: [], equipment: 'Bilanciere' });
    setShowExerciseModal(true);
  };

  const openEditExerciseModal = (ex) => {
    setEditingExerciseId(ex.id);
    setExerciseForm({
      name: ex.name,
      primary_muscles: parsePrimaryMuscles(ex),
      secondary_muscles: Array.isArray(ex.secondary_muscles) ? ex.secondary_muscles : [],
      equipment: ex.equipment || 'Bilanciere'
    });
    setShowExerciseModal(true);
  };

  const handleSaveExercise = async (e) => {
    e.preventDefault();
    if (!exerciseForm.name.trim()) return;
    const exId = editingExerciseId || crypto.randomUUID();
    const prims = exerciseForm.primary_muscles.length ? exerciseForm.primary_muscles : ['Petto'];
    const secs = exerciseForm.secondary_muscles.filter((m) => !prims.includes(m));

    const fullExObj = {
      id: exId,
      name: exerciseForm.name.trim(),
      muscle_group: prims.join(', '),
      primary_muscles: prims,
      secondary_muscles: secs,
      equipment: exerciseForm.equipment,
      created_at: new Date().toISOString()
    };

    if (editingExerciseId) setExercises((prev) => prev.map((x) => (x.id === editingExerciseId ? fullExObj : x)));
    else setExercises((prev) => [...prev, fullExObj]);
    setEditingExerciseId(null);
    setExerciseForm({ name: '', primary_muscles: ['Petto'], secondary_muscles: [], equipment: 'Bilanciere' });

    await syncOrQueue({
      table: 'exercises',
      action: 'upsert',
      payload: [{ id: fullExObj.id, name: fullExObj.name, muscle_group: fullExObj.muscle_group, equipment: fullExObj.equipment }],
      dedupeKey: `ex_${fullExObj.id}`
    });
  };

  const handleDeleteExercise = async (id) => {
    setExercises((prev) => prev.filter((x) => x.id !== id));
    await syncOrQueue({ table: 'exercises', action: 'delete', matchCol: 'id', matchVal: id });
  };

  const handleOpenEditRoutine = (r) => {
    const rItems = routineExercises
      .filter((re) => re.routine_id === r.id)
      .map((re) => {
        const exObj = exercises.find((e) => e.id === re.exercise_id);
        return {
          exercise_id: re.exercise_id,
          name: exObj ? exObj.name : 'Esercizio',
          muscle_group: exObj ? parsePrimaryMuscles(exObj).join(', ') : 'Petto',
          primary_muscles: exObj ? parsePrimaryMuscles(exObj) : ['Petto'],
          secondary_muscles: exObj?.secondary_muscles || [],
          equipment: exObj ? exObj.equipment : 'Bilanciere',
          target_sets: re.target_sets || 3,
          target_reps: re.target_reps || '8-10',
          rest_seconds: re.rest_seconds || 90,
          note: ''
        };
      });
    setEditingRoutine({ id: r.id, name: r.name, description: r.description || '', items: rItems });
    setForzaSubTab('builder');
  };

  const saveRoutineHelper = async (existingId, name, description, items) => {
    const routineId = existingId || crypto.randomUUID();
    const routineObj = {
      id: routineId,
      name,
      description: description || '',
      created_at: existingId
        ? routines.find((x) => x.id === existingId)?.created_at || new Date().toISOString()
        : new Date().toISOString()
    };
    let updatedExercises = [...exercises];
    const newExercisesForCloud = [];

    const itemsPayload = items.map((it, idx) => {
      let exId = it.exercise_id;
      if (exId && !updatedExercises.some((e) => e.id === exId)) exId = null;

      if (!exId && it.name) {
        const found = updatedExercises.find((e) => e.name.trim().toLowerCase() === it.name.trim().toLowerCase());
        if (found) {
          exId = found.id;
        } else {
          const prims = Array.isArray(it.primary_muscles) && it.primary_muscles.length
            ? it.primary_muscles
            : parsePrimaryMuscles(it);
          const createdEx = {
            id: crypto.randomUUID(),
            name: it.name.trim(),
            muscle_group: prims.join(', '),
            primary_muscles: prims,
            secondary_muscles: it.secondary_muscles || [],
            equipment: it.equipment || 'Manubri',
            created_at: new Date().toISOString()
          };
          updatedExercises.push(createdEx);
          newExercisesForCloud.push({ id: createdEx.id, name: createdEx.name, muscle_group: createdEx.muscle_group, equipment: createdEx.equipment });
          exId = createdEx.id;
        }
      }

      return {
        id: crypto.randomUUID(),
        routine_id: routineId,
        exercise_id: exId || updatedExercises[idx % updatedExercises.length].id,
        order_index: idx + 1,
        target_sets: Number(it.target_sets) || 3,
        target_reps: String(it.target_reps || '8-10'),
        rest_seconds: Number(it.rest_seconds) || 90
      };
    });

    setExercises(updatedExercises);

    if (existingId) {
      setRoutines((prev) => prev.map((r) => (r.id === existingId ? routineObj : r)));
      setRoutineExercises((prev) => [...prev.filter((re) => re.routine_id !== existingId), ...itemsPayload]);
    } else {
      setRoutines((prev) => [...prev, routineObj]);
      setRoutineExercises((prev) => [...prev, ...itemsPayload]);
    }

    if (newExercisesForCloud.length > 0) await syncOrQueue({ table: 'exercises', action: 'upsert', payload: newExercisesForCloud });
    await syncOrQueue({ table: 'routines', action: 'upsert', payload: [routineObj], dedupeKey: `rout_${routineId}` });
    if (existingId) await syncOrQueue({ table: 'routine_exercises', action: 'delete', matchCol: 'routine_id', matchVal: existingId });
    await syncOrQueue({ table: 'routine_exercises', action: 'insert', payload: itemsPayload });
  };

  const handleDeleteRoutine = async (routineId) => {
    setRoutines((prev) => prev.filter((r) => r.id !== routineId));
    setRoutineExercises((prev) => prev.filter((re) => re.routine_id !== routineId));
    await syncOrQueue({ table: 'routine_exercises', action: 'delete', matchCol: 'routine_id', matchVal: routineId });
    await syncOrQueue({ table: 'routines', action: 'delete', matchCol: 'id', matchVal: routineId });
  };

  const handleAddCardio = async (e) => {
    e.preventDefault();
    const entry = {
      id: crypto.randomUUID(), log_date: selectedDate, activity_name: cardioForm.activity_name,
      duration_minutes: Number(cardioForm.duration_minutes) || 0, distance_km: Number(cardioForm.distance_km || 0),
      calories_burned: Number(cardioForm.calories_burned) || 0
    };
    setCardioLogs((prev) => [entry, ...prev]);
    await syncOrQueue({ table: 'cardio_logs', action: 'insert', payload: [entry] });
  };

  const handleDeleteCardio = async (id) => {
    setCardioLogs((prev) => prev.filter((c) => c.id !== id));
    await syncOrQueue({ table: 'cardio_logs', action: 'delete', matchCol: 'id', matchVal: id });
  };

  const handleSaveBodyMetrics = async (e) => {
    e.preventDefault();
    const entry = {
      id: crypto.randomUUID(), log_date: selectedDate,
      weight_kg: bodyForm.weight_kg ? Number(bodyForm.weight_kg) : null,
      waist_cm: bodyForm.waist_cm ? Number(bodyForm.waist_cm) : null,
      chest_cm: bodyForm.chest_cm ? Number(bodyForm.chest_cm) : null,
      arm_cm: bodyForm.arm_cm ? Number(bodyForm.arm_cm) : null,
      thigh_cm: bodyForm.thigh_cm ? Number(bodyForm.thigh_cm) : null,
      body_fat_pct: bodyForm.body_fat_pct ? Number(bodyForm.body_fat_pct) : null
    };
    setBodyMetrics((prev) => [entry, ...prev.filter((b) => b.log_date !== selectedDate)]);
    await syncOrQueue({ table: 'body_metrics', action: 'upsert', payload: entry, onConflict: 'log_date', dedupeKey: `body_${selectedDate}` });
  };

  const searchOpenFoodFacts = async () => {
    if (!searchQuery.trim()) return;
    setSearchingOff(true);
    try {
      const res = await fetch(`https://it.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(searchQuery)}&search_simple=1&action=process&json=1&page_size=10`);
      const data = await res.json();
      setOffResults((data.products || []).map((p) => {
        const n = p.nutriments || {};
        return {
          name: p.product_name || 'Prodotto', brand: p.brands || '', barcode: p.code || '',
          kcal_100g: Math.round(n['energy-kcal_100g'] || 0),
          protein_100g: Math.round((n.proteins_100g || 0) * 10) / 10,
          carbs_100g: Math.round((n.carbohydrates_100g || 0) * 10) / 10,
          fat_100g: Math.round((n.fat_100g || 0) * 10) / 10
        };
      }));
    } catch {}
    setSearchingOff(false);
  };

  const logFoodItem = async (foodObj, grams, mealType = foodModal.meal_type) => {
    const g = Number(grams) || 100;
    const ratio = g / 100;
    const entry = {
      id: crypto.randomUUID(), log_date: selectedDate, meal_type: mealType,
      food_name: foodObj.brand ? `${foodObj.name} (${foodObj.brand})` : foodObj.name,
      grams: g, kcal: Math.round(foodObj.kcal_100g * ratio),
      protein: Math.round(foodObj.protein_100g * ratio * 10) / 10,
      carbs: Math.round(foodObj.carbs_100g * ratio * 10) / 10,
      fat: Math.round(foodObj.fat_100g * ratio * 10) / 10
    };
    setFoodLogs((prev) => [...prev, entry]);
    setFoodModal({ ...foodModal, open: false });
    await syncOrQueue({ table: 'food_logs', action: 'insert', payload: [entry] });
  };

  const logDirectMealEntry = async (est, mealType = foodModal.meal_type) => {
    const entry = {
      id: crypto.randomUUID(),
      log_date: selectedDate,
      meal_type: mealType,
      food_name: est.food_name,
      grams: Number(est.grams || 100),
      kcal: Math.round(Number(est.kcal || 0)),
      protein: Math.round(Number(est.protein || 0) * 10) / 10,
      carbs: Math.round(Number(est.carbs || 0) * 10) / 10,
      fat: Math.round(Number(est.fat || 0) * 10) / 10
    };
    setFoodLogs((prev) => [...prev, entry]);
    setFoodModal((prev) => ({ ...prev, open: false }));
    await syncOrQueue({ table: 'food_logs', action: 'insert', payload: [entry] });
  };

  const copyMealFromYesterday = async (mealType) => {
    const yesterday = addDays(selectedDate, -1);
    const yesterdayItems = foodLogs.filter((f) => f.log_date === yesterday && f.meal_type === mealType);
    if (!yesterdayItems.length) { alert(`Nessun alimento registrato ieri per ${mealType}.`); return; }
    const payload = yesterdayItems.map((item) => ({ ...item, id: crypto.randomUUID(), log_date: selectedDate }));
    setFoodLogs((prev) => [...prev, ...payload]);
    await syncOrQueue({ table: 'food_logs', action: 'insert', payload });
  };

  const addNewFoodToDb = async (formObj) => {
    const newFood = {
      id: crypto.randomUUID(), name: formObj.name.trim(), brand: formObj.brand ? formObj.brand.trim() : '', barcode: formObj.barcode || null,
      kcal_100g: Number(formObj.kcal_100g) || 0, protein_100g: Number(formObj.protein_100g) || 0,
      carbs_100g: Number(formObj.carbs_100g) || 0, fat_100g: Number(formObj.fat_100g) || 0
    };
    setFoodsDb((prev) => [...prev, newFood]);
    await syncOrQueue({ table: 'foods', action: 'insert', payload: [newFood] });
    return newFood;
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    const cleanSettings = {
      kcal_on: Number(settings.kcal_on) || 2600,
      protein_on: Number(settings.protein_on) || 180,
      carbs_on: Number(settings.carbs_on) || 320,
      fat_on: Number(settings.fat_on) || 65,
      kcal_off: Number(settings.kcal_off) || 2100,
      protein_off: Number(settings.protein_off) || 180,
      carbs_off: Number(settings.carbs_off) || 200,
      fat_off: Number(settings.fat_off) || 65
    };
    setSettings(cleanSettings);
    saveLocal('settings', cleanSettings);
    await syncOrQueue({ table: 'user_settings', action: 'upsert', payload: { ...cleanSettings, id: 1 }, dedupeKey: 'user_settings_1' });
    setShowDietTargetsPanel(false);
    alert('Target Giorno ON / OFF salvati!');
  };

  const weekDays = getWeekDays(selectedDate);

  const todaysWorkoutIds = new Set(workoutsToday.map((w) => w.id));
  const todaysCompletedSets = allWorkoutSets.filter((s) => todaysWorkoutIds.has(s.workout_id) && s.completed);
  const todaysExercisesSummary = [];
  if (activeWorkout && hasCompletedSetInActive && activeWorkout.exercises.length > 0) {
    activeWorkout.exercises.forEach((ex) => {
      todaysExercisesSummary.push({
        name: ex.name,
        detail: `${ex.sets.filter((s) => s.completed).length}/${ex.sets.length} serie completate (In corso)`
      });
    });
  } else {
    const seenEx = new Set();
    todaysCompletedSets.forEach((s) => {
      if (!seenEx.has(s.exercise_id)) {
        seenEx.add(s.exercise_id);
        const exObj = exercises.find((e) => e.id === s.exercise_id);
        const setsForEx = todaysCompletedSets.filter((x) => x.exercise_id === s.exercise_id);
        todaysExercisesSummary.push({
          name: exObj ? exObj.name : 'Esercizio',
          detail: setsForEx.map((x) => `${x.weight_kg > 0 ? `${x.weight_kg}kg×` : ''}${x.reps}`).join(' • ')
        });
      }
    });
  }

  const { cardMain, cardSub, pillSurface, pastelPeach, pastelMint, pastelLavender, pastelBlue, pastelRose } = getTheme(darkMode);
  const displayedGoodHabits = showAllDaysHabits ? goodHabitsAll : todaysGoodHabits;
  const restPct = restTimer.total > 0 ? Math.min(100, Math.max(0, (restTimer.remaining / restTimer.total) * 100)) : 0;

  return (
    <div className={`${darkMode ? 'bg-[#121215] text-zinc-100' : 'bg-[#F3EFEA] text-[#18181D]'} min-h-screen pb-32 font-sans transition-colors duration-300`}>
      <style>{`
        @keyframes fadeSlideUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .tab-animate { animation: fadeSlideUp 0.28s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
        .spring-btn { transition: transform 0.22s cubic-bezier(0.34, 1.56, 0.64, 1), background-color 0.2s ease; }
        .spring-btn:active { transform: scale(0.91); }
        @keyframes confettiFall { 0% { transform: translateY(0) rotate(0deg) scale(1); opacity: 1; } 100% { transform: translateY(95vh) rotate(540deg) scale(0.7); opacity: 0; } }
        .animate-confetti { animation-name: confettiFall; animation-timing-function: cubic-bezier(0.25, 0.46, 0.45, 0.94); animation-fill-mode: forwards; }
      `}</style>

      <PastelConfetti active={confettiActive} />

      {refreshToast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-[#18181D] text-[#6EE7B7] text-xs font-semibold px-4 py-2 rounded-full shadow-xl">
          {refreshToast}
        </div>
      )}

      {/* Notifica sobria Nuovo Record */}
      {prBanner && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[60] bg-[#18181D]/95 text-zinc-100 border border-white/10 text-xs font-semibold px-4 py-2.5 rounded-2xl shadow-xl backdrop-blur-md flex items-center gap-2.5 tab-animate">
          <Trophy className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{prBanner}</span>
        </div>
      )}

      {/* Timer di Recupero in Primo Piano davanti alla schermata corrente */}
      {restTimer.active && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-5">
          <div className={`${cardMain} border rounded-[36px] p-7 w-full max-w-sm shadow-2xl space-y-5 text-center tab-animate`}>
            <div className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider text-[#F97316]">
              <Timer className="w-4 h-4" />
              <span>Recupero Serie</span>
            </div>

            <p className="text-6xl font-bold tracking-tight font-mono leading-none">
              {formatSeconds(restTimer.remaining)}
            </p>

            <div className={`w-full ${darkMode ? 'bg-zinc-800' : 'bg-black/5'} h-2.5 rounded-full overflow-hidden`}>
              <div
                style={{ width: `${restPct}%` }}
                className="h-full rounded-full bg-gradient-to-r from-[#FDBA74] to-[#F97316] transition-all duration-300"
              />
            </div>

            <div className="flex items-center justify-center gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => adjustRestCountdown(-15)}
                className={`px-4 py-2.5 ${cardSub} rounded-full text-xs font-bold cursor-pointer spring-btn`}
              >
                -15s
              </button>
              <button
                type="button"
                onClick={() => adjustRestCountdown(15)}
                className={`px-4 py-2.5 ${cardSub} rounded-full text-xs font-bold cursor-pointer spring-btn`}
              >
                +15s
              </button>
              <button
                type="button"
                onClick={() => setRestTimer({ active: false, remaining: 90, total: 90, endTime: null })}
                className="px-6 py-2.5 bg-[#F97316] text-white font-bold rounded-full text-xs cursor-pointer shadow-sm spring-btn"
              >
                Salta
              </button>
            </div>
          </div>
        </div>
      )}

      <header className="max-w-3xl mx-auto px-5 pt-6 pb-3">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0 flex items-center gap-2.5 flex-wrap">
            <h1 className="text-2xl font-bold tracking-tight whitespace-nowrap leading-none">{dailyGreeting}</h1>
            <span
              className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold inline-flex items-center gap-1 whitespace-nowrap ${
                syncQueue.length > 0 ? 'bg-[#FFEDD5] text-[#9A3412]' : cloudConnected ? 'bg-[#DCFCE7] text-[#065F46]' : 'bg-black/10 text-zinc-500'
              }`}
            >
              {syncQueue.length > 0 ? (
                <><RefreshCw className="w-2.5 h-2.5" /> In coda ({syncQueue.length})</>
              ) : cloudConnected ? (
                <><Cloud className="w-2.5 h-2.5" /> Sync</>
              ) : (
                <><CloudOff className="w-2.5 h-2.5" /> Locale</>
              )}
            </span>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button onClick={() => setDarkMode(!darkMode)} title="Cambia Tema Chiaro / Scuro" className={`w-10 h-10 rounded-full ${cardMain} border flex items-center justify-center shadow-sm cursor-pointer shrink-0 spring-btn`}>
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-[#8B5CF6]" />}
            </button>

            <button
              onClick={() => handleManualRefresh(true)}
              onDoubleClick={() => window.location.reload()}
              title="Tocca per aggiornare i dati"
              className={`w-10 h-10 rounded-full ${darkMode ? 'bg-white text-[#18181D]' : 'bg-[#18181D] text-white'} flex items-center justify-center shadow-md cursor-pointer shrink-0 spring-btn`}
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        <div className={`mt-5 ${cardMain} rounded-[28px] p-3 shadow-sm border`}>
          <div className="flex items-center justify-between px-2 mb-2">
            <button onClick={() => setSelectedDate(addDays(selectedDate, -7))} className="p-1 text-zinc-400 hover:opacity-80"><ChevronLeft className="w-4 h-4" /></button>
            <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="bg-transparent text-xs font-semibold text-zinc-500 outline-none cursor-pointer" />
            <button onClick={() => setSelectedDate(addDays(selectedDate, 7))} className="p-1 text-zinc-400 hover:opacity-80"><ChevronRight className="w-4 h-4" /></button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center">
            {weekDays.map((wd) => (
              <button key={wd.date} onClick={() => setSelectedDate(wd.date)} className="flex flex-col items-center py-1 cursor-pointer spring-btn">
                <span className="text-[10px] font-medium text-zinc-400 mb-1">{wd.label}</span>
                <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition ${wd.date === selectedDate ? 'bg-[#8B5CF6] text-white shadow-sm' : 'hover:opacity-75'}`}>
                  {wd.dayNum}
                </span>
              </button>
            ))}
          </div>
        </div>
      </header>

      <main key={activeTab} className="max-w-3xl mx-auto px-5 pt-2 space-y-5 tab-animate">
        {/* ==========================================
            TAB 1: DASHBOARD (OGGI)
           ========================================== */}
        {activeTab === 'dashboard' && (
          <div className="space-y-5">
            <div className={`${pastelLavender} rounded-[32px] p-5 shadow-2xs border flex items-center justify-between gap-4`}>
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${darkMode ? 'bg-purple-950 text-[#C4B5FD]' : 'bg-white text-[#6D28D9]'}`}>
                    Readiness {readinessScore}%
                  </span>
                  <span className="text-xs opacity-75 font-semibold">Briefing del Giorno</span>
                </div>
                <p className="text-sm font-semibold leading-snug pt-0.5">{briefingText}</p>
              </div>
              <div className="relative flex items-center justify-center shrink-0">
                <CircularGauge percentage={readinessScore} color="#8B5CF6" darkMode={darkMode} size={56} />
                <span className="absolute text-xs font-bold">{readinessScore}%</span>
              </div>
            </div>

            <div className={`${cardMain} rounded-[36px] p-6 shadow-sm border space-y-5`}>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold tracking-tight">Riepilogo Giornaliero</h2>
                  <span className={`inline-block mt-1 px-3 py-0.5 rounded-full text-xs font-bold border ${isTrainingDay ? pastelPeach : pastelMint}`}>
                    {isTrainingDay ? '🔥 Giorno ON • Allenamento Attivo' : '🌿 Giorno OFF • Riposo Automatico'}
                  </span>
                </div>
                <button onClick={() => setActiveTab('mfp')} className={`w-10 h-10 rounded-full ${pastelPeach} border flex items-center justify-center text-lg font-bold cursor-pointer spring-btn`}>
                  +
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div onClick={() => setActiveTab('mfp')} className={`${pastelPeach} border rounded-[28px] p-4 flex flex-col justify-between cursor-pointer spring-btn`}>
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-semibold leading-snug opacity-85">Calorie<br />assunte</span>
                    <CircularGauge percentage={(totals.kcal / (currentTargets.kcal || 1)) * 100} color="#F97316" darkMode={darkMode} />
                  </div>
                  <div className="mt-5">
                    <p className="text-3xl font-bold tracking-tight"><AnimatedNumber value={totals.kcal} /></p>
                    <p className="text-[11px] opacity-75">su {currentTargets.kcal} kcal</p>
                  </div>
                </div>

                <div onClick={() => setActiveTab('todo')} className={`${pastelMint} border rounded-[28px] p-4 flex flex-col justify-between cursor-pointer spring-btn`}>
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-semibold leading-snug opacity-85">Routine<br />completate</span>
                    <CircularGauge percentage={todaysGoodHabits.length ? (doneHabitsCount / todaysGoodHabits.length) * 100 : 0} color="#10B981" darkMode={darkMode} />
                  </div>
                  <div className="mt-5">
                    <p className="text-3xl font-bold tracking-tight">{doneHabitsCount}/{todaysGoodHabits.length}</p>
                    <p className="text-[11px] opacity-75">previste per oggi</p>
                  </div>
                </div>
              </div>

              <div onClick={() => setActiveTab('mfp')} className={`${cardSub} rounded-[28px] p-5 space-y-4 cursor-pointer`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-500 font-bold">Bilancio Macronutrienti</span>
                  <span className={`text-xs font-bold px-3 py-0.5 rounded-full border ${pastelMint}`}>
                    <AnimatedNumber value={Math.max(0, currentTargets.kcal - totals.kcal)} /> kcal rimanenti
                  </span>
                </div>

                {[
                  { label: 'Proteine', val: Math.round(totals.protein), goal: currentTargets.protein, barColor: 'bg-gradient-to-r from-[#34D399] to-[#10B981]', badgeBg: pastelMint },
                  { label: 'Carboidrati', val: Math.round(totals.carbs), goal: currentTargets.carbs, barColor: 'bg-gradient-to-r from-[#FDBA74] to-[#F97316]', badgeBg: pastelPeach },
                  { label: 'Grassi', val: Math.round(totals.fat), goal: currentTargets.fat, barColor: 'bg-gradient-to-r from-[#C4B5FD] to-[#8B5CF6]', badgeBg: pastelLavender }
                ].map((m) => {
                  const pct = Math.min(100, Math.max(6, (m.val / (m.goal || 1)) * 100));
                  return (
                    <div key={m.label} className="space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold">{m.label}</span>
                        <span className={`font-bold px-2.5 py-0.5 rounded-full text-[11px] border ${m.badgeBg}`}>{m.val} / {m.goal}g</span>
                      </div>
                      <div className={`w-full ${darkMode ? 'bg-zinc-800' : 'bg-black/5'} h-3.5 rounded-full overflow-hidden p-0.5`}>
                        <div style={{ width: `${pct}%` }} className={`${m.barColor} h-full rounded-full transition-all duration-700 ease-out`} />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className={`${cardSub} rounded-[28px] p-5 space-y-3`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold flex items-center gap-1.5">
                    <Utensils className="w-3.5 h-3.5 text-[#F97316]" /> Dieta di Oggi
                  </span>
                  <button onClick={() => setActiveTab('mfp')} className="text-xs text-[#8B5CF6] font-bold hover:underline">Apri Diario</button>
                </div>
                {todayFoods.length === 0 ? (
                  <p className="text-xs text-zinc-400">Nessun pasto ancora registrato oggi. Tocca per aprire il tuo diario o la tua tabella dieta.</p>
                ) : (
                  <div className="space-y-1.5 text-xs">
                    {todayFoods.map((item) => (
                      <div key={item.id} className={`flex items-center justify-between px-3 py-2 rounded-2xl ${pillSurface}`}>
                        <span className="truncate pr-2"><strong className="capitalize text-[#8B5CF6]">{item.meal_type}:</strong> {item.food_name}</span>
                        <span className="font-bold shrink-0">{item.kcal} kcal</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {todaysExercisesSummary.length > 0 && (
                <div className={`${pastelPeach} border rounded-[28px] p-5 space-y-3`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold flex items-center gap-1.5"><Dumbbell className="w-3.5 h-3.5" /> Esercizi Svolti Oggi in Palestra</span>
                    <button onClick={() => setActiveTab('forza')} className="text-xs font-bold underline">Dettagli</button>
                  </div>
                  <div className="space-y-1.5 text-xs">
                    {todaysExercisesSummary.map((ex, i) => (
                      <div key={i} className={`flex items-center justify-between px-3 py-2 rounded-2xl ${pillSurface}`}>
                        <span className="font-bold">{ex.name}</span>
                        <span className="text-[11px] opacity-75">{ex.detail}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <WaterGlassesWidget waterMl={currentWaterMl} targetMl={targetWaterMl} onChangeWater={handleWaterUpdate} darkMode={darkMode} />

              <div onClick={() => { setActiveTab('forza'); setForzaSubTab('body'); }} className={`${pastelBlue} border rounded-3xl p-4 flex items-center justify-between gap-3 cursor-pointer spring-btn`}>
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className={`w-10 h-10 rounded-2xl ${pillSurface} flex items-center justify-center shrink-0 shadow-2xs`}>
                    <Scale className="w-5 h-5 text-[#0EA5E9]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold">Peso Corporeo</p>
                    <p className="text-xs opacity-75">Tocca per aggiornare peso e circonferenze</p>
                  </div>
                </div>
                <span className={`min-w-[76px] px-3.5 py-2 rounded-full ${pillSurface} text-xs font-bold shadow-2xs inline-flex items-center justify-center text-center whitespace-nowrap shrink-0`}>
                  {bodyMetrics[0]?.weight_kg ? `${bodyMetrics[0].weight_kg} kg` : '-- kg'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ==========================================
            TAB 2: ROUTINE (CON DIAGRAMMA CARTESIANO)
           ========================================== */}
        {activeTab === 'todo' && (
          <div className="space-y-5">
            <div className={`${cardMain} rounded-[36px] p-6 shadow-sm border space-y-5`}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="text-xl font-bold">Routine del Giorno</h2>
                  <p className="text-xs text-zinc-400">Giorno selezionato: <strong>{DAY_LABELS.find((d) => d.iso === currentIsoDay)?.full}</strong></p>
                </div>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => setShowAllDaysHabits(!showAllDaysHabits)} className={`px-3 py-2 rounded-full ${cardSub} text-xs font-semibold flex items-center gap-1 cursor-pointer`}>
                    <Calendar className="w-3.5 h-3.5 text-[#8B5CF6]" />
                    {showAllDaysHabits ? 'Solo di oggi' : 'Mostra tutte'}
                  </button>
                  <button onClick={() => openCreateHabitModal('boolean')} className="w-10 h-10 rounded-full bg-[#10B981] text-white flex items-center justify-center shadow cursor-pointer spring-btn">
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {displayedGoodHabits.map((h, idx) => {
                  const log = habitLogs.find((l) => l.habit_id === h.id && l.log_date === selectedDate);
                  const val = log ? Number(log.current_value) : 0;
                  const done = log ? log.completed : false;
                  const streak = calculateGoodStreak(h);
                  const isTimerOpen = focusTimer.habitId === h.id;
                  const draftKey = `${h.id}_${selectedDate}`;
                  const displayInputVal = numericDrafts[draftKey] !== undefined ? numericDrafts[draftKey] : String(val);
                  const freqDays = h.frequency_days || [1, 2, 3, 4, 5, 6, 7];

                  return (
                    <div key={h.id} className={`rounded-[28px] p-4 space-y-3 transition-all border ${done ? pastelMint : `${cardSub} border-transparent`}`}>
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="flex flex-col gap-1">
                            <button type="button" disabled={idx === 0} onClick={() => moveHabitOrder(h.id, -1, displayedGoodHabits)} className={`p-1 rounded-lg ${pillSurface} ${idx === 0 ? 'opacity-30' : 'hover:opacity-100 cursor-pointer'}`}>
                              <ArrowUp className="w-3 h-3" />
                            </button>
                            <button type="button" disabled={idx === displayedGoodHabits.length - 1} onClick={() => moveHabitOrder(h.id, 1, displayedGoodHabits)} className={`p-1 rounded-lg ${pillSurface} ${idx === displayedGoodHabits.length - 1 ? 'opacity-30' : 'hover:opacity-100 cursor-pointer'}`}>
                              <ArrowDown className="w-3 h-3" />
                            </button>
                          </div>

                          <button onClick={() => updateHabitProgress(h, done ? 0 : h.target_value)} className={`w-10 h-10 rounded-2xl flex items-center justify-center transition cursor-pointer spring-btn ${done ? 'bg-[#10B981] text-white shadow-xs' : `${pillSurface} text-zinc-400`}`}>
                            <Check className="w-5 h-5" />
                          </button>
                          <div>
                            <p className={`font-bold text-sm ${done ? 'line-through opacity-75' : ''}`}>{h.name}</p>
                            <div className="flex flex-wrap items-center gap-2 mt-0.5">
                              <span className="text-xs opacity-75">🔥 Streak: {streak}</span>
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-black/5 text-zinc-500 font-semibold">
                                {freqDays.length === 7 ? 'Ogni giorno' : DAY_LABELS.filter((dl) => freqDays.includes(dl.iso)).map((dl) => dl.full).join(' • ')}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setFocusTimer((prev) =>
                                prev.habitId === h.id
                                  ? { ...prev, habitId: null, running: false, endTime: null }
                                  : { habitId: h.id, remaining: 900, total: 900, running: false, endTime: null }
                              );
                            }}
                            className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 cursor-pointer spring-btn ${isTimerOpen ? 'bg-[#8B5CF6] text-white' : `${pillSurface} text-[#8B5CF6]`}`}
                          >
                            <Timer className="w-3.5 h-3.5" /> Focus
                          </button>

                          {h.habit_type === 'numeric' && (
                            <div className={`flex items-center gap-1 ${pillSurface} px-2.5 py-1 rounded-full text-xs font-bold`}>
                              <button
                                type="button"
                                onClick={() => {
                                  const nextV = Math.max(0, val - (h.target_value >= 1000 ? 250 : 1));
                                  setNumericDrafts((prev) => ({ ...prev, [draftKey]: String(nextV) }));
                                  updateHabitProgress(h, nextV);
                                }}
                                className="px-1.5 text-sm"
                              >
                                -
                              </button>
                              <input
                                type="number"
                                value={displayInputVal}
                                onChange={(e) => {
                                  const raw = e.target.value;
                                  setNumericDrafts((prev) => ({ ...prev, [draftKey]: raw }));
                                  if (raw !== '') updateHabitProgress(h, Number(raw));
                                }}
                                onBlur={() => {
                                  if (numericDrafts[draftKey] === '') {
                                    updateHabitProgress(h, 0);
                                    setNumericDrafts((prev) => ({ ...prev, [draftKey]: '0' }));
                                  }
                                }}
                                className="w-14 text-center bg-transparent outline-none font-bold"
                              />
                              <span className="opacity-60 text-[11px]">/{h.target_value}{h.unit}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  const nextV = val + (h.target_value >= 1000 ? 250 : 1);
                                  setNumericDrafts((prev) => ({ ...prev, [draftKey]: String(nextV) }));
                                  updateHabitProgress(h, nextV);
                                }}
                                className="px-1.5 text-sm text-[#10B981]"
                              >
                                +
                              </button>
                            </div>
                          )}

                          <button onClick={() => openEditHabitModal(h)} className="p-1.5 opacity-60 hover:opacity-100"><Edit3 className="w-4 h-4" /></button>
                          <button onClick={() => handleDeleteHabit(h.id)} className="p-1.5 opacity-60 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>

                      {isTimerOpen && (
                        <div className={`${pastelLavender} border rounded-2xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs`}>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xl font-bold tracking-tight">{formatSeconds(focusTimer.remaining)}</span>
                            <div className="flex gap-1">
                              {[
                                { l: '5m', s: 300 },
                                { l: '15m', s: 900 },
                                { l: '25m', s: 1500 }
                              ].map((preset) => (
                                <button
                                  key={preset.l}
                                  type="button"
                                  onClick={() => setFocusTimer({ habitId: h.id, remaining: preset.s, total: preset.s, running: false, endTime: null })}
                                  className={`px-2.5 py-1 rounded-full font-bold cursor-pointer ${focusTimer.total === preset.s ? 'bg-[#8B5CF6] text-white' : pillSurface}`}
                                >
                                  {preset.l}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button type="button" onClick={toggleFocusTimerRun} className="px-4 py-1.5 rounded-full bg-[#8B5CF6] text-white font-bold flex items-center gap-1 cursor-pointer spring-btn">
                              {focusTimer.running ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                              {focusTimer.running ? 'Pausa' : 'Avvia'}
                            </button>
                            <button type="button" onClick={() => setFocusTimer((p) => ({ ...p, running: false, remaining: p.total, endTime: null }))} className={`p-1.5 rounded-full ${pillSurface} cursor-pointer`}>
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* SEZIONE STOP BRUTTE ABITUDINI */}
            <div className={`${cardMain} rounded-[36px] p-6 shadow-sm border space-y-4`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-2xl ${pastelRose} border flex items-center justify-center`}><ShieldAlert className="w-5 h-5" /></div>
                  <h3 className="text-lg font-bold">Stop Brutte Abitudini</h3>
                </div>
                <button type="button" onClick={() => openCreateHabitModal('bad')} className="px-3.5 py-2 rounded-full bg-[#EC4899] text-white text-xs font-bold flex items-center gap-1 cursor-pointer spring-btn">
                  <Plus className="w-4 h-4" /> Aggiungi
                </button>
              </div>

              <div className="space-y-3">
                {badHabitsAll.map((bh, idx) => {
                  const log = habitLogs.find((l) => l.habit_id === bh.id && l.log_date === selectedDate);
                  const relapsedToday = log ? log.completed : false;
                  const cleanStreak = calculateBadHabitCleanStreak(bh);

                  return (
                    <div key={bh.id} className={`rounded-[28px] p-4 flex flex-wrap items-center justify-between gap-3 border transition-all ${relapsedToday ? pastelRose : pastelMint}`}>
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col gap-1">
                          <button type="button" disabled={idx === 0} onClick={() => moveHabitOrder(bh.id, -1, badHabitsAll)} className={`p-1 rounded-lg ${pillSurface} ${idx === 0 ? 'opacity-30' : 'hover:opacity-100 cursor-pointer'}`}>
                            <ArrowUp className="w-3 h-3" />
                          </button>
                          <button type="button" disabled={idx === badHabitsAll.length - 1} onClick={() => moveHabitOrder(bh.id, 1, badHabitsAll)} className={`p-1 rounded-lg ${pillSurface} ${idx === badHabitsAll.length - 1 ? 'opacity-30' : 'hover:opacity-100 cursor-pointer'}`}>
                            <ArrowDown className="w-3 h-3" />
                          </button>
                        </div>

                        <div>
                          <p className="font-bold text-sm">{bh.name}</p>
                          <span className="text-xs font-bold block mt-1">
                            {relapsedToday ? '⚠️ Ricaduta registrata oggi (Streak azzerata)' : `🛡️ ${cleanStreak} giorni consecutivi senza cedere`}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => updateHabitProgress(bh, relapsedToday ? 0 : 1)}
                          className={`px-3.5 py-2 rounded-full text-xs font-bold cursor-pointer spring-btn ${relapsedToday ? `${pillSurface} text-emerald-600` : 'bg-[#EC4899] text-white'}`}
                        >
                          {relapsedToday ? 'Annulla Ricaduta' : 'Ho ceduto oggi'}
                        </button>
                        <button onClick={() => openEditHabitModal(bh)} className="p-1.5 opacity-60 hover:opacity-100"><Edit3 className="w-4 h-4" /></button>
                        <button onClick={() => handleDeleteHabit(bh.id)} className="p-1.5 opacity-60 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* GRAFICI ANDAMENTO ROUTINE + DIAGRAMMA CARTESIANO */}
            <div className={`${cardMain} rounded-[36px] p-6 shadow-sm border space-y-6`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-2xl ${pastelLavender} border flex items-center justify-center`}><BarChart3 className="w-5 h-5" /></div>
                  <div>
                    <h3 className="text-lg font-bold">Andamento Routine</h3>
                    <p className="text-xs text-zinc-400">Completamento giornaliero e diagramma cartesiano</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${pastelMint} border`}>Media 7gg: {weeklyHabitAvgPct}%</span>
              </div>

              <div className={`${cardSub} rounded-3xl p-5 space-y-3`}>
                <span className="text-xs font-bold text-zinc-500 block">Completamento Giornaliero (Ultimi 7 giorni)</span>
                <div className="h-36 flex items-end justify-around gap-2.5 pt-4 px-1">
                  {last7DaysHabitSeries.map((dayItem) => (
                    <div key={dayItem.date} className="flex-1 flex flex-col items-center gap-2">
                      <span className="text-[10px] font-bold opacity-80">{dayItem.pct}%</span>
                      <div className={`w-full max-w-[30px] h-24 ${darkMode ? 'bg-zinc-800' : 'bg-black/5'} rounded-full flex items-end overflow-hidden p-0.5`}>
                        <div
                          style={{ height: `${Math.max(12, dayItem.pct)}%` }}
                          className={`w-full rounded-full transition-all duration-700 ease-out ${
                            dayItem.pct === 100
                              ? 'bg-gradient-to-t from-[#10B981] to-[#6EE7B7]'
                              : dayItem.pct >= 50
                              ? 'bg-gradient-to-t from-[#8B5CF6] to-[#C4B5FD]'
                              : 'bg-gradient-to-t from-[#F97316] to-[#FDBA74]'
                          }`}
                        />
                      </div>
                      <span className={`text-[10px] font-bold ${dayItem.date === selectedDate ? 'text-[#8B5CF6]' : 'text-zinc-400'}`}>
                        {dayItem.shortDay} {dayItem.dayNum}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <HabitCartesianChart
                habits={goodHabitsAll}
                habitLogs={habitLogs}
                selectedDate={selectedDate}
                darkMode={darkMode}
              />
            </div>

            {showHabitModal && (
              <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
                <form onSubmit={handleSaveHabit} className={`${cardMain} rounded-[32px] p-6 max-w-md w-full space-y-4 text-xs`}>
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-lg">{editingHabitId ? 'Modifica Routine' : 'Nuova Routine'}</h3>
                    <button type="button" onClick={() => setShowHabitModal(false)}><X className="w-5 h-5 text-zinc-400" /></button>
                  </div>

                  <div>
                    <label className="text-zinc-400 block mb-1">Nome attività o abitudine</label>
                    <input type="text" required placeholder="Es. Stretching, Bere Acqua, Non fumare..." value={habitForm.name} onChange={(e) => setHabitForm({ ...habitForm, name: e.target.value })} className={`w-full ${cardSub} rounded-2xl px-4 py-3 text-sm font-semibold outline-none`} />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-zinc-400 block mb-1">Tipo</label>
                      <select value={habitForm.habit_type} onChange={(e) => setHabitForm({ ...habitForm, habit_type: e.target.value })} className={`w-full ${cardSub} rounded-2xl px-3 py-3 font-semibold outline-none`}>
                        <option value="boolean">Routine Sì / No</option>
                        <option value="numeric">Progressiva (Numerica)</option>
                        <option value="bad">Brutta Abitudine</option>
                      </select>
                    </div>
                    {habitForm.habit_type === 'numeric' && (
                      <div>
                        <label className="text-zinc-400 block mb-1">Obiettivo numerico</label>
                        <input type="number" placeholder="Es. 2500" value={habitForm.target_value} onChange={(e) => setHabitForm({ ...habitForm, target_value: e.target.value })} className={`w-full ${cardSub} rounded-2xl px-3 py-3 font-bold outline-none`} />
                      </div>
                    )}
                  </div>

                  {habitForm.habit_type !== 'bad' && (
                    <div className="space-y-2 pt-1">
                      <label className="text-zinc-400 block">Giorni della settimana:</label>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          { l: 'Tutti i giorni', d: [1, 2, 3, 4, 5, 6, 7] },
                          { l: 'Lun • Mer • Ven', d: [1, 3, 5] },
                          { l: 'Mar • Gio • Sab', d: [2, 4, 6] }
                        ].map((p) => (
                          <button key={p.l} type="button" onClick={() => setHabitForm({ ...habitForm, frequency_days: p.d })} className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${cardSub}`}>
                            {p.l}
                          </button>
                        ))}
                      </div>

                      <div className="grid grid-cols-7 gap-1.5 pt-1">
                        {DAY_LABELS.map((dl) => {
                          const isSelected = habitForm.frequency_days.includes(dl.iso);
                          return (
                            <button
                              key={dl.iso}
                              type="button"
                              onClick={() => {
                                const next = isSelected
                                  ? habitForm.frequency_days.filter((x) => x !== dl.iso)
                                  : [...habitForm.frequency_days, dl.iso].sort();
                                setHabitForm({ ...habitForm, frequency_days: next });
                              }}
                              className={`py-2.5 rounded-2xl font-bold text-center transition cursor-pointer ${isSelected ? 'bg-[#8B5CF6] text-white shadow-xs' : `${cardSub} text-zinc-400`}`}
                            >
                              {dl.full}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <button type="submit" className="w-full bg-[#10B981] text-white font-bold py-3.5 rounded-full text-sm spring-btn">
                    Salva Routine
                  </button>
                </form>
              </div>
            )}
          </div>
        )}

        {/* ==========================================
            TAB 3: PALESTRA
           ========================================== */}
        {activeTab === 'forza' && (
          <div className="space-y-5">
            <div className={`grid grid-cols-5 gap-1 ${cardMain} p-1.5 rounded-full shadow-sm border w-full`}>
              {[
                { id: 'workout', label: 'Schede' },
                { id: 'builder', label: editingRoutine ? 'Modifica' : 'Crea Scheda' },
                { id: 'charts', label: 'Grafici' },
                { id: 'cardio', label: 'Cardio' },
                { id: 'body', label: 'Misure' }
              ].map((st) => (
                <button
                  key={st.id}
                  onClick={() => {
                    if (st.id !== 'builder') setEditingRoutine(null);
                    setForzaSubTab(st.id);
                  }}
                  className={`py-2.5 px-1 rounded-full text-[11px] sm:text-xs font-bold transition text-center truncate cursor-pointer spring-btn ${forzaSubTab === st.id ? 'bg-[#F97316] text-white shadow-xs' : 'text-zinc-400 hover:opacity-80'}`}
                >
                  {st.label}
                </button>
              ))}
            </div>

            {forzaSubTab === 'charts' && (
              <ProgressCharts exercises={exercises} allWorkoutSets={allWorkoutSets} workouts={workouts} bodyMetrics={bodyMetrics} selectedDate={selectedDate} darkMode={darkMode} />
            )}

            {forzaSubTab === 'builder' && (
              <ManualRoutineBuilder
                exercises={exercises}
                editingRoutine={editingRoutine}
                onCancelEdit={() => { setEditingRoutine(null); setForzaSubTab('workout'); }}
                darkMode={darkMode}
                onSaveRoutine={async (plan) => {
                  await saveRoutineHelper(plan.id || null, plan.name, plan.description || '', plan.items);
                  alert(plan.id ? `Modifiche a "${plan.name}" salvate!` : `Scheda "${plan.name}" creata!`);
                  setEditingRoutine(null);
                  setForzaSubTab('workout');
                }}
              />
            )}

            {forzaSubTab === 'workout' && (
              <>
                {activeWorkout ? (
                  <div className="space-y-4">
                    <div className={`${pastelPeach} border rounded-[32px] p-6 space-y-4 shadow-md`}>
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <span className="px-3 py-0.5 rounded-full bg-[#F97316] text-white text-[10px] font-bold uppercase">
                            {hasCompletedSetInActive ? 'Allenamento in Corso • Giorno ON' : 'Scheda Aperta'}
                          </span>
                          <h2 className="text-2xl font-bold mt-1.5">{activeWorkout.name}</h2>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-black/10">
                        <div className="flex gap-1.5">
                          {[90, 60, 120].map((sec, idx) => (
                            <button key={sec} type="button" onClick={() => startRestCountdown(sec)} className={`px-3 py-1.5 ${pillSurface} rounded-full text-xs ${idx === 0 ? 'font-bold' : 'opacity-75'} spring-btn`}>
                              {idx === 0 ? `Rec ${sec}s` : `${sec}s`}
                            </button>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => setActiveWorkout(null)} className={`px-4 py-2 rounded-full ${pillSurface} text-xs opacity-75 cursor-pointer spring-btn`}>Chiudi</button>
                          <button onClick={finishAndSaveWorkout} className="px-5 py-2 rounded-full bg-[#10B981] text-white font-bold text-xs cursor-pointer shadow-sm spring-btn">Termina e Salva</button>
                        </div>
                      </div>
                    </div>

                    {activeWorkout.exercises.map((ex, exIdx) => {
                      const prevSets = getPreviousSetsForExercise(ex.exercise_id);
                      const overloadTip = getProgressiveOverloadTip(ex.exercise_id);
                      const currentRpe = ex.rpe_feedback || exerciseRpe[ex.exercise_id] || 'good';
                      const fullExInfo = exercises.find((e) => e.id === ex.exercise_id);

                      return (
                        <div key={exIdx} className={`${cardMain} rounded-[32px] p-5 shadow-sm border space-y-3.5`}>
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <div>
                              <h3 className="font-bold text-base">{ex.name}</h3>
                              {fullExInfo && (
                                <p className="text-[11px] text-[#8B5CF6] font-semibold">
                                  Primari: {parsePrimaryMuscles(fullExInfo).join(', ')}
                                  {fullExInfo.secondary_muscles?.length ? ` • Secondari: ${fullExInfo.secondary_muscles.join(', ')}` : ''}
                                  {fullExInfo.equipment ? ` • ${fullExInfo.equipment}` : ''}
                                </p>
                              )}
                              <p className="text-xs text-zinc-400 mt-0.5">
                                {prevSets.length > 0
                                  ? `Volta scorsa: ${prevSets.map((s) => `${s.weight_kg > 0 ? `${s.weight_kg}kg×` : ''}${s.reps}`).join(' | ')}`
                                  : 'Nessuno storico precedente'}
                              </p>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  const u = { ...activeWorkout };
                                  u.exercises[exIdx].is_bodyweight = !u.exercises[exIdx].is_bodyweight;
                                  setActiveWorkout(u);
                                }}
                                className={`px-3 py-1 rounded-full text-[11px] font-bold cursor-pointer transition ${ex.is_bodyweight ? 'bg-[#0EA5E9] text-white' : `${cardSub} text-zinc-500`}`}
                              >
                                {ex.is_bodyweight ? '✓ Corpo Libero (Senza Kg)' : 'Usa Peso (Kg)'}
                              </button>

                              {overloadTip && !ex.is_bodyweight && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const u = { ...activeWorkout };
                                    u.exercises[exIdx].sets = u.exercises[exIdx].sets.map((s) => ({
                                      ...s, weight_kg: overloadTip.nextWeight, reps: overloadTip.nextReps
                                    }));
                                    setActiveWorkout(u);
                                  }}
                                  className={`px-3 py-1 rounded-full text-[11px] font-bold flex items-center gap-1 cursor-pointer spring-btn border ${pastelLavender}`}
                                >
                                  <Zap className="w-3 h-3" /> {overloadTip.label}
                                </button>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-12 gap-2 px-2.5 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                            <div className="col-span-2">Serie</div>
                            {!ex.is_bodyweight && <div className="col-span-3 text-center">Carico (kg)</div>}
                            <div className={`${ex.is_bodyweight ? 'col-span-6' : 'col-span-3'} text-center`}>Ripetizioni</div>
                            <div className="col-span-2 text-center">Target</div>
                            <div className="col-span-2 text-right">Fatto</div>
                          </div>

                          <div className="space-y-2">
                            {ex.sets.map((s, sIdx) => (
                              <div key={sIdx} className={`grid grid-cols-12 gap-2 items-center p-2.5 rounded-2xl transition-colors ${s.completed ? pastelMint : cardSub}`}>
                                <div className="col-span-2 flex items-center gap-1">
                                  <button type="button" onClick={() => cycleSetType(exIdx, sIdx)} className={`w-8 h-8 rounded-full ${pillSurface} font-bold text-xs shadow-2xs spring-btn`}>
                                    {s.set_type === 'normal' ? sIdx + 1 : s.set_type[0].toUpperCase()}
                                  </button>
                                </div>

                                {!ex.is_bodyweight && (
                                  <div className="col-span-3">
                                    <input
                                      type="number"
                                      step="0.5"
                                      placeholder="kg"
                                      value={s.weight_kg}
                                      onChange={(e) => {
                                        const u = { ...activeWorkout };
                                        u.exercises[exIdx].sets[sIdx].weight_kg = e.target.value;
                                        setActiveWorkout(u);
                                      }}
                                      className={`w-full ${pillSurface} rounded-xl py-1.5 text-sm font-bold text-center outline-none`}
                                    />
                                  </div>
                                )}

                                <div className={ex.is_bodyweight ? 'col-span-6' : 'col-span-3'}>
                                  <input
                                    type="number"
                                    placeholder="rep"
                                    value={s.reps}
                                    onChange={(e) => {
                                      const u = { ...activeWorkout };
                                      u.exercises[exIdx].sets[sIdx].reps = e.target.value;
                                      setActiveWorkout(u);
                                    }}
                                    className={`w-full ${pillSurface} rounded-xl py-1.5 text-sm font-bold text-center outline-none`}
                                  />
                                </div>

                                <div className="col-span-2 text-center text-[11px] font-semibold opacity-65">{ex.target_reps_label || '8-10'}</div>

                                <div className="col-span-2 flex items-center justify-end gap-1">
                                  {ex.sets.length > 1 && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const u = { ...activeWorkout };
                                        u.exercises[exIdx].sets = u.exercises[exIdx].sets.filter((_, i) => i !== sIdx);
                                        setActiveWorkout(u);
                                      }}
                                      className="p-1 text-zinc-400 hover:text-red-500"
                                    >
                                      <X className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                  <button type="button" onClick={() => toggleSetComplete(exIdx, sIdx)} className={`w-8 h-8 rounded-full flex items-center justify-center cursor-pointer spring-btn ${s.completed ? 'bg-[#10B981] text-white shadow-xs' : `${pillSurface} text-zinc-400`}`}>
                                    <Check className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className={`${cardSub} p-3 rounded-2xl flex flex-wrap items-center justify-between gap-2 text-xs`}>
                            <span className="font-semibold text-zinc-500">Com'è sembrato oggi? (RPE):</span>
                            <div className="flex gap-1.5">
                              {[
                                { id: 'easy', label: '🟢 Leggero (+2.5kg prox)', activeCls: 'bg-[#10B981] text-white' },
                                { id: 'good', label: '🟡 Giusto (+1 rep prox)', activeCls: 'bg-[#F97316] text-white' },
                                { id: 'hard', label: '🔴 Al Limite (Mantieni)', activeCls: 'bg-[#EC4899] text-white' }
                              ].map((opt) => (
                                <button
                                  key={opt.id}
                                  type="button"
                                  onClick={() => setExerciseRpeFeedback(exIdx, opt.id)}
                                  className={`px-3 py-1.5 rounded-full font-bold transition cursor-pointer spring-btn ${currentRpe === opt.id ? opt.activeCls : `${pillSurface} opacity-75`}`}
                                >
                                  {opt.label}
                                </button>
                              ))}
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              const u = { ...activeWorkout };
                              const lastSet = u.exercises[exIdx].sets[u.exercises[exIdx].sets.length - 1];
                              u.exercises[exIdx].sets.push({
                                set_number: u.exercises[exIdx].sets.length + 1,
                                set_type: 'normal',
                                weight_kg: lastSet ? String(lastSet.weight_kg) : '',
                                reps: lastSet ? String(lastSet.reps) : '',
                                completed: false
                              });
                              setActiveWorkout(u);
                            }}
                            className={`w-full py-2.5 rounded-full ${cardSub} text-xs font-bold text-zinc-500 spring-btn`}
                          >
                            + Aggiungi Serie
                          </button>
                        </div>
                      );
                    })}

                    <div className={`${cardMain} rounded-[28px] p-4 border`}>
                      <select onChange={(e) => { if (e.target.value) { addExerciseToActiveWorkout(e.target.value); e.target.value = ''; } }} defaultValue="" className={`w-full ${cardSub} rounded-full px-4 py-3 text-xs font-semibold outline-none`}>
                        <option value="" disabled>+ Aggiungi esercizio alla sessione...</option>
                        {exercises.map((ex) => (<option key={ex.id} value={ex.id}>{ex.name} ({parsePrimaryMuscles(ex).join(', ')} • {ex.equipment})</option>))}
                      </select>
                    </div>
                  </div>
                ) : (
                  <div className={`${cardMain} rounded-[36px] p-6 shadow-sm border space-y-5`}>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <h2 className="text-xl font-bold">Schede Palestra & Archivio Esercizi</h2>
                        <p className="text-xs text-zinc-400">Apri o modifica una scheda già creata</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={openCreateExerciseModal} className={`px-4 py-2 rounded-full ${cardSub} text-xs font-bold cursor-pointer spring-btn`}>
                          ⚙️ Esercizi ({exercises.length})
                        </button>
                        <button onClick={() => { setEditingRoutine(null); setForzaSubTab('builder'); }} className="px-4 py-2 rounded-full bg-[#F97316] text-white text-xs font-bold cursor-pointer spring-btn">
                          + Crea Scheda
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div className={`${pastelPeach} border rounded-[28px] p-5 flex flex-col justify-between`}>
                        <div>
                          <span className="px-2.5 py-0.5 rounded-full bg-[#F97316] text-white text-[10px] font-bold">Libero</span>
                          <h3 className="font-bold text-base mt-2">Sessione Libera</h3>
                          <p className="text-xs opacity-75 mt-1">Scegli gli esercizi man mano con recupero automatico e feedback RPE.</p>
                        </div>
                        <button onClick={() => startWorkout(null)} className="mt-5 w-full py-3 rounded-full bg-[#18181D] text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer spring-btn">
                          <Play className="w-3.5 h-3.5" /> Apri Sessione
                        </button>
                      </div>

                      {routines.map((r) => (
                        <div key={r.id} className={`${cardSub} rounded-[28px] p-5 flex flex-col justify-between`}>
                          <div>
                            <div className="flex items-center justify-between">
                              <span className={`px-2.5 py-0.5 rounded-full ${pillSurface} text-[10px] font-bold`}>Scheda</span>
                              <div className="flex items-center gap-1.5">
                                <button type="button" onClick={() => handleOpenEditRoutine(r)} className={`px-2.5 py-1 rounded-full ${pillSurface} text-[11px] font-bold flex items-center gap-1 cursor-pointer spring-btn`}>
                                  <Edit3 className="w-3 h-3 text-[#F97316]" /> Modifica
                                </button>
                                <button onClick={() => handleDeleteRoutine(r.id)} className="p-1 text-zinc-400 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                              </div>
                            </div>
                            <h3 className="font-bold text-base mt-2">{r.name}</h3>
                            {r.description && <p className="text-[11px] text-[#F97316] font-semibold">{r.description}</p>}
                            <p className="text-xs text-zinc-400 mt-1">
                              {routineExercises
                                .filter((re) => re.routine_id === r.id)
                                .map((item) => {
                                  const exName = exercises.find((e) => e.id === item.exercise_id)?.name;
                                  return exName ? `${exName} (${item.target_sets}×${item.target_reps})` : null;
                                })
                                .filter(Boolean)
                                .join(' • ')}
                            </p>
                          </div>
                          <button onClick={() => startWorkout(r)} className="mt-5 w-full py-3 rounded-full bg-[#F97316] text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer spring-btn">
                            <Play className="w-3.5 h-3.5" /> Apri Scheda
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {forzaSubTab === 'cardio' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <form onSubmit={handleAddCardio} className={`${cardMain} rounded-[32px] p-6 shadow-sm border space-y-4`}>
                  <h3 className="font-bold text-base">Registra Cardio</h3>
                  <input type="text" value={cardioForm.activity_name} onChange={(e) => setCardioForm({ ...cardioForm, activity_name: e.target.value })} className={`w-full ${cardSub} rounded-2xl px-4 py-2.5 text-xs outline-none`} placeholder="Attività" />
                  <div className="grid grid-cols-3 gap-2.5 text-xs">
                    {[
                      { k: 'duration_minutes', l: 'Minuti', step: '1' },
                      { k: 'distance_km', l: 'Km', step: '0.1' },
                      { k: 'calories_burned', l: 'Kcal', step: '1' }
                    ].map((f) => (
                      <div key={f.k} className={`${cardSub} p-3 rounded-2xl`}>
                        <label className="text-zinc-400 block">{f.l}</label>
                        <input type="number" step={f.step} value={cardioForm[f.k]} onChange={(e) => setCardioForm({ ...cardioForm, [f.k]: e.target.value })} className="w-full bg-transparent font-semibold mt-0.5 outline-none" />
                      </div>
                    ))}
                  </div>
                  <button type="submit" className="w-full bg-[#F97316] text-white font-bold py-3 rounded-full text-xs cursor-pointer spring-btn">
                    Salva Sessione Cardio
                  </button>
                </form>

                <div className={`${cardMain} rounded-[32px] p-6 shadow-sm border space-y-3`}>
                  <h3 className="font-bold text-base">Storico Cardio</h3>
                  {cardioLogs.length === 0 ? (
                    <p className="text-xs text-zinc-400 py-6 text-center">Nessuna sessione registrata.</p>
                  ) : (
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {cardioLogs.map((c) => (
                        <div key={c.id} className={`${cardSub} p-3.5 rounded-2xl flex items-center justify-between text-xs`}>
                          <div>
                            <p className="font-semibold">{c.activity_name}</p>
                            <p className="text-zinc-400">{c.log_date} • {c.duration_minutes} min</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`px-3 py-1 rounded-full ${pillSurface} font-bold`}>{c.calories_burned} kcal</span>
                            <button onClick={() => handleDeleteCardio(c.id)} className="text-zinc-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {forzaSubTab === 'body' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <form onSubmit={handleSaveBodyMetrics} className={`${cardMain} rounded-[32px] p-6 shadow-sm border space-y-4`}>
                  <h3 className="font-bold text-base">Misure Corporee ({selectedDate})</h3>
                  <div className="grid grid-cols-2 gap-2.5 text-xs">
                    {[
                      { k: 'weight_kg', l: 'Peso (kg)' }, { k: 'body_fat_pct', l: 'Massa Grassa (%)' },
                      { k: 'waist_cm', l: 'Vita (cm)' }, { k: 'chest_cm', l: 'Petto (cm)' },
                      { k: 'arm_cm', l: 'Braccio (cm)' }, { k: 'thigh_cm', l: 'Coscia (cm)' }
                    ].map((f) => (
                      <div key={f.k} className={`${cardSub} p-3 rounded-2xl`}>
                        <label className="text-zinc-400 block">{f.l}</label>
                        <input type="number" step="0.1" value={bodyForm[f.k]} onChange={(e) => setBodyForm({ ...bodyForm, [f.k]: e.target.value })} className="w-full bg-transparent font-semibold mt-0.5 outline-none" />
                      </div>
                    ))}
                  </div>
                  <button type="submit" className="w-full bg-[#0EA5E9] text-white font-bold py-3 rounded-full text-xs cursor-pointer spring-btn">
                    Salva Misure
                  </button>
                </form>

                <div className={`${cardMain} rounded-[32px] p-6 shadow-sm border space-y-3`}>
                  <h3 className="font-bold text-base">Storico Misurazioni</h3>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {bodyMetrics.map((b) => (
                      <div key={b.id} className={`${cardSub} p-3.5 rounded-2xl flex items-center justify-between text-xs`}>
                        <span className="text-zinc-400">{b.log_date}</span>
                        <span className={`min-w-[76px] px-3 py-1 rounded-full ${pillSurface} font-bold inline-flex items-center justify-center text-center whitespace-nowrap`}>
                          {b.weight_kg} kg
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {showExerciseModal && (
              <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 overflow-y-auto">
                <div className={`${cardMain} rounded-[32px] p-6 max-w-lg w-full space-y-5 my-8 text-xs`}>
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-lg">{editingExerciseId ? 'Modifica Esercizio' : 'Crea / Modifica Esercizi'}</h3>
                    <button type="button" onClick={() => setShowExerciseModal(false)}><X className="w-5 h-5" /></button>
                  </div>

                  <form onSubmit={handleSaveExercise} className="space-y-3.5">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      <div className={`sm:col-span-2 ${cardSub} p-3 rounded-2xl`}>
                        <label className="text-zinc-400 block mb-1">Nome Esercizio</label>
                        <input
                          type="text"
                          required
                          placeholder="Es. Panca Inclinata con Manubri..."
                          value={exerciseForm.name}
                          onChange={(e) => setExerciseForm({ ...exerciseForm, name: e.target.value })}
                          className="w-full bg-transparent text-sm font-semibold outline-none"
                        />
                      </div>

                      <div className={`${cardSub} p-3 rounded-2xl`}>
                        <label className="text-zinc-400 block mb-1">Attrezzo</label>
                        <select
                          value={exerciseForm.equipment}
                          onChange={(e) => setExerciseForm({ ...exerciseForm, equipment: e.target.value })}
                          className="w-full bg-transparent font-bold outline-none mt-1"
                        >
                          {EQUIPMENT_LIST.map((eq) => (<option key={eq} value={eq}>{eq}</option>))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-zinc-400 block mb-1.5">
                        Muscoli Primari Interessati (puoi selezionarne più di uno — colore Rosso nella mappa):
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {MUSCLE_LIST.map((primM) => {
                          const active = exerciseForm.primary_muscles.includes(primM);
                          return (
                            <button
                              key={primM}
                              type="button"
                              onClick={() => {
                                const list = exerciseForm.primary_muscles;
                                const next = list.includes(primM) ? list.filter((x) => x !== primM) : [...list, primM];
                                setExerciseForm({
                                  ...exerciseForm,
                                  primary_muscles: next,
                                  secondary_muscles: exerciseForm.secondary_muscles.filter((s) => !next.includes(s))
                                });
                              }}
                              className={`px-3 py-1.5 rounded-full font-bold transition cursor-pointer ${
                                active ? 'bg-[#EF4444] text-white shadow-xs' : `${cardSub} text-zinc-500`
                              }`}
                            >
                              {active ? '✓ ' : '+ '}{primM}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <label className="text-zinc-400 block mb-1.5">
                        Muscoli Secondari Coinvolti (colore Giallo nella mappa):
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {MUSCLE_LIST.filter((m) => !exerciseForm.primary_muscles.includes(m)).map((secM) => {
                          const active = exerciseForm.secondary_muscles.includes(secM);
                          return (
                            <button
                              key={secM}
                              type="button"
                              onClick={() => {
                                const list = exerciseForm.secondary_muscles;
                                setExerciseForm({
                                  ...exerciseForm,
                                  secondary_muscles: list.includes(secM) ? list.filter((x) => x !== secM) : [...list, secM]
                                });
                              }}
                              className={`px-3 py-1.5 rounded-full font-bold transition cursor-pointer ${
                                active ? 'bg-[#FACC15] text-zinc-900 shadow-xs' : `${cardSub} text-zinc-500`
                              }`}
                            >
                              {active ? '✓ ' : '+ '}{secM}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {editingExerciseId && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingExerciseId(null);
                            setExerciseForm({ name: '', primary_muscles: ['Petto'], secondary_muscles: [], equipment: 'Bilanciere' });
                          }}
                          className={`px-4 py-3 rounded-full ${cardSub} font-bold`}
                        >
                          Annulla Modifica
                        </button>
                      )}
                      <button type="submit" className="flex-1 bg-[#F97316] text-white font-bold py-3 rounded-full text-sm cursor-pointer spring-btn">
                        {editingExerciseId ? 'Salva Modifiche Esercizio' : '+ Salva Nuovo Esercizio'}
                      </button>
                    </div>
                  </form>

                  <div className="pt-3 border-t border-black/5 space-y-2 max-h-56 overflow-y-auto">
                    <p className="text-zinc-400 font-semibold">Tocca "Modifica" su un esercizio esistente per cambiarne muscoli o attrezzo:</p>
                    {exercises.map((ex) => (
                      <div key={ex.id} className={`${cardSub} px-3.5 py-2.5 rounded-2xl flex items-center justify-between gap-2`}>
                        <div>
                          <p className="font-bold">{ex.name}</p>
                          <p className="text-[11px] text-zinc-400">
                            Primari: <strong className="text-[#EF4444]">{parsePrimaryMuscles(ex).join(', ')}</strong>
                            {ex.secondary_muscles?.length ? ` • Sec: ${ex.secondary_muscles.join(', ')}` : ''}
                            {ex.equipment ? ` • ${ex.equipment}` : ''}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button type="button" onClick={() => openEditExerciseModal(ex)} className={`px-3 py-1 rounded-full ${pillSurface} font-bold text-[11px] flex items-center gap-1 cursor-pointer`}>
                            <Edit3 className="w-3 h-3" /> Modifica
                          </button>
                          <button type="button" onClick={() => handleDeleteExercise(ex.id)} className="p-1 text-zinc-400 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==========================================
            TAB 4: DIETA (CON BARCODE PER IPHONE)
           ========================================== */}
        {activeTab === 'mfp' && (
          <div className="space-y-5">
            <ManualDietManager foodLogs={foodLogs} bodyMetrics={bodyMetrics} settings={settings} darkMode={darkMode} onLogDirectMeal={logDirectMealEntry} />

            <div className={`${cardMain} rounded-[32px] p-6 space-y-4 shadow-sm border`}>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <div>
                  <span className="text-xs text-zinc-400 font-semibold">
                    Calorie • {isTrainingDay ? 'Giorno ON (Allenamento)' : 'Giorno OFF (Riposo)'}
                  </span>
                  <h2 className="text-4xl font-bold tracking-tight mt-0.5">
                    <AnimatedNumber value={totals.kcal} /> <span className="text-base font-normal text-zinc-400">/ {currentTargets.kcal} kcal</span>
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${pastelMint}`}>
                    -<AnimatedNumber value={Math.max(0, currentTargets.kcal - totals.kcal)} /> kcal
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowDietTargetsPanel(!showDietTargetsPanel)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 cursor-pointer spring-btn ${showDietTargetsPanel ? 'bg-[#8B5CF6] text-white' : `${cardSub} text-zinc-500`}`}
                  >
                    <Settings className="w-3.5 h-3.5" /> Target ON/OFF
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2.5 text-xs pt-1">
                {[
                  { l: 'Proteine', val: Math.round(totals.protein), goal: currentTargets.protein, box: pastelMint },
                  { l: 'Carboidrati', val: Math.round(totals.carbs), goal: currentTargets.carbs, box: pastelPeach },
                  { l: 'Grassi', val: Math.round(totals.fat), goal: currentTargets.fat, box: pastelLavender }
                ].map((m) => (
                  <div key={m.l} className={`${m.box} border p-3.5 rounded-2xl`}>
                    <span className="opacity-75 block mb-0.5 font-semibold">{m.l}</span>
                    <span className="font-bold text-sm">{m.val}/{m.goal}g</span>
                  </div>
                ))}
              </div>

              {showDietTargetsPanel && (
                <form onSubmit={handleSaveSettings} className="pt-4 border-t border-black/5 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {[
                      { mode: 'on', title: '🔥 Giorno ON (Allenamento)', badge: 'bg-[#F97316]', box: pastelPeach },
                      { mode: 'off', title: '🌿 Giorno OFF (Riposo)', badge: 'bg-[#10B981]', box: pastelMint }
                    ].map((blk) => (
                      <div key={blk.mode} className={`${blk.box} border p-4 rounded-3xl space-y-3`}>
                        <span className={`px-3 py-1 rounded-full ${blk.badge} text-white text-xs font-bold`}>{blk.title}</span>
                        <div className="grid grid-cols-2 gap-2.5 text-xs pt-1">
                          {[
                            { k: `kcal_${blk.mode}`, l: 'Kcal' },
                            { k: `protein_${blk.mode}`, l: 'Proteine (g)' },
                            { k: `carbs_${blk.mode}`, l: 'Carboidrati (g)' },
                            { k: `fat_${blk.mode}`, l: 'Grassi (g)' }
                          ].map((f) => (
                            <div key={f.k}>
                              <label className="opacity-75">{f.l}</label>
                              <input
                                type="number"
                                value={settings[f.k]}
                                onChange={(e) => setSettings({ ...settings, [f.k]: e.target.value })}
                                className={`w-full mt-1 ${pillSurface} rounded-xl px-3 py-2 font-bold outline-none`}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <button type="submit" className="w-full bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] text-white font-bold py-3 rounded-full text-xs cursor-pointer shadow-sm spring-btn">
                    Salva Target Giorno ON / OFF
                  </button>
                </form>
              )}
            </div>

            <WaterGlassesWidget waterMl={currentWaterMl} targetMl={targetWaterMl} onChangeWater={handleWaterUpdate} darkMode={darkMode} />

            {['colazione', 'pranzo', 'cena', 'spuntini'].map((mealId) => {
              const items = todayFoods.filter((f) => f.meal_type === mealId);
              return (
                <div key={mealId} className={`${cardMain} rounded-[32px] p-5 shadow-sm border space-y-3`}>
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-base capitalize">{mealId}</h3>
                    <div className="flex gap-2">
                      <button onClick={() => copyMealFromYesterday(mealId)} className={`px-3 py-1.5 rounded-full ${cardSub} text-xs font-semibold flex items-center gap-1 cursor-pointer spring-btn`}>
                        <Copy className="w-3 h-3" /> Ieri
                      </button>
                      <button onClick={() => setFoodModal({ open: true, meal_type: mealId, tab: 'search' })} className="w-8 h-8 rounded-full bg-[#8B5CF6] text-white flex items-center justify-center cursor-pointer spring-btn">
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  {items.map((item) => (
                    <div key={item.id} className={`${cardSub} px-4 py-3 rounded-2xl flex items-center justify-between text-xs`}>
                      <div>
                        <p className="font-bold">{item.food_name}</p>
                        <p className="text-zinc-400">{item.grams}g • P:{item.protein}g C:{item.carbs}g G:{item.fat}g</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full ${pillSurface} font-bold`}>{item.kcal} kcal</span>
                        <button
                          onClick={async () => {
                            setFoodLogs((p) => p.filter((x) => x.id !== item.id));
                            await syncOrQueue({ table: 'food_logs', action: 'delete', matchCol: 'id', matchVal: item.id });
                          }}
                          className="text-zinc-400 hover:text-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}

            {foodModal.open && (
              <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 overflow-y-auto">
                <div className={`${cardMain} rounded-[32px] p-6 max-w-lg w-full space-y-4 my-8 text-xs`}>
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-lg capitalize">Aggiungi a {foodModal.meal_type}</h3>
                    <button onClick={() => setFoodModal({ ...foodModal, open: false })}><X className="w-5 h-5" /></button>
                  </div>

                  <div className={`grid grid-cols-3 gap-1 ${cardSub} p-1.5 rounded-full`}>
                    {[
                      { id: 'search', l: 'Cerca', icon: Search, active: 'bg-[#18181D] text-white' },
                      { id: 'barcode', l: 'Barcode', icon: Camera, active: 'bg-[#18181D] text-white' },
                      { id: 'create_food', l: 'Nuovo Cibo', icon: Plus, active: 'bg-[#8B5CF6] text-white' }
                    ].map((t) => {
                      const Icon = t.icon;
                      return (
                        <button key={t.id} type="button" onClick={() => setFoodModal({ ...foodModal, tab: t.id })} className={`py-2 rounded-full font-bold flex items-center justify-center gap-1 cursor-pointer ${foodModal.tab === t.id ? t.active : 'text-zinc-400'}`}>
                          <Icon className="w-3.5 h-3.5" /> {t.l}
                        </button>
                      );
                    })}
                  </div>

                  {foodModal.tab === 'create_food' ? (
                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        if (!newFoodModalForm.name.trim()) return;
                        if (newFoodModalForm.save_for_future) {
                          const savedFood = await addNewFoodToDb(newFoodModalForm);
                          await logFoodItem(savedFood, newFoodModalForm.grams_now, foodModal.meal_type);
                        } else {
                          const g = Number(newFoodModalForm.grams_now) || 100;
                          const ratio = g / 100;
                          await logDirectMealEntry(
                            {
                              food_name: newFoodModalForm.name.trim(),
                              grams: g,
                              kcal: Math.round((Number(newFoodModalForm.kcal_100g) || 0) * ratio),
                              protein: Math.round((Number(newFoodModalForm.protein_100g) || 0) * ratio * 10) / 10,
                              carbs: Math.round((Number(newFoodModalForm.carbs_100g) || 0) * ratio * 10) / 10,
                              fat: Math.round((Number(newFoodModalForm.fat_100g) || 0) * ratio * 10) / 10
                            },
                            foodModal.meal_type
                          );
                        }
                        setNewFoodModalForm({
                          name: '', brand: '', kcal_100g: '', protein_100g: '', carbs_100g: '', fat_100g: '',
                          grams_now: '100', save_for_future: true
                        });
                      }}
                      className="space-y-3"
                    >
                      <div className="grid grid-cols-2 gap-2">
                        <div className={`${cardSub} p-3 rounded-2xl`}>
                          <label className="text-zinc-400 block mb-1">Nome Alimento *</label>
                          <input type="text" required placeholder="Es. Bresaola della Valtellina..." value={newFoodModalForm.name} onChange={(e) => setNewFoodModalForm({ ...newFoodModalForm, name: e.target.value })} className="w-full bg-transparent font-bold outline-none" />
                        </div>
                        <div className={`${cardSub} p-3 rounded-2xl`}>
                          <label className="text-zinc-400 block mb-1">Marca (opzionale)</label>
                          <input type="text" placeholder="Es. Rigamonti..." value={newFoodModalForm.brand} onChange={(e) => setNewFoodModalForm({ ...newFoodModalForm, brand: e.target.value })} className="w-full bg-transparent font-bold outline-none" />
                        </div>
                      </div>

                      <div className="grid grid-cols-4 gap-2">
                        {[
                          { k: 'kcal_100g', l: 'Kcal / 100g *', ph: '151', step: '1' },
                          { k: 'protein_100g', l: 'Prot / 100g', ph: '32', step: '0.1' },
                          { k: 'carbs_100g', l: 'Carb / 100g', ph: '0', step: '0.1' },
                          { k: 'fat_100g', l: 'Grassi / 100g', ph: '2.6', step: '0.1' }
                        ].map((f) => (
                          <div key={f.k} className={`${cardSub} p-2.5 rounded-2xl`}>
                            <label className="text-zinc-400 block">{f.l}</label>
                            <input
                              type="number"
                              step={f.step}
                              required
                              placeholder={f.ph}
                              value={newFoodModalForm[f.k]}
                              onChange={(e) => setNewFoodModalForm({ ...newFoodModalForm, [f.k]: e.target.value })}
                              className="w-full bg-transparent font-bold outline-none"
                            />
                          </div>
                        ))}
                      </div>

                      <div className={`flex items-center justify-between ${cardSub} px-4 py-3 rounded-2xl`}>
                        <span className="font-semibold">Quanti grammi ne mangi adesso?</span>
                        <input type="number" value={newFoodModalForm.grams_now} onChange={(e) => setNewFoodModalForm({ ...newFoodModalForm, grams_now: e.target.value })} className={`w-24 ${pillSurface} rounded-xl py-1.5 text-center font-bold outline-none`} />
                      </div>

                      <label className="flex items-center gap-2 px-1 cursor-pointer">
                        <input type="checkbox" checked={newFoodModalForm.save_for_future} onChange={(e) => setNewFoodModalForm({ ...newFoodModalForm, save_for_future: e.target.checked })} className="w-4 h-4 accent-[#8B5CF6]" />
                        <span className="font-semibold">Salva questo alimento per le prossime volte</span>
                      </label>

                      <button type="submit" className="w-full py-3.5 rounded-full bg-[#10B981] text-white font-bold cursor-pointer spring-btn">
                        ✓ Salva Alimento e Aggiungi a {foodModal.meal_type}
                      </button>
                    </form>
                  ) : (
                    <>
                      <div className={`flex items-center justify-between ${cardSub} px-4 py-2.5 rounded-2xl`}>
                        <span>Quantità da inserire (grammi):</span>
                        <input type="number" value={selectedFoodGrams} onChange={(e) => setSelectedFoodGrams(e.target.value)} className={`w-20 ${pillSurface} rounded-xl py-1 text-center font-bold outline-none`} />
                      </div>

                      {foodModal.tab === 'search' ? (
                        <>
                          <div className="flex gap-2">
                            <input type="text" placeholder="Cerca nei tuoi cibi o su OpenFoodFacts..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className={`flex-1 ${cardSub} rounded-full px-4 py-2.5 outline-none`} />
                            <button onClick={searchOpenFoodFacts} className="px-4 py-2.5 bg-[#8B5CF6] text-white font-bold rounded-full">{searchingOff ? '...' : 'Cerca Online'}</button>
                          </div>

                          {searchQuery.trim().length > 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                setNewFoodModalForm((prev) => ({ ...prev, name: searchQuery.trim(), grams_now: selectedFoodGrams || '100', save_for_future: true }));
                                setFoodModal({ ...foodModal, tab: 'create_food' });
                              }}
                              className={`w-full py-2.5 px-4 rounded-2xl ${pastelLavender} border font-bold text-left flex items-center justify-between cursor-pointer spring-btn`}
                            >
                              <span>Non trovi "{searchQuery}"? Crealo e salvalo per sempre</span>
                              <span className="px-2.5 py-0.5 rounded-full bg-[#8B5CF6] text-white text-[10px]">+ Crea Ora</span>
                            </button>
                          )}

                          <div className="max-h-56 overflow-y-auto space-y-2">
                            {foodsDb.filter((f) => f.name.toLowerCase().includes(searchQuery.toLowerCase())).map((f) => (
                              <div key={f.id} className={`${cardSub} p-3 rounded-2xl flex justify-between items-center`}>
                                <div>
                                  <p className="font-bold">{f.name} {f.brand ? `(${f.brand})` : ''}</p>
                                  <p className="text-[11px] text-zinc-400">{f.kcal_100g} kcal/100g • P:{f.protein_100g}g C:{f.carbs_100g}g G:{f.fat_100g}g</p>
                                </div>
                                <button onClick={() => logFoodItem(f, selectedFoodGrams)} className="px-3.5 py-1.5 bg-[#10B981] text-white font-bold rounded-full spring-btn">+ Usa</button>
                              </div>
                            ))}
                            {offResults.map((f, i) => (
                              <div key={i} className={`${cardSub} p-3 rounded-2xl flex justify-between items-center`}>
                                <div>
                                  <p className="font-bold">{f.name}</p>
                                  <p className="text-[11px] text-zinc-400">{f.kcal_100g} kcal/100g • P:{f.protein_100g}g C:{f.carbs_100g}g G:{f.fat_100g}g</p>
                                </div>
                                <button
                                  type="button"
                                  onClick={async () => {
                                    await addNewFoodToDb(f);
                                    await logFoodItem(f, selectedFoodGrams);
                                  }}
                                  className="px-3 py-1.5 bg-[#F97316] text-white font-bold rounded-full spring-btn"
                                >
                                  + Usa e Salva
                                </button>
                              </div>
                            ))}
                          </div>
                        </>
                      ) : (
                        <div className="space-y-3">
                          <div id="barcode-photo-temp" className="hidden" />

                          <div className="grid grid-cols-2 gap-2.5">
                            {!cameraRunning ? (
                              <button
                                type="button"
                                onClick={startBarcodeLiveCamera}
                                className="py-3 px-3 rounded-2xl bg-[#8B5CF6] text-white font-bold flex flex-col items-center justify-center gap-1.5 cursor-pointer shadow-sm spring-btn"
                              >
                                <Camera className="w-5 h-5" />
                                <span>Avvia Fotocamera</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={stopBarcodeCamera}
                                className="py-3 px-3 rounded-2xl bg-[#EF4444] text-white font-bold flex flex-col items-center justify-center gap-1.5 cursor-pointer shadow-sm spring-btn"
                              >
                                <X className="w-5 h-5" />
                                <span>Ferma Fotocamera</span>
                              </button>
                            )}

                            <label className={`py-3 px-3 rounded-2xl ${cardSub} font-bold flex flex-col items-center justify-center gap-1.5 cursor-pointer border border-dashed border-[#8B5CF6]/50 spring-btn text-center`}>
                              <ImageIcon className="w-5 h-5 text-[#8B5CF6]" />
                              <span>Scatta / Carica Foto</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleBarcodeImageUpload}
                                className="hidden"
                              />
                            </label>
                          </div>

                          <div
                            id="barcode-live-box"
                            className={`rounded-3xl overflow-hidden ${cameraRunning ? `${cardSub} p-2 min-h-[220px]` : 'hidden'}`}
                          />

                          {barcodeStatusMsg && (
                            <div className={`p-3 rounded-2xl text-xs font-semibold ${pastelLavender} border`}>
                              {barcodeLoading ? '⏳ ' : 'ℹ️ '}{barcodeStatusMsg}
                            </div>
                          )}

                          <div className={`${cardSub} p-3.5 rounded-2xl space-y-2`}>
                            <label className="text-zinc-400 block font-semibold">
                              Oppure digita i numeri sotto al codice a barre (es. 8076800195057):
                            </label>
                            <div className="flex gap-2">
                              <input
                                type="number"
                                inputMode="numeric"
                                placeholder="Codice a 8 o 13 cifre..."
                                value={manualBarcodeInput}
                                onChange={(e) => setManualBarcodeInput(e.target.value)}
                                className={`flex-1 ${pillSurface} rounded-full px-4 py-2 font-bold outline-none`}
                              />
                              <button
                                type="button"
                                disabled={!manualBarcodeInput.trim() || barcodeLoading}
                                onClick={() => handleBarcodeDecoded(manualBarcodeInput)}
                                className="px-4 py-2 rounded-full bg-[#10B981] text-white font-bold cursor-pointer spring-btn"
                              >
                                Cerca Codice
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <nav className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 bg-[#18181D] text-white rounded-full p-1.5 shadow-2xl flex items-center gap-1">
        {[
          { id: 'dashboard', label: 'Oggi', icon: Home, activeCls: 'bg-[#C4B5FD] text-[#18181D]' },
          { id: 'todo', label: 'Routine', icon: CheckSquare, activeCls: 'bg-[#6EE7B7] text-[#18181D]' },
          { id: 'forza', label: 'Palestra', icon: Dumbbell, activeCls: 'bg-[#FDBA74] text-[#18181D]' },
          { id: 'mfp', label: 'Dieta', icon: Utensils, activeCls: 'bg-[#7DD3FC] text-[#18181D]' }
        ].map((item) => {
          const IconComponent = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`px-4 py-2.5 rounded-full text-xs font-bold transition flex items-center gap-2 cursor-pointer spring-btn ${isActive ? item.activeCls : 'text-zinc-400 hover:text-white'}`}
            >
              <IconComponent className="w-4 h-4" />
              <span className="hidden sm:inline">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}