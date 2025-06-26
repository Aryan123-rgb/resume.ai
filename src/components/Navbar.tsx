"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { FileText, Menu, X } from "lucide-react"
import { useState } from "react"

export function Navbar() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    return (
        <header className="sticky top-0 z-50 w-full border-b border-gray-200/80 dark:border-gray-800/80 bg-white/80 dark:bg-gray-950/80 backdrop-blur-lg">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    <Link className="flex items-center space-x-2 group" href="/">
                        <FileText className="h-6 w-6 text-blue-500 dark:text-blue-400 group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors" />
                        <span className="font-bold text-xl text-foreground/90 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            Resume.AI
                        </span>
                    </Link>

                    <div className="hidden md:flex items-center space-x-4">
                        <ThemeToggle />
                        <Button variant="ghost" size="sm" className="text-sm font-medium text-foreground/80 hover:text-blue-600 dark:text-foreground/80 dark:hover:text-blue-400" asChild>
                            <Link href="/login">Login</Link>
                        </Button>
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium" asChild>
                            <Link href="/signup">Sign Up</Link>
                        </Button>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="flex items-center space-x-2 md:hidden">
                        <ThemeToggle />
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="p-2 text-foreground/80 hover:text-foreground"
                        >
                            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                            <span className="sr-only">Toggle Menu</span>
                        </Button>
                    </div>
                </div>

                {/* Mobile Navigation */}
                {mobileMenuOpen && (
                    <div className="md:hidden border-t border-gray-200/80 dark:border-gray-800/80 bg-white/95 dark:bg-gray-950/95 backdrop-blur-lg">
                        <div className="px-4 py-6 space-y-4">
                            <nav className="flex flex-col space-y-4">
                                <Link
                                    className="text-base font-medium text-foreground/80 hover:text-blue-600 dark:text-foreground/80 dark:hover:text-blue-400 transition-colors"
                                    href="#features"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    Features
                                </Link>
                                <Link
                                    className="text-base font-medium text-foreground/80 hover:text-blue-600 dark:text-foreground/80 dark:hover:text-blue-400 transition-colors"
                                    href="#how-it-works"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    How it Works
                                </Link>
                            </nav>

                            <div className="pt-4 border-t border-gray-200/80 dark:border-gray-800/80 space-y-3">
                                <Button variant="ghost" size="sm" className="w-full justify-start text-foreground/80 hover:text-blue-600 dark:text-foreground/80 dark:hover:text-blue-400" asChild>
                                    <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                                        Login
                                    </Link>
                                </Button>
                                <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700 text-white" asChild>
                                    <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>
                                        Sign Up
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </header>
    )
}