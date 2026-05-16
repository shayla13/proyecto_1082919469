// lib/evaluationService.ts
// Servicio de evaluaciones: cálculo de promedios y construcción del ranking

import { supabaseAdmin } from './supabase';
import { getSystemConfig } from './dataService';

/**
 * Interfaz para los promedios de un profesor en un período
 */
export interface ProfessorAverages {
  professorId: string;
  professorName: string;
  subject: string;
  department?: string;
  periodId: string;
  totalEvaluations: number;
  avgClarity: number;
  avgMethodology: number;
  avgPunctuality: number;
  avgTreatment: number;
  avgKnowledge: number;
  avgOverall: number;
}

/**
 * Interfaz para un item del ranking público
 */
export interface PublicRankingItem {
  professorId: string;
  professorName: string;
  subject: string;
  department?: string;
  totalEvaluations: number;
  avgClarity: number;
  avgMethodology: number;
  avgPunctuality: number;
  avgTreatment: number;
  avgKnowledge: number;
  avgOverall: number;
}

/**
 * Calcula los promedios por dimensión de un profesor en un período.
 * 
 * Retorna null si:
 * - El profesor no tiene evaluaciones
 * - El profesor tiene < min_evaluations_to_publish evaluaciones
 * 
 * En estos casos, los promedios no se muestran en el ranking público.
 * 
 * @param professorId - UUID del profesor
 * @param periodId - UUID del período
 * @returns Promedios calculados o null si no cumplen los requisitos
 */
export async function calculateAverages(
  professorId: string,
  periodId: string
): Promise<ProfessorAverages | null> {
  try {
    const config = await getSystemConfig();
    const minEvaluations = config.min_evaluations_to_publish ?? 3;
    
    // Consulta la VIEW professor_period_stats
    const { data, error } = await supabaseAdmin
      .from('professor_period_stats')
      .select('*')
      .eq('professor_id', professorId)
      .eq('period_id', periodId)
      .single();
    
    if (error) {
      console.error('Error calculating averages:', error);
      return null;
    }
    
    if (!data || data.total_evaluations < minEvaluations) {
      // No hay suficientes evaluaciones para publicar
      return null;
    }
    
    return {
      professorId: data.professor_id,
      professorName: data.professor_name,
      subject: data.subject,
      department: data.department,
      periodId: data.period_id,
      totalEvaluations: data.total_evaluations,
      avgClarity: data.avg_clarity,
      avgMethodology: data.avg_methodology,
      avgPunctuality: data.avg_punctuality,
      avgTreatment: data.avg_treatment,
      avgKnowledge: data.avg_knowledge,
      avgOverall: data.avg_overall,
    };
  } catch (error) {
    console.error('Failed to calculate averages:', error);
    throw error;
  }
}

/**
 * Construye el ranking público: lista de profesores ordenados por avg_overall DESC.
 * 
 * Solo incluye profesores que tienen >= min_evaluations_to_publish evaluaciones.
 * Filtra profesores inactivos.
 * 
 * @param periodId - UUID del período
 * @returns Array de items del ranking, ordenados por promedio general descendente
 */
export async function buildRanking(periodId: string): Promise<PublicRankingItem[]> {
  try {
    const config = await getSystemConfig();
    const minEvaluations = config.min_evaluations_to_publish ?? 3;
    
    // Consulta la VIEW professor_period_stats con filtros
    const { data, error } = await supabaseAdmin
      .from('professor_period_stats')
      .select('*')
      .eq('period_id', periodId)
      .gte('total_evaluations', minEvaluations)
      .order('avg_overall', { ascending: false, nullsFirst: false });
    
    if (error) {
      console.error('Error building ranking:', error);
      throw error;
    }
    
    if (!data) {
      return [];
    }
    
    return data.map((row) => ({
      professorId: row.professor_id,
      professorName: row.professor_name,
      subject: row.subject,
      department: row.department,
      totalEvaluations: row.total_evaluations,
      avgClarity: row.avg_clarity,
      avgMethodology: row.avg_methodology,
      avgPunctuality: row.avg_punctuality,
      avgTreatment: row.avg_treatment,
      avgKnowledge: row.avg_knowledge,
      avgOverall: row.avg_overall,
    }));
  } catch (error) {
    console.error('Failed to build ranking:', error);
    throw error;
  }
}
