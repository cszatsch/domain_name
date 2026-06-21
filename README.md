# Recherche de nom de domaine

Outil web qui réunit **disponibilité**, **coût** et **potentiel de visibilité** d'un nom de
domaine dans une seule interface. À partir d'un mot, d'une marque ou d'un thème, l'application
affiche en temps réel les domaines disponibles sur les principales extensions.

> 📋 Plan complet : [`docs/IMPLEMENTATION_PLAN.md`](docs/IMPLEMENTATION_PLAN.md)

## État d'avancement

- ✅ **Phase 0** — Fondations (Next.js + TypeScript + Tailwind, ESLint, tests Vitest, CI)
- ✅ **Phase 1** — Disponibilité en temps réel (RDAP + repli DNS, streaming NDJSON, UI progressive)
- ⏳ Phase 2 — Prix (Porkbun) · Phase 3 — SEO · Phase 4 — Suggestions & réseaux sociaux

## Démarrage

```bash
npm install
npm run dev        # http://localhost:3000
```

Aucune clé API n'est requise pour la Phase 1. Voir [`.env.example`](.env.example) pour les
phases suivantes.

## Scripts

| Commande            | Rôle                                    |
| ------------------- | --------------------------------------- |
| `npm run dev`       | Serveur de développement                |
| `npm run build`     | Build de production                     |
| `npm run start`     | Sert le build de production             |
| `npm run lint`      | ESLint                                  |
| `npm run typecheck` | Vérification TypeScript (`tsc --noEmit`)|
| `npm test`          | Tests unitaires (Vitest)               |

## Architecture (Phase 1)

```
app/
  page.tsx                     # page d'accueil + recherche
  api/availability/route.ts    # streaming NDJSON (runtime Node)
components/                    # UI (SearchBar, DomainCard, ResultsGrid…)
lib/
  domain-utils.ts              # normalisation du terme, construction des domaines
  tlds.ts                      # liste curatée des extensions (source partagée)
  rdap-bootstrap.ts            # registre IANA TLD → serveur RDAP
  concurrency.ts               # pool à concurrence limitée
  providers/availability/      # adaptateurs : rdap.ts, dns.ts, index.ts
```

La vérification de disponibilité suit une **stratégie hybride** : RDAP en priorité (gratuit,
autoritatif), repli sur une heuristique DNS (présence d'enregistrements NS) si le TLD n'est pas
couvert. Les résultats sont **streamés au fil de l'eau** pour un ressenti temps réel.

## ⚠️ Accès réseau sortant

La vérification RDAP nécessite un accès sortant vers `data.iana.org` (registre bootstrap) et vers
les serveurs RDAP des registres (Verisign, AFNIC, Identity Digital, etc.). En environnement à
**allowlist d'egress**, ces hôtes doivent être autorisés ; sinon l'application bascule
automatiquement sur le repli DNS (qui ne requiert que la résolution DNS standard).

## Tests

Tests unitaires sur la logique métier pure (normalisation, interprétation RDAP, concurrence,
extensions). Lancer `npm test`.
