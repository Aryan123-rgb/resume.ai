import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, FileText, Brain, Eye } from "lucide-react"
import Link from "next/link"

export function HeroSection() {
  return (
    <section className="relative w-full overflow-hidden bg-background py-16 sm:py-24 md:py-32 border-b">
      {/* Background decorative elements */}
      <div className="absolute inset-0">
        <div className="absolute -top-32 -right-32 h-64 w-64 sm:h-80 sm:w-80 rounded-full bg-card/50 blur-3xl"></div>
        <div className="absolute -bottom-32 -left-32 h-64 w-64 sm:h-80 sm:w-80 rounded-full bg-card/70 blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto flex flex-col items-center text-center space-y-6 sm:space-y-8">
          {/* Badge */}
          <Badge
            variant="secondary"
            className="px-3 py-1 sm:px-4 sm:py-1.5 text-xs sm:text-sm bg-muted text-foreground"
          >
            <Brain className="mr-1.5 h-2.5 w-2.5 sm:h-3 sm:w-3" />
            Powered by Advanced AI
          </Badge>

          {/* Main heading */}
          <div className="space-y-3 sm:space-y-4">
            <h1 className="text-3xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Create <span className="text-foreground">Professional Resumes</span> with AI
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto px-2 sm:px-0">
              Build stunning, ATS-friendly resumes in minutes with our AI-powered builder. Choose from professional
              templates and let AI optimize your content to land your dream job.
            </p>
          </div>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto px-4 sm:px-0">
            <Button size="lg" className="text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 w-full sm:w-auto" asChild>
              <Link href="/dashboard">
                Start Building <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 w-full sm:w-auto bg-transparent"
              asChild
            >
              <Link href="/dashboard">
                View Templates <Eye className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
              </Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-8 pt-6 sm:pt-8 text-sm text-muted-foreground w-full max-w-2xl">
            <div className="flex items-center justify-center gap-2 bg-card px-4 py-3 rounded-lg border">
              <div className="h-2.5 w-2.5 rounded-full bg-foreground"></div>
              <span>50,000+ Resumes</span>
            </div>
            <div className="flex items-center justify-center gap-2 bg-card px-4 py-3 rounded-lg border">
              <div className="h-2.5 w-2.5 rounded-full bg-foreground"></div>
              <span>95% Success Rate</span>
            </div>
            <div className="flex items-center justify-center gap-2 bg-card px-4 py-3 rounded-lg border">
              <div className="h-2.5 w-2.5 rounded-full bg-foreground"></div>
              <span>AI-Powered</span>
            </div>
          </div>
        </div>
      </div>

      {/* Floating elements */}
      <div className="hidden sm:block absolute top-10 sm:top-20 left-4 sm:left-10 animate-float">
        <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground/40" />
      </div>
      <div
        className="hidden sm:block absolute bottom-10 sm:bottom-20 right-4 sm:right-10 animate-float"
        style={{ animationDelay: "1s" }}
      >
        <Brain className="h-7 w-7 sm:h-10 sm:w-10 text-muted-foreground/40" />
      </div>
    </section>
  )
}
