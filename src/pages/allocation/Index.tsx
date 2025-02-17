
import Layout from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const AllocationPage = () => {
  const allocations = [
    {
      worker: "John Smith",
      job: "Steel Gate Installation",
      startDate: "Mar 1, 2024",
      endDate: "Mar 15, 2024",
      status: "Active",
    },
    {
      worker: "Sarah Johnson",
      job: "Factory Maintenance",
      startDate: "Mar 5, 2024",
      endDate: "Mar 20, 2024",
      status: "Scheduled",
    },
    {
      worker: "Mike Wilson",
      job: "Security Fence",
      startDate: "Mar 10, 2024",
      endDate: "Apr 1, 2024",
      status: "Active",
    },
  ];

  return (
    <Layout>
      <div className="p-6 max-w-7xl mx-auto w-full space-y-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-semibold">Worker Allocation</h1>
            <p className="text-muted-foreground">Manage work assignments</p>
          </div>
          <Button>New Allocation</Button>
        </div>
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Worker</TableHead>
                <TableHead>Job</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allocations.map((allocation) => (
                <TableRow key={`${allocation.worker}-${allocation.job}`}>
                  <TableCell className="font-medium">
                    {allocation.worker}
                  </TableCell>
                  <TableCell>{allocation.job}</TableCell>
                  <TableCell>{allocation.startDate}</TableCell>
                  <TableCell>{allocation.endDate}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        allocation.status === "Active" ? "default" : "secondary"
                      }
                    >
                      {allocation.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    </Layout>
  );
};

export default AllocationPage;
