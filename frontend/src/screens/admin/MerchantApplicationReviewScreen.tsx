import { showAlert } from '../../utils/alert';
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

const MOCK_APPLICATIONS = [
  {
    id: 'app-1',
    status: 'pending',
    submittedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    business: {
      businessName: 'Seoul Kitchen - Lekki Phase 2',
      businessType: 'restaurant',
      address: '14 Admiralty Way, Lekki Phase 2, Lagos',
      city: 'Lagos',
      state: 'Lagos',
      phone: '+234 812 345 6789',
      description: 'Authentic Korean cuisine featuring bibimbap, bulgogi, and kimchi jjigae. Family-owned since 2024.',
    },
    owner: {
      firstName: 'Jin',
      lastName: 'Kim',
      email: 'jin@seoulkitchen.ng',
      phone: '+234 812 345 6789',
      idType: 'International Passport',
      idNumber: 'M12345678',
    },
    documents: [
      { id: 'doc-1', type: 'business_license', name: 'CAC Registration Certificate', status: 'uploaded', uploadedAt: new Date(Date.now() - 2 * 86400000).toISOString(), fileUrl: 'https://example.com/docs/cac-cert.pdf' },
      { id: 'doc-2', type: 'health_permit', name: 'NAFDAC Health Permit', status: 'uploaded', uploadedAt: new Date(Date.now() - 2 * 86400000).toISOString(), fileUrl: 'https://example.com/docs/nafdac.pdf' },
      { id: 'doc-3', type: 'owner_id', name: 'International Passport', status: 'uploaded', uploadedAt: new Date(Date.now() - 2 * 86400000).toISOString(), fileUrl: 'https://example.com/docs/passport.pdf' },
      { id: 'doc-4', type: 'insurance', name: 'Business Insurance Policy', status: 'missing', uploadedAt: null, fileUrl: null },
      { id: 'doc-5', type: 'tax_certificate', name: 'TIN Certificate', status: 'uploaded', uploadedAt: new Date(Date.now() - 1 * 86400000).toISOString(), fileUrl: 'https://example.com/docs/tin.pdf' },
    ],
    commission: 10,
    notes: '',
  },
  {
    id: 'app-2',
    status: 'pending',
    submittedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    business: {
      businessName: 'Kilimanjaro - Ajah',
      businessType: 'restaurant',
      address: '5 Lekki-Epe Expressway, Ajah, Lagos',
      city: 'Lagos',
      state: 'Lagos',
      phone: '+234 803 456 7890',
      description: 'Northern Nigerian cuisine specializing in suya, kilishi, and tuwo shinkafa. Fast delivery within Ajah and Sangotedo.',
    },
    owner: {
      firstName: 'Yusuf',
      lastName: 'Mohammed',
      email: 'yusuf@kilimanjaro.ng',
      phone: '+234 803 456 7890',
      idType: 'National ID (NIN)',
      idNumber: '12345678901',
    },
    documents: [
      { id: 'doc-6', type: 'business_license', name: 'CAC Registration Certificate', status: 'uploaded', uploadedAt: new Date(Date.now() - 1 * 86400000).toISOString(), fileUrl: 'https://example.com/docs/cac-kilimanjaro.pdf' },
      { id: 'doc-7', type: 'health_permit', name: 'Lagos State Health Permit', status: 'uploaded', uploadedAt: new Date(Date.now() - 1 * 86400000).toISOString(), fileUrl: 'https://example.com/docs/health-kilimanjaro.pdf' },
      { id: 'doc-8', type: 'owner_id', name: 'National ID Card', status: 'uploaded', uploadedAt: new Date(Date.now() - 1 * 86400000).toISOString(), fileUrl: 'https://example.com/docs/nin-yusuf.pdf' },
      { id: 'doc-9', type: 'insurance', name: 'Business Insurance Policy', status: 'uploaded', uploadedAt: new Date(Date.now() - 1 * 86400000).toISOString(), fileUrl: 'https://example.com/docs/insurance-kilimanjaro.pdf' },
      { id: 'doc-10', type: 'tax_certificate', name: 'TIN Certificate', status: 'uploaded', uploadedAt: new Date(Date.now() - 1 * 86400000).toISOString(), fileUrl: 'https://example.com/docs/tin-kilimanjaro.pdf' },
    ],
    commission: 10,
    notes: '',
  },
  {
    id: 'app-3',
    status: 'pending',
    submittedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    business: {
      businessName: 'Iya Basira Amala Spot',
      businessType: 'restaurant',
      address: '22 Allen Avenue, Ikeja, Lagos',
      city: 'Lagos',
      state: 'Lagos',
      phone: '+234 705 678 1234',
      description: 'Traditional Yoruba amala and assorted soups. Gbegiri, ewedu, and efo riro. Catering available.',
    },
    owner: {
      firstName: 'Basira',
      lastName: 'Adeyemo',
      email: 'basira@iyabasira.ng',
      phone: '+234 705 678 1234',
      idType: "Driver's License",
      idNumber: 'LAG-DL-2024-98765',
    },
    documents: [
      { id: 'doc-11', type: 'business_license', name: 'CAC Business Name Registration', status: 'uploaded', uploadedAt: new Date(Date.now() - 5 * 86400000).toISOString(), fileUrl: 'https://example.com/docs/cac-basira.pdf' },
      { id: 'doc-12', type: 'health_permit', name: 'NAFDAC Health Permit', status: 'missing', uploadedAt: null, fileUrl: null },
      { id: 'doc-13', type: 'owner_id', name: "Driver's License", status: 'uploaded', uploadedAt: new Date(Date.now() - 5 * 86400000).toISOString(), fileUrl: 'https://example.com/docs/dl-basira.pdf' },
      { id: 'doc-14', type: 'insurance', name: 'Business Insurance Policy', status: 'missing', uploadedAt: null, fileUrl: null },
      { id: 'doc-15', type: 'tax_certificate', name: 'TIN Certificate', status: 'missing', uploadedAt: null, fileUrl: null },
    ],
    commission: 12,
    notes: '',
  },
  {
    id: 'app-4',
    status: 'approved',
    submittedAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    reviewedAt: new Date(Date.now() - 8 * 86400000).toISOString(),
    reviewedBy: 'Adebayo Ogunlesi',
    business: {
      businessName: 'Chicken Republic - Lekki',
      businessType: 'restaurant',
      address: '1 Admiralty Way, Lekki Phase 1, Lagos',
      city: 'Lagos',
      state: 'Lagos',
      phone: '+234 801 234 5678',
      description: 'Fast food restaurant serving fried chicken, burgers, rice meals, and wraps.',
    },
    owner: {
      firstName: 'Adewale',
      lastName: 'Johnson',
      email: 'adewale@chickenrep.ng',
      phone: '+234 801 234 5678',
      idType: 'National ID (NIN)',
      idNumber: '98765432101',
    },
    documents: [
      { id: 'doc-16', type: 'business_license', name: 'CAC Registration Certificate', status: 'verified', uploadedAt: new Date(Date.now() - 10 * 86400000).toISOString(), fileUrl: 'https://example.com/docs/cac-chickenrep.pdf' },
      { id: 'doc-17', type: 'health_permit', name: 'Lagos State Health Permit', status: 'verified', uploadedAt: new Date(Date.now() - 10 * 86400000).toISOString(), fileUrl: 'https://example.com/docs/health-chickenrep.pdf' },
      { id: 'doc-18', type: 'owner_id', name: 'National ID Card', status: 'verified', uploadedAt: new Date(Date.now() - 10 * 86400000).toISOString(), fileUrl: 'https://example.com/docs/nin-adewale.pdf' },
      { id: 'doc-19', type: 'insurance', name: 'AXA Business Insurance', status: 'verified', uploadedAt: new Date(Date.now() - 10 * 86400000).toISOString(), fileUrl: 'https://example.com/docs/insurance-chickenrep.pdf' },
      { id: 'doc-20', type: 'tax_certificate', name: 'TIN Certificate', status: 'verified', uploadedAt: new Date(Date.now() - 10 * 86400000).toISOString(), fileUrl: 'https://example.com/docs/tin-chickenrep.pdf' },
    ],
    commission: 8,
    notes: 'All documents verified. Franchise location confirmed.',
  },
  {
    id: 'app-5',
    status: 'rejected',
    submittedAt: new Date(Date.now() - 14 * 86400000).toISOString(),
    reviewedAt: new Date(Date.now() - 12 * 86400000).toISOString(),
    reviewedBy: 'Kemi Adekunle',
    rejectionReason: 'Business license expired. Health permit not from an accredited body. Owner ID photo is blurry and unreadable. Please resubmit with valid documents.',
    business: {
      businessName: 'Quick Bites - Mushin',
      businessType: 'restaurant',
      address: '45 Agege Motor Road, Mushin, Lagos',
      city: 'Lagos',
      state: 'Lagos',
      phone: '+234 706 789 0123',
      description: 'Affordable fast food and snacks.',
    },
    owner: {
      firstName: 'Segun',
      lastName: 'Oladipo',
      email: 'segun@quickbites.ng',
      phone: '+234 706 789 0123',
      idType: "Voter's Card",
      idNumber: 'VC-LAG-2023-54321',
    },
    documents: [
      { id: 'doc-21', type: 'business_license', name: 'CAC Certificate (Expired)', status: 'rejected', uploadedAt: new Date(Date.now() - 14 * 86400000).toISOString(), fileUrl: 'https://example.com/docs/cac-quickbites.pdf' },
      { id: 'doc-22', type: 'health_permit', name: 'Unaccredited Health Cert', status: 'rejected', uploadedAt: new Date(Date.now() - 14 * 86400000).toISOString(), fileUrl: 'https://example.com/docs/health-quickbites.pdf' },
      { id: 'doc-23', type: 'owner_id', name: "Voter's Card (Blurry)", status: 'rejected', uploadedAt: new Date(Date.now() - 14 * 86400000).toISOString(), fileUrl: 'https://example.com/docs/vc-segun.pdf' },
      { id: 'doc-24', type: 'insurance', name: 'Business Insurance Policy', status: 'missing', uploadedAt: null, fileUrl: null },
      { id: 'doc-25', type: 'tax_certificate', name: 'TIN Certificate', status: 'missing', uploadedAt: null, fileUrl: null },
    ],
    commission: 10,
    notes: '',
  },
];

