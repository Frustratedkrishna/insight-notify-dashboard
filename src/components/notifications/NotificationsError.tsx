
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface NotificationsErrorProps {
  error: string;
}

export function NotificationsError({ error }: NotificationsErrorProps) {
  const navigate = useNavigate();
  
  return (
    <div className="w-full max-w-3xl">
      <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
      <Button onClick={() => navigate("/auth")}>
        Go to Login
      </Button>
    </div>
  );
}
