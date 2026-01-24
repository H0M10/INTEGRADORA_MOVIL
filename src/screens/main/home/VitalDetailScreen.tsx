// ═══════════════════════════════════════════════════════════════════════════
// NOVAGUARDIAN - Pantalla Detalle de Signos Vitales
// Historial y gráficos EN TIEMPO REAL - DISEÑO MEJORADO
// ═══════════════════════════════════════════════════════════════════════════

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  AppState,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { HomeStackParamList } from '../../../types/navigation';
import { colors, getVitalStatusColor } from '../../../theme/colors';
import { typography } from '../../../theme/typography';
import { spacing, borderRadius } from '../../../theme/spacing';
import { Card, Header, Loading } from '../../../components/ui';
import { useDeviceStore } from '../../../stores';
import { VitalSigns } from '../../../types';

// ═══════════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════════

type VitalDetailScreenProps = {
  navigation: NativeStackNavigationProp<HomeStackParamList, 'VitalDetail'>;
  route: RouteProp<HomeStackParamList, 'VitalDetail'>;
};

type TimeRange = 'live' | '1h' | '6h' | '24h' | '7d' | '30d';

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURACIÓN
// ═══════════════════════════════════════════════════════════════════════════

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_WIDTH = SCREEN_WIDTH - spacing.base * 2 - spacing.lg * 2;
const UPDATE_INTERVAL = 30000; // 30 segundos

