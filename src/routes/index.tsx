import { createFileRoute, Link } from "@tanstack/react-router";
import { useRef, useState, useEffect } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Scale, FileSearch, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/useLanguage";
import { I18N } from "@/lib/i18n";
import { LanguageSelector } from "@/components/chat/LanguageSelector";
import { ThemeToggle } from "@/components/chat/ThemeToggle";
import { MessageBubble, type ChatMessage } from "@/components/chat/MessageBubble";
import { ChatInput } from "@/components/chat/ChatInput";
import { Suggestions } from "@/components/chat/Suggestions";
import { TrackCasePanel } from "@/components/chat/TrackCasePanel";
import { matchQuestion } from "@/lib/chat.functions";

export const Route = createFileRoute("/")({
  component: ChatPage,
});

function ChatPage() {
  const { lang, setLang } = useLanguage();
  const t = I18N[lang];
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [busy, setBusy] = useState(false);
  const [showTrack, setShowTrack] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const askFn = useServerFn(matchQuestion);

  // Reset welcome when lang changes
  useEffect(() => {
    setMessages([
      { id: "welcome", role: "bot", kind: "welcome", text: I18N[lang].welcome },
    ]);
  }, [lang]);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, busy]);

  const ask = async (text: string) => {
    setMessages((m) => [
      ...m,
      { id: crypto.randomUUID(), role: "user", text },
    ]);
    setBusy(true);
    try {
      const res = await askFn({ data: { text } });
      if (res.type === "answer") {
        setMessages((m) => [
          ...m,
          {
            id: crypto.randomUUID(),
            role: "bot",
            kind: "answer",
            lang: res.lang,
            confidence: res.confidence,
            title: res.procedure.title,
            summary: res.procedure.summary,
            steps: res.steps,
          },
        ]);
      } else {
        setMessages((m) => [
          ...m,
          {
            id: crypto.randomUUID(),
            role: "bot",
            kind: "fallback",
            text: I18N[res.lang].fallback,
          },
        ]);
      }
    } catch (e) {
      console.error(e);
      setMessages((m) => [
        ...m,
        {
          id: crypto.randomUUID(),
          role: "bot",
          kind: "fallback",
          text: I18N[lang].fallback,
        },
      ]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur sticky top-0 z-10">
        <div className="container mx-auto max-w-4xl px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="grid place-items-center h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary-glow text-primary-foreground shadow-elegant">
              <Scale className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-base font-bold leading-tight">
                {t.appName}
              </h1>
              <p className="text-[11px] text-muted-foreground leading-tight">
                {t.tagline}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <LanguageSelector value={lang} onChange={setLang} />
            <ThemeToggle />
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="hidden sm:inline-flex"
            >
              <Link to="/admin/login">
                <ShieldCheck className="h-4 w-4 me-1" />
                {t.adminLogin}
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Chat area */}
      <main className="flex-1 container mx-auto max-w-4xl px-4 py-6 w-full">
        <div className="flex flex-col gap-4 h-full">
          <div
            ref={scrollRef}
            className="flex-1 min-h-[50vh] max-h-[65vh] overflow-y-auto space-y-4 p-2"
          >
            {messages.map((m) => (
              <MessageBubble key={m.id} msg={m} uiLang={lang} />
            ))}
            {busy && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground ps-11">
                <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                <span className="h-2 w-2 rounded-full bg-primary animate-pulse [animation-delay:150ms]" />
                <span className="h-2 w-2 rounded-full bg-primary animate-pulse [animation-delay:300ms]" />
              </div>
            )}
          </div>

          {messages.length <= 1 && (
            <Suggestions lang={lang} onPick={ask} />
          )}

          <ChatInput lang={lang} busy={busy} onSubmit={ask} />

          <div className="flex justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowTrack((v) => !v)}
              className="rounded-full gap-2"
            >
              <FileSearch className="h-4 w-4" />
              {t.trackCase}
            </Button>
          </div>

          {showTrack && (
            <TrackCasePanel lang={lang} onClose={() => setShowTrack(false)} />
          )}
        </div>
      </main>

      <footer className="text-center text-[11px] text-muted-foreground py-4 border-t border-border">
        {t.poweredBy}
      </footer>
    </div>
  );
}
