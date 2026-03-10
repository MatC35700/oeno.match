import React, { useRef, useState, useCallback } from 'react';
import { View, StyleSheet, PanResponder, type LayoutChangeEvent } from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors } from '@/theme';

const SEGMENTS = 10;
const MIN_VALUE = 0;
const MAX_VALUE = 10;

export interface RatingBarProps {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  height?: number;
  borderRadius?: number;
}

export function RatingBar({
  value,
  onChange,
  disabled = false,
  height = 40,
  borderRadius = 10,
}: RatingBarProps) {
  const [width, setWidth] = useState(0);
  const widthRef = useRef(0);
  const lastHapticValue = useRef<number | null>(null);

  const clampValue = useCallback(
    (raw: number) => Math.min(MAX_VALUE, Math.max(MIN_VALUE, Math.round(raw))) as number,
    []
  );

  const getValueFromPosition = useCallback(
    (locationX: number) => {
      const w = widthRef.current;
      if (w <= 0) return value;
      const ratio = locationX / w;
      return clampValue(ratio * SEGMENTS);
    },
    [value, clampValue]
  );

  const handleHaptic = useCallback((newValue: number) => {
    if (lastHapticValue.current !== newValue) {
      lastHapticValue.current = newValue;
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, []);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !disabled,
      onMoveShouldSetPanResponder: () => !disabled,
      onPanResponderGrant: (evt) => {
        if (disabled) return;
        const v = getValueFromPosition(evt.nativeEvent.locationX);
        onChange(v);
        handleHaptic(v);
      },
      onPanResponderMove: (evt) => {
        if (disabled) return;
        const v = getValueFromPosition(evt.nativeEvent.locationX);
        onChange(v);
        handleHaptic(v);
      },
    })
  ).current;

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    const { width: w } = e.nativeEvent.layout;
    widthRef.current = w;
    setWidth(w);
  }, []);

  const filledRatio = width > 0 ? (value / SEGMENTS) * width : 0;

  return (
    <View
      style={[styles.track, { height, borderRadius }]}
      onLayout={onLayout}
      {...panResponder.panHandlers}
    >
      {/* Filled part */}
      <View
        style={[
          styles.filled,
          {
            width: filledRatio,
            height,
            borderTopLeftRadius: borderRadius,
            borderBottomLeftRadius: value > 0 ? 0 : borderRadius,
            borderTopRightRadius: value >= SEGMENTS ? borderRadius : 0,
            borderBottomRightRadius: value >= SEGMENTS ? borderRadius : 0,
          },
        ]}
      />
      {/* Segment dividers */}
      {width > 0 &&
        Array.from({ length: SEGMENTS - 1 }).map((_, i) => {
          const left = ((i + 1) / SEGMENTS) * width;
          return (
            <View
              key={i}
              style={[
                styles.divider,
                {
                  left: left - 0.5,
                  height,
                  opacity: value >= i + 1 ? 0 : 1,
                },
              ]}
              pointerEvents="none"
            />
          );
        })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: '100%',
    backgroundColor: colors.background.tertiary,
    overflow: 'hidden',
    position: 'relative',
  },
  filled: {
    backgroundColor: colors.green.mid,
    position: 'absolute',
    left: 0,
    top: 0,
  },
  divider: {
    position: 'absolute',
    width: 1,
    top: 0,
    backgroundColor: 'rgba(0,0,0,0.08)',
  },
});
