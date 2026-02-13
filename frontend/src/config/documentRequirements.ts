/**
 * Centralized document requirements for merchant and courier onboarding.
 * Both the onboarding upload screens and the admin review screens reference this config.
 *
 * Each document has:
 *  - key: unique identifier stored in the backend
 *  - label: display name
 *  - description: help text shown to the user
 *  - icon: Ionicons icon name
 *  - required: whether the document is mandatory for approval
 *  - vehicleOnly: (courier only) only required if the courier has a motorized vehicle
 */

export interface DocumentRequirement {
  key: string;
  label: string;
  description: string;
  icon: string;
  required: boolean;
  vehicleOnly?: boolean;
}

// ─── Merchant Documents ───
export const MERCHANT_DOCUMENTS: DocumentRequirement[] = [
  {
    key: 'business_license',
    label: 'CAC Registration Certificate',
    description: 'Corporate Affairs Commission registration or business name certificate',
    icon: 'document-text',
    required: true,
  },
  {
    key: 'health_permit',
    label: 'Health Permit',
    description: 'NAFDAC or Lagos State health permit for food handling',
    icon: 'medkit',
    required: true,
  },
  {
    key: 'owner_id',
    label: 'Owner ID (NIN / Passport / License)',
    description: 'Valid government-issued photo ID of the business owner',
    icon: 'person',
    required: true,
  },
  {
    key: 'insurance',
    label: 'Business Insurance Policy',
    description: 'Liability or business insurance certificate',
    icon: 'shield-checkmark',
    required: false,
  },
  {
    key: 'tax_certificate',
    label: 'TIN Certificate',
    description: 'Tax Identification Number certificate from FIRS',
    icon: 'receipt',
    required: false,
  },
  {
    key: 'business_logo',
    label: 'Business Logo',
    description: 'Square logo image for your storefront',
    icon: 'image',
    required: true,
  },
  {
    key: 'cover_photo',
    label: 'Cover Photo',
    description: 'Wide banner image for your storefront page',
    icon: 'image',
    required: false,
  },
];

// ─── Courier Documents ───
export const COURIER_DOCUMENTS: DocumentRequirement[] = [
  {
    key: 'national_id',
    label: 'National ID (NIN) / Passport',
    description: 'Valid government-issued photo identification',
    icon: 'finger-print',
    required: true,
  },
  {
    key: 'drivers_license',
    label: "Driver's License",
    description: 'Valid driver\'s license (required for motorcycle, car, van)',
    icon: 'card',
    required: true,
    vehicleOnly: true,
  },
  {
    key: 'vehicle_registration',
    label: 'Vehicle Registration',
    description: 'Proof of vehicle ownership or registration',
    icon: 'car',
    required: true,
    vehicleOnly: true,
  },
  {
    key: 'insurance',
    label: 'Vehicle Insurance',
    description: 'Valid third-party or comprehensive vehicle insurance',
    icon: 'shield-checkmark',
    required: true,
    vehicleOnly: true,
  },
  {
    key: 'profile_photo',
    label: 'Profile Photo',
    description: 'Clear, recent photo of your face for customer identification',
    icon: 'person',
    required: true,
  },
  {
    key: 'guarantor_form',
    label: 'Guarantor Form',
    description: 'Signed guarantor form with guarantor\'s name, phone, and address',
    icon: 'people',
    required: true,
  },
];

/**
 * Filter courier documents based on vehicle type.
 * Bicycle couriers don't need driver's license, vehicle registration, or insurance.
 */
export function getCourierDocuments(vehicleType: string): DocumentRequirement[] {
  const isMotorized = vehicleType !== 'bicycle';
  return COURIER_DOCUMENTS.filter(doc => {
    if (doc.vehicleOnly && !isMotorized) return false;
    return true;
  });
}

/**
 * Get required document keys for a given role.
 */
export function getRequiredDocKeys(role: 'merchant' | 'courier', vehicleType?: string): string[] {
  const docs = role === 'merchant'
    ? MERCHANT_DOCUMENTS
    : getCourierDocuments(vehicleType || 'motorcycle');
  return docs.filter(d => d.required).map(d => d.key);
}
