import type { BandProfile } from "@/types/band";

export const bandProfile: BandProfile = {
  slug: "neel-akash-collective",
  name: "Neel Akash Collective",
  monogram: "NA",
  tone: "teal",
  coverCaption: "the band live at Jatra Biroti, Banani",
  status: { label: "Existing band · Gigging", tone: "teal" },
  tags: ["Folk fusion", "Baul", "Electronica", "Dhanmondi, Dhaka", "Formed 2023"],
  about:
    "We take songs from Lalon and the Baul tradition and rebuild them with synths, live tabla and a loop station. Started as a Thursday jam in Dhanmondi in 2023 and now play cafés, university fests and private events around Dhaka. We're adding a violinist to carry the melodies we currently play on synth.",
  members: [
    { slug: "shafiqul-alam", name: "Shafiqul Alam", role: "Synth & production", initials: "SA", tone: "teal", isOwner: true },
    { slug: "nusrat-jahan", name: "Nusrat Jahan", role: "Lead vocals", initials: "NJ", tone: "violet", isOwner: false },
    { slug: "mehedi-hasan", name: "Mehedi Hasan", role: "Bansuri & dotara", initials: "MH", tone: "amber", isOwner: false },
    { slug: "imran-kabir", name: "Imran Kabir", role: "Tabla & percussion", initials: "IK", tone: "blue", isOwner: false },
    { slug: "tahsin-mahmud", name: "Tahsin Mahmud", role: "Bass", initials: "TM", tone: "rose", isOwner: false },
  ],
  openRole: { role: "Violin", level: "Intermediate+" },
  tracks: [
    { title: "Khachar Bhitor (rework)", meta: "Studio single · 2026", length: "4:36" },
    { title: "Moner Manush – live", meta: "Live at Dhaka University Spring Fest", length: "6:10" },
  ],
  videos: [
    { title: "Full set – Jatra Biroti, August 2026", tone: "teal" },
    { title: "Rehearsal diary #4: building the loop", tone: "violet" },
  ],
  availability: [
    { label: "Rehearsals", value: "Thursdays, 6–9 pm" },
    { label: "Performs", value: "Weekends" },
    { label: "Travels", value: "Dhaka & Chattogram" },
    { label: "Set length", value: "45–90 minutes" },
  ],
  openTo: [
    { label: "New members", tone: "teal" },
    { label: "Live events", tone: "teal" },
    { label: "Collaborations", tone: "teal" },
    { label: "Session recording", tone: "neutral" },
  ],
  links: [
    { label: "Facebook", value: "/neelakashcollective" },
    { label: "YouTube", value: "@neelakash" },
    { label: "Instagram", value: "@neel.akash.live" },
    { label: "Spotify", value: "Neel Akash Collective" },
  ],
  recentShows: [
    { title: "Dhaka University Spring Fest", meta: "Sep 2026 · TSC" },
    { title: "Jatra Biroti", meta: "Aug 2026 · Banani" },
    { title: "Folk Night at Alliance Française", meta: "Jun 2026 · Dhanmondi" },
  ],
};
