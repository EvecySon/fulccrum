# Admin Panel TODO - Package Delivery Pricing Settings

## Frontend Work Required

### Create Package Delivery Settings Screen

**Location:** `frontend/src/screens/admin/PackageDeliverySettingsScreen.tsx`

**Purpose:** Allow admin to configure package delivery pricing parameters through a UI

**API Endpoints (Already Implemented in Backend):**
- `GET /fees/package-delivery/settings` - Get current settings
- `PUT /fees/package-delivery/settings` - Update settings

**Required Form Fields:**

1. **Base Pricing**
   - Base Package Price (₦) - default: 500
   - Per Km Rate (₦) - default: 100

2. **Package Size Multipliers**
   - Small Multiplier - default: 1.0
   - Medium Multiplier - default: 1.5
   - Large Multiplier - default: 2.0

3. **Delivery Speed Multipliers**
   - Express Speed Multiplier - default: 1.3
   - Same Day Speed Multiplier - default: 1.0
   - Scheduled Speed Multiplier - default: 0.8

4. **Surge Pricing Multipliers**
   - Peak Hour Surge (7-9am, 5-8pm weekdays) - default: 1.3
   - Weekend Surge (6-10pm Fri-Sun) - default: 1.2

**UI Requirements:**
- Number inputs for all fields
- Validation (min value: 0)
- Save button
- Success/error notifications
- Display current values on load
- Show pricing formula explanation/preview

**Example API Call:**
```typescript
import { api } from '../../services/api';

// Get settings
const settings = await api.get('/fees/package-delivery/settings');

// Update settings
await api.put('/fees/package-delivery/settings', {
  basePackagePrice: 600,
  perKmPackageRate: 120,
  packageSizeSmallMultiplier: 1.0,
  packageSizeMediumMultiplier: 1.5,
  packageSizeLargeMultiplier: 2.0,
  expressSpeedMultiplier: 1.4,
  sameDaySpeedMultiplier: 1.0,
  scheduledSpeedMultiplier: 0.8,
  peakHourSurgeMultiplier: 1.3,
  weekendSurgeMultiplier: 1.2,
});
```

**Navigation:**
Add to admin navigation menu under "Settings" or "Package Delivery" section

---

## Backend Status: ✅ COMPLETE

- ✅ Database schema updated with package delivery pricing fields
- ✅ Migration applied: `20260316030349_add_package_delivery_pricing_to_platform_settings`
- ✅ PricingService reads from database instead of hardcoded values
- ✅ Admin API endpoints created (`GET` and `PUT /fees/package-delivery/settings`)
- ✅ DTO validation added (`UpdatePackagePricingDto`)
- ✅ Frontend mock removed - now uses real backend API

---

## Future Enhancements (Optional)

1. **Google Maps Integration** - Replace Haversine distance with real road distance
   - Requires: Google Maps Distance Matrix API key
   - Cost: ~$5 per 1,000 requests
   - Alternative: Mapbox ($0.50 per 1,000 requests)

2. **Demand-Based Surge** - Calculate surge based on active orders in area
   - Count orders within 5km radius
   - Dynamic multiplier based on demand

3. **Pricing Preview Calculator** - Test pricing with sample routes before saving

4. **Pricing History** - Track changes to pricing settings over time
