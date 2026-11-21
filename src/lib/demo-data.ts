import type { Item } from "./types";

/** Data contoh untuk mode demo. Tanggal dihitung relatif dari hari ini supaya selalu terlihat realistis. */
function d(offset: number | null) {
  if (offset === null) return null;
  const t = new Date();
  t.setDate(t.getDate() + offset);
  return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}-${String(t.getDate()).padStart(2, "0")}`;
}
function ago(days: number) {
  const t = new Date();
  t.setDate(t.getDate() - days);
  return t.toISOString();
}

type Seed = Partial<Item> & Pick<Item, "type" | "title" | "status">;

const SEEDS: Seed[] = [
  { type: "job", title: "Management Trainee, Supply Chain", organization: "Paragon Corp", country: "Indonesia", city: "Jakarta", deadline: d(3), status: "saved", priority: "high", favorite: true, details: { employment_type: "full_time", work_mode: "onsite", source: "Glints" }, notes: "CV sudah siap. Surat lamaran masih draf." },
  { type: "job", title: "Operations Analyst", organization: "Traveloka", country: "Indonesia", city: "Jakarta", deadline: d(1), status: "interview", priority: "high", favorite: true, details: { employment_type: "full_time", work_mode: "hybrid", source: "LinkedIn" }, notes: "Wawancara HR tahap dua lewat Google Meet." },
  { type: "job", title: "Production Planning Staff", organization: "Toyota Astra Motor", country: "Indonesia", city: "Karawang", deadline: d(2), status: "test", priority: "medium", favorite: false, details: { employment_type: "full_time", work_mode: "onsite", source: "Email" } },
  { type: "job", title: "Aftermarket Analyst", organization: "Liugong Indonesia", country: "Indonesia", city: "Jakarta", deadline: null, status: "applied", priority: "medium", favorite: false, details: { employment_type: "full_time", work_mode: "onsite", source: "Referensi" } },
  { type: "job", title: "Graduate Development Program", organization: "Astra International", country: "Indonesia", city: "Jakarta", deadline: null, status: "applied", priority: "low", favorite: false, details: { employment_type: "full_time", work_mode: "onsite", source: "Situs resmi" } },
  { type: "job", title: "Future Leaders Programme", organization: "Unilever Indonesia", country: "Indonesia", city: "Bekasi", deadline: d(21), status: "saved", priority: "medium", favorite: false, details: { employment_type: "full_time", work_mode: "onsite", source: "Situs resmi" } },
  { type: "scholarship", title: "MEXT, jalur rekomendasi universitas", organization: "Pemerintah Jepang", country: "Jepang", city: "Kitakyushu", deadline: d(26), status: "preparing", priority: "high", favorite: true, details: { coverage: "full", level: "s2", benefits: "Biaya kuliah, tunjangan bulanan, tiket pesawat", requirements: "Transkrip, IELTS, rencana riset, surat dari calon pembimbing" } },
  { type: "scholarship", title: "LPDP Reguler", organization: "Kementerian Keuangan", country: "Indonesia", city: null, deadline: d(58), opens_at: d(40), status: "research", priority: "high", favorite: true, details: { coverage: "full", level: "s2" } },
  { type: "scholarship", title: "Bourse Eiffel", organization: "Campus France", country: "Prancis", city: "Grenoble", deadline: d(50), status: "research", priority: "medium", favorite: false, details: { coverage: "full", level: "s2" }, notes: "Diajukan oleh kampus tujuan, bukan pelamar langsung." },
  { type: "scholarship", title: "Chevening", organization: "Pemerintah Inggris", country: "Inggris", city: null, deadline: null, status: "research", priority: "low", favorite: false, details: { coverage: "full", level: "s2" }, notes: "Butuh 2 tahun pengalaman kerja. Coba lagi setelah bekerja." },
  { type: "university", title: "Wageningen University & Research", organization: "MSc Environmental Sciences", country: "Belanda", city: "Wageningen", deadline: d(12), status: "preparing", priority: "high", favorite: true, details: { program: "MSc Environmental Sciences", intake: "Sep 2027", tuition: "€21.700", ielts_min: 6.5 } },
  { type: "university", title: "The University of Kitakyushu", organization: "Graduate School of Environmental Engineering", country: "Jepang", city: "Kitakyushu", deadline: d(26), status: "submitted", priority: "high", favorite: true, details: { program: "M.Eng Environmental Systems", intake: "Okt 2027", tuition: "¥535.800", ielts_min: 6.0 } },
  { type: "university", title: "Grenoble INP", organization: "Génie industriel", country: "Prancis", city: "Grenoble", deadline: d(50), status: "not_applied", priority: "medium", favorite: false, details: { program: "MSc Industrial Engineering", intake: "Sep 2027", tuition: "€3.770", ielts_min: 6.5 } },
];

export function demoSeed(): Item[] {
  return SEEDS.map((s, i) => ({
    id: `demo-${i + 1}`,
    organization: null, country: null, city: null, url: null, deadline: null, opens_at: null,
    priority: "medium", favorite: false, notes: null, details: {},
    created_at: ago(20 - i), updated_at: ago(10 - (i % 10)),
    ...s,
  })) as Item[];
}
