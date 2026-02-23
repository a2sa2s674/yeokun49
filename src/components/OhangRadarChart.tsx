/**
 * 오행 레이더 차트 (SVG 기반)
 * 오각형 형태, 보라색 배경 + 금색 격자 + 반투명 데이터 영역
 */
import React, { useEffect, useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, {
  Polygon,
  Line,
  Circle as SvgCircle,
  Defs,
  RadialGradient,
  Stop,
  Text as SvgText,
} from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withRepeat,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import type { OhangStats, OhangKey } from '../types';
import { Colors } from '../styles/tokens';

// ── 상수 ──────────────────────────────────────────

/** 오행 배치 순서: 火(상단) → 土(우하) → 水(하단) → 金(좌하) → 木(좌상) */
const OHANG_ORDER: OhangKey[] = ['화', '토', '수', '금', '목'];

const OHANG_ICONS: Record<OhangKey, { emoji: string; label: string }> = {
  화: { emoji: '🔥', label: '火' },
  토: { emoji: '⛰', label: '土' },
  수: { emoji: '💧', label: '水' },
  금: { emoji: '⚔', label: '金' },
  목: { emoji: '🌿', label: '木' },
};

const GRID_LEVELS = [0.25, 0.5, 0.75, 1.0];
const GOLD = '#C9B87A';

// ── 좌표 계산 ─────────────────────────────────────

function getPoint(cx: number, cy: number, radius: number, index: number) {
  const angle = ((2 * Math.PI) / 5) * index - Math.PI / 2;
  return {
    x: cx + radius * Math.cos(angle),
    y: cy + radius * Math.sin(angle),
  };
}

function polygonPoints(cx: number, cy: number, radius: number): string {
  return Array.from({ length: 5 }, (_, i) => {
    const p = getPoint(cx, cy, radius, i);
    return `${p.x},${p.y}`;
  }).join(' ');
}

function dataPoints(
  cx: number, cy: number, maxR: number,
  data: OhangStats, progress: number
): string {
  return OHANG_ORDER.map((key, i) => {
    const v = (data[key] / 100) * progress;
    const r = maxR * Math.max(v, 0.03);
    const p = getPoint(cx, cy, r, i);
    return `${p.x},${p.y}`;
  }).join(' ');
}

// ── 파티클 ────────────────────────────────────────

function SparkleParticle({ x, y, r, delay }: { x: number; y: number; r: number; delay: number }) {
  const opacity = useSharedValue(0.15);

  useEffect(() => {
    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(0.7, { duration: 1200 }),
          withTiming(0.15, { duration: 1200 })
        ),
        -1,
        true
      )
    );
  }, []);

  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          left: x - r,
          top: y - r,
          width: r * 2,
          height: r * 2,
          borderRadius: r,
          backgroundColor: '#FFD700',
        },
        style,
      ]}
    />
  );
}

// ── 메인 컴포넌트 ─────────────────────────────────

interface Props {
  data: OhangStats;
  size?: number;
}