const getDocIcon = (type: string) => {
  switch (type) {
    case 'business_license': return 'document-text';
    case 'health_permit': return 'medkit';
    case 'owner_id': return 'person';
    case 'insurance': return 'shield-checkmark';
    case 'tax_certificate': return 'receipt';
    default: return 'document';
  }
};

const getDocStatusColor = (status: string) => {
  switch (status) {
    case 'verified': return colors.success;
    case 'uploaded': return colors.info;
    case 'missing': return colors.error;
    case 'rejected': return colors.error;
    default: return colors.textLight;
  }
};

const getAppStatusColor = (status: string) => {
  switch (status) {
    case 'approved': return colors.success;
    case 'rejected': return colors.error;
    case 'pending': return colors.warning;
    default: return colors.textLight;
  }
};

export default function MerchantApplicationReviewScreen({ navigation }: any) {
  const [applications, setApplications] = useState<any[]>(MOCK_APPLICATIONS);
  const [filter, setFilter] = useState('pending');
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [adminNotes, setAdminNotes] = useState('');

  const filteredApps = filter === 'all' ? applications : applications.filter(a => a.status === filter);

  const openDetail = (app: any) => {
    setSelectedApp(app);
    setAdminNotes(app.notes || '');
    setShowDetailModal(true);
  };

  const handleApprove = () => {
    if (!selectedApp) return;
    setApplications(prev => prev.map(a =>
      a.id === selectedApp.id
        ? { ...a, status: 'approved', reviewedAt: new Date().toISOString(), reviewedBy: 'Current Admin', notes: adminNotes, documents: a.documents.map((d: any) => d.status === 'uploaded' ? { ...d, status: 'verified' } : d) }
        : a
    ));
    showAlert('Success', `${selectedApp.business.businessName} has been approved!`);
    setShowDetailModal(false);
    setSelectedApp(null);
  };

  const openReject = () => {
    setRejectReason('');
    setShowRejectModal(true);
  };

  const handleReject = () => {
    if (!selectedApp || !rejectReason.trim()) return;
    setApplications(prev => prev.map(a =>
      a.id === selectedApp.id
        ? { ...a, status: 'rejected', reviewedAt: new Date().toISOString(), reviewedBy: 'Current Admin', rejectionReason: rejectReason, notes: adminNotes }
        : a
    ));
    showAlert('Done', `${selectedApp.business.businessName} has been rejected.`);
    setShowRejectModal(false);
    setShowDetailModal(false);
    setSelectedApp(null);
  };

  const handleRequestDocs = () => {
    if (!selectedApp) return;
    const missing = selectedApp.documents.filter((d: any) => d.status === 'missing').map((d: any) => d.name).join(', ');
    showAlert('Request Sent', `Document request sent to ${selectedApp.owner.email}.\n\nMissing: ${missing || 'None'}`);
  };

  const verifyDocument = (docId: string) => {
    if (!selectedApp) return;
    const updatedDocs = selectedApp.documents.map((d: any) => d.id === docId ? { ...d, status: 'verified' } : d);
    const updatedApp = { ...selectedApp, documents: updatedDocs };
    setSelectedApp(updatedApp);
    setApplications(prev => prev.map(a => a.id === selectedApp.id ? updatedApp : a));
    showAlert('Success', 'Document verified');
  };

  const rejectDocument = (docId: string) => {
    if (!selectedApp) return;
    const updatedDocs = selectedApp.documents.map((d: any) => d.id === docId ? { ...d, status: 'rejected' } : d);
    const updatedApp = { ...selectedApp, documents: updatedDocs };
    setSelectedApp(updatedApp);
    setApplications(prev => prev.map(a => a.id === selectedApp.id ? updatedApp : a));
    showAlert('Done', 'Document rejected');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Merchant Applications</Text>
        <View style={styles.headerBadge}>
          <Text style={styles.headerBadgeText}>{applications.filter(a => a.status === 'pending').length} pending</Text>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: colors.warning }]}>{applications.filter(a => a.status === 'pending').length}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: colors.success }]}>{applications.filter(a => a.status === 'approved').length}</Text>
          <Text style={styles.statLabel}>Approved</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: colors.error }]}>{applications.filter(a => a.status === 'rejected').length}</Text>
          <Text style={styles.statLabel}>Rejected</Text>
        </View>
      </View>

      {/* Filters */}
      <View style={styles.filterRow}>
        {['all', 'pending', 'approved', 'rejected'].map(f => (
          <TouchableOpacity key={f} style={[styles.filterChip, filter === f && styles.filterChipActive]} onPress={() => setFilter(f)}>
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>{f.charAt(0).toUpperCase() + f.slice(1)}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
        {filteredApps.map(app => {
          const uploadedCount = app.documents.filter((d: any) => d.status === 'uploaded' || d.status === 'verified').length;
          const totalDocs = app.documents.length;
          return (
            <TouchableOpacity key={app.id} style={styles.appCard} onPress={() => openDetail(app)}>
              <View style={styles.appCardHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.appBusinessName}>{app.business.businessName}</Text>
                  <Text style={styles.appOwnerName}>{app.owner.firstName} {app.owner.lastName} · {app.owner.email}</Text>
                </View>
                <View style={[styles.appStatusBadge, { backgroundColor: getAppStatusColor(app.status) + '15' }]}>
                  <Text style={[styles.appStatusText, { color: getAppStatusColor(app.status) }]}>{app.status}</Text>
                </View>
              </View>

              <View style={styles.appMeta}>
                <View style={styles.appMetaItem}>
                  <Ionicons name="location-outline" size={14} color={colors.textLight} />
                  <Text style={styles.appMetaText}>{app.business.city}, {app.business.state}</Text>
                </View>
                <View style={styles.appMetaItem}>
                  <Ionicons name="storefront-outline" size={14} color={colors.textLight} />
                  <Text style={styles.appMetaText}>{app.business.businessType}</Text>
                </View>
                <View style={styles.appMetaItem}>
                  <Ionicons name="document-outline" size={14} color={uploadedCount === totalDocs ? colors.success : colors.warning} />
                  <Text style={[styles.appMetaText, { color: uploadedCount === totalDocs ? colors.success : colors.warning }]}>{uploadedCount}/{totalDocs} docs</Text>
                </View>
              </View>

              <View style={styles.appFooter}>
                <Text style={styles.appDate}>Submitted {new Date(app.submittedAt).toLocaleDateString()}</Text>
                <View style={styles.reviewBtn}>
                  <Text style={styles.reviewBtnText}>{app.status === 'pending' ? 'Review →' : 'View Details →'}</Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}

        {filteredApps.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={48} color={colors.textLight} />
            <Text style={styles.emptyText}>No {filter} applications</Text>
          </View>
        )}
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Detail Modal */}
      <Modal visible={showDetailModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Application Review</Text>
              <TouchableOpacity onPress={() => setShowDetailModal(false)}>
                <Ionicons name="close" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            {selectedApp && (
              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Status Banner */}
                <View style={[styles.statusBanner, { backgroundColor: getAppStatusColor(selectedApp.status) + '15' }]}>
                  <Ionicons name={selectedApp.status === 'approved' ? 'checkmark-circle' : selectedApp.status === 'rejected' ? 'close-circle' : 'time'} size={20} color={getAppStatusColor(selectedApp.status)} />
                  <Text style={[styles.statusBannerText, { color: getAppStatusColor(selectedApp.status) }]}>
                    {selectedApp.status === 'pending' ? 'Awaiting Review' : selectedApp.status === 'approved' ? `Approved by ${selectedApp.reviewedBy}` : `Rejected by ${selectedApp.reviewedBy}`}
                  </Text>
                </View>

                {selectedApp.rejectionReason && (
                  <View style={styles.rejectionBanner}>
                    <Text style={styles.rejectionLabel}>Rejection Reason:</Text>
                    <Text style={styles.rejectionText}>{selectedApp.rejectionReason}</Text>
                  </View>
                )}

                {/* Business Info */}
                <Text style={styles.sectionTitle}>Business Information</Text>
                <View style={styles.infoCard}>
                  <View style={styles.infoRow}><Text style={styles.infoLabel}>Name</Text><Text style={styles.infoValue}>{selectedApp.business.businessName}</Text></View>
                  <View style={styles.infoRow}><Text style={styles.infoLabel}>Type</Text><Text style={styles.infoValue}>{selectedApp.business.businessType}</Text></View>
                  <View style={styles.infoRow}><Text style={styles.infoLabel}>Address</Text><Text style={styles.infoValue}>{selectedApp.business.address}</Text></View>
                  <View style={styles.infoRow}><Text style={styles.infoLabel}>Phone</Text><Text style={styles.infoValue}>{selectedApp.business.phone}</Text></View>
                  <View style={styles.infoRow}><Text style={styles.infoLabel}>Commission</Text><Text style={styles.infoValue}>{selectedApp.commission}%</Text></View>
                  <View style={[styles.infoRow, { borderBottomWidth: 0 }]}><Text style={styles.infoLabel}>Description</Text><Text style={styles.infoValue}>{selectedApp.business.description}</Text></View>
                </View>

                {/* Owner Info */}
                <Text style={styles.sectionTitle}>Owner Information</Text>
                <View style={styles.infoCard}>
                  <View style={styles.infoRow}><Text style={styles.infoLabel}>Name</Text><Text style={styles.infoValue}>{selectedApp.owner.firstName} {selectedApp.owner.lastName}</Text></View>
                  <View style={styles.infoRow}><Text style={styles.infoLabel}>Email</Text><Text style={styles.infoValue}>{selectedApp.owner.email}</Text></View>
                  <View style={styles.infoRow}><Text style={styles.infoLabel}>Phone</Text><Text style={styles.infoValue}>{selectedApp.owner.phone}</Text></View>
                  <View style={styles.infoRow}><Text style={styles.infoLabel}>ID Type</Text><Text style={styles.infoValue}>{selectedApp.owner.idType}</Text></View>
                  <View style={[styles.infoRow, { borderBottomWidth: 0 }]}><Text style={styles.infoLabel}>ID Number</Text><Text style={styles.infoValue}>{selectedApp.owner.idNumber}</Text></View>
                </View>

                {/* Documents */}
                <Text style={styles.sectionTitle}>Documents ({(selectedApp.documents as any[]).filter((d: any) => d.status !== 'missing').length}/{selectedApp.documents.length})</Text>
                {selectedApp.documents.map((doc: any) => (
                  <View key={doc.id} style={styles.docCard}>
                    <View style={styles.docHeader}>
                      <View style={[styles.docIconWrap, { backgroundColor: getDocStatusColor(doc.status) + '15' }]}>
                        <Ionicons name={getDocIcon(doc.type) as any} size={18} color={getDocStatusColor(doc.status)} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.docName}>{doc.name}</Text>
                        <Text style={styles.docType}>{doc.type.replace(/_/g, ' ')}</Text>
                      </View>
                      <View style={[styles.docStatusBadge, { backgroundColor: getDocStatusColor(doc.status) + '15' }]}>
                        <Text style={[styles.docStatusText, { color: getDocStatusColor(doc.status) }]}>{doc.status}</Text>
                      </View>
                    </View>
                    {doc.uploadedAt && (
                      <Text style={styles.docDate}>Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}</Text>
                    )}
                    {doc.status === 'uploaded' && selectedApp.status === 'pending' && (
                      <View style={styles.docActions}>
                        <TouchableOpacity style={[styles.docActionBtn, { backgroundColor: colors.success }]} onPress={() => verifyDocument(doc.id)}>
                          <Ionicons name="checkmark" size={14} color={colors.white} />
                          <Text style={styles.docActionText}>Verify</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.docActionBtn, { backgroundColor: colors.error }]} onPress={() => rejectDocument(doc.id)}>
                          <Ionicons name="close" size={14} color={colors.white} />
                          <Text style={styles.docActionText}>Reject</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.docActionBtn, { backgroundColor: colors.info }]} onPress={() => showAlert('Preview', `Opening ${doc.name}...\n\nIn production this would open the document viewer.`)}>
                          <Ionicons name="eye" size={14} color={colors.white} />
                          <Text style={styles.docActionText}>View</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                    {doc.status === 'missing' && (
                      <Text style={styles.docMissing}>⚠ Not yet submitted by merchant</Text>
                    )}
                  </View>
                ))}

                {/* Admin Notes */}
                {selectedApp.status === 'pending' && (
                  <>
                    <Text style={styles.sectionTitle}>Admin Notes</Text>
                    <TextInput
                      style={styles.notesInput}
                      placeholder="Add notes about this application..."
                      placeholderTextColor={colors.textLight}
                      value={adminNotes}
                      onChangeText={setAdminNotes}
                      multiline
                      numberOfLines={3}
                    />
                  </>
                )}

                {selectedApp.notes && selectedApp.status !== 'pending' ? (
                  <>
                    <Text style={styles.sectionTitle}>Admin Notes</Text>
                    <Text style={styles.existingNotes}>{selectedApp.notes}</Text>
                  </>
                ) : null}

                {/* Action Buttons */}
                {selectedApp.status === 'pending' && (
                  <View style={styles.actionRow}>
                    <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.info }]} onPress={handleRequestDocs}>
                      <Ionicons name="mail-outline" size={16} color={colors.white} />
                      <Text style={styles.actionBtnText}>Request Docs</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.error }]} onPress={openReject}>
                      <Ionicons name="close-circle-outline" size={16} color={colors.white} />
                      <Text style={styles.actionBtnText}>Reject</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.success }]} onPress={handleApprove}>
                      <Ionicons name="checkmark-circle-outline" size={16} color={colors.white} />
                      <Text style={styles.actionBtnText}>Approve</Text>
                    </TouchableOpacity>
                  </View>
                )}

                <View style={{ height: 30 }} />
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Reject Reason Modal */}
      <Modal visible={showRejectModal} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: '50%' }]}>
            <Text style={styles.modalTitle}>Rejection Reason</Text>
            <Text style={styles.rejectSubtitle}>This will be sent to the merchant via email.</Text>
            <TextInput
              style={[styles.notesInput, { minHeight: 100 }]}
              placeholder="Explain why this application is being rejected..."
              placeholderTextColor={colors.textLight}
              value={rejectReason}
              onChangeText={setRejectReason}
              multiline
              numberOfLines={5}
            />
            <View style={styles.rejectActions}>
              <TouchableOpacity style={[styles.rejectActionBtn, { backgroundColor: colors.lightGray }]} onPress={() => setShowRejectModal(false)}>
                <Text style={[styles.rejectActionText, { color: colors.textPrimary }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.rejectActionBtn, { backgroundColor: colors.error, opacity: rejectReason.trim() ? 1 : 0.5 }]} onPress={handleReject} disabled={!rejectReason.trim()}>
                <Text style={[styles.rejectActionText, { color: colors.white }]}>Reject Application</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.lightGray },
  header: {
    paddingTop: 54, paddingHorizontal: 20, paddingBottom: 16,
    marginTop: 10, marginHorizontal: 10, borderRadius: 28, backgroundColor: colors.white,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 10, elevation: 5,
  },
  backBtn: { marginRight: 10 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: colors.textPrimary, flex: 1 },
  headerBadge: { backgroundColor: colors.warning + '15', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  headerBadgeText: { fontSize: 13, fontWeight: '600', color: colors.warning },
  statsRow: { flexDirection: 'row', paddingHorizontal: 10, gap: 8, marginTop: 10 },
  statCard: { flex: 1, backgroundColor: colors.white, borderRadius: 14, padding: 12, alignItems: 'center' },
  statValue: { fontSize: 20, fontWeight: '800' },
  statLabel: { fontSize: 11, color: colors.textLight, marginTop: 2 },
  filterRow: { flexDirection: 'row', paddingHorizontal: 10, gap: 8, marginTop: 10 },
  filterChip: { flex: 1, paddingVertical: 8, borderRadius: 16, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
  filterChipActive: { backgroundColor: colors.navy, borderColor: colors.navy },
  filterText: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
  filterTextActive: { color: colors.white },
  list: { flex: 1, paddingHorizontal: 10, marginTop: 10 },
  appCard: { backgroundColor: colors.white, borderRadius: 16, padding: 16, marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 3, elevation: 1 },
  appCardHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  appBusinessName: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  appOwnerName: { fontSize: 13, color: colors.textLight, marginTop: 2 },
  appStatusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  appStatusText: { fontSize: 11, fontWeight: '700', textTransform: 'capitalize' },
  appMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.borderLight },
  appMetaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  appMetaText: { fontSize: 12, color: colors.textLight },
  appFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 },
  appDate: { fontSize: 12, color: colors.textLight },
  reviewBtn: { backgroundColor: colors.navy + '10', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  reviewBtnText: { fontSize: 13, fontWeight: '600', color: colors.navy },
  emptyState: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyText: { fontSize: 16, color: colors.textLight },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 20, fontWeight: '700', color: colors.textPrimary },
  statusBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderRadius: 12, marginBottom: 16 },
  statusBannerText: { fontSize: 14, fontWeight: '600' },
  rejectionBanner: { backgroundColor: colors.error + '10', padding: 12, borderRadius: 12, marginBottom: 16 },
  rejectionLabel: { fontSize: 12, fontWeight: '700', color: colors.error, marginBottom: 4 },
  rejectionText: { fontSize: 13, color: colors.error, lineHeight: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary, marginTop: 16, marginBottom: 8 },
  infoCard: { backgroundColor: colors.lightGray, borderRadius: 12, padding: 12 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.border },
  infoLabel: { fontSize: 13, color: colors.textLight, flex: 1 },
  infoValue: { fontSize: 13, fontWeight: '600', color: colors.textPrimary, flex: 2, textAlign: 'right' },
  docCard: { backgroundColor: colors.lightGray, borderRadius: 12, padding: 12, marginBottom: 8 },
  docHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  docIconWrap: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  docName: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
  docType: { fontSize: 11, color: colors.textLight, textTransform: 'capitalize', marginTop: 1 },
  docStatusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  docStatusText: { fontSize: 11, fontWeight: '700', textTransform: 'capitalize' },
  docDate: { fontSize: 11, color: colors.textLight, marginTop: 6, marginLeft: 46 },
  docActions: { flexDirection: 'row', gap: 8, marginTop: 8, marginLeft: 46 },
  docActionBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  docActionText: { fontSize: 12, fontWeight: '600', color: colors.white },
  docMissing: { fontSize: 12, color: colors.error, marginTop: 6, marginLeft: 46 },
  notesInput: { backgroundColor: colors.lightGray, borderRadius: 12, padding: 12, fontSize: 14, color: colors.textPrimary, textAlignVertical: 'top', minHeight: 60 },
  existingNotes: { fontSize: 13, color: colors.textSecondary, fontStyle: 'italic', backgroundColor: colors.lightGray, borderRadius: 12, padding: 12 },
  actionRow: { flexDirection: 'row', gap: 8, marginTop: 20 },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 14, borderRadius: 12 },
  actionBtnText: { fontSize: 14, fontWeight: '600', color: colors.white },
  rejectSubtitle: { fontSize: 13, color: colors.textLight, marginBottom: 12 },
  rejectActions: { flexDirection: 'row', gap: 10, marginTop: 16 },
  rejectActionBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  rejectActionText: { fontSize: 14, fontWeight: '600' },
});
