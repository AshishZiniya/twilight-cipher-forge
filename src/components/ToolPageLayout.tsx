import { ReactNode } from "react";

interface ToolPageLayoutProps {
  title: string;
  description: string;
  children: ReactNode;
}

const ToolPageLayout = ({ title, description, children }: ToolPageLayoutProps) => {
  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">{title}</h1>
        <p className="mt-2 text-muted-foreground">{description}</p>
      </div>
      <div className="space-y-6">{children}</div>
    </div>
  );
};

export default ToolPageLayout;
