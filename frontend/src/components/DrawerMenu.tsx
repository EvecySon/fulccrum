import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
  Dimensions,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';

const { width } = Dimensions.get('window');
const DRAWER_WIDTH = width * 0.75;

interface DrawerMenuProps {
  visible: boolean;
  onClose: () => void;
  onNavigate: (screen: string) => void;
}

const DrawerMenu: React.FC<DrawerMenuProps> = ({ visible, onClose, onNavigate }) => {
  const { user, logout } = useAuth();
  const slideAnim = React.useRef(new Animated.Value(-DRAWER_WIDTH)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: -DRAWER_WIDTH,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const handleNavigate = (screen: string) => {
    onClose();
    setTimeout(() => onNavigate(screen), 300);
  };

  const handleSignOut = async () => {
    onClose();
    setTimeout(async () => {
      await logout();
    }, 300);
  };

  const getInitials = () => {
    if (!user?.firstName && !user?.lastName) return 'U';
    const first = user?.firstName?.[0] || '';
    const last = user?.lastName?.[0] || '';
    return (first + last).toUpperCase();
  };

  const menuItems = [
    { icon: 'home', label: 'Home', screen: 'ServiceSelection', color: '#fff' },
    { icon: 'person', label: 'Account', screen: 'EditProfile', color: '#fff' },
    { icon: 'bicycle', label: 'Active Orders', screen: 'ActiveOrders', color: '#fff' },
    { icon: 'time', label: 'Order History', screen: 'PackageHistory', color: '#fff' },
    { icon: 'wallet', label: 'Wallet', screen: 'WalletDetails', color: '#fff' },
    { icon: 'people', label: 'Referrals', screen: 'Referrals', color: '#fff' },
    { icon: 'chatbubbles', label: 'Contact Us', screen: 'Feedback', color: '#fff' },
    { icon: 'help-circle', label: 'Help', screen: 'Support', color: '#fff' },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        
        {/* Drawer */}
        <Animated.View 
          style={[
            styles.drawer,
            { transform: [{ translateX: slideAnim }] }
          ]}
        >
          {/* Close Button */}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={28} color="#fff" />
          </TouchableOpacity>

          {/* User Profile Section */}
          <View style={styles.profileSection}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{getInitials()}</Text>
            </View>
            <Text style={styles.greeting}>
              Hello, <Text style={styles.userName}>{user?.firstName || 'Guest'}</Text>
            </Text>
          </View>

          {/* Menu Items */}
          <View style={styles.menuItems}>
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.menuItem}
                onPress={() => handleNavigate(item.screen)}
              >
                <Ionicons name={item.icon as any} size={24} color={item.color} />
                <Text style={styles.menuLabel}>{item.label}</Text>
              </TouchableOpacity>
            ))}

            {/* Sign Out */}
            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleSignOut}
            >
              <Ionicons name="log-out" size={24} color="#FF6B6B" />
              <Text style={[styles.menuLabel, { color: '#FF6B6B' }]}>Sign out</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Overlay */}
        <TouchableOpacity 
          style={styles.overlay} 
          activeOpacity={1} 
          onPress={onClose}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
  },
  drawer: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: DRAWER_WIDTH,
    height: '100%',
    backgroundColor: '#14b8a6',
    paddingTop: 60,
    paddingHorizontal: 24,
    zIndex: 2,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    left: 24,
    zIndex: 10,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#A0AEC0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: '600',
    color: '#fff',
  },
  greeting: {
    fontSize: 18,
    color: '#fff',
  },
  userName: {
    fontWeight: '700',
  },
  menuItems: {
    flex: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 16,
  },
  menuLabel: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '500',
  },
});

export default DrawerMenu;
