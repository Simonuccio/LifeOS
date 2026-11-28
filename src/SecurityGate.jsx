import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { Lock, ShieldCheck, Delete, KeyRound } from 'lucide-react';

export default function SecurityGate({ children }) {
  const [session, setSession] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Stato Login Supabase
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [loadingLogin, setLoadingLogin] = useState(false);

  // Stato Tastierino PIN Rapido a 4 cifre (salvato per dispositivo)
  const [savedPin, setSavedPin] = useState(() => localStorage.getItem('lifeos_quick_pin') || '');
  const [isPinUnlocked, setIsPinUnlocked] = useState(
    () => Boolean(localStorage.getItem('lifeos_quick_pin')) && localStorage.getItem('lifeos_pin_unlocked') === 'true'
  );
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setCheckingAuth(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSupabaseLogin = async (e) => {
    e.preventDefault();
    setLoadingLogin(true);
    setAuthError('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setAuthError('Credenziali non valide. Verifica email e password create su Supabase.');
    }
    setLoadingLogin(false);
  };

  const handleDigitPress = (digit) => {
    if (pinInput.length >= 4) return;
    const nextPin = pinInput + digit;
    setPinInput(nextPin);
    setPinError(false);

    if (nextPin.length === 4) {
      if (!savedPin) {
        localStorage.setItem('lifeos_quick_pin', nextPin);
        localStorage.setItem('lifeos_pin_unlocked', 'true');
        setSavedPin(nextPin);
        setIsPinUnlocked(true);
        setPinInput('');
      } else if (nextPin === savedPin) {
        localStorage.setItem('lifeos_pin_unlocked', 'true');
        setIsPinUnlocked(true);
        setPinInput('');
      } else {
        setPinError(true);
        setTimeout(() => setPinInput(''), 450);
      }
    }
  };

  const handleLockNow = () => {
    localStorage.removeItem('lifeos_pin_unlocked');
    setIsPinUnlocked(false);
  };

  const handleLogoutFull = async () => {
    if (!confirm('Vuoi disconnettere la sessione Cloud e reimpostare il PIN su questo dispositivo?')) return;
    localStorage.removeItem('lifeos_quick_pin');
    localStorage.removeItem('lifeos_pin_unlocked');
    setSavedPin('');
    setIsPinUnlocked(false);
    await supabase.auth.signOut();
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#EFECE6] flex items-center justify-center text-sm font-semibold text-zinc-500">
        Verifica sicurezza Cloud...
      </div>
    );
  }

  // 1. SCHERMATA LOGIN SUPABASE (Solo la prima volta sul dispositivo)
  if (!session) {
    return (
      <div className="min-h-screen bg-[#EFECE6] text-[#18181D] flex items-center justify-center p-5 font-sans">
        <form
          onSubmit={handleSupabaseLogin}
          className="bg-white rounded-[36px] p-7 max-w-sm w-full shadow-xl border border-black/5 space-y-5"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#18181D] text-[#6EE7B7] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="px-2.5 py-0.5 rounded-full bg-[#F26B3A] text-white text-[10px] font-bold uppercase">
                RLS Attivo
              </span>
              <h1 className="text-xl font-bold tracking-tight mt-0.5">Accesso LifeOS</h1>
            </div>
          </div>

          <p className="text-xs text-zinc-400 leading-relaxed">
            Inserisci l'email e la password del tuo utente Supabase per sbloccare il database protetto.
          </p>

          {authError && (
            <div className="p-3 rounded-2xl bg-red-500/10 text-red-600 text-xs font-medium">
              {authError}
            </div>
          )}

          <div className="space-y-3 text-xs">
            <div className="bg-[#F4F3EE] p-3.5 rounded-2xl">
              <label className="text-zinc-400 block mb-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="La tua email..."
                className="w-full bg-transparent font-semibold text-sm outline-none"
              />
            </div>

            <div className="bg-[#F4F3EE] p-3.5 rounded-2xl">
              <label className="text-zinc-400 block mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-transparent font-semibold text-sm outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loadingLogin}
            className="w-full py-3.5 rounded-full bg-[#18181D] text-white font-bold text-xs cursor-pointer hover:opacity-95 transition"
          >
            {loadingLogin ? 'Autenticazione in corso...' : 'Sblocca Database Cloud'}
          </button>
        </form>
      </div>
    );
  }

  // 2. SCHERMATA TASTIERINO PIN (Una sola volta per dispositivo, o dopo blocco manuale)
  if (!isPinUnlocked) {
    return (
      <div className="min-h-screen bg-[#18181D] text-white flex flex-col items-center justify-center p-6 font-sans select-none">
        <div className="max-w-xs w-full text-center space-y-6">
          <div className="w-14 h-14 rounded-full bg-zinc-800 text-[#6EE7B7] flex items-center justify-center mx-auto shadow-inner">
            <KeyRound className="w-6 h-6" />
          </div>

          <div>
            <h2 className="text-xl font-bold tracking-tight">
              {savedPin ? 'Inserisci il tuo PIN' : 'Crea un PIN a 4 cifre'}
            </h2>
            <p className="text-xs text-zinc-400 mt-1">
              {savedPin
                ? 'Inseriscilo una sola volta per ricordare questo dispositivo'
                : 'Scegli 4 cifre per proteggere la schermata su questo dispositivo'}
            </p>
          </div>

          {/* 4 Pallini Indicatori PIN */}
          <div className="flex items-center justify-center gap-4 py-2">
            {[0, 1, 2, 3].map((idx) => {
              const filled = pinInput.length > idx;
              return (
                <div
                  key={idx}
                  className={`w-4 h-4 rounded-full transition-all duration-200 ${
                    pinError
                      ? 'bg-[#F26B3A] scale-110'
                      : filled
                      ? 'bg-[#6EE7B7] scale-110'
                      : 'bg-zinc-700'
                  }`}
                />
              );
            })}
          </div>

          {pinError && (
            <p className="text-xs text-[#F26B3A] font-semibold">PIN errato, riprova</p>
          )}

          {/* Tastierino Numerico */}
          <div className="grid grid-cols-3 gap-3.5 pt-2">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => handleDigitPress(num)}
                className="h-16 rounded-full bg-zinc-800/90 hover:bg-zinc-700 active:scale-95 text-xl font-semibold transition flex items-center justify-center cursor-pointer"
              >
                {num}
              </button>
            ))}

            <button
              type="button"
              onClick={handleLogoutFull}
              title="Esci dall'account Cloud"
              className="h-16 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-400 flex items-center justify-center text-[11px] font-semibold cursor-pointer"
            >
              Reset
            </button>

            <button
              type="button"
              onClick={() => handleDigitPress('0')}
              className="h-16 rounded-full bg-zinc-800/90 hover:bg-zinc-700 active:scale-95 text-xl font-semibold transition flex items-center justify-center cursor-pointer"
            >
              0
            </button>

            <button
              type="button"
              onClick={() => setPinInput((prev) => prev.slice(0, -1))}
              className="h-16 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-300 flex items-center justify-center cursor-pointer"
            >
              <Delete className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. APP SBLOCCATA + PULSANTE LUCCHETTO RAPIDO IN BASSO A DESTRA
  return (
    <div className="relative">
      {children}
      <button
        onClick={handleLockNow}
        title="Blocca subito l'app con PIN"
        className="fixed bottom-5 right-4 z-40 w-10 h-10 rounded-full bg-[#18181D] text-zinc-300 hover:text-white shadow-xl flex items-center justify-center cursor-pointer border border-white/10"
      >
        <Lock className="w-4 h-4" />
      </button>
    </div>
  );
}