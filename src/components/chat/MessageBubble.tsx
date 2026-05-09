import { cn } from "@/lib/utils";
import { Bot, User } from "lucide-react";
import { pickLocalized, type Lang, I18N } from "@/lib/i18n";

export type ChatMessage =
  | { id: string; role: "user"; text: string }
  | { id: string; role: "bot"; kind: "welcome"; text: string }
  | { id: string; role: "bot"; kind: "fallback"; text: string }
  | {
      id: string;
      role: "bot";
      kind: "answer";
      lang: Lang;
      confidence: number;
      title: Record<string, string>;
      summary: Record<string, string>;
      steps: { order: number; content: Record<string, string> }[];
    };

export function MessageBubble({ msg, uiLang }: { msg: ChatMessage; uiLang: Lang }) {
  const isUser = msg.role === "user";
  return (
    <div
      className={cn(
        "flex w-full gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300",
        isUser ? "flex-row-reverse" : "flex-row",
      )}
    >
      <div
        className={cn(
          "shrink-0 grid place-items-center h-8 w-8 rounded-full",
          isUser
            ? "bg-user-bubble text-user-bubble-foreground"
            : "bg-primary/10 text-primary",
        )}
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-soft",
          isUser
            ? "bg-user-bubble text-user-bubble-foreground rounded-tr-sm"
            : "bg-bot-bubble text-bot-bubble-foreground border border-border rounded-tl-sm",
        )}
      >
        {msg.role === "user" || msg.role === "bot" && "text" in msg ? (
          <p className="whitespace-pre-wrap">{(msg as { text: string }).text}</p>
        ) : null}

        {msg.role === "bot" && msg.kind === "answer" && (
          <div className="space-y-3">
            <div>
              <h3 className="text-base font-semibold text-primary">
                {pickLocalized(msg.title, msg.lang)}
              </h3>
              <p className="mt-1 text-muted-foreground">
                {pickLocalized(msg.summary, msg.lang)}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                {I18N[uiLang].steps}
              </p>
              <ol className="space-y-2">
                {msg.steps.map((s) => (
                  <li key={s.order} className="flex gap-3">
                    <span className="shrink-0 grid place-items-center h-6 w-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                      {s.order}
                    </span>
                    <span className="pt-0.5">
                      {pickLocalized(s.content, msg.lang)}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
              {I18N[uiLang].confidence}: {Math.round(msg.confidence * 100)}%
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
