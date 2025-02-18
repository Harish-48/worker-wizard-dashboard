
import Layout from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Bell, Calendar, AlertTriangle } from "lucide-react";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: "warning" | "info";
  date: string;
}

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const checkDueDates = () => {
      const jobs = JSON.parse(localStorage.getItem("jobs") || "[]");
      const today = new Date();
      const newNotifications: Notification[] = [];

      jobs.forEach((job: any) => {
        if (job.status === "Completed") return;
        
        const dueDate = new Date(job.dueDate);
        const timeDiff = dueDate.getTime() - today.getTime();
        const daysRemaining = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

        if (daysRemaining <= 7 && daysRemaining > 0) {
          newNotifications.push({
            id: `${job.id}-due`,
            title: `Due Date Approaching: ${job.title}`,
            message: `Project "${job.title}" is due in ${daysRemaining} days`,
            type: "warning",
            date: job.dueDate,
          });
        } else if (daysRemaining <= 0) {
          newNotifications.push({
            id: `${job.id}-overdue`,
            title: `Overdue: ${job.title}`,
            message: `Project "${job.title}" is overdue by ${Math.abs(daysRemaining)} days`,
            type: "warning",
            date: job.dueDate,
          });
        }
      });

      setNotifications(newNotifications);
    };

    checkDueDates();
    const interval = setInterval(checkDueDates, 1000 * 60 * 60); // Check every hour
    return () => clearInterval(interval);
  }, []);

  return (
    <Layout>
      <div className="p-6 max-w-7xl mx-auto w-full space-y-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-semibold">Notifications</h1>
            <p className="text-muted-foreground">Stay updated with important alerts</p>
          </div>
        </div>

        <div className="space-y-4">
          {notifications.length === 0 ? (
            <Card className="p-6">
              <div className="flex items-center justify-center text-muted-foreground">
                <Bell className="w-4 h-4 mr-2" />
                <span>No notifications at this time</span>
              </div>
            </Card>
          ) : (
            notifications.map((notification) => (
              <Card key={notification.id} className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-warning/10 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-warning" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">{notification.title}</h3>
                      <Badge variant={notification.type === "warning" ? "destructive" : "secondary"}>
                        {notification.type === "warning" ? "Warning" : "Info"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                    <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>Due: {notification.date}</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
};

export default NotificationsPage;
