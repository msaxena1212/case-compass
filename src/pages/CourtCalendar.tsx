import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/StatusBadge";
import { Calendar as CalendarIcon, Clock, MapPin, User, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

const hearings = [
  { id: 1, case: "Sharma vs. State of Maharashtra", caseId: "C-2024-0847", court: "Mumbai High Court", courtRoom: "Room 12", date: "2026-03-20", time: "10:30 AM", judge: "Hon. Justice Desai", type: "Final Hearing", status: "urgent" },
  { id: 2, case: "Patel Industries Ltd. Merger", caseId: "C-2024-0846", court: "NCLT Mumbai", courtRoom: "Room 5", date: "2026-03-22", time: "2:00 PM", judge: "Hon. Member Rao", type: "Arguments", status: "active" },
  { id: 3, case: "Singh Property Dispute", caseId: "C-2024-0845", court: "District Court Pune", courtRoom: "Room 3", date: "2026-03-25", time: "11:00 AM", judge: "Hon. Judge Verma", type: "Evidence", status: "active" },
  { id: 4, case: "Municipal Corp Land Acquisition", caseId: "C-2024-0842", court: "High Court Bombay", courtRoom: "Room 7", date: "2026-04-01", time: "10:00 AM", judge: "Hon. Justice Patel", type: "Admission", status: "pending" },
  { id: 5, case: "Reddy Tax Evasion Defense", caseId: "C-2024-0840", court: "Income Tax Tribunal", courtRoom: "Room 2", date: "2026-04-10", time: "3:30 PM", judge: "Hon. Member Shah", type: "Cross Examination", status: "active" },
  { id: 6, case: "Gupta vs. Gupta Divorce", caseId: "C-2024-0844", court: "Family Court Mumbai", courtRoom: "Room 1", date: "2026-04-05", time: "11:30 AM", judge: "Hon. Judge Iyer", type: "Mediation", status: "pending" },
];

const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();
const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export default function CourtCalendar() {
  const [currentMonth, setCurrentMonth] = useState(2); // March
  const [currentYear, setCurrentYear] = useState(2026);

  const days = daysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
  const hearingDates = hearings.map((h) => {
    const d = new Date(h.date);
    return { ...h, day: d.getDate(), month: d.getMonth(), year: d.getFullYear() };
  });

  const getHearingsForDay = (day: number) =>
    hearingDates.filter((h) => h.day === day && h.month === currentMonth && h.year === currentYear);

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(currentYear - 1); }
    else setCurrentMonth(currentMonth - 1);
  };
  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(currentYear + 1); }
    else setCurrentMonth(currentMonth + 1);
  };

  const upcomingHearings = hearings
    .filter((h) => new Date(h.date) >= new Date("2026-03-17"))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-display font-semibold tracking-tight">Court Calendar</h1>
          <p className="text-sm text-muted-foreground mt-1">Track hearings, filing dates, and court schedules</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-base font-body font-medium">
                {monthNames[currentMonth]} {currentYear}
              </CardTitle>
              <div className="flex gap-1">
                <button onClick={prevMonth} className="h-8 w-8 rounded-md flex items-center justify-center hover:bg-muted transition-colors">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button onClick={nextMonth} className="h-8 w-8 rounded-md flex items-center justify-center hover:bg-muted transition-colors">
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-px">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                  <div key={d} className="text-center text-xs font-medium text-muted-foreground py-2">{d}</div>
                ))}
                {Array.from({ length: firstDay }).map((_, i) => (
                  <div key={`empty-${i}`} className="h-20" />
                ))}
                {Array.from({ length: days }).map((_, i) => {
                  const day = i + 1;
                  const dayHearings = getHearingsForDay(day);
                  const isToday = day === 17 && currentMonth === 2 && currentYear === 2026;
                  return (
                    <div
                      key={day}
                      className={`h-20 p-1.5 border border-border/50 rounded-md hover:bg-muted/30 transition-colors ${isToday ? "bg-accent/10 border-accent/30" : ""}`}
                    >
                      <span className={`text-xs font-medium ${isToday ? "text-accent font-bold" : ""}`}>{day}</span>
                      {dayHearings.map((h) => (
                        <div key={h.id} className="mt-0.5 px-1 py-0.5 bg-primary/10 rounded text-[10px] truncate text-primary font-medium">
                          {h.time} · {h.case.split(" ")[0]}
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Hearings List */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-body font-medium">Upcoming Hearings</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y max-h-[600px] overflow-y-auto">
                {upcomingHearings.map((h) => {
                  const d = new Date(h.date);
                  return (
                    <div key={h.id} className="px-5 py-4 hover:bg-muted/30 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <p className="text-sm font-medium leading-tight">{h.case}</p>
                        <StatusBadge status={h.status} />
                      </div>
                      <p className="text-xs text-muted-foreground font-mono mb-2">{h.caseId}</p>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <CalendarIcon className="h-3 w-3" />
                          {d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                          <Clock className="h-3 w-3 ml-2" />
                          {h.time}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          {h.court} · {h.courtRoom}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <User className="h-3 w-3" />
                          {h.judge}
                        </div>
                      </div>
                      <div className="mt-2">
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">
                          {h.type}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
