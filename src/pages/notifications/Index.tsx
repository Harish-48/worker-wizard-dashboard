
import Layout from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, Calendar } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Notification {
  id: string;
  company_name: string;
  due_date: string;
  daysRemaining: number;
}

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    fetchUpcomingDeadlines();
  }, []);

  const fetchUpcomingDeadlines = async () => {
    try {
      const today = new Date();
      const { data: jobs, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('status', 'In Progress');

      if (error) throw error;

      const upcomingDeadlines = (jobs || [])
        .map(job => {
          const dueDate = new Date(job.due_date);
          const timeDiff = dueDate.getTime() - today.getTime();
          const daysRemaining = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
          
          return {
            id: job.id,
            company_name: job.title,
            due_date: job.due_date,
            daysRemaining
          };
        })
        .filter(job => job.daysRemaining <= 1 && job.daysRemaining >= 0);

      setNotifications(upcomingDeadlines);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  return (
    <Layout>
      <div className="p-6 max-w-7xl mx-auto w-full space-y-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-semibold">Notifications</h1>
            <p className="text-muted-foreground">Upcoming deadline alerts</p>
          </div>
        </div>

        <div className="grid gap-4">
          {notifications.length === 0 ? (
            <Card className="p-6">
              <div className="flex items-center justify-center text-muted-foreground">
                <Bell className="w-4 h-4 mr-2" />
                <span>No upcoming deadlines</span>
              </div>
            </Card>
          ) : (
            notifications.map((notification) => (
              <Card key={notification.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center">
                      <Bell className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">{notification.company_name}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <Calendar className="w-4 h-4" />
                        <span>Due: {notification.due_date}</span>
                      </div>
                    </div>
                  </div>
                  <Badge variant="destructive">
                    {notification.daysRemaining === 0
                      ? "Due today"
                      : "Due tomorrow"}
                  </Badge>
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
