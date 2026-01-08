import React, { useMemo, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Image,
  ImageBackground,
  Pressable,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Information'>;

const { width: W, height: H } = Dimensions.get('window');
const IS_TINY = H < 700;
const IS_VERY_TINY = H < 640;
const IS_NARROW = W < 360;

const BG = require('../assets/background1.png');
const LOGO = require('../assets/logo.png'); 
const GIRL = require('../assets/onboard1.png'); 

export default function InformationScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const fade = useRef(new Animated.Value(0)).current;
  const y = useRef(new Animated.Value(18)).current;
  const scale = useRef(new Animated.Value(0.985)).current;

  const headerFade = useRef(new Animated.Value(0)).current;
  const headerY = useRef(new Animated.Value(10)).current;

  React.useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(headerFade, {
          toValue: 1,
          duration: 260,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(headerY, {
          toValue: 0,
          duration: 380,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(fade, {
          toValue: 1,
          duration: 320,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(y, {
          toValue: 0,
          duration: 520,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          speed: 12,
          bounciness: 6,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [fade, headerFade, headerY, scale, y]);
  const topPad = Math.max(insets.top, 12);
  const bottomPad = Math.max(insets.bottom, 12);
  const SHIFT_DOWN = 20;

  const contentW = Math.min(W * 0.92, 430);
  const cardH = Math.min(
    IS_VERY_TINY ? 390 : IS_TINY ? 420 : 460,
    H * (IS_VERY_TINY ? 0.58 : 0.62)
  );

  const logoSize = IS_NARROW ? 92 : 104;
  const girlW = Math.min(contentW * 0.58, IS_VERY_TINY ? 160 : IS_TINY ? 178 : 195);

  const copy = useMemo(() => {
    return (
      'This app reveals Basel through places,\n' +
      'details and stories that are easy to miss\n' +
      'during a normal walk.\n\n' +
      'It contains iconic locations, a map for\n' +
      'orientation, facts and a short quiz for\n' +
      'those who want to understand the city\n' +
      'more deeply.\n\n' +
      'Everything works simply and focused — no\n' +
      'frills, just the city and your experience.'
    );
  }, []);

  const onShare = async () => {
    try {
      await Share.share({
        message: `Quite Inside in Basel\n\n${copy}`,
      });
    } catch {}
  };

  return (
    <ImageBackground source={BG} style={styles.bg} resizeMode="cover">
      <View
        style={[
          styles.screen,
          {
            paddingTop: topPad + 10 + SHIFT_DOWN,
            paddingBottom: bottomPad + 14,
          },
        ]}
      >
  
        <Animated.View
          style={[
            styles.topBar,
            { width: contentW, opacity: headerFade, transform: [{ translateY: headerY }] },
          ]}
        >
          <Pressable onPress={() => navigation.goBack()} hitSlop={10} style={styles.backRow}>
            <Text style={styles.backArrow}>←</Text>
            <Text style={styles.backTitle}>Information</Text>
          </Pressable>
        </Animated.View>

        <View style={{ height: IS_VERY_TINY ? 10 : 12 }} />
        <Animated.View
          style={[
            styles.card,
            {
              width: contentW,
              height: cardH,
              padding: IS_VERY_TINY ? 14 : IS_TINY ? 16 : 18,
              opacity: fade,
              transform: [{ translateY: y }, { scale }],
            },
          ]}
        >
          <Text style={styles.cardTitle}>ABOUT THE APP</Text>

          <Text style={[styles.bodyText, { marginTop: IS_VERY_TINY ? 10 : 12 }]}>{copy}</Text>

          <View style={{ flex: 1 }} />

          <View style={styles.bottomRow}>
            <Animated.View style={{ opacity: fade, transform: [{ scale }] }}>
              <Image source={LOGO} style={{ width: logoSize, height: logoSize }} resizeMode="contain" />
            </Animated.View>

            <View style={{ flex: 1 }} />

            <Animated.View style={{ opacity: fade, transform: [{ translateY: y }] }}>
              <Image source={GIRL} style={{ width: girlW, height: girlW }} resizeMode="contain" />
            </Animated.View>
          </View>
        </Animated.View>

        <View style={{ height: IS_VERY_TINY ? 12 : 16 }} />
        <Animated.View style={{ width: contentW, opacity: fade, transform: [{ translateY: y }] }}>
          <Pressable onPress={onShare} style={[styles.btn, { height: IS_TINY ? 48 : 54 }]} hitSlop={6}>
            <Text style={styles.btnText}>Share</Text>
          </Pressable>
        </Animated.View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: '#000' },
  screen: { flex: 1, alignItems: 'center' },

  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start' },
  backRow: { flexDirection: 'row', alignItems: 'center' },
  backArrow: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '900',
    marginRight: 10,
  },
  backTitle: {
    color: '#fff',
    fontSize: 22, 
    fontWeight: '900',
  },

  card: {
    borderRadius: 22,
    backgroundColor: 'rgba(60, 0, 0, 0.88)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
  },

  cardTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 0.6,
    marginTop: 6,
  },

  bodyText: {
    color: 'rgba(255,255,255,0.78)',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 16,
  },

  bottomRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingBottom: 2,
  },

  btn: {
    width: '100%',
    borderRadius: 18,
    backgroundColor: '#F3D34A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: { color: '#000', fontSize: 16, fontWeight: '900' },
});
