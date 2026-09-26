export type NavItem = {
  label: string;
  href: string;
  icon: NavIcon;
};

export type NavIcon =
  | "dashboard"
  | "workspace"
  | "ai-lab"
  | "web3"
  | "tools"
  | "integrations"
  | "settings";

export const MAIN_NAV: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: "dashboard" },
  { label: "Development Workspace", href: "/workspace", icon: "workspace" },
  { label: "AI Coding Lab", href: "/ai-lab", icon: "ai-lab" },
  { label: "Web3 Hub", href: "/web3", icon: "web3" },
  { label: "Developer Tools", href: "/tools", icon: "tools" },
  { label: "Integrations", href: "/integrations", icon: "integrations" },
  { label: "Settings", href: "/settings", icon: "settings" },
];
