"use client";

import { UserButton } from "@clerk/nextjs";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { dark } from "@clerk/themes";
import { CreditCard } from "lucide-react";

export default function Dashboard() {
    const { theme, setTheme } = useTheme();

    return (
        <div className="p-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Dashboard</h1>
                <div className="flex items-center gap-4">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    >
                        {theme === 'dark' ? (
                            <Sun className="h-[1.2rem] w-[1.2rem]" />
                        ) : (
                            <Moon className="h-[1.2rem] w-[1.2rem]" />
                        )}
                        <span className="sr-only">Toggle theme</span>
                    </Button>
                    <UserButton
                        appearance={{
                            baseTheme: theme === "dark" ? dark : undefined,
                            elements: {
                                avatarBox: {
                                    width: 35,
                                    height: 35,
                                },
                            },
                        }}
                    >
                        <UserButton.MenuItems>
                            <UserButton.Link
                                label="Billing"
                                labelIcon={<CreditCard className="size-4" />}
                                href="/billing"
                            />
                        </UserButton.MenuItems>
                    </UserButton>
                </div>
            </div>
        </div>
    );
}