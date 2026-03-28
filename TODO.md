# Badminton Management System - TODO List

## Project Setup
- [ ] Initialize Next.js project with TypeScript
- [ ] Set up Supabase project and configure connection
- [ ] Configure Vercel deployment
- [ ] Set up environment variables (Supabase URL, keys, etc.)
- [ ] Set up authentication library (e.g., NextAuth.js or Supabase Auth)

## Database Schema Design
- [ ] Design and create `admins` table
- [ ] Design and create `users` table
- [ ] Design and create `centers` table (name, position/coordinates)
- [ ] Design and create `bookings` table
- [ ] Design and create `booking_participants` table (for voting/joining)
- [ ] Design and create `shuttlecocks` table
- [ ] Design and create `drinks` table
- [ ] Design and create `payments` table
- [ ] Design and create `matches` table (for 1v1 and 2v2)
- [ ] Design and create `rankings` table

## Admin Features
### Authentication
- [ ] Create default admin account (seed data)
- [ ] Admin login page
- [ ] Admin password change functionality
- [ ] Admin session management

### Admin Management
- [ ] Admin list view
- [ ] Add new admin form
- [ ] Create password for new admins
- [ ] Delete admin (optional)

### User Management (by Admin)
- [ ] User list view for admin
- [ ] Add new user form
- [ ] Create password for new users
- [ ] Edit user details
- [ ] Delete user (optional)

## User Features
- [ ] User login page
- [ ] User dashboard
- [ ] Change password functionality
- [ ] Upload/change avatar
- [ ] User profile page

## Badminton Center Management
- [ ] Center list view (admin)
- [ ] Add new center form (name, position)
- [ ] Edit center details
- [ ] Delete center
- [ ] Display center location on map (nice to have - integrate Google Maps or similar)

## Booking System
- [ ] Booking list view (admin)
- [ ] Create new match booking form
- [ ] User voting/join interface for bookings
- [ ] Update booking info (number of courts, pricing)
- [ ] Booking detail view
- [ ] Booking status management (upcoming, completed, cancelled)

## Shuttlecock & Drink Tracking
- [ ] Add shuttlecock usage to booking
- [ ] Add drink usage to booking
- [ ] Edit shuttlecock/drink quantities
- [ ] View consumption history per booking

## Payment System
- [ ] Auto-calculate total cost per booking (court + shuttlecock + drinks)
- [ ] Split cost among joined participants
- [ ] Payment status tracking (paid/unpaid)
- [ ] User mark as paid functionality
- [ ] Admin payment overview dashboard
- [ ] Send payment reminders (optional)

## Match & Ranking System
- [ ] Match upload interface (support 1v1 and 2v2)
- [ ] Match result input form
- [ ] Calculate and update player rankings
- [ ] Ranking leaderboard view
- [ ] Match history view for users
- [ ] Filter and search match history
- [ ] Match detail view

## UI/UX
- [ ] Responsive design (mobile-friendly)
- [ ] Navigation menu/sidebar
- [ ] Loading states
- [ ] Error handling and display
- [ ] Success notifications

## Deployment
- [ ] Configure Vercel project settings
- [ ] Set up production environment variables
- [ ] Deploy to Vercel
- [ ] Test production deployment

## Optional Enhancements
- [ ] Email notifications for bookings/payments
- [ ] Dark mode support
- [ ] Export data to CSV/PDF
