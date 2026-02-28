"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Link2,
  Users,
  Bot,
  Check,
  Copy,
  ArrowRight,
  DollarSign,
  Zap,
  Target,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PanelDistributionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  projectTitle: string;
}

type DistributionMethod = "url" | "vypr-panel" | "ai-panel" | null;

export function PanelDistributionDialog({
  open,
  onOpenChange,
  projectId,
  projectTitle,
}: PanelDistributionDialogProps) {
  const router = useRouter();
  const [selected, setSelected] = useState<DistributionMethod>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [published, setPublished] = useState(false);
  const [surveyUrl, setSurveyUrl] = useState("");
  const [copied, setCopied] = useState(false);

  async function handlePublish() {
    if (!selected) return;
    setIsPublishing(true);

    try {
      const res = await fetch("/api/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId }),
      });

      if (!res.ok) {
        const err = await res.json();
        console.error("Publish failed:", err.error);
        setIsPublishing(false);
        return;
      }

      const data = await res.json();
      setSurveyUrl(data.surveyUrl || `${window.location.origin}/survey/${projectId}`);
      setPublished(true);
    } catch (err) {
      console.error("Publish error:", err);
    } finally {
      setIsPublishing(false);
    }
  }

  function handleCopyUrl() {
    navigator.clipboard.writeText(surveyUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleGoToDashboard() {
    onOpenChange(false);
    router.push("/");
  }

  function handleClose() {
    if (published) {
      router.push("/");
    }
    onOpenChange(false);
    // Reset state when closing
    setSelected(null);
    setPublished(false);
    setSurveyUrl("");
    setCopied(false);
  }

  // Post-publish success view
  if (published) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-lg bg-vypr-navy border-white/10">
          <DialogHeader>
            <DialogTitle className="text-foreground flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/20">
                <Check className="h-4 w-4 text-emerald-400" />
              </div>
              Survey Published
            </DialogTitle>
            <DialogDescription>
              <span className="font-medium text-foreground">{projectTitle}</span>{" "}
              is now live and ready for responses.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-2 space-y-3">
            {selected === "url" && (
              <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] p-3">
                <code className="flex-1 truncate text-xs text-muted-foreground">
                  {surveyUrl}
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  className="shrink-0 gap-1.5 border-white/10 text-xs"
                  onClick={handleCopyUrl}
                >
                  {copied ? (
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                  {copied ? "Copied!" : "Copy URL"}
                </Button>
              </div>
            )}

            {selected === "vypr-panel" && (
              <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
                <p className="text-sm text-muted-foreground">
                  Your survey has been sent to the VYPR panel. You&apos;ll
                  receive responses from a representative national sample.
                </p>
              </div>
            )}

            {selected === "ai-panel" && (
              <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
                <p className="text-sm text-muted-foreground">
                  Your survey has been sent to the AI panel. Responses will
                  begin arriving shortly.
                </p>
              </div>
            )}
          </div>

          <div className="mt-2 flex justify-end">
            <Button
              size="sm"
              className="gap-1.5 bg-vypr-teal font-semibold text-vypr-navy hover:bg-vypr-teal/90 text-xs"
              onClick={handleGoToDashboard}
            >
              Go to Dashboard
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Distribution method selection view
  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl bg-vypr-navy border-white/10">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            Distribute Your Survey
          </DialogTitle>
          <DialogDescription>
            Choose how you&apos;d like to collect responses for{" "}
            <span className="font-medium text-foreground">{projectTitle}</span>.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2 grid grid-cols-3 gap-3">
          {/* Share URL Option */}
          <button
            onClick={() => setSelected("url")}
            className={cn(
              "group relative flex flex-col rounded-xl border p-4 text-left transition-all",
              selected === "url"
                ? "border-vypr-teal bg-vypr-teal/[0.06] ring-1 ring-vypr-teal/30"
                : "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]"
            )}
          >
            <div
              className={cn(
                "mb-3 flex h-10 w-10 items-center justify-center rounded-lg",
                selected === "url"
                  ? "bg-vypr-teal/20 text-vypr-teal"
                  : "bg-white/[0.06] text-muted-foreground group-hover:text-foreground"
              )}
            >
              <Link2 className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-semibold text-foreground">
              Share URL
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              Copy a shareable link for anyone to complete your survey publicly.
            </p>
            {selected === "url" && (
              <div className="absolute top-3 right-3 flex h-5 w-5 items-center justify-center rounded-full bg-vypr-teal">
                <Check className="h-3 w-3 text-vypr-navy" />
              </div>
            )}
          </button>

          {/* Send to VYPR Panel */}
          <button
            onClick={() => setSelected("vypr-panel")}
            className={cn(
              "group relative flex flex-col rounded-xl border p-4 text-left transition-all",
              selected === "vypr-panel"
                ? "border-vypr-teal bg-vypr-teal/[0.06] ring-1 ring-vypr-teal/30"
                : "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]"
            )}
          >
            <div
              className={cn(
                "mb-3 flex h-10 w-10 items-center justify-center rounded-lg",
                selected === "vypr-panel"
                  ? "bg-vypr-teal/20 text-vypr-teal"
                  : "bg-white/[0.06] text-muted-foreground group-hover:text-foreground"
              )}
            >
              <Users className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-semibold text-foreground">
              Send to VYPR Panel
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              Send to a representative national sample for completion.
            </p>
            {selected === "vypr-panel" && (
              <div className="absolute top-3 right-3 flex h-5 w-5 items-center justify-center rounded-full bg-vypr-teal">
                <Check className="h-3 w-3 text-vypr-navy" />
              </div>
            )}
          </button>

          {/* Send to AI Panel */}
          <button
            onClick={() => setSelected("ai-panel")}
            className={cn(
              "group relative flex flex-col rounded-xl border p-4 text-left transition-all",
              selected === "ai-panel"
                ? "border-vypr-teal bg-vypr-teal/[0.06] ring-1 ring-vypr-teal/30"
                : "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]"
            )}
          >
            <div
              className={cn(
                "mb-3 flex h-10 w-10 items-center justify-center rounded-lg",
                selected === "ai-panel"
                  ? "bg-vypr-teal/20 text-vypr-teal"
                  : "bg-white/[0.06] text-muted-foreground group-hover:text-foreground"
              )}
            >
              <Bot className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-semibold text-foreground">
              Send to AI Panel
            </h3>
            <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
              AI-powered synthetic responses.
            </p>
            <div className="mt-2.5 space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs text-vypr-teal">
                <DollarSign className="h-3 w-3 shrink-0" />
                <span>Lower costs</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-vypr-teal">
                <Zap className="h-3 w-3 shrink-0" />
                <span>Almost instant responses</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-vypr-teal">
                <Target className="h-3 w-3 shrink-0" />
                <span>99% accuracy</span>
              </div>
            </div>
            {selected === "ai-panel" && (
              <div className="absolute top-3 right-3 flex h-5 w-5 items-center justify-center rounded-full bg-vypr-teal">
                <Check className="h-3 w-3 text-vypr-navy" />
              </div>
            )}
          </button>
        </div>

        <div className="mt-2 flex justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            className="border-white/10 text-xs"
            onClick={handleClose}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            className="gap-1.5 bg-vypr-teal font-semibold text-vypr-navy hover:bg-vypr-teal/90 text-xs shadow-[0_0_12px_rgba(0,214,198,0.2)] disabled:opacity-40"
            disabled={!selected || isPublishing}
            onClick={handlePublish}
          >
            {isPublishing ? (
              <>Publishing...</>
            ) : (
              <>
                {selected === "url" && "Publish & Copy URL"}
                {selected === "vypr-panel" && "Send to VYPR Panel"}
                {selected === "ai-panel" && "Send to AI Panel"}
                {!selected && "Select a method"}
                <ArrowRight className="h-3.5 w-3.5" />
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
