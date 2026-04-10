import fs from 'fs/promises';
import path from 'path';
import { z } from 'zod';
import type { HomeData, AppConfig } from './types';
import { HomeDataSchema, AppConfigSchema } from './validators';

const DATA_DIR = path.join(process.cwd(), 'data');

/**
 * Lee un archivo JSON de la carpeta /data de forma segura
 * @param filePath - Ruta relativa del archivo (ej: 'config.json' o 'home.json')
 * @returns Contenido parseado del archivo JSON
 */
export async function readJsonFile<T>(filePath: string): Promise<T> {
  try {
    const fullPath = path.join(DATA_DIR, filePath);
    const raw = await fs.readFile(fullPath, 'utf-8');
    return JSON.parse(raw) as T;
  } catch (error) {
    console.error(`Error reading data file: ${filePath}`, error);
    throw error;
  }
}

/**
 * Escribe un archivo JSON en la carpeta /data (server-only)
 * @param filePath - Ruta relativa del archivo
 * @param data - Datos a escribir
 */
export async function writeJsonFile<T>(
  filePath: string,
  data: T
): Promise<void> {
  try {
    const fullPath = path.join(DATA_DIR, filePath);
    await fs.writeFile(fullPath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error(`Error writing data file: ${filePath}`, error);
    throw error;
  }
}

/**
 * Lee y valida el archivo home.json
 */
export async function readHomeData(): Promise<HomeData> {
  const raw = await readJsonFile<unknown>('home.json');
  return HomeDataSchema.parse(raw);
}

/**
 * Lee y valida el archivo config.json
 */
export async function readAppConfig(): Promise<AppConfig> {
  const raw = await readJsonFile<unknown>('config.json');
  return AppConfigSchema.parse(raw);
}
