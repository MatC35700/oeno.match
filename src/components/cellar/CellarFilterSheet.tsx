import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors, typography, spacing } from '@/theme';
import { Button } from '@/components/ui/Button';
import type { WineColor, MaturityPhase } from '@/types/wine';
import type { WineSortBy } from '@/lib/supabase/wines';
import { REGION_LABELS } from '@/config/wineRegions';

const WINE_COLORS: { value: WineColor; hex: string }[] = [
  { value: 'red', hex: '#E45545' },
  { value: 'white', hex: '#F5F0EB' },
  { value: 'rose', hex: '#D4758B' },
  { value: 'yellow', hex: '#C98F70' },
  { value: 'orange', hex: '#C47A3A' },
];

const MATURITY_OPTIONS: MaturityPhase[] = ['drink', 'peak', 'wait', 'sleep'];

const SORT_OPTIONS: { value: WineSortBy; labelKey: string }[] = [
  { value: 'created_at_desc', labelKey: 'cellar.sortDateAdded' },
  { value: 'vintage_desc', labelKey: 'cellar.sortVintageDesc' },
  { value: 'vintage_asc', labelKey: 'cellar.sortVintageAsc' },
  { value: 'domain_name', labelKey: 'cellar.sortName' },
  { value: 'updated_at_desc', labelKey: 'cellar.sortUpdated' },
];

const currentYear = new Date().getFullYear();
const VINTAGE_RANGE = Array.from({ length: currentYear - 1900 + 1 }, (_, i) => currentYear - i);

interface CellarFilterSheetProps {
  visible: boolean;
  onClose: () => void;
  colors: WineColor[];
  regions: string[];
  vintageMin?: number;
  vintageMax?: number;
  maturityPhases: MaturityPhase[];
  sortBy: WineSortBy;
  onApply: (filters: {
    colors: WineColor[];
    regions: string[];
    vintageMin?: number;
    vintageMax?: number;
    maturityPhases: MaturityPhase[];
    sortBy: WineSortBy;
  }) => void;
}

