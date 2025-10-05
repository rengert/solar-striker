# SolarStriker

SolarStriker ist ein vertikal scrollender Arcade-Shooter im Retro-Stil, inspiriert vom gleichnamigen Game-Boy-Klassiker. Das Projekt setzt auf Angular als Framework und kombiniert es mit PixiJS für schnelle 2D-Grafik im Browser und auf mobilen Geräten.

[Spielen / Try it](https://rengert.github.io/solar-striker/browser)

## Inhaltsverzeichnis

1. [Features](#features)
2. [Voraussetzungen](#voraussetzungen)
3. [Installation](#installation)
4. [Nützliche npm-Skripte](#nützliche-npm-skripte)
5. [Lokale Entwicklung](#lokale-entwicklung)
6. [Tests & Code-Qualität](#tests--code-qualität)
7. [Build & Deployment](#build--deployment)
8. [Projektstruktur](#projektstruktur)
9. [Steuerung & Gameplay](#steuerung--gameplay)
10. [Weiterführende Hinweise](#weiterführende-hinweise)

## Features

- **Angular + PixiJS:** Angular verwaltet UI-Logik und Screens, PixiJS rendert das eigentliche Spielgeschehen auf einer Canvas.
- **Touch- & Maussteuerung:** Das Schiff folgt dem Zeiger, Schüsse werden per gedrücktem Pointer ausgelöst – ideal für Desktop und mobile Geräte.
- **Sammelbare Upgrades:** Coins und Power-ups steigern die Fähigkeiten des Schiffs. Persistente Upgrades werden lokal gespeichert.
- **Highscore-Verwaltung:** Spielstände werden in IndexedDB abgelegt und können jederzeit im Highscore-Bildschirm eingesehen werden.
- **Capacitor-Integration:** Dank Capacitor lässt sich der Build nahtlos als iOS-App verpacken.

## Voraussetzungen

- Node.js >= 20.x (inklusive npm)
- Optional: Angular CLI global installiert (`npm install -g @angular/cli`)
- Für iOS-Builds: Xcode, CocoaPods und ein macOS-System

## Installation

```bash
# Repository klonen
git clone https://github.com/rengert/solar-striker.git
cd solar-striker

# Abhängigkeiten installieren
npm install
```

## Nützliche npm-Skripte

| Skript              | Beschreibung |
| ------------------- | ------------ |
| `npm start`         | Startet den Entwicklungsserver (`ng serve`). |
| `npm run build`     | Erstellt einen Produktions-Build im Verzeichnis `dist/`. |
| `npm run watch`     | Baut das Projekt inkrementell im Watch-Modus. |
| `npm test`          | Führt die Unit-Tests im Headless-Chrome aus. |
| `npm run lint`      | Prüft den Code mit ESLint auf Stil- und Qualitätsfehler. |
| `npm run build:ios` | Baut die Web-App, synchronisiert Capacitor und öffnet das iOS-Projekt in Xcode. |

## Lokale Entwicklung

1. Starte den Entwicklungsserver:
   ```bash
   npm start
   ```
2. Öffne den Browser unter [http://localhost:4200](http://localhost:4200).
3. Dank Hot Module Replacement werden Änderungen an Komponenten, Styles und Services sofort übernommen.

## Tests & Code-Qualität

- **Unit-Tests:** `npm test`
- **Linting:** `npm run lint`
- **Formatierung:** Das Projekt nutzt Prettier. Viele Editoren lassen sich so konfigurieren, dass Dateien beim Speichern automatisch formatiert werden.

## Build & Deployment

- **Produktions-Build:** `npm run build` erzeugt einen optimierten Output unter `dist/solar-striker/browser`.
- **GitHub Pages:** Mit `npx angular-cli-ghpages --dir=dist/solar-striker/browser` lässt sich der Build auf GitHub Pages veröffentlichen.
- **iOS:** `npm run build:ios` erzeugt den Web-Build, synchronisiert das Capacitor-Projekt (`npx cap sync ios`) und öffnet es in Xcode (`npx cap open ios`).

## Projektstruktur

```
src/
├─ app/                # Angular-Komponenten, Services, Popups und Spiel-Logik
├─ assets/             # Grafiken, Spritesheets und Schriftarten
├─ environments/       # Build-spezifische Konfigurationen
└─ main.ts             # Einstiegspunkt der Angular-Anwendung
```

Wesentliche Spielfunktionen wie Gegner-Spawning, Meteoriten, Upgrades, Popups und die Game Loop sind in den Services unter `src/app/services` implementiert.

## Steuerung & Gameplay

- **Bewegung:** Bewege Maus oder Finger über die Spielfläche – das Schiff folgt der Zeigerposition.
- **Schießen:** Pointer gedrückt halten oder auf dem Touchscreen gedrückt lassen, um Dauerfeuer zu aktivieren.
- **Navigation:** Über Popups erreichst du Hangar, Highscore, Credits oder den Spielstart.

Besiege Gegner und Meteoriten, sammle Coins ein und investiere sie in dauerhafte Upgrades, um mit jedem Durchlauf weiter zu kommen.

## Weiterführende Hinweise

- Assets stammen aus dem `assets/`-Verzeichnis und werden beim Start asynchron über PixiJS geladen.
- Persistente Spielstände (Coins, Upgrades, Highscores) werden in IndexedDB gespeichert. Beim Löschen der Browserdaten gehen diese Informationen verloren.
- Eine explizite Open-Source-Lizenz ist im Repository derzeit nicht hinterlegt.
