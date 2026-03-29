import { describe, it, expect } from 'vitest'
import type { User, Booking, Center, Match, Ranking, Payment, BookingParticipant, BookingConsumable, Settings } from './database'

describe('Database Types', () => {
  describe('User type', () => {
    it('should have correct structure for user', () => {
      const user: User = {
        id: 'test-id',
        username: 'testuser',
        phone_number: '0901234567',
        password_hash: 'hashedpassword',
        avatar_url: 'https://example.com/avatar.png',
        gender: 'male',
        role: 'user',
        created_at: '2024-01-01T00:00:00Z',
      }
      expect(user.username).toBe('testuser')
      expect(user.role).toBe('user')
      expect(user.gender).toBe('male')
    })

    it('should allow nullable fields', () => {
      const user: User = {
        id: 'test-id',
        username: 'testuser',
        phone_number: null,
        password_hash: 'hashedpassword',
        avatar_url: null,
        gender: null,
        role: 'user',
        created_at: '2024-01-01T00:00:00Z',
      }
      expect(user.phone_number).toBeNull()
      expect(user.avatar_url).toBeNull()
      expect(user.gender).toBeNull()
    })

    it('should allow admin role', () => {
      const admin: User = {
        id: 'admin-id',
        username: 'admin',
        phone_number: null,
        password_hash: 'hashedpassword',
        avatar_url: null,
        gender: null,
        role: 'admin',
        created_at: '2024-01-01T00:00:00Z',
      }
      expect(admin.role).toBe('admin')
    })
  })

  describe('Booking type', () => {
    it('should have correct structure', () => {
      const booking: Booking = {
        id: 'booking-id',
        center_id: 'center-id',
        match_date: '2024-01-15',
        start_time: '18:00',
        end_time: '20:00',
        courts_count: 2,
        court_price: 200000,
        status: 'pending_registration',
        created_by: 'user-id',
        created_at: '2024-01-01T00:00:00Z',
      }
      expect(booking.status).toBe('pending_registration')
      expect(booking.courts_count).toBe(2)
    })

    it('should allow all status values', () => {
      const statuses: Booking['status'][] = [
        'pending_registration',
        'confirmed',
        'pending_payment',
        'completed',
        'cancelled',
      ]
      expect(statuses).toHaveLength(5)
    })
  })

  describe('Center type', () => {
    it('should have correct structure', () => {
      const center: Center = {
        id: 'center-id',
        name: 'Sân cầu ABC',
        address: '123 Đường XYZ',
        latitude: 10.762622,
        longitude: 106.660172,
        created_at: '2024-01-01T00:00:00Z',
      }
      expect(center.name).toBe('Sân cầu ABC')
      expect(center.latitude).toBe(10.762622)
    })
  })

  describe('Match type', () => {
    it('should support singles match (1v1)', () => {
      const match: Match = {
        id: 'match-id',
        booking_id: 'booking-id',
        match_type: '1v1',
        team1_player1: 'player1-id',
        team1_player2: null,
        team2_player1: 'player2-id',
        team2_player2: null,
        team1_score: 21,
        team2_score: 15,
        winner_team: 1,
        played_at: '2024-01-15T20:00:00Z',
      }
      expect(match.match_type).toBe('1v1')
      expect(match.team1_player2).toBeNull()
    })

    it('should support doubles match (2v2)', () => {
      const match: Match = {
        id: 'match-id',
        booking_id: 'booking-id',
        match_type: '2v2',
        team1_player1: 'player1-id',
        team1_player2: 'player2-id',
        team2_player1: 'player3-id',
        team2_player2: 'player4-id',
        team1_score: 21,
        team2_score: 18,
        winner_team: 1,
        played_at: '2024-01-15T20:00:00Z',
      }
      expect(match.match_type).toBe('2v2')
      expect(match.team1_player2).not.toBeNull()
    })
  })

  describe('Ranking type', () => {
    it('should have correct structure', () => {
      const ranking: Ranking = {
        id: 'ranking-id',
        user_id: 'user-id',
        singles_rating: 1200,
        doubles_rating: 1150,
        singles_wins: 10,
        singles_losses: 5,
        doubles_wins: 8,
        doubles_losses: 4,
        updated_at: '2024-01-15T00:00:00Z',
      }
      expect(ranking.singles_rating).toBe(1200)
      expect(ranking.doubles_rating).toBe(1150)
    })
  })

  describe('Payment type', () => {
    it('should have correct structure', () => {
      const payment: Payment = {
        id: 'payment-id',
        booking_id: 'booking-id',
        user_id: 'user-id',
        amount: 50000,
        paid: false,
        paid_at: null,
        created_at: '2024-01-15T00:00:00Z',
      }
      expect(payment.paid).toBe(false)
      expect(payment.paid_at).toBeNull()
    })

    it('should support paid status', () => {
      const payment: Payment = {
        id: 'payment-id',
        booking_id: 'booking-id',
        user_id: 'user-id',
        amount: 50000,
        paid: true,
        paid_at: '2024-01-15T10:00:00Z',
        created_at: '2024-01-15T00:00:00Z',
      }
      expect(payment.paid).toBe(true)
      expect(payment.paid_at).not.toBeNull()
    })
  })

  describe('BookingParticipant type', () => {
    it('should support all status values', () => {
      const statuses: BookingParticipant['status'][] = ['pending', 'joined', 'declined']
      expect(statuses).toHaveLength(3)
    })
  })

  describe('BookingConsumable type', () => {
    it('should support all item types', () => {
      const itemTypes: BookingConsumable['item_type'][] = ['shuttlecock', 'drink']
      expect(itemTypes).toHaveLength(2)
    })
  })

  describe('Settings type', () => {
    it('should have correct structure', () => {
      const settings: Settings = {
        id: 1,
        female_discount_percent: 10,
        female_discount_enabled: true,
        updated_at: '2024-01-01T00:00:00Z',
      }
      expect(settings.female_discount_percent).toBe(10)
      expect(settings.female_discount_enabled).toBe(true)
    })
  })
})
