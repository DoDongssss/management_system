import * as Icons from "lucide-react";
import { type LucideIcon } from "lucide-react";

type IconProps = {
  name: keyof typeof Icons;
  size?: number;
  color?: string;
  className?: string;
};

export default function Icon({ name, size = 20, color = "currentColor", className = "" }: IconProps) {
  const Lucide = Icons[name] as LucideIcon;

  return <Lucide size={size} color={color} className={className} />;
}
