import { Layout } from "@/components/common/Layout";
import { Button } from "@/components/ui/button";

export function Workout() {
  return (
    <Layout>
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-8">
        <div className="max-w-md space-y-4 text-center">
          <h1 className="text-2xl font-bold tracking-tight">Workout</h1>
          <p className="text-sm text-muted-foreground">
            This is a placeholder for your guided workout flow. You&apos;ll be
            able to complete each exercise here in a future update.
          </p>
          <Button
            variant="outline"
            className="mt-2"
            onClick={() => window.history.back()}
          >
            Close
          </Button>
        </div>
      </div>
    </Layout>
  );
}


