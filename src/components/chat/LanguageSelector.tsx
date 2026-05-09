import { Languages } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { LANG_LIST, type Lang } from "@/lib/i18n";

interface Props {
  value: Lang;
  onChange: (l: Lang) => void;
}

export function LanguageSelector({ value, onChange }: Props) {
  const current = LANG_LIST.find((l) => l.code === value)!;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Languages className="h-4 w-4" />
          <span className="text-sm font-medium">{current.name}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {LANG_LIST.map((l) => (
          <DropdownMenuItem
            key={l.code}
            onClick={() => onChange(l.code)}
            className={l.code === value ? "font-semibold" : ""}
          >
            {l.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
