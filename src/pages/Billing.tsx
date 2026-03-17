import { AppLayout } from "@/components/AppLayout";

export default function Billing() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-display font-semibold tracking-tight">Billing & Invoicing</h1>
          <p className="text-sm text-muted-foreground mt-1">Billing module coming soon</p>
        </div>
        <div className="flex items-center justify-center h-64 rounded-lg border-2 border-dashed border-border">
          <p className="text-muted-foreground text-sm">Track billable hours, generate invoices, and manage payments</p>
        </div>
      </div>
    </AppLayout>
  );
}
