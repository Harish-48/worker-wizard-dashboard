
import Layout from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, FileText, Users, Timer } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

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
  const data = [
    { name: "Jan", completed: 4 },
    { name: "Feb", completed: 6 },
    { name: "Mar", completed: 8 },
    { name: "Apr", completed: 5 },
    { name: "May", completed: 7 },
    { name: "Jun", completed: 9 },
  ];

  return (
    <Layout>
      <div className="p-6 max-w-7xl mx-auto w-full space-y-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-semibold">Reports</h1>
            <p className="text-muted-foreground">View performance metrics</p>
          </div>
          <Button>Download Report</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <ReportCard
            title="Total Jobs"
            value="156"
            subtitle="12 this month"
            icon={FileText}
          />
          <ReportCard
            title="Active Workers"
            value="32"
            subtitle="8 on leave"
            icon={Users}
          />
          <ReportCard
            title="Avg. Completion"
            value="18 days"
            subtitle="2 days faster than target"
            icon={Timer}
          />
          <ReportCard
            title="This Month"
            value="24"
            subtitle="Jobs completed"
            icon={Calendar}
          />
        </div>

        <Card className="p-6">
          <h2 className="text-lg font-medium mb-6">Jobs Completed</h2>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="completed" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default ReportsPage;
