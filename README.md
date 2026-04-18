# Online Property Management and Listing System (Next.js Full-Stack)

Parallel full-stack rebuild for property listing, management, inquiry, moderation, and analytics.

## Stack
- Next.js App Router (JavaScript)
- MongoDB + Mongoose
- JWT auth with HttpOnly cookies
- Mailtrap SMTP via Nodemailer

## Setup
1. Copy env file:
   - `.env.example` -> `.env.local`
2. Install:
   - `npm install`
3. Optional seed:
   - `npm run seed`
4. Run:
   - `npm run dev`

## Key Features Implemented
- Role-based auth (`user`, `owner`, `admin`)
- Public listings with pagination + infinite scroll
- Slug-based property detail pages
- Soft delete + admin restore
- View counter endpoint (`session-unique` via client guard + server increment)
- Structured multi-image model (`url`, `isPrimary`, `altText`)
- Featured listing lifecycle (`isFeatured`, `featuredTill`)
- Inquiry workflow with owner and sender emails
- Admin analytics (status counts, inquiries, top views, featured)
- Dedicated futuristic admin shell (separate navbar + footer)
- Admin modules: overview, properties moderation, inquiries, users, testimonials, reports
- Excel export for complete admin reports
- Testimonials with approval flow
- Payment simulation for featured activation
- SEO basics: metadata, sitemap, robots

## API Highlights
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `GET /api/properties`
- `GET /api/properties/:slug`
- `POST /api/properties/:slug/view`
- `POST /api/properties`
- `PUT /api/properties/manage/:id`
- `DELETE /api/properties/manage/:id`
- `GET /api/properties/my`
- `POST /api/properties/manage/:id/save`
- `DELETE /api/properties/manage/:id/save`
- `POST /api/inquiries`
- `GET /api/inquiries/my`
- `GET /api/inquiries/owner`
- `GET /api/admin/analytics`
- `GET /api/admin/properties`
- `GET /api/admin/inquiries`
- `GET /api/admin/testimonials`
- `GET /api/admin/reports/export`
- `PUT /api/admin/properties/:id/approve`
- `PUT /api/admin/properties/:id/reject`
- `PUT /api/admin/properties/:id/restore`
- `GET /api/testimonials`
- `POST /api/testimonials`
- `PUT /api/admin/testimonials/:id/approve`
- `POST /api/payments/feature/create-order`
- `POST /api/payments/feature/verify`

## Notes
- Local demo upload storage: `public/uploads`
- Build is passing (`npm run build`)
- Lint has 3 image optimization warnings (`<img>` vs `next/image`), no errors
