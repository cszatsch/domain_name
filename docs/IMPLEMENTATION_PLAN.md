# Plan d'implémentation — Recherche de nom de domaine « tout-en-un »

> Outil web qui réunit **disponibilité**, **coût** et **potentiel de visibilité** d'un nom de
> domaine dans une seule interface, en temps réel, à partir d'un simple mot / marque / thème.

---

## 1. Vision & problème résolu

Aujourd'hui, choisir un nom de domaine oblige à jongler entre plusieurs outils dispersés :
un service pour vérifier la disponibilité, un autre pour comparer les prix d'achat et de
renouvellement, un troisième pour évaluer le potentiel SEO du terme. C'est fastidieux et
chronophage.

L'application centralise ces **trois dimensions** en une seule vue :

1. **Disponibilité** — liste des domaines libres pour le terme, déclinés sur les principales
   extensions (`.com`, `.fr`, `.io`, …), affichage progressif en temps réel.
2. **Coût** — prix d'**acquisition** et de **renouvellement** par extension, pour comparer et
   anticiper le budget.
3. **Visibilité** — volume de recherche mensuel, niveau de concurrence, et présence de marques /
   sites déjà positionnés sur le terme.

**Bonus « tout-en-un »** : disponibilité du nom sur les **réseaux sociaux** et **suggestions
automatiques de variantes** (préfixes/suffixes, synonymes, *domain hacks*).

---

## 2. Décisions structurantes (validées)

| Sujet | Choix retenu | Conséquence |
|---|---|---|
| **Stack** | Next.js (App Router) + TypeScript | Une seule base de code ; *streaming* serveur pour le ressenti temps réel ; déploiement Vercel simple. |
| **Sources de données** | Hybride **gratuit → payant** via adaptateurs | On démarre gratuit (RDAP, Porkbun, Datamuse, Google Trends) ; on peut brancher du payant (DataForSEO, SEMrush…) sans réécrire l'app. |
| **Périmètre v1** | Outil simple **sans compte** | Pas d'authentification ni de facturation. Pas de base de données utilisateurs. Focus : vitesse de livraison et validation de l'idée. |

---

## 3. Architecture cible

### 3.1 Vue d'ensemble

```
┌──────────────────────────────────────────────────────────────┐
│                     Navigateur (React / Next)                  │
│  SearchBar → Résultats progressifs (cards dispo+prix, SEO,     │
│  suggestions, réseaux sociaux)                                 │
└───────────────┬───────────────────────────────┬──────────────┘
                │ fetch / SSE (streaming)         │
┌───────────────▼───────────────────────────────▼──────────────┐
│              Next.js Route Handlers (/app/api/*)              │
│   Orchestration · cache · rate-limit · masquage des clés      │
│                                                              │
│   /availability (stream)  /pricing  /seo  /social  /suggestions│
└───┬──────────┬───────────┬──────────┬──────────┬─────────────┘
    │          │           │          │          │
    ▼          ▼           ▼          ▼          ▼
 RDAP/WHOIS  Porkbun    Trends/Ads  Probe HTTP  Datamuse / LLM
 (dispo)     (prix)     (SEO)       (réseaux)   (variantes)
    │          │           │          │          │
    └──────────┴─── Adaptateurs `Provider` (interfaces) ───┘
                         + cache (Upstash Redis / mémoire)
```

### 3.2 Principe clé : le *streaming*

La partie lente est la vérification de disponibilité sur N extensions (un appel réseau RDAP
par TLD). Pour donner le ressenti « instantané » :

- L'endpoint `/api/availability` renvoie un **flux** (`ReadableStream` / SSE).
- Les vérifications tournent **en parallèle** avec une **limite de concurrence** (≈ 8–10) et un
  **timeout** par requête (~4 s).
- Chaque résultat est **poussé dès qu'il est prêt** ; l'UI remplit les cartes au fil de l'eau.

### 3.3 Pattern adaptateur (cœur de la stratégie « hybride »)

