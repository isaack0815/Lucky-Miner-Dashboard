# ⛏️ LuckyMiner Dashboard

Ein modernes, leichtgewichtiges und webbasiertes Dashboard zur Verwaltung, Überwachung und Steuerung von ESP-basierten **LuckyMinern** (z. B. v06, v07). Entwickelt mit **Angular 17** und TypeScript.

Dieses Dashboard speichert die IP-Adressen deiner Miner lokal in deinem Browser und fragt deren Live-Daten direkt in deinem lokalen Netzwerk ab. So hast du alle deine Miner auf einen Blick, ganz ohne externe Cloud oder Datenbank!

---

## 🌍 Direkt nutzen (Live-Version)

Du möchtest nichts installieren oder selbst hosten? Du kannst das fertige Dashboard direkt hier in deinem Browser nutzen:

👉 **[http://miner.vms1-scripte.de](http://miner.vms1-scripte.de)**

**Ist das sicher?** Ja! Da diese Web-App vollständig clientseitig (in deinem Browser) läuft, werden deine eingetragenen Miner-IPs und Namen **niemals** an den Server gesendet. Alles bleibt ausschließlich in deinem lokalen Netzwerk und wird nur im `localStorage` deines aktuellen Geräts gespeichert.

---

## ✨ Features

- **📊 Übersichtliches Dashboard:** Gesamte Hashrate, Anzahl der aktiven Miner, gefundene Shares und durchschnittliche Temperatur auf einen Blick.
- **🔍 Miner-Verwaltung:** Miner ganz einfach per IP-Adresse hinzufügen. Mit integrierter Live-Suche nach Name, IP oder Modell.
- **🛠️ Steuerung & Aktionen:** 
  - **Neustart:** Einzelne Miner bequem über das Dashboard neu starten.
  - **Identifizieren:** Lässt das Display des ausgewählten Miners blinken, um ihn im echten Leben schnell zu finden.
- **📈 Detaillierte Statistiken:** 
  - Gesamtstromverbrauch (Watt) und Effizienz (W/TH).
  - Performance-Ranking aller Miner (wer hat die höchste Hashrate?).
  - Übersicht der aktuell verbundenen Stratum-Pools.
- **🔒 100% Lokal:** Alle Miner-Daten (IPs, Namen) bleiben bei dir und werden nur im lokalen `localStorage` deines Browsers gespeichert.

---

## ⚠️ WICHTIGER HINWEIS (HTTP vs. HTTPS)

Wenn du dieses Dashboard auf einem eigenen Webspace hosten möchtest, **musst du es über `http://` aufrufen**, NICHT über `https://`!

**Warum?** 
Das Dashboard fragt die Daten direkt von den Minern in deinem lokalen Netzwerk ab (z. B. über `http://192.168.178.50`). Moderne Browser blockieren aus Sicherheitsgründen Anfragen an unsichere `http://`-Ziele, wenn die Webseite selbst über ein sicheres `https://` geladen wurde (sogenannter *Mixed Content Error*). 

Um sicherzustellen, dass die Echtzeitdaten geladen werden können, rufe deine gehostete Seite bitte immer per HTTP auf (z. B. `http://deine-domain.de`).

---

## 🚀 Lokale Installation & Entwicklung

Wenn du das Projekt lokal auf deinem Rechner laufen lassen oder weiterentwickeln möchtest:

### Voraussetzungen
- Node.js (Version 18 oder 20 empfohlen)
- NPM (wird mit Node.js installiert)

### Schritte
1. Repository klonen:
   ```bash
   git clone https://github.com/DEIN-USERNAME/luckyminer-dashboard.git
   cd luckyminer-dashboard
   ```

2. Abhängigkeiten installieren:
   ```bash
   npm install
   ```

3. Entwicklungsserver starten:
   ```bash
   npm start
   ```

Das Dashboard ist nun unter `http://localhost:4200` erreichbar. Sobald du Code änderst, lädt die Seite automatisch neu.

---

## 🌐 Automatisches Deployment (z. B. All-Inkl)

Dieses Repository enthält einen fertigen **GitHub Actions Workflow** (`.github/workflows/ftp-deploy.yml`), der das Dashboard bei jedem Push in den `main`-Branch automatisch baut und per FTP auf deinen Webspace lädt.

Um das automatische Deployment zu aktivieren, musst du in deinem GitHub-Repository folgende **Secrets** anlegen:

1. Gehe zu **Settings** -> **Secrets and variables** -> **Actions**
2. Klicke auf **New repository secret** und füge diese drei Variablen hinzu:
   - `FTP_SERVER`: Dein FTP-Server (z.B. `deine-domain.de` oder `w0123456.kasserver.com`)
   - `FTP_USERNAME`: Dein FTP-Benutzername
   - `FTP_PASSWORD`: Dein FTP-Passwort

*(Hinweis: Wenn du die Dateien in einen bestimmten Unterordner laden möchtest, kannst du die Variable `server-dir:` in der Datei `.github/workflows/ftp-deploy.yml` anpassen).*

---

## 🛠️ Architektur & Technologien

- **Framework:** Angular 17 (Standalone Components, Signals für Reactivity)
- **Styling:** Reines CSS (mit CSS-Variablen für ein leichtes, modernes Theme)
- **Kommunikation:** Regelmäßiges Polling der `/api/system/info` Endpunkte auf den lokalen IPs der Miner.

---

## 🤝 Mitwirken (Contributing)

Du möchtest das Dashboard verbessern? Großartig! 
1. Forke das Projekt
2. Erstelle einen Feature-Branch (`git checkout -b feature/MeineNeueFunktion`)
3. Committe deine Änderungen (`git commit -m 'Meine neue Funktion hinzugefügt'`)
4. Pushe in den Branch (`git push origin feature/MeineNeueFunktion`)
5. Erstelle einen Pull Request

---

## 📄 Lizenz

Dieses Projekt ist Open Source. Du kannst es frei verwenden, verändern und weiterverbreiten. Viel Spaß beim Minen!