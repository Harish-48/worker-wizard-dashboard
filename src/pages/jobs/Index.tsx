
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
import { supabase } from "@/integrations/supabase/client";

interface Job {
  id: string;
  title: string;
  supervisor_id: string;
  supervisor_name: string;
  num_workers: number;
  start_date: string;
  due_date: string;
  status: "Pending" | "In Progress" | "Completed";
}

const JobCard = ({ job, onStatusChange }: { job: Job; onStatusChange: (id: string, status: Job['status'], title: string) => void }) => {
  const calculateRemainingDays = () => {
    const today = new Date();
    const dueDate = new Date(job.due_date);
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
            <p className="text-sm text-muted-foreground">Supervisor: {job.supervisor_name}</p>
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
          <span>{job.num_workers} workers assigned</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Calendar className="w-4 h-4" />
          <span>Start: {job.start_date}</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Calendar className="w-4 h-4" />
          <span>Due: {job.due_date}</span>
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
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*');
      
      if (error) throw error;
      setJobs(data || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      toast.error('Failed to fetch jobs');
    }
  };

  const handleStatusChange = async (jobId: string, newStatus: Job['status'], jobTitle: string) => {
    try {
      const { error: jobError } = await supabase
        .from('jobs')
        .update({ status: newStatus })
        .eq('id', jobId);

      if (jobError) throw jobError;

      if (newStatus === "Completed") {
        const { error: allocationError } = await supabase
          .from('allocations')
          .update({ status: "Completed" })
          .eq('company_name', jobTitle);

        if (allocationError) throw allocationError;

        const { data: allocation } = await supabase
          .from('allocations')
          .select('worker_ids, supervisor_id')
          .eq('company_name', jobTitle)
          .single();

        if (allocation) {
          const workerIds = [...allocation.worker_ids, allocation.supervisor_id];
          const { error: workersError } = await supabase
            .from('workers')
            .update({ status: "Not Allocated" })
            .in('id', workerIds);

          if (workersError) throw workersError;
        }
      }

      setJobs(jobs.map(job => 
        job.id === jobId ? { ...job, status: newStatus } : job
      ));
      
      toast.success("Job status updated successfully");
    } catch (error) {
      console.error('Error updating job status:', error);
      toast.error('Failed to update job status');
    }
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
