---

### Phase 0: Project Setup & Foundation (1-2 Weeks)

This phase is about setting up the development environment, initializing the project, and configuring all the third-party services.

- **1. Version Control & Project Scaffolding**
    
    - [x] Initialize a Git repository and push to GitHub/GitLab.
        
    - [x] Set up the Next.js 14 project using `create-next-app` with TypeScript and Tailwind CSS.
        
    - [x] Install and configure core dependencies: `drizzle-orm`, `drizzle-kit`, `zod`, `@tannstack/react-query`, etc.
        
    - [x] Structure the project directories (`/app`, `/components`, `/lib`, `/db`, etc.).
        
- **2. Service Account Configuration**
    
    - [x] Create accounts for all services: Vercel, Neon, Clerk, Upstash (Redis & QStash), Cloudinary, Resend, Ably, Sentry.
        
    - [x] Set up a new project within each service dashboard.
        
    - [x] Gather all API keys, secrets, and connection strings. Add to .env
        
- **3. Environment & Configuration**
    
    - [x] Create `.env.local` and `.env.example` files to manage all service credentials.
        
    - [x] Configure Vercel project environment variables for preview and production deployments.
        
    - [x] Set up `tailwind.config.ts` with base styles, fonts, and theme colors.
        
- **4. Database & ORM Setup**
    
    - [x] Connect the Next.js project to the Neon PostgreSQL database.
        
    - [x] Define initial database schemas using Drizzle ORM (`schema.ts`) for `users`, `bobbleheads`, and `collections`.
        
    - [x] Configure `drizzle-kit` for database migrations.
        
    - [x] Run the initial migration to create the tables in Neon.
        
- **5. Authentication & UI Foundation**
    
    - [x] Integrate Clerk for user authentication (sign-up, sign-in, sign-out).
        
    - [x] Wrap the root layout in Clerk’s `<ClerkProvider>`.
        
    - [x] Create middleware (`middleware.ts`) to protect routes and manage public/private access.
        
    - [x] Install and configure `shadcn/ui` by running the CLI initializer.
        
    - [x] Build a basic application layout (`/app/layout.tsx`) with a persistent header and footer.
        

---

### Phase 1: Core Collection Management (MVP) (3-4 Weeks)

This phase focuses on the primary user journey: signing up, creating a collection, and managing individual bobbleheads.

- **1. User Profile & Dashboard**
  - [ ] Create a dynamic route for user profiles (`/users/[userId]`).
  - [ ] Fetch and display user information from Clerk on their profile page.
  - [ ] Create a placeholder dashboard page for authenticated users.
- **2. Bobblehead CRUD Operations (Create, Read, Update, Delete)**
  - [ ] **Create:**
    - [ ] Build a "Add New Bobblehead" form using `TanStack Form` and `shadcn/ui` components (Input, Textarea, Select).
    - [ ] Implement client-side validation with `Zod`.
    - [ ] Create a type-safe Server Action using `zsa` to handle form submission and database insertion.
  - [ ] **Read:**
    - [ ] Create a dynamic page (`/bobbleheads/[bobbleheadId]`) to display detailed information for a single bobblehead.
    - [ ] Display a user's collection of bobbleheads on their profile page in a grid or list format.
  - [ ] **Update:**
    - [ ] Create an "Edit Bobblehead" page/modal, pre-populating the form with existing data.
    - [ ] Write a Server Action to handle the update logic in the database.
  - [ ] **Delete:**
    - [ ] Add a "Delete" button to the bobblehead details page.
    - [ ] Implement a confirmation modal (`AlertDialog` from shadcn/ui) before deletion.
    - [ ] Write a Server Action to handle the deletion.
- **3. Image Upload & Management**
  - [ ] Integrate the Cloudinary SDK.
  - [ ] Create a Server Action to generate a signed upload signature for secure, direct-to-Cloudinary uploads.
  - [ ] Build a client-side image upload component within the "Add/Edit Bobblehead" form.
  - [ ] On successful upload, store the public Cloudinary URL in the Neon database.
  - [ ] Use the Next.js `<Image>` component with the Cloudinary loader for optimized image delivery.
- **4. Collection Display & Data Tables**
  - [ ] Implement `TanStack Table` on a dedicated "My Collection" page to display a user's items.
  - [ ] Configure the table with sortable columns (e.g., Name, Series, Date Acquired).
  - [ ] Add basic client-side filtering (e.g., a search input).
  - [ ] Implement pagination for large collections.

