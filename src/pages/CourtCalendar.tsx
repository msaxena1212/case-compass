import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, Clock, MapPin, Search, AlertTriangle } from "lucide-react";
import { mockHearings } from "@/store/mockData";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { CreateHearingModal } from "@/components/CreateHearingModal";
import { UpdateHearingModal } from "@/components/UpdateHearingModal";

export default function CourtCalendar() {
  const [search, setSearch] = useState("");
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [updateHearingId, setUpdateHearingId] = useState<string | null>(null);
  
  // Sort hearings by date
  const sortedHearings = [...mockHearings].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  const today = new Date().toDateString();
  const todaysHearings = sortedHearings.filter(h => new Date(h.date).toDateString() === today);
  const upcomingHearings = sortedHearings.filter(h => new Date(h.date).getTime() > new Date().getTime() && new Date(h.date).toDateString() !== today);
  
  const renderHearingCard = (h: any) => {
    const hearingDate = new Date(h.date);
    const timeString = hearingDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateString = hearingDate.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
    
    return (
      <Card key={h.id} className="mb-4 hover:shadow-md transition-shadow">
        <CardContent className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="bg-primary/10 text-primary rounded-lg p-3 text-center min-w-20">
              <p className="text-xs font-semibold uppercase">{hearingDate.toLocaleDateString('en-US', { month: 'short' })}</p>
              <p className="text-xl font-bold font-display">{hearingDate.getDate()}</p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                  h.status === 'Upcoming' ? 'bg-blue-100 text-blue-700' :
                  h.status === 'Completed' ? 'bg-green-100 text-green-700' :
                  h.status === 'Adjourned' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {h.status}
                </span>
                <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{h.stage}</span>
              </div>
              <h3 className="font-semibold text-base">{h.title}</h3>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{timeString}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  <span>{h.court}</span>
                </div>
                {h.conflictWarning && (
                  <div className="flex items-center gap-1 text-red-600 bg-red-50 px-2 py-0.5 rounded text-xs font-medium">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    Conflict Risk
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex flex-row md:flex-col gap-2 shrink-0 border-t md:border-t-0 pt-4 md:pt-0">
            <Button variant="outline" size="sm" className="w-full">View Case</Button>
            {h.status === 'Upcoming' && (
              <Button size="sm" className="w-full" onClick={() => setUpdateHearingId(h.id)}>
                Update Outcome
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const currentHearings = search ? sortedHearings.filter(h => 
    h.title.toLowerCase().includes(search.toLowerCase()) || 
    h.court.toLowerCase().includes(search.toLowerCase())
  ) : sortedHearings;

  return (
    <AppLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-display font-semibold tracking-tight">Court Calendar</h1>
            <p className="text-sm text-muted-foreground mt-1">Track your schedules, hearings, and deadlines.</p>
          </div>
          <Button 
            className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2 shrink-0"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <CalendarIcon className="h-4 w-4" /> Add Hearing
          </Button>
        </div>

        <CreateHearingModal 
          isOpen={isCreateModalOpen} 
          onClose={() => setIsCreateModalOpen(false)} 
        />

        <UpdateHearingModal 
          isOpen={!!updateHearingId} 
          onClose={() => setUpdateHearingId(null)} 
          hearingId={updateHearingId}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search hearings by case or court..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-white"
              />
            </div>

            {!search && (
              <>
                <section>
                  <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
                    Today's Hearings ({todaysHearings.length})
                  </h2>
                  {todaysHearings.length > 0 ? (
                    todaysHearings.map(renderHearingCard)
                  ) : (
                    <div className="text-center py-8 bg-muted/30 rounded-lg border border-dashed">
                      <p className="text-muted-foreground">No hearings scheduled for today.</p>
                    </div>
                  )}
                </section>

                <section>
                  <h2 className="text-lg font-semibold mb-4 mt-8">Upcoming Hearings ({upcomingHearings.length})</h2>
                  {upcomingHearings.length > 0 ? (
                    upcomingHearings.map(renderHearingCard)
                  ) : (
                    <div className="text-center py-8 bg-muted/30 rounded-lg border border-dashed">
                      <p className="text-muted-foreground">No upcoming hearings scheduled.</p>
                    </div>
                  )}
                </section>
              </>
            )}

            {search && (
               <section>
                 <h2 className="text-lg font-semibold mb-4">Search Results ({currentHearings.length})</h2>
                 {currentHearings.map(renderHearingCard)}
               </section>
            )}
          </div>
          
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Mini Calendar</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  className="rounded-md border shadow"
                />
              </CardContent>
            </Card>

            <Card className="border-blue-200 bg-blue-50/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-blue-800 flex items-center justify-between">
                  Smart Insights 
                  <span className="text-[10px] bg-blue-200 text-blue-800 px-1.5 py-0.5 rounded">Engine Active</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm space-y-3 text-blue-900/80">
                  <li className="flex gap-2">
                    <div className="mt-0.5 h-1.5 w-1.5 rounded-full bg-blue-500 shrink-0" />
                    <p>You have <strong>{todaysHearings.length}</strong> hearings today.</p>
                  </li>
                  {todaysHearings.length > 0 && (
                    <li className="flex gap-2">
                      <div className="mt-0.5 h-1.5 w-1.5 rounded-full bg-blue-500 shrink-0" />
                      <p>First hearing is at <strong>{new Date(todaysHearings[0].date).toLocaleTimeString([], { hour: '2-digit', minute:'2-digit' })}</strong>. Traffic is light; leave by <strong>{new Date(new Date(todaysHearings[0].date).getTime() - 45*60000).toLocaleTimeString([], { hour: '2-digit', minute:'2-digit' })}</strong> for a safe buffer.</p>
                    </li>
                  )}
                  {sortedHearings.some(h => h.conflictWarning) && (
                     <li className="flex gap-2 text-amber-700 font-medium">
                       <AlertTriangle className="h-4 w-4 shrink-0" />
                       <p>You have a potential scheduling clash identified.</p>
                     </li>
                  )}
                  <li className="flex gap-2 text-blue-700/80">
                      <Clock className="h-4 w-4 shrink-0" />
                      <p className="text-xs">Reminders for clients are automated at T-3 days and T-1 day via WhatsApp.</p>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
