# 🔥 Breaking Fat — Meal Prep & Movimento

App monofile (un solo `index.html`, zero dipendenze, zero rete) per il piano pasti settimanale: piano lun–ven con ricette, lista della spesa automatica, check-list della sessione batch, routine di movimento con tutorial animati, profilo con peso/BMI/TDEE e backup dei dati.

Tutti i dati restano **solo sul dispositivo** (localStorage); nessun account, nessun tracciamento.

## 🌐 Usa l'app

Apri GitHub Pages: **https://rudesssolo.github.io/breaking-fat/**

Su smartphone puoi installarla sulla schermata Home ("Aggiungi a schermata Home" su Android Chrome / "Aggiungi a Home" su iPhone Safari): si apre a tutto schermo come un'app.

## 🖥️ Sviluppo locale

```bash
python -m http.server 8137
# poi apri http://127.0.0.1:8137/index.html
```

Il file sorgente di lavoro è `BreakingFat.html` (locale, non pubblicato); per pubblicare una nuova versione: aggiorna `const BUILD` (formato `YYMMDD.revisione`, es. `261004.3` — incrementa la revisione a ogni pubblicazione nello stesso giorno), copia su `index.html`, commit e push. Nel repo è servito **solo `index.html`**: è l'unica URL canonica (usata anche da manifest e service worker).

## 📦 Pubblicazione (GitHub Pages)

Il sito è servito dal branch `main` (cartella root) tramite GitHub Pages.

## 🧰 Tecnologia

HTML + CSS + JavaScript vanilla in un unico file. Tema chiaro/scuro, accessibilità (ARIA, dialog, Esc), manifest PWA generato a runtime con icona disegnata su canvas.

---

build 261004 · Marco Flavio Gemello
