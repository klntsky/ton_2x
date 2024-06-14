import { ru } from '..';
import type { TDeepTypeInObject } from '../../types';

export const loadLocalizationResources = async (
  language: string,
): Promise<TDeepTypeInObject<typeof ru, string>> => {
  switch (language) {
    case 'ru':
      return (await import('../ru')).ru;
    default:
      return (await import('../en')).en;
  }
};
