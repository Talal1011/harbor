import type { NoteMedia, ReleaseNote } from "@/lib/updater/release-notes";
import { handleLinkOutActivation, safeExternalUrl } from "@/lib/social/link-out-activation";
import { openUrl } from "@/lib/window";

export function RichNote({ note }: { note: ReleaseNote }) {
  return (
    <div className="flex flex-col gap-3.5">
      {(note.media || note.title) && (
        <div className="flex items-center gap-3">
          {note.media && <NoteMediaView media={note.media} />}
          {note.title && (
            <h2 className="font-display text-[22px] font-medium leading-tight tracking-tight text-ink">
              {note.title}
            </h2>
          )}
        </div>
      )}
      {note.intro && <p className="text-[13px] leading-relaxed text-ink-muted">{note.intro}</p>}
      {note.sections?.map((section, i) => (
        <div key={i} className="flex flex-col gap-1.5">
          {section.heading && (
            <span className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-ink-subtle">
              {section.heading}
            </span>
          )}
          <ul className="flex flex-col gap-1.5">
            {section.items.map((item, j) => (
              <li key={j} className="flex gap-2.5 text-[13px] leading-relaxed text-ink">
                <span
                  aria-hidden
                  className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-accent"
                />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          {section.links?.map((link, j) => {
            const href = safeExternalUrl(link.url);
            if (!href) return null;
            return (
              <a
                key={j}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(event) => handleLinkOutActivation(event, openUrl)}
                onAuxClick={(event) => handleLinkOutActivation(event, openUrl)}
                className="self-start text-[13px] text-accent underline underline-offset-2 focus-visible:outline-auto focus-visible:outline-offset-2"
              >
                {link.label}
              </a>
            );
          })}
        </div>
      ))}
    </div>
  );
}

function NoteMediaView({ media }: { media: NoteMedia }) {
  const height = media.height ?? 64;
  return (
    <img
      src={media.src}
      alt={media.alt ?? ""}
      draggable={false}
      style={{
        height,
        width: "auto",
        imageRendering: media.kind === "sprite" ? "pixelated" : undefined,
      }}
      className="shrink-0 select-none"
    />
  );
}
