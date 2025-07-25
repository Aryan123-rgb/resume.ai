"use client";

import { useEffect, useState } from "react";
import { Eye, FileText, Send, Loader2 } from "lucide-react";
import { cn, prepareLatexCode } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useToast } from "@/lib/useToast";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  useGenerateAndCompile,
  useManualCompile,
  useResumeWithPdf,
} from "./use-resume";

export default function ResumeEditor({ resumeId }: { resumeId: string }) {
  const { resume, isLoadingResume, pdfUrl, pdfError, isCompilingPdf } =
    useResumeWithPdf(resumeId);
  const { mutate: compilePdf, isPending, isError } = useManualCompile();
  const { mutate: generateLatexCode, isPending: isGenerating } =
    useGenerateAndCompile(resumeId);

  const [query, setQuery] = useState("");
  const { showError } = useToast();

  if (pdfError) {
    showError("Compilation Error");
  }

  const handleCompile = async () => {
    try {
      compilePdf(resume?.latex_code);
    } catch (e) {
      showError("Compilation Error");
    }
  };

  const handleSend = async () => {
    try {
      generateLatexCode({
        queryText: query,
        latexCode: resume?.latex_code,
      });
      setQuery("");
    } catch (e) {
      showError("Something went wrong");
    }
  };

  return (
    <main className="flex h-[calc(100vh-4rem)]">
      {/* Left Side - Resume Chat */}
      <div className="w-1/2 h-full border-r border-gray-200 dark:border-gray-700">
        <div className="flex flex-col h-full">
          {/* Messages container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {resume?.chat &&
              resume.chat.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex",
                    message.role === "Human" ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[80%] rounded-lg px-4 py-2",
                      message.role === "Human"
                        ? "bg-blue-500 text-white rounded-br-none"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-bl-none"
                    )}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {/* {message.createdAt.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })} */}
                    </p>
                  </div>
                </div>
              ))}
          </div>

          {/* Input area */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center space-x-2">
              <Textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                disabled={isGenerating}
              />
              <Button
                onClick={handleSend}
                disabled={!query.trim() || isPending || isGenerating}
                className={cn(
                  "p-2 rounded-full bg-blue-500 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                  (!query.trim() || isPending || isGenerating) &&
                    "cursor-not-allowed opacity-75"
                )}
              >
                {isPending || isGenerating ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Resume Preview */}
      <div className="w-1/2 h-full overflow-auto">
        <div className="w-full h-full bg-secondary/30">
          <div className="h-full flex flex-col">
            {/* Preview Header */}
            <div className="border-b border-border p-4 bg-background flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <Eye className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">Resume Preview</h2>
                  <p className="text-sm text-muted-foreground">
                    See how your resume will look
                  </p>
                </div>
              </div>
              <Button
                disabled={isCompilingPdf}
                onClick={() => handleCompile()}
                className={cn(
                  "gap-2",
                  isCompilingPdf ?? "pointer-events-none opacity-75"
                )}
              >
                {isCompilingPdf ? (
                  <>
                    <Loader2 className="animate-spin" />
                    Compiling...
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4" />
                    Compile
                  </>
                )}
              </Button>
            </div>

            {/* Preview Content */}
            <div className="flex-1 overflow-auto">
              <div className="h-full w-full p-6">
                {isCompilingPdf ? (
                  <div className="h-full flex flex-col items-center justify-center space-y-4">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    <div className="space-y-2 text-center">
                      <p className="text-lg font-medium text-foreground">
                        Compiling PDF
                      </p>
                      <p className="text-sm text-muted-foreground">
                        This may take a moment...
                      </p>
                    </div>
                    <Skeleton className="mt-4 h-4 w-48" />
                  </div>
                ) : pdfUrl.length > 1 ? (
                  <div className="h-full w-full">
                    <iframe
                      src={pdfUrl}
                      width="100%"
                      height="100%"
                      title="resume.pdf"
                      className="min-h-[calc(100vh-12rem)] w-full border-0"
                      onError={() => {
                        showError("Failed to display PDF");
                      }}
                    />
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center space-y-6 max-w-md">
                      <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-muted">
                        <FileText className="h-12 w-12 text-muted-foreground" />
                      </div>
                      <div className="space-y-3">
                        <h3 className="text-2xl font-semibold text-muted-foreground">
                          Resume Preview
                        </h3>
                        <p className="text-muted-foreground">
                          Your resume preview will appear here once you complete
                          the form
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
