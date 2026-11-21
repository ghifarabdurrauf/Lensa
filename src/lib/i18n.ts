import type { Locale, Track } from "./types";

const id = {
  app: { name: "Lensa", tagline: "Pelacak lowongan, beasiswa, dan kampus S2" },
  nav: {
    home: "Ringkasan", job: "Lowongan", scholarship: "Beasiswa", university: "Universitas",
    settings: "Pengaturan", tracks: "Jalur", tools: "Alat", homeShort: "Ringkas", jobShort: "Kerja",
    scholarshipShort: "Beasiswa", universityShort: "Kampus",
  },
  track: { job: "Lowongan", scholarship: "Beasiswa", university: "Universitas" },
  trackOne: { job: "lowongan", scholarship: "beasiswa", university: "kampus" },
  status: {
    saved: "Disimpan", applied: "Dilamar", test: "Tes", interview: "Wawancara", offer: "Tawaran",
    research: "Riset", preparing: "Persiapan", submitted: "Terkirim", selection: "Seleksi", accepted: "Diterima",
    not_applied: "Belum daftar", loa_conditional: "LoA bersyarat", loa_unconditional: "LoA tanpa syarat",
    rejected: "Ditolak",
  },
  priority: { high: "Tinggi", medium: "Sedang", low: "Rendah" },
  common: {
    add: "Tambah", save: "Simpan", cancel: "Batal", delete: "Hapus", edit: "Ubah", close: "Tutup",
    search: "Cari", all: "Semua", favorites: "Favorit", noDeadline: "Tanpa tenggat",
    daysLeft: (n: number) => (n === 0 ? "Hari ini" : n === 1 ? "Besok" : `${n} hari`),
    daysAgo: (n: number) => `Lewat ${n} hari`,
    days: "hari", today: "Hari ini", loading: "Memuat…", saving: "Menyimpan…", saved: "Tersimpan",
    deleted: "Dihapus", confirmDelete: "Hapus data ini? Tindakan ini tidak bisa dibatalkan.",
    openLink: "Buka tautan", empty: "Belum ada data", seeAll: "Lihat semua", sort: "Urutkan",
    board: "Papan", list: "Daftar", demo: "Mode demo: data tersimpan di browser ini saja",
    signOut: "Keluar", opens: "Dibuka", favoriteOn: "Ditambahkan ke favorit", favoriteOff: "Dihapus dari favorit",
    statusChanged: "Status diubah", moveTo: "Pindahkan ke", error: "Terjadi kesalahan. Coba lagi.",
  },
  sort: { deadline: "Tenggat terdekat", updated: "Terakhir diubah", title: "Nama", priority: "Prioritas" },
  home: {
    greeting: (n: string) => `Halo, ${n}`,
    next: "Tenggat berikutnya", readiness: "Kemajuan per jalur",
    progressSub: (a: number, b: number) => `${a} dari ${b} berjalan`,
    month: "Bulan ini", active: "Lamaran aktif", upcoming: "7 hari ke depan",
    nothingDue: "Tidak ada tenggat dalam 7 hari. Waktu yang pas untuk menyiapkan dokumen.",
    emptyTitle: "Mulai dari satu lamaran",
    emptyBody: "Tambahkan lowongan, beasiswa, atau kampus yang sedang kamu incar. Tenggat dan statusnya akan muncul di sini.",
    noNext: "Belum ada tenggat yang akan datang",
    stats: { tracked: "dilacak", active: "aktif", favorites: "favorit" },
  },
  form: {
    newTitle: (t: string) => `Tambah ${t}`, editTitle: (t: string) => `Ubah ${t}`,
    title: { job: "Posisi", scholarship: "Nama beasiswa", university: "Nama kampus" },
    titlePh: { job: "Management Trainee, Supply Chain", scholarship: "LPDP Reguler", university: "Wageningen University" },
    organization: { job: "Perusahaan", scholarship: "Penyelenggara", university: "Fakultas atau sekolah" },
    country: "Negara", city: "Kota", url: "Tautan", deadline: "Tenggat", opensAt: "Tanggal dibuka",
    status: "Status", priority: "Prioritas", notes: "Catatan",
    notesPh: "Syarat yang belum terpenuhi, kontak, atau hal yang perlu diingat",
    employmentType: "Jenis pekerjaan", workMode: "Lokasi kerja", source: "Sumber lowongan", salary: "Gaji",
    coverage: "Cakupan dana", level: "Jenjang", benefits: "Manfaat", requirements: "Persyaratan",
    program: "Program studi", intake: "Mulai kuliah", tuition: "Biaya kuliah per tahun", ieltsMin: "IELTS minimal",
    required: "Wajib diisi", details: "Detail",
  },
  opt: {
    full_time: "Penuh waktu", internship: "Magang", contract: "Kontrak", part_time: "Paruh waktu",
    onsite: "Di kantor", hybrid: "Hibrida", remote: "Jarak jauh",
    full: "Penuh", partial: "Sebagian", s2: "S2", s3: "S3", exchange: "Pertukaran",
  },
  detail: { history: "Riwayat status", created: "Ditambahkan", noNotes: "Belum ada catatan", stages: "Tahapan" },
  board: { dropHere: "Geser kartu ke sini", emptyCol: "Kosong" },
  settings: {
    title: "Pengaturan", profile: "Profil", name: "Nama tampilan", language: "Bahasa", theme: "Tema",
    light: "Terang", dark: "Gelap", auto: "Otomatis", palette: "Palet warna",
    sage: "Sage", sand: "Pasir", stone: "Batu", account: "Akun", data: "Data",
    export: "Unduh data (CSV)", exportSub: "Semua lowongan, beasiswa, dan kampus dalam satu file",
    integrations: "Integrasi", soon: "Fase berikutnya",
    soonBody: "Kalender, dokumen, dan pengingat email ditambahkan di fase 2.",
  },
  login: {
    title: "Masuk ke Lensa", sub: "Satu tempat untuk semua lamaran kerja, beasiswa, dan kampus S2.",
    email: "Email", emailPh: "nama@email.com", send: "Kirim tautan masuk",
    sent: "Cek email kamu. Klik tautan di dalamnya untuk masuk.", or: "atau", github: "Masuk dengan GitHub",
    demo: "Coba tanpa akun", noBackend: "Database belum disambungkan. Kamu bisa mencoba mode demo dulu.",
  },
  empty: {
    job: "Belum ada lowongan. Tambahkan yang sedang kamu incar.",
    scholarship: "Belum ada beasiswa. Tambahkan yang ingin kamu lamar.",
    university: "Belum ada kampus. Tambahkan kampus S2 incaranmu.",
    filtered: "Tidak ada yang cocok dengan filter ini.",
  },
};

