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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

const MOCK_APPLICATIONS: any[] = [
  {
    id: 'ca-1',
    status: 'pending',
    submittedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    courier: {
      firstName: 'Ibrahim',
      lastName: 'Musa',
      email: 'ibrahim@fulccrum.ng',
      phone: '+234 806 444 5555',
      idType: 'National ID (NIN)',
      idNumber: '45678901234',
    },
    vehicle: {
      type: 'motorcycle',
      make: 'Bajaj Boxer',
      year: '2023',
      licensePlate: 'LAG-890-EF',
      color: 'Black',
    },
    zone: 'Ajah / Sangotedo',
    documents: [
      { id: 'cd-1', type: 'drivers_license', name: "Driver's License", status: 'uploaded', uploadedAt: new Date(Date.now() - 2 * 86400000).toISOString(), fileUrl: 'https://example.com/docs/dl-ibrahim.pdf' },
      { id: 'cd-2', type: 'vehicle_registration', name: 'Vehicle Registration', status: 'uploaded', uploadedAt: new Date(Date.now() - 2 * 86400000).toISOString(), fileUrl: 'https://example.com/docs/vreg-ibrahim.pdf' },
      { id: 'cd-3', type: 'insurance', name: 'Vehicle Insurance', status: 'uploaded', uploadedAt: new Date(Date.now() - 2 * 86400000).toISOString(), fileUrl: 'https://example.com/docs/ins-ibrahim.pdf' },
      { id: 'cd-4', type: 'national_id', name: 'National ID (NIN)', status: 'uploaded', uploadedAt: new Date(Date.now() - 2 * 86400000).toISOString(), fileUrl: 'https://example.com/docs/nin-ibrahim.pdf' },
      { id: 'cd-5', type: 'guarantor_form', name: 'Guarantor Form', status: 'missing', uploadedAt: null, fileUrl: null },
    ],
    notes: '',
  },
  {
    id: 'ca-2',
    status: 'pending',
    submittedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    courier: {
      firstName: 'Blessing',
      lastName: 'Okonkwo',
      email: 'blessing@fulccrum.ng',
      phone: '+234 810 555 6666',
      idType: "Driver's License",
      idNumber: 'LAG-DL-2025-12345',
    },
    vehicle: {
      type: 'car',
      make: 'Toyota Corolla',
      year: '2020',
      licensePlate: 'LAG-112-GH',
      color: 'Silver',
    },
    zone: 'Ikoyi / Lekki',
    documents: [
      { id: 'cd-6', type: 'drivers_license', name: "Driver's License", status: 'uploaded', uploadedAt: new Date(Date.now() - 1 * 86400000).toISOString(), fileUrl: 'https://example.com/docs/dl-blessing.pdf' },
      { id: 'cd-7', type: 'vehicle_registration', name: 'Vehicle Registration', status: 'uploaded', uploadedAt: new Date(Date.now() - 1 * 86400000).toISOString(), fileUrl: 'https://example.com/docs/vreg-blessing.pdf' },
      { id: 'cd-8', type: 'insurance', name: 'Vehicle Insurance', status: 'uploaded', uploadedAt: new Date(Date.now() - 1 * 86400000).toISOString(), fileUrl: 'https://example.com/docs/ins-blessing.pdf' },
      { id: 'cd-9', type: 'national_id', name: 'National ID (NIN)', status: 'uploaded', uploadedAt: new Date(Date.now() - 1 * 86400000).toISOString(), fileUrl: 'https://example.com/docs/nin-blessing.pdf' },
      { id: 'cd-10', type: 'guarantor_form', name: 'Guarantor Form', status: 'uploaded', uploadedAt: new Date(Date.now() - 1 * 86400000).toISOString(), fileUrl: 'https://example.com/docs/gf-blessing.pdf' },
    ],
    notes: '',
  },
  {
    id: 'ca-3',
    status: 'pending',
    submittedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    courier: {
      firstName: 'Oluwaseun',
      lastName: 'Afolabi',
      email: 'seun@fulccrum.ng',
      phone: '+234 701 666 7777',
      idType: "Voter's Card",
      idNumber: 'VC-OG-2024-67890',
    },
    vehicle: {
      type: 'motorcycle',
      make: 'Honda ACE 125',
      year: '2024',
      licensePlate: 'OG-345-IJ',
      color: 'Red',
    },
    zone: 'Ikeja / Agege',
    documents: [
      { id: 'cd-11', type: 'drivers_license', name: "Driver's License", status: 'uploaded', uploadedAt: new Date(Date.now() - 3 * 86400000).toISOString(), fileUrl: 'https://example.com/docs/dl-seun.pdf' },
      { id: 'cd-12', type: 'vehicle_registration', name: 'Vehicle Registration', status: 'missing', uploadedAt: null, fileUrl: null },
      { id: 'cd-13', type: 'insurance', name: 'Vehicle Insurance', status: 'missing', uploadedAt: null, fileUrl: null },
      { id: 'cd-14', type: 'national_id', name: "Voter's Card", status: 'uploaded', uploadedAt: new Date(Date.now() - 3 * 86400000).toISOString(), fileUrl: 'https://example.com/docs/vc-seun.pdf' },
      { id: 'cd-15', type: 'guarantor_form', name: 'Guarantor Form', status: 'missing', uploadedAt: null, fileUrl: null },
    ],
    notes: '',
  },
  {
    id: 'ca-4',
    status: 'pending',
    submittedAt: new Date(Date.now() - 6 * 3600000).toISOString(),
    courier: {
      firstName: 'Adamu',
      lastName: 'Garba',
      email: 'adamu@fulccrum.ng',
      phone: '+234 809 888 9999',
      idType: 'National ID (NIN)',
      idNumber: '78901234567',
    },
    vehicle: {
      type: 'bicycle',
      make: 'Trek FX 3',
      year: '2024',
      licensePlate: 'N/A',
      color: 'Blue',
    },
    zone: 'Victoria Island',
    documents: [
      { id: 'cd-16', type: 'national_id', name: 'National ID (NIN)', status: 'uploaded', uploadedAt: new Date(Date.now() - 6 * 3600000).toISOString(), fileUrl: 'https://example.com/docs/nin-adamu.pdf' },
      { id: 'cd-17', type: 'guarantor_form', name: 'Guarantor Form', status: 'uploaded', uploadedAt: new Date(Date.now() - 6 * 3600000).toISOString(), fileUrl: 'https://example.com/docs/gf-adamu.pdf' },
    ],
    notes: '',
  },
  {
    id: 'ca-5',
    status: 'approved',
    submittedAt: new Date(Date.now() - 15 * 86400000).toISOString(),
    reviewedAt: new Date(Date.now() - 13 * 86400000).toISOString(),
    reviewedBy: 'Adebayo Ogunlesi',
    courier: {
      firstName: 'Chinedu',
      lastName: 'Okoro',
      email: 'chinedu@fulccrum.ng',
      phone: '+234 812 111 2222',
      idType: 'National ID (NIN)',
      idNumber: '12345678901',
    },
    vehicle: {
      type: 'motorcycle',
      make: 'Bajaj Pulsar',
      year: '2023',
      licensePlate: 'LAG-234-AB',
      color: 'Black',
    },
    zone: 'Lekki / VI',
    documents: [
      { id: 'cd-18', type: 'drivers_license', name: "Driver's License", status: 'verified', uploadedAt: new Date(Date.now() - 15 * 86400000).toISOString(), fileUrl: 'https://example.com/docs/dl-chinedu.pdf' },
      { id: 'cd-19', type: 'vehicle_registration', name: 'Vehicle Registration', status: 'verified', uploadedAt: new Date(Date.now() - 15 * 86400000).toISOString(), fileUrl: 'https://example.com/docs/vreg-chinedu.pdf' },
      { id: 'cd-20', type: 'insurance', name: 'Vehicle Insurance', status: 'verified', uploadedAt: new Date(Date.now() - 15 * 86400000).toISOString(), fileUrl: 'https://example.com/docs/ins-chinedu.pdf' },
      { id: 'cd-21', type: 'national_id', name: 'National ID (NIN)', status: 'verified', uploadedAt: new Date(Date.now() - 15 * 86400000).toISOString(), fileUrl: 'https://example.com/docs/nin-chinedu.pdf' },
      { id: 'cd-22', type: 'guarantor_form', name: 'Guarantor Form', status: 'verified', uploadedAt: new Date(Date.now() - 15 * 86400000).toISOString(), fileUrl: 'https://example.com/docs/gf-chinedu.pdf' },
    ],
    notes: 'All documents verified. Background check passed.',
  },
  {
    id: 'ca-6',
    status: 'rejected',
    submittedAt: new Date(Date.now() - 20 * 86400000).toISOString(),
    reviewedAt: new Date(Date.now() - 18 * 86400000).toISOString(),
    reviewedBy: 'Kemi Adekunle',
    rejectionReason: "Driver's license expired. Vehicle registration does not match the applicant's name. Guarantor form incomplete — missing guarantor's phone number and signature.",
    courier: {
      firstName: 'Emeka',
      lastName: 'Nwosu',
      email: 'emeka.n@fulccrum.ng',
      phone: '+234 703 222 3333',
      idType: "Driver's License",
      idNumber: 'LAG-DL-2022-99999',
    },
    vehicle: {
      type: 'motorcycle',
      make: 'TVS Apache',
      year: '2021',
      licensePlate: 'LAG-999-ZZ',
      color: 'White',
    },
    zone: 'Surulere / Yaba',
    documents: [
      { id: 'cd-23', type: 'drivers_license', name: "Driver's License (Expired)", status: 'rejected', uploadedAt: new Date(Date.now() - 20 * 86400000).toISOString(), fileUrl: 'https://example.com/docs/dl-emeka.pdf' },
      { id: 'cd-24', type: 'vehicle_registration', name: 'Vehicle Registration (Name Mismatch)', status: 'rejected', uploadedAt: new Date(Date.now() - 20 * 86400000).toISOString(), fileUrl: 'https://example.com/docs/vreg-emeka.pdf' },
      { id: 'cd-25', type: 'insurance', name: 'Vehicle Insurance', status: 'uploaded', uploadedAt: new Date(Date.now() - 20 * 86400000).toISOString(), fileUrl: 'https://example.com/docs/ins-emeka.pdf' },
      { id: 'cd-26', type: 'national_id', name: "Driver's License", status: 'rejected', uploadedAt: new Date(Date.now() - 20 * 86400000).toISOString(), fileUrl: 'https://example.com/docs/dl2-emeka.pdf' },
      { id: 'cd-27', type: 'guarantor_form', name: 'Guarantor Form (Incomplete)', status: 'rejected', uploadedAt: new Date(Date.now() - 20 * 86400000).toISOString(), fileUrl: 'https://example.com/docs/gf-emeka.pdf' },
    ],
    notes: '',
  },
];