export default function OhangRadarChart({ data, size = 280 }: Props) {
  const cx = size / 2;
  const cy = size / 2;
  const maxR = size * 0.40;
  const pad = size * 0.12;
  const totalSize = size + pad * 2;

  // 진입 애니메이션 progress
  const progress = useSharedValue(0);
  const [progressJS, setProgressJS] = React.useState(0);

  useEffect(() => {
    progress.value = withTiming(1, {
      duration: 1200,
      easing: Easing.out(Easing.cubic),
    });
    // JS 쪽도 동기화 (SVG points는 네이티브 animated 불가하므로)
    let frame: number;
    const start = Date.now();
    const animate = () => {
      const elapsed = Date.now() - start;
      const t = Math.min(elapsed / 1200, 1);
      // cubic ease out
      const p = 1 - Math.pow(1 - t, 3);
      setProgressJS(p);
      if (t < 1) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [data]);

  // 파티클 데이터
  const particles = useMemo(
    () =>
      Array.from({ length: 14 }, () => ({
        x: Math.random() * totalSize,
        y: Math.random() * totalSize,
        r: 1 + Math.random() * 2,
        delay: Math.random() * 2500,
      })),
    [totalSize]
  );

  // 꼭짓점 좌표 (배지 배치용)
  const badgePositions = useMemo(
    () =>
      OHANG_ORDER.map((_, i) => getPoint(cx + pad, cy + pad, maxR + pad * 0.75, i)),
    [cx, cy, maxR, pad]
  );

  return (
    <View style={[styles.wrapper, { width: totalSize, height: totalSize }]}>
      {/* 파티클 */}
      {particles.map((p, i) => (
        <SparkleParticle key={i} x={p.x} y={p.y} r={p.r} delay={p.delay} />
      ))}

      <Svg
        width={totalSize}
        height={totalSize}
        viewBox={`${-pad} ${-pad} ${totalSize} ${totalSize}`}
      >
        <Defs>
          <RadialGradient id="bgGrad" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#2D1B69" />
            <Stop offset="100%" stopColor="#1A0F3C" />
          </RadialGradient>
          <RadialGradient id="dataGrad" cx="50%" cy="30%" r="70%">
            <Stop offset="0%" stopColor="#FF6B35" stopOpacity={0.7} />
            <Stop offset="100%" stopColor="#EF4444" stopOpacity={0.35} />
          </RadialGradient>
        </Defs>

        {/* 배경 원 */}
        <SvgCircle cx={cx} cy={cy} r={maxR * 1.2} fill="url(#bgGrad)" />

        {/* 격자 (금색 오각형 4단계) */}
        {GRID_LEVELS.map((scale, idx) => (
          <Polygon
            key={`g${idx}`}
            points={polygonPoints(cx, cy, maxR * scale)}
            fill="none"
            stroke={GOLD}
            strokeWidth={0.6}
            strokeOpacity={0.35}
          />
        ))}

        {/* 축 라인 */}
        {OHANG_ORDER.map((_, i) => {
          const p = getPoint(cx, cy, maxR, i);
          return (
            <Line
              key={`a${i}`}
              x1={cx} y1={cy} x2={p.x} y2={p.y}
              stroke={GOLD}
              strokeWidth={0.6}
              strokeOpacity={0.35}
            />
          );
        })}

        {/* 데이터 영역 */}
        <Polygon
          points={dataPoints(cx, cy, maxR, data, progressJS)}
          fill="url(#dataGrad)"
          stroke="#FF6B35"
          strokeWidth={1.5}
          strokeOpacity={0.8}
        />

        {/* 데이터 꼭짓점 원 */}
        {OHANG_ORDER.map((key, i) => {
          const v = (data[key] / 100) * progressJS;
          const p = getPoint(cx, cy, maxR * Math.max(v, 0.03), i);
          return (
            <SvgCircle
              key={`d${i}`}
              cx={p.x} cy={p.y} r={3.5}
              fill="#FF6B35"
              stroke="#FFF"
              strokeWidth={1.2}
            />
          );
        })}

        {/* 퍼센트 라벨 */}
        {OHANG_ORDER.map((key, i) => {
          const val = data[key];
          const labelR = maxR * Math.max(val / 100, 0.18) + 12;
          const p = getPoint(cx, cy, labelR, i);
          return (
            <SvgText
              key={`l${i}`}
              x={p.x} y={p.y + 3}
              fill="#FFFFFF"
              fontSize={9}
              fontWeight="600"
              textAnchor="middle"
              opacity={0.85}
            >
              {val <= 10 ? `~${val}%` : `${val}%`}
            </SvgText>
          );
        })}
      </Svg>

      {/* 오행 배지 */}
      {OHANG_ORDER.map((key, i) => {
        const pos = badgePositions[i];
        return (
          <View
            key={`b${i}`}
            style={[
              styles.badge,
              {
                left: pos.x - 22,
                top: pos.y - 22,
                backgroundColor: Colors.ohang[key],
              },
            ]}
          >
            <Text style={styles.badgeEmoji}>{OHANG_ICONS[key].emoji}</Text>
          </View>
        );
      })}

      {/* 오행 한자 라벨 (배지 옆) */}
      {OHANG_ORDER.map((key, i) => {
        const pos = badgePositions[i];
        // 배지 옆 위치 조정
        const offsetX = i === 0 ? 0 : i < 3 ? 28 : -28;
        const offsetY = i === 0 ? -30 : i === 2 ? 30 : 0;
        return (
          <Text
            key={`hl${i}`}
            style={[
              styles.hanjaLabel,
              {
                left: pos.x + offsetX - 12,
                top: pos.y + offsetY - 10,
                color: Colors.ohang[key],
              },
            ]}
          >
            {OHANG_ICONS[key].label}
          </Text>
        );
      })}
    </View>
  );
}

// ── 스타일 ────────────────────────────────────────

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2.5,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  badgeEmoji: {
    fontSize: 18,
  },
  hanjaLabel: {
    position: 'absolute',
    fontSize: 16,
    fontWeight: '800',
  },
});