const vitalConfig: Record<string, {
  title: string;
  unit: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  normalRange: { min: number; max: number };
  description: string;
  dataKey: keyof VitalSigns;
}> = {
  heartRate: {
    title: 'Ritmo Cardíaco',
    unit: 'bpm',
    icon: 'heart',
    color: colors.vitals.heartRate,
    normalRange: { min: 60, max: 100 },
    description: 'El ritmo cardíaco normal en reposo es de 60 a 100 latidos por minuto.',
    dataKey: 'heartRate',
  },
  oxygen: {
    title: 'Oxigenación',
    unit: '%',
    icon: 'water',
    color: colors.vitals.oxygen,
    normalRange: { min: 95, max: 100 },
    description: 'Los niveles normales de oxígeno en sangre están entre 95% y 100%.',
    dataKey: 'oxygenLevel',
  },
  temperature: {
    title: 'Temperatura',
    unit: '°C',
    icon: 'thermometer',
    color: colors.vitals.temperature,
    normalRange: { min: 36.1, max: 37.2 },
    description: 'La temperatura corporal normal está entre 36.1°C y 37.2°C.',
    dataKey: 'temperature',
  },
  bloodPressure: {
    title: 'Presión Arterial',
    unit: 'mmHg',
    icon: 'pulse',
    color: colors.vitals.bloodPressure,
    normalRange: { min: 90, max: 140 },
    description: 'La presión arterial normal es menor a 120/80 mmHg.',
    dataKey: 'systolicBp',
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENTE
// ═══════════════════════════════════════════════════════════════════════════

export const VitalDetailScreen: React.FC<VitalDetailScreenProps> = ({
  navigation,
  route,
}) => {
  const { deviceId, vitalType: vitalTypeParam, type } = route.params;
  const vitalType = vitalTypeParam || type || 'heartRate';
  const [selectedRange, setSelectedRange] = useState<TimeRange>('1h');
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  
  const updateInterval = useRef<NodeJS.Timeout | null>(null);
  const appState = useRef(AppState.currentState);

  const { currentVitals, vitalsHistory, fetchVitalsHistory, fetchVitals } = useDeviceStore();
  const config = vitalConfig[vitalType];

  // ═══════════════════════════════════════════════════════════════════════
  // ACTUALIZACIÓN EN TIEMPO REAL
  // ═══════════════════════════════════════════════════════════════════════

  useEffect(() => {
    loadData();
    startAutoUpdate();

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      stopAutoUpdate();
      subscription.remove();
    };
  }, [deviceId]);

  useEffect(() => {
    loadHistory();
  }, [selectedRange]);

  const handleAppStateChange = (nextAppState: string) => {
    if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
      loadData();
      startAutoUpdate();
    } else if (nextAppState.match(/inactive|background/)) {
      stopAutoUpdate();
    }
    appState.current = nextAppState as any;
  };

  const startAutoUpdate = () => {
    stopAutoUpdate();
    updateInterval.current = setInterval(() => {
      fetchVitals(deviceId);
      setLastUpdate(new Date());
    }, UPDATE_INTERVAL);
  };

  const stopAutoUpdate = () => {
    if (updateInterval.current) {
      clearInterval(updateInterval.current);
      updateInterval.current = null;
    }
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        fetchVitals(deviceId),
        loadHistory(),
      ]);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadHistory = async () => {
    try {
      // Mapear rango de tiempo seleccionado al período del backend
      let period: 'day' | 'week' | 'month' = 'day';
      if (selectedRange === '7d') period = 'week';
      else if (selectedRange === '30d') period = 'month';
      // Para 'live', '1h', '6h', '24h' usamos 'day' que trae 24 horas de datos
      
      console.log('📥 Cargando historial:', selectedRange, '-> período:', period);
      await fetchVitalsHistory(deviceId, period);
    } catch (error) {
      console.error('Error loading vitals history:', error);
    }
  };

  // ═══════════════════════════════════════════════════════════════════════
  // HELPER PARA FORMATEAR ETIQUETAS
  // ═══════════════════════════════════════════════════════════════════════

  const formatTimeLabel = (date: Date): string => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const formatDayLabel = (date: Date): string => {
    const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    return days[date.getDay()];
  };

  const formatDateLabel = (date: Date): string => {
    return `${date.getDate()}/${date.getMonth() + 1}`;
  };

  // ═══════════════════════════════════════════════════════════════════════
  // PROCESAR DATOS PARA GRÁFICOS - CORREGIDO
  // ═══════════════════════════════════════════════════════════════════════

  const processedData = useMemo(() => {
    console.log('📊 Procesando historial:', vitalsHistory?.length, 'registros');
    
    // Configuración por rango de tiempo
    // El backend genera datos cada 15 minutos
    const rangeConfig: Record<TimeRange, { 
      maxPoints: number; 
      hoursBack: number;
      labelType: 'time' | 'day' | 'date';
    }> = {
      live: { maxPoints: 4, hoursBack: 1, labelType: 'time' },      // Última hora, 4 puntos
      '1h': { maxPoints: 4, hoursBack: 1, labelType: 'time' },      // Última hora
      '6h': { maxPoints: 6, hoursBack: 6, labelType: 'time' },      // 6 horas
      '24h': { maxPoints: 6, hoursBack: 24, labelType: 'time' },    // 24 horas
      '7d': { maxPoints: 7, hoursBack: 168, labelType: 'day' },     // 7 días
      '30d': { maxPoints: 6, hoursBack: 720, labelType: 'date' },   // 30 días
    };

    const { maxPoints, hoursBack, labelType } = rangeConfig[selectedRange];
    const now = new Date();
    const cutoffTime = new Date(now.getTime() - hoursBack * 60 * 60 * 1000);

    // Si no hay historial, retornar arrays vacíos para mostrar mensaje de "sin datos"
    if (!vitalsHistory || vitalsHistory.length === 0) {
      console.log('⚠️ Sin historial de datos para mostrar');
      return { labels: [], data: [], noData: true };
    }

    // Filtrar datos dentro del rango de tiempo seleccionado
    const filteredHistory = vitalsHistory.filter(item => {
      const itemTime = new Date(item.recordedAt);
      return itemTime >= cutoffTime && itemTime <= now;
    });

    console.log('📊 Datos filtrados:', filteredHistory.length, 'de', vitalsHistory.length);

    if (filteredHistory.length === 0) {
      // No hay datos en el rango, retornar indicador
      console.log('⚠️ Sin datos en el rango seleccionado');
      return { labels: [], data: [], noData: true };
    }

    // Ordenar por fecha ascendente (más antiguo primero)
    const sortedHistory = [...filteredHistory].sort((a, b) => 
      new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime()
    );

    // Tomar muestras distribuidas uniformemente
    const sampleIndices: number[] = [];
    if (sortedHistory.length <= maxPoints) {
      // Usar todos los datos
      for (let i = 0; i < sortedHistory.length; i++) {
        sampleIndices.push(i);
      }
    } else {
      // Distribuir puntos uniformemente
      for (let i = 0; i < maxPoints; i++) {
        const index = Math.floor((i / (maxPoints - 1)) * (sortedHistory.length - 1));
        sampleIndices.push(index);
      }
    }

    const labels: string[] = [];
    const data: number[] = [];

    sampleIndices.forEach(index => {
      const item = sortedHistory[index];
      const itemDate = new Date(item.recordedAt);
      
      // Formatear etiqueta según tipo
      if (labelType === 'time') {
        labels.push(formatTimeLabel(itemDate));
      } else if (labelType === 'day') {
        labels.push(formatDayLabel(itemDate));
      } else {
        labels.push(formatDateLabel(itemDate));
      }
      
      // Obtener valor del vital
      const value = item[config.dataKey as keyof VitalSigns];
      data.push(typeof value === 'number' ? value : 0);
    });

    console.log('📊 Resultado final:', labels, data);

    return { labels, data };
  }, [vitalsHistory, selectedRange, currentVitals, config.dataKey, vitalType]);

  // Calcular estadísticas
  const stats = useMemo(() => {
    const data = processedData.data;
    if (data.length === 0) {
      const current = currentVitals?.[config.dataKey as keyof typeof currentVitals] as number || 0;
      return { min: current, max: current, avg: current };
    }
    
    return {
      min: Math.min(...data),
      max: Math.max(...data),
      avg: data.reduce((a, b) => a + b, 0) / data.length,
    };
  }, [processedData.data, currentVitals, config.dataKey]);

  // Configuración del gráfico MEJORADA
  const chartConfig = {
    backgroundColor: colors.background.secondary,
    backgroundGradientFrom: colors.background.secondary,
    backgroundGradientTo: colors.background.secondary,
    decimalPlaces: vitalType === 'temperature' ? 1 : 0,
    color: () => config.color,
    labelColor: () => colors.text.secondary,
    propsForDots: {
      r: '5',
      strokeWidth: '2',
      stroke: colors.background.primary,
      fill: config.color,
    },
    propsForBackgroundLines: {
      strokeDasharray: '4,4',
      stroke: colors.ui.divider,
      strokeWidth: 1,
    },
    propsForLabels: {
      fontSize: 11,
      fontWeight: '500',
    },
    fillShadowGradientFrom: config.color,
    fillShadowGradientTo: config.color,
    fillShadowGradientOpacity: 0.1,
  };

  // Valor actual
  const currentValue = currentVitals?.[config.dataKey as keyof typeof currentVitals] as number | undefined;
  const statusColor = currentValue
    ? getVitalStatusColor(currentValue, vitalType as any)
    : config.color;

  const timeRanges: { key: TimeRange; label: string; sublabel: string }[] = [
    { key: 'live', label: 'VIVO', sublabel: 'Ahora' },
    { key: '1h', label: '1H', sublabel: '1 Hora' },
    { key: '6h', label: '6H', sublabel: '6 Horas' },
    { key: '24h', label: '24H', sublabel: '1 Día' },
    { key: '7d', label: '7D', sublabel: 'Semana' },
    { key: '30d', label: '30D', sublabel: 'Mes' },
  ];

  // ═══════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════

  return (
    <View style={styles.container}>
      <Header
        title={config.title}
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Valor actual principal */}
        <Card variant="elevated" style={styles.currentValueCard}>
          <View style={styles.currentValueMain}>
            <View style={[styles.iconCircle, { backgroundColor: `${config.color}20` }]}>
              <Ionicons name={config.icon} size={36} color={config.color} />
            </View>
            
            <View style={styles.valueContainer}>
              <Text style={styles.valueLabel}>Valor Actual</Text>
              <View style={styles.valueRow}>
                <Text style={[styles.valueNumber, { color: statusColor }]}>
                  {currentValue !== undefined 
                    ? (vitalType === 'temperature' ? currentValue.toFixed(1) : Math.round(currentValue)) 
                    : '--'}
                </Text>
                <Text style={styles.valueUnit}>{config.unit}</Text>
              </View>
            </View>

            <View style={[styles.statusPill, { backgroundColor: `${statusColor}15` }]}>
              <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
              <Text style={[styles.statusLabel, { color: statusColor }]}>
                {currentValue && currentValue >= config.normalRange.min && currentValue <= config.normalRange.max
                  ? 'Normal'
                  : currentValue && currentValue < config.normalRange.min
                  ? 'Bajo'
                  : 'Alto'}
              </Text>
            </View>
          </View>

          {/* Info en vivo */}
          <View style={styles.liveInfo}>
            <View style={styles.liveBadge}>
              <View style={styles.pulsingDot} />
              <Text style={styles.liveText}>EN VIVO</Text>
            </View>
            <Text style={styles.updateText}>
              Última lectura: {lastUpdate.toLocaleTimeString('es-ES', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </View>

          {/* Rango normal */}
          <View style={styles.rangeInfo}>
            <Ionicons name="checkmark-circle" size={16} color={colors.status.success} />
            <Text style={styles.rangeText}>
              Rango normal: {config.normalRange.min} - {config.normalRange.max} {config.unit}
            </Text>
          </View>
        </Card>

        {/* Selector de período */}
        <View style={styles.periodSelector}>
          <Text style={styles.periodTitle}>Período de tiempo</Text>
          <View style={styles.periodButtons}>
            {timeRanges.map((range) => (
              <TouchableOpacity
                key={range.key}
                style={[
                  styles.periodBtn,
                  selectedRange === range.key && styles.periodBtnActive,
                ]}
                onPress={() => setSelectedRange(range.key)}
              >
                <Text style={[
                  styles.periodBtnText,
                  selectedRange === range.key && styles.periodBtnTextActive,
                ]}>
                  {range.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Gráfico mejorado */}
        <Card variant="elevated" style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>
              Historial - {timeRanges.find(r => r.key === selectedRange)?.sublabel}
            </Text>
            <Text style={styles.chartSubtitle}>
              {processedData.data.length} lecturas
            </Text>
          </View>

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <Loading message="Cargando datos..." />
            </View>
          ) : processedData.noData ? (
            <View style={styles.noDataContainer}>
              <Ionicons name="analytics-outline" size={48} color={colors.text.tertiary} />
              <Text style={styles.noDataText}>Sin datos para este período</Text>
              <Text style={styles.noDataSubtext}>
                Los datos aparecerán cuando el dispositivo envíe lecturas
              </Text>
            </View>
          ) : (
            <View style={styles.chartWrapper}>
              <LineChart
                data={{
                  labels: processedData.labels,
                  datasets: [{
                    data: processedData.data.length > 0 ? processedData.data : [0],
                    color: () => config.color,
                    strokeWidth: 3,
                  }],
                }}
                width={CHART_WIDTH}
                height={200}
                chartConfig={chartConfig}
                bezier
                style={styles.chart}
                withInnerLines
                withOuterLines={false}
                withVerticalLabels
                withHorizontalLabels
                fromZero={false}
                segments={4}
                yAxisInterval={1}
              />
            </View>
          )}
        </Card>

        {/* Estadísticas */}
        <Card variant="elevated" style={styles.statsCard}>
          <Text style={styles.statsTitle}>
            Estadísticas - {timeRanges.find(r => r.key === selectedRange)?.sublabel}
          </Text>
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Ionicons name="arrow-down" size={20} color={colors.status.info} />
              <Text style={styles.statValue}>
                {vitalType === 'temperature' ? stats.min.toFixed(1) : Math.round(stats.min)}
              </Text>
              <Text style={styles.statLabel}>Mínimo</Text>
            </View>
            
            <View style={[styles.statBox, styles.statBoxHighlight]}>
              <Ionicons name="analytics" size={20} color={colors.primary[500]} />
              <Text style={[styles.statValue, { color: colors.primary[600] }]}>
                {vitalType === 'temperature' ? stats.avg.toFixed(1) : Math.round(stats.avg)}
              </Text>
              <Text style={styles.statLabel}>Promedio</Text>
            </View>
            
            <View style={styles.statBox}>
              <Ionicons name="arrow-up" size={20} color={colors.status.warning} />
              <Text style={styles.statValue}>
                {vitalType === 'temperature' ? stats.max.toFixed(1) : Math.round(stats.max)}
              </Text>
              <Text style={styles.statLabel}>Máximo</Text>
            </View>
          </View>
        </Card>

        {/* Información */}
        <Card variant="outlined" style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Ionicons name="information-circle" size={22} color={colors.primary[500]} />
            <Text style={styles.infoTitle}>Información</Text>
          </View>
          <Text style={styles.infoText}>{config.description}</Text>
          
          <View style={styles.connectionInfo}>
            <Ionicons name="wifi" size={16} color={colors.status.success} />
            <Text style={styles.connectionText}>
              Dispositivo conectado vía WiFi/Red celular
            </Text>
          </View>
        </Card>

        <View style={{ height: spacing.xxl * 2 }} />
      </ScrollView>
    </View>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// ESTILOS MEJORADOS
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

  // Valor actual
  currentValueCard: {
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  currentValueMain: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  valueContainer: {
    flex: 1,
    marginLeft: spacing.md,
  },
  valueLabel: {
    ...typography.caption,
    color: colors.text.tertiary,
    marginBottom: 4,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  valueNumber: {
    fontSize: 48,
    fontWeight: '700',
    lineHeight: 54,
  },
  valueUnit: {
    ...typography.body,
    color: colors.text.tertiary,
    marginLeft: 6,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusLabel: {
    ...typography.bodySmall,
    fontWeight: '600',
  },

  // Live info
  liveInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.ui.divider,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.status.success + '15',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  pulsingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.status.success,
    marginRight: 6,
  },
  liveText: {
    ...typography.caption,
    color: colors.status.success,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  updateText: {
    ...typography.caption,
    color: colors.text.tertiary,
  },
  rangeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    paddingTop: spacing.sm,
  },
  rangeText: {
    ...typography.caption,
    color: colors.text.secondary,
    marginLeft: 6,
  },

  // Selector de período
  periodSelector: {
    marginBottom: spacing.md,
  },
  periodTitle: {
    ...typography.caption,
    color: colors.text.tertiary,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  },
  periodButtons: {
    flexDirection: 'row',
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    padding: 4,
  },
  periodBtn: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: borderRadius.md,
  },
  periodBtnActive: {
    backgroundColor: colors.primary[500],
  },
  periodBtnText: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  periodBtnTextActive: {
    color: colors.text.inverse,
  },

  // Gráfico
  chartCard: {
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  chartTitle: {
    ...typography.bodyBold,
    color: colors.text.primary,
  },
  chartSubtitle: {
    ...typography.caption,
    color: colors.text.tertiary,
  },
  chartWrapper: {
    alignItems: 'center',
    marginHorizontal: -spacing.sm,
  },
  chart: {
    borderRadius: borderRadius.md,
  },
  loadingContainer: {
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noDataContainer: {
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
  },
  noDataText: {
    ...typography.bodyBold,
    color: colors.text.secondary,
    marginTop: spacing.md,
  },
  noDataSubtext: {
    ...typography.caption,
    color: colors.text.tertiary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },

  // Estadísticas
  statsCard: {
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  statsTitle: {
    ...typography.bodyBold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
    marginHorizontal: 4,
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
  },
  statBoxHighlight: {
    backgroundColor: colors.primary[50],
  },
  statValue: {
    ...typography.h3,
    color: colors.text.primary,
    marginTop: spacing.xs,
    marginBottom: 2,
  },
  statLabel: {
    ...typography.caption,
    color: colors.text.tertiary,
  },

  // Info
  infoCard: {
    padding: spacing.lg,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  infoTitle: {
    ...typography.bodyBold,
    color: colors.text.primary,
    marginLeft: spacing.sm,
  },
  infoText: {
    ...typography.body,
    color: colors.text.secondary,
    lineHeight: 22,
  },
  connectionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.ui.divider,
  },
  connectionText: {
    ...typography.caption,
    color: colors.text.tertiary,
    marginLeft: spacing.sm,
  },
});

export default VitalDetailScreen;
