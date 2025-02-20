
import Layout from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserCheck, Mail, Phone, Star, Plus, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface Worker {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  status: "Work Allocated" | "Not Allocated";
}

const WorkerCard = ({ 
  worker, 
  onRemove,
}: { 
  worker: Worker;
  onRemove: (id: string) => void;
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
        <Badge variant={worker.status === "Work Allocated" ? "default" : "secondary"}>
          {worker.status}
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

  useEffect(() => {
    fetchWorkers();
  }, []);

  const fetchWorkers = async () => {
    try {
      const { data, error } = await supabase
        .from('workers')
        .select('*');
      
      if (error) throw error;
      // Type cast the data to match our Worker interface
      setWorkers((data as Worker[]) || []);
    } catch (error) {
      console.error('Error fetching workers:', error);
      toast.error('Failed to fetch workers');
    }
  };

  const handleAddWorker = async () => {
    if (!newWorker.name || !newWorker.role || !newWorker.email || !newWorker.phone) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      const { data, error } = await supabase
        .from('workers')
        .insert([{
          ...newWorker,
          status: "Not Allocated" as const
        }])
        .select()
        .single();

      if (error) throw error;

      setWorkers([...workers, data as Worker]);
      setNewWorker({ name: "", role: "", email: "", phone: "" });
      setIsAddingWorker(false);
      toast.success("Worker added successfully");
    } catch (error) {
      console.error('Error adding worker:', error);
      toast.error('Failed to add worker');
    }
  };

  const handleRemoveWorker = async (id: string) => {
    try {
      const { error } = await supabase
        .from('workers')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setWorkers(workers.filter(worker => worker.id !== id));
      toast.success("Worker removed successfully");
    } catch (error) {
      console.error('Error removing worker:', error);
      toast.error('Failed to remove worker');
    }
  };

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
