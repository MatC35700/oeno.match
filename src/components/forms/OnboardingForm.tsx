import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Button } from '@/components/ui/Button';
import { colors, typography, spacing } from '@/theme';

interface OnboardingQuestion {
  id: string;
  question: string;
  options?: string[];
  type: 'text' | 'single' | 'multi';
}

interface OnboardingFormProps {
  questions: OnboardingQuestion[];
  currentStep: number;
  onNext: (answer: string | string[]) => void;
  onBack?: () => void;
}

export const OnboardingForm: React.FC<OnboardingFormProps> = ({
  questions,
  currentStep,
  onNext,
  onBack,
}) => {
  const question = questions[currentStep];
  if (!question) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.question}>{question.question}</Text>
      {question.options?.map((opt) => (
        <Button
          key={opt}
          variant="secondary"
          onPress={() => onNext(opt)}
          style={styles.option}
        >
          {opt}
        </Button>
      ))}
      {onBack && (
        <Button variant="ghost" onPress={onBack} style={styles.back}>
          Retour
        </Button>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  question: {
    ...typography.h2,
    color: colors.text.primary,
    marginBottom: spacing.lg,
  },
  option: {
    marginBottom: spacing.sm,
  },
  back: {
    marginTop: spacing.xl,
  },
});
