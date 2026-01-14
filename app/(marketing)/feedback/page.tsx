import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/Card";
import { Input } from "@/src/components/ui/Input";
import { Textarea } from "@/src/components/ui/Textarea";
import { Button } from "@/src/components/ui/Button";

export const metadata = {
  title: "Feedback",
  description: "Feedback fuer Seminarleitung und Admins."
};

export default function FeedbackPage() {
  return (
    <div className="container mx-auto space-y-8 pb-20 pt-12">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold">Feedback</h1>
        <p className="text-muted">
          Direkte Rueckmeldung an die Seminarleitung und Admins.
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Rueckmeldung an die Seminarleitung</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input placeholder="Name (optional)" />
            <Input placeholder="Email (optional)" type="email" />
            <Textarea rows={6} placeholder="Deine Rueckmeldung..." />
            <Button>Rueckmeldung senden (Mock)</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Bugs melden</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input placeholder="Name (optional)" />
            <Input placeholder="Email (optional)" type="email" />
            <Textarea rows={6} placeholder="Beschreibe den Fehler..." />
            <Button>Fehler melden (Mock)</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
