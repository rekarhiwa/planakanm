import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';

import type { Plan, Category } from '../domain/entities/types';
import * as planRepo from '../data/repositories/planRepository';
import * as categoryRepo from '../data/repositories/categoryRepository';

const EXPORT_VERSION = 1;

export interface ExportData {
  version: number;
  exportedAt: string;
  plans: Plan[];
  categories: Category[];
}

export async function exportPlans(): Promise<string> {
  const plans = await planRepo.getAllActivePlans();
  const categories = await categoryRepo.getAllCategories();

  const data: ExportData = {
    version: EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    plans,
    categories,
  };

  const json = JSON.stringify(data, null, 2);
  const fileUri = `${FileSystem.cacheDirectory}planakanm-backup.json`;
  await FileSystem.writeAsStringAsync(fileUri, json);

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(fileUri, {
      mimeType: 'application/json',
      dialogTitle: 'پلانەکانم - هەناردەکردن',
    });
  }

  return fileUri;
}

export async function importPlans(): Promise<number> {
  const result = await DocumentPicker.getDocumentAsync({
    type: 'application/json',
    copyToCacheDirectory: true,
  });

  if (result.canceled || !result.assets?.[0]) return 0;

  const content = await FileSystem.readAsStringAsync(result.assets[0].uri);
  const data = JSON.parse(content) as ExportData;

  if (!data.plans || !Array.isArray(data.plans)) {
    throw new Error('Invalid backup file');
  }

  let imported = 0;
  for (const plan of data.plans) {
    await planRepo.createPlan({
      title: plan.title,
      description: plan.description,
      date: plan.date,
      time: plan.time,
      hasTime: plan.hasTime,
      priority: plan.priority,
      categoryId: plan.categoryId,
      repeatType: plan.repeatType,
      reminderType: plan.reminderType,
    });
    imported++;
  }

  return imported;
}
