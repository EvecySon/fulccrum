# FULCCRUM Consistency Standards Checklist - Complete Platform Standards

## 🎯 **OVERVIEW**
**Purpose**: Ensure 100% consistency across all 4 apps (Customer, Merchant, Courier, Admin)
**Scope**: Design, Code, Components, UX Patterns, API Integration, Testing
**Usage**: Every team member must follow these standards exactly

---

## 🎨 **DESIGN SYSTEM STANDARDS**

### **Color Palette**
```javascript
const colors = {
  // Primary Colors
  primary: {
    50: '#F0F9FF',
    100: '#E0F2FE', 
    200: '#BAE6FD',
    300: '#7DD3FC',
    400: '#38BDF8',
    500: '#0EA5E9',  // Main primary color
    600: '#0284C7',
    700: '#0369A1',
    800: '#075985',
    900: '#0C4A6E'
  },
  
  // Secondary Colors
  secondary: {
    50: '#F8FAFC',
    100: '#F1F5F9',
    200: '#E2E8F0',
    300: '#CBD5E1',
    400: '#94A3B8',
    500: '#64748B',  // Main secondary color
    600: '#475569',
    700: '#334155',
    800: '#1E293B',
    900: '#0F172A'
  },
  
  // Success Colors
  success: {
    50: '#F0FDF4',
    100: '#DCFCE7',
    200: '#BBF7D0',
    300: '#86EFAC',
    400: '#4ADE80',
    500: '#22C55E',  // Main success color
    600: '#16A34A',
    700: '#15803D',
    800: '#166534',
    900: '#14532D'
  },
  
  // Warning Colors
  warning: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    200: '#FDE68A',
    300: '#FCD34D',
    400: '#FBBF24',
    500: '#F59E0B',  // Main warning color
    600: '#D97706',
    700: '#B45309',
    800: '#92400E',
    900: '#78350F'
  },
  
  // Error Colors
  error: {
    50: '#FEF2F2',
    100: '#FEE2E2',
    200: '#FECACA',
    300: '#FCA5A5',
    400: '#F87171',
    500: '#EF4444',  // Main error color
    600: '#DC2626',
    700: '#B91C1C',
    800: '#991B1B',
    900: '#7F1D1D'
  },
  
  // Semantic Colors
  background: '#FFFFFF',
  surface: '#F8FAFC',
  border: '#E2E8F0',
  text: {
    primary: '#0F172A',
    secondary: '#475569',
    tertiary: '#64748B',
    inverse: '#FFFFFF'
  }
};
```

### **Typography System**
```javascript
const typography = {
  // Font Family
  fontFamily: {
    primary: 'Inter',      // Main font
    secondary: 'Roboto',   // Alternative
    mono: 'JetBrains Mono' // Code/numbers
  },
  
  // Font Sizes (responsive)
  fontSize: {
    xs: '12px',    // Caption, labels
    sm: '14px',    // Small text
    base: '16px',  // Body text
    lg: '18px',    // Large body
    xl: '20px',    // Small headings
    '2xl': '24px', // Medium headings
    '3xl': '30px', // Large headings
    '4xl': '36px', // Extra large headings
    '5xl': '48px', // Display headings
    '6xl': '64px'  // Hero headings
  },
  
  // Font Weights
  fontWeight: {
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800'
  },
  
  // Line Heights
  lineHeight: {
    tight: '1.25',
    snug: '1.375',
    normal: '1.5',
    relaxed: '1.625',
    loose: '2'
  },
  
  // Letter Spacing
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0em',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em'
  }
};
```

### **Spacing System**
```javascript
const spacing = {
  // 8-point grid system
  0: '0px',
  1: '4px',    // 0.25rem
  2: '8px',    // 0.5rem
  3: '12px',   // 0.75rem
  4: '16px',   // 1rem
  5: '20px',   // 1.25rem
  6: '24px',   // 1.5rem
  7: '28px',   // 1.75rem
  8: '32px',   // 2rem
  9: '36px',   // 2.25rem
  10: '40px',  // 2.5rem
  11: '44px',  // 2.75rem
  12: '48px',  // 3rem
  14: '56px',  // 3.5rem
  16: '64px',  // 4rem
  20: '80px',  // 5rem
  24: '96px',  // 6rem
  28: '112px', // 7rem
  32: '128px', // 8rem
  36: '144px', // 9rem
  40: '160px', // 10rem
  44: '176px', // 11rem
  48: '192px', // 12rem
  52: '208px', // 13rem
  56: '224px', // 14rem
  60: '240px', // 15rem
  64: '256px', // 16rem
  72: '288px', // 18rem
  80: '320px', // 20rem
  96: '384px'  // 24rem
};
```