export function CellarFilterSheet({
  visible,
  onClose,
  colors: selectedColors,
  regions: selectedRegions,
  vintageMin,
  vintageMax,
  maturityPhases,
  sortBy,
  onApply,
}: CellarFilterSheetProps) {
  const { t } = useTranslation();
  const [localColors, setLocalColors] = React.useState(selectedColors);
  const [localRegions, setLocalRegions] = React.useState(selectedRegions);
  const [localVintageMin, setLocalVintageMin] = React.useState(vintageMin ?? currentYear - 30);
  const [localVintageMax, setLocalVintageMax] = React.useState(vintageMax ?? currentYear);
  const [localMaturity, setLocalMaturity] = React.useState(maturityPhases);
  const [localSort, setLocalSort] = React.useState(sortBy);

  React.useEffect(() => {
    if (visible) {
      setLocalColors(selectedColors);
      setLocalRegions(selectedRegions);
      setLocalVintageMin(vintageMin ?? currentYear - 30);
      setLocalVintageMax(vintageMax ?? currentYear);
      setLocalMaturity(maturityPhases);
      setLocalSort(sortBy);
    }
  }, [visible, selectedColors, selectedRegions, vintageMin, vintageMax, maturityPhases, sortBy]);

  const toggleColor = (c: WineColor) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setLocalColors((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]
    );
  };

  const toggleRegion = (r: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setLocalRegions((prev) =>
      prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r]
    );
  };

  const toggleMaturity = (m: MaturityPhase) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setLocalMaturity((prev) =>
      prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]
    );
  };

  const handleApply = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onApply({
      colors: localColors,
      regions: localRegions,
      vintageMin: localVintageMin,
      vintageMax: localVintageMax,
      maturityPhases: localMaturity,
      sortBy: localSort,
    });
    onClose();
  };

  const allRegions = Object.keys(REGION_LABELS);

  return (
    <Modal visible={visible} transparent animationType="slide">
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <View style={styles.header}>
            <Text style={styles.title}>{t('common.filter')}</Text>
            <Pressable onPress={onClose} hitSlop={12}>
              <Ionicons name="close" size={24} color={colors.text.secondary} />
            </Pressable>
          </View>
          <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
            <Text style={styles.sectionLabel}>{t('wine.color')}</Text>
            <View style={styles.chipRow}>
              {WINE_COLORS.map(({ value, hex }) => (
                <Pressable
                  key={value}
                  onPress={() => toggleColor(value)}
                  style={[
                    styles.colorChip,
                    { backgroundColor: hex },
                    localColors.includes(value) && styles.colorChipSelected,
                  ]}
                >
                  {localColors.includes(value) && (
                    <Ionicons name="checkmark" size={16} color="#fff" />
                  )}
                </Pressable>
              ))}
            </View>

            <Text style={styles.sectionLabel}>{t('wine.region')}</Text>
            <View style={styles.chipRow}>
              {allRegions.slice(0, 12).map((r) => (
                <Pressable
                  key={r}
                  onPress={() => toggleRegion(r)}
                  style={[
                    styles.chip,
                    localRegions.includes(r) && styles.chipSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      localRegions.includes(r) && styles.chipTextSelected,
                    ]}
                  >
                    {REGION_LABELS[r] ?? r}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.sectionLabel}>{t('wine.vintage')}</Text>
            <View style={styles.vintageRow}>
              <Text style={styles.vintageText}>
                {localVintageMin} – {localVintageMax}
              </Text>
            </View>
            <View style={styles.pickerRow}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {VINTAGE_RANGE.slice(0, 20).map((y) => (
                  <Pressable
                    key={y}
                    onPress={() => setLocalVintageMin(y)}
                    style={[
                      styles.vintageChip,
                      localVintageMin === y && styles.chipSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        localVintageMin === y && styles.chipTextSelected,
                      ]}
                    >
                      {y}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>

            <Text style={styles.sectionLabel}>{t('wine.maturity')}</Text>
            <View style={styles.chipRow}>
              {MATURITY_OPTIONS.map((m) => (
                <Pressable
                  key={m}
                  onPress={() => toggleMaturity(m)}
                  style={[
                    styles.chip,
                    localMaturity.includes(m) && styles.chipSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      localMaturity.includes(m) && styles.chipTextSelected,
                    ]}
                  >
                    {t(`maturity.${m}`)}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.sectionLabel}>{t('cellar.sortBy')}</Text>
            <View style={styles.sortRow}>
              {SORT_OPTIONS.map(({ value, labelKey }) => (
                <Pressable
                  key={value}
                  onPress={() => setLocalSort(value)}
                  style={[
                    styles.sortChip,
                    localSort === value && styles.chipSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      localSort === value && styles.chipTextSelected,
                    ]}
                  >
                    {t(labelKey)}
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>
          <View style={styles.footer}>
            <Button onPress={handleApply} fullWidth>
              {t('common.save')}
            </Button>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.background.primary,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.background.tertiary,
  },
  title: {
    ...typography.h3,
    color: colors.text.primary,
  },
  scroll: {
    maxHeight: 400,
    padding: spacing.lg,
  },
  sectionLabel: {
    ...typography.label,
    color: colors.text.tertiary,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    backgroundColor: colors.background.tertiary,
  },
  chipSelected: {
    backgroundColor: colors.accent.muted,
    borderWidth: 1,
    borderColor: colors.accent.primary,
  },
  chipText: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },
  chipTextSelected: {
    color: colors.accent.primary,
  },
  colorChip: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorChipSelected: {
    borderColor: colors.text.primary,
  },
  vintageRow: {
    marginBottom: spacing.sm,
  },
  vintageText: {
    ...typography.body,
    color: colors.text.secondary,
  },
  pickerRow: {
    marginBottom: spacing.md,
  },
  vintageChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    backgroundColor: colors.background.tertiary,
    marginRight: spacing.sm,
  },
  sortRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  sortChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    backgroundColor: colors.background.tertiary,
  },
  footer: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl + 20,
  },
});
