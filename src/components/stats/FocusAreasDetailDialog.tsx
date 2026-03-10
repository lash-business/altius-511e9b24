import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import type { ImpactData, StrengthData, SymmetryData, BalanceData } from "@/pages/Stats";

interface FocusAreasDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  impactData: ImpactData[];
  strengthData: StrengthData[];
  symmetryData: SymmetryData[];
  balanceData: BalanceData[];
}

const MUSCLE_NAMES: Record<string, string> = {
  quad: "Quad",
  ham: "Hamstring",
  glute: "Glute",
  abductor: "Abductor",
};

function getMuscle(key: string): string {
  return MUSCLE_NAMES[key] ?? key;
}

const BADGE_CLASS = "text-muted-foreground border-muted-foreground/40 w-fit";

function findImpact(
  impactData: ImpactData[],
  measurementName: string,
  muscleGroup: string,
): ImpactData | null {
  const name = measurementName.toLowerCase();
  return (
    impactData.find(
      (r) =>
        r.measurement_name &&
        name.includes(r.measurement_name.toLowerCase()) &&
        r.muscle_group === muscleGroup,
    ) ?? null
  );
}

// ── Strength section ───────────────────────────────────────────────

interface StrengthCardData {
  label: string;
  leftPct: string;
  rightPct: string;
  impact: ImpactData | null;
}

function buildStrengthCards(
  impactData: ImpactData[],
  strengthData: StrengthData[],
): StrengthCardData[] {
  const strengthImpacts = impactData.filter((r) => r.category === "Strength");
  return strengthImpacts.map((row) => {
    const impactName = row.measurement_name?.toLowerCase() ?? "";
    const left = strengthData.find(
      (s) => s.left_right === "left" && s.measurement_name?.toLowerCase().includes(impactName),
    );
    const right = strengthData.find(
      (s) => s.left_right === "right" && s.measurement_name?.toLowerCase().includes(impactName),
    );
    return {
      label: `${getMuscle(row.muscle_group ?? "")} Strength`,
      leftPct: left ? `${Math.round((left.norm_percent ?? 0) * 100)}%` : "—",
      rightPct: right ? `${Math.round((right.norm_percent ?? 0) * 100)}%` : "—",
      impact: row,
    };
  });
}

// ── Symmetry section ───────────────────────────────────────────────

interface SymmetryCardData {
  label: string;
  leftRaw: string;
  rightRaw: string;
  impact: ImpactData | null;
}

function buildSymmetryCards(
  impactData: ImpactData[],
  symmetryData: SymmetryData[],
): SymmetryCardData[] {
  const symmetryImpacts = impactData.filter((r) => r.category === "Symmetry");
  return symmetryImpacts.map((row) => {
    const impactName = row.measurement_name?.toLowerCase() ?? "";
    const match = symmetryData.find((s) =>
      s["Measurement Name"]?.toLowerCase().includes(impactName),
    );
    return {
      label: `${getMuscle(row.muscle_group ?? "")} Symmetry`,
      leftRaw: match ? `${match["Left Raw"]} lbs` : "—",
      rightRaw: match ? `${match["Right Raw"]} lbs` : "—",
      impact: row,
    };
  });
}

// ── Balance section ────────────────────────────────────────────────
// Driven by balanceData rows (one card per row), NOT by impact rows.

interface BalanceCardData {
  label: string;
  muscle1Name: string;
  muscle1Pct: string;
  muscle2Name: string;
  muscle2Pct: string;
  impact: ImpactData | null;
}

function buildBalanceCards(
  impactData: ImpactData[],
  balanceData: BalanceData[],
): BalanceCardData[] {
  return balanceData.map((row) => {
    const side = row.left_right === "left" ? "Left" : row.left_right === "right" ? "Right" : "";
    const m1 = getMuscle(row.muscle1);
    const m2 = getMuscle(row.muscle2);

    const matchedImpact = findImpact(
      impactData,
      row.measurement_name ?? "",
      row.muscle_group,
    );

    return {
      label: `${side} ${m1} : ${m2}`,
      muscle1Name: m1,
      muscle1Pct: `${Math.round((row.norm_percent1 ?? 0) * 100)}%`,
      muscle2Name: m2,
      muscle2Pct: `${Math.round((row.norm_percent2 ?? 0) * 100)}%`,
      impact: matchedImpact,
    };
  });
}