---

## 🧩 **COMPONENT STANDARDS**

### **Button Components**
```javascript
const buttonVariants = {
  // Primary Button
  primary: {
    backgroundColor: 'colors.primary.500',
    color: 'colors.text.inverse',
    borderRadius: '8px',
    padding: '12px 24px',
    fontSize: '16px',
    fontWeight: '500',
    borderWidth: '0px',
    hover: {
      backgroundColor: 'colors.primary.600'
    },
    disabled: {
      backgroundColor: 'colors.secondary.300',
      color: 'colors.secondary.500'
    }
  },
  
  // Secondary Button
  secondary: {
    backgroundColor: 'transparent',
    color: 'colors.primary.500',
    borderRadius: '8px',
    padding: '12px 24px',
    fontSize: '16px',
    fontWeight: '500',
    borderWidth: '1px',
    borderColor: 'colors.primary.500',
    hover: {
      backgroundColor: 'colors.primary.50'
    }
  },
  
  // Ghost Button
  ghost: {
    backgroundColor: 'transparent',
    color: 'colors.text.secondary',
    borderRadius: '8px',
    padding: '8px 16px',
    fontSize: '14px',
    fontWeight: '500',
    borderWidth: '0px',
    hover: {
      backgroundColor: 'colors.secondary.100'
    }
  }
};

const buttonSizes = {
  small: {
    padding: '8px 16px',
    fontSize: '14px'
  },
  medium: {
    padding: '12px 24px',
    fontSize: '16px'
  },
  large: {
    padding: '16px 32px',
    fontSize: '18px'
  }
};
```

### **Input Components**
```javascript
const inputStandards = {
  // Text Input
  textInput: {
    backgroundColor: 'colors.background',
    borderColor: 'colors.border',
    borderWidth: '1px',
    borderRadius: '8px',
    padding: '12px 16px',
    fontSize: '16px',
    color: 'colors.text.primary',
    placeholderColor: 'colors.text.tertiary',
    focus: {
      borderColor: 'colors.primary.500',
      borderWidth: '2px'
    },
    error: {
      borderColor: 'colors.error.500'
    },
    disabled: {
      backgroundColor: 'colors.secondary.100',
      color: 'colors.text.tertiary'
    }
  },
  
  // Label
  label: {
    fontSize: '14px',
    fontWeight: '500',
    color: 'colors.text.primary',
    marginBottom: '4px'
  },
  
  // Error Message
  errorMessage: {
    fontSize: '12px',
    color: 'colors.error.500',
    marginTop: '4px'
  }
};
```

### **Card Components**
```javascript
const cardStandards = {
  // Base Card
  card: {
    backgroundColor: 'colors.background',
    borderRadius: '12px',
    padding: '16px',
    borderWidth: '1px',
    borderColor: 'colors.border',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  
  // Card Header
  cardHeader: {
    marginBottom: '12px',
    paddingBottom: '12px',
    borderBottomWidth: '1px',
    borderBottomColor: 'colors.border'
  },
  
  // Card Title
  cardTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: 'colors.text.primary',
    marginBottom: '4px'
  },
  
  // Card Subtitle
  cardSubtitle: {
    fontSize: '14px',
    color: 'colors.text.secondary'
  }
};
```

---

## 📱 **NAVIGATION PATTERNS**

