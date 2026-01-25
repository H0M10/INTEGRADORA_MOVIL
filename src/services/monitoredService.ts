// ═══════════════════════════════════════════════════════════════════════════
// NOVAGUARDIAN - Servicio de Usuarios Monitoreados
// Gestión de perfiles de adultos mayores
// ═══════════════════════════════════════════════════════════════════════════

import { api } from './api';
import { 
  MonitoredPerson, 
  MedicalCondition,
  EmergencyContact,
  MonitoredPersonForm,
  EmergencyContactForm,
  MedicalConditionForm,
  ApiResponse, 
} from '../types';

// ═══════════════════════════════════════════════════════════════════════════
// SERVICIO DE PERSONAS MONITOREADAS
// ═══════════════════════════════════════════════════════════════════════════

export const monitoredService = {
  // =========================================================================
  // PERSONAS MONITOREADAS (CRUD)
  // =========================================================================

  /**
   * Obtener todas las personas monitoreadas del usuario
   */
  getAll: async (): Promise<MonitoredPerson[]> => {
    const response = await api.get<ApiResponse<MonitoredPerson[]>>('/monitored-persons');
    return response.data.data;
  },

  /**
   * Obtener detalle de una persona monitoreada
   */
  getById: async (id: string): Promise<MonitoredPerson> => {
    const response = await api.get<ApiResponse<MonitoredPerson>>(`/monitored-persons/${id}`);
    return response.data.data;
  },

  /**
   * Alias para getById - compatibilidad con pantallas
   */
  getMonitoredPerson: async (id: string): Promise<MonitoredPerson> => {
    const response = await api.get<ApiResponse<MonitoredPerson>>(`/monitored-persons/${id}`);
    return response.data.data;
  },

  /**
   * Alias para update - compatibilidad con pantallas
   */
  updateMonitoredPerson: async (id: string, data: Partial<MonitoredPersonForm>): Promise<MonitoredPerson> => {
    const response = await api.put<ApiResponse<MonitoredPerson>>(`/monitored-persons/${id}`, data);
    return response.data.data;
  },

  /**
   * Crear nueva persona monitoreada
   */
  create: async (data: MonitoredPersonForm): Promise<MonitoredPerson> => {
    const response = await api.post<ApiResponse<MonitoredPerson>>('/monitored-persons', data);
    return response.data.data;
  },

  /**
   * Actualizar persona monitoreada
   */
  update: async (id: string, data: Partial<MonitoredPersonForm>): Promise<MonitoredPerson> => {
    const response = await api.put<ApiResponse<MonitoredPerson>>(`/monitored-persons/${id}`, data);
    return response.data.data;
  },

  /**
   * Eliminar persona monitoreada
   */
  delete: async (id: string): Promise<void> => {
    await api.delete(`/monitored-persons/${id}`);
  },

  /**
   * Subir foto de persona monitoreada
   */
  uploadPhoto: async (id: string, photoUri: string): Promise<string> => {
    const formData = new FormData();
    formData.append('photo', {
      uri: photoUri,
      type: 'image/jpeg',
      name: 'photo.jpg',
    } as any);

    const response = await api.post<ApiResponse<{ photoUrl: string }>>(
      `/monitored-persons/${id}/photo`,
      formData
    );
    return response.data.data.photoUrl;
  },

  // =========================================================================
  // CONDICIONES MÉDICAS
  // =========================================================================

  /**
   * Obtener condiciones médicas
   */
  getMedicalConditions: async (monitoredId: string): Promise<MedicalCondition[]> => {
    const response = await api.get<ApiResponse<MedicalCondition[]>>(
      `/monitored-persons/${monitoredId}/medical-conditions`
    );
    return response.data.data;
  },

  /**
   * Agregar condición médica
   */
  addMedicalCondition: async (
    monitoredId: string, 
    data: MedicalConditionForm
  ): Promise<MedicalCondition> => {
    const response = await api.post<ApiResponse<MedicalCondition>>(
      `/monitored-persons/${monitoredId}/medical-conditions`,
      data
    );
    return response.data.data;
  },

  /**
   * Actualizar condición médica
   */
  updateMedicalCondition: async (
    monitoredId: string,
    conditionId: string,
    data: Partial<MedicalConditionForm>
  ): Promise<MedicalCondition> => {
    const response = await api.put<ApiResponse<MedicalCondition>>(
      `/monitored-persons/${monitoredId}/medical-conditions/${conditionId}`,
      data
    );
    return response.data.data;
  },

  /**
   * Eliminar condición médica
   */
  deleteMedicalCondition: async (
    monitoredId: string, 
    conditionId: string
  ): Promise<void> => {
    await api.delete(`/monitored-persons/${monitoredId}/medical-conditions/${conditionId}`);
  },

  // =========================================================================
  // MEDICAMENTOS - Nota: endpoint no disponible en backend actual
  // =========================================================================

  /**
   * Obtener medicamentos de una persona
   * TODO: Endpoint no disponible en backend - usar medical-conditions por ahora
   */
  getMedications: async (monitoredId: string): Promise<any[]> => {
    // El backend no tiene endpoint de medications, retornar array vacío
    console.warn('getMedications: endpoint no disponible en backend');
    return [];
  },

  /**
   * Agregar medicamento
   * TODO: Endpoint no disponible en backend - usar medical-conditions por ahora
   */
  addMedication: async (
    monitoredId: string, 
    data: { name: string; dosage?: string; frequency?: string; notes?: string }
  ): Promise<any> => {
    console.warn('addMedication: endpoint no disponible en backend');
    return null;
  },

  /**
   * Eliminar medicamento
   * TODO: Endpoint no disponible en backend - usar medical-conditions por ahora
   */
  deleteMedication: async (
    monitoredId: string, 
    medicationId: string
  ): Promise<void> => {
    console.warn('deleteMedication: endpoint no disponible en backend');
  },

  // =========================================================================
  // CONTACTOS DE EMERGENCIA
  // =========================================================================

  /**
   * Obtener contactos de emergencia
   */
  getEmergencyContacts: async (monitoredId: string): Promise<EmergencyContact[]> => {
    const response = await api.get<ApiResponse<EmergencyContact[]>>(
      `/monitored-persons/${monitoredId}/emergency-contacts`
    );
    return response.data.data;
  },

  /**
   * Agregar contacto de emergencia
   */
  addEmergencyContact: async (
    monitoredId: string, 
    data: EmergencyContactForm
  ): Promise<EmergencyContact> => {
    const response = await api.post<ApiResponse<EmergencyContact>>(
      `/monitored-persons/${monitoredId}/emergency-contacts`,
      data
    );
    return response.data.data;
  },

  /**
   * Actualizar contacto de emergencia
   */
  updateEmergencyContact: async (
    monitoredId: string,
    contactId: string,
    data: Partial<EmergencyContactForm>
  ): Promise<EmergencyContact> => {
    const response = await api.put<ApiResponse<EmergencyContact>>(
      `/monitored-persons/${monitoredId}/emergency-contacts/${contactId}`,
      data
    );
    return response.data.data;
  },

  /**
   * Eliminar contacto de emergencia
   */
  deleteEmergencyContact: async (
    monitoredId: string, 
    contactId: string
  ): Promise<void> => {
    await api.delete(`/monitored-persons/${monitoredId}/emergency-contacts/${contactId}`);
  },

  /**
   * Establecer contacto como primario
   */
  setPrimaryContact: async (
    monitoredId: string, 
    contactId: string
  ): Promise<void> => {
    await api.put(`/monitored-persons/${monitoredId}/emergency-contacts/${contactId}`, { isPrimary: true });
  },
};

export default monitoredService;