// ── Shared subcard for impact/risks text ───────────────────────────

function ImpactBlock({ data }: { data: ImpactData | null }) {
  if (!data) return null;
  return (
    <div className="mt-1 space-y-2 text-sm border-l-2 border-primary/30 pl-3">
      {data.impact && (
        <p className="text-foreground/90">
          <span className="font-semibold">By training this:</span> {data.impact}
        </p>
      )}
      {data.risks && (
        <p className="text-muted-foreground">
          <span className="font-medium">Why it's important:</span> {data.risks}
        </p>
      )}
    </div>
  );
}

function ScorePills({ items }: { items: { label: string; value: string }[] }) {
  return (
    <div className="flex items-center gap-3 text-sm">
      {items.map((item) => (
        <span
          key={item.label}
          className="inline-flex items-center gap-1.5 rounded-md bg-muted px-2.5 py-1 font-medium"
        >
          {item.label}
          <span className="text-foreground">{item.value}</span>
        </span>
      ))}
    </div>
  );
}

// ── Main dialog ────────────────────────────────────────────────────

export function FocusAreasDetailDialog({
  open,
  onOpenChange,
  impactData,
  strengthData,
  symmetryData,
  balanceData,
}: FocusAreasDetailDialogProps) {
  const strengthCards = buildStrengthCards(impactData, strengthData);
  const symmetryCards = buildSymmetryCards(impactData, symmetryData);
  const balanceCards = buildBalanceCards(impactData, balanceData);

  const sections: {
    category: string;
    cards: JSX.Element[];
  }[] = [];

  if (strengthCards.length > 0) {
    sections.push({
      category: "Strength",
      cards: strengthCards.map((c, i) => (
        <div key={`str-${i}`} className="p-4 rounded-lg border bg-background/60 flex flex-col gap-3">
          <Badge variant="outline" className={BADGE_CLASS}>Strength</Badge>
          <div className="space-y-2">
            <p className="text-base font-semibold">{c.label}</p>
            <ScorePills items={[
              { label: "Left", value: c.leftPct },
              { label: "Right", value: c.rightPct },
            ]} />
            <ImpactBlock data={c.impact} />
          </div>
        </div>
      )),
    });
  }

  if (symmetryCards.length > 0) {
    sections.push({
      category: "Symmetry",
      cards: symmetryCards.map((c, i) => (
        <div key={`sym-${i}`} className="p-4 rounded-lg border bg-background/60 flex flex-col gap-3">
          <Badge variant="outline" className={BADGE_CLASS}>Symmetry</Badge>
          <div className="space-y-2">
            <p className="text-base font-semibold">{c.label}</p>
            <ScorePills items={[
              { label: "Left", value: c.leftRaw },
              { label: "Right", value: c.rightRaw },
            ]} />
            <ImpactBlock data={c.impact} />
          </div>
        </div>
      )),
    });
  }

  if (balanceCards.length > 0) {
    sections.push({
      category: "Balance",
      cards: balanceCards.map((c, i) => (
        <div key={`bal-${i}`} className="p-4 rounded-lg border bg-background/60 flex flex-col gap-3">
          <Badge variant="outline" className={BADGE_CLASS}>Balance</Badge>
          <div className="space-y-2">
            <p className="text-base font-semibold">{c.label}</p>
            <ScorePills items={[
              { label: c.muscle1Name, value: c.muscle1Pct },
              { label: c.muscle2Name, value: c.muscle2Pct },
            ]} />
            <ImpactBlock data={c.impact} />
          </div>
        </div>
      )),
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle>Focus Area Breakdown</DialogTitle>
          <DialogDescription>
            How each muscle group affects your performance and injury risk.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[70vh] overflow-y-auto px-6 pb-6 space-y-6">
          {sections.map((section) => (
            <section key={section.category} className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground tracking-wide uppercase">
                {section.category}
              </h3>
              <div className="space-y-3">{section.cards}</div>
            </section>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
