import { createClient } from '@supabase/supabase-js'

// L'indirizzo del progetto Supabase e la chiave pubblica (anon) non sono
// scritti nel codice: si leggono dalle variabili d'ambiente di Vite.
// In locale stanno nel file .env.local (non pubblicato), vedi .env.example.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    'Mancano VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY. Copia .env.example in .env.local e inserisci i valori del tuo progetto Supabase.'
  )
}

export const supabase = createClient(supabaseUrl, supabaseKey)
