
import Layout from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ChevronUp,
  UserCheck,
  Package,
  Plus,
  Users,
  FileText,
} from "lucide-react";

const DashboardCard = ({
  title,
  value,
  subtitle,
  trend,
  icon: Icon,
}: {
  title: string;
  value: string;
  subtitle: string;
  trend?: string;
  icon: React.ElementType;
}) => (
  <Card className="metric-card animate-enter">
    <div className="flex justify-between items-start mb-4">
      <div className="p-2 bg-primary/5 rounded-lg">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      {trend && (
        <div className="flex items-center text-green-500 text-sm">
          <ChevronUp className="h-4 w-4" />
          {trend}
        </div>
      )}
    </div>
    <h3 className="font-medium text-muted-foreground mb-1">{title}</h3>
    <p className="text-2xl font-semibold mb-1">{value}</p>
    <p className="text-sm text-muted-foreground">{subtitle}</p>
  </Card>
);

const QuickAction = ({
  title,
  icon: Icon,
  onClick,
}: {
  title: string;
  icon: React.ElementType;
  onClick: () => void;
}) => (
  <Button
    variant="outline"
    className="h-24 flex flex-col items-center justify-center gap-2 animate-enter"
    onClick={onClick}
  >
    <Icon className="h-6 w-6" />
    <span className="text-sm">{title}</span>
  </Button>
);

const Index = () => {
  return (
    <Layout>
      <div className="p-6 max-w-7xl mx-auto w-full space-y-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-semibold">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back</p>
          </div>
        </div>

        <div className="dashboard-grid">
          <DashboardCard
            title="Active Jobs"
            value="24"
            subtitle="8 jobs in progress"
            trend="12%"
            icon={Briefcase}
          />
          <DashboardCard
            title="Available Workers"
            value="18"
            subtitle="32 total workers"
            icon={UserCheck}
          />
          <DashboardCard
            title="Material Status"
            value="92%"
            subtitle="3 items low in stock"
            icon={Package}
          />
        </div>

        <div className="mt-8">
          <h2 className="text-lg font-medium mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <QuickAction
              title="Add New Job"
              icon={Plus}
              onClick={() => console.log("Add new job")}
            />
            <QuickAction
              title="Allocate Workers"
              icon={Users}
              onClick={() => console.log("Allocate workers")}
            />
            <QuickAction
              title="Generate Report"
              icon={FileText}
              onClick={() => console.log("Generate report")}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Index;
