
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
  jobId: string;
  jobTitle: string;
  startDate: string;
  endDate: string;
  status: string;
}

const AllocationPage = () => {
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [isAddingAllocation, setIsAddingAllocation] = useState(false);
  const [workers, setWorkers] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [newAllocation, setNewAllocation] = useState({
    workerId: "",
    jobId: "",
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    // Load saved data from localStorage
    const savedAllocations = localStorage.getItem("allocations");
    const savedWorkers = localStorage.getItem("workers");
    const savedJobs = localStorage.getItem("jobs");

    if (savedAllocations) setAllocations(JSON.parse(savedAllocations));
    if (savedWorkers) setWorkers(JSON.parse(savedWorkers));
    if (savedJobs) setJobs(JSON.parse(savedJobs));
  }, []);

  const handleAddAllocation = () => {
    if (!newAllocation.workerId || !newAllocation.jobId || !newAllocation.startDate || !newAllocation.endDate) {
      toast.error("Please fill in all fields");
      return;
    }

    const worker = workers.find(w => w.id === newAllocation.workerId);
    const job = jobs.find(j => j.id === newAllocation.jobId);

    const allocation: Allocation = {
      id: Date.now().toString(),
      workerId: newAllocation.workerId,
      workerName: worker?.name || "",
      jobId: newAllocation.jobId,
      jobTitle: job?.title || "",
      startDate: newAllocation.startDate,
      endDate: newAllocation.endDate,
      status: "Active",
    };

    const updatedAllocations = [...allocations, allocation];
    setAllocations(updatedAllocations);
    localStorage.setItem("allocations", JSON.stringify(updatedAllocations));
    
    setNewAllocation({
      workerId: "",
      jobId: "",
      startDate: "",
      endDate: "",
    });
    setIsAddingAllocation(false);
    toast.success("Allocation added successfully");
  };

  const handleRemoveAllocation = (id: string) => {
    const updatedAllocations = allocations.filter(allocation => allocation.id !== id);
    setAllocations(updatedAllocations);
    localStorage.setItem("allocations", JSON.stringify(updatedAllocations));
    toast.success("Allocation removed successfully");
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
                <TableHead>Job</TableHead>
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
                  <TableCell>{allocation.jobTitle}</TableCell>
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
                  value={newAllocation.workerId}
                  onValueChange={(value) => setNewAllocation({ ...newAllocation, workerId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Worker" />
                  </SelectTrigger>
                  <SelectContent>
                    {workers.map((worker) => (
                      <SelectItem key={worker.id} value={worker.id}>
                        {worker.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Select
                  value={newAllocation.jobId}
                  onValueChange={(value) => setNewAllocation({ ...newAllocation, jobId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Job" />
                  </SelectTrigger>
                  <SelectContent>
                    {jobs.map((job) => (
                      <SelectItem key={job.id} value={job.id}>
                        {job.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
