import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { caseService } from "@/services/caseService";
import { clientService } from "@/services/clientService";
import { Case, CaseType } from "@/types/case";
import { toast } from "sonner";
import { useQuery, useMutation } from "@tanstack/react-query";

const caseSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  type: z.enum(["Civil", "Criminal", "Corporate"]),
  court: z.string().min(2, "Court name is required"),
  caseNumber: z.string().optional(),
  filingDate: z.string().min(1, "Filing date is required"),
  clientId: z.string().min(1, "Client must be selected"),
  petitioner: z.string().min(1, "Petitioner is required"),
  respondent: z.string().min(1, "Respondent is required"),
  opposingLawyer: z.string().min(1, "Opposing lawyer is required"),
  judge: z.string().optional()
});

export default function CreateCase() {
  const navigate = useNavigate();
  
  const { data: clientsResponse, isLoading: loadingClients } = useQuery({
    queryKey: ['clients'],
    queryFn: () => clientService.getAllClients(1, 1000)
  });
  const clients = clientsResponse?.data || [];

  const createCaseMutation = useMutation({
    mutationFn: (newCase: any) => caseService.createCase(newCase),
    onSuccess: (data) => {
      toast.success("Case created successfully!");
      navigate(`/cases/${data.id}`);
    },
    onError: (error) => {
      toast.error("Failed to create case");
      console.error(error);
    }
  });

  const { register, handleSubmit, formState: { errors } } = useForm<z.infer<typeof caseSchema>>({
    resolver: zodResolver(caseSchema),
    defaultValues: {
      type: "Civil",
      filingDate: new Date().toISOString().split('T')[0]
    }
  });

  const onSubmit = (data: z.infer<typeof caseSchema>) => {
    const newCase = {
      title: data.title,
      type: data.type,
      status: 'Filed',
      court: data.court,
      caseNumber: data.caseNumber,
      filingDate: data.filingDate,
      lawyerId: (window as any).currentUser?.id || 'law_1', // Use actual user ID if available
      clientId: data.clientId,
      opponent: {
        petitioner: data.petitioner,
        respondent: data.respondent,
        opposingLawyer: data.opposingLawyer,
        judge: data.judge
      },
      tags: [],
      healthScore: 100
    };

    createCaseMutation.mutate(newCase);
  };

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-display font-semibold tracking-tight">Create New Case</h1>
          <p className="text-sm text-muted-foreground mt-1">Initialize a new case matter and map stakeholders.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <p className="text-sm text-muted-foreground">Enter the primary details of the case.</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Case Title *</label>
                  <Input {...register("title")} placeholder="e.g. Sharma vs. State" />
                  {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Case Type *</label>
                  <select {...register("type")} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                    <option value="Civil">Civil</option>
                    <option value="Criminal">Criminal</option>
                    <option value="Corporate">Corporate</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Court Name *</label>
                  <Input {...register("court")} placeholder="e.g. High Court" />
                  {errors.court && <p className="text-xs text-red-500">{errors.court.message}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Case Number (Optional)</label>
                  <Input {...register("caseNumber")} placeholder="e.g. CR-2023-01" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Filing Date *</label>
                  <Input type="date" {...register("filingDate")} />
                  {errors.filingDate && <p className="text-xs text-red-500">{errors.filingDate.message}</p>}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Stakeholders Mapping</CardTitle>
              <p className="text-sm text-muted-foreground">Map the client and opposing parties.</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Client *</label>
                <select {...register("clientId")} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                  <option value="">-- Choose a client --</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.type})</option>
                  ))}
                </select>
                {errors.clientId && <p className="text-xs text-red-500">{errors.clientId.message}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Petitioner *</label>
                  <Input {...register("petitioner")} placeholder="Petitioner Name" />
                  {errors.petitioner && <p className="text-xs text-red-500">{errors.petitioner.message}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Respondent *</label>
                  <Input {...register("respondent")} placeholder="Respondent Name" />
                  {errors.respondent && <p className="text-xs text-red-500">{errors.respondent.message}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Opposing Lawyer *</label>
                  <Input {...register("opposingLawyer")} placeholder="Lawyer Name" />
                  {errors.opposingLawyer && <p className="text-xs text-red-500">{errors.opposingLawyer.message}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Judge Name (Optional)</label>
                  <Input {...register("judge")} placeholder="Judge Name" />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => navigate('/cases')}>Cancel</Button>
            <Button type="submit">Create Case</Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
