import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '@/config/storage-keys';

export async function hasSeenLanguageScreen(): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(STORAGE_KEYS.HAS_SEEN_LANGUAGE);
    return value === 'true';
  } catch {
    return false;
  }
}

export async function setLanguageScreenSeen(): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.HAS_SEEN_LANGUAGE, 'true');
  } catch {
    // ignore
  }
}
