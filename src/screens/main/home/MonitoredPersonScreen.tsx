// ═══════════════════════════════════════════════════════════════════════════
// NOVAGUARDIAN - Pantalla Persona Monitoreada
// Perfil y detalles de la persona monitoreada con funcionalidad completa
// ═══════════════════════════════════════════════════════════════════════════

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { HomeStackParamList } from '../../../types/navigation';
import { colors } from '../../../theme/colors';
import { typography } from '../../../theme/typography';
import { spacing, borderRadius } from '../../../theme/spacing';
import { Card, Header, Avatar, Badge, Loading } from '../../../components/ui';
import { monitoredService } from '../../../services';
import { MonitoredPerson, EmergencyContact, MedicalCondition } from '../../../types';

// ═══════════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════════

type MonitoredPersonScreenProps = {
  navigation: NativeStackNavigationProp<HomeStackParamList, 'MonitoredPerson'>;
  route: RouteProp<HomeStackParamList, 'MonitoredPerson'>;
};

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENTE
// ═══════════════════════════════════════════════════════════════════════════

export const MonitoredPersonScreen: React.FC<MonitoredPersonScreenProps> = ({
  navigation,
  route,
}) => {
  const { personId } = route.params;
  const [person, setPerson] = useState<MonitoredPerson | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Estados para modales
  const [showConditionModal, setShowConditionModal] = useState(false);
  const [showMedicationModal, setShowMedicationModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  
  // Estados para formularios
  const [newCondition, setNewCondition] = useState({ 
    conditionType: 'disease' as const, 
    name: '', 
    notes: '', 
    severity: 'low' as 'low' | 'medium' | 'high' | 'critical' 
  });
  const [newMedication, setNewMedication] = useState({ name: '', dosage: '', frequency: '', notes: '' });
  const [newContact, setNewContact] = useState({ name: '', relationship: '', phone: '', isPrimary: false, notifyAlerts: true });
  const [editData, setEditData] = useState({ firstName: '', lastName: '', dateOfBirth: '', bloodType: '', notes: '' });

  useEffect(() => {
    loadPerson();
  }, [personId]);

  useEffect(() => {
    if (person) {
      setEditData({
        firstName: person.firstName || '',
        lastName: person.lastName || '',
        dateOfBirth: person.dateOfBirth || '',
        bloodType: person.bloodType || '',
        notes: person.notes || '',
      });
    }
  }, [person]);

  const loadPerson = async () => {
    try {
      const data = await monitoredService.getMonitoredPerson(personId);
      setPerson(data);
    } catch (error) {
      console.error('Error loading person:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handlers para agregar datos
  const handleAddCondition = async () => {
    if (!newCondition.name.trim()) {
      Alert.alert('Error', 'El nombre de la condición es requerido');
      return;
    }
    try {
      await monitoredService.addMedicalCondition(personId, {
        conditionType: newCondition.conditionType,
        name: newCondition.name,
        notes: newCondition.notes,
        severity: newCondition.severity,
      });
      Alert.alert('Éxito', 'Condición médica agregada');
      setShowConditionModal(false);
      setNewCondition({ conditionType: 'disease', name: '', notes: '', severity: 'low' });
      loadPerson();
    } catch (error) {
      console.error('Error adding condition:', error);
      Alert.alert('Error', 'No se pudo agregar la condición');
    }
  };

  const handleAddMedication = async () => {
    if (!newMedication.name.trim() || !newMedication.dosage.trim()) {
      Alert.alert('Error', 'El nombre y dosis son requeridos');
      return;
    }
    try {
      await monitoredService.addMedication(personId, newMedication);
      Alert.alert('Éxito', 'Medicamento agregado');
      setShowMedicationModal(false);
      setNewMedication({ name: '', dosage: '', frequency: '', notes: '' });
      loadPerson();
    } catch (error) {
      console.error('Error adding medication:', error);
      Alert.alert('Error', 'No se pudo agregar el medicamento');
    }
  };

  const handleAddContact = async () => {
    if (!newContact.name.trim() || !newContact.phone.trim()) {
      Alert.alert('Error', 'El nombre y teléfono son requeridos');
      return;
    }
    try {
      await monitoredService.addEmergencyContact(personId, {
        name: newContact.name,
        phone: newContact.phone,
        relationship: newContact.relationship,
        isPrimary: newContact.isPrimary,
        notifyAlerts: newContact.notifyAlerts,
      });
      Alert.alert('Éxito', 'Contacto de emergencia agregado');
      setShowContactModal(false);
      setNewContact({ name: '', relationship: '', phone: '', isPrimary: false, notifyAlerts: true });
      loadPerson();
    } catch (error) {
      console.error('Error adding contact:', error);
      Alert.alert('Error', 'No se pudo agregar el contacto');
    }
  };

  const handleEditPerson = async () => {
    if (!editData.firstName.trim()) {
      Alert.alert('Error', 'El nombre es requerido');
      return;
    }
    try {
      await monitoredService.updateMonitoredPerson(personId, {
        name: `${editData.firstName} ${editData.lastName}`.trim(),
        birthDate: editData.dateOfBirth || undefined,
        bloodType: editData.bloodType || undefined,
        notes: editData.notes || undefined,
      });
      Alert.alert('Éxito', 'Información actualizada');
      setShowEditModal(false);
      loadPerson();
    } catch (error) {
      console.error('Error updating person:', error);
      Alert.alert('Error', 'No se pudo actualizar la información');
    }
  };

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Header title="Persona Monitoreada" showBack onBack={() => navigation.goBack()} />
        <Loading fullScreen message="Cargando información..." />
      </View>
    );
  }

  if (!person) {
    return (
      <View style={styles.container}>
        <Header title="Persona Monitoreada" showBack onBack={() => navigation.goBack()} />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={colors.text.tertiary} />
          <Text style={styles.errorText}>No se encontró la información</Text>
        </View>
      </View>
    );
  }

  const calculateAge = (dateOfBirth: string): number => {
    const today = new Date();
    const birth = new Date(dateOfBirth);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <View style={styles.container}>
      <Header
        title="Persona Monitoreada"
        showBack
        onBack={() => navigation.goBack()}
        rightActions={[
          {
            icon: 'create-outline',
            onPress: () => setShowEditModal(true),
          },
        ]}
      />

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Perfil principal */}
        <Card variant="elevated" style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <Avatar
              size="xl"
              name={`${person.firstName} ${person.lastName}`}
              source={person.profilePhoto}
            />
            <Text style={styles.profileName}>
              {person.firstName} {person.lastName}
            </Text>
            <Text style={styles.profileAge}>
              {person.dateOfBirth ? calculateAge(person.dateOfBirth) : '--'} años
            </Text>
          </View>

          <View style={styles.profileDetails}>
            <View style={styles.detailItem}>
              <Ionicons name="calendar-outline" size={20} color={colors.text.tertiary} />
              <Text style={styles.detailText}>
                {person.dateOfBirth 
                  ? new Date(person.dateOfBirth).toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })
                  : 'Fecha no especificada'}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="water-outline" size={20} color={colors.text.tertiary} />
              <Text style={styles.detailText}>
                Tipo de sangre: {person.bloodType || 'No especificado'}
              </Text>
            </View>
          </View>
        </Card>

        {/* Condiciones médicas */}
        <Card variant="elevated" style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Condiciones Médicas</Text>
            <TouchableOpacity onPress={() => setShowConditionModal(true)}>
              <Ionicons name="add-circle" size={24} color={colors.primary[500]} />
            </TouchableOpacity>
          </View>

          {person.medicalConditions && person.medicalConditions.length > 0 ? (
            person.medicalConditions.map((condition, index) => (
              <View key={condition.id || index} style={styles.conditionItem}>
                <View style={styles.conditionIcon}>
                  <Ionicons name="medical" size={20} color={colors.status.warning} />
                </View>
                <View style={styles.conditionInfo}>
                  <Text style={styles.conditionName}>{condition.name}</Text>
                  {condition.notes && (
                    <Text style={styles.conditionNotes}>{condition.notes}</Text>
                  )}
                </View>
                <Badge
                  label={condition.severity === 'high' ? 'Alta' : condition.severity === 'medium' ? 'Media' : 'Baja'}
                  variant="subtle"
                  color={condition.severity === 'high' ? 'error' : condition.severity === 'medium' ? 'warning' : 'success'}
                  size="sm"
                />
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No hay condiciones médicas registradas</Text>
          )}
        </Card>

        {/* Medicamentos */}
        <Card variant="elevated" style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Medicamentos</Text>
            <TouchableOpacity onPress={() => setShowMedicationModal(true)}>
              <Ionicons name="add-circle" size={24} color={colors.primary[500]} />
            </TouchableOpacity>
          </View>

          {person.medications && person.medications.length > 0 ? (
            person.medications.map((med, index) => (
              <View key={index} style={styles.medicationItem}>
                <View style={styles.medicationIcon}>
                  <Ionicons name="medkit" size={20} color={colors.primary[500]} />
                </View>
                <View style={styles.medicationInfo}>
                  <Text style={styles.medicationName}>{med.name}</Text>
                  <Text style={styles.medicationDosage}>{med.dosage} - {med.frequency}</Text>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No hay medicamentos registrados</Text>
          )}
        </Card>

        {/* Contactos de emergencia */}
        <Card variant="elevated" style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Contactos de Emergencia</Text>
            <TouchableOpacity onPress={() => setShowContactModal(true)}>
              <Ionicons name="add-circle" size={24} color={colors.primary[500]} />
            </TouchableOpacity>
          </View>

          {person.emergencyContacts && person.emergencyContacts.length > 0 ? (
            person.emergencyContacts.map((contact, index) => (
              <TouchableOpacity key={contact.id || index} style={styles.contactItem}>
                <Avatar
                  size="sm"
                  name={contact.name}
                />
                <View style={styles.contactInfo}>
                  <Text style={styles.contactName}>{contact.name}</Text>
                  <Text style={styles.contactRelation}>{contact.relationship}</Text>
                </View>
                <TouchableOpacity style={styles.callButton} onPress={() => handleCall(contact.phone)}>
                  <Ionicons name="call" size={20} color={colors.secondary[500]} />
                </TouchableOpacity>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.emptyText}>No hay contactos de emergencia</Text>
          )}
        </Card>

        {/* Notas adicionales */}
        {person.notes && (
          <Card variant="outlined" style={styles.notesCard}>
            <Text style={styles.notesTitle}>Notas adicionales</Text>
            <Text style={styles.notesText}>{person.notes}</Text>
          </Card>
        )}

        {/* Espaciado inferior */}
        <View style={{ height: spacing.xxl }} />
      </ScrollView>

      {/* Modal Agregar Condición Médica */}
      <Modal
        visible={showConditionModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowConditionModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Agregar Condición Médica</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Nombre de la condición *"
              value={newCondition.name}
              onChangeText={(text) => setNewCondition({...newCondition, name: text})}
              placeholderTextColor={colors.text.tertiary}
            />
            
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Notas adicionales"
              value={newCondition.notes}
              onChangeText={(text) => setNewCondition({...newCondition, notes: text})}
              multiline
              numberOfLines={3}
              placeholderTextColor={colors.text.tertiary}
            />
            
            <View style={styles.severityContainer}>
              <Text style={styles.severityLabel}>Severidad:</Text>
              <View style={styles.severityButtons}>
                {(['low', 'medium', 'high'] as const).map((level) => (
                  <TouchableOpacity
                    key={level}
                    style={[
                      styles.severityButton,
                      newCondition.severity === level && styles.severityButtonActive,
                      level === 'low' && { backgroundColor: newCondition.severity === level ? colors.status.success : colors.background.secondary },
                      level === 'medium' && { backgroundColor: newCondition.severity === level ? colors.status.warning : colors.background.secondary },
                      level === 'high' && { backgroundColor: newCondition.severity === level ? colors.status.error : colors.background.secondary },
                    ]}
                    onPress={() => setNewCondition({...newCondition, severity: level})}
                  >
                    <Text style={[styles.severityText, newCondition.severity === level && styles.severityTextActive]}>
                      {level === 'low' ? 'Baja' : level === 'medium' ? 'Media' : 'Alta'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]} 
                onPress={() => setShowConditionModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.saveButton]} 
                onPress={handleAddCondition}
              >
                <Text style={styles.saveButtonText}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal Agregar Medicamento */}
      <Modal
        visible={showMedicationModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowMedicationModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Agregar Medicamento</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Nombre del medicamento *"
              value={newMedication.name}
              onChangeText={(text) => setNewMedication({...newMedication, name: text})}
              placeholderTextColor={colors.text.tertiary}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Dosis (ej: 500mg) *"
              value={newMedication.dosage}
              onChangeText={(text) => setNewMedication({...newMedication, dosage: text})}
              placeholderTextColor={colors.text.tertiary}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Frecuencia (ej: Cada 8 horas)"
              value={newMedication.frequency}
              onChangeText={(text) => setNewMedication({...newMedication, frequency: text})}
              placeholderTextColor={colors.text.tertiary}
            />
            
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Notas adicionales"
              value={newMedication.notes}
              onChangeText={(text) => setNewMedication({...newMedication, notes: text})}
              multiline
              numberOfLines={3}
              placeholderTextColor={colors.text.tertiary}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]} 
                onPress={() => setShowMedicationModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.saveButton]} 
                onPress={handleAddMedication}
              >
                <Text style={styles.saveButtonText}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal Agregar Contacto de Emergencia */}
      <Modal
        visible={showContactModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowContactModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Agregar Contacto de Emergencia</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Nombre completo *"
              value={newContact.name}
              onChangeText={(text) => setNewContact({...newContact, name: text})}
              placeholderTextColor={colors.text.tertiary}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Relación (ej: Hijo, Vecino)"
              value={newContact.relationship}
              onChangeText={(text) => setNewContact({...newContact, relationship: text})}
              placeholderTextColor={colors.text.tertiary}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Teléfono *"
              value={newContact.phone}
              onChangeText={(text) => setNewContact({...newContact, phone: text})}
              keyboardType="phone-pad"
              placeholderTextColor={colors.text.tertiary}
            />

            <TouchableOpacity 
              style={styles.checkboxContainer}
              onPress={() => setNewContact({...newContact, isPrimary: !newContact.isPrimary})}
            >
              <View style={[styles.checkbox, newContact.isPrimary && styles.checkboxChecked]}>
                {newContact.isPrimary && <Ionicons name="checkmark" size={16} color="#fff" />}
              </View>
              <Text style={styles.checkboxLabel}>Contacto principal</Text>
            </TouchableOpacity>

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]} 
                onPress={() => setShowContactModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.saveButton]} 
                onPress={handleAddContact}
              >
                <Text style={styles.saveButtonText}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal Editar Persona */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Editar Información</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Nombre *"
              value={editData.firstName}
              onChangeText={(text) => setEditData({...editData, firstName: text})}
              placeholderTextColor={colors.text.tertiary}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Apellidos"
              value={editData.lastName}
              onChangeText={(text) => setEditData({...editData, lastName: text})}
              placeholderTextColor={colors.text.tertiary}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Fecha de nacimiento (YYYY-MM-DD)"
              value={editData.dateOfBirth}
              onChangeText={(text) => setEditData({...editData, dateOfBirth: text})}
              placeholderTextColor={colors.text.tertiary}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Tipo de sangre (ej: O+)"
              value={editData.bloodType}
              onChangeText={(text) => setEditData({...editData, bloodType: text})}
              placeholderTextColor={colors.text.tertiary}
            />
            
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Notas adicionales"
              value={editData.notes}
              onChangeText={(text) => setEditData({...editData, notes: text})}
              multiline
              numberOfLines={3}
              placeholderTextColor={colors.text.tertiary}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]} 
                onPress={() => setShowEditModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.saveButton]} 
                onPress={handleEditPerson}
              >
                <Text style={styles.saveButtonText}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// ESTILOS
