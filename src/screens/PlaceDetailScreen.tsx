import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Image,
  ImageBackground,
  Modal,
  Pressable,
  Share,
  StyleSheet,
  Text,
  View,
  ScrollView,
  Platform,
} from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { BASEL_PLACES } from '../data/placesBasel';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Props = NativeStackScreenProps<RootStackParamList, 'PlaceDetail'>;

const { width: W, height: H } = Dimensions.get('window');
const IS_TINY = H < 700;
const IS_VERY_TINY = H < 640;

const BG = require('../assets/background1.png');

const ICON_SHARE = require('../assets/share.png');
const ICON_SAVE = require('../assets/bookmark.png');
const ICON_MAP = require('../assets/map.png');

const SAVED_KEY = 'basel_saved_places_v1';
const FACTS_BY_TITLE: Record<string, string> = {
  'Basel Minster':
    'Part of the cathedral roof is covered with original medieval tiles that have not been changed for centuries.',
  'Basel Town Hall':
    'In the courtyard of the town hall, you can find frescoes that were created over several centuries by different artists.',
  'Mittlere Brücke':
    'This is where one of the first bridges across the Rhine in the region was located back in the 13th century.',
  'Tinguely Fountain':
    'The fountain was created from scrap metal from an old theater that used to stand on the same site.',
  Spalentor:
    'This is one of the few city gates in Basel that has survived almost unchanged since the Middle Ages.',
  'Botanical Garden of the University of Basel':
    'The garden has been used not only for walks, but also for scientific research for over 400 years.',
  'Zoo Basel':
    'The zoo was the first in the world to successfully breed Indian rhinos in captivity.',
  'Kunstmuseum Basel':
    "The museum's collection is considered the oldest public art collection in the world.",
  'Old Town Basel':
    'The old town has over 300 historic fountains, most of which are still in use.',
  'Roche Tower':
    'The building caused a lot of controversy even before construction began due to its height and modern appearance.',
  'Fondation Beyeler':
    'The museum often changes its exhibitions so that the art interacts with the seasons outside.',
  Elisabethenkirche:
    'The church is often used as an open cultural space, not just as a sacred building.',
  Marktplatz:
    'The market on the square is open almost every day and remains the main shopping destination for locals.',
  'Basel Paper Mill Museum':
    'The museum still produces paper by hand using traditional medieval techniques.',
  'St. Alban Quarter':
    'The district has earned the nickname "Little Venice" due to its system of water canals and mills.',
  'Vitra Campus':
    'Each building on the campus was designed by a different world-famous architect.',
  'Rhine Promenade':
    'In the summer, Basel residents swim en masse on the Rhine, using special waterproof bags.',
  Barfüsserkirche:
    'After the Reformation, the church became one of the first religious sites in the city to be repurposed for cultural events.',
  'Museum Tinguely':
    'Some exhibits are specially designed to make noise and move chaotically.',
  'Three Countries Bridge':
    'Walking across the bridge, you can visit three countries in a few minutes.',
};

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

function makeInterestingFactFallback(text: string): string {
  const t = (text || '').replace(/\s+/g, ' ').trim();
  if (!t) return 'This place is one of the key landmarks in Basel and is worth visiting.';
  return t.length > 200 ? `${t.slice(0, 200)}…` : t;
}