Chaque dimension expose une **interface** ; les implémentations concrètes sont
interchangeables et sélectionnées par configuration (variables d'environnement).

```ts
// lib/providers/availability/index.ts
export interface AvailabilityProvider {
  check(domain: string, signal: AbortSignal): Promise<AvailabilityResult>;
}
// Implémentations : RdapProvider (défaut), WhoisProvider (fallback), DnsHeuristicProvider

// lib/providers/pricing/index.ts
export interface PricingProvider {
  getAll(): Promise<Record<Tld, TldPrice>>; // {registration, renewal, transfer, currency}
}
// Implémentations : PorkbunProvider (défaut), NamecheapProvider, GandiProvider…

// lib/providers/seo/index.ts
export interface SeoProvider {
  metrics(term: string): Promise<SeoMetrics>; // {volume?, competition, trend[], competitors[]}
}
// Implémentations : TrendsProvider (défaut, gratuit), GoogleAdsProvider, DataForSeoProvider…

// lib/providers/social/index.ts
export interface SocialProvider {
  check(handle: string): Promise<SocialResult[]>;
}

// lib/providers/suggestions/index.ts
export interface SuggestionProvider {
  generate(term: string): Promise<string[]>; // Datamuse, règles, ou LLM
}
```

→ Passer du gratuit au payant = changer une variable d'env et fournir une clé, **sans toucher à
l'UI ni à l'orchestration**.

### 3.4 Arborescence du projet

```
domain_name/
├─ app/
│  ├─ layout.tsx
│  ├─ page.tsx                  # Landing + barre de recherche + résultats
│  ├─ globals.css
│  └─ api/
│     ├─ availability/route.ts  # streaming (Node runtime)
│     ├─ pricing/route.ts       # cache long (24 h)
│     ├─ seo/route.ts
│     ├─ social/route.ts
│     └─ suggestions/route.ts
├─ components/
│  ├─ SearchBar.tsx
│  ├─ ResultsGrid.tsx
│  ├─ DomainCard.tsx            # nom + badge dispo + prix achat/renouv. + CTA
│  ├─ SeoPanel.tsx              # volume, concurrence, tendance, concurrents
│  ├─ SuggestionsList.tsx
│  ├─ SocialRow.tsx
│  ├─ Filters.tsx              # tri/filtre (prix, extension, dispo only)
│  └─ ui/                       # primitives (Badge, Skeleton, Gauge…)
├─ lib/
│  ├─ providers/               # adaptateurs (voir 3.3)
│  ├─ tlds.ts                   # liste curatée + catégories
│  ├─ domain-utils.ts           # normalisation du terme, génération de variantes, IDN/punycode
│  ├─ rdap-bootstrap.ts         # mapping TLD → serveur RDAP (IANA)
│  ├─ cache.ts                  # abstraction cache (mémoire / Upstash)
│  ├─ ratelimit.ts              # limitation par IP
│  └─ types.ts
├─ tests/                       # unit + intégration ; e2e/ (Playwright)
├─ public/
├─ .env.example
├─ .github/workflows/ci.yml
├─ next.config.ts · tsconfig.json · tailwind.config.ts · eslint / prettier
└─ docs/IMPLEMENTATION_PLAN.md  # ce document
```

---

## 4. Sources de données détaillées (gratuit → payant)

### 4.1 Disponibilité — **RDAP** (gratuit) ✅ pilier solide
- **RDAP** (successeur de WHOIS) : protocole JSON standardisé. Le fichier *bootstrap* de l'IANA
  (`https://data.iana.org/rdap/dns.json`) donne le serveur RDAP de chaque TLD.
- Lecture : **404** sur le serveur RDAP ⇒ domaine probablement **libre** ; **200 + données** ⇒
  **enregistré**. `.fr` est couvert (AFNIC).
- **Fallbacks** : `WhoisProvider` (TLD sans RDAP) puis heuristique **DNS** (présence
  d'enregistrements NS) en dernier recours.
- ⚠️ *Faux négatifs* possibles (noms premium/réservés) → afficher un avertissement « vérification
  finale chez le registrar ».

### 4.2 Prix — **Porkbun** (gratuit, sans clé pour les tarifs) ✅
- Endpoint public `pricing/get` : renvoie pour **chaque TLD** le prix de **registration**,
  **renewal** et **transfer**. Parfait pour le MVP, aucune clé requise.
- Mise en cache **24 h** (les tarifs bougent peu).
- Évolutions : `NamecheapProvider`, `GandiProvider`, `CloudflareProvider` (comparaison multi-registrars).
- 💰 *Piste de monétisation future* : liens d'affiliation vers le registrar le moins cher.

### 4.3 Visibilité / SEO — **le point le plus délicat** ⚠️
C'est la dimension la plus susceptible de nécessiter du payant. Approche progressive :

| Niveau | Source | Données | Coût |
|---|---|---|---|
| **v1 (défaut)** | Google Trends (non officiel) + Google Suggest | Intérêt **relatif**, tendance, termes associés | Gratuit |
| **v1.5** | Google Ads — Keyword Planner (Google Ads API) | Volume mensuel **absolu** (fourchettes), concurrence | Gratuit* |
| **v2 (payant)** | DataForSEO / SEMrush / Ahrefs API | Volume précis, difficulté SEO, **concurrents SERP** | Abonnement |

*Google Ads API : nécessite un compte Google Ads + *developer token* (validation possible sous
quelques jours, accès « basic » limité).

- **Marques / sites déjà positionnés** : nécessite des données SERP. Gratuit limité au début
  (détection de marques connues, nb de résultats) ; **DataForSEO/SerpAPI** en v2 pour la liste
  réelle des concurrents. Étiqueter les estimations comme telles.
- L'interface `SeoProvider` rend ces niveaux interchangeables.

### 4.4 Bonus A — Réseaux sociaux (best-effort)
- Sonde HTTP (`HEAD`/`GET`) sur les URLs de profil (`instagram.com/{h}`, `x.com/{h}`,
  `github.com/{h}`, `tiktok.com/@{h}`, `youtube.com/@{h}`…) ; le **code de statut** indique si le
  handle est pris.
- ⚠️ Fragile et soumis aux **CGU** des plateformes → résultats « indicatifs », exécutés côté
  serveur, avec timeouts ; adaptateur remplaçable par des API officielles.

### 4.5 Bonus B — Suggestions de variantes
- **Datamuse API** (gratuit, sans clé) : synonymes / mots associés (`?ml=`, `?rel_trg=`).
- **Règles algorithmiques** : préfixes/suffixes (`get-`, `try-`, `-app`, `-hq`, `-io`), pluriels,
  *domain hacks* (utiliser le TLD comme fin de mot).
- **Option LLM** (Claude API) : suggestions *brandables* créatives (derrière une variable d'env).
- Chaque suggestion est **re-vérifiée** en disponibilité.

---

## 5. Conception des API internes

| Route | Méthode | Rôle | Cache |
|---|---|---|---|
| `/api/availability` | POST (stream) | Vérifie un lot de domaines, pousse chaque résultat dès qu'il est prêt | 5–15 min/domaine |
| `/api/pricing` | GET | Tarifs par TLD (achat + renouvellement) | 24 h |
| `/api/seo` | GET `?term=` | Volume, concurrence, tendance, concurrents | 24 h |
| `/api/social` | GET `?handle=` | Disponibilité par plateforme | 1 h |
| `/api/suggestions` | GET `?term=` | Variantes générées | 24 h |

- **Runtime Node.js** (pas Edge) pour `/availability` : appels RDAP vers des hôtes variés +
  *streaming*.
- **Validation** des entrées (zod) : normalisation du terme (minuscule, retrait des caractères
  interdits, gestion **IDN/punycode** pour les accents).
- **Masquage des clés** : toutes les clés tierces restent côté serveur.

---

## 6. Cache, limitation de débit & performance

- **Cache** : abstraction `lib/cache.ts` — mémoire en dev, **Upstash Redis** (offre gratuite,
  *serverless-friendly*) en prod. TTL par dimension (cf. tableau §5).
- **Rate limiting** : par **IP** (`@upstash/ratelimit`) — indispensable sans authentification,
  protège l'app et respecte les limites des sources amont.
- **Concurrence & robustesse** amont : pool limité, timeouts, *retry* avec *backoff*, en-têtes
  `User-Agent` corrects.
- **Perf front** : squelettes de chargement, remplissage progressif via le flux, *debounce* de la
  saisie, mémoïsation, images/police optimisées (Next).

---

## 7. Sélection des extensions (TLD)

- **Liste curatée par défaut** (~20) regroupée par catégories :
  - *Génériques* : `.com .net .org .info .biz`
  - *Tech / startup* : `.io .ai .app .dev .tech .xyz .co`
  - *Géo* : `.fr .eu .me`
  - *Business* : `.shop .store .online`
- L'utilisateur peut **filtrer / étendre** la liste. Tri par prix d'achat, prix de renouvellement
  ou extension ; filtre « disponibles uniquement ».

---

## 8. UI / UX

- **Barre de recherche** centrale, proéminente, *autofocus*.
- **Cartes domaine** : nom, badge *Disponible / Pris*, **prix d'achat** + **prix de
  renouvellement**, devise, bouton *Copier* et CTA *Enregistrer* (lien registrar).
- **Panneau Visibilité** : jauge de concurrence, volume mensuel (ou intérêt relatif),
  *sparkline* de tendance, liste des sites/ marques en tête.
- **Suggestions** : variantes brandables, chacune avec son statut de disponibilité.
- **Ligne Réseaux sociaux** : icônes avec disponibilité par plateforme.
- **États** : squelettes pendant le chargement, remplissage progressif, états vides et erreurs
  clairs.
- **Responsive**, accessible (a11y, navigation clavier, contrastes), rapide.

---

## 9. Qualité, sécurité & conformité

- **Tests** : unitaires (providers mockés, `domain-utils`), intégration (route handlers), **E2E
  Playwright** (parcours de recherche). Objectif de couverture raisonnable sur la logique métier.
- **CI** (GitHub Actions) : `lint` + `typecheck` + `test` + `build` à chaque push/PR.
- **Sécurité** : clés tierces côté serveur uniquement, validation/sanitisation des entrées,
  *rate-limit* par IP, en-têtes de sécurité (CSP, etc.).
- **Conformité** : ne pas stocker de PII issues du WHOIS/RDAP ; respecter les CGU des plateformes
  sociales (résultats best-effort) ; analytics *privacy-friendly* (ex. Plausible) — RGPD allégé
  car pas de comptes.
- **Transparence** : étiqueter clairement les données estimées (SEO, réseaux sociaux) et inviter
  à une vérification finale chez le registrar.

---

## 10. Déploiement

- **Vercel** (natif Next.js). Variables d'environnement pour les clés et le choix des providers.
- **Upstash Redis** pour cache + rate-limit (offre gratuite).
- Route `/availability` en **runtime Node** ; veiller aux limites de durée des fonctions
  *serverless* (le *streaming* permet d'envoyer des résultats avant la fin globale).
- `.env.example` documenté ; *preview deployments* par branche.

---

## 11. Phasage & jalons

> Estimations indicatives pour **1 développeur** ; les phases 1–2 livrent déjà un outil utile.

### Phase 0 — Fondations ✅
- [x] Scaffold Next.js (App Router) + TypeScript + Tailwind
- [x] ESLint, `tsconfig` strict *(Prettier non ajouté pour l'instant)*
- [x] CI GitHub Actions (lint, typecheck, test, build)
- [x] `.env.example`, `lib/types.ts`, `lib/tlds.ts`

### Phase 1 — Disponibilité (cœur) ✅
- [x] `rdap-bootstrap.ts` (mapping IANA, mis en cache 24 h)
- [x] `RdapProvider` + repli **DNS** *(WHOIS prévu ultérieurement)*
- [x] `/api/availability` en **streaming** NDJSON (concurrence + timeouts + abort)
- [x] `domain-utils.ts` (normalisation ; IDN/punycode complet à venir)
- [x] UI : `SearchBar`, `ResultsGrid`, `DomainCard` (dispo), remplissage progressif, filtre « dispo only »
- [x] Tests Vitest (util, RDAP, concurrence, TLD) — 21 tests verts

### Phase 2 — Prix ✅
- [x] `PorkbunProvider` + `/api/pricing` (cache 24 h, en-têtes CDN, dégradation 502 propre)
- [x] Fusion prix (achat + renouvellement) dans les cartes
- [x] `Filters` : tri par prix d'achat/renouvellement, « disponibles d'abord », filtre « dispo only »
      *(ordre par défaut = par extension ; filtre par catégorie à venir)*

### Phase 3 — Visibilité / SEO ✅
- [x] `SeoProvider` (défaut gratuit : **Google Suggest** + **Wikipédia**) + `/api/seo` (cache 24 h)
      *(Google Trends écarté : non officiel et fragile)*
- [x] `SeoPanel` : volume (— en gratuit), jauge de concurrence (estimation), notoriété Wikipédia, recherches associées
- [x] Estimation de concurrence pure et testée ; tolérance aux pannes (`Promise.allSettled`)
- [ ] Volume absolu + concurrents SERP : nécessitent une source payante (DataForSEO/SEMrush) — adaptateur prêt
- [ ] (Optionnel) `GoogleAdsProvider` si *developer token* obtenu

### Phase 4 — Bonus : suggestions + réseaux sociaux ✅
- [x] `SuggestionProvider` (Datamuse + règles) + `/api/suggestions` — variantes re-vérifiées en dispo (.com)
- [x] `SocialProvider` (sonde HTTP best-effort : GitHub, Instagram, X, TikTok, YouTube) + `/api/social`
- [x] `SuggestionsList` (cliquable → nouvelle recherche), `SocialRow`
- [x] Fonctions pures testées (règles, parsing Datamuse, statut social) ; chargées en parallèle
- [ ] Option LLM (Claude API) pour des suggestions *brandables* — adaptateur prêt (clé requise)

### Phase 5 — Durcissement & mise en prod *(~1,5–2 j)*
- [ ] Cache Upstash + rate-limit par IP
- [ ] Gestion d'erreurs/timeouts robuste, en-têtes de sécurité
- [ ] a11y, perf, SEO méta, *états vides/erreur*
- [ ] E2E Playwright, déploiement Vercel + analytics

**Total indicatif : ~9–13 jours** pour une v1 complète et soignée.

---

## 12. Risques & mitigations

| Risque | Impact | Mitigation |
|---|---|---|
| Trous de couverture RDAP | Dispo manquante sur certains TLD | Fallback WHOIS puis heuristique DNS |
| *Rate-limit* / blocage amont | Erreurs, lenteur | Cache, concurrence limitée, *backoff*, UA correct |
| Données SEO gratuites limitées / délai Google Ads | Visibilité moins précise au début | Démarrer en Trends (estimations étiquetées), adapter vers DataForSEO en v2 |
| Fragilité / CGU réseaux sociaux | Faux résultats, blocages | Best-effort, étiqueté, adaptateur remplaçable |
| Faux « disponible » (premium/réservé) | Confiance utilisateur | Avertissement + vérification finale registrar |
| Limites *serverless* (durée) | Timeout sur gros lots | Streaming, concurrence, lots raisonnables |

---

## 13. Mesures de succès (KPI)

- Temps jusqu'au **premier résultat** affiché (< 1 s perçu grâce au streaming).
- Temps pour une vue complète (dispo + prix) sur ~20 TLD.
- Taux de clics sur les CTA *Enregistrer* (signal de valeur / future monétisation).
- Part de recherches aboutissant à un domaine copié/retenu.

---

## 14. Évolutions futures (au-delà de la v1)

- **Comptes & SaaS** : historique, favoris, alertes de disponibilité, quotas, facturation.
- **Multi-registrars** : comparaison de prix + **liens d'affiliation** (monétisation).
- **SEO premium** : DataForSEO/SEMrush pour difficulté SEO et concurrents réels.
- **IA** : génération de noms *brandables*, scoring global « achetabilité » combinant les 3 piliers.
- **API publique** et extension navigateur.

---

## 15. Prochaine étape proposée

Démarrer la **Phase 0 + Phase 1** : scaffold du projet et pilier **disponibilité en streaming**
(RDAP), qui constitue à lui seul un premier outil démontrable. Le reste se branche ensuite via les
adaptateurs, sans refonte.
