// lib/anonymizationService.ts
// Servicio de anonimización: control de duplicados sin revelar identidad del evaluador

import { createHash } from 'crypto';
import { supabaseAdmin } from './supabase';

/**
 * Computa el hash de control de duplicados para una evaluación.
 * 
 * El hash concatena student_id, professor_id y period_id con ':' como separador
 * para evitar colisiones edge case. Es SHA256 (unidireccional).
 * 
 * Dado el hash, es computacionalmente imposible recuperar los IDs originales.
 * 
 * @param studentId - UUID del estudiante
 * @param professorId - UUID del profesor
 * @param periodId - UUID del período
 * @returns Hash SHA256 en hexadecimal (64 caracteres)
 */
export function computeEvaluationToken(
  studentId: string,
  professorId: string,
  periodId: string
): string {
  return createHash('sha256')
    .update(`${studentId}:${professorId}:${periodId}`)
    .digest('hex');
}

/**
 * Verifica si el estudiante ya evaluó a ese profesor en ese período.
 * 
 * Busca el hash en evaluation_tokens. No hace consulta directa sobre student_id.
 * Solo comprueba si el hash existe.
 * 
 * @param studentId - UUID del estudiante
 * @param professorId - UUID del profesor
 * @param periodId - UUID del período
 * @returns true si NO existe (puede evaluar), false si ya existe (duplicado)
 */
export async function verifyNotDuplicate(
  studentId: string,
  professorId: string,
  periodId: string
): Promise<boolean> {
  try {
    const token = computeEvaluationToken(studentId, professorId, periodId);
    
    const { count, error } = await supabaseAdmin
      .from('evaluation_tokens')
      .select('*', { count: 'exact', head: true })
      .eq('token_hash', token);
    
    if (error) {
      console.error('Error verifying duplicate:', error);
      throw error;
    }
    
    // count > 0 significa ya existe → no puede evaluar (false)
    // count = 0 significa no existe → puede evaluar (true)
    return (count ?? 0) === 0;
  } catch (error) {
    console.error('Failed to verify evaluation token:', error);
    throw error;
  }
}

/**
 * Registra el token de evaluación después del envío exitoso.
 * Se llama después de insertEvaluation para guardar el hash en evaluation_tokens.
 * 
 * @param studentId - UUID del estudiante
 * @param professorId - UUID del profesor
 * @param periodId - UUID del período
 * @throws Error si la inserción falla
 */
export async function recordEvaluationToken(
  studentId: string,
  professorId: string,
  periodId: string
): Promise<void> {
  try {
    const token = computeEvaluationToken(studentId, professorId, periodId);
    
    const { error } = await supabaseAdmin
      .from('evaluation_tokens')
      .insert({
        token_hash: token,
        professor_id: professorId,
        period_id: periodId,
      });
    
    if (error) {
      console.error('Error recording evaluation token:', error);
      throw error;
    }
  } catch (error) {
    console.error('Failed to record evaluation token:', error);
    throw error;
  }
}
