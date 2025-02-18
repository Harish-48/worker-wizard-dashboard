
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
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface Allocation {
  id: string;
  workerIds: string[];
  workerNames: string[];
  supervisorId: string;
  supervisorName: string;
  companyName: string;
  startDate: string;
  endDate: string;
  status: "Active" | "Completed";
}

const AllocationPage = () => {
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [isAddingAllocation, setIsAddingAllocation] = useState(false);
  const [workers, setWorkers] = useState<any[]>([]);
  const [selectedWorkers, setSelectedWorkers] = useState<string[]>([]);
  const [newAllocation, setNewAllocation] = useState({
    supervisorId: "",
    companyName: "",
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    // Load saved data from localStorage
    const savedAllocations = localStorage.getItem("allocations");
    const savedWorkers = localStorage.getItem("workers");

    if (savedAllocations) setAllocations(JSON.parse(savedAllocations));
    if (savedWorkers) setWorkers(JSON.parse(savedWorkers));
  }, []);

  const getAvailableSupervisors = () => {
    return workers.filter(worker => 
      worker.role.toLowerCase().includes('supervisor') &&
      !allocations.some(a => a.supervisorId === worker.id && a.status === "Active")
    );
  };

  const getAvailableWorkers = () => {
    return workers.filter(worker => 
      !worker.role.toLowerCase().includes('supervisor') &&
      !allocations.some(a => a.workerIds.includes(worker.id) && a.status === "Active")
    );
  };

  const toggleWorkerSelection = (workerId: string) => {
    setSelectedWorkers(prev => 
      prev.includes(workerId)
        ? prev.filter(id => id !== workerId)
        : [...prev, workerId]
    );
  };

  const handleAddAllocation = () => {
    if (!newAllocation.supervisorId || !selectedWorkers.length || !newAllocation.companyName || !newAllocation.startDate || !newAllocation.endDate) {
      toast.error("Please fill in all fields");
      return;
    }

    const supervisor = workers.find(w => w.id === newAllocation.supervisorId);
    const selectedWorkerDetails = workers.filter(w => selectedWorkers.includes(w.id));

    const allocation: Allocation = {
      id: Date.now().toString(),
      workerIds: selectedWorkers,
      workerNames: selectedWorkerDetails.map(w => w.name),
      supervisorId: newAllocation.supervisorId,
      supervisorName: supervisor?.name || "",
      companyName: newAllocation.companyName,
      startDate: newAllocation.startDate,
      endDate: newAllocation.endDate,
      status: "Active",
    };

    const updatedAllocations = [...allocations, allocation];
    setAllocations(updatedAllocations);
    localStorage.setItem("allocations", JSON.stringify(updatedAllocations));
    
    // Update workers' status
    const updatedWorkers = workers.map(w => ({
      ...w,
      status: selectedWorkers.includes(w.id) || w.id === newAllocation.supervisorId 
        ? "Work Allocated" 
        : "Not Allocated"
    }));
    localStorage.setItem("workers", JSON.stringify(updatedWorkers));
    
    // Create job entry
    const jobs = JSON.parse(localStorage.getItem("jobs") || "[]");
    const newJob = {
      id: Date.now().toString(),
      title: newAllocation.companyName,
      supervisorId: newAllocation.supervisorId,
      supervisorName: supervisor?.name,
      numWorkers: selectedWorkers.length,
      startDate: newAllocation.startDate,
      dueDate: newAllocation.endDate,
      status: "Pending",
    };
    localStorage.setItem("jobs", JSON.stringify([...jobs, newJob]));
    
    setNewAllocation({
      supervisorId: "",
      companyName: "",
      startDate: "",
      endDate: "",
    });
    setSelectedWorkers([]);
    setIsAddingAllocation(false);
    toast.success("Allocation added successfully");
  };

  const handleRemoveAllocation = (id: string) => {
    const allocation = allocations.find(a => a.id === id);
    if (!allocation) return;

    const updatedAllocations = allocations.filter(a => a.id !== id);
    setAllocations(updatedAllocations);
    localStorage.setItem("allocations", JSON.stringify(updatedAllocations));

    // Update workers' status
    const updatedWorkers = workers.map(w => ({
      ...w,
      status: allocation.workerIds.includes(w.id) || w.id === allocation.supervisorId
        ? "Not Allocated"
        : w.status
    }));
    localStorage.setItem("workers", JSON.stringify(updatedWorkers));

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
                <TableHead>Supervisor</TableHead>
                <TableHead>Workers</TableHead>
                <TableHead>Company</TableHead>
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
                    {allocation.supervisorName}
                  </TableCell>
                  <TableCell>{allocation.workerNames.join(", ")}</TableCell>
                  <TableCell>{allocation.companyName}</TableCell>
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
                <label className="text-sm font-medium">Supervisor</label>
                <Select
                  value={newAllocation.supervisorId}
                  onValueChange={(value) => setNewAllocation({ ...newAllocation, supervisorId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Supervisor" />
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailableSupervisors().map((supervisor) => (
                      <SelectItem key={supervisor.id} value={supervisor.id}>
                        {supervisor.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Select Workers</label>
                <div className="border rounded-md p-4 space-y-2 max-h-40 overflow-y-auto">
                  {getAvailableWorkers().map((worker) => (
                    <div key={worker.id} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={worker.id}
                        checked={selectedWorkers.includes(worker.id)}
                        onChange={() => toggleWorkerSelection(worker.id)}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <label htmlFor={worker.id} className="text-sm">
                        {worker.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Company Name</label>
                <Input
                  placeholder="Enter company name"
                  value={newAllocation.companyName}
                  onChange={(e) => setNewAllocation({ ...newAllocation, companyName: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Start Date</label>
                <input
                  type="date"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  value={newAllocation.startDate}
                  onChange={(e) => setNewAllocation({ ...newAllocation, startDate: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">End Date</label>
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
