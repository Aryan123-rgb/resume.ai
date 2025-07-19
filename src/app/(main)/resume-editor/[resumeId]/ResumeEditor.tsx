"use client";

import { useEffect, useState, useTransition } from "react";
import { Eye, FileText, Send, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Chat, Resume } from "@/generated/prisma";
import { useToast } from "@/lib/useToast";
import { Skeleton } from "@/components/ui/skeleton";
import { generateLatexCode } from "@/app/action";
import { useRouter } from "next/navigation";

export type FullResume = Resume & {
  chat: Chat[];
};

export default function ResumeEditor(resume: FullResume) {
  const [messages, setMessages] = useState<Chat[]>(resume.chat);
  const [pdfUrl, setPdfUrl] = useState("");
  const [query, setQuery] = useState("");
  const [compilingPDF, setCompilingPDF] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [latexCode, setLatexCode] = useState(resume.latex_code);
  const { showError, showInfo } = useToast();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleSend = async () => {
    setIsSending(true);
    if (!query.trim()) {
      showInfo("Please Enter a valid input");
      return;
    }
    const res = await generateLatexCode(query, resume.id, latexCode);
    if (res.success && res?.data) {
      setLatexCode(res.data);

      startTransition(() => {
        router.refresh();
      });

      await handleCompile(res.data);
    } else {
      showError("Error generating AI response. Please try again");
    }
    setQuery("");
    setIsSending(false);
  };

  const handleCompile = async (latexCodeToCompile?: string) => {
    setCompilingPDF(true);

    const codeToCompile = latexCodeToCompile || latexCode;

    try {
      const res = await axios.post(
        `/api/compile-resume`,
        { latex_code: codeToCompile },
        { responseType: "blob" }
      );

      const contentType = res.headers["content-type"];
      if (contentType !== "application/pdf") {
        throw new Error("Invalid content type");
      }

      if (res.data.size === 0) {
        throw new Error("Empty PDF blob");
      }

      const arrayBuffer = await res.data.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);

      const pdfHeader = String.fromCharCode(...uint8Array.slice(0, 4));

      if (pdfHeader !== "%PDF") {
        // The response might be an error JSON instead of PDF
        const text = new TextDecoder().decode(uint8Array);
        console.error("Non-PDF response:", text);
        throw new Error("Invalid PDF received");
      }

      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      setPdfUrl(url);
    } catch (err: any) {
      console.error("Error during PDF compilation:", err);
      showError("Compilation Error");
    } finally {
      setCompilingPDF(false);
    }
  };

  useEffect(() => {
    handleCompile();
  }, []);

  return (
    <main className="flex h-[calc(100vh-4rem)]">
      {/* Left Side - Resume Chat */}
      <div className="w-1/2 h-full border-r border-gray-200 dark:border-gray-700">
        <div className="flex flex-col h-full">
          {/* Messages container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
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
                    {message.createdAt.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Input area */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center space-x-2">
              <Input value={query} onChange={(e) => setQuery(e.target.value)} />
              <Button
                onClick={handleSend}
                disabled={!query.trim()}
                className="p-2 rounded-full bg-blue-500 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                {isSending ? (
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
                disabled={compilingPDF}
                onClick={() => handleCompile()}
                className="gap-2"
              >
                {compilingPDF ? (
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
                {compilingPDF ? (
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
