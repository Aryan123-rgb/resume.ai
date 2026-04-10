import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Edit,
  Calendar,
  User,
  Briefcase,
  GraduationCap,
} from "lucide-react";
import { Project } from "@/generated/prisma";
import Link from "next/link";

interface UserProjectProps {
  userProjects: Project[];
}

export default function UserResumes({ userProjects }: UserProjectProps) {
  return (
    <section>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold mb-2">Your Resumes</h2>
          <p className="text-muted-foreground">
            Continue working on your existing resumes or create a new one
          </p>
        </div>
      </div>

      {userProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {userProjects.map((project) => (
            <Card
              key={project.id}
              className="group transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-2 border-border/50 dark:border-border/30 hover:border-primary/30 dark:hover:border-primary/40"
            >
              <CardHeader className="p-0">
                <div className="relative overflow-hidden rounded-t-lg bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 h-48 flex items-center justify-center">
                  {/* Resume Preview Mockup */}
                  <div className="w-32 h-40 bg-white dark:bg-gray-100 rounded shadow-lg flex flex-col p-2 text-xs">
                    <div className="flex items-center gap-1 mb-2">
                      <User className="h-3 w-3 text-gray-400" />
                      <div className="h-1 bg-gray-300 rounded flex-1"></div>
                    </div>
                    <div className="space-y-1 mb-2">
                      <div className="h-1 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-1 bg-gray-200 rounded w-1/2"></div>
                    </div>
                    <div className="flex items-center gap-1 mb-1">
                      <Briefcase className="h-2 w-2 text-gray-400" />
                      <div className="h-1 bg-gray-300 rounded flex-1"></div>
                    </div>
                    <div className="space-y-1 mb-2">
                      <div className="h-1 bg-gray-200 rounded"></div>
                      <div className="h-1 bg-gray-200 rounded w-4/5"></div>
                    </div>
                    <div className="flex items-center gap-1 mb-1">
                      <GraduationCap className="h-2 w-2 text-gray-400" />
                      <div className="h-1 bg-gray-300 rounded flex-1"></div>
                    </div>
                    <div className="space-y-1">
                      <div className="h-1 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-1 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-6">
                <div className="mb-3">
                  <CardTitle className="text-lg mb-1">{project.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Description: {project.description}
                  </p>
                </div>

                <div className="flex items-center text-xs text-muted-foreground mb-4">
                  <Calendar className="h-3 w-3 mr-1" />
                  Last modified:{" "}
                  {new Date(project.updatedAt).toLocaleDateString()}
                </div>

                <div className="flex gap-2">
                  <Button asChild size="sm" className="flex-1">
                    <Link href={`/resume-editor/${project.id}`}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="text-center py-12">
          <CardContent>
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <CardTitle className="mb-2">No resumes yet</CardTitle>
            <CardDescription className="mb-4">
              Start by selecting a template above
            </CardDescription>
          </CardContent>
        </Card>
      )}
    </section>
  );
}
