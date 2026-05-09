import { ExternalLink, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { I18N, type Lang } from "@/lib/i18n";

const URL = "https://www.mahakim.ma/#/suivi/dossier-suivi";

export function TrackCasePanel({
  lang,
  onClose,
}: {
  lang: Lang;
  onClose: () => void;
}) {
  const t = I18N[lang];
  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-elegant animate-in fade-in slide-in-from-bottom-3 duration-300">
      <div className="flex items-center justify-between p-3 border-b border-border bg-secondary/40">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm">{t.trackCase}</span>
          <a
            href={URL}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-primary hover:underline inline-flex items-center gap-1"
          >
            <ExternalLink className="h-3 w-3" />
            {t.openExternal}
          </a>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-7 w-7">
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="p-2 text-[11px] text-muted-foreground bg-muted/40">
        {t.embedNote}
      </div>
      <iframe
        src={URL}
        title="mahakim.ma"
        className="w-full h-[600px] border-0 bg-background"
        sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
      />
    </div>
  );
}
