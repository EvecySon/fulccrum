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
  Image,
  ScrollView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { resolveMediaUrl } from '../services/api';

const { width } = Dimensions.get('window');
const DRAWER_WIDTH = width * 0.8;

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
    { icon: 'home-outline', label: 'Home', screen: 'ServiceSelection' },
    { icon: 'person-outline', label: 'Account', screen: 'EditProfile' },
    { icon: 'bicycle-outline', label: 'Active Orders', screen: 'ActiveOrders' },
    { icon: 'time-outline', label: 'Order History', screen: 'PackageHistory' },
    { icon: 'wallet-outline', label: 'Wallet', screen: 'WalletDetails' },
    { icon: 'people-outline', label: 'Referrals', screen: 'Referrals' },
    { icon: 'chatbubbles-outline', label: 'Contact Us', screen: 'Feedback' },
    { icon: 'help-circle-outline', label: 'Help', screen: 'Support' },
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
          {/* Header Section - Navy */}
          <View style={styles.headerSection}>
            {/* Close Button */}
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={26} color="#fff" />
            </TouchableOpacity>

            {/* User Profile */}
            <View style={styles.profileSection}>
              <View style={styles.avatarWrapper}>
                {resolveMediaUrl(user?.avatarUrl) ? (
                  <Image source={{ uri: resolveMediaUrl(user?.avatarUrl)! }} style={styles.avatarImage} />
                ) : (
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{getInitials()}</Text>
                  </View>
                )}
                <TouchableOpacity
                  style={styles.editIconBtn}
                  onPress={() => handleNavigate('EditProfile')}
                >
                  <Ionicons name="camera" size={14} color="#fff" />
                </TouchableOpacity>
              </View>
              <Text style={styles.userName}>{user?.firstName || 'Guest'} {user?.lastName || ''}</Text>
              <Text style={styles.userEmail}>{user?.email || ''}</Text>
            </View>
          </View>

          {/* Menu Items - White body */}
          <ScrollView style={styles.menuSection} showsVerticalScrollIndicator={false}>
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.menuItem}
                onPress={() => handleNavigate(item.screen)}
              >
                <View style={styles.menuIconWrap}>
                  <Ionicons name={item.icon as any} size={22} color="#1e3a8a" />
                </View>
                <Text style={styles.menuLabel}>{item.label}</Text>
                <Ionicons name="chevron-forward" size={18} color="#94a3b8" />
              </TouchableOpacity>
            ))}

            <View style={styles.divider} />

            {/* Sign Out */}
            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleSignOut}
            >
              <View style={[styles.menuIconWrap, { backgroundColor: '#fef2f2' }]}>
                <Ionicons name="log-out-outline" size={22} color="#ef4444" />
              </View>
              <Text style={[styles.menuLabel, { color: '#ef4444' }]}>Sign out</Text>
              <Ionicons name="chevron-forward" size={18} color="#94a3b8" />
            </TouchableOpacity>

            <View style={{ height: 40 }} />
          </ScrollView>
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
    backgroundColor: '#ffffff',
    zIndex: 2,
    overflow: 'hidden',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  headerSection: {
    backgroundColor: '#172554',
    paddingTop: Platform.OS === 'ios' ? 54 : 36,
    paddingBottom: 24,
    paddingHorizontal: 24,
  },
  closeButton: {
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  profileSection: {
    alignItems: 'center',
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 12,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1e3a8a',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#14b8a6',
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#14b8a6',
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
  },
  editIconBtn: {
    position: 'absolute',
    bottom: 0,
    right: -2,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#14b8a6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#172554',
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 13,
    color: '#94a3b8',
  },
  menuSection: {
    flex: 1,
    paddingTop: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  menuIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  menuLabel: {
    flex: 1,
    fontSize: 16,
    color: '#1e293b',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginHorizontal: 20,
    marginVertical: 8,
  },
});

export default DrawerMenu;
