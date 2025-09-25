import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileX } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardContent className="p-8 text-center space-y-6">
          <FileX className="h-16 w-16 mx-auto text-muted-foreground" />
          <div>
            <h1 className="text-4xl font-bold mb-2">404</h1>
            <h2 className="text-xl font-semibold mb-2">Page Not Found</h2>
            <p className="text-muted-foreground">
              The page you're looking for doesn't exist or has been moved.
            </p>
          </div>
          <Button onClick={() => window.location.href = "/"} className="w-full">
            Return to Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFound;
