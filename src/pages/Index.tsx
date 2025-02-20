
import Layout from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, FileText, Users, Timer } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const DashboardPage = () => {
  const [metrics, setMetrics] = useState({
    totalJobs: 0,
    activeWorkers: 0,
    completedJobs: 0,
    pendingAllocations: 0
  });

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      // Fetch jobs
      const { data: jobs } = await supabase.from('jobs').select('*');
      // Fetch workers
      const { data: workers } = await supabase.from('workers').select('*');
      // Fetch allocations
      const { data: allocations } = await supabase.from('allocations').select('*');

      setMetrics({
        totalJobs: jobs?.length || 0,
        activeWorkers: workers?.filter((w: any) => w.status === "Work Allocated").length || 0,
        completedJobs: jobs?.filter((j: any) => j.status === "Completed").length || 0,
        pendingAllocations: allocations?.length || 0
      });
    } catch (error) {
      console.error('Error fetching metrics:', error);
    }
  };

  return (
    <Layout>
      <div className="p-6 max-w-7xl mx-auto w-full space-y-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-semibold">Dashboard</h1>
            <p className="text-muted-foreground">Overview of your workforce</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <FileText className="h-8 w-8 text-primary" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Jobs</p>
                <p className="text-2xl font-bold">{metrics.totalJobs}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <Users className="h-8 w-8 text-primary" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Workers</p>
                <p className="text-2xl font-bold">{metrics.activeWorkers}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <Timer className="h-8 w-8 text-primary" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed Jobs</p>
                <p className="text-2xl font-bold">{metrics.completedJobs}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <Calendar className="h-8 w-8 text-primary" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Allocations</p>
                <p className="text-2xl font-bold">{metrics.pendingAllocations}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default DashboardPage;
