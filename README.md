# LifeOS

Web app personale per tenere insieme abitudini giornaliere, allenamenti, dieta e misure corporee in un'unica interfaccia. È un progetto per imparare React e l'uso di un database cloud.

> **Nota sullo sviluppo:** il progetto è stato sviluppato con l'aiuto di strumenti di intelligenza artificiale.

## Funzioni

L'app ha quattro sezioni:

- **Dashboard:** riepilogo della giornata, con accesso rapido a dieta, abitudini e allenamento
- **Da fare (abitudini):** abitudini giornaliere di tre tipi (da completare, numeriche come l'acqua in ml, da evitare), con frequenza per giorno della settimana e un grafico dell'andamento. Alcune si completano da sole, per esempio quando l'allenamento è fatto
- **Forza:** esercizi con gruppi muscolari e attrezzi, creazione di schede di allenamento, registro delle serie, cardio, misure corporee, mappa muscolare e grafici dei progressi
- **Dieta:** diario alimentare con alimenti personalizzati. I prodotti si possono cercare per nome o scansionando il codice a barre con la fotocamera, tramite [Open Food Facts](https://world.openfoodfacts.org/)

Inoltre: tema chiaro e scuro, manifest per installarla come app sul telefono (PWA) e accesso protetto da login.

## Tecnologie

React · Vite · Tailwind CSS · Supabase (autenticazione e database PostgreSQL) · lucide-react · date-fns · html5-qrcode · Open Food Facts

## Come avviarla in locale

Servono [Node.js](https://nodejs.org/) e un progetto [Supabase](https://supabase.com/) tuo.

```
git clone https://github.com/Simonuccio/LifeOS.git
cd LifeOS
npm install
```

Poi copia `.env.example` in `.env.local` e inserisci l'indirizzo del progetto e la chiave pubblica (`anon`) che trovi in Supabase, in *Project Settings > API*:

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

Infine:

```
npm run dev
```

Il file `.env.local` non viene pubblicato. Se pubblichi l'app su Vercel, imposta le stesse due variabili nelle impostazioni del progetto Vercel.

## Database

L'app usa queste tabelle: `user_settings`, `habits`, `habit_logs`, `exercises`, `routines`, `routine_exercises`, `workouts`, `workout_sets`, `cardio_logs`, `body_metrics`, `foods`, `food_logs`. Lo schema SQL non è ancora incluso nel repository.

## Sicurezza

- L'accesso avviene con il login di Supabase (email e password).
- L'app è pensata per funzionare con **Row Level Security (RLS)** attiva sulle tabelle. La chiave `anon` è pubblica per progettazione, quindi a proteggere i dati sono le regole RLS, non la segretezza della chiave.
- Il PIN rapido a 4 cifre è salvato nel browser (`localStorage`): serve solo come comodità di sblocco sul dispositivo e non protegge i dati.
- È pensata per un uso personale, con un solo utente.

## Struttura del codice

| File | Cosa fa |
|---|---|
| `src/App.jsx` | Schermate principali e logica dell'app |
| `src/ModulesExtra.jsx` | Componenti di supporto: grafici, mappa muscolare, acqua, schede di allenamento, gestione dieta |
| `src/SecurityGate.jsx` | Login Supabase e PIN rapido |
| `src/supabaseClient.js` | Connessione a Supabase, con le chiavi lette dalle variabili d'ambiente |
