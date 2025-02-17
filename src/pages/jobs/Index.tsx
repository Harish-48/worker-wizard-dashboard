
import Layout from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Briefcase, Calendar, Clock, Users } from "lucide-react";
import { useState, useEffect } from "react";

const JobCard = ({ job }: { job: any }) => (
  <Card className="p-6 flex flex-col gap-4 animate-enter">
    <div className="flex items-start justify-between">
      <div className="flex gap-4">
        <div className="w-12 h-12 rounded-full bg-primary/5 flex items-center justify-center">
          <Briefcase className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h3 className="font-medium">{job.title}</h3>
          <p className="text-sm text-muted-foreground">{job.client}</p>
        </div>
      </div>
      <Badge variant={job.status === "In Progress" ? "default" : "secondary"}>
        {job.status}
      </Badge>
    </div>
    <div className="flex flex-col gap-2 text-sm">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Calendar className="w-4 h-4" />
        <span>Due: {job.dueDate}</span>
      </div>
      <div className="flex items-center gap-2 text-muted-foreground">
        <Users className="w-4 h-4" />
        <span>{job.workers} workers assigned</span>
      </div>
      <div className="flex items-center gap-2 text-muted-foreground">
        <Clock className="w-4 h-4" />
        <span>{job.duration}</span>
      </div>
    </div>
  </Card>
);

const JobsPage = () => {
  const [jobs, setJobs] = useState<any[]>([]);

  useEffect(() => {
    const savedJobs = localStorage.getItem("jobs");
    if (savedJobs) {
      setJobs(JSON.parse(savedJobs));
    }
  }, []);

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
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default JobsPage;
