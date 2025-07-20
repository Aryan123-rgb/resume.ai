import { ClerkProvider } from "@clerk/nextjs";
import { ToastContainer } from "react-toastify";
import { ThemeProvider } from "next-themes";
import { ToastProvider } from "@/components/ToastProvider";
import ReactQueryProvider from "./ReactQueryProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ClerkProvider>
        <ReactQueryProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <ToastProvider>{children}</ToastProvider>
          </ThemeProvider>
        </ReactQueryProvider>
      </ClerkProvider>
    </>
  );
}
