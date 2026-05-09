import { Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { I18N, type Lang } from "@/lib/i18n";
import { type FormEvent, useState } from "react";

interface Props {
  lang: Lang;
  busy: boolean;
  onSubmit: (text: string) => void;
}

export function ChatInput({ lang, busy, onSubmit }: Props) {
  const [text, setText] = useState("");
  const t = I18N[lang];

  const handle = (e: FormEvent) => {
    e.preventDefault();
    const v = text.trim();
    if (!v || busy) return;
    onSubmit(v);
    setText("");
  };

  return (
    <form
      onSubmit={handle}
      className="flex gap-2 items-center bg-card border border-border rounded-2xl p-2 shadow-elegant"
    >
      <Input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={t.placeholder}
        disabled={busy}
        maxLength={500}
        className="border-0 focus-visible:ring-0 shadow-none bg-transparent text-base"
      />
      <Button
        type="submit"
        size="icon"
        disabled={busy || !text.trim()}
        className="rounded-xl"
      >
        {busy ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Send className="h-4 w-4" />
        )}
      </Button>
    </form>
  );
}