async function readSavedIds(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(SAVED_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.filter((x) => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

async function writeSavedIds(ids: string[]) {
  try {
    await AsyncStorage.setItem(SAVED_KEY, JSON.stringify(ids));
  } catch {}
}

export default function PlaceDetailScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const topPad = Math.max(insets.top, 12);
  const bottomPad = Math.max(insets.bottom, 12);

  const SHIFT_DOWN = 20;

  const place = useMemo(() => {
    return BASEL_PLACES.find((p) => p.id === route.params.placeId) ?? BASEL_PLACES[0];
  }, [route.params.placeId]);

  const [isSaved, setIsSaved] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [showFact, setShowFact] = useState(false);

  const contentW = Math.min(W * 0.92, 430);

  const heroH = Math.min(
    IS_VERY_TINY ? 190 : IS_TINY ? 220 : 250,
    H * (IS_VERY_TINY ? 0.26 : 0.32)
  );

  const coordsLabel = place.coordsText;
  const { latitude, longitude } = useMemo(() => parseCoordsText(coordsLabel), [coordsLabel]);

  const boxH = IS_VERY_TINY ? 190 : IS_TINY ? 210 : 240;

  const fade = useRef(new Animated.Value(0)).current;
  const y = useRef(new Animated.Value(14)).current;
  const scale = useRef(new Animated.Value(0.985)).current;

  useEffect(() => {
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
    ]).start();
  }, [fade, scale, y]);

  useEffect(() => {
    let alive = true;
    (async () => {
      const ids = await readSavedIds();
      if (!alive) return;
      setIsSaved(ids.includes(place.id));
    })();
    return () => {
      alive = false;
    };
  }, [place.id]);

  const onShare = async () => {
    try {
      await Share.share({
        message: `${place.title}\n${coordsLabel}\n\n${place.description}`,
      });
    } catch {}
  };

  const onToggleSave = async () => {
    const next = !isSaved;
    setIsSaved(next);

    const ids = await readSavedIds();
    const updated = next ? Array.from(new Set([...ids, place.id])) : ids.filter((x) => x !== place.id);
    await writeSavedIds(updated);
  };

  const factText = useMemo(() => {
    return FACTS_BY_TITLE[place.title] ?? makeInterestingFactFallback(place.description);
  }, [place.title, place.description]);

  const contentBottomSpace = bottomPad + 10 + (Platform.OS === 'android' ? 8 : 0);

  const FACT_MODAL_H = Math.min(H * (IS_VERY_TINY ? 0.62 : 0.58), IS_VERY_TINY ? 520 : 560);
  const FACT_MODAL_W = Math.min(W * 0.90, 420);

  return (
    <ImageBackground source={BG} style={styles.bg} resizeMode="cover">
      <View
        style={[
          styles.screen,
          {
            paddingTop: topPad + 10 + SHIFT_DOWN,
            paddingBottom: contentBottomSpace,
          },
        ]}
      >
        <Animated.View
          style={[
            styles.topBar,
            {
              width: contentW,
              opacity: fade,
              transform: [{ translateY: y }, { scale }],
            },
          ]}
        >
          <Pressable onPress={() => navigation.goBack()} hitSlop={10} style={styles.backRow}>
            <Text style={styles.backArrow}>←</Text>
            <Text style={styles.backTitle}>Popular place</Text>
          </Pressable>
        </Animated.View>

        <View style={{ height: 12 }} />

        <Animated.View style={{ width: contentW, opacity: fade, transform: [{ translateY: y }] }}>
          <View style={styles.mainCard}>
            <Image source={place.image} style={[styles.hero, { height: heroH }]} />

            <View style={{ paddingHorizontal: 14, paddingTop: 10 }}>
              <View style={styles.titleRow}>
                <Text style={styles.placeTitle} numberOfLines={1}>
                  {place.title}
                </Text>

                <Pressable onPress={() => setShowFact(true)} style={styles.factChip} hitSlop={8}>
                  <Text style={styles.factDot}>●</Text>
                  <Text style={styles.factChipText}>Open fact</Text>
                </Pressable>
              </View>

              <Text style={styles.coords}>{coordsLabel}</Text>

              <View style={{ height: 10 }} />

              <View style={[styles.textOrMapBox, { height: boxH }]}>
                {!showMap ? (
                  <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 10 }}>
                    <Text style={styles.desc}>{place.description}</Text>
                  </ScrollView>
                ) : (
                  <View style={{ flex: 1 }}>
                    <View style={styles.mapBadge}>
                      <Text style={styles.mapBadgeText} numberOfLines={1}>
                        {coordsLabel}
                      </Text>
                    </View>

                    <View style={styles.mapWrap}>
                      <MapView
                        style={StyleSheet.absoluteFill}
                        provider={PROVIDER_DEFAULT}
                        initialRegion={{
                          latitude,
                          longitude,
                          latitudeDelta: 0.035,
                          longitudeDelta: 0.035,
                        }}
                      >
                        <Marker coordinate={{ latitude, longitude }} />
                      </MapView>
                    </View>
                  </View>
                )}
              </View>

              <View style={{ height: 12 }} />

              <View style={styles.actionsRow}>
                <Pressable onPress={onShare} style={styles.actionBtn} hitSlop={8}>
                  <Image source={ICON_SHARE} style={styles.actionIcon} />
                </Pressable>

                <Pressable
                  onPress={onToggleSave}
                  style={[styles.actionBtn, isSaved ? styles.saveBtnOn : styles.saveBtnOff]}
                  hitSlop={8}
                >
                  <Image source={ICON_SAVE} style={styles.actionIcon} />
                </Pressable>
                <Pressable
                  onPress={() => setShowMap((v) => !v)}
                  style={[styles.actionBtn, showMap ? styles.actionBtnActive : null]}
                  hitSlop={8}
                >
                  <Image source={ICON_MAP} style={styles.actionIcon} />
                </Pressable>
              </View>

              <View style={{ height: IS_VERY_TINY ? 12 : 14 }} />
            </View>
          </View>
        </Animated.View>

        <Modal visible={showFact} transparent animationType="fade" onRequestClose={() => setShowFact(false)}>
          <View style={styles.modalWrap}>
            <Animated.View
              style={[
                styles.factModal,
                {
                  width: FACT_MODAL_W,
                  height: FACT_MODAL_H,
                  opacity: fade,
                  transform: [{ translateY: y }, { scale }],
                },
              ]}
            >
              <Text style={styles.factTitle}>Interesting fact</Text>

              <View style={{ height: 20 }} />

              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 10 }}
                style={{ flex: 1 }}
              >
                <Text style={styles.factBody}>{factText}</Text>
              </ScrollView>

              <Pressable onPress={onShare} style={styles.factShareBtn}>
                <Text style={styles.factShareText}>Share</Text>
              </Pressable>

              <Pressable onPress={() => setShowFact(false)} style={styles.factCloseBtn}>
                <Text style={styles.factCloseText}>CLOSE</Text>
              </Pressable>
            </Animated.View>
          </View>
        </Modal>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: '#000' },
  screen: { flex: 1, alignItems: 'center' },

  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start' },
  backRow: { flexDirection: 'row', alignItems: 'center' },
  backArrow: { color: '#fff', fontSize: 22, fontWeight: '900', marginRight: 10 },
  backTitle: { color: '#fff', fontSize: 22, fontWeight: '900' },

  mainCard: {
    borderRadius: 22,
    backgroundColor: 'rgba(60, 0, 0, 0.88)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    overflow: 'hidden',
  },

  hero: { width: '100%', backgroundColor: 'rgba(255,255,255,0.10)' },

  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  placeTitle: {
    flex: 1,
    color: '#fff',
    fontSize: IS_TINY ? 14 : 15,
    fontWeight: '900',
    marginRight: 10,
  },

  factChip: {
    height: 28,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: '#D46AD8',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  factDot: { color: '#000', fontSize: 10, fontWeight: '900', marginRight: 6 },
  factChipText: { color: '#000', fontSize: 12, fontWeight: '900' },

  coords: { color: 'rgba(255,255,255,0.75)', fontSize: 11, fontWeight: '800', marginTop: 6 },

  textOrMapBox: {
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.12)',
    overflow: 'hidden',
    padding: 12,
  },
  desc: {
    color: 'rgba(255,255,255,0.78)',
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 16,
  },

  mapBadge: {
    position: 'absolute',
    zIndex: 2,
    top: 10,
    left: 10,
    right: 10,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  mapBadgeText: { color: 'rgba(255,255,255,0.9)', fontSize: 11, fontWeight: '900' },

  mapWrap: { flex: 1, borderRadius: 16, overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.06)' },

  actionsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', gap: 10 },
  actionBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#F3D34A',
    alignItems: 'center',
    justifyContent: 'center',
  },

  saveBtnOff: { backgroundColor: '#F3D34A' }, 
  saveBtnOn: { backgroundColor: '#D46AD8' }, 
  actionBtnActive: { backgroundColor: '#E7C83A' },

  actionIcon: { width: 22, height: 22, tintColor: '#000' },

  modalWrap: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },

  factModal: {
    borderRadius: 26,
    backgroundColor: 'rgba(60, 0, 0, 0.92)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    padding: IS_VERY_TINY ? 18 : 22,
    paddingTop: IS_VERY_TINY ? 22 : 26,
  },

  factTitle: {
    color: '#fff',
    fontSize: IS_VERY_TINY ? 20 : IS_TINY ? 22 : 24,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 0.3,
  },

  factBody: {
    color: 'rgba(255,255,255,0.86)',
    fontSize: IS_VERY_TINY ? 13.5 : 14.5,
    fontWeight: '700',
    lineHeight: IS_VERY_TINY ? 22 : 24,
    textAlign: 'center',
  },

  factShareBtn: {
    marginTop: 14,
    height: 52,
    borderRadius: 22,
    backgroundColor: '#F3D34A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  factShareText: { color: '#000', fontSize: 16, fontWeight: '900' },

  factCloseBtn: { marginTop: 14, alignItems: 'center', justifyContent: 'center' },
  factCloseText: { color: 'rgba(255,255,255,0.85)', fontSize: 14, fontWeight: '900', letterSpacing: 0.6 },
});
