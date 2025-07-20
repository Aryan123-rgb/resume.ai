"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import { Eye } from "lucide-react";
import Image from "next/image";

interface ResumePreviewProps {
  templateId?: string;
}

export function ResumePreview({ templateId }: ResumePreviewProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        size="sm"
        className="bg-white text-black hover:bg-gray-100"
        onClick={() => setIsOpen(true)}
      >
        <Eye className="h-4 w-4 mr-2" />
        Preview
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Resume Preview</DialogTitle>
            <DialogDescription>
              Preview of the selected resume template
              {templateId && `: ${templateId}`}
            </DialogDescription>
          </DialogHeader>
          <Image
            src={`/${templateId}.jpg`}
            alt={`Resume template ${templateId} preview`}
            width={800}
            height={1000}
            className="w-full h-auto max-w-2xl mx-auto rounded-lg shadow-lg"
            sizes="(max-width: 640px) 90vw, (max-width: 1024px) 70vw, 50vw"
            priority
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
