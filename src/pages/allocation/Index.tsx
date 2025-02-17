
import Layout from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface Allocation {
  id: string;
  workerId: string;
  workerName: string;
  supervisorId: string;
  supervisorName: string;
  jobIds: string[];
  jobTitles: string[];
  numWorkers: number;
  jobDescription: string;
  startDate: string;
  endDate: string;
  status: string;
}

const AllocationPage = () => {
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [isAddingAllocation, setIsAddingAllocation] = useState(false);
  const [workers, setWorkers] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [supervisors, setSupervisors] = useState<any[]>([]);
  const [selectedJobs, setSelectedJobs] = useState<string[]>([]);
  const [newAllocation, setNewAllocation] = useState({
    workerId: "",
    supervisorId: "",
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    // Load saved data from localStorage
    const savedAllocations = localStorage.getItem("allocations");
    const savedWorkers = localStorage.getItem("workers");
    const savedJobs = localStorage.getItem("jobs");

    if (savedAllocations) setAllocations(JSON.parse(savedAllocations));
    if (savedWorkers) {
      const workers = JSON.parse(savedWorkers);
      setWorkers(workers);
      // Filter supervisors from workers
      setSupervisors(workers.filter((w: any) => w.role.toLowerCase().includes('supervisor')));
    }
    if (savedJobs) setJobs(JSON.parse(savedJobs));
  }, []);

  const handleAddAllocation = () => {
    if (!newAllocation.workerId || !newAllocation.supervisorId || !selectedJobs.length || !newAllocation.startDate || !newAllocation.endDate) {
      toast.error("Please fill in all fields");
      return;
    }

    const worker = workers.find(w => w.id === newAllocation.workerId);
    const supervisor = workers.find(w => w.id === newAllocation.supervisorId);
    const selectedJobDetails = jobs.filter(j => selectedJobs.includes(j.id));

    const allocation: Allocation = {
      id: Date.now().toString(),
      workerId: newAllocation.workerId,
      workerName: worker?.name || "",
      supervisorId: newAllocation.supervisorId,
      supervisorName: supervisor?.name || "",
      jobIds: selectedJobs,
      jobTitles: selectedJobDetails.map(j => j.title),
      numWorkers: selectedJobDetails.length,
      jobDescription: selectedJobDetails.map(j => j.description).join(", "),
      startDate: newAllocation.startDate,
      endDate: newAllocation.endDate,
      status: "Active",
    };

    const updatedAllocations = [...allocations, allocation];
    setAllocations(updatedAllocations);
    localStorage.setItem("allocations", JSON.stringify(updatedAllocations));
    
    // Update worker status in localStorage
    const updatedWorkers = workers.map(w => 
      w.id === worker?.id ? { ...w, status: "Work Allocated" } : w
    );
    localStorage.setItem("workers", JSON.stringify(updatedWorkers));
    
    setNewAllocation({
      workerId: "",
      supervisorId: "",
      startDate: "",
      endDate: "",
    });
    setSelectedJobs([]);
    setIsAddingAllocation(false);
    toast.success("Allocation added successfully");
  };

  const handleRemoveAllocation = (id: string) => {
    const updatedAllocations = allocations.filter(allocation => allocation.id !== id);
    setAllocations(updatedAllocations);
    localStorage.setItem("allocations", JSON.stringify(updatedAllocations));
    toast.success("Allocation removed successfully");
  };

  const toggleJobSelection = (jobId: string) => {
    setSelectedJobs(prev => 
      prev.includes(jobId) 
        ? prev.filter(id => id !== jobId)
        : [...prev, jobId]
    );
  };

  return (
    <Layout>
      <div className="p-6 max-w-7xl mx-auto w-full space-y-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-semibold">Worker Allocation</h1>
            <p className="text-muted-foreground">Manage work assignments</p>
          </div>
          <Button onClick={() => setIsAddingAllocation(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Allocation
          </Button>
        </div>
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Worker</TableHead>
                <TableHead>Supervisor</TableHead>
                <TableHead>Jobs</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allocations.map((allocation) => (
                <TableRow key={allocation.id}>
                  <TableCell className="font-medium">
                    {allocation.workerName}
                  </TableCell>
                  <TableCell>{allocation.supervisorName}</TableCell>
                  <TableCell>{allocation.jobTitles.join(", ")}</TableCell>
                  <TableCell>{allocation.startDate}</TableCell>
                  <TableCell>{allocation.endDate}</TableCell>
                  <TableCell>
                    <Badge variant="default">
                      {allocation.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveAllocation(allocation.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        <Sheet open={isAddingAllocation} onOpenChange={setIsAddingAllocation}>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>New Allocation</SheetTitle>
            </SheetHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Select
                  value={newAllocation.supervisorId}
                  onValueChange={(value) => setNewAllocation({ ...newAllocation, supervisorId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Supervisor" />
                  </SelectTrigger>
                  <SelectContent>
                    {supervisors.map((supervisor) => (
                      <SelectItem key={supervisor.id} value={supervisor.id}>
                        {supervisor.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Select
                  value={newAllocation.workerId}
                  onValueChange={(value) => setNewAllocation({ ...newAllocation, workerId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Worker" />
                  </SelectTrigger>
                  <SelectContent>
                    {workers.map((worker) => (
                      worker.id !== newAllocation.supervisorId && (
                        <SelectItem key={worker.id} value={worker.id}>
                          {worker.name}
                        </SelectItem>
                      )
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <h4 className="text-sm font-medium mb-2">Select Jobs</h4>
                <div className="grid gap-2 p-2 border rounded-md max-h-32 overflow-y-auto">
                  {jobs.map((job) => (
                    <div key={job.id} className="flex items-center">
                      <input
                        type="checkbox"
                        id={job.id}
                        checked={selectedJobs.includes(job.id)}
                        onChange={() => toggleJobSelection(job.id)}
                        className="mr-2"
                      />
                      <label htmlFor={job.id} className="text-sm">
                        {job.title}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <input
                  type="date"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  value={newAllocation.startDate}
                  onChange={(e) => setNewAllocation({ ...newAllocation, startDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <input
                  type="date"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  value={newAllocation.endDate}
                  onChange={(e) => setNewAllocation({ ...newAllocation, endDate: e.target.value })}
                />
              </div>
            </div>
            <SheetFooter>
              <Button onClick={handleAddAllocation}>Submit</Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>
    </Layout>
  );
};

export default AllocationPage;
