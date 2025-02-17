
import Layout from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { UserCheck, Mail, Phone, Star } from "lucide-react";

const WorkerCard = ({ worker }: { worker: any }) => (
  <Card className="p-6 flex flex-col gap-4 animate-enter">
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
      <div className="flex items-center gap-1">
        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
        <span className="text-sm font-medium">{worker.rating}</span>
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
  const workers = [
    {
      name: "John Smith",
      role: "Senior Welder",
      rating: 4.8,
      email: "john.smith@example.com",
      phone: "+1 234 567 890",
    },
    {
      name: "Sarah Johnson",
      role: "Painter",
      rating: 4.5,
      email: "sarah.j@example.com",
      phone: "+1 234 567 891",
    },
    {
      name: "Mike Wilson",
      role: "Assembler",
      rating: 4.9,
      email: "mike.w@example.com",
      phone: "+1 234 567 892",
    },
  ];

  return (
    <Layout>
      <div className="p-6 max-w-7xl mx-auto w-full space-y-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-semibold">Workers</h1>
            <p className="text-muted-foreground">Manage your workforce</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workers.map((worker) => (
            <WorkerCard key={worker.email} worker={worker} />
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default WorkersPage;
