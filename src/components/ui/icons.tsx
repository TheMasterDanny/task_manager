import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const base = { viewBox: "0 0 24 24", "aria-hidden": true } as const;

export const PlusIcon = (props: IconProps) => (
  <svg {...base} {...props}><path d="M12 5v14M5 12h14" /></svg>
);

export const SearchIcon = (props: IconProps) => (
  <svg {...base} {...props}><circle cx="11" cy="11" r="6.5" /><path d="m20 20-4.2-4.2" /></svg>
);

export const CheckIcon = (props: IconProps) => (
  <svg {...base} {...props}><path d="m6 12.5 4 4 8-9" /></svg>
);

export const ClockIcon = (props: IconProps) => (
  <svg {...base} {...props}><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></svg>
);

export const BoardIcon = (props: IconProps) => (
  <svg {...base} {...props}><rect x="4" y="4" width="6.5" height="16" rx="1.5" /><rect x="13.5" y="4" width="6.5" height="10" rx="1.5" /></svg>
);

export const ListIcon = (props: IconProps) => (
  <svg {...base} {...props}><path d="M9 6h11M9 12h11M9 18h11" /><circle cx="4.5" cy="6" r="1" /><circle cx="4.5" cy="12" r="1" /><circle cx="4.5" cy="18" r="1" /></svg>
);

export const ChevronDownIcon = (props: IconProps) => (
  <svg {...base} {...props}><path d="m7 10 5 5 5-5" /></svg>
);
