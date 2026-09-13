import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/*
  Class merger used by the components pulled in from the shadcn registry.
  clsx resolves conditionals, tailwind-merge drops the earlier of two classes
  that set the same property, so a caller's `className` always wins over a
  component's own default without either side having to know the other.
*/
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
