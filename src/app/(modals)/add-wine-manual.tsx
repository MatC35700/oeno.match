import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Modal,
  Switch,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams, useGlobalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { RatingBar } from '@/components/ui/RatingBar';
import { colors, typography, spacing } from '@/theme';
import { useCellarStore } from '@/stores/cellarStore';
import { useUserId } from '@/stores/authStore';
import { REGIONS_BY_COUNTRY, COUNTRY_LABELS, REGION_LABELS } from '@/config/wineRegions';
import { getWineById } from '@/lib/supabase/wines';
import { WINE_COLORS } from '@/config/wineColors';
import type { WineColor, MaturityPhase, Wine } from '@/types/wine';
import type { ScanResult } from '@/lib/gemini/scan';

const currentYear = new Date().getFullYear();
const VINTAGE_YEARS = Array.from({ length: currentYear - 1900 + 1 }, (_, i) => currentYear - i);

const wineSchema = z.object({
  domain_name: z.string().min(1, 'Domaine requis'),
  cuvee_name: z.string().optional(),
  appellation: z.string().optional(),
  color: z.enum(['red', 'white', 'rose', 'yellow', 'orange']),
  country: z.string().min(1, 'Pays requis'),
  region: z.string().min(1, 'Région requise'),
  vintage: z.number().min(1900).max(currentYear + 1),
  quantity: z.number().min(1),
  user_rating: z.number().min(0).max(10).optional(),
  tags: z.array(z.string()).optional(),
  personal_notes: z.string().optional(),
  notes_public: z.boolean().optional(),
  producer_name: z.string().optional(),
  storage_location: z.string().optional(),
  storage_row: z.string().optional(),
});

type WineFormData = z.infer<typeof wineSchema>;

