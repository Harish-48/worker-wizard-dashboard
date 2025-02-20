
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
import { supabase } from "@/integrations/supabase/client";

interface Allocation {
  id: string;
  worker_ids: string[];
  worker_names: string[];
  supervisor_id: string;
  supervisor_name: string;
  company_name: string;
  start_date: string;
  end_date: string;
  status: "Active" | "Completed";
}

const AllocationPage = () => {
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [isAddingAllocation, setIsAddingAllocation] = useState(false);
  const [workers, setWorkers] = useState<any[]>([]);
  const [selectedWorkers, setSelectedWorkers] = useState<string[]>([]);
  const [newAllocation, setNewAllocation] = useState({
    supervisor_id: "",
    company_name: "",
    start_date: "",
    end_date: "",
  });

  useEffect(() => {
    fetchAllocations();
    fetchWorkers();
  }, []);

  const fetchAllocations = async () => {
    try {
      const { data, error } = await supabase
        .from('allocations')
        .select('*');
      
      if (error) throw error;
      setAllocations(data || []);
    } catch (error) {
      console.error('Error fetching allocations:', error);
      toast.error('Failed to fetch allocations');
    }
  };

  const fetchWorkers = async () => {
    try {
      const { data, error } = await supabase
        .from('workers')
        .select('*');
      
      if (error) throw error;
      setWorkers(data || []);
    } catch (error) {
      console.error('Error fetching workers:', error);
      toast.error('Failed to fetch workers');
    }
  };

  const getAvailableSupervisors = () => {
    return workers.filter(worker => 
      worker.role.toLowerCase().includes('supervisor') &&
      worker.status === "Not Allocated"
    );
  };

  const getAvailableWorkers = () => {
    return workers.filter(worker => 
      !worker.role.toLowerCase().includes('supervisor') &&
      worker.status === "Not Allocated"
    );
  };

  const toggleWorkerSelection = (workerId: string) => {
    setSelectedWorkers(prev => 
      prev.includes(workerId)
        ? prev.filter(id => id !== workerId)
        : [...prev, workerId]
    );
  };

  const handleAddAllocation = async () => {
    if (!newAllocation.supervisor_id || !selectedWorkers.length || !newAllocation.company_name || !newAllocation.start_date || !newAllocation.end_date) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      const supervisor = workers.find(w => w.id === newAllocation.supervisor_id);
      const selectedWorkerDetails = workers.filter(w => selectedWorkers.includes(w.id));

      const { data: allocationData, error: allocationError } = await supabase
        .from('allocations')
        .insert([{
          worker_ids: selectedWorkers,
          worker_names: selectedWorkerDetails.map(w => w.name),
          supervisor_id: newAllocation.supervisor_id,
          supervisor_name: supervisor?.name || "",
          company_name: newAllocation.company_name,
          start_date: newAllocation.start_date,
          end_date: newAllocation.end_date,
          status: "Active"
        }])
        .select()
        .single();

      if (allocationError) throw allocationError;

      // Update workers' status
      const { error: workersError } = await supabase
        .from('workers')
        .update({ status: "Work Allocated" })
        .in('id', [...selectedWorkers, newAllocation.supervisor_id]);

      if (workersError) throw workersError;

      // Create job entry
      const { error: jobError } = await supabase
        .from('jobs')
        .insert([{
          title: newAllocation.company_name,
          supervisor_id: newAllocation.supervisor_id,
          supervisor_name: supervisor?.name,
          num_workers: selectedWorkers.length,
          start_date: newAllocation.start_date,
          due_date: newAllocation.end_date,
          status: "Pending"
        }]);

      if (jobError) throw jobError;

      setAllocations([...allocations, allocationData]);
      setNewAllocation({
        supervisor_id: "",
        company_name: "",
        start_date: "",
        end_date: "",
      });
      setSelectedWorkers([]);
      setIsAddingAllocation(false);
      await fetchWorkers(); // Refresh workers list
      toast.success("Allocation added successfully");
    } catch (error) {
      console.error('Error adding allocation:', error);
      toast.error('Failed to add allocation');
    }
  };

  const handleRemoveAllocation = async (id: string) => {
    try {
      const allocation = allocations.find(a => a.id === id);
      if (!allocation) return;

      const { error: allocationError } = await supabase
        .from('allocations')
        .delete()
        .eq('id', id);

      if (allocationError) throw allocationError;

      const workerIds = [...allocation.worker_ids, allocation.supervisor_id];
      const { error: workersError } = await supabase
        .from('workers')
        .update({ status: "Not Allocated" })
        .in('id', workerIds);

      if (workersError) throw workersError;

      setAllocations(allocations.filter(a => a.id !== id));
      await fetchWorkers(); // Refresh workers list
      toast.success("Allocation removed successfully");
    } catch (error) {
      console.error('Error removing allocation:', error);
      toast.error('Failed to remove allocation');
    }
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
                    {allocation.supervisor_name}
                  </TableCell>
                  <TableCell>{allocation.worker_names.join(", ")}</TableCell>
                  <TableCell>{allocation.company_name}</TableCell>
                  <TableCell>{allocation.start_date}</TableCell>
                  <TableCell>{allocation.end_date}</TableCell>
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
                  value={newAllocation.supervisor_id}
                  onValueChange={(value) => setNewAllocation({ ...newAllocation, supervisor_id: value })}
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
                  value={newAllocation.company_name}
                  onChange={(e) => setNewAllocation({ ...newAllocation, company_name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Start Date</label>
                <input
                  type="date"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  value={newAllocation.start_date}
                  onChange={(e) => setNewAllocation({ ...newAllocation, start_date: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">End Date</label>
                <input
                  type="date"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  value={newAllocation.end_date}
                  onChange={(e) => setNewAllocation({ ...newAllocation, end_date: e.target.value })}
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
