import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Upload, Brain, FileText, Download, Target, BarChart3 } from "lucide-react"

const resumeSteps = [
    {
        icon: Upload,
        title: "Upload Your Info",
        description: "Simply paste your job description or upload your existing resume to get started.",
        color: "text-blue-500"
    },
    {
        icon: Brain,
        title: "AI Analysis",
        description: "Our AI analyzes your information and job requirements to create the perfect match.",
        color: "text-green-500"
    },
    {
        icon: FileText,
        title: "Generate Resume",
        description: "Get a professionally formatted resume optimized for ATS systems and recruiters.",
        color: "text-purple-500"
    },
    {
        icon: Download,
        title: "Download & Apply",
        description: "Download your resume in multiple formats and start applying to your dream jobs.",
        color: "text-orange-500"
    }
]

const quizSteps = [
    {
        icon: Upload,
        title: "Upload Resume",
        description: "Upload your current resume in PDF or Word format for comprehensive analysis.",
        color: "text-blue-500"
    },
    {
        icon: Target,
        title: "Take Quiz",
        description: "Answer targeted MCQ questions about resume best practices and industry standards.",
        color: "text-red-500"
    },
    {
        icon: BarChart3,
        title: "Get Insights",
        description: "Receive detailed feedback on your resume's strengths and areas for improvement.",
        color: "text-indigo-500"
    }
]

export function HowItWorksSection() {
    return (
        <section id="how-it-works" className="py-20 sm:py-32 bg-secondary/30">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center space-y-4 mb-16">
                    <Badge variant="outline" className="px-3 py-1">
                        How It Works
                    </Badge>
                    <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                        Simple steps to{" "}
                        <span className="text-gradient">career success</span>
                    </h2>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Whether you're building a new resume or improving an existing one, our process is designed to be simple and effective.
                    </p>
                </div>

                {/* Resume Builder Process */}
                <div className="mb-20">
                    <div className="text-center mb-12">
                        <h3 className="text-2xl font-bold mb-4">AI Resume Builder</h3>
                        <p className="text-muted-foreground">Create your perfect resume in 4 simple steps</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
                        {resumeSteps.map((step, index) => (
                            <div key={index} className="relative">
                                <Card 
                                    className="relative group transition-all duration-300 h-full
                                    border-2 border-border/50 dark:border-border/30
                                    shadow-lg hover:shadow-xl dark:shadow-gray-900/20 dark:hover:shadow-gray-900/40
                                    bg-card/80 backdrop-blur-sm
                                    hover:border-primary/30 dark:hover:border-primary/40
                                    hover:-translate-y-1 text-center"
                                >
                                    <CardHeader className="pb-4">
                                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full 
                                            bg-primary/10 dark:bg-primary/20 border border-border/20">
                                            <step.icon className={`h-8 w-8 ${step.color}`} />
                                        </div>
                                        <CardTitle className="text-lg">{step.title}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <CardDescription className="text-sm leading-relaxed">
                                            {step.description}
                                        </CardDescription>
                                    </CardContent>
                                </Card>

                                {/* Connector line */}
                                {index < resumeSteps.length - 1 && (
                                    <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-px bg-gradient-to-r from-primary/30 to-transparent" />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Quiz Process */}
                <div>
                    <div className="text-center mb-12">
                        <h3 className="text-2xl font-bold mb-4">Resume Quiz</h3>
                        <p className="text-muted-foreground">Analyze and improve your existing resume</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        {quizSteps.map((step, index) => (
                            <div key={index} className="relative">
                                <Card 
                                    className="relative group transition-all duration-300 h-full
                                    border-2 border-border/50 dark:border-border/30
                                    shadow-lg hover:shadow-xl dark:shadow-gray-900/20 dark:hover:shadow-gray-900/40
                                    bg-card/80 backdrop-blur-sm
                                    hover:border-primary/30 dark:hover:border-primary/40
                                    hover:-translate-y-1 text-center"
                                >
                                    <CardHeader className="pb-4">
                                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full 
                                            bg-primary/10 dark:bg-primary/20 border border-border/20">
                                            <step.icon className={`h-8 w-8 ${step.color}`} />
                                        </div>
                                        <CardTitle className="text-lg">{step.title}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <CardDescription className="text-sm leading-relaxed">
                                            {step.description}
                                        </CardDescription>
                                    </CardContent>
                                </Card>

                                {/* Connector line */}
                                {index < quizSteps.length - 1 && (
                                    <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-px bg-gradient-to-r from-primary/30 to-transparent" />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}