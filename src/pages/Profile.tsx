import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface Interview {
  id: string;
  role: string;
  transcript: string;
  duration_seconds: number;
  created_at: string;
}

const Profile = () => {
  const { user, signOut } = useAuth();
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchInterviews();
    }
  }, [user]);

  const fetchInterviews = async () => {
    try {
      const { data, error } = await supabase
        .from("interviews")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setInterviews(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching interviews",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Profile</h1>
            <p className="text-muted-foreground">{user?.email}</p>
          </div>
          <div className="space-x-4">
            <Button onClick={() => navigate("/")} variant="outline">
              Home
            </Button>
            <Button onClick={handleSignOut} variant="destructive">
              Sign Out
            </Button>
          </div>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Interview History</CardTitle>
            <CardDescription>
              View all your completed interviews
            </CardDescription>
          </CardHeader>
          <CardContent>
            {interviews.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No interviews yet. Start your first interview!
              </p>
            ) : (
              <div className="space-y-4">
                {interviews.map((interview) => (
                  <Card key={interview.id} className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <Badge variant="secondary" className="mb-2">
                          {interview.role}
                        </Badge>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(interview.created_at)}
                        </p>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Duration: {formatDuration(interview.duration_seconds)}
                      </div>
                    </div>
                    {interview.transcript && (
                      <div className="mt-3">
                        <p className="text-sm font-medium mb-2">Transcript:</p>
                        <p className="text-sm text-muted-foreground bg-muted p-3 rounded max-h-32 overflow-y-auto">
                          {interview.transcript}
                        </p>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;