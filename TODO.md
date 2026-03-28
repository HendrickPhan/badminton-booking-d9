# Badminton Management System - TODO List

## Project Setup
- [x] Initialize Next.js project with TypeScript
- [x] Set up Supabase project and configure connection
- [x] Configure Vercel deployment
- [x] Set up environment variables (Supabase URL, keys, etc.)
- [x] Set up authentication library (Supabase Auth)

## Database Schema Design
- [x] Design and create `profiles` table
- [x] Design and create `centers` table (name, position/coordinates)
- [x] Design and create `bookings` table
- [x] Design and create `booking_participants` table (for voting/joining)
- [x] Design and create `booking_consumables` table (shuttlecocks, drinks)
- [x] Design and create `payments` table
- [x] Design and create `matches` table (for 1v1 and 2v2)
- [x] Design and create `rankings` table

## Admin Features
### Authentication
- [x] Create default admin account (seed data - via Supabase)
- [x] Admin login page
- [x] Admin password change functionality
- [x] Admin session management

### Admin Management
- [x] Admin list view
- [x] Add new admin form
- [x] Create password for new admins
- [ ] Delete admin (optional)

### User Management (by Admin)
- [x] User list view for admin
- [x] Add new user form
- [x] Create password for new users
- [ ] Edit user details
- [x] Delete user

## User Features
- [x] User login page
- [x] User dashboard
- [x] Change password functionality
- [x] Upload/change avatar
- [x] User profile page

## Badminton Center Management
- [x] Center list view (admin)
- [x] Add new center form (name, position)
- [x] Edit center details
- [x] Delete center
- [x] Display center location on map (link to Google Maps)

## Booking System
- [x] Booking list view (admin)
- [x] Create new match booking form
- [x] User voting/join interface for bookings
- [x] Update booking info (number of courts, pricing)
- [x] Booking detail view
- [ ] Booking status management (upcoming, completed, cancelled)

## Shuttlecock & Drink Tracking
- [x] Add shuttlecock usage to booking
- [x] Add drink usage to booking
- [ ] Edit shuttlecock/drink quantities
- [x] View consumption history per booking

## Payment System
- [x] Auto-calculate total cost per booking (court + shuttlecock + drinks)
- [x] Split cost among joined participants
- [x] Payment status tracking (paid/unpaid)
- [x] User mark as paid functionality
- [x] Admin payment overview dashboard
- [ ] Send payment reminders (optional)

## Match & Ranking System
- [x] Match upload interface (support 1v1 and 2v2)
- [x] Match result input form
- [ ] Calculate and update player rankings (ELO)
- [x] Ranking leaderboard view
- [x] Match history view for users
- [ ] Filter and search match history
- [x] Match detail view

## UI/UX
- [x] Responsive design (mobile-friendly)
- [x] Navigation menu/sidebar
- [x] Loading states
- [x] Error handling and display
- [x] Success notifications (toast)

## Deployment
- [ ] Configure Vercel project settings
- [ ] Set up production environment variables
- [ ] Deploy to Vercel
- [ ] Test production deployment

## Optional Enhancements
- [ ] Email notifications for bookings/payments
- [ ] Dark mode support
- [ ] Export data to CSV/PDF
- [ ] Mobile app (PWA)

---

## Next Steps

1. **Set up Supabase project:**
   - Create a new project at https://supabase.com
   - Run the SQL schema from `supabase/schema.sql` in the SQL Editor
   - Copy the project URL and keys to `.env.local`

2. **Create default admin:**
   - Sign up through the app or create user in Supabase Auth
   - Update the user's role to 'admin' in the profiles table

3. **Deploy to Vercel:**
   - Push code to GitHub
   - Import project to Vercel
   - Add environment variables
   - Deploy
