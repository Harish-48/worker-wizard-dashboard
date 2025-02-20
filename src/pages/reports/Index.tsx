
import Layout from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, FileText, Users, Timer, Download } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface AllocationReport {
  company_name: string;
  supervisor_name: string;
  worker_names: string[];
  start_date: string;
  end_date: string;
  status: string;
}

const ReportCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ElementType;
}) => (
  <Card className="p-6 animate-enter">
    <div className="flex items-start gap-4">
      <div className="p-2 bg-primary/5 rounded-lg">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <div>
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <p className="text-2xl font-semibold">{value}</p>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>
    </div>
  </Card>
);

const ReportsPage = () => {
  const [metrics, setMetrics] = useState({
    totalJobs: 0,
    activeWorkers: 0,
    avgCompletion: "0",
    completedThisMonth: 0
  });
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [filteredData, setFilteredData] = useState<AllocationReport[]>([]);

  useEffect(() => {
    if (startDate && endDate) {
      updateReportData();
    }
  }, [startDate, endDate]);

  const updateReportData = async () => {
    try {
      // Fetch allocations within the date range
      const { data: allocations, error: allocationsError } = await supabase
        .from('allocations')
        .select('*')
        .gte('start_date', startDate)
        .lte('end_date', endDate);

      if (allocationsError) throw allocationsError;

      // Fetch jobs data
      const { data: jobs, error: jobsError } = await supabase
        .from('jobs')
        .select('*');

      if (jobsError) throw jobsError;

      // Fetch workers data
      const { data: workers, error: workersError } = await supabase
        .from('workers')
        .select('*');

      if (workersError) throw workersError;

      // Set metrics
      setMetrics({
        totalJobs: jobs?.length || 0,
        activeWorkers: workers?.filter(w => w.status === "Work Allocated").length || 0,
        avgCompletion: calculateAverageCompletion(jobs || []),
        completedThisMonth: allocations?.length || 0
      });

      // Set filtered data for the table
      setFilteredData(allocations?.map(allocation => ({
        company_name: allocation.company_name,
        supervisor_name: allocation.supervisor_name,
        worker_names: allocation.worker_names,
        start_date: allocation.start_date,
        end_date: allocation.end_date,
        status: allocation.status
      })) || []);
    } catch (error) {
      console.error('Error fetching report data:', error);
      toast.error('Failed to fetch report data');
    }
  };

  const calculateAverageCompletion = (jobs: any[]) => {
    const completedJobs = jobs.filter(job => job.status === "Completed");
    if (completedJobs.length === 0) return "0 days";
    
    const totalDays = completedJobs.reduce((acc, job) => {
      const start = new Date(job.start_date);
      const end = new Date(job.due_date);
      return acc + Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    }, 0);
    
    return `${Math.round(totalDays / completedJobs.length)} days`;
  };

  const handleDownload = () => {
    if (!startDate || !endDate) {
      toast.error("Please select both start and end dates");
      return;
    }

    const csvContent = [
      ['Company Name', 'Supervisor', 'Workers', 'Start Date', 'End Date', 'Status'].join(','),
      ...filteredData.map(row => [
        row.company_name,
        row.supervisor_name,
        row.worker_names.join('; '),
        row.start_date,
        row.end_date,
        row.status
      ].map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `work_report_${startDate}_to_${endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Report downloaded successfully");
  };

  return (
    <Layout>
      <div className="p-6 max-w-7xl mx-auto w-full space-y-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-semibold">Reports</h1>
            <p className="text-muted-foreground">View performance metrics</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <input
                type="date"
                className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              <span>to</span>
              <input
                type="date"
                className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <Button onClick={handleDownload} disabled={!startDate || !endDate}>
              <Download className="w-4 h-4 mr-2" />
              Download Report
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <ReportCard
            title="Total Jobs"
            value={metrics.totalJobs.toString()}
            subtitle="All projects"
            icon={FileText}
          />
          <ReportCard
            title="Active Workers"
            value={metrics.activeWorkers.toString()}
            subtitle="Currently employed"
            icon={Users}
          />
          <ReportCard
            title="Avg. Completion"
            value={metrics.avgCompletion}
            subtitle="Per project"
            icon={Timer}
          />
          <ReportCard
            title="Selected Period"
            value={metrics.completedThisMonth.toString()}
            subtitle="Allocations made"
            icon={Calendar}
          />
        </div>

        <Card className="p-6">
          <h2 className="text-lg font-medium mb-6">Work Details</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-4">Company Name</th>
                  <th className="text-left py-2 px-4">Supervisor</th>
                  <th className="text-left py-2 px-4">Workers</th>
                  <th className="text-left py-2 px-4">Start Date</th>
                  <th className="text-left py-2 px-4">End Date</th>
                  <th className="text-left py-2 px-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((allocation, index) => (
                  <tr key={index} className="border-b">
                    <td className="py-2 px-4">{allocation.company_name}</td>
                    <td className="py-2 px-4">{allocation.supervisor_name}</td>
                    <td className="py-2 px-4">{allocation.worker_names.join(', ')}</td>
                    <td className="py-2 px-4">{allocation.start_date}</td>
                    <td className="py-2 px-4">{allocation.end_date}</td>
                    <td className="py-2 px-4">{allocation.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default ReportsPage;