export default function AddWineManualScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const localParams = useLocalSearchParams<{
    id?: string | string[];
    scan?: string | string[];
    labelUri?: string | string[];
  }>();
  const globalParams = useGlobalSearchParams<{
    id?: string | string[];
    scan?: string | string[];
    labelUri?: string | string[];
  }>();
  const id = localParams.id ?? globalParams.id;
  const scanParam = localParams.scan ?? globalParams.scan;
  const labelUriParam = localParams.labelUri ?? globalParams.labelUri;
  const userId = useUserId();
  const addWine = useCellarStore((s) => s.addWine);
  const updateWineStore = useCellarStore((s) => s.updateWine);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [storageExpanded, setStorageExpanded] = useState(false);
  const [saving, setSaving] = useState(false);

  const wineId = typeof id === 'string' ? id : Array.isArray(id) ? id?.[0] : undefined;
  const isEditing = Boolean(wineId);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<WineFormData>({
    resolver: zodResolver(wineSchema),
    defaultValues: {
      domain_name: '',
      cuvee_name: '',
      appellation: '',
      color: 'red',
      country: 'fr',
      region: '',
      vintage: currentYear,
      quantity: 1,
      user_rating: undefined,
      personal_notes: '',
      notes_public: false,
      producer_name: '',
      storage_location: '',
      storage_row: '',
    },
  });

  const country = watch('country');
  const regions = REGIONS_BY_COUNTRY[country] ?? ['others'];
  const currentRegion = watch('region');

  React.useEffect(() => {
    if (regions.length && !regions.includes(currentRegion)) {
      setValue('region', regions[0]);
    }
  }, [country, regions, currentRegion, setValue]);

  React.useEffect(() => {
    if (!scanParam || isEditing) return;
    const raw = Array.isArray(scanParam) ? scanParam[0] : scanParam;
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as ScanResult;
      const normalizedCountry = parsed.country?.toLowerCase().trim();
      const countryEntry = normalizedCountry
        ? Object.entries(COUNTRY_LABELS).find(
            ([, label]) => label.toLowerCase() === normalizedCountry
          )
        : undefined;
      const countryCode = countryEntry?.[0] ?? 'fr';

      reset({
        domain_name: parsed.domain_name ?? '',
        cuvee_name: parsed.cuvee_name ?? '',
        appellation: '',
        color: (parsed.color as WineColor) ?? 'red',
        country: countryCode,
        region: parsed.region ?? '',
        vintage: parsed.vintage ?? currentYear,
        quantity: 1,
        user_rating: undefined,
        personal_notes: '',
        notes_public: false,
        producer_name: parsed.producer_name ?? '',
        storage_location: '',
        storage_row: '',
      });
    } catch {
      // ignore malformed scan param
    }
  }, [scanParam, isEditing, reset]);

  React.useEffect(() => {
    if (isEditing) return;
    const raw = Array.isArray(labelUriParam) ? labelUriParam[0] : labelUriParam;
    if (raw && typeof raw === 'string') {
      setImageUri(raw);
    }
  }, [labelUriParam, isEditing]);

  React.useEffect(() => {
    if (!isEditing || !wineId) return;

    (async () => {
      const { data } = await getWineById(wineId);
      if (!data) return;

      const countryEntry = Object.entries(COUNTRY_LABELS).find(
        ([, label]) => label === data.country
      );
      const countryCode = countryEntry?.[0] ?? 'fr';

      reset({
        domain_name: data.domain_name,
        cuvee_name: data.cuvee_name ?? '',
        appellation: data.appellation ?? '',
        color: data.color,
        country: countryCode,
        region: data.region,
        vintage: data.vintage,
        quantity: data.quantity,
        user_rating: data.user_rating,
        personal_notes: data.personal_notes ?? '',
        notes_public: data.notes_public,
        producer_name: data.producer_name ?? '',
        storage_location: data.storage_location ?? '',
        storage_row: data.storage_row ?? '',
      });
      setTags(data.tags ?? []);
      setImageUri(data.label_image_url ?? null);
    })();
  }, [wineId, isEditing, reset]);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1.5],
      quality: 0.8,
    });
    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const addTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagInput('');
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const removeTag = (i: number) => {
    setTags(tags.filter((_, idx) => idx !== i));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const onSubmit = async (data: WineFormData) => {
    if (!userId) return;
    setSaving(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    if (isEditing && wineId) {
      const updates: Partial<Wine> = {
        domain_name: data.domain_name,
        cuvee_name: data.cuvee_name || undefined,
        appellation: data.appellation || undefined,
        color: data.color,
        country: COUNTRY_LABELS[data.country] ?? data.country,
        region: data.region,
        vintage: data.vintage,
        quantity: data.quantity,
        user_rating: data.user_rating,
        tags: tags.length ? tags : undefined,
        personal_notes: data.personal_notes,
        notes_public: data.notes_public ?? false,
        producer_name: data.producer_name,
        storage_location: data.storage_location,
        storage_row: data.storage_row,
      };
      const cleanUpdates: Partial<Wine> = {};
      (Object.keys(updates) as (keyof Wine)[]).forEach((key) => {
        if (updates[key] !== undefined) {
          (cleanUpdates as Record<string, unknown>)[key] = updates[key];
        }
      });
      const ok = await updateWineStore(wineId, cleanUpdates);
      setSaving(false);
      if (ok.ok) {
        router.back();
      } else {
        Alert.alert(
          t('common.error') || 'Erreur',
          (t('cellar.updateError') || 'Impossible d’enregistrer les modifications. Réessayez.') +
            (ok.error?.message ? `\n\n${ok.error.message}` : '')
        );
      }
      return;
    }

    const wine = await addWine(
      userId,
      {
        domain_name: data.domain_name,
        cuvee_name: data.cuvee_name || undefined,
        appellation: data.appellation || undefined,
        color: data.color,
        country: COUNTRY_LABELS[data.country] ?? data.country,
        region: data.region,
        vintage: data.vintage,
        quantity: data.quantity,
        user_rating: data.user_rating,
        tags: tags.length ? tags : undefined,
        personal_notes: data.personal_notes,
        notes_public: data.notes_public ?? false,
        producer_name: data.producer_name,
        storage_location: data.storage_location,
        storage_row: data.storage_row,
        maturity_phase: 'peak' as MaturityPhase,
        is_wishlist: false,
      },
      imageUri ?? undefined
    );
    setSaving(false);
    if (wine) {
      router.back();
      // Toast would be shown by parent - for now we just go back
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('cellar.addWine')}</Text>
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          style={({ pressed }) => [styles.closeBtn, pressed && styles.closeBtnPressed]}
        >
          <Ionicons name="close" size={24} color={colors.text.secondary} />
        </Pressable>
      </View>

      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.sectionTitle}>{t('wineForm.sectionWine')}</Text>
          <Card style={styles.section}>
            <Controller
              control={control}
              name="domain_name"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label={t('wine.domain')}
                  placeholder="Château Margaux"
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  error={errors.domain_name?.message}
                />
              )}
            />
            <Controller
              control={control}
              name="cuvee_name"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label={t('wine.cuvee')}
                  placeholder={t('wineForm.cuveeOptional')}
                  value={value ?? ''}
                  onBlur={onBlur}
                  onChangeText={onChange}
                />
              )}
            />
            <Text style={styles.label}>{t('wine.color')}</Text>
            <View style={styles.colorRow}>
              {WINE_COLORS.map(({ value: c, hex }) => (
                <Controller
                  key={c}
                  control={control}
                  name="color"
                  render={({ field: { value, onChange } }) => (
                    <Pressable
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        onChange(c);
                      }}
                      style={[
                        styles.colorChip,
                        { backgroundColor: hex },
                        value === c && styles.colorChipSelected,
                      ]}
                    >
                      {value === c && (
                        <Ionicons name="checkmark" size={18} color="#fff" />
                      )}
                    </Pressable>
                  )}
                />
              ))}
            </View>
            <Controller
              control={control}
              name="country"
              render={({ field: { value, onChange } }) => (
                <View style={styles.field}>
                  <Text style={styles.label}>{t('wine.country')}</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={styles.chipRow}>
                      {Object.entries(COUNTRY_LABELS).map(([code, label]) => (
                        <Pressable
                          key={code}
                          onPress={() => {
                            onChange(code);
                            setValue('region', '');
                          }}
                          style={[
                            styles.chip,
                            value === code && styles.chipSelected,
                          ]}
                        >
                          <Text
                            style={[
                              styles.chipText,
                              value === code && styles.chipTextSelected,
                            ]}
                          >
                            {label}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  </ScrollView>
                </View>
              )}
            />
            <Controller
              control={control}
              name="region"
              render={({ field: { value, onChange } }) => (
                <View style={styles.field}>
                  <Text style={styles.label}>{t('wine.region')}</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={styles.chipRow}>
                      {regions.map((r) => (
                        <Pressable
                          key={r}
                          onPress={() => onChange(r)}
                          style={[
                            styles.chip,
                            value === r && styles.chipSelected,
                          ]}
                        >
                          <Text
                            style={[
                              styles.chipText,
                              value === r && styles.chipTextSelected,
                            ]}
                          >
                            {REGION_LABELS[r] ?? r}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  </ScrollView>
                </View>
              )}
            />
            <Controller
              control={control}
              name="appellation"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label={t('wine.appellation')}
                  placeholder={t('wineForm.appellationPlaceholder')}
                  value={value ?? ''}
                  onBlur={onBlur}
                  onChangeText={onChange}
                />
              )}
            />
            <Controller
              control={control}
              name="vintage"
              render={({ field: { value, onChange } }) => (
                <View style={styles.field}>
                  <Text style={styles.label}>{t('wine.vintage')}</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={styles.chipRow}>
                      {VINTAGE_YEARS.slice(0, 30).map((y) => (
                        <Pressable
                          key={y}
                          onPress={() => onChange(y)}
                          style={[
                            styles.chip,
                            value === y && styles.chipSelected,
                          ]}
                        >
                          <Text
                            style={[
                              styles.chipText,
                              value === y && styles.chipTextSelected,
                            ]}
                          >
                            {y}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  </ScrollView>
                </View>
              )}
            />
            <Controller
              control={control}
              name="quantity"
              render={({ field: { value, onChange } }) => (
                <View style={styles.stepperRow}>
                  <Text style={styles.label}>{t('wine.quantity')}</Text>
                  <View style={styles.stepper}>
                    <Pressable
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        onChange(Math.max(1, value - 1));
                      }}
                      style={styles.stepperBtn}
                    >
                      <Ionicons name="remove" size={24} color={colors.accent.primary} />
                    </Pressable>
                    <Text style={styles.stepperValue}>{value}</Text>
                    <Pressable
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        onChange(value + 1);
                      }}
                      style={styles.stepperBtn}
                    >
                      <Ionicons name="add" size={24} color={colors.accent.primary} />
                    </Pressable>
                  </View>
                </View>
              )}
            />
          </Card>

          <Text style={styles.sectionTitle}>{t('wineForm.sectionOpinion')}</Text>
          <Card style={styles.section}>
            <Controller
              control={control}
              name="user_rating"
              render={({ field: { value, onChange } }) => (
                <View style={styles.field}>
                  <Text style={styles.label}>{t('wine.rating')}</Text>
                  <RatingBar
                    value={value ?? 0}
                    onChange={(v) => onChange(v)}
                    height={44}
                    borderRadius={10}
                  />
                  <Text style={styles.ratingValue}>{(value ?? 0).toFixed(1)}/10</Text>
                </View>
              )}
            />
            <View style={styles.field}>
              <Text style={styles.label}>{t('wineForm.tags')}</Text>
              <View style={styles.tagInputRow}>
                <Input
                  placeholder={t('wineForm.addTag')}
                  value={tagInput}
                  onChangeText={setTagInput}
                  onSubmitEditing={addTag}
                />
                <Pressable onPress={addTag} style={styles.addTagBtn}>
                  <Ionicons name="add" size={24} color={colors.accent.primary} />
                </Pressable>
              </View>
              <View style={styles.tagsWrap}>
                {tags.map((tag, i) => (
                  <Pressable
                    key={i}
                    onPress={() => removeTag(i)}
                    style={styles.tagChip}
                  >
                    <Text style={styles.tagChipText}>{tag}</Text>
                    <Ionicons name="close" size={14} color={colors.text.secondary} />
                  </Pressable>
                ))}
              </View>
            </View>
            <Controller
              control={control}
              name="personal_notes"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label={t('wine.personalNotes')}
                  placeholder={t('wineForm.notesPlaceholder')}
                  value={value ?? ''}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  multiline
                  numberOfLines={4}
                />
              )}
            />
            <Controller
              control={control}
              name="notes_public"
              render={({ field: { value, onChange } }) => (
                <View style={styles.switchRow}>
                  <Text style={styles.switchLabel}>{t('wineForm.notesPublic')}</Text>
                  <Switch
                    value={value}
                    onValueChange={onChange}
                    trackColor={{ false: colors.background.tertiary, true: colors.accent.muted }}
                    thumbColor={value ? colors.accent.primary : colors.text.tertiary}
                  />
                </View>
              )}
            />
          </Card>

          <Pressable
            onPress={() => setStorageExpanded(!storageExpanded)}
            style={styles.collapseHeader}
          >
            <Text style={styles.sectionTitle}>{t('wineForm.sectionStorage')}</Text>
            <Ionicons
              name={storageExpanded ? 'chevron-up' : 'chevron-down'}
              size={20}
              color={colors.text.tertiary}
            />
          </Pressable>
          {storageExpanded && (
            <Card style={styles.section}>
              <Controller
                control={control}
                name="producer_name"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label={t('wine.producer')}
                    placeholder="Nom du producteur"
                    value={value ?? ''}
                    onBlur={onBlur}
                    onChangeText={onChange}
                  />
                )}
              />
              <Controller
                control={control}
                name="storage_location"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label={t('wine.storageLocation')}
                    placeholder={t('wineForm.storagePlaceholder')}
                    value={value ?? ''}
                    onBlur={onBlur}
                    onChangeText={onChange}
                  />
                )}
              />
              <Controller
                control={control}
                name="storage_row"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label={t('wine.storageRow')}
                    placeholder="A1, B2..."
                    value={value ?? ''}
                    onBlur={onBlur}
                    onChangeText={onChange}
                  />
                )}
              />
            </Card>
          )}

          <Text style={styles.sectionTitle}>{t('wineForm.sectionPhoto')}</Text>
          <Card style={styles.section}>
            {imageUri ? (
              <View style={styles.imagePreview}>
                <Image
                  source={{ uri: imageUri }}
                  style={styles.previewImg}
                  contentFit="cover"
                />
                <Pressable
                  onPress={() => setImageUri(null)}
                  style={styles.removeImgBtn}
                >
                  <Ionicons name="trash-outline" size={20} color={colors.error} />
                </Pressable>
              </View>
            ) : (
              <Pressable onPress={pickImage} style={styles.addPhotoBtn}>
                <Ionicons name="camera-outline" size={40} color={colors.text.tertiary} />
                <Text style={styles.addPhotoText}>{t('wineForm.addLabelPhoto')}</Text>
              </Pressable>
            )}
          </Card>
        </ScrollView>

        <View style={styles.footer}>
          <Button
            onPress={handleSubmit(onSubmit)}
            fullWidth
            disabled={saving}
          >
            {saving ? '...' : t('common.save')}
          </Button>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.screen,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.background.tertiary,
  },
  title: {
    ...typography.h2,
    color: colors.text.primary,
  },
  closeBtn: {
    padding: spacing.xs,
  },
  closeBtnPressed: {
    opacity: 0.7,
  },
  keyboard: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.screen,
    paddingBottom: 100,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text.primary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  section: {
    marginBottom: spacing.md,
  },
  label: {
    ...typography.label,
    color: colors.text.tertiary,
    marginBottom: spacing.xs,
  },
  field: {
    marginBottom: spacing.lg,
  },
  colorRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  colorChip: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorChipSelected: {
    borderColor: colors.text.primary,
  },
  chipRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    backgroundColor: colors.background.tertiary,
    marginRight: spacing.sm,
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
  stepperRow: {
    marginBottom: spacing.lg,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  stepperBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.background.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperValue: {
    ...typography.h2,
    color: colors.text.primary,
    minWidth: 40,
    textAlign: 'center',
  },
  ratingValue: {
    ...typography.h2,
    color: colors.text.primary,
  },
  tagInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  addTagBtn: {
    padding: spacing.sm,
  },
  tagsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    backgroundColor: colors.background.tertiary,
  },
  tagChipText: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  switchLabel: {
    ...typography.body,
    color: colors.text.secondary,
  },
  collapseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  addPhotoBtn: {
    height: 120,
    borderRadius: 12,
    backgroundColor: colors.background.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.background.tertiary,
    borderStyle: 'dashed',
  },
  addPhotoText: {
    ...typography.bodySmall,
    color: colors.text.tertiary,
    marginTop: spacing.sm,
  },
  imagePreview: {
    position: 'relative',
    height: 150,
    borderRadius: 12,
    overflow: 'hidden',
  },
  previewImg: {
    width: '100%',
    height: '100%',
  },
  removeImgBtn: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    padding: spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 20,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.screen,
    paddingBottom: spacing.xxl + 20,
    backgroundColor: colors.background.primary,
  },
});
