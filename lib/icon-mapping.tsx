// icons.ts
import { SquareCode, GraduationCap, UserSearch } from "lucide-react";

export const ICON_KEYS = ["square-code", "graduation-cap", "user-search"] as const;
export type IconKey = typeof ICON_KEYS[number];

export const ICON_MAP: Record<IconKey, React.ReactNode> = {
  "square-code": <SquareCode size={32} className="text-blue-400" />,
  "graduation-cap": <GraduationCap size={32} className="text-yellow-400" />,
  "user-search": <UserSearch size={32} className="text-green-400" />,
};
