
import { User, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const Navbar = () => {
  const navigate = useNavigate();
  const [hasNotifications, setHasNotifications] = useState(false);

  useEffect(() => {
    checkNotifications();
    // Set up a periodic check every minute
    const interval = setInterval(checkNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  const checkNotifications = async () => {
    try {
      const today = new Date();
      const { data: jobs, error } = await supabase
        .from('jobs')
        .select('due_date')
        .eq('status', 'In Progress');

      if (error) throw error;

      const hasUpcomingDeadlines = (jobs || []).some(job => {
        const dueDate = new Date(job.due_date);
        const timeDiff = dueDate.getTime() - today.getTime();
        const daysRemaining = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
        return daysRemaining <= 1 && daysRemaining >= 0;
      });

      setHasNotifications(hasUpcomingDeadlines);
    } catch (error) {
      console.error('Error checking notifications:', error);
    }
  };

  return (
    <nav className="h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-full items-center px-6 justify-between">
        <div className="flex items-center gap-6">
          <h1 
            className="text-lg font-semibold cursor-pointer" 
            onClick={() => navigate('/')}
          >
            Worker Wizard
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon"
            className="relative"
            onClick={() => navigate('/notifications')}
          >
            <Bell className="h-5 w-5" />
            {hasNotifications && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
            )}
          </Button>
          <Button variant="ghost" size="icon">
            <User className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
