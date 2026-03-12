import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImageManipulator from 'expo-image-manipulator';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { colors, typography, spacing, radius, shadows } from '@/theme';
import { scanWineLabel } from '@/lib/gemini/scan';

export default function AddWineScanScreen() {
  const router = useRouter();
  const cameraRef = useRef<CameraView | null>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [capturedUri, setCapturedUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [phaseText, setPhaseText] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!permission) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  const handleCapture = async () => {
    if (!cameraRef.current) return;
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.7, base64: false });
      setCapturedUri(photo.uri);
    } catch {
      // TODO: toast erreur
    }
  };

  const handleAnalyze = async () => {
    if (!capturedUri) return;
    setErrorMessage(null);
    setLoading(true);
    setPhaseText('Lecture de l’étiquette...');
    try {
      const manipulated = await ImageManipulator.manipulateAsync(
        capturedUri,
        [{ resize: { width: 1024 } }],
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG, base64: true }
      );
      const base64 = manipulated.base64 ?? '';

      setPhaseText('Identification du vin...');
      const { data, error } = await scanWineLabel(base64);

      if (!data || error) {
        setErrorMessage(
          error?.message ?? 'Analyse impossible. Vérifie ta connexion ou réessaie avec une autre photo.'
        );
        setLoading(false);
        return;
      }

      setPhaseText('Ouverture du formulaire...');
      setLoading(false);
      router.push({
        pathname: '/(modals)/add-wine-manual',
        params: { scan: JSON.stringify(data), labelUri: capturedUri },
      });
    } catch (err) {
      setLoading(false);
      setErrorMessage(
        err instanceof Error ? err.message : 'Une erreur est survenue. Réessaie.'
      );
    }
  };

  const handleRetake = () => {
    setCapturedUri(null);
    setErrorMessage(null);
  };

  if (!permission || !permission.granted) {
    return (
      <ScreenWrapper>
        <View style={styles.center}>
          <Text style={styles.permissionText}>
            Autorise l’accès à la caméra pour scanner une bouteille.
          </Text>
          <Pressable style={styles.permissionBtn} onPress={requestPermission}>
            <Text style={styles.permissionBtnText}>Autoriser la caméra</Text>
          </Pressable>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <View style={styles.root}>
      {!capturedUri ? (
        <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} />
      ) : (
        <Image source={{ uri: capturedUri }} style={styles.preview} resizeMode="cover" />
      )}

      {/* Cadre de visée */}
      {!capturedUri && (
        <View style={styles.frameOverlay}>
          <View style={styles.frame} />
        </View>
      )}

      {/* Texte d’instruction */}
      {!capturedUri && (
        <View style={styles.topTextWrap}>
          <Text style={styles.topText}>Photographiez l’étiquette de la bouteille</Text>
        </View>
      )}

      {/* Overlay de chargement pendant l’analyse */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color={colors.accent.primary} />
            <Text style={styles.loadingPhaseText}>
              {phaseText ?? 'Analyse en cours...'}
            </Text>
          </View>
        </View>
      )}

      {/* Bottom sheet capture / analyse */}
      <View style={styles.bottomSheet}>
        {loading ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="small" color="#FFF" />
            <Text style={styles.loadingText}>{phaseText ?? 'Analyse en cours...'}</Text>
          </View>
        ) : !capturedUri ? (
          <View style={styles.captureRow}>
            <Pressable
              onPress={handleCapture}
              style={({ pressed }) => [
                styles.shutterOuter,
                pressed && styles.shutterOuterPressed,
              ]}
            >
              <View style={styles.shutterInner} />
            </Pressable>
          </View>
        ) : (
          <View style={styles.actionsColumn}>
            {errorMessage ? (
              <Text style={styles.errorText}>{errorMessage}</Text>
            ) : null}
            <View style={styles.actionsRow}>
              <Pressable style={styles.secondaryBtn} onPress={handleRetake}>
                <Text style={styles.secondaryText}>Reprendre</Text>
              </Pressable>
              <Pressable style={styles.primaryBtn} onPress={handleAnalyze}>
                <Text style={styles.primaryText}>Analyser</Text>
              </Pressable>
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.screen,
  },
  permissionText: {
    ...typography.body,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  permissionBtn: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 999,
    backgroundColor: colors.accent.primary,
  },
  permissionBtnText: {
    ...typography.body,
    color: colors.text.onAccent,
    fontWeight: '600',
  },
  preview: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
  },
  frameOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  frame: {
    width: '70%',
    height: '40%',
    borderRadius: radius.xl,
    borderWidth: 3,
    borderColor: colors.accent.primary,
  },
  topTextWrap: {
    position: 'absolute',
    top: spacing.xl * 1.5,
    left: spacing.screen,
    right: spacing.screen,
  },
  topText: {
    ...typography.body,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  bottomSheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.screen,
    paddingBottom: spacing.xl,
    paddingTop: spacing.lg,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  captureRow: {
    alignItems: 'center',
  },
  shutterOuter: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterOuterPressed: {
    transform: [{ scale: 0.95 }],
    opacity: 0.9,
  },
  shutterInner: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FFFFFF',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    justifyContent: 'center',
  },
  loadingText: {
    ...typography.body,
    color: '#FFFFFF',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  loadingCard: {
    backgroundColor: colors.background.primary,
    borderRadius: 16,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.md,
    minWidth: 220,
  },
  loadingPhaseText: {
    ...typography.body,
    color: colors.text.primary,
    textAlign: 'center',
  },
  actionsColumn: {
    gap: spacing.md,
  },
  errorText: {
    ...typography.body,
    color: '#FF6B6B',
    textAlign: 'center',
    paddingHorizontal: spacing.sm,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  secondaryBtn: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.background.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  secondaryText: {
    ...typography.body,
    color: colors.text.onAccent,
  },
  primaryBtn: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: 999,
    backgroundColor: colors.accent.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.float,
  },
  primaryText: {
    ...typography.body,
    color: colors.text.onAccent,
    fontWeight: '600',
  },
});