### **Tab Navigation Standards**
```javascript
const tabNavigation = {
  // Customer App Tabs
  customerTabs: [
    {
      name: 'Home',
      icon: 'home',
      activeIcon: 'home-filled',
      label: 'Home'
    },
    {
      name: 'Search',
      icon: 'search',
      activeIcon: 'search-filled',
      label: 'Search'
    },
    {
      name: 'Orders',
      icon: 'receipt',
      activeIcon: 'receipt-filled',
      label: 'Orders'
    },
    {
      name: 'Profile',
      icon: 'user',
      activeIcon: 'user-filled',
      label: 'Profile'
    }
  ],
  
  // Merchant App Tabs
  merchantTabs: [
    {
      name: 'Dashboard',
      icon: 'grid',
      activeIcon: 'grid-filled',
      label: 'Dashboard'
    },
    {
      name: 'Orders',
      icon: 'receipt',
      activeIcon: 'receipt-filled',
      label: 'Orders'
    },
    {
      name: 'Menu',
      icon: 'utensils',
      activeIcon: 'utensils-filled',
      label: 'Menu'
    },
    {
      name: 'Analytics',
      icon: 'chart-bar',
      activeIcon: 'chart-bar-filled',
      label: 'Analytics'
    }
  ],
  
  // Courier App Tabs
  courierTabs: [
    {
      name: 'Orders',
      icon: 'map',
      activeIcon: 'map-filled',
      label: 'Orders'
    },
    {
      name: 'Earnings',
      icon: 'dollar-sign',
      activeIcon: 'dollar-sign-filled',
      label: 'Earnings'
    },
    {
      name: 'Profile',
      icon: 'user',
      activeIcon: 'user-filled',
      label: 'Profile'
    }
  ],
  
  // Tab Bar Styles
  tabBarStyle: {
    backgroundColor: 'colors.background',
    borderTopWidth: '1px',
    borderTopColor: 'colors.border',
    height: '80px',
    paddingBottom: '20px'
  },
  
  tabLabelStyle: {
    fontSize: '12px',
    fontWeight: '500',
    marginTop: '4px'
  },
  
  activeTabColor: 'colors.primary.500',
  inactiveTabColor: 'colors.text.tertiary'
};
```

### **Header Standards**
```javascript
const headerStandards = {
  // App Header
  header: {
    backgroundColor: 'colors.background',
    borderBottomWidth: '1px',
    borderBottomColor: 'colors.border',
    paddingHorizontal: '16px',
    paddingVertical: '12px',
    height: '64px'
  },
  
  // Header Title
  headerTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: 'colors.text.primary',
    textAlign: 'center'
  },
  
  // Header Actions
  headerAction: {
    paddingHorizontal: '8px',
    paddingVertical: '4px'
  },
  
  // Back Button
  backButton: {
    color: 'colors.primary.500',
    size: 24
  }
};
```

---

## 🔧 **CODING STANDARDS**

### **File Structure**
```javascript
const fileStructure = {
  // App Root
  appRoot: [
    'src/',
    'android/',
    'ios/',
    'package.json',
    'README.md'
  ],
  
  // Source Structure
  srcStructure: [
    'src/',
    '├── components/',     // Reusable components
    '├── screens/',        // Screen components
    '├── navigation/',     // Navigation configuration
    '├── services/',       // API services
    '├── store/',          // Redux store
    '├── utils/',          // Utility functions
    '├── constants/',      // App constants
    '├── hooks/',          // Custom hooks
    '├── assets/',         // Images, fonts
    '└── styles/'          // Global styles
  ],
  
  // Component Structure
  componentStructure: [
    'ComponentName/',
    '├── index.js',        // Component export
    '├── ComponentName.js', // Main component
    '├── ComponentName.styles.js', // Styles
    '└── ComponentName.test.js' // Tests
  ]
};
```

### **Naming Conventions**
```javascript
const namingConventions = {
  // Files
  files: {
    components: 'PascalCase (UserProfile.js)',
    screens: 'PascalCase (HomeScreen.js)',
    services: 'camelCase (userService.js)',
    constants: 'UPPER_SNAKE_CASE (API_ENDPOINTS.js)',
    utils: 'camelCase (formatDate.js)'
  },
  
  // Variables
  variables: {
    constants: 'UPPER_SNAKE_CASE',
    variables: 'camelCase',
    functions: 'camelCase',
    components: 'PascalCase',
    cssClasses: 'kebab-case'
  },
  
  // Directories
  directories: 'kebab-case or camelCase'
};
```

### **Code Style**
```javascript
const codeStyle = {
  // JavaScript/React
  javascript: {
    indentation: '2 spaces',
    quotes: 'single quotes',
    semicolons: 'required',
    trailingCommas: 'es5',
    bracketSpacing: true,
    jsxQuotes: 'double quotes'
  },
  
  // React Patterns
  reactPatterns: {
    functionalComponents: 'Use functional components with hooks',
    propsDestructuring: 'Destructure props in function signature',
    stateManagement: 'Use useState for local state',
    sideEffects: 'Use useEffect for side effects',
    customHooks: 'Extract logic into custom hooks'
  },
  
  // Import Order
  importOrder: [
    'React imports',
    'Third-party libraries',
    'Internal components',
    'Services',
    'Utils',
    'Constants',
    'Types'
  ]
};
```

---

## 🌐 **API INTEGRATION STANDARDS**

