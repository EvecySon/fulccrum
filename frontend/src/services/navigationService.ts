import { createNavigationContainerRef, NavigationContainerRefWithCurrent } from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef();

export function navigate(name: string, params?: any) {
  if (navigationRef.isReady()) {
    // @ts-ignore - Dynamic navigation
    navigationRef.navigate(name, params);
  }
}

export function navigateFromNotification(notificationType: string, data: any) {
  if (!navigationRef.isReady()) {
    console.warn('Navigation not ready');
    return;
  }

  switch (notificationType) {
    case 'ticket_assigned':
    case 'ticket_updated':
    case 'new_message':
      if (data.ticketId) {
        navigate('TicketDetail', { ticketId: data.ticketId });
      }
      break;

    case 'order_update':
    case 'order_assigned':
      if (data.orderId) {
        navigate('OrderDetails', { orderId: data.orderId });
      }
      break;

    case 'delivery_update':
      if (data.deliveryId) {
        navigate('TrackDelivery', { orderId: data.deliveryId });
      }
      break;

    case 'payment_received':
    case 'withdrawal_approved':
    case 'withdrawal_rejected':
      navigate('Wallet');
      break;

    case 'new_review':
      if (data.reviewId) {
        navigate('Reviews');
      }
      break;

    case 'merchant_approved':
    case 'merchant_rejected':
      navigate('Profile');
      break;

    case 'courier_approved':
    case 'courier_rejected':
      navigate('Profile');
      break;

    case 'promo_available':
      navigate('Vouchers');
      break;

    case 'flash_sale':
      if (data.saleId) {
        navigate('FlashSales');
      }
      break;

    default:
      console.log('Unknown notification type:', notificationType);
      break;
  }
}
