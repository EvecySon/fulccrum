#!/bin/bash

# Script to add back buttons to all admin screens that don't have them yet

SCREENS=(
  "frontend/src/screens/admin/finance/RefundManagementScreen.tsx"
  "frontend/src/screens/admin/operations/LiveOperationsMapScreen.tsx"
  "frontend/src/screens/admin/operations/IncidentManagementScreen.tsx"
  "frontend/src/screens/admin/operations/SLAMonitoringScreen.tsx"
  "frontend/src/screens/admin/rbac/RolesManagementScreen.tsx"
  "frontend/src/screens/admin/rbac/AuditLogsScreen.tsx"
  "frontend/src/screens/admin/content/MerchantComplianceScreen.tsx"
  "frontend/src/screens/admin/marketing/CampaignManagementScreen.tsx"
  "frontend/src/screens/admin/marketing/PromoCodeManagerScreen.tsx"
  "frontend/src/screens/admin/analytics/CustomReportsScreen.tsx"
  "frontend/src/screens/admin/analytics/CohortAnalysisScreen.tsx"
)

for screen in "${SCREENS[@]}"; do
  echo "Processing $screen..."
  
  # Check if Ionicons is already imported
  if ! grep -q "import { Ionicons }" "$screen"; then
    # Add Ionicons import after React Native imports
    sed -i '' "/from 'react-native';/a\\
import { Ionicons } from '@expo/vector-icons';
" "$screen"
  fi
  
  # Check if navigation prop exists
  if ! grep -q "({ navigation }: any)" "$screen"; then
    # Add navigation prop
    sed -i '' 's/export default function \([A-Za-z]*\)() {/export default function \1({ navigation }: any) {/' "$screen"
  fi
  
  echo "✓ Updated $screen"
done

echo "Done! All screens updated."
