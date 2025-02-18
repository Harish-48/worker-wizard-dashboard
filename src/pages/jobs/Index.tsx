
import Layout from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Briefcase, Calendar, Clock, Users } from "lucide-react";
import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface Job {
  id: string;
  title: string;
  supervisorId: string;
  supervisorName: string;
  numWorkers: number;
  startDate: string;
  dueDate: string;
  status: "Pending" | "In Progress" | "Completed";
}

const JobCard = ({ job, onStatusChange }: { job: Job; onStatusChange: (id: string, status: Job['status'], title: string) => void }) => {
  const calculateRemainingDays = () => {
    const today = new Date();
    const dueDate = new Date(job.dueDate);
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? `${diffDays} days remaining` : 'Past due';
  };

  return (
    <Card className="p-6 flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <div className="flex gap-4">
          <div className="w-12 h-12 rounded-full bg-primary/5 flex items-center justify-center">
            <Briefcase className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="font-medium">{job.title}</h3>
            <p className="text-sm text-muted-foreground">Supervisor: {job.supervisorName}</p>
          </div>
        </div>
        <Select 
          defaultValue={job.status}
          onValueChange={(value: Job['status']) => onStatusChange(job.id, value, job.title)}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="In Progress">In Progress</SelectItem>
            <SelectItem value="Completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Users className="w-4 h-4" />
          <span>{job.numWorkers} workers assigned</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Calendar className="w-4 h-4" />
          <span>Start: {job.startDate}</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Calendar className="w-4 h-4" />
          <span>Due: {job.dueDate}</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock className="w-4 h-4" />
          <span>{calculateRemainingDays()}</span>
        </div>
      </div>
    </Card>
  );
};

const JobsPage = () => {
  const [jobs, setJobs] = useState<Job[]>([]);

  useEffect(() => {
    const savedJobs = localStorage.getItem("jobs");
    if (savedJobs) {
      setJobs(JSON.parse(savedJobs));
    }
  }, []);

  const handleStatusChange = (jobId: string, newStatus: Job['status'], jobTitle: string) => {
    const updatedJobs = jobs.map(job => 
      job.id === jobId ? { ...job, status: newStatus } : job
    );
    setJobs(updatedJobs);
    localStorage.setItem("jobs", JSON.stringify(updatedJobs));

    // Update allocation and worker status if job is completed
    if (newStatus === "Completed") {
      // Update allocations
      const allocations = JSON.parse(localStorage.getItem("allocations") || "[]");
      const updatedAllocations = allocations.map((allocation: any) => 
        allocation.companyName === jobTitle ? { ...allocation, status: "Completed" } : allocation
      );
      localStorage.setItem("allocations", JSON.stringify(updatedAllocations));

      // Find the completed allocation
      const completedAllocation = allocations.find((a: any) => a.companyName === jobTitle);
      
      if (completedAllocation) {
        // Update workers' status
        const workers = JSON.parse(localStorage.getItem("workers") || "[]");
        const updatedWorkers = workers.map((worker: any) => {
          if (completedAllocation.workerIds.includes(worker.id) || 
              worker.id === completedAllocation.supervisorId) {
            return { ...worker, status: "Not Allocated" };
          }
          return worker;
        });
        localStorage.setItem("workers", JSON.stringify(updatedWorkers));
      }
    }

    toast.success("Job status updated successfully");
  };

  return (
    <Layout>
      <div className="p-6 max-w-7xl mx-auto w-full space-y-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-semibold">Jobs</h1>
            <p className="text-muted-foreground">Manage ongoing projects</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} onStatusChange={handleStatusChange} />
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default JobsPage;
