
import Layout from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, FileText, Users, Timer, Download } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useState, useEffect } from "react";
import { toast } from "sonner";

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
  const [filteredData, setFilteredData] = useState<any[]>([]);

  useEffect(() => {
    updateMetrics();
  }, [startDate, endDate]);

  const updateMetrics = () => {
    const jobs = JSON.parse(localStorage.getItem("jobs") || "[]");
    const workers = JSON.parse(localStorage.getItem("workers") || "[]");
    const allocations = JSON.parse(localStorage.getItem("allocations") || "[]");

    let filteredAllocations = allocations;
    if (startDate && endDate) {
      filteredAllocations = allocations.filter((allocation: any) => {
        const allocationDate = new Date(allocation.startDate);
        return allocationDate >= new Date(startDate) && allocationDate <= new Date(endDate);
      });
    }

    setFilteredData(filteredAllocations);

    setMetrics({
      totalJobs: jobs.length,
      activeWorkers: workers.filter((w: any) => w.status === "Work Allocated").length,
      avgCompletion: calculateAverageCompletion(jobs),
      completedThisMonth: filteredAllocations.length
    });
  };

  const calculateAverageCompletion = (jobs: any[]) => {
    const completedJobs = jobs.filter(job => job.status === "Completed");
    if (completedJobs.length === 0) return "0 days";
    
    const totalDays = completedJobs.reduce((acc, job) => {
      const start = new Date(job.startDate);
      const end = new Date(job.dueDate);
      return acc + Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    }, 0);
    
    return `${Math.round(totalDays / completedJobs.length)} days`;
  };

  const handleDownload = () => {
    if (!startDate || !endDate) {
      toast.error("Please select both start and end dates");
      return;
    }

    const reportData = filteredData.map((allocation: any) => ({
      'Company Name': allocation.companyName,
      'Supervisor': allocation.supervisorName,
      'Workers': allocation.workerNames.join(', '),
      'Start Date': allocation.startDate,
      'End Date': allocation.endDate,
      'Status': allocation.status
    }));

    const headers = ['Company Name', 'Supervisor', 'Workers', 'Start Date', 'End Date', 'Status'];
    const csvContent = [
      headers.join(','),
      ...reportData.map(row => headers.map(header => `"${row[header as keyof typeof row]}"`).join(','))
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
                {filteredData.map((allocation: any, index: number) => (
                  <tr key={index} className="border-b">
                    <td className="py-2 px-4">{allocation.companyName}</td>
                    <td className="py-2 px-4">{allocation.supervisorName}</td>
                    <td className="py-2 px-4">{allocation.workerNames.join(', ')}</td>
                    <td className="py-2 px-4">{allocation.startDate}</td>
                    <td className="py-2 px-4">{allocation.endDate}</td>
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
