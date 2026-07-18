"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Heart,
  Plus,
  X,
  Check,
  BookOpen,
  ExternalLink,
  Lightbulb,
  ShieldCheck,
  AlertTriangle,
  Thermometer,
  Zap,
  Wind,
  ChevronRight,
  AlertCircle,
  Brain,
  ScanEye,
  NotebookPen,
  Eye,
  Venus,
  Pill,
  Apple,
  Stethoscope,
} from "lucide-react";
import type { JournalCondition } from "@/lib/journal-data";
import { useEnaj } from "@/lib/enaj-context";




const CATEGORY_ICONS: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  digestive: Apple,
  "womens-health": Venus,
  "skin-eye": ScanEye,
  "pain-discomfort": Zap,
  allergies: Wind,
  recovery: Stethoscope,
  general: Thermometer,
};

export function HealthJournal() {
  const { profile, journalCategories, addJournalEntry, removeJournalEntry } =
    useEnaj();
  const selectedConditions = new Set(profile?.journalEntries ?? []);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [pendingConditions, setPendingConditions] = useState<string[]>([]);
  const [learnDialogOpen, setLearnDialogOpen] = useState(false);
  const [selectedLearnCondition, setSelectedLearnCondition] =
    useState<JournalCondition | null>(null);
  const [pendingRemove, setPendingRemove] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const allConditions = journalCategories.flatMap((c) => c.conditions);
  const activeConditions = allConditions.filter((c) =>
    selectedConditions.has(c.id),
  );

  const getCategoryIcon = (categoryId: string) =>
    CATEGORY_ICONS[categoryId] || Thermometer;

  const getConditionCategory = (conditionId: string) =>
    journalCategories.find((category) =>
      category.conditions.some((condition) => condition.id === conditionId),
    );

  const getConditionIcon = (conditionId: string) => {
    const category = getConditionCategory(conditionId);
    return category ? getCategoryIcon(category.id) : Thermometer;
  };

  const openLearnDialog = (condition: JournalCondition) => {
    setSelectedLearnCondition(condition);
    setLearnDialogOpen(true);
  };

  const confirmRemove = () => {
    if (pendingRemove) {
      removeJournalEntry(pendingRemove.id);
      setPendingRemove(null);
    }
  };

  const totalMonitoredIngredients = activeConditions.reduce(
    (sum, c) => sum + c.whatWeMonitor.length,
    0,
  );

  const SelectedLearnIcon = selectedLearnCondition
    ? getConditionIcon(selectedLearnCondition.id)
    : Thermometer;

  return (
    <div className="flex flex-col gap-6">
      {/* Remove Confirmation Dialog */}
      <AlertDialog
        open={!!pendingRemove}
        onOpenChange={(open) => {
          if (!open) setPendingRemove(null);
        }}
      >
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-card-foreground">
              Remove from journal?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Are you sure you want to remove{" "}
              <span className="font-semibold text-foreground">
                {pendingRemove?.name}
              </span>{" "}
              from your health journal? We will stop monitoring related
              ingredients.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border text-foreground hover:bg-accent">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmRemove}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Yes, Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Learn Dialog */}
      <Dialog open={learnDialogOpen} onOpenChange={setLearnDialogOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto bg-card border-border max-w-2xl">
          {selectedLearnCondition && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10">
                    <SelectedLearnIcon className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <DialogTitle className="text-card-foreground text-xl">
                      {selectedLearnCondition.name}
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                      {selectedLearnCondition.category}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="flex flex-col gap-6 pt-4">
                {/* Description */}
                <div>
                  <p className="text-sm text-foreground leading-relaxed">
                    {selectedLearnCondition.description}
                  </p>
                </div>

                {/* What We Monitor */}
                <div className="rounded-xl border border-primary/20 bg-primary/5 p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <ShieldCheck className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold text-foreground">
                      What enaJ Monitors For You
                    </h3>
                  </div>
                  <div className="flex flex-col gap-4">
                    {selectedLearnCondition.whatWeMonitor.map((item, index) => (
                      <div
                        key={index}
                        className="rounded-lg bg-card p-4 border border-border"
                      >
                        <p className="font-medium text-foreground mb-2">
                          {item.ingredient}
                        </p>
                        <p className="text-sm text-muted-foreground mb-3">
                          {item.reason}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {item.sources.map((source, sIdx) => (
                            <a
                              key={sIdx}
                              href={source.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs text-primary hover:bg-primary/20 transition-colors"
                            >
                              {source.title}
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Fun Facts */}
                <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Lightbulb className="h-5 w-5 text-amber-600" />
                    <h3 className="font-semibold text-foreground">
                      Did You Know?
                    </h3>
                  </div>
                  <ul className="flex flex-col gap-2">
                    {selectedLearnCondition.funFacts.map((fact, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-2 text-sm text-foreground"
                      >
                        <span className="text-amber-600 mt-1">•</span>
                        {fact}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Tips */}
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Heart className="h-5 w-5 text-emerald-600" />
                    <h3 className="font-semibold text-foreground">
                      Recovery Tips
                    </h3>
                  </div>
                  <ul className="flex flex-col gap-2">
                    {selectedLearnCondition.tips.map((tip, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-2 text-sm text-foreground"
                      >
                        <Check className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Sources */}
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">
                    General Sources
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selectedLearnCondition.generalSources.map(
                      (source, index) => (
                        <a
                          key={index}
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                        >
                          {source.title}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      ),
                    )}
                  </div>
                </div>

                {/* Add to Journal Button */}
                <div className="flex justify-end pt-2">
                  <Button
                    onClick={() => {
                      if (!selectedConditions.has(selectedLearnCondition.id)) {
                        addJournalEntry(selectedLearnCondition.id);
                      }
                      setLearnDialogOpen(false);
                    }}
                    className={`gap-2 ${
                      selectedConditions.has(selectedLearnCondition.id)
                        ? "bg-emerald-600 hover:bg-emerald-700"
                        : "bg-amber-500 hover:bg-amber-600"
                    } text-white`}
                  >
                    {selectedConditions.has(selectedLearnCondition.id) ? (
                      <>
                        <Check className="h-4 w-4" />
                        Added to Journal
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4" />
                        Add to My Journal
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Condition Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="max-h-[80vh] overflow-y-auto bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-card-foreground">
              Add to Health Journal
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Select temporary conditions you{"'"}re currently dealing with.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 pt-2">
            {journalCategories.map((category) => {
              const IconComponent = getCategoryIcon(category.id);
              return (
                <div key={category.id}>
                  <div className="flex items-center gap-2 mb-2">
                    <IconComponent className="h-4 w-4 text-amber-600" />
                    <p className="text-sm font-semibold text-muted-foreground">
                      {category.label}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {category.conditions.map((condition) => {
                      const alreadyAdded = selectedConditions.has(condition.id);
                      const isPending = pendingConditions.includes(
                        condition.id,
                      );
                      return (
                        <button
                          key={condition.id}
                          disabled={alreadyAdded}
                          onClick={() => {
                            if (isPending) {
                              setPendingConditions((prev) =>
                                prev.filter((id) => id !== condition.id),
                              );
                            } else {
                              setPendingConditions((prev) => [
                                ...prev,
                                condition.id,
                              ]);
                            }
                          }}
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition-colors ${
                            alreadyAdded
                              ? "bg-amber-500/10 text-amber-600 cursor-default"
                              : isPending
                                ? "bg-amber-500 text-white"
                                : "border border-border bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                          }`}
                        >
                          {(alreadyAdded || isPending) && (
                            <Check className="h-3 w-3" />
                          )}
                          {condition.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
          {pendingConditions.length > 0 && (
            <div className="mt-4 flex justify-end">
              <Button
                onClick={() => {
                  for (const id of pendingConditions) {
                    if (!selectedConditions.has(id)) {
                      addJournalEntry(id);
                    }
                  }
                  setPendingConditions([]);
                  setAddDialogOpen(false);
                }}
                className="bg-amber-500 hover:bg-amber-600 text-white gap-2"
              >
                <Check className="h-4 w-4" />
                Add Selected ({pendingConditions.length})
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground md:text-3xl">
          Weekly Health Journal
        </h1>
        <p className="mt-1 text-muted-foreground">
          Track temporary conditions and let enaJ help you shop smarter while
          you recover.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="flex gap-4 flex-wrap">
        <div className="flex items-center gap-2 rounded-lg bg-amber-500/10 px-4 py-2">
          <NotebookPen className="h-4 w-4 text-amber-700" />
          <span className="text-sm font-medium text-amber-700">
            {activeConditions.length} active
          </span>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-primary/10 px-4 py-2">
          <Eye className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-primary">
            {totalMonitoredIngredients} ingredients monitored
          </span>
        </div>
      </div>

      {/* Active Conditions */}
      <div className="rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-lg font-semibold text-card-foreground flex items-center gap-2">
            <NotebookPen className="h-5 w-5 text-amber-600" />
            Your Current Journal Entries
          </h2>
          <Button
            size="sm"
            onClick={() => setAddDialogOpen(true)}
            className="bg-amber-500 hover:bg-amber-600 text-white gap-1"
          >
            <Plus className="h-4 w-4" />
            Add Entry
          </Button>
        </div>

        <div className="p-5">
          {activeConditions.length === 0 ? (
            <div className="flex flex-col items-center py-8 text-center">
              <AlertTriangle className="mb-3 h-10 w-10 text-muted-foreground" />
              <p className="text-lg font-medium text-card-foreground">
                No entries yet
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Add a temporary condition to start monitoring relevant
                ingredients.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {activeConditions.map((condition) => {
                const ConditionIcon = getConditionIcon(condition.id);

                return (
                  <div
                    key={condition.id}
                    className="rounded-lg border border-border bg-muted/30 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-amber-500/10">
                          <ConditionIcon className="h-4 w-4 text-amber-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-card-foreground">
                            {condition.name}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {condition.whatWeMonitor.length} items monitored
                          </p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {condition.whatWeMonitor
                              .slice(0, 4)
                              .map((item, index) => (
                                <span
                                  key={index}
                                  className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-1 text-xs text-primary"
                                >
                                  {item.ingredient}
                                </span>
                              ))}
                            {condition.whatWeMonitor.length > 4 && (
                              <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
                                +{condition.whatWeMonitor.length - 4} more
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openLearnDialog(condition)}
                          className="text-muted-foreground hover:text-primary gap-1"
                        >
                          <BookOpen className="h-4 w-4" />
                          <span className="hidden sm:inline">Learn</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            setPendingRemove({
                              id: condition.id,
                              name: condition.name,
                            })
                          }
                          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Browse All Conditions */}
      <div className="rounded-xl border border-border bg-card">
        <div className="border-b border-border px-5 py-4">
          <h2 className="text-lg font-semibold text-card-foreground flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Browse All Conditions
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Learn about different conditions and add them to your journal
          </p>
        </div>

        <div className="p-5">
          <div className="flex flex-col gap-3">
            {journalCategories.map((category) => {
              const IconComponent = getCategoryIcon(category.id);
              const isExpanded = expandedCategory === category.id;
              return (
                <div
                  key={category.id}
                  className="rounded-lg border border-border overflow-hidden"
                >
                  <button
                    onClick={() =>
                      setExpandedCategory(isExpanded ? null : category.id)
                    }
                    className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <IconComponent className="h-5 w-5 text-amber-600" />
                      <span className="font-medium text-foreground">
                        {category.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {category.conditions.length} conditions
                      </span>
                      <ChevronRight
                        className={`h-4 w-4 text-muted-foreground transition-transform ${isExpanded ? "rotate-90" : ""}`}
                      />
                    </div>
                  </button>
                  {isExpanded && (
                    <div className="border-t border-border px-4 py-3 bg-muted/30">
                      <div className="grid gap-2 sm:grid-cols-2">
                        {category.conditions.map((condition) => {
                          const isAdded = selectedConditions.has(condition.id);
                          const ConditionIcon = getCategoryIcon(category.id);

                          return (
                            <div
                              key={condition.id}
                              className={`rounded-lg border p-3 transition-colors ${
                                isAdded
                                  ? "border-amber-500/30 bg-amber-500/5"
                                  : "border-border bg-card"
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex items-start gap-2 flex-1">
                                  <ConditionIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600" />
                                  <div className="flex-1">
                                    <p className="font-medium text-foreground text-sm">
                                      {condition.name}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                      {condition.description.substring(0, 100)}
                                      ...
                                    </p>
                                  </div>
                                </div>
                              </div>
                              <div className="mt-3 flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openLearnDialog(condition)}
                                  className="flex-1 text-xs gap-1"
                                >
                                  <BookOpen className="h-3 w-3" />
                                  Learn
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() =>
                                    isAdded
                                      ? removeJournalEntry(condition.id)
                                      : addJournalEntry(condition.id)
                                  }
                                  className={`flex-1 text-xs gap-1 ${
                                    isAdded
                                      ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                                      : "bg-amber-500 hover:bg-amber-600 text-white"
                                  }`}
                                >
                                  {isAdded ? (
                                    <>
                                      <Check className="h-3 w-3" />
                                      Added
                                    </>
                                  ) : (
                                    <>
                                      <Plus className="h-3 w-3" />
                                      Add
                                    </>
                                  )}
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="rounded-xl border border-muted bg-muted/30 p-5">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-foreground">
              A Quick Reminder
            </p>
            <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
              Your health journal entries are temporary and meant to help you
              shop smarter while dealing with short-term conditions. enaJ is not
              a substitute for medical advice. If you{"'"}re experiencing
              symptoms, please consult with a healthcare provider.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}