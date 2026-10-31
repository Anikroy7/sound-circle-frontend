import Link from "next/link";
import styles from "@/components/bands/bands.module.css";
import { SentInvitationRow } from "@/components/bands/sent-invitation-row";
import { Avatar } from "@/components/ui/avatar";
import { CheckIcon } from "@/components/ui/icons";
import { managedBand } from "@/demo-data/band-manage";
import { bandAreas, bandCities, bandDraft, bandGenres, bandTypes } from "@/demo-data/create-band";
import { routes } from "@/lib/routes";
import { chipClass } from "@/lib/tones";
import type { SelectOption } from "@/types/common";

function Select({ label, name, options }: { label: string; name: string; options: SelectOption[] }): React.JSX.Element {
  return (
    <label className="field">
      <span className="label">
        {label} <span className={styles.required}>*</span>
      </span>
      <select className="input" name={name} defaultValue={options[0].value}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

/** Step 1: what the band is called, plays and where. Shown mid-edit, with one valid and one invalid field. */
export function DetailsStep(): React.JSX.Element {
  return (
    <>
      <h2 className={`display ${styles.stepTitle}`}>Band details</h2>
      <div className="field">
        <span className="label">Band type</span>
        <div className={styles.segments}>
          {bandTypes.map((type) => (
            <button key={type.label} type="button" className={styles.segment} aria-pressed={type.selected}>
              <strong>{type.label}</strong>
              <span className={`muted ${styles.small}`}>{type.hint}</span>
            </button>
          ))}
        </div>
      </div>
      <div className={styles.logoRow}>
        <div className={`field ${styles.logoField}`}>
          <span className="label">Logo</span>
          <Avatar initials={bandDraft.monogram} tone={bandDraft.tone} size={104} shape="square" className="display" />
          <button type="button" className={`btn btn-ghost btn-sm ${styles.changeLogo}`}>
            Change logo
          </button>
        </div>
        <div className={styles.logoFields}>
          <label className="field">
            <span className="label">
              Band name <span className={styles.required}>*</span>
            </span>
            <input className="input is-valid" name="name" defaultValue={bandDraft.name} aria-describedby="band-name-ok" />
            <span id="band-name-ok" className="field-ok">
              ✓ Name is available
            </span>
          </label>
          <Select label="Main genre" name="genre" options={bandGenres} />
        </div>
      </div>
      <div className="field-row">
        <Select label="City" name="city" options={bandCities} />
        <Select label="Area" name="area" options={bandAreas} />
      </div>
      <label className="field">
        <span className="label">
          Description <span className={styles.required}>*</span>
        </span>
        <textarea
          className="input"
          name="description"
          rows={3}
          defaultValue={bandDraft.description}
          aria-invalid="true"
          aria-describedby="band-description-error"
        />
        <span id="band-description-error" className="field-error">
          Add a bit more (at least 60 characters) so musicians know what you&apos;re about: sound, influences, rehearsal plans.
        </span>
      </label>
      <div className={styles.actionsEnd}>
        <button type="button" className="btn btn-secondary">
          Save draft
        </button>
        <Link className="btn btn-primary" href={routes.createBandStep.roles}>
          Continue to roles
        </Link>
      </div>
    </>
  );
}

/** Step 2: which roles are filled and which the band is recruiting for. */
export function RolesStep(): React.JSX.Element {
  return (
    <>
      <h2 className={`display ${styles.stepTitle}`}>Who do you need?</h2>
      <p className={`muted ${styles.stepLead}`}>Mark roles that are already filled and the ones you&apos;re recruiting for.</p>
      <div className={styles.roleList}>
        {bandDraft.roles.map((role) => (
          <div key={role.role} className={`inset ${styles.roleRow}`}>
            <span className={styles.roleAbbr} aria-hidden="true">
              {role.abbreviation}
            </span>
            <strong className={styles.roleName}>{role.role}</strong>
            <span className={`chip ${chipClass(role.status.tone)}`}>{role.status.label}</span>
            <span className={`muted ${styles.small} ${styles.roleWho}`}>{role.who}</span>
          </div>
        ))}
        <button type="button" className={`btn btn-secondary ${styles.alignStart}`}>
          + Add a role
        </button>
      </div>
      <div className={styles.actionsRow}>
        <Link className="btn btn-secondary" href={routes.createBandStep.details}>
          Back
        </Link>
        <Link className="btn btn-primary" href={routes.createBandStep.invite}>
          Continue to invites
        </Link>
      </div>
    </>
  );
}

/** Step 3: search for players for the open roles and track the invites already sent. */
export function InviteStep(): React.JSX.Element {
  const recruiting = bandDraft.roles.filter((role) => role.status.tone === "amber").map((role) => role.role);

  return (
    <>
      <div className={styles.sectionHead}>
        <h2 className={`display ${styles.stepTitle}`}>Invite musicians</h2>
        <span className="chip chip-amber">Recruiting: {recruiting.join(", ")}</span>
      </div>
      <form className={styles.searchRow} role="search" action={routes.createBandStep.invite} method="get">
        <label className={styles.searchInput}>
          <span className="visually-hidden">Search musicians</span>
          <input className="input" name="q" defaultValue="bass" placeholder="Search by name or instrument" />
        </label>
        <select className={`input ${styles.narrowSelect}`} name="instrument" aria-label="Instrument" defaultValue="bass">
          <option value="bass">Bass</option>
          <option value="drums">Drums</option>
        </select>
        <select className={`input ${styles.narrowSelect}`} name="area" aria-label="Area" defaultValue="near-mirpur">
          <option value="near-mirpur">Near Mirpur</option>
          <option value="dhaka">All Dhaka</option>
        </select>
      </form>
      <div>
        {bandDraft.candidates.map((candidate) => (
          <div key={candidate.slug} className={styles.candidate}>
            <Avatar initials={candidate.initials} tone={candidate.tone} size={46} />
            <div className={styles.candidateText}>
              <Link href={routes.musician(candidate.slug)} className={styles.personLink}>
                {candidate.name}
              </Link>
              <div className={`muted ${styles.small}`}>{candidate.meta}</div>
            </div>
            {candidate.invited ? (
              <span className="chip chip-amber">Invite pending</span>
            ) : (
              <button type="button" className="btn btn-primary btn-sm">
                Invite as Bass
              </button>
            )}
          </div>
        ))}
      </div>
      <div className={styles.roleList}>
        <h3 className={`label ${styles.subhead}`}>Invitations for this band</h3>
        {bandDraft.invitations.map((invitation) => (
          <SentInvitationRow key={`${invitation.slug}-${invitation.role}`} invitation={invitation} metaApart />
        ))}
      </div>
      <div className={styles.actionsRow}>
        <Link className="btn btn-secondary" href={routes.createBandStep.roles}>
          Back
        </Link>
        <Link className="btn btn-primary" href={routes.createBandStep.publish}>
          Review band
        </Link>
      </div>
    </>
  );
}

/** Step 4: the band is published. */
export function PublishStep(): React.JSX.Element {
  const pending = bandDraft.invitations.filter((invitation) => invitation.status.label === "Pending").length;

  return (
    <div className={styles.published}>
      <span className="success-badge">
        <CheckIcon />
      </span>
      <h2 className={`display ${styles.publishedTitle}`}>{bandDraft.name} is live</h2>
      <p className={`muted ${styles.publishedText}`}>
        Your band profile is public and {pending} invitations are waiting for a reply. We&apos;ll notify you as soon as someone
        responds.
      </p>
      <div className={styles.centerRow}>
        <Link className="btn btn-primary" href={routes.manageBand(managedBand.slug)}>
          Manage band
        </Link>
        <Link className="btn btn-secondary" href={routes.band(managedBand.slug)}>
          View public profile
        </Link>
      </div>
    </div>
  );
}
