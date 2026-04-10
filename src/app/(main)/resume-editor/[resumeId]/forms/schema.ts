import { z } from "zod";

export const basicDetailsSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  github: z.string().url("Invalid URL").optional().or(z.literal("")),
  linkedin: z.string().url("Invalid URL").optional().or(z.literal("")),
  contact: z.string().optional(),
  codeforces: z.string().url("Invalid URL").optional().or(z.literal("")),
  codechef: z.string().url("Invalid URL").optional().or(z.literal("")),
  geeksforgeeks: z.string().url("Invalid URL").optional().or(z.literal("")),
  leetcode: z.string().url("Invalid URL").optional().or(z.literal("")),
});

export const educationSchema = z.object({
  institute: z.string().min(1, "Institute name is required"),
  branch: z.string().min(1, "Branch/Field is required"),
  startDate: z.string().min(1, "Start Date is required"),
  endDate: z.string().min(1, "End Date is required"),
});

export const experienceSchema = z.object({
  company: z.string().min(1, "Company Name is required"),
  role: z.string().min(1, "Role is required"),
  startDate: z.string().min(1, "Start Date is required"),
  endDate: z.string().min(1, "End Date is required"),
  description: z.string(),
});

export const projectSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  role: z.string().optional(), // Adding role just to match experience layout roughly
  startDate: z.string().min(1, "Start Date is required"),
  endDate: z.string().min(1, "End Date is required"),
  liveLink: z.string().url("Invalid URL").optional().or(z.literal("")),
  githubLink: z.string().url("Invalid URL").optional().or(z.literal("")),
  description: z.string(),
});

export const skillSchema = z.object({
  heading: z.string().min(1, "Skill heading is required (e.g., Languages)"),
  skills: z.string().min(1, "List your skills here"),
});

export const achievementsSchema = z.object({
  achievements: z.string(), 
});

export const resumeSchema = z.object({
  basics: basicDetailsSchema,
  education: z.array(educationSchema),
  experience: z.array(experienceSchema),
  projects: z.array(projectSchema),
  skills: z.array(skillSchema),
  achievements: achievementsSchema,
});

export const defaultValues: z.infer<typeof resumeSchema> = {
  basics: {
    name: "John Harvard",
    email: "john.harvard@gmail.com",
    contact: "+1 617 495 0000",
    linkedin: "https://linkedin.com/in/john-harvard",
    github: "https://github.com/john-harvard",
    codeforces: "https://codeforces.com/profile/john-harvard",
    codechef: "https://www.codechef.com/users/johnharvard",
    geeksforgeeks: "https://auth.geeksforgeeks.org/user/johnharvard",
    leetcode: "https://leetcode.com/john-harvard",
  },
  education: [
    {
      institute: "Harvard University",
      branch: "Master of Science in Computer Science",
      startDate: "2022-09",
      endDate: "2024-05",
    },
    {
      institute: "Harvard University",
      branch: "Bachelor of Science in Computer Science; GPA: 3.97/4.00",
      startDate: "2018-09",
      endDate: "2022-05",
    },
  ],
  experience: [
    {
      company: "Google",
      role: "Senior Software Engineer",
      startDate: "2024-07",
      endDate: "2025-04",
      description:
        "- Designed and shipped a latency-reduction pipeline for Google Search serving 8B+ daily queries, cutting p99 by 18%\n- Led a team of 5 engineers to migrate a core indexing service from monolith to microservices on GKE\n- Authored internal RFC adopted org-wide for standardizing gRPC error handling across 40+ services",
    },
    {
      company: "Microsoft",
      role: "Software Engineer II",
      startDate: "2022-07",
      endDate: "2024-06",
      description:
        "- Built real-time collaboration features for VS Code Live Share used by 3M+ developers monthly\n- Reduced CI pipeline time by 42% by parallelising test suites and caching build artifacts in Azure Pipelines\n- Mentored 3 new-grad engineers through onboarding and first production deployments",
    },
    {
      company: "Meta",
      role: "Software Engineering Intern",
      startDate: "2021-05",
      endDate: "2021-08",
      description:
        "- Delivered an A/B testing framework for News Feed ranking signals, running experiments across 200M+ users\n- Integrated GraphQL subscriptions into the Messenger web client, reducing polling overhead by 60%\n- Shipped intern project to production 2 weeks ahead of schedule with full test coverage",
    },
  ],
  projects: [
    {
      name: "Google Summer of Code — TensorFlow",
      role: "Open Source Contributor",
      startDate: "2021-05",
      endDate: "2021-08",
      liveLink: "https://summerofcode.withgoogle.com",
      githubLink: "https://github.com/john-harvard/gsoc-tensorflow",
      description:
        "- Implemented a custom Keras layer for sparse attention in transformer models, improving training speed by 23%\n- Wrote comprehensive documentation and unit tests merged into the official TensorFlow repository\n- Presented work at the TensorFlow community call attended by 500+ developers",
    },
    {
      name: "Meta Llama Fine-Tuning Toolkit",
      role: "Lead Developer",
      startDate: "2023-09",
      endDate: "2024-01",
      liveLink: "https://llama-toolkit.vercel.app",
      githubLink: "https://github.com/john-harvard/llama-finetune",
      description:
        "- Built an open-source CLI and web dashboard for fine-tuning Llama 2/3 models on custom datasets with LoRA/QLoRA\n- Supports one-click export to GGUF and ONNX formats; 1.2K GitHub stars within first month\n- Integrated W&B for experiment tracking and automated hyperparameter sweep reporting",
    },
    {
      name: "Chromium DevTools Extension — PerfLens",
      role: "Solo Developer",
      startDate: "2023-03",
      endDate: "2023-06",
      liveLink: "https://chromewebstore.google.com/detail/perflens",
      githubLink: "https://github.com/john-harvard/perflens",
      description:
        "- Built a Chrome DevTools panel that overlays Core Web Vitals (LCP, CLS, INP) live on any webpage using the PerformanceObserver API\n- Visualises long tasks on the main thread timeline and suggests actionable fixes inline\n- Published on Chrome Web Store with 4.8-star rating and 8K+ active users",
    },
  ],
  skills: [
    {
      heading: "Languages",
      skills: "C++, Python, TypeScript, JavaScript, Go, Rust, SQL",
    },
    {
      heading: "Frameworks & Libraries",
      skills: "React.js, Next.js, Node.js, gRPC, GraphQL, TensorFlow, PyTorch, LangChain",
    },
    {
      heading: "Infrastructure & Tools",
      skills: "Google Kubernetes Engine, Azure Pipelines, Docker, PostgreSQL, Redis, Kafka, Git, Vercel",
    },
  ],
  achievements: {
    achievements:
      "- Google CodeJam 2023: Advanced to Round 3, Global Rank 184 out of 45,000 participants\n- Meta Hacker Cup 2023: Global Rank 312 in Round 2\n- LeetCode Knight (2,241 contest rating), Global Rank 58 (AIR 5) in LeetCode Biweekly 112\n- Codeforces Master (rated 2,103), Global Rank 139 in Codeforces Round 891 (Div 1)\n- Harvard CS Research Prize 2022: Best Undergraduate Thesis in Systems\n- Google Summer of Code 2021: Selected among 1,300 accepted contributors worldwide (4% acceptance rate)",
  },
};