// ═══════════════════════════════════════════════════════════════════════════

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.tertiary,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.base,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    ...typography.body,
    color: colors.text.secondary,
    marginTop: spacing.md,
  },
  // Perfil
  profileCard: {
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  profileName: {
    ...typography.h3,
    color: colors.text.primary,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  profileAge: {
    ...typography.body,
    color: colors.text.secondary,
  },
  profileDetails: {
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.ui.divider,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  detailText: {
    ...typography.body,
    color: colors.text.secondary,
    marginLeft: spacing.sm,
  },
  // Secciones
  sectionCard: {
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.text.primary,
  },
  emptyText: {
    ...typography.body,
    color: colors.text.tertiary,
    textAlign: 'center',
    paddingVertical: spacing.md,
  },
  // Condiciones
  conditionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.ui.divider,
  },
  conditionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  conditionInfo: {
    flex: 1,
  },
  conditionName: {
    ...typography.bodyBold,
    color: colors.text.primary,
  },
  conditionNotes: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  // Medicamentos
  medicationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.ui.divider,
  },
  medicationIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  medicationInfo: {
    flex: 1,
  },
  medicationName: {
    ...typography.bodyBold,
    color: colors.text.primary,
  },
  medicationDosage: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  // Contactos
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.ui.divider,
  },
  contactInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  contactName: {
    ...typography.bodyBold,
    color: colors.text.primary,
  },
  contactRelation: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  callButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.secondary[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Notas
  notesCard: {
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  notesTitle: {
    ...typography.bodyBold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  notesText: {
    ...typography.body,
    color: colors.text.secondary,
    lineHeight: 22,
  },
  // Modales
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalContent: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    ...typography.h4,
    color: colors.text.primary,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: colors.ui.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...typography.body,
    color: colors.text.primary,
    backgroundColor: colors.background.secondary,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  severityContainer: {
    marginBottom: spacing.md,
  },
  severityLabel: {
    ...typography.bodyBold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  severityButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  severityButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  severityButtonActive: {
    opacity: 1,
  },
  severityText: {
    ...typography.caption,
    color: colors.text.primary,
  },
  severityTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: colors.primary[500],
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  checkboxChecked: {
    backgroundColor: colors.primary[500],
  },
  checkboxLabel: {
    ...typography.body,
    color: colors.text.primary,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  modalButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.ui.border,
  },
  cancelButtonText: {
    ...typography.bodyBold,
    color: colors.text.secondary,
  },
  saveButton: {
    backgroundColor: colors.primary[500],
  },
  saveButtonText: {
    ...typography.bodyBold,
    color: '#fff',
  },
});

export default MonitoredPersonScreen;