type Dict = typeof id;

const en: Dict = {
  app: { name: "Lensa", tagline: "Tracker for jobs, scholarships and master's programmes" },
  nav: {
    home: "Overview", job: "Jobs", scholarship: "Scholarships", university: "Universities",
    settings: "Settings", tracks: "Tracks", tools: "Tools", homeShort: "Overview", jobShort: "Jobs",
    scholarshipShort: "Grants", universityShort: "Campus",
  },
  track: { job: "Jobs", scholarship: "Scholarships", university: "Universities" },
  trackOne: { job: "job", scholarship: "scholarship", university: "university" },
  status: {
    saved: "Saved", applied: "Applied", test: "Test", interview: "Interview", offer: "Offer",
    research: "Research", preparing: "Preparing", submitted: "Submitted", selection: "Selection", accepted: "Accepted",
    not_applied: "Not applied", loa_conditional: "Conditional offer", loa_unconditional: "Unconditional offer",
    rejected: "Rejected",
  },
  priority: { high: "High", medium: "Medium", low: "Low" },
  common: {
    add: "Add", save: "Save", cancel: "Cancel", delete: "Delete", edit: "Edit", close: "Close",
    search: "Search", all: "All", favorites: "Favourites", noDeadline: "No deadline",
    daysLeft: (n: number) => (n === 0 ? "Today" : n === 1 ? "Tomorrow" : `${n} days`),
    daysAgo: (n: number) => `${n} days ago`,
    days: "days", today: "Today", loading: "Loading…", saving: "Saving…", saved: "Saved",
    deleted: "Deleted", confirmDelete: "Delete this entry? This can't be undone.",
    openLink: "Open link", empty: "Nothing here yet", seeAll: "See all", sort: "Sort",
    board: "Board", list: "List", demo: "Demo mode: data stays in this browser only",
    signOut: "Sign out", opens: "Opens", favoriteOn: "Added to favourites", favoriteOff: "Removed from favourites",
    statusChanged: "Status updated", moveTo: "Move to", error: "Something went wrong. Try again.",
  },
  sort: { deadline: "Closest deadline", updated: "Recently changed", title: "Name", priority: "Priority" },
  home: {
    greeting: (n: string) => `Hi, ${n}`,
    next: "Next deadline", readiness: "Progress by track",
    progressSub: (a: number, b: number) => `${a} of ${b} in progress`,
    month: "This month", active: "Active applications", upcoming: "Next 7 days",
    nothingDue: "Nothing due in the next 7 days. A good moment to prepare documents.",
    emptyTitle: "Start with one application",
    emptyBody: "Add a job, scholarship or university you're aiming for. Deadlines and status will show up here.",
    noNext: "No upcoming deadlines",
    stats: { tracked: "tracked", active: "active", favorites: "favourites" },
  },
  form: {
    newTitle: (t: string) => `Add ${t}`, editTitle: (t: string) => `Edit ${t}`,
    title: { job: "Position", scholarship: "Scholarship name", university: "University" },
    titlePh: { job: "Management Trainee, Supply Chain", scholarship: "Chevening Scholarship", university: "Wageningen University" },
    organization: { job: "Company", scholarship: "Provider", university: "Faculty or school" },
    country: "Country", city: "City", url: "Link", deadline: "Deadline", opensAt: "Opens on",
    status: "Status", priority: "Priority", notes: "Notes",
    notesPh: "Requirements you don't meet yet, contacts, or anything to remember",
    employmentType: "Employment type", workMode: "Work mode", source: "Found on", salary: "Salary",
    coverage: "Funding", level: "Level", benefits: "Benefits", requirements: "Requirements",
    program: "Programme", intake: "Intake", tuition: "Tuition per year", ieltsMin: "Minimum IELTS",
    required: "Required", details: "Details",
  },
  opt: {
    full_time: "Full-time", internship: "Internship", contract: "Contract", part_time: "Part-time",
    onsite: "On-site", hybrid: "Hybrid", remote: "Remote",
    full: "Full", partial: "Partial", s2: "Master's", s3: "PhD", exchange: "Exchange",
  },
  detail: { history: "Status history", created: "Added", noNotes: "No notes yet", stages: "Stages" },
  board: { dropHere: "Drop a card here", emptyCol: "Empty" },
  settings: {
    title: "Settings", profile: "Profile", name: "Display name", language: "Language", theme: "Theme",
    light: "Light", dark: "Dark", auto: "Automatic", palette: "Colour palette",
    sage: "Sage", sand: "Sand", stone: "Stone", account: "Account", data: "Data",
    export: "Download data (CSV)", exportSub: "All jobs, scholarships and universities in one file",
    integrations: "Integrations", soon: "Next phase",
    soonBody: "Calendar, documents and email reminders arrive in phase 2.",
  },
  login: {
    title: "Sign in to Lensa", sub: "One place for every job, scholarship and master's application.",
    email: "Email", emailPh: "name@email.com", send: "Send sign-in link",
    sent: "Check your inbox and click the link to sign in.", or: "or", github: "Continue with GitHub",
    demo: "Try without an account", noBackend: "The database isn't connected yet. You can try demo mode first.",
  },
  empty: {
    job: "No jobs yet. Add the ones you're aiming for.",
    scholarship: "No scholarships yet. Add the ones you want to apply to.",
    university: "No universities yet. Add the programmes you're considering.",
    filtered: "Nothing matches this filter.",
  },
};

const fr: Dict = {
  app: { name: "Lensa", tagline: "Suivi des offres, bourses et masters" },
  nav: {
    home: "Aperçu", job: "Emplois", scholarship: "Bourses", university: "Universités",
    settings: "Réglages", tracks: "Parcours", tools: "Outils", homeShort: "Aperçu", jobShort: "Emplois",
    scholarshipShort: "Bourses", universityShort: "Campus",
  },
  track: { job: "Emplois", scholarship: "Bourses", university: "Universités" },
  trackOne: { job: "offre", scholarship: "bourse", university: "université" },
  status: {
    saved: "Enregistrée", applied: "Candidature envoyée", test: "Test", interview: "Entretien", offer: "Offre",
    research: "Recherche", preparing: "Préparation", submitted: "Envoyée", selection: "Sélection", accepted: "Acceptée",
    not_applied: "Pas encore", loa_conditional: "Admission sous condition", loa_unconditional: "Admission définitive",
    rejected: "Refusée",
  },
  priority: { high: "Haute", medium: "Moyenne", low: "Basse" },
  common: {
    add: "Ajouter", save: "Enregistrer", cancel: "Annuler", delete: "Supprimer", edit: "Modifier", close: "Fermer",
    search: "Rechercher", all: "Tout", favorites: "Favoris", noDeadline: "Sans échéance",
    daysLeft: (n: number) => (n === 0 ? "Aujourd’hui" : n === 1 ? "Demain" : `${n} jours`),
    daysAgo: (n: number) => `Il y a ${n} jours`,
    days: "jours", today: "Aujourd’hui", loading: "Chargement…", saving: "Enregistrement…", saved: "Enregistré",
    deleted: "Supprimé", confirmDelete: "Supprimer cette fiche ? Impossible d’annuler.",
    openLink: "Ouvrir le lien", empty: "Rien pour l’instant", seeAll: "Tout voir", sort: "Trier",
    board: "Tableau", list: "Liste", demo: "Mode démo : les données restent dans ce navigateur",
    signOut: "Se déconnecter", opens: "Ouverture", favoriteOn: "Ajouté aux favoris", favoriteOff: "Retiré des favoris",
    statusChanged: "Statut mis à jour", moveTo: "Déplacer vers", error: "Une erreur est survenue. Réessayez.",
  },
  sort: { deadline: "Échéance la plus proche", updated: "Modifié récemment", title: "Nom", priority: "Priorité" },
  home: {
    greeting: (n: string) => `Bonjour, ${n}`,
    next: "Prochaine échéance", readiness: "Avancement par parcours",
    progressSub: (a: number, b: number) => `${a} sur ${b} en cours`,
    month: "Ce mois-ci", active: "Candidatures actives", upcoming: "7 prochains jours",
    nothingDue: "Aucune échéance dans les 7 jours. Le bon moment pour préparer vos documents.",
    emptyTitle: "Commencez par une candidature",
    emptyBody: "Ajoutez une offre, une bourse ou une université visée. Échéances et statuts apparaîtront ici.",
    noNext: "Aucune échéance à venir",
    stats: { tracked: "suivies", active: "actives", favorites: "favoris" },
  },
  form: {
    newTitle: (t: string) => `Ajouter une ${t}`, editTitle: (t: string) => `Modifier la ${t}`,
    title: { job: "Poste", scholarship: "Nom de la bourse", university: "Université" },
    titlePh: { job: "Management Trainee, Supply Chain", scholarship: "Bourse Eiffel", university: "Grenoble INP" },
    organization: { job: "Entreprise", scholarship: "Organisme", university: "Faculté ou école" },
    country: "Pays", city: "Ville", url: "Lien", deadline: "Échéance", opensAt: "Ouverture",
    status: "Statut", priority: "Priorité", notes: "Notes",
    notesPh: "Conditions pas encore remplies, contacts, choses à retenir",
    employmentType: "Type de contrat", workMode: "Mode de travail", source: "Source", salary: "Salaire",
    coverage: "Financement", level: "Niveau", benefits: "Avantages", requirements: "Pièces requises",
    program: "Programme", intake: "Rentrée", tuition: "Frais par an", ieltsMin: "IELTS minimum",
    required: "Obligatoire", details: "Détails",
  },
  opt: {
    full_time: "Temps plein", internship: "Stage", contract: "CDD", part_time: "Temps partiel",
    onsite: "Sur site", hybrid: "Hybride", remote: "Télétravail",
    full: "Totale", partial: "Partielle", s2: "Master", s3: "Doctorat", exchange: "Échange",
  },
  detail: { history: "Historique", created: "Ajoutée", noNotes: "Pas encore de notes", stages: "Étapes" },
  board: { dropHere: "Déposez une carte ici", emptyCol: "Vide" },
  settings: {
    title: "Réglages", profile: "Profil", name: "Nom affiché", language: "Langue", theme: "Thème",
    light: "Clair", dark: "Sombre", auto: "Automatique", palette: "Palette",
    sage: "Sauge", sand: "Sable", stone: "Pierre", account: "Compte", data: "Données",
    export: "Télécharger les données (CSV)", exportSub: "Offres, bourses et universités dans un seul fichier",
    integrations: "Intégrations", soon: "Phase suivante",
    soonBody: "Agenda, documents et rappels par e-mail arrivent en phase 2.",
  },
  login: {
    title: "Se connecter à Lensa", sub: "Un seul endroit pour vos candidatures, bourses et masters.",
    email: "E-mail", emailPh: "nom@email.com", send: "Recevoir un lien de connexion",
    sent: "Consultez votre boîte mail et cliquez sur le lien.", or: "ou", github: "Continuer avec GitHub",
    demo: "Essayer sans compte", noBackend: "La base de données n’est pas encore connectée. Essayez le mode démo.",
  },
  empty: {
    job: "Aucune offre pour l’instant. Ajoutez celles qui vous intéressent.",
    scholarship: "Aucune bourse pour l’instant. Ajoutez celles que vous visez.",
    university: "Aucune université pour l’instant. Ajoutez les masters envisagés.",
    filtered: "Rien ne correspond à ce filtre.",
  },
};

export const DICTS: Record<Locale, Dict> = { id, en, fr };
export type { Dict };

export const DATE_LOCALE: Record<Locale, string> = { id: "id-ID", en: "en-GB", fr: "fr-FR" };

export function fmtDate(date: string | null, locale: Locale, opts?: Intl.DateTimeFormatOptions) {
  if (!date) return "";
  const [y, m, d] = date.slice(0, 10).split("-").map(Number);
  return new Intl.DateTimeFormat(DATE_LOCALE[locale], opts ?? { day: "numeric", month: "short", year: "numeric" }).format(
    new Date(y, m - 1, d),
  );
}

export function fmtDateTime(iso: string, locale: Locale) {
  return new Intl.DateTimeFormat(DATE_LOCALE[locale], { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(iso));
}

export const TRACK_PATH: Record<Track, string> = { job: "jobs", scholarship: "scholarships", university: "universities" };