---

### Phase 2: Community & Real-time Features (2-3 Weeks)

With the core functionality in place, this phase adds features for community interaction.

- **1. Public Profiles & Collection Showcasing**
  - [ ] Make user profiles publicly viewable.
  - [ ] Ensure only the owner can see "Edit" or "Delete" controls.
  - [ ] Create a main "Explore" or "Showcase" page to feature interesting collections or recent additions from the community.
- **2. Commenting System**
  - [ ] Add a `comments` table to the Drizzle schema and run a new migration.
  - [ ] Build a comment form and display thread on each bobblehead's detail page.
  - [ ] Create Server Actions for posting and deleting comments (with ownership/permission checks).
- **3. Real-time Notifications**
  - [ ] **Ably Integration:**
    - [ ] Set up the Ably client in the Next.js application.
    - [ ] Create a server-side token authentication endpoint for clients.
    - [ ] When a comment is posted, have the Server Action publish a message to an Ably channel (e.g., `bobblehead-comments:[bobbleheadId]`).
    - [ ] On the client, subscribe to the channel and append new comments to the UI in real-time without a page refresh.
  - [ ] **Email Notifications (Resend + QStash):**
    - [ ] Design email templates using `React Email` (e.g., "New comment on your bobblehead").
    - [ ] When a comment is posted, have the Server Action push a job to an Upstash QStash queue with relevant details (commenterId, ownerId, bobbleheadId).
    - [ ] Create an API route (`/api/webhooks/qstash`) to consume jobs from the queue.
    - [ ] The webhook handler will fetch necessary data and use `Resend` to send the email notification.

---

### Phase 3: Polish, Performance & Pre-Launch (2 Weeks)

This phase focuses on refining the user experience, optimizing performance, and preparing for a public launch.

- **1. Advanced Search & Filtering**
  - [ ] Implement `nuqs` for type-safe URL search parameters on the main collection browsing page.
  - [ ] Build a filtering UI (e.g., side panel) to filter collections by various criteria (series, character, year, etc.).
  - [ ] Ensure the page state is reflected in the URL for shareability.
- **2. Responsive Design & Accessibility**
  - [ ] Thoroughly test and refine the UI for all screen sizes (mobile, tablet, desktop).
  - [ ] Perform an accessibility (a11y) audit: check for keyboard navigation, screen reader support, color contrast, and semantic HTML.
- **3. Caching & Optimization**
  - [ ] Implement server-side caching strategies using Next.js route segment configs (revalidation).
  - [ ] Utilize `Upstash Redis` for caching expensive or frequently accessed database queries.
  - [ ] Fine-tune `TanStack Query` caching behavior on the client to optimize data fetching.
- **4. Analytics, SEO & Error Tracking**
  - [ ] Integrate `Vercel Analytics` for privacy-focused traffic insights.
  - [ ] Integrate `Sentry` for error tracking across both client and server components.
  - [ ] Implement dynamic metadata generation for SEO on profile and bobblehead pages (`generateMetadata` function).
  - [ ] Create `sitemap.xml` and `robots.txt` files.

---

### Phase 4: Launch & Post-Launch (Ongoing)

- **1. Pre-Launch Checklist**
  - [ ] Double-check all production environment variables in Vercel.
  - [ ] Set up custom domain and configure DNS settings.
  - [ ] Perform a final round of end-to-end testing.
  - [ ] Set up billing alerts for all third-party services.
- **2. Deployment & Monitoring**
  - [ ] Merge the final `main` branch and trigger a production deployment on Vercel.
  - [ ] Monitor Sentry for any post-launch errors.
  - [ ] Watch Vercel dashboards for application health and analytics.
- **3. Maintenance**
  - [ ] Establish a process for gathering user feedback and bug reports.
  - [ ] Regularly update dependencies.
  - [ ] Plan the roadmap for future features.

---

### Phase 5: Future Enhancements (Post-MVP)

- **1. Payment Processing (Stripe)**
  - [ ] Plan premium features (e.g., unlimited uploads, advanced collection stats).
  - [ ] Integrate `Stripe Checkout` for subscriptions.
  - [ ] Create webhooks to handle subscription status updates and sync with your user database.
- **2. Admin Dashboard**
  - [ ] Build a secure internal dashboard for managing users, moderating content, and viewing site-wide analytics.
