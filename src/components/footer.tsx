import Link from "next/link"
import { FileText, Twitter, Github, Linkedin } from "lucide-react"

export function Footer() {
    return (
        <footer className="border-t bg-background">
            <div className="container mx-auto px-4 py-16">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 max-w-6xl mx-auto">
                    {/* Brand */}
                    <div className="space-y-4 text-center md:text-left">
                        <Link className="flex items-center justify-center md:justify-start space-x-2" href="/">
                            <FileText className="h-6 w-6 text-primary" />
                            <span className="font-bold text-gradient">Resume.AI</span>
                        </Link>
                        <p className="text-sm text-muted-foreground mx-auto md:mx-0 max-w-xs">
                            Empowering professionals with AI-driven resume building and career insights for better job opportunities.
                        </p>
                        <div className="flex justify-center md:justify-start space-x-4">
                            <Link
                                href="#"
                                className="text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <Twitter className="h-5 w-5" />
                            </Link>
                            <Link
                                href="#"
                                className="text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <Github className="h-5 w-5" />
                            </Link>
                            <Link
                                href="#"
                                className="text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <Linkedin className="h-5 w-5" />
                            </Link>
                        </div>
                    </div>

                    {/* Product */}
                    <div className="space-y-4 text-center md:text-left">
                        <h3 className="font-semibold">Product</h3>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link
                                    href="/builder"
                                    className="text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    Resume Builder
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/quiz"
                                    className="text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    Resume Quiz
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/templates"
                                    className="text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    Templates
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/analytics"
                                    className="text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    Analytics
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Resources */}
                    <div className="space-y-4 text-center md:text-left">
                        <h3 className="font-semibold">Resources</h3>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link
                                    href="/blog"
                                    className="text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    Career Blog
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/guides"
                                    className="text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    Resume Guides
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/examples"
                                    className="text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    Examples
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/help"
                                    className="text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    Help Center
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Company */}
                    <div className="space-y-4 text-center md:text-left">
                        <h3 className="font-semibold">Company</h3>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link
                                    href="/about"
                                    className="text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    About Us
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/careers"
                                    className="text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    Careers
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/contact"
                                    className="text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    Contact
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/privacy"
                                    className="text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    Privacy Policy
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t mt-16 pt-8 flex flex-col sm:flex-row justify-center items-center gap-4 text-center">
                    <p className="text-sm text-muted-foreground">
                        2024 Resume.AI. All rights reserved.
                    </p>
                    <p className="text-sm text-muted-foreground">
                        Built with for your career success
                    </p>
                </div>
            </div>
        </footer>
    )
}