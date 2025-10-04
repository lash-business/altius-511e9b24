import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// In a real app, this would be imported from package.json at build time
const healthData = {
  status: "ok",
  version: "0.1.0",
  timestamp: new Date().toISOString(),
};

export function Health() {
  return (
    <div className="container py-12">
      <Card className="mx-auto max-w-2xl">
        <CardHeader>
          <CardTitle>Health Check</CardTitle>
          <CardDescription>Application status and version information</CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="rounded-lg bg-muted p-4 overflow-auto">
            <code className="text-sm">
              {JSON.stringify(healthData, null, 2)}
            </code>
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}
