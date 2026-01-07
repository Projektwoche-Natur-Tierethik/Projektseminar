# Entwicklung

## Voraussetzungen
- Node.js (empfohlen: aktuelle LTS)
- npm

## Setup
1) Abhaengigkeiten installieren
```
cd /mnt/c/Users/Noname/OneDrive/Uni/Naturschutz/Projektseminar
npm install
```

2) Prisma Client generieren und lokale Datenbank erstellen
```
npm run prisma:generate
npm run prisma:migrate
```

## Entwicklung starten
```
npm run dev
```
- Die App laeuft unter `http://localhost:3000`.
- Aenderungen im Code werden automatisch neu kompiliert (Hot Reload).

## Produktionsbuild (optional)
```
npm run build
npm start
```
