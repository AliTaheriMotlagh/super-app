export type MicroAppKind = 'list'|'habit'|'wheel'|'converter'|'budget'|'writer'|'dog'|'score'|'calendar'|'audio'|'midpoint'|'countdown'|'grid'|'counter'|'playlist'|'shipped';

export interface MicroAppDefinition {
  slug: string;
  title: string;
  domain: string;
  pitch: string;
  kind: MicroAppKind;
  fields: string[];
  service: string;
  repoUrl?: string | null;
}

export const MICRO_APPS: readonly MicroAppDefinition[] = [
  {
    "slug": "siktir-extension",
    "title": "Siktir Chrome Extension",
    "domain": "utilities",
    "pitch": "Capture selected text or links and save them into a Siktir-style inbox.",
    "kind": "list",
    "fields": [
      "text",
      "url"
    ],
    "service": "utility-service",
    "repoUrl": null
  },
  {
    "slug": "mini-ecommerce",
    "title": "Mini E-commerce",
    "domain": "commerce",
    "pitch": "Create products and a tiny storefront in seconds.",
    "kind": "list",
    "fields": [
      "product",
      "price",
      "contact"
    ],
    "service": "commerce-service",
    "repoUrl": null
  },
  {
    "slug": "pachegir",
    "title": "PacheGir",
    "domain": "life",
    "pitch": "Accountability tasks that stay visible until you finish them.",
    "kind": "habit",
    "fields": [
      "task",
      "deadline"
    ],
    "service": "productivity-service",
    "repoUrl": null
  },
  {
    "slug": "gomshodami",
    "title": "Gomshodami?",
    "domain": "local",
    "pitch": "Post lost/found items with a simple location note.",
    "kind": "list",
    "fields": [
      "item",
      "location",
      "status",
      "contact"
    ],
    "service": "geo-service",
    "repoUrl": null
  },
  {
    "slug": "mantoraham",
    "title": "manToRaHam",
    "domain": "social",
    "pitch": "Secret mutual-interest matcher. Reveal only when both sides match.",
    "kind": "list",
    "fields": [
      "from",
      "to"
    ],
    "service": "social-service",
    "repoUrl": null
  },
  {
    "slug": "gtavaghei",
    "title": "GTAVagheI",
    "domain": "games",
    "pitch": "Harmless real-world missions, XP and quick challenges.",
    "kind": "habit",
    "fields": [
      "mission",
      "location"
    ],
    "service": "geo-service",
    "repoUrl": null
  },
  {
    "slug": "misham",
    "title": "MiSham",
    "domain": "life",
    "pitch": "Choose who you want to become and do one tiny action today.",
    "kind": "habit",
    "fields": [
      "identity",
      "action"
    ],
    "service": "productivity-service",
    "repoUrl": null
  },
  {
    "slug": "rapkhone",
    "title": "RapKhone",
    "domain": "media",
    "pitch": "Post verses, beat notes and reactions in a tiny rap community.",
    "kind": "list",
    "fields": [
      "artist",
      "verse",
      "audioUrl"
    ],
    "service": "media-service",
    "repoUrl": null
  },
  {
    "slug": "shabmiyaram",
    "title": "ShabMiyaram",
    "domain": "commerce",
    "pitch": "Post a local request for something you need tonight.",
    "kind": "list",
    "fields": [
      "need",
      "area",
      "contact"
    ],
    "service": "commerce-service",
    "repoUrl": null
  },
  {
    "slug": "ghorekeshi",
    "title": "GhoreKeshi Khonevadegi",
    "domain": "games",
    "pitch": "Family lottery wheel for chores, prizes and decisions.",
    "kind": "wheel",
    "fields": [
      "participants"
    ],
    "service": "game-service",
    "repoUrl": null
  },
  {
    "slug": "tabdile-pool",
    "title": "Tabdile Pool Extension",
    "domain": "finance",
    "pitch": "Live currency conversion plus a companion Chrome extension.",
    "kind": "converter",
    "fields": [
      "amount",
      "from",
      "to"
    ],
    "service": "finance-service",
    "repoUrl": null
  },
  {
    "slug": "photocopy-chat",
    "title": "Photocopy Chat",
    "domain": "social",
    "pitch": "Create a small disposable conversation and freeze a read-only copy.",
    "kind": "list",
    "fields": [
      "room",
      "name",
      "message"
    ],
    "service": "social-service",
    "repoUrl": null
  },
  {
    "slug": "hesabdari",
    "title": "Hesabdari Shakhsi",
    "domain": "finance",
    "pitch": "Personal income/expense tracker with live balance.",
    "kind": "budget",
    "fields": [
      "description",
      "amount",
      "type"
    ],
    "service": "finance-service",
    "repoUrl": null
  },
  {
    "slug": "wiki-fa",
    "title": "Tarjome Wikipedia",
    "domain": "life",
    "pitch": "Keep a Persian reading and translation workspace for Wikipedia sections.",
    "kind": "writer",
    "fields": [
      "text"
    ],
    "service": "content-service",
    "repoUrl": null
  },
  {
    "slug": "dog-toilet",
    "title": "Dog Toilet Game",
    "domain": "games",
    "pitch": "A tiny game: keep moving until the dog finds the right spot.",
    "kind": "dog",
    "fields": [
      "move"
    ],
    "service": "game-service",
    "repoUrl": null
  },
  {
    "slug": "class-to-rahi",
    "title": "Class Too Rahi",
    "domain": "life",
    "pitch": "Pick your commute length and get a lesson-sized session.",
    "kind": "list",
    "fields": [
      "topic",
      "minutes"
    ],
    "service": "content-service",
    "repoUrl": null
  },
  {
    "slug": "khalabanan",
    "title": "Khalabanan",
    "domain": "games",
    "pitch": "Tiny takeoff and landing score challenge.",
    "kind": "score",
    "fields": [
      "score"
    ],
    "service": "game-service",
    "repoUrl": null
  },
  {
    "slug": "snap-maghsoud",
    "title": "Snap-e-Maghsoud",
    "domain": "local",
    "pitch": "Share one destination and collect participant ETAs.",
    "kind": "list",
    "fields": [
      "person",
      "eta",
      "destination"
    ],
    "service": "geo-service",
    "repoUrl": null
  },
  {
    "slug": "shared-investment",
    "title": "Sarmaye Gozari Moshtarak",
    "domain": "finance",
    "pitch": "Track shared pledges and ownership percentages without holding money.",
    "kind": "budget",
    "fields": [
      "person",
      "amount",
      "type"
    ],
    "service": "finance-service",
    "repoUrl": null
  },
  {
    "slug": "diet-order",
    "title": "Rejhim Bede, Ghaza Begir",
    "domain": "life",
    "pitch": "Pick a calorie target and get a meal-sized suggestion.",
    "kind": "list",
    "fields": [
      "calories",
      "meal"
    ],
    "service": "productivity-service",
    "repoUrl": null
  },
  {
    "slug": "silent-zang-khor",
    "title": "Silent Zang Khor",
    "domain": "utilities",
    "pitch": "Prototype schedules for when calls should stay silent.",
    "kind": "list",
    "fields": [
      "profile",
      "window"
    ],
    "service": "notification-service",
    "repoUrl": null
  },
  {
    "slug": "selda",
    "title": "App Baraye Selda",
    "domain": "life",
    "pitch": "A deliberately tiny personal helper for one recurring workflow.",
    "kind": "list",
    "fields": [
      "task",
      "when"
    ],
    "service": "productivity-service",
    "repoUrl": null
  },
  {
    "slug": "dozdgir",
    "title": "DozdGir Instagram",
    "domain": "impact",
    "pitch": "Compare a real profile and suspicious impersonation profile notes.",
    "kind": "list",
    "fields": [
      "realProfile",
      "suspectProfile",
      "evidence"
    ],
    "service": "social-service",
    "repoUrl": null
  },
  {
    "slug": "calendar-social",
    "title": "Social Network + Calendar",
    "domain": "social",
    "pitch": "Posts live on dates instead of an infinite feed.",
    "kind": "calendar",
    "fields": [
      "date",
      "post"
    ],
    "service": "social-service",
    "repoUrl": null
  },
  {
    "slug": "building",
    "title": "Modiriyate Sakhtemoon",
    "domain": "commerce",
    "pitch": "Track units, monthly charges and paid or unpaid status.",
    "kind": "list",
    "fields": [
      "unit",
      "charge",
      "status"
    ],
    "service": "commerce-service",
    "repoUrl": null
  },
  {
    "slug": "jaa",
    "title": "Jaa",
    "domain": "local",
    "pitch": "Location-first restaurant list prototype.",
    "kind": "list",
    "fields": [
      "restaurant",
      "area",
      "category"
    ],
    "service": "geo-service",
    "repoUrl": null
  },
  {
    "slug": "diroozeto",
    "title": "Diroozeto Begoo",
    "domain": "social",
    "pitch": "One short answer per day: what happened yesterday?",
    "kind": "calendar",
    "fields": [
      "date",
      "entry"
    ],
    "service": "social-service",
    "repoUrl": null
  },
  {
    "slug": "food-on-time",
    "title": "Sefaresh Ghaza Sare Moed",
    "domain": "commerce",
    "pitch": "Schedule what you want to order and when.",
    "kind": "list",
    "fields": [
      "meal",
      "time"
    ],
    "service": "commerce-service",
    "repoUrl": null
  },
  {
    "slug": "noisegir",
    "title": "NoiseGir-e Sedabardar",
    "domain": "media",
    "pitch": "Load audio and audition a browser audio preview.",
    "kind": "audio",
    "fields": [
      "audio"
    ],
    "service": "media-service",
    "repoUrl": null
  },
  {
    "slug": "classic-cinema",
    "title": "Cinema Online Film Classic",
    "domain": "media",
    "pitch": "A scheduled virtual screening-room prototype.",
    "kind": "list",
    "fields": [
      "film",
      "time",
      "url"
    ],
    "service": "media-service",
    "repoUrl": null
  },
  {
    "slug": "mahale-gharar",
    "title": "Mahale Gharar",
    "domain": "local",
    "pitch": "Calculate the geographic midpoint between two coordinates.",
    "kind": "midpoint",
    "fields": [
      "lat1",
      "lng1",
      "lat2",
      "lng2"
    ],
    "service": "geo-service",
    "repoUrl": null
  },
  {
    "slug": "timed-file",
    "title": "Felan Tarikh Felan File Omoomi She",
    "domain": "utilities",
    "pitch": "Attach a file locally and set the time when it should unlock.",
    "kind": "countdown",
    "fields": [
      "unlockAt"
    ],
    "service": "utility-service",
    "repoUrl": null
  },
  {
    "slug": "birthday-social",
    "title": "Birthday Social Network",
    "domain": "social",
    "pitch": "Track friends birthdays and upcoming days.",
    "kind": "calendar",
    "fields": [
      "date",
      "person"
    ],
    "service": "social-service",
    "repoUrl": null
  },
  {
    "slug": "restaurant-explorer",
    "title": "Restaurant Location Explorer",
    "domain": "local",
    "pitch": "Explore a small restaurant dataset by neighborhood and category.",
    "kind": "list",
    "fields": [
      "restaurant",
      "area",
      "category"
    ],
    "service": "geo-service",
    "repoUrl": null
  },
  {
    "slug": "msg-location",
    "title": "MSG Be Ye Loc",
    "domain": "local",
    "pitch": "Leave a message attached to a coordinate and radius.",
    "kind": "list",
    "fields": [
      "message",
      "coordinate",
      "radius"
    ],
    "service": "geo-service",
    "repoUrl": null
  },
  {
    "slug": "class-venue",
    "title": "Mahale Bargozariye Class",
    "domain": "commerce",
    "pitch": "List small spaces that can host a class or workshop.",
    "kind": "list",
    "fields": [
      "venue",
      "capacity",
      "price",
      "contact"
    ],
    "service": "commerce-service",
    "repoUrl": null
  },
  {
    "slug": "grid-camera",
    "title": "Grid Camera Custom",
    "domain": "utilities",
    "pitch": "Design a custom composition grid overlay.",
    "kind": "grid",
    "fields": [
      "columns",
      "rows"
    ],
    "service": "utility-service",
    "repoUrl": null
  },
  {
    "slug": "nevesht",
    "title": "Nevesht",
    "domain": "utilities",
    "pitch": "Distraction-free Persian-friendly writing with autosave.",
    "kind": "writer",
    "fields": [
      "text"
    ],
    "service": "content-service",
    "repoUrl": null
  },
  {
    "slug": "tree-donate",
    "title": "Derakht Kari Donate",
    "domain": "impact",
    "pitch": "Turn a donation pledge into a visible tree count.",
    "kind": "counter",
    "fields": [
      "amount"
    ],
    "service": "impact-service",
    "repoUrl": null
  },
  {
    "slug": "book-social",
    "title": "Kholase Ketab Social",
    "domain": "social",
    "pitch": "Share short book insights in a compact feed.",
    "kind": "list",
    "fields": [
      "book",
      "insight"
    ],
    "service": "social-service",
    "repoUrl": null
  },
  {
    "slug": "tweet-playlist",
    "title": "Twitter Playlist Generator",
    "domain": "media",
    "pitch": "Paste Artist - Song lines and turn them into a playlist.",
    "kind": "playlist",
    "fields": [
      "text"
    ],
    "service": "media-service",
    "repoUrl": null
  },
  {
    "slug": "siktir",
    "title": "Siktir",
    "domain": "impact",
    "pitch": "Existing shipped project.",
    "kind": "shipped",
    "fields": [
      "url"
    ],
    "service": "social-service",
    "repoUrl": "https://github.com/AliTaheriMotlagh/siktir-frontend"
  },
  {
    "slug": "kadosorosh",
    "title": "KadoSorosh",
    "domain": "impact",
    "pitch": "Existing shipped project entry.",
    "kind": "shipped",
    "fields": [
      "url"
    ],
    "service": "commerce-service",
    "repoUrl": null
  },
  {
    "slug": "vasatyab",
    "title": "VasatYab",
    "domain": "local",
    "pitch": "Existing shipped midpoint project.",
    "kind": "shipped",
    "fields": [
      "url"
    ],
    "service": "geo-service",
    "repoUrl": "https://github.com/AliTaheriMotlagh/vasat-yab"
  }
];

export const MICRO_APP_BY_SLUG = new Map(MICRO_APPS.map((app) => [app.slug, app]));
export const MICRO_APP_DOMAINS = [...new Set(MICRO_APPS.map((app) => app.domain))];
