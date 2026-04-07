import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import { colors } from '../theme/colors';

export default function PaystackPaymentScreen({ route, navigation }: any) {
  const { authorizationUrl, reference, onSuccess, onClose } = route.params;
  const webViewRef = useRef<any>(null);

  useEffect(() => {
    console.log('[Paystack] Opening payment URL:', authorizationUrl);
  }, []);

  const handleNavigationStateChange = (navState: any) => {
    const { url } = navState;
    console.log('[Paystack] Navigation to:', url);

    // Check if payment was successful (Paystack redirects to callback URL)
    if (url.includes('/payment/callback') || url.includes('trxref=') || url.includes('reference=')) {
      console.log('[Paystack] Payment completed, reference:', reference);
      
      // Extract transaction reference from URL
      const urlParams = new URLSearchParams(url.split('?')[1]);
      const trxref = urlParams.get('trxref') || urlParams.get('reference') || reference;
      
      const paymentData = {
        status: 'success',
        reference: trxref,
        message: 'Payment completed successfully',
      };

      onSuccess?.(paymentData);
      navigation.goBack();
    }

    // Check if payment was cancelled
    if (url.includes('cancelled') || url.includes('cancel')) {
      console.log('[Paystack] Payment cancelled');
      onClose?.();
      navigation.goBack();
    }
  };

  const handleClose = () => {
    console.log('[Paystack] User closed payment screen');
    onClose?.();
    navigation.goBack();
  };

  // Inject JavaScript to handle Paystack popup close
  const injectedJavaScript = `
    (function() {
      // Listen for Paystack close event
      window.addEventListener('message', function(e) {
        if (e.data === 'paystack:close') {
          window.ReactNativeWebView.postMessage('close');
        }
      });
      
      // Override window.close to send message to React Native
      window.close = function() {
        window.ReactNativeWebView.postMessage('close');
      };
    })();
    true;
  `;

  const handleWebViewMessage = (event: any) => {
    const { data } = event.nativeEvent;
    console.log('[Paystack] WebView message:', data);
    
    if (data === 'close') {
      handleClose();
    }
  };

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{ uri: authorizationUrl }}
        onNavigationStateChange={handleNavigationStateChange}
        onMessage={handleWebViewMessage}
        injectedJavaScript={injectedJavaScript}
        startInLoadingState={true}
        renderLoading={() => (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.teal} />
          </View>
        )}
        style={styles.webview}
        // Security settings
        javaScriptEnabled={true}
        domStorageEnabled={true}
        thirdPartyCookiesEnabled={true}
        sharedCookiesEnabled={true}
        // iOS specific
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        // Android specific
        mixedContentMode="always"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  webview: {
    flex: 1,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
  },
});
