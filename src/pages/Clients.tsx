import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus, Phone, Mail, Briefcase, MoreHorizontal } from "lucide-react";
import { useState } from "react";

const clients = [
  { id: 1, name: "Rajesh Sharma", email: "rajesh@email.com", phone: "+91 98765 43210", type: "Individual", activeCases: 1, totalCases: 3, since: "2022", avatar: "RS" },
  { id: 2, name: "Patel Industries Ltd.", email: "legal@patelindustries.com", phone: "+91 22 2345 6789", type: "Corporate", activeCases: 1, totalCases: 2, since: "2023", avatar: "PI" },
  { id: 3, name: "Harpreet Singh", email: "harpreet.s@email.com", phone: "+91 87654 32109", type: "Individual", activeCases: 1, totalCases: 1, since: "2024", avatar: "HS" },
  { id: 4, name: "Anita Gupta", email: "anita.gupta@email.com", phone: "+91 76543 21098", type: "Individual", activeCases: 1, totalCases: 2, since: "2023", avatar: "AG" },
  { id: 5, name: "Tech Solutions Pvt Ltd", email: "legal@techsolutions.in", phone: "+91 11 4567 8901", type: "Corporate", activeCases: 1, totalCases: 4, since: "2021", avatar: "TS" },
  { id: 6, name: "Residents Association Andheri", email: "secretary@raandheri.org", phone: "+91 22 3456 7890", type: "Association", activeCases: 1, totalCases: 1, since: "2023", avatar: "RA" },
  { id: 7, name: "Vikram Desai", email: "vikram.d@email.com", phone: "+91 65432 10987", type: "Individual", activeCases: 0, totalCases: 1, since: "2023", avatar: "VD" },
  { id: 8, name: "Suresh Reddy", email: "suresh.r@email.com", phone: "+91 54321 09876", type: "Individual", activeCases: 1, totalCases: 2, since: "2023", avatar: "SR" },
];

export default function Clients() {
  const [search, setSearch] = useState("");

  const filtered = clients.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-display font-semibold tracking-tight">Clients</h1>
            <p className="text-sm text-muted-foreground mt-1">{clients.length} total clients · {clients.filter(c => c.activeCases > 0).length} with active cases</p>
          </div>
          <Button className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2 shrink-0">
            <Plus className="h-4 w-4" /> Add Client
          </Button>
        </div>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search clients..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((client) => (
            <Card key={client.id} className="hover:shadow-md transition-shadow cursor-pointer group">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-sm font-medium text-primary-foreground shrink-0">
                      {client.avatar}
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold">{client.name}</h3>
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{client.type} · Since {client.since}</span>
                    </div>
                  </div>
                  <button className="opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7 rounded flex items-center justify-center hover:bg-muted">
                    <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                  </button>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Mail className="h-3 w-3" /> {client.email}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Phone className="h-3 w-3" /> {client.phone}
                  </div>
                </div>

                <div className="flex items-center gap-4 pt-3 border-t">
                  <div className="flex items-center gap-1.5 text-xs">
                    <Briefcase className="h-3 w-3 text-accent" />
                    <span className="font-medium">{client.activeCases}</span>
                    <span className="text-muted-foreground">active</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {client.totalCases} total cases
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
