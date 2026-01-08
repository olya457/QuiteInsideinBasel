import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  FlatList,
  Image,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { TabsParamList, RootStackParamList } from '../navigation/types';
import { BASEL_PLACES } from '../data/placesBasel';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabsParamList, 'NoSaved'>,
  NativeStackScreenProps<RootStackParamList>
>;

const { width: W, height: H } = Dimensions.get('window');
const IS_TINY = H < 700;
const IS_VERY_TINY = H < 640;
const IS_SHORT = H < 740;

const BG = require('../assets/background1.png');
const SAVED_KEY = 'basel_saved_places_v1';

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

export default function NoSavedScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();

  const topPad = Math.max(insets.top, 12);
  const bottomPad = Math.max(insets.bottom, 12);
  const SHIFT_DOWN = 20;

  const contentW = Math.min(W * 0.92, 430);

  const imgSize = useMemo(() => {
    if (IS_VERY_TINY) return W < 360 ? 68 : 74;
    if (IS_TINY) return W < 360 ? 74 : 82;
    return W < 360 ? 78 : 88;
  }, []);

  const cardMinH = useMemo(() => {
    if (IS_VERY_TINY) return 80;
    if (IS_TINY) return 86;
    return 94;
  }, []);

  const btnH = IS_VERY_TINY ? 38 : 40;
  const btnRadius = IS_VERY_TINY ? 18 : 20;

  const [savedIds, setSavedIds] = useState<string[]>([]);

  const headerAnim = useRef(new Animated.Value(0)).current;
  const listAnim = useRef(new Animated.Value(0)).current;

  const savedPlaces = useMemo(() => {
    const set = new Set(savedIds);
    return BASEL_PLACES.filter((p) => set.has(p.id));
  }, [savedIds]);

  const runIntro = useCallback(() => {
    headerAnim.setValue(0);
    listAnim.setValue(0);

    Animated.parallel([
      Animated.timing(headerAnim, {
        toValue: 1,
        duration: 420,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(listAnim, {
        toValue: 1,
        duration: 560,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [headerAnim, listAnim]);

  useEffect(() => {
    const unsub = navigation.addListener('focus', () => {
      (async () => {
        const ids = await readSavedIds();
        setSavedIds(ids);
        runIntro();
      })();
    });
    return unsub;
  }, [navigation, runIntro]);

  const headerOpacity = headerAnim;
  const headerTranslate = headerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [10, 0],
  });
  const headerScale = headerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.985, 1],
  });

  const listOpacity = listAnim;
  const listTranslate = listAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [14, 0],
  });

  const renderItem = useCallback(
    ({ item, index }: { item: (typeof BASEL_PLACES)[number]; index: number }) => {
      const d = Math.min(0.55, 0.08 * index);

      const itemOpacity = listAnim.interpolate({
        inputRange: [0, d, d + 0.35, 1],
        outputRange: [0, 0, 1, 1],
        extrapolate: 'clamp',
      });

      const itemY = listAnim.interpolate({
        inputRange: [0, d, d + 0.5, 1],
        outputRange: [18, 18, 0, 0],
        extrapolate: 'clamp',
      });

      const itemScale = listAnim.interpolate({
        inputRange: [0, d, d + 0.5, 1],
        outputRange: [0.985, 0.985, 1, 1],
        extrapolate: 'clamp',
      });

      return (
        <Animated.View style={{ opacity: itemOpacity, transform: [{ translateY: itemY }, { scale: itemScale }] }}>
          <View style={[styles.card, { minHeight: cardMinH }]}>
            <View style={[styles.imgWrap, { width: imgSize, height: imgSize, borderRadius: 16 }]}>
              <Image source={item.image} style={styles.cardImg} resizeMode="cover" />
            </View>

            <View style={styles.cardMid}>
              <Text style={styles.cardTitle} numberOfLines={1}>
                {item.title}
              </Text>
              <Text style={styles.cardCoords} numberOfLines={1}>
                {item.coordsText}
              </Text>
            </View>

            <Pressable
              onPress={() => navigation.navigate('PlaceDetail', { placeId: item.id })}
              style={[styles.openBtn, { height: btnH, borderRadius: btnRadius }]}
              hitSlop={8}
            >
              <Text style={styles.openText}>Open</Text>
            </Pressable>
          </View>
        </Animated.View>
      );
    },
    [btnH, btnRadius, cardMinH, imgSize, listAnim, navigation]
  );

  const titleFont = IS_VERY_TINY ? 20 : 22;
  const emptyFont = IS_VERY_TINY ? 14 : 16;

  const headerTopPadding = topPad + (IS_SHORT ? 6 : 10) + SHIFT_DOWN;

  return (
    <ImageBackground source={BG} style={styles.bg} resizeMode="cover">
      <View style={[styles.screen, { paddingTop: headerTopPadding, paddingBottom: bottomPad + 10 }]}>
        <Animated.View
          style={[
            styles.topBar,
            {
              width: contentW,
              opacity: headerOpacity,
              transform: [{ translateY: headerTranslate }, { scale: headerScale }],
              marginBottom: IS_VERY_TINY ? 10 : 14,
            },
          ]}
        >
          <Text style={[styles.title, { fontSize: titleFont }]}>Saved places</Text>
        </Animated.View>

        {savedPlaces.length === 0 ? (
          <Animated.View
            style={[
              styles.emptyCenter,
              {
                opacity: listOpacity,
                transform: [{ translateY: listTranslate }],
                paddingBottom: bottomPad + 8,
              },
            ]}
          >
            <Text style={[styles.emptyText, { fontSize: emptyFont }]}>No saved places...</Text>
          </Animated.View>
        ) : (
          <Animated.View
            style={{
              width: contentW,
              flex: 1,
              opacity: listOpacity,
              transform: [{ translateY: listTranslate }],
            }}
          >
            <FlatList
              data={savedPlaces}
              keyExtractor={(it) => it.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: bottomPad + 18 }}
              ItemSeparatorComponent={() => <View style={{ height: IS_VERY_TINY ? 10 : 12 }} />}
              renderItem={renderItem}
              removeClippedSubviews={Platform.OS === 'android'}
              initialNumToRender={8}
              maxToRenderPerBatch={10}
              windowSize={10}
            />
          </Animated.View>
        )}
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: '#000' },
  screen: { flex: 1, alignItems: 'center' },

  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  title: { color: '#fff', fontWeight: '900', textAlign: 'center' },

  emptyCenter: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: 'rgba(255,255,255,0.82)',
    fontWeight: '800',
    textAlign: 'center',
  },

  card: {
    width: '100%',
    borderRadius: 22,
    backgroundColor: 'rgba(60, 0, 0, 0.88)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    paddingRight: IS_VERY_TINY ? 10 : 12,
    paddingVertical: IS_VERY_TINY ? 9 : 10,
  },

  imgWrap: {
    marginLeft: IS_VERY_TINY ? 10 : 10,
    backgroundColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  cardImg: { width: '100%', height: '100%' },

  cardMid: { flex: 1, paddingLeft: IS_VERY_TINY ? 10 : 12, paddingRight: 10 },
  cardTitle: { color: '#fff', fontSize: IS_VERY_TINY ? 13.5 : 14, fontWeight: '900' },
  cardCoords: { color: 'rgba(255,255,255,0.70)', fontSize: 11, fontWeight: '800', marginTop: 4 },

  openBtn: {
    paddingHorizontal: IS_VERY_TINY ? 16 : 18,
    backgroundColor: '#F3D34A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  openText: { color: '#000', fontSize: IS_VERY_TINY ? 13.5 : 14, fontWeight: '900' },
});
