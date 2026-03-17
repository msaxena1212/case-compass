import { AppLayout } from "@/components/AppLayout";

export default function Tasks() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-display font-semibold tracking-tight">Tasks & Workflows</h1>
          <p className="text-sm text-muted-foreground mt-1">Task management coming soon</p>
        </div>
        <div className="flex items-center justify-center h-64 rounded-lg border-2 border-dashed border-border">
          <p className="text-muted-foreground text-sm">Manage to-dos, assign tasks, and automate legal workflows</p>
        </div>
      </div>
    </AppLayout>
  );
}
