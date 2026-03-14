import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Linking,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../services/api';

interface FAQItem {
  question: string;
  answer: string;
  expanded: boolean;
}

const SupportScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'faq' | 'contact'>('faq');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [faqs, setFaqs] = useState<FAQItem[]>([
    {
      question: 'How do I place an order?',
      answer: 'Browse through our services, select what you need, add to cart, and proceed to checkout. You can pay with your wallet or card.',
      expanded: false,
    },
    {
      question: 'What payment methods are accepted?',
      answer: 'We accept wallet payments, debit/credit cards, bank transfers, and USSD payments.',
      expanded: false,
    },
    {
      question: 'How long does delivery take?',
      answer: 'Delivery times vary by service. Food orders typically arrive within 30-45 minutes, while package deliveries depend on distance.',
      expanded: false,
    },
    {
      question: 'Can I track my order?',
      answer: 'Yes! You can track your order in real-time from the Orders tab. You\'ll see your courier\'s location and estimated arrival time.',
      expanded: false,
    },
    {
      question: 'How do I cancel an order?',
      answer: 'You can cancel an order within 5 minutes of placing it from the Order Details screen. After that, please contact support.',
      expanded: false,
    },
    {
      question: 'What is the refund policy?',
      answer: 'Refunds are processed within 3-5 business days for cancelled orders or issues with your delivery. Contact support for assistance.',
      expanded: false,
    },
  ]);

  const toggleFAQ = (index: number) => {
    setFaqs(faqs.map((faq, i) => ({
      ...faq,
      expanded: i === index ? !faq.expanded : faq.expanded,
    })));
  };

  const handleCall = () => {
    Linking.openURL('tel:+2348012345678');
  };

  const handleEmail = () => {
    Linking.openURL('mailto:support@fulccrum.com');
  };

  const handleWhatsApp = () => {
    Linking.openURL('https://wa.me/2348012345678');
  };

  const handleSubmit = async () => {
    if (!subject.trim() || !message.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      setSubmitting(true);
      await api.post('/support/tickets', {
        subject,
        message,
      });
      
      Alert.alert('Success', 'Your message has been sent. We\'ll get back to you soon!');
      setSubject('');
      setMessage('');
    } catch (error) {
      console.error('Error submitting support ticket:', error);
      Alert.alert('Error', 'Failed to send message. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'faq' && styles.activeTab]}
          onPress={() => setActiveTab('faq')}
        >
          <Text style={[styles.tabText, activeTab === 'faq' && styles.activeTabText]}>
            FAQs
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'contact' && styles.activeTab]}
          onPress={() => setActiveTab('contact')}
        >
          <Text style={[styles.tabText, activeTab === 'contact' && styles.activeTabText]}>
            Contact Us
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {activeTab === 'faq' ? (
          <View style={styles.faqSection}>
            <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
            
            {faqs.map((faq, index) => (
              <TouchableOpacity
                key={index}
                style={styles.faqItem}
                onPress={() => toggleFAQ(index)}
              >
                <View style={styles.faqHeader}>
                  <Text style={styles.faqQuestion}>{faq.question}</Text>
                  <Ionicons
                    name={faq.expanded ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color="#64748b"
                  />
                </View>
                
                {faq.expanded && (
                  <Text style={styles.faqAnswer}>{faq.answer}</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.contactSection}>
            {/* Quick Contact Options */}
            <View style={styles.quickContact}>
              <TouchableOpacity style={styles.contactOption} onPress={handleCall}>
                <View style={[styles.contactIcon, { backgroundColor: '#dcfce7' }]}>
                  <Ionicons name="call" size={24} color="#10b981" />
                </View>
                <Text style={styles.contactLabel}>Call Us</Text>
                <Text style={styles.contactValue}>+234 801 234 5678</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.contactOption} onPress={handleEmail}>
                <View style={[styles.contactIcon, { backgroundColor: '#dbeafe' }]}>
                  <Ionicons name="mail" size={24} color="#3b82f6" />
                </View>
                <Text style={styles.contactLabel}>Email</Text>
                <Text style={styles.contactValue}>support@fulccrum.com</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.contactOption} onPress={handleWhatsApp}>
                <View style={[styles.contactIcon, { backgroundColor: '#dcfce7' }]}>
                  <Ionicons name="logo-whatsapp" size={24} color="#10b981" />
                </View>
                <Text style={styles.contactLabel}>WhatsApp</Text>
                <Text style={styles.contactValue}>Chat with us</Text>
              </TouchableOpacity>
            </View>

            {/* Contact Form */}
            <View style={styles.formSection}>
              <Text style={styles.formTitle}>Send us a message</Text>
              
              <TextInput
                style={styles.input}
                placeholder="Subject"
                value={subject}
                onChangeText={setSubject}
                placeholderTextColor="#94a3b8"
              />
              
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Describe your issue..."
                value={message}
                onChangeText={setMessage}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
                placeholderTextColor="#94a3b8"
              />
              
              <TouchableOpacity
                style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
                onPress={handleSubmit}
                disabled={submitting}
              >
                <Text style={styles.submitButtonText}>
                  {submitting ? 'Sending...' : 'Send Message'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Operating Hours */}
            <View style={styles.hoursSection}>
              <Text style={styles.hoursTitle}>Support Hours</Text>
              <View style={styles.hoursRow}>
                <Ionicons name="time-outline" size={20} color="#64748b" />
                <Text style={styles.hoursText}>Monday - Friday: 8:00 AM - 8:00 PM</Text>
              </View>
              <View style={styles.hoursRow}>
                <Ionicons name="time-outline" size={20} color="#64748b" />
                <Text style={styles.hoursText}>Saturday - Sunday: 9:00 AM - 6:00 PM</Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#14b8a6',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#64748b',
  },
  activeTabText: {
    color: '#14b8a6',
    fontWeight: '600',
  },
  faqSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 16,
  },
  faqItem: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqQuestion: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    marginRight: 12,
  },
  faqAnswer: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 12,
    lineHeight: 20,
  },
  contactSection: {
    padding: 16,
  },
  quickContact: {
    marginBottom: 24,
  },
  contactOption: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  contactIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  contactLabel: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  contactValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
  },
  formSection: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#0f172a',
    marginBottom: 12,
  },
  textArea: {
    height: 120,
    paddingTop: 12,
  },
  submitButton: {
    backgroundColor: '#14b8a6',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  hoursSection: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  hoursTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 12,
  },
  hoursRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  hoursText: {
    fontSize: 14,
    color: '#64748b',
  },
});

export default SupportScreen;
