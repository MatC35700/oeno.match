import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { spacing } from '@/theme';

const wineSchema = z.object({
  domain_name: z.string().min(1, 'Domaine requis'),
  cuvee_name: z.string().optional(),
  vintage: z.number().min(1900).max(2030),
  region: z.string().min(1, 'Région requise'),
  country: z.string().min(1, 'Pays requis'),
  quantity: z.number().min(1),
});

export type WineFormData = z.infer<typeof wineSchema>;

interface WineFormProps {
  onSubmit: (data: WineFormData) => void;
  defaultValues?: Partial<WineFormData>;
}

export const WineForm: React.FC<WineFormProps> = ({ onSubmit, defaultValues }) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<WineFormData>({
    resolver: zodResolver(wineSchema),
    defaultValues: {
      domain_name: '',
      vintage: new Date().getFullYear(),
      region: '',
      country: 'France',
      quantity: 1,
      ...defaultValues,
    },
  });

  return (
    <View style={styles.form}>
      <Controller
        control={control}
        name="domain_name"
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            label="Domaine"
            placeholder="Nom du domaine"
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
            label="Cuvée (optionnel)"
            placeholder="Nom de la cuvée"
            value={value ?? ''}
            onBlur={onBlur}
            onChangeText={onChange}
          />
        )}
      />
      <Controller
        control={control}
        name="vintage"
        render={({ field: { onChange, value } }) => (
          <Input
            label="Millésime"
            placeholder="2020"
            keyboardType="number-pad"
            value={value ? String(value) : ''}
            onChangeText={(text) => onChange(Number(text) || 0)}
            error={errors.vintage?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="region"
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            label="Région"
            placeholder="Bordeaux"
            value={value}
            onBlur={onBlur}
            onChangeText={onChange}
            error={errors.region?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="country"
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            label="Pays"
            placeholder="France"
            value={value}
            onBlur={onBlur}
            onChangeText={onChange}
            error={errors.country?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="quantity"
        render={({ field: { onChange, value } }) => (
          <Input
            label="Quantité"
            placeholder="1"
            keyboardType="number-pad"
            value={value ? String(value) : ''}
            onChangeText={(text) => onChange(Number(text) || 1)}
            error={errors.quantity?.message}
          />
        )}
      />
      <Button onPress={handleSubmit(onSubmit)} style={styles.submit}>
        Enregistrer
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  form: {
    gap: 0,
  },
  submit: {
    marginTop: spacing.lg,
  },
});
