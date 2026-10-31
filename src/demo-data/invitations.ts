import type { ReceivedInvitation } from "@/types/invitation";

export const invitationCounts = { received: 3, sent: 4 };

export const receivedInvitations: ReceivedInvitation[] = [
  {
    id: "brickfield-static-lead-guitar",
    band: "Brickfield Static",
    bandSlug: "brickfield-static",
    monogram: "BS",
    tone: "violet",
    role: "Lead guitar",
    city: "Chattogram",
    genre: "Indie rock",
    bandType: "Existing band",
    rehearsals: "Sat 4–7 pm, Agrabad",
    expires: "In 12 days",
    status: { label: "Pending", tone: "amber" },
    owner: { slug: "farzana-rahman", name: "Farzana Rahman", initials: "FR", tone: "rose" },
    sent: "2 hours ago",
    message:
      "Hi Tanvir, loved your blues playthrough. Our guitarist moved to Dhaka, and we're recording our first EP in December. We can cover travel for weekend rehearsals while you decide whether to relocate. Would you join us?",
    members: [
      { slug: "farzana-rahman", name: "Farzana", role: "Vocals", initials: "FR", tone: "rose" },
      { slug: "rahat-ahmed", name: "Rahat", role: "Bass", initials: "RA", tone: "blue" },
      { slug: "joy-barua", name: "Joy", role: "Drums", initials: "JB", tone: "amber" },
    ],
  },
  {
    id: "rickshaw-radio-session-guitarist",
    band: "Rickshaw Radio",
    bandSlug: "rickshaw-radio",
    monogram: "RR",
    tone: "rose",
    role: "Session guitarist",
    city: "Gulshan, Dhaka",
    genre: "Pop rock",
    bandType: "Existing band",
    rehearsals: "Fridays, Gulshan 2",
    expires: "In 6 days",
    status: { label: "Pending", tone: "amber" },
    owner: { slug: "ishtiaque-ahmed", name: "Ishtiaque Ahmed", initials: "IA", tone: "rose" },
    sent: "Yesterday",
    message:
      "We have three corporate shows in December and need a second guitarist. Paid per show. Set list is mostly covers plus four originals.",
    members: [
      { slug: "ishtiaque-ahmed", name: "Ishtiaque", role: "Vocals", initials: "IA", tone: "rose" },
      { slug: "mim-akter", name: "Mim", role: "Keys", initials: "MM", tone: "teal" },
    ],
  },
  {
    id: "lalbagh-lanterns-rhythm-guitar",
    band: "Lalbagh Lanterns",
    bandSlug: "lalbagh-lanterns",
    monogram: "LL",
    tone: "slate",
    role: "Rhythm guitar",
    city: "Old Dhaka",
    genre: "Folk rock",
    bandType: "Newly forming",
    rehearsals: "Sundays",
    expires: "Expired 20 Oct",
    status: { label: "Expired", tone: "muted" },
    owner: { slug: "sajid-hasan", name: "Sajid Hasan", initials: "SH", tone: "blue" },
    sent: "6 Oct",
    message: "Starting a folk rock project around Old Dhaka stories. Interested?",
    members: [{ slug: "sajid-hasan", name: "Sajid", role: "Vocals & guitar", initials: "SH", tone: "blue" }],
  },
];
