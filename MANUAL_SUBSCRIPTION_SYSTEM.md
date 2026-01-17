# Manual Subscription System for Enterprises

## Overview

The subscription system has been updated to remove automatic payments and implement a fully manual admin-controlled process for enterprise subscriptions.

## New Workflow

### For Enterprises:
1. **Registration**: Enterprise registers with company details
2. **Admin Validation**: Admin validates the enterprise status to 'valide'
3. **Subscription Request**: Enterprise can request subscription activation (no payment required)
4. **Admin Activation**: Admin manually activates subscription with custom end date
5. **Job Posting**: Once activated, enterprise can post job offers within quota limits

### For Admins:
1. **Manual Activation**: Set custom start/end dates for subscriptions
2. **Account Management**: Deactivate or delete enterprise accounts
3. **Full Control**: No automatic payments - everything is admin-controlled

## Key Changes Made

### 1. Enterprise Subscription Page (`/entreprise/abonnement`)
- Removed payment modal and receipt upload
- Changed "Subscribe" buttons to "Request Activation"
- Updated workflow instructions
- Simplified UI to focus on plan selection

### 2. New Admin Management Page (`/admin/abonnements-entreprises`)
- View pending subscription requests
- Manually activate subscriptions with custom dates
- Deactivate active subscriptions
- Delete enterprise accounts completely
- Comprehensive subscription management

### 3. API Endpoints Created
- `POST /api/entreprises/subscriptions/request` - Create subscription request
- `POST /api/admin/subscriptions/activate` - Manually activate subscription
- `GET /api/admin/subscriptions/active` - List active subscriptions
- `POST /api/admin/subscriptions/deactivate` - Deactivate subscription
- `POST /api/admin/subscriptions/reject` - Reject subscription request
- `DELETE /api/admin/entreprises/[id]` - Delete enterprise account

### 4. Database Updates
- Added manual management fields to `entreprise_subscriptions`
- Updated RLS policies for proper access control
- Added quota checking functions
- Created triggers for subscription validation

### 5. Updated Admin Navigation
- Added "Abonnements Entreprises" to admin sidebar
- Replaced old payment-based subscription management

## Features

### Manual Subscription Activation
- Admin sets custom start and end dates
- Optional admin notes for tracking
- Automatic deactivation of previous subscriptions
- Email notifications (can be added)

### Account Management
- **Deactivate**: Temporarily disable subscription
- **Delete**: Permanently remove enterprise and all data
- **Quota Control**: Automatic enforcement based on plan

### Security & Access Control
- Only validated enterprises can request subscriptions
- Only admins can activate/deactivate subscriptions
- RLS policies prevent unauthorized access
- Proper audit trail with admin tracking

## Subscription Plans

| Plan | Price | Job Offers | Duration |
|------|-------|------------|----------|
| Starter | 5,000 MRU | 3 offers | 30 days |
| Business | 12,000 MRU | 10 offers | 30 days |
| Premium | 25,000 MRU | Unlimited | 30 days |

## Admin Workflow

1. **View Requests**: Check `/admin/abonnements-entreprises` for pending requests
2. **Activate**: Set start/end dates and activate subscription
3. **Monitor**: Track active subscriptions and expiry dates
4. **Manage**: Deactivate or delete accounts as needed

## Enterprise Workflow

1. **Get Validated**: Ensure enterprise status is 'valide'
2. **Request Subscription**: Choose plan and request activation
3. **Wait for Activation**: Admin will activate manually
4. **Post Jobs**: Once active, post job offers within quota

## Technical Notes

- All subscription operations require admin approval
- Quota is enforced at database level via triggers
- Job posting requires active, verified subscription
- Automatic expiry checking prevents posting after expiration
- Complete audit trail for all admin actions

## Files Modified/Created

### New Files:
- `/app/admin/abonnements-entreprises/page.tsx`
- `/app/api/entreprises/subscriptions/request/route.ts`
- `/app/api/admin/subscriptions/activate/route.ts`
- `/app/api/admin/subscriptions/active/route.ts`
- `/app/api/admin/subscriptions/deactivate/route.ts`
- `/app/api/admin/subscriptions/reject/route.ts`
- `/app/api/admin/entreprises/[id]/route.ts`
- `/supabase/migrations/manual_subscription_system.sql`

### Modified Files:
- `/app/entreprise/abonnement/page.tsx` - Removed payment flow
- `/app/admin/layout.tsx` - Updated navigation
- `/lib/services/subscription.service.ts` - Added admin functions

The system is now fully manual and admin-controlled, removing all automatic payment processing while maintaining comprehensive subscription management capabilities.