import { I18N, SUGGESTIONS, type Lang } from "@/lib/i18n";

interface Props {
  lang: Lang;
  onPick: (text: string) => void;
}

export function Suggestions({ lang, onPick }: Props) {
  const t = I18N[lang];
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {t.suggestionsLabel}
      </p>
      <div className="flex flex-wrap gap-2">
        {SUGGESTIONS[lang].map((s) => (
          <button
            key={s}
            onClick={() => onPick(s)}
            className="text-sm px-3 py-1.5 rounded-full bg-secondary hover:bg-primary/10 hover:text-primary border border-border transition-colors"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
