import type { BandDraft } from "@/types/band";
import type { SelectOption } from "@/types/common";

export const bandGenres: SelectOption[] = [
  { value: "progressive-rock", label: "Progressive rock" },
  { value: "rock", label: "Rock" },
  { value: "metal", label: "Metal" },
  { value: "fusion", label: "Fusion" },
];

export const bandCities: SelectOption[] = [
  { value: "dhaka", label: "Dhaka" },
  { value: "chattogram", label: "Chattogram" },
];

export const bandAreas: SelectOption[] = [
  { value: "mirpur", label: "Mirpur" },
  { value: "dhanmondi", label: "Dhanmondi" },
];

export const bandTypes = [
  { label: "Newly forming", hint: "You're starting from scratch and need members.", selected: true },
  { label: "Existing band", hint: "You already play together and want a profile or new members.", selected: false },
];

/** The band being created, as it stands after the owner's first draft. */
export const bandDraft: BandDraft = {
  name: "Monsoon Theory",
  monogram: "MT",
  tone: "violet",
  genre: "Progressive rock",
  city: "Dhaka",
  area: "Mirpur",
  stage: "Forming",
  description: "Prog rock band.",
  roles: [
    { role: "Lead guitar", short: "Guitar", abbreviation: "Gt", status: { label: "Filled", tone: "teal" }, who: "Tanvir Ahmed (you)" },
    { role: "Vocals", short: "Vocals", abbreviation: "Vo", status: { label: "Filled", tone: "teal" }, who: "Priya Chowdhury" },
    { role: "Keyboard", short: "Keys", abbreviation: "Ky", status: { label: "Filled", tone: "teal" }, who: "Sadia Islam" },
    { role: "Drums", short: "Drums", abbreviation: "Dr", status: { label: "Recruiting", tone: "amber" }, who: "1 invite pending" },
    { role: "Bass", short: "Bass", abbreviation: "Bs", status: { label: "Recruiting", tone: "amber" }, who: "No invites yet" },
  ],
  candidates: [
    { slug: "tahmid-islam", name: "Tahmid Islam", initials: "TI", tone: "teal", meta: "Bass · Pallabi, 3.0 km · Metal, alt rock · 6 yrs", invited: false },
    { slug: "rumana-haque", name: "Rumana Haque", initials: "RH", tone: "blue", meta: "Bass · Mohammadpur, 5.6 km · Prog, fusion · 5 yrs", invited: true },
    { slug: "sabbir-khan", name: "Sabbir Khan", initials: "SK", tone: "rose", meta: "Bass · Mirpur 1, 1.8 km · Rock, blues · 3 yrs", invited: false },
    { slug: "anika-nawar", name: "Anika Nawar", initials: "AN", tone: "amber", meta: "Bass & synth bass · Kafrul, 4.2 km · Prog, jazz · 7 yrs", invited: false },
  ],
  invitations: [
    {
      slug: "rumana-haque",
      name: "Rumana Haque",
      initials: "RH",
      tone: "blue",
      role: "Bass",
      meta: "Sent just now",
      status: { label: "Pending", tone: "amber" },
      action: "Withdraw",
    },
    {
      slug: "rafiq-hossain",
      name: "Rafiq Hossain",
      initials: "RH",
      tone: "amber",
      role: "Drums",
      meta: "Expires in 12 days",
      status: { label: "Pending", tone: "amber" },
      action: "Withdraw",
    },
    {
      slug: "sadia-islam",
      name: "Sadia Islam",
      initials: "SI",
      tone: "blue",
      role: "Keyboard",
      meta: "Joined today",
      status: { label: "Accepted", tone: "teal" },
      action: "View member",
    },
    {
      slug: "arnob-das",
      name: "Arnob Das",
      initials: "AD",
      tone: "rose",
      role: "Bass",
      meta: "Yesterday",
      status: { label: "Declined", tone: "rose" },
      action: "Dismiss",
    },
    {
      slug: "nafis-karim",
      name: "Nafis Karim",
      initials: "NK",
      tone: "violet",
      role: "Drums",
      meta: "No reply in 14 days",
      status: { label: "Expired", tone: "muted" },
      action: "Resend",
    },
  ],
  checklist: [
    { label: "Name, genre and area", state: "done" },
    { label: "Description is too short", state: "missing" },
    { label: "At least one open role", state: "done" },
    { label: "Invite at least one musician (optional)", state: "optional" },
  ],
};
