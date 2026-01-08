import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Image,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View,
  Platform,
} from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT, Region } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { BASEL_PLACES } from '../data/placesBasel';

const { width: W, height: H } = Dimensions.get('window');
const IS_TINY = H < 700;
const IS_VERY_TINY = H < 640;
const IS_NARROW = W < 360;

const BG = require('../assets/background1.png');

type Nav = NativeStackNavigationProp<RootStackParamList>;

function parseCoordsText(coordsText: string): { latitude: number; longitude: number } {
  const clean = (coordsText || '')
    .replace(/°/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  const parts = clean.split(',');
  if (parts.length < 2) return { latitude: 47.5584, longitude: 7.5733 };

  const latPart = parts[0].trim();
  const lonPart = parts[1].trim();

  const latNum = parseFloat(latPart);
  const lonNum = parseFloat(lonPart);

  const latSign = latPart.toUpperCase().includes('S') ? -1 : 1;
  const lonSign = lonPart.toUpperCase().includes('W') ? -1 : 1;

  return {
    latitude: (isNaN(latNum) ? 47.5584 : latNum) * latSign,
    longitude: (isNaN(lonNum) ? 7.5733 : lonNum) * lonSign,
  };
}

function makeRegion(lat: number, lon: number, delta: number): Region {
  return {
    latitude: lat,
    longitude: lon,
    latitudeDelta: delta,
    longitudeDelta: delta,
  };
}

export default function InteractiveMapScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();

  const topPad = Math.max(insets.top, 12);
  const bottomPad = Math.max(insets.bottom, 12);
  const SHIFT_DOWN = 20;

  const contentW = Math.min(W * 0.92, 430);
  const mapH = Math.min(H * (IS_VERY_TINY ? 0.62 : IS_TINY ? 0.66 : 0.68), IS_VERY_TINY ? 520 : 620);

  const mapRef = useRef<MapView | null>(null);

  const places = useMemo(() => {
    return BASEL_PLACES.map((p) => {
      const { latitude, longitude } = parseCoordsText(p.coordsText);
      return { ...p, latitude, longitude };
    });
  }, []);

  const initialCenter = useMemo(() => {
    if (!places.length) return { latitude: 47.5584, longitude: 7.5733 };
    const lat = places.reduce((a, p) => a + p.latitude, 0) / places.length;
    const lon = places.reduce((a, p) => a + p.longitude, 0) / places.length;
    return { latitude: lat, longitude: lon };
  }, [places]);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = useMemo(() => places.find((p) => p.id === selectedId) ?? null, [places, selectedId]);

  const [delta, setDelta] = useState<number>(0.055);
  const ignoreNextMapPressUntil = useRef<number>(0);

  const fade = useRef(new Animated.Value(0)).current;
  const y = useRef(new Animated.Value(14)).current;
  const scale = useRef(new Animated.Value(0.985)).current;

  const cardAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 340,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(y, {
        toValue: 0,
        duration: 560,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        speed: 12,
        bounciness: 6,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fade, y, scale]);

  useEffect(() => {
    Animated.timing(cardAnim, {
      toValue: selected ? 1 : 0,
      duration: selected ? 220 : 180,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [selected, cardAnim]);

  const closeCard = () => setSelectedId(null);

  const onMapPress = () => {
    const now = Date.now();
    if (now < ignoreNextMapPressUntil.current) return;
    closeCard();
  };

  const focusAll = () => {
    setDelta(0.055);
    mapRef.current?.animateToRegion(makeRegion(initialCenter.latitude, initialCenter.longitude, 0.055), 520);
    closeCard();
  };

  const zoomIn = () => {
    const next = Math.max(0.008, delta * 0.7);
    setDelta(next);
    const center = selected
      ? { latitude: selected.latitude, longitude: selected.longitude }
      : { latitude: initialCenter.latitude, longitude: initialCenter.longitude };
    mapRef.current?.animateToRegion(makeRegion(center.latitude, center.longitude, next), 320);
  };

  const zoomOut = () => {
    const next = Math.min(0.25, delta * 1.35);
    setDelta(next);
    const center = selected
      ? { latitude: selected.latitude, longitude: selected.longitude }
      : { latitude: initialCenter.latitude, longitude: initialCenter.longitude };
    mapRef.current?.animateToRegion(makeRegion(center.latitude, center.longitude, next), 320);
  };

  const onMarkerPress = (id: string) => {
    ignoreNextMapPressUntil.current = Date.now() + 350;

    const p = places.find((x) => x.id === id);
    if (!p) return;

    setSelectedId(p.id);

    const tight = Math.max(0.012, Math.min(0.03, delta));
    setDelta(tight);
    mapRef.current?.animateToRegion(makeRegion(p.latitude, p.longitude, tight), 420);
  };

  const onOpen = () => {
    if (!selected) return;
    navigation.navigate('PlaceDetail', { placeId: selected.id });
  };

  const cardTranslateY = cardAnim.interpolate({ inputRange: [0, 1], outputRange: [-10, 0] });
  const cardScale = cardAnim.interpolate({ inputRange: [0, 1], outputRange: [0.985, 1] });

  const contentBottomSpace = bottomPad + 10 + (Platform.OS === 'android' ? 8 : 0);

  const imgSize = IS_VERY_TINY ? (IS_NARROW ? 78 : 84) : IS_NARROW ? 84 : 92;

  return (
    <ImageBackground source={BG} style={styles.bg} resizeMode="cover">
      <View style={[styles.screen, { paddingTop: topPad + 10 + SHIFT_DOWN, paddingBottom: contentBottomSpace }]}>
        <Animated.View
          style={[
            styles.topBar,
            {
              width: contentW,
              opacity: fade,
              transform: [{ translateY: y }, { scale }],
              marginBottom: IS_VERY_TINY ? 10 : 14,
            },
          ]}
        >
          <Text style={styles.title}>Interactive map</Text>
        </Animated.View>

        <Animated.View
          style={[
            styles.mapCard,
            {
              width: contentW,
              height: mapH,
              opacity: fade,
              transform: [{ translateY: y }],
            },
          ]}
        >
          <View style={styles.mapWrap}>
            <MapView
              ref={(r) => {
                mapRef.current = r;
              }}
              style={StyleSheet.absoluteFill}
              provider={PROVIDER_DEFAULT}
              initialRegion={makeRegion(initialCenter.latitude, initialCenter.longitude, delta)}
              onPress={onMapPress}
            >
              {places.map((p) => (
                <Marker
                  key={p.id}
                  coordinate={{ latitude: p.latitude, longitude: p.longitude }}
                  onPress={() => onMarkerPress(p.id)}
                  tracksViewChanges={false}
                />
              ))}
            </MapView>
            <View style={styles.controlsRightCenter}>
              <Pressable onPress={zoomIn} style={styles.ctrlBtn} hitSlop={10}>
                <Text style={styles.ctrlSymbol}>+</Text>
              </Pressable>

              <Pressable onPress={zoomOut} style={styles.ctrlBtn} hitSlop={10}>
                <Text style={styles.ctrlSymbol}>−</Text>
              </Pressable>

              <Pressable onPress={focusAll} style={styles.ctrlBtn} hitSlop={10}>
                <Text style={styles.ctrlBack}>↩</Text>
              </Pressable>
            </View>
            {selected ? (
              <Animated.View
                style={[
                  styles.pinCardTop,
                  {
                    opacity: cardAnim,
                    transform: [{ translateY: cardTranslateY }, { scale: cardScale }],
                  },
                ]}
              >
                <Pressable onPress={closeCard} style={styles.closeX} hitSlop={10}>
                  <Text style={styles.closeXText}>×</Text>
                </Pressable>

                <View style={styles.pinRow}>
                  <View style={[styles.pinImgWrap, { width: imgSize, height: imgSize }]}>
                    <Image source={selected.image} style={styles.pinImg} resizeMode="cover" />
                  </View>

                  <View style={styles.pinMid}>
                    <Text style={styles.pinTitle} numberOfLines={1}>
                      {selected.title}
                    </Text>
                    <Text style={styles.pinCoords} numberOfLines={1}>
                      {selected.coordsText}
                    </Text>
                  </View>

                  <Pressable onPress={onOpen} style={styles.openBtn} hitSlop={8}>
                    <Text style={styles.openText}>Open</Text>
                  </Pressable>
                </View>
              </Animated.View>
            ) : null}
          </View>
        </Animated.View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: '#000' },
  screen: { flex: 1, alignItems: 'center' },

  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start' },
  title: { color: '#fff', fontSize: 22, fontWeight: '900' },

  mapCard: {
    borderRadius: 26,
    backgroundColor: 'rgba(60, 0, 0, 0.88)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    overflow: 'hidden',
  },
  mapWrap: { flex: 1, borderRadius: 24, overflow: 'hidden' },

  controlsRightCenter: {
    position: 'absolute',
    right: IS_VERY_TINY ? 10 : 12,
    top: '50%',
    transform: [{ translateY: -64 }],
    gap: 10,
    alignItems: 'center',
    zIndex: 10,
  },

  ctrlBtn: {
    width: IS_VERY_TINY ? 42 : 44,
    height: IS_VERY_TINY ? 42 : 44,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctrlSymbol: { color: 'rgba(255,255,255,0.95)', fontSize: 22, fontWeight: '900', marginTop: -1 },
  ctrlBack: { color: 'rgba(255,255,255,0.95)', fontSize: 18, fontWeight: '900', marginTop: -1 },

  pinCardTop: {
    position: 'absolute',
    top: IS_VERY_TINY ? 12 : 14,
    left: IS_VERY_TINY ? 12 : 14,
    right: IS_VERY_TINY ? 12 : 14,
    borderRadius: 22,
    backgroundColor: 'rgba(60, 0, 0, 0.90)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    padding: IS_VERY_TINY ? 12 : 14,
    overflow: 'hidden',
    zIndex: 20,
  },

  closeX: {
    position: 'absolute',
    top: 8,
    right: 10,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    zIndex: 30,
  },
  closeXText: { color: 'rgba(255,255,255,0.95)', fontSize: 20, fontWeight: '900', marginTop: -2 },

  pinRow: { flexDirection: 'row', alignItems: 'center' },

  pinImgWrap: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  pinImg: { width: '100%', height: '100%' },

  pinMid: { flex: 1, paddingLeft: 12, paddingRight: 10 },
  pinTitle: { color: '#fff', fontSize: IS_VERY_TINY ? 13.5 : 14, fontWeight: '900' },
  pinCoords: { color: 'rgba(255,255,255,0.72)', fontSize: 11, fontWeight: '800', marginTop: 4 },

  openBtn: {
    height: IS_VERY_TINY ? 38 : 40,
    paddingHorizontal: IS_VERY_TINY ? 16 : 18,
    borderRadius: 18,
    backgroundColor: '#F3D34A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  openText: { color: '#000', fontSize: IS_VERY_TINY ? 13.5 : 14, fontWeight: '900' },
});