const vehicleIcons: Record<string, string> = { bicycle: 'bicycle', motorcycle: 'speedometer', car: 'car', van: 'bus' };

const getDocIcon = (type: string) => {
  switch (type) {
    case 'drivers_license': return 'card';
    case 'vehicle_registration': return 'document-text';
    case 'insurance': return 'shield-checkmark';
    case 'national_id': return 'person';
    case 'guarantor_form': return 'people';
    default: return 'document';
  }
};

const getDocStatusColor = (s: string) => {
  switch (s) {
    case 'verified': return colors.success;
    case 'uploaded': return colors.info;
    case 'missing': return colors.error;
    case 'rejected': return colors.error;
    case 'expired': return colors.warning;
    default: return colors.textLight;
  }
};

const getAppStatusColor = (s: string) => {
  switch (s) {
    case 'approved': return colors.success;
    case 'rejected': return colors.error;
    case 'pending': return colors.warning;
    default: return colors.textLight;
  }
};

export default function CourierApplicationReviewScreen({ navigation }: any) {
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
    showAlert('Success', `${selectedApp.courier.firstName} ${selectedApp.courier.lastName} has been approved as a courier!`);
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
    showAlert('Done', `${selectedApp.courier.firstName} ${selectedApp.courier.lastName}'s application has been rejected.`);
    setShowRejectModal(false);
    setShowDetailModal(false);
    setSelectedApp(null);
  };

  const handleRequestDocs = () => {
    if (!selectedApp) return;
    const missing = selectedApp.documents.filter((d: any) => d.status === 'missing').map((d: any) => d.name).join(', ');
    showAlert('Request Sent', `Document request sent to ${selectedApp.courier.email}.\n\nMissing: ${missing || 'None'}`);
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
        <Text style={styles.headerTitle}>Courier Applications</Text>
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
                <View style={styles.appAvatar}>
                  <Ionicons name={(vehicleIcons[app.vehicle.type] || 'bicycle') as any} size={20} color={colors.navy} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.appName}>{app.courier.firstName} {app.courier.lastName}</Text>
                  <Text style={styles.appMeta}>{app.vehicle.type} · {app.vehicle.make} · {app.zone}</Text>
                </View>
                <View style={[styles.appStatusBadge, { backgroundColor: getAppStatusColor(app.status) + '15' }]}>
                  <Text style={[styles.appStatusText, { color: getAppStatusColor(app.status) }]}>{app.status}</Text>
                </View>
              </View>

              <View style={styles.appInfo}>
                <View style={styles.appInfoItem}>
                  <Ionicons name="mail-outline" size={14} color={colors.textLight} />
                  <Text style={styles.appInfoText}>{app.courier.email}</Text>
                </View>
                <View style={styles.appInfoItem}>
                  <Ionicons name="document-outline" size={14} color={uploadedCount === totalDocs ? colors.success : colors.warning} />
                  <Text style={[styles.appInfoText, { color: uploadedCount === totalDocs ? colors.success : colors.warning }]}>{uploadedCount}/{totalDocs} docs</Text>
                </View>
                <View style={styles.appInfoItem}>
                  <Ionicons name="car-outline" size={14} color={colors.textLight} />
                  <Text style={styles.appInfoText}>{app.vehicle.licensePlate}</Text>
                </View>
              </View>

              <View style={styles.appFooter}>
                <Text style={styles.appDate}>Submitted {new Date(app.submittedAt).toLocaleDateString()}</Text>
                <Text style={styles.reviewLink}>{app.status === 'pending' ? 'Review →' : 'View Details →'}</Text>
              </View>
            </TouchableOpacity>
          );
        })}

        {filteredApps.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="bicycle-outline" size={48} color={colors.textLight} />
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

                {/* Personal Info */}
                <Text style={styles.sectionTitle}>Personal Information</Text>
                <View style={styles.infoCard}>
                  <View style={styles.infoRow}><Text style={styles.infoLabel}>Name</Text><Text style={styles.infoValue}>{selectedApp.courier.firstName} {selectedApp.courier.lastName}</Text></View>
                  <View style={styles.infoRow}><Text style={styles.infoLabel}>Email</Text><Text style={styles.infoValue}>{selectedApp.courier.email}</Text></View>
                  <View style={styles.infoRow}><Text style={styles.infoLabel}>Phone</Text><Text style={styles.infoValue}>{selectedApp.courier.phone}</Text></View>
                  <View style={styles.infoRow}><Text style={styles.infoLabel}>ID Type</Text><Text style={styles.infoValue}>{selectedApp.courier.idType}</Text></View>
                  <View style={[styles.infoRow, { borderBottomWidth: 0 }]}><Text style={styles.infoLabel}>ID Number</Text><Text style={styles.infoValue}>{selectedApp.courier.idNumber}</Text></View>
                </View>

                {/* Vehicle Info */}
                <Text style={styles.sectionTitle}>Vehicle Information</Text>
                <View style={styles.infoCard}>
                  <View style={styles.infoRow}><Text style={styles.infoLabel}>Type</Text><Text style={styles.infoValue}>{selectedApp.vehicle.type}</Text></View>
                  <View style={styles.infoRow}><Text style={styles.infoLabel}>Make</Text><Text style={styles.infoValue}>{selectedApp.vehicle.make}</Text></View>
                  <View style={styles.infoRow}><Text style={styles.infoLabel}>Year</Text><Text style={styles.infoValue}>{selectedApp.vehicle.year}</Text></View>
                  <View style={styles.infoRow}><Text style={styles.infoLabel}>Plate</Text><Text style={styles.infoValue}>{selectedApp.vehicle.licensePlate}</Text></View>
                  <View style={styles.infoRow}><Text style={styles.infoLabel}>Color</Text><Text style={styles.infoValue}>{selectedApp.vehicle.color}</Text></View>
                  <View style={[styles.infoRow, { borderBottomWidth: 0 }]}><Text style={styles.infoLabel}>Zone</Text><Text style={styles.infoValue}>{selectedApp.zone}</Text></View>
                </View>

                {/* Documents */}
                <Text style={styles.sectionTitle}>Documents ({selectedApp.documents.filter((d: any) => d.status !== 'missing').length}/{selectedApp.documents.length})</Text>
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
                      <Text style={styles.docMissing}>⚠ Not yet submitted by courier</Text>
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
            <Text style={styles.rejectSubtitle}>This will be sent to the courier via email.</Text>
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
  filterChip: { paddingHorizontal: 18, paddingVertical: 8, borderRadius: 20, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border },
  filterChipActive: { backgroundColor: colors.navy, borderColor: colors.navy },
  filterText: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
  filterTextActive: { color: colors.white },
  list: { flex: 1, paddingHorizontal: 10, marginTop: 10 },
  appCard: { backgroundColor: colors.white, borderRadius: 16, padding: 14, marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 3, elevation: 1 },
  appCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  appAvatar: { width: 44, height: 44, borderRadius: 14, backgroundColor: colors.navy + '10', justifyContent: 'center', alignItems: 'center' },
  appName: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  appMeta: { fontSize: 12, color: colors.textLight, marginTop: 2 },
  appStatusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  appStatusText: { fontSize: 11, fontWeight: '700', textTransform: 'capitalize' },
  appInfo: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.borderLight },
  appInfoItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  appInfoText: { fontSize: 12, color: colors.textLight },
  appFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 },
  appDate: { fontSize: 12, color: colors.textLight },
  reviewLink: { fontSize: 13, fontWeight: '600', color: colors.navy },
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
