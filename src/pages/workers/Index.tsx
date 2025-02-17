
import Layout from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserCheck, Mail, Phone, Star, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface Worker {
  id: string;
  name: string;
  role: string;
  rating: number;
  email: string;
  phone: string;
}

const WorkerCard = ({ 
  worker, 
  onRemove,
  isAssigned 
}: { 
  worker: Worker;
  onRemove: (id: string) => void;
  isAssigned: boolean;
}) => (
  <Card className="p-6 flex flex-col gap-4 animate-enter relative">
    <Button 
      variant="ghost" 
      size="icon" 
      className="absolute top-2 right-2"
      onClick={() => onRemove(worker.id)}
    >
      <Trash2 className="w-4 h-4 text-muted-foreground" />
    </Button>
    <div className="flex items-start justify-between">
      <div className="flex gap-4">
        <div className="w-12 h-12 rounded-full bg-primary/5 flex items-center justify-center">
          <UserCheck className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h3 className="font-medium">{worker.name}</h3>
          <p className="text-sm text-muted-foreground">{worker.role}</p>
        </div>
      </div>
      <div className="flex items-center gap-1 mt-8">
        <Badge variant={isAssigned ? "default" : "secondary"}>
          {isAssigned ? "Work Assigned" : "Not Assigned"}
        </Badge>
      </div>
    </div>
    <div className="flex flex-col gap-2 text-sm">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Mail className="w-4 h-4" />
        <span>{worker.email}</span>
      </div>
      <div className="flex items-center gap-2 text-muted-foreground">
        <Phone className="w-4 h-4" />
        <span>{worker.phone}</span>
      </div>
    </div>
  </Card>
);

const WorkersPage = () => {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [isAddingWorker, setIsAddingWorker] = useState(false);
  const [newWorker, setNewWorker] = useState({
    name: "",
    role: "",
    email: "",
    phone: "",
  });

  // Get allocated workers from localStorage or empty array
  const getAllocations = () => {
    const allocations = localStorage.getItem("allocations");
    return allocations ? JSON.parse(allocations) : [];
  };

  const isWorkerAssigned = (workerId: string) => {
    const allocations = getAllocations();
    return allocations.some((allocation: any) => allocation.workerId === workerId);
  };

  const handleAddWorker = () => {
    if (!newWorker.name || !newWorker.role || !newWorker.email || !newWorker.phone) {
      toast.error("Please fill in all fields");
      return;
    }

    const worker: Worker = {
      id: Date.now().toString(),
      ...newWorker,
      rating: 5.0,
    };

    setWorkers([...workers, worker]);
    // Save to localStorage
    const updatedWorkers = [...workers, worker];
    localStorage.setItem("workers", JSON.stringify(updatedWorkers));
    
    setNewWorker({ name: "", role: "", email: "", phone: "" });
    setIsAddingWorker(false);
    toast.success("Worker added successfully");
  };

  const handleRemoveWorker = (id: string) => {
    const updatedWorkers = workers.filter(worker => worker.id !== id);
    setWorkers(updatedWorkers);
    localStorage.setItem("workers", JSON.stringify(updatedWorkers));
    toast.success("Worker removed successfully");
  };

  // Load workers from localStorage on component mount
  useState(() => {
    const savedWorkers = localStorage.getItem("workers");
    if (savedWorkers) {
      setWorkers(JSON.parse(savedWorkers));
    }
  });

  return (
    <Layout>
      <div className="p-6 max-w-7xl mx-auto w-full space-y-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-semibold">Workers</h1>
            <p className="text-muted-foreground">Manage your workforce</p>
          </div>
          <Button onClick={() => setIsAddingWorker(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Worker
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workers.map((worker) => (
            <WorkerCard 
              key={worker.id} 
              worker={worker} 
              onRemove={handleRemoveWorker}
              isAssigned={isWorkerAssigned(worker.id)}
            />
          ))}
        </div>

        <Sheet open={isAddingWorker} onOpenChange={setIsAddingWorker}>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Add New Worker</SheetTitle>
            </SheetHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Input
                  placeholder="Name"
                  value={newWorker.name}
                  onChange={(e) => setNewWorker({ ...newWorker, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Input
                  placeholder="Job Role"
                  value={newWorker.role}
                  onChange={(e) => setNewWorker({ ...newWorker, role: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Input
                  type="email"
                  placeholder="Email"
                  value={newWorker.email}
                  onChange={(e) => setNewWorker({ ...newWorker, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Input
                  placeholder="Phone Number"
                  value={newWorker.phone}
                  onChange={(e) => setNewWorker({ ...newWorker, phone: e.target.value })}
                />
              </div>
            </div>
            <SheetFooter>
              <Button onClick={handleAddWorker}>Submit</Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>
    </Layout>
  );
};

export default WorkersPage;
