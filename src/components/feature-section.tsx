import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Brain, Target } from "lucide-react"

const features = [
    {
        icon: Brain,
        title: "AI Resume Builder",
        description: "Build ATS optimized resume with AI enhanced contents that perfectly match job requirements and industry standards.",
        color: "text-blue-500"
    },
    {
        icon: Target,
        title: "Interactive Quiz",
        description: "Upload your resume or fill the details manually and test your strengths and weaknesses through comprehensive analysis.",
        color: "text-green-500"
    }
]

export function FeaturesSection() {
    return (
        <section id="features" className="py-20 sm:py-32">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center space-y-4 mb-16">
                    <Badge variant="outline" className="px-3 py-1">
                        Features
                    </Badge>
                    <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                        Everything you need to{" "}
                        <span className="text-gradient">succeed</span>
                    </h2>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Powerful tools and AI-driven insights to help you create the perfect resume and understand what makes it effective.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {features.map((feature, index) => (
                        <Card
                            key={index}
                            className="relative group transition-all duration-300 h-full
                         border-2 border-border/50 dark:border-border/30
                         shadow-lg hover:shadow-xl dark:shadow-gray-900/20 dark:hover:shadow-gray-900/40
                         bg-card/80 backdrop-blur-sm
                         hover:border-primary/30 dark:hover:border-primary/40
                         hover:-translate-y-1"
                        >
                            <CardHeader className="pb-6 text-center">
                                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full 
                               bg-primary/10 dark:bg-primary/20 
                               border border-primary/20 dark:border-primary/30
                               shadow-inner">
                                    <feature.icon className={`h-10 w-10 ${feature.color} drop-shadow-sm`} />
                                </div>
                                <CardTitle className="text-2xl font-bold text-foreground">
                                    {feature.title}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="text-center">
                                <CardDescription className="text-base leading-relaxed text-muted-foreground">
                                    {feature.description}
                                </CardDescription>
                            </CardContent>

                            {/* Enhanced hover effect with better visibility */}
                            <div className="absolute inset-0 rounded-lg 
                             bg-gradient-to-br from-primary/5 via-transparent to-blue-500/5 
                             dark:from-primary/10 dark:via-transparent dark:to-blue-500/10
                             opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                            {/* Subtle glow effect on hover */}
                            <div className="absolute inset-0 rounded-lg 
                             shadow-[0_0_0_1px_rgba(59,130,246,0.1)] dark:shadow-[0_0_0_1px_rgba(59,130,246,0.2)]
                             opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    )
}