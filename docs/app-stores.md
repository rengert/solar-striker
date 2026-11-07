# Solar Striker im App Store und bei Google Play veröffentlichen

Das Spiel wird mit [Capacitor](https://capacitorjs.com) als native App verpackt. Die Projekte liegen in `ios/` und `android/`, die App-ID ist `net.bolzplatzarena.solarstriker`.

## Einmalig: Konten anlegen

| Was | Kosten | Link |
| --- | --- | --- |
| Apple Developer Program | 99 $ pro Jahr | https://developer.apple.com/programs/enroll/ |
| Google Play Console | 25 $ einmalig | https://play.google.com/console/signup |

Für iOS brauchst du einen Mac mit Xcode, für Android Android Studio (läuft auf Mac, Windows und Linux).
Neue private Google-Play-Konten müssen die App vor der Veröffentlichung **14 Tage lang mit mindestens 12 Testern** im geschlossenen Test laufen lassen. Plane das früh ein.

## Vor jedem Release: Version hochzählen

- **iOS:** In Xcode unter *App → General* `Version` (z. B. 1.5.0) und `Build` (jede Einreichung +1) setzen.
- **Android:** In `android/app/build.gradle` `versionName` (z. B. "1.5.0") und `versionCode` (jede Einreichung +1) setzen.

## iOS (App Store)

1. `npm install`, dann `npm run build:ios` (baut, synchronisiert und öffnet Xcode).
2. In Xcode unter *Signing & Capabilities* dein Team auswählen, *Automatically manage signing* anlassen.
3. Oben als Ziel *Any iOS Device (arm64)* wählen, dann *Product → Archive*.
4. Im Organizer *Distribute App → App Store Connect → Upload*.
5. In [App Store Connect](https://appstoreconnect.apple.com) eine neue App mit der Bundle-ID oben anlegen, den Build auswählen und den Store-Eintrag ausfüllen (siehe unten). Zum Testen vorab: TestFlight.
6. *Zur Prüfung einreichen*. Die Prüfung dauert meist 1–2 Tage.

## Android (Google Play)

1. `npm install`, dann `npm run build:android` (baut, synchronisiert und öffnet Android Studio).
2. *Build → Generate Signed App Bundle / APK → Android App Bundle*.
3. Beim ersten Mal einen neuen Keystore anlegen. **Keystore-Datei und Passwörter sicher aufheben** (nicht ins Repo!), ohne sie gibt es keine Updates mehr. Google Play App Signing beim Anlegen der App aktiviert lassen.
4. Variante `release` bauen. Das Ergebnis liegt in `android/app/release/app-release.aab`.
5. In der [Play Console](https://play.google.com/console) die App anlegen, das `.aab` erst im geschlossenen Test, später in *Produktion* hochladen und den Store-Eintrag ausfüllen.

## Was die Stores für den Eintrag verlangen

- App-Name, Kurz- und Langbeschreibung (Deutsch, gern auch Englisch).
- Screenshots: iPhone 6,9" (1320 × 2868) und bei Google Play mindestens 2 Handy-Screenshots; Google zusätzlich eine Feature-Grafik 1024 × 500.
- **Datenschutzerklärung als URL** (Pflicht in beiden Stores). Das Spiel speichert nur lokal auf dem Gerät und sammelt keine Daten, das kann man so angeben ("Keine Daten erfasst" / Data safety: keine Daten).
- Altersfreigabe-Fragebogen (Comic-Gewalt gegen Raumschiffe, keine Käufe, keine Werbung).
- Kategorie: Spiele → Arcade bzw. Action.
- Exportverschlüsselung: Ist in `Info.plist` schon mit "nein" beantwortet.

## Was technisch schon eingerichtet ist

- Nur Hochformat, ohne Statusleiste.
- Safe Areas: Auf iOS hält `contentInset: 'always'` das Spielfeld aus Notch und Home-Indicator heraus, auf Android erledigt das Capacitors SystemBars-Plugin (Standard).
- App-Icon und Splash-Screen für beide Plattformen (aus dem bisherigen iOS-Icon erzeugt). Für neue Bilder: `npx @capacitor/assets generate` mit `assets/icon.png` (1024 × 1024) und `assets/splash.png` (2732 × 2732).
- Die CI baut bei jedem PR eine Android-Debug-APK zur Kontrolle.
