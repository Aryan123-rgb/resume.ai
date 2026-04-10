"use client";

import { startTransition, useState } from "react";
import { Loader2, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { createNewProject } from "@/action";
import { Button } from "../../../components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../../components/ui/dialog";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { cn } from "@/lib/utils";

interface CreateNewProjectButtonProps {
  resumeType: string;
}

export default function CreateNewProjectButton({
  resumeType,
}: CreateNewProjectButtonProps) {
  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();

  const handleCreateNewProject = async () => {
    if (!projectName.trim() || !description.trim()) {
      return;
    }

    setErrorMessage(null);
    setIsLoading(true);

    try {
      const projectId = await createNewProject({
        templateName: resumeType,
        name: projectName.trim(),
        description: description.trim(),
      });

      startTransition(() => {
        router.push(`/resume-editor/${projectId}`);
      });
    } catch (error: any) {
      console.error(error);
      setErrorMessage(error?.message || "Failed to create project");
    } finally {
      setIsLoading(false);
    }
  };

  const isSubmitting = isLoading;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="w-full" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Use This Template
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[450px] p-6">
        <DialogHeader className="space-y-2">
          <DialogTitle className="text-2xl font-bold text-foreground">
            Create New Project
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Start building your resume by giving it a name and description.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label
              htmlFor="projectName"
              className="text-sm font-medium text-muted-foreground"
            >
              Project Name
            </Label>
            <Input
              id="projectName"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
              placeholder="My Awesome Project"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="description"
              className="text-sm font-medium text-muted-foreground"
            >
              Description
            </Label>
            <Input
              id="description"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
              placeholder="A brief description of your project"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <DialogClose asChild>
              <Button variant="outline" className="px-4">
                Cancel
              </Button>
            </DialogClose>
            <Button
              disabled={isSubmitting}
              onClick={handleCreateNewProject}
              className={cn(
                "px-6",
                isSubmitting && "opacity-50 cursor-not-allowed",
              )}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Project"
              )}
            </Button>
          {errorMessage ? (
            <div className="text-sm text-destructive pt-2">
              {errorMessage}
            </div>
          ) : null}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