### **API Configuration**
```javascript
const apiConfig = {
  // Base URL
  baseURL: 'https://api.delivery-platform.com/v1',
  
  // Headers
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': 'Bearer ${token}'
  },
  
  // Timeout
  timeout: 10000,
  
  // Retry Configuration
  retry: {
    times: 3,
    delay: 1000
  }
};
```

### **Service Structure**
```javascript
const serviceStructure = {
  // Base Service
  baseService: `
import axios from 'axios';
import { API_CONFIG } from '../constants/api';

class BaseService {
  constructor() {
    this.client = axios.create(API_CONFIG);
    this.setupInterceptors();
  }
  
  setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Add auth token
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = \`Bearer \${token}\`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );
    
    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response.data,
      (error) => {
        // Handle common errors
        if (error.response?.status === 401) {
          // Handle unauthorized
        }
        return Promise.reject(error);
      }
    );
  }
}

export default BaseService;
  `,
  
  // Specific Service
  specificService: `
import BaseService from './BaseService';

class UserService extends BaseService {
  async getProfile() {
    return this.client.get('/user/profile');
  }
  
  async updateProfile(data) {
    return this.client.put('/user/profile', data);
  }
}

export default new UserService();
  `
};
```

### **Error Handling Standards**
```javascript
const errorHandling = {
  // Error Types
  errorTypes: {
    networkError: 'Network connection failed',
    serverError: 'Server error occurred',
    validationError: 'Invalid data provided',
    unauthorizedError: 'Authentication required',
    forbiddenError: 'Access denied',
    notFoundError: 'Resource not found'
  },
  
  // Error Response Format
  errorResponse: {
    status: 'error',
    code: 'ERROR_CODE',
    message: 'Human readable error message',
    details: 'Additional error details',
    timestamp: '2024-01-01T00:00:00Z'
  },
  
  // Error Handling Pattern
  errorHandlingPattern: `
try {
  const result = await apiCall();
  return { success: true, data: result };
} catch (error) {
  return { 
    success: false, 
    error: {
      code: error.code,
      message: error.message,
      type: error.type
    }
  };
}
  `
};
```

---

## 🎭 **UX PATTERNS STANDARDS**

### **Loading States**
```javascript
const loadingStates = {
  // Spinner Component
  spinner: {
    size: 'small' | 'medium' | 'large',
    color: 'colors.primary.500',
    backgroundColor: 'transparent'
  },
  
  // Skeleton Loading
  skeleton: {
    backgroundColor: 'colors.secondary.200',
    highlightColor: 'colors.secondary.100',
    borderRadius: '4px',
    animation: 'pulse'
  },
  
  // Loading Overlay
  loadingOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center'
  }
};
```

### **Empty States**
```javascript
const emptyStates = {
  // Empty State Component
  emptyState: {
    icon: 'icon-name',
    title: 'No data available',
    description: 'Start by adding your first item',
    actionButton: {
      text: 'Add Item',
      onPress: 'handleAddItem'
    }
  },
  
  // Common Empty States
  commonStates: {
    noOrders: {
      icon: 'receipt',
      title: 'No orders yet',
      description: 'Your order history will appear here'
    },
    noSearchResults: {
      icon: 'search',
      title: 'No results found',
      description: 'Try adjusting your search terms'
    },
    noInternet: {
      icon: 'wifi-off',
      title: 'No internet connection',
      description: 'Please check your connection and try again'
    }
  }
};
```

### **Success/Error Messages**
```javascript
const messageStandards = {
  // Toast Messages
  toast: {
    success: {
      backgroundColor: 'colors.success.500',
      color: 'colors.text.inverse',
      icon: 'check-circle',
      duration: 3000
    },
    error: {
      backgroundColor: 'colors.error.500',
      color: 'colors.text.inverse',
      icon: 'alert-circle',
      duration: 5000
    },
    warning: {
      backgroundColor: 'colors.warning.500',
      color: 'colors.text.inverse',
      icon: 'alert-triangle',
      duration: 4000
    },
    info: {
      backgroundColor: 'colors.primary.500',
      color: 'colors.text.inverse',
      icon: 'info',
      duration: 3000
    }
  },
  
  // Inline Messages
  inlineMessage: {
    padding: '12px 16px',
    borderRadius: '8px',
    fontSize: '14px',
    marginBottom: '16px'
  }
};
```

---

## 🧪 **TESTING STANDARDS**

### **Unit Testing**
```javascript
const testingStandards = {
  // Test File Naming
  testNaming: 'ComponentName.test.js',
  
  // Test Structure
  testStructure: `
describe('ComponentName', () => {
  describe('when rendered', () => {
    it('should match snapshot', () => {
      const { toJSON } = render(<ComponentName />);
      expect(toJSON()).toMatchSnapshot();
    });
    
    it('should render correctly', () => {
      render(<ComponentName />);
      expect(screen.getByTestId('component-name')).toBeTruthy();
    });
  });
  
  describe('when user interacts', () => {
    it('should handle press correctly', () => {
      const mockFn = jest.fn();
      render(<ComponentName onPress={mockFn} />);
      
      fireEvent.press(screen.getByTestId('button'));
      expect(mockFn).toHaveBeenCalled();
    });
  });
});
  `,
  
  // Coverage Requirements
  coverage: {
    statements: 80,
    branches: 80,
    functions: 80,
    lines: 80
  }
};
```

---

## 📊 **PERFORMANCE STANDARDS**

### **Performance Metrics**
```javascript
const performanceStandards = {
  // App Performance
  appPerformance: {
    startupTime: '< 3 seconds',
    screenLoadTime: '< 2 seconds',
    memoryUsage: '< 200MB',
    batteryUsage: 'Optimized for battery life'
  },
  
  // Image Performance
  imagePerformance: {
    maxFileSize: '5MB',
    recommendedSize: '< 2MB',
    formats: ['JPEG', 'PNG', 'WebP'],
    lazyLoading: 'Required for long lists'
  },
  
  // API Performance
  apiPerformance: {
    responseTime: '< 200ms',
    timeout: '10 seconds',
    retryAttempts: 3,
    caching: 'Implement where appropriate'
  }
};
```

---

## 🔒 **SECURITY STANDARDS**

### **Data Security**
```javascript
const securityStandards = {
  // Authentication
  authentication: {
    tokenStorage: 'Secure storage (Keychain/Keystore)',
    tokenRefresh: 'Automatic refresh before expiry',
    biometricAuth: 'Face ID/Fingerprint support'
  },
  
  // Data Protection
  dataProtection: {
    encryption: 'Encrypt sensitive data at rest',
    transmission: 'HTTPS only',
    validation: 'Validate all inputs',
    sanitization: 'Sanitize all outputs'
  },
  
  // API Security
  apiSecurity: {
    rateLimiting: 'Implement rate limiting',
    inputValidation: 'Validate all API inputs',
    errorHandling: 'Don't expose sensitive information'
  }
};
```

---

## 📋 **CHECKLIST FOR EVERY SCREEN**

### **Pre-Development Checklist**
```
□ Review design system for components needed
□ Check if reusable component already exists
□ Plan responsive layout for different screen sizes
□ Identify required API endpoints
□ Plan error states and loading states
□ Consider accessibility requirements
□ Plan offline behavior if needed
□ Define success metrics for the screen
```

### **Development Checklist**
```
□ Use correct typography and spacing from design system
□ Implement proper error handling
□ Add loading states for async operations
□ Test on different screen sizes
□ Implement accessibility features
□ Add proper error messages
□ Test offline scenarios
□ Add unit tests
□ Test performance
□ Check memory usage
```

### **Post-Development Checklist**
```
□ Code review completed
□ All tests passing
□ Performance metrics met
□ Accessibility testing passed
✓ Cross-platform testing completed
□ API integration tested
□ Error scenarios tested
□ Documentation updated
□ Ready for QA testing
```

---

## 🔄 **CONSISTENCY REVIEW PROCESS**

### **Daily Review**
```
□ Check code against standards
□ Review component usage
□ Verify naming conventions
□ Check file structure
□ Validate API integration
```

### **Weekly Review**
```
□ Cross-app consistency check
□ Design system compliance review
□ Performance metrics review
□ Security standards compliance
□ User experience consistency
```

---

## 🎯 **FINAL COMPLIANCE CHECK**

### **Before Merge Checklist**
```
□ All code follows naming conventions
□ Components use design system correctly
□ API integration follows standards
□ Error handling implemented
□ Tests written and passing
□ Performance optimized
□ Security standards met
□ Documentation updated
□ Accessibility features implemented
□ Cross-platform compatibility verified
```

---

**🎉 This checklist ensures 100% consistency across all apps! Every team member must follow these standards exactly.**

**Key Principle: If it's not in this checklist, don't add it without team discussion and approval!**
