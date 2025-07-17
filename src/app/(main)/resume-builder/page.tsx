import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Eye, User, Briefcase, GraduationCap } from "lucide-react";
import UserResumes from "@/components/UserResumes";
import { UserResume } from "@/lib/types";
import CreateNewProjectButton from "@/components/CreateNewProjectButton";

const resumeTemplates = [
  {
    id: 1,
    name: "Modern Professional",
    description:
      "Clean and contemporary design perfect for tech and business roles",
    category: "Professional",
    color: "blue",
    preview: "/api/placeholder/300/400",
    features: ["ATS Optimized", "Modern Layout", "Skills Section"],
  },
  {
    id: 2,
    name: "Creative Designer",
    description:
      "Eye-catching design ideal for creative professionals and designers",
    category: "Creative",
    color: "purple",
    preview: "/api/placeholder/300/400",
    features: ["Visual Appeal", "Portfolio Section", "Color Accents"],
  },
  {
    id: 3,
    name: "Executive Classic",
    description: "Traditional and elegant format for senior-level positions",
    category: "Executive",
    color: "gray",
    preview: "/api/placeholder/300/400",
    features: ["Professional", "Leadership Focus", "Achievement Highlights"],
  },
  {
    id: 4,
    name: "Minimalist Clean",
    description:
      "Simple and clean design that focuses on content over decoration",
    category: "Minimalist",
    color: "green",
    preview: "/api/placeholder/300/400",
    features: ["Clean Layout", "Easy to Read", "Space Efficient"],
  },
  {
    id: 5,
    name: "Tech Specialist",
    description:
      "Designed specifically for software developers and IT professionals",
    category: "Technology",
    color: "indigo",
    preview: "/api/placeholder/300/400",
    features: ["Skills Matrix", "Project Showcase", "GitHub Integration"],
  },
  {
    id: 6,
    name: "Academic Scholar",
    description:
      "Perfect for researchers, professors, and academic professionals",
    category: "Academic",
    color: "amber",
    preview: "/api/placeholder/300/400",
    features: ["Publications", "Research Focus", "Academic Format"],
  },
];

const userResumes: UserResume[] = [
  {
    id: "1",
    name: "Software Engineer Resume",
    template: "Tech Specialist",
    lastModified: "2024-01-15",
    status: "Complete",
    preview: "/api/placeholder/300/400",
  },
  {
    id: "2",
    name: "Marketing Manager CV",
    template: "Modern Professional",
    lastModified: "2024-01-12",
    status: "Draft",
    preview: "/api/placeholder/300/400",
  },
  {
    id: "3",
    name: "UX Designer Portfolio",
    template: "Creative Designer",
    lastModified: "2024-01-10",
    status: "Complete",
    preview: "/api/placeholder/300/400",
  },
];

const categoryColors = {
  Professional:
    "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  Creative:
    "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  Executive: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300",
  Minimalist:
    "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  Technology:
    "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300",
  Academic:
    "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
};

export default async function ResumeBuilder() {
  return (
    <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Pre-defined Templates Section */}
      <section className="mb-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold mb-2">Choose a Template</h2>
            <p className="text-muted-foreground">
              Select from our collection of professionally designed resume
              templates
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resumeTemplates.map((template) => (
            <Card
              key={template.id}
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

                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <Button
                      size="sm"
                      className="bg-white text-black hover:bg-gray-100"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Preview
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <CardTitle className="text-lg mb-1">
                      {template.name}
                    </CardTitle>
                    <Badge
                      variant="secondary"
                      className={`text-xs ${
                        categoryColors[
                          template.category as keyof typeof categoryColors
                        ]
                      }`}
                    >
                      {template.category}
                    </Badge>
                  </div>
                </div>

                <CardDescription className="text-sm mb-4 leading-relaxed">
                  {template.description}
                </CardDescription>

                <div className="flex flex-wrap gap-1 mb-4">
                  {template.features.map((feature, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                </div>

                <CreateNewProjectButton />
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* User Created Resumes Section */}
      <UserResumes userResumes={userResumes} />
    </main>
  );
}
