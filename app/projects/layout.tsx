import type { ReactNode } from "react";

type ProjectsLayoutProps = {
  children: ReactNode;
};

export default function ProjectsLayout({ children }: ProjectsLayoutProps) {
  return <div className="min-h-screen bg-black text-white">{children}</div>;
}
