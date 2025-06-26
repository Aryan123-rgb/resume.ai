# Next.js 15 Starter with Prisma, Clerk & shadcn/ui

A modern Next.js 15 starter template featuring:

- 🚀 Next.js 15 with App Router
- 🔐 Authentication with Clerk
- 💾 Database with Prisma ORM (PostgreSQL)
- 🎨 Styling with Tailwind CSS and shadcn/ui
- 🌓 Dark/Light mode with next-themes
- 🛡️ Protected routes with middleware

## 🚀 Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/nextjs15-prisma-clerk-startercode.git
   cd nextjs15-prisma-clerk-startercode
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn
   # or
   pnpm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory and add the following:

   ```env
   # Database
   DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/yourdbname"

   # Clerk
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_publishable_key
   CLERK_SECRET_KEY=your_secret_key
   
   # Optional: Custom auth paths
   NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
   NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
   ```

4. **Set up the database**
   ```bash
   npx prisma db push
   ```

5. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

   Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📁 Project Structure

```
.
├── prisma/
│   └── schema.prisma     # Database schema
├── src/
│   ├── app/
│   │   ├── (auth)/       # Authentication pages
│   │   ├── (main)/       # Protected routes
│   │   │   └── dashboard # Dashboard page (protected)
│   │   ├── layout.tsx    # Root layout
│   │   └── page.tsx      # Home page
│   ├── components/       # Reusable components
│   ├── lib/              # Utility functions
│   └── middleware.ts     # Authentication middleware
└── public/               # Static files
```

## 🔧 Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/)
- **Authentication**: [Clerk](https://clerk.com/)
- **Database**: [PostgreSQL](https://www.postgresql.org/) + [Prisma](https://www.prisma.io/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)
- **Theming**: [next-themes](https://github.com/pacocoursey/next-themes)
- **TypeScript**: For type safety

## 🌓 Dark Mode

This template includes a theme toggle that persists the user's theme preference. The theme can be toggled using the sun/moon icon in the top-right corner.

## 🔒 Authentication

Protected routes are handled by the middleware, which checks for an active session before allowing access to protected routes. The protected routes are placed in the `(main)` directory.

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- [Next.js Documentation](https://nextjs.org/docs)
- [Clerk Documentation](https://clerk.com/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com/docs)
