// ═══════════════════════════════════════════════════════════════════════════
// NOVAGUARDIAN - Índice de Servicios
// Exportación centralizada de todos los servicios
// ═══════════════════════════════════════════════════════════════════════════

export { api, default as apiClient } from './api';
export { authService } from './authService';
export { deviceService } from './deviceService';
export { alertService } from './alertService';
export { monitoredService } from './monitoredService';
export { notificationService } from './notificationService';
// Nota: simulationService eliminado - ahora usamos datos reales del backend
