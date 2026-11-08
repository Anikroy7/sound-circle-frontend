import type { MusicianProfile } from "@/types/musician";

export const musicianProfile: MusicianProfile = {
  slug: "rafiq-hossain",
  name: "Rafiq Hossain",
  initials: "RH",
  tone: "amber",
  instruments: "Drums · Percussion",
  status: { label: "Looking for a band", tone: "teal" },
  facts: ["Mirpur 10, Dhaka", "10 years playing", "Member since March 2026"],
  about:
    "I've been drumming since my school band in Mirpur. Heavy on double-kick and odd time signatures, but I love a tight groove just as much. Played with Iron Tide for four years across Dhaka's underground circuit. Now looking for a committed prog or alt-rock band that wants to write originals and play live regularly. I own my own kit and have access to a rehearsal space near Mirpur 10.",
  genres: ["Metal", "Prog rock", "Alt rock"],
  skillLevel: 4,
  skillLabel: "Professional",
  availability: { when: "Fri & Sat, afternoons", note: "Can travel within Dhaka" },
  openTo: [
    { label: "Joining a band", open: true },
    { label: "Paid gigs", open: true },
    { label: "Session work", open: true },
    { label: "Recruiting members", open: false },
  ],
  tracks: [
    {
      title: "Monsoon Groove (drum cover)",
      meta: "Original groove in 7/8 · Recorded at home studio",
      length: "2:48",
      waveSeed: 1,
      played: 0.38,
    },
    { title: "Iron Tide – “Ghum Bhanga Raat” live", meta: "Live at Bashundhara Convention Hall", length: "4:12", waveSeed: 2.3, played: 0 },
    { title: "Double-kick practice session", meta: "180 bpm · Studio rehearsal", length: "1:35", waveSeed: 4.1, played: 0 },
  ],
  videos: [
    { title: "Drum playthrough – “Shohor” by Iron Tide", tone: "amber", badge: "YouTube · 5:02" },
    { title: "Rooftop jam, Mirpur DOHS", tone: "teal", badge: "YouTube · 3:41" },
  ],
  photos: [
    { caption: "Underground fest, Dhaka", tone: "violet" },
    { caption: "Studio session", tone: "teal" },
    { caption: "Mirpur rooftop", tone: "amber" },
    { caption: "University fest, BUET", tone: "blue" },
  ],
  contact: [
    { label: "Messages", value: "Open to everyone" },
    { label: "Email", value: "Bandmates only" },
    { label: "Phone", value: "Hidden" },
  ],
  contactNote: "Rafiq shares his email once you're in a band together. Send a message or an invite to start.",
  pastBands: [{ name: "Iron Tide", monogram: "IT", tone: "slate", meta: "Drums · 2021–2025 · Past" }],
  gigs: [
    { month: "Jun", year: "2025", event: "Rock Nation Dhaka", where: "Iron Tide · Bashundhara" },
    { month: "Feb", year: "2025", event: "BUET Cultural Fest", where: "Iron Tide · Palashi" },
    { month: "Dec", year: "2024", event: "Winter Underground", where: "Iron Tide · Dhanmondi" },
    { month: "Aug", year: "2024", event: "Session: wedding reception", where: "Hired drummer · Gulshan" },
  ],
};
