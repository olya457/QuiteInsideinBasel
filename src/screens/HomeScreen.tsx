import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  FlatList,
  Image,
  ImageBackground,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { TabsParamList, RootStackParamList } from '../navigation/types';
import { BASEL_PLACES } from '../data/placesBasel';

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabsParamList, 'Home'>,
  NativeStackScreenProps<RootStackParamList>
>;

const { width: W, height: H } = Dimensions.get('window');
const IS_TINY = H < 690;
const IS_SMALL = H < 760;
const IS_NARROW = W < 360;

const BG = require('../assets/background1.png');
const ICON_GEAR = require('../assets/gear.png');
const ICON_QUIZ = require('../assets/onboard3.png');
const ICON_READMORE_GIRL = require('../assets/guide_girl.png');
const ICON_ADD_PHOTO = require('../assets/add_photo_icon.png');

const KEY_PROFILE_NAME = 'profile_name_v1';
const KEY_PROFILE_PHOTO_URI = 'profile_photo_uri_v1';

export default function HomeScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();

  const [profileName, setProfileName] = useState<string>('User');
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  const loadProfile = useCallback(async () => {
    try {
      const n = await AsyncStorage.getItem(KEY_PROFILE_NAME);
      const p = await AsyncStorage.getItem(KEY_PROFILE_PHOTO_URI);

      if (n && n.trim().length > 0) setProfileName(n.trim());
      else setProfileName('User');

      if (p && p.trim().length > 0) setPhotoUri(p.trim());
      else setPhotoUri(null);
    } catch {}
  }, []);

  useFocusEffect(
    useCallback(() => {
      let alive = true;

      (async () => {
        if (!alive) return;
        await loadProfile();
      })();

      return () => {
        alive = false;
      };
    }, [loadProfile])
  );

  const today = useMemo(() => {
    const d = new Date();
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = String(d.getFullYear());
    return `${dd}.${mm}.${yyyy}`;
  }, []);

  const popular = useMemo(() => BASEL_PLACES.slice(0, 20), []);

  const topPad = Math.max(insets.top, 12) + (Platform.OS === 'android' ? 20 : 0);
  const bottomPad = Math.max(insets.bottom, 10);

  const tabBarReserve = Platform.OS === 'android' ? (IS_TINY ? 86 : 92) : (IS_TINY ? 78 : 84);
  const contentBottom = bottomPad + tabBarReserve;

  const cardW = Math.min(W * 0.92, 430);

  const quizH = IS_TINY ? 118 : 132;
  const placeCardW = IS_NARROW ? 266 : 286;
  const placeCardH = IS_TINY ? 110 : 118;

  const avatarSize = IS_TINY ? 54 : 60;
  const gearSize = IS_TINY ? 44 : 48;

  const fade = useRef(new Animated.Value(0)).current;
  const y = useRef(new Animated.Value(16)).current;

  const headerFade = useRef(new Animated.Value(0)).current;
  const headerY = useRef(new Animated.Value(14)).current;

  const quizFade = useRef(new Animated.Value(0)).current;
  const quizY = useRef(new Animated.Value(16)).current;

  const placesFade = useRef(new Animated.Value(0)).current;
  const placesY = useRef(new Animated.Value(16)).current;

  const infoFade = useRef(new Animated.Value(0)).current;
  const infoY = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 260,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(y, {
        toValue: 0,
        duration: 360,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    const anim = (v1: Animated.Value, v2: Animated.Value, delay: number) =>
      Animated.parallel([
        Animated.timing(v1, {
          toValue: 1,
          duration: 320,
          delay,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(v2, {
          toValue: 0,
          duration: 420,
          delay,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]);

    Animated.sequence([
      anim(headerFade, headerY, 0),
      anim(quizFade, quizY, 60),
      anim(placesFade, placesY, 80),
      anim(infoFade, infoY, 100),
    ]).start();
  }, [fade, y, headerFade, headerY, quizFade, quizY, placesFade, placesY, infoFade, infoY]);

  return (
    <ImageBackground source={BG} style={styles.bg} resizeMode="cover">
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: topPad + (IS_TINY ? 14 : 18),
          paddingBottom: contentBottom,
          alignItems: 'center',
        }}
        style={{ flex: 1, opacity: fade, transform: [{ translateY: y }] }}
      >
        <Animated.View
          style={[
            styles.headerRow,
            {
              width: cardW,
              opacity: headerFade,
              transform: [{ translateY: headerY }],
            },
          ]}
        >
          <View style={styles.profileLeft}>
            <View
              style={[
                styles.avatar,
                { width: avatarSize, height: avatarSize, borderRadius: 16 },
              ]}
            >
              {photoUri ? (
                <Image source={{ uri: photoUri }} style={styles.avatarImg} />
              ) : (
                <Image source={ICON_ADD_PHOTO} style={styles.addPhotoIcon} resizeMode="contain" />
              )}
            </View>

            <View style={{ marginLeft: 12 }}>
              <Text style={styles.hello} numberOfLines={1}>
                Hello, {profileName}!
              </Text>
              <Text style={styles.date}>{today}</Text>
            </View>
          </View>

          <Pressable
            onPress={() => navigation.navigate('Settings')}
            style={[
              styles.gearBtn,
              { width: gearSize, height: gearSize, borderRadius: 16 },
            ]}
            hitSlop={10}
          >
            <Image source={ICON_GEAR} style={styles.gearIcon} />
          </Pressable>
        </Animated.View>

        <View style={{ height: IS_TINY ? 14 : 16 }} />

        <Animated.View
          style={{
            width: cardW,
            opacity: quizFade,
            transform: [{ translateY: quizY }],
          }}
        >
          <View style={[styles.quizCard, { height: quizH }]}>
            <View style={{ flex: 1, paddingLeft: 18, paddingRight: 10, paddingVertical: 14 }}>
              <Text style={styles.quizTitle}>Take the Basel{'\n'}knowledge quiz!</Text>

              <View style={{ flex: 1 }} />

              <Pressable onPress={() => navigation.navigate('ClosedQuiz')} style={styles.startBtn}>
                <Text style={styles.startBtnText}>Start</Text>
              </Pressable>
            </View>

            <Pressable
              onPress={() => navigation.navigate('ClosedQuiz')}
              style={styles.quizRightBtn}
              hitSlop={8}
            >
              <Image source={ICON_QUIZ} style={styles.quizRightImg} resizeMode="contain" />
            </Pressable>
          </View>
        </Animated.View>

        <View style={{ height: IS_TINY ? 16 : 18 }} />

        <Animated.View
          style={{
            width: cardW,
            opacity: placesFade,
            transform: [{ translateY: placesY }],
          }}
        >
          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitle}>Popular places</Text>

            <Pressable onPress={() => navigation.navigate('ListPlace')} hitSlop={10}>
              <Text style={styles.seeAll}>See all</Text>
            </Pressable>
          </View>

          <View style={{ height: 12 }} />

          <FlatList
            data={popular}
            keyExtractor={(it) => it.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={placeCardW + 14}
            decelerationRate="fast"
            ItemSeparatorComponent={() => <View style={{ width: 14 }} />}
            renderItem={({ item }) => {
              return (
                <View style={[styles.placeCard, { width: placeCardW, height: placeCardH }]}>
                  <Image source={item.image} style={styles.placeImg} />

                  <View style={{ flex: 1, paddingLeft: 12, paddingRight: 12, paddingVertical: 10 }}>
                    <Text style={styles.placeTitle} numberOfLines={1}>
                      {item.title}
                    </Text>
                    <Text style={styles.placeCoords} numberOfLines={1}>
                      {item.coordsText}
                    </Text>

                    <View style={{ flex: 1 }} />

                    <Pressable
                      style={styles.openBtn}
                      onPress={() => navigation.navigate('PlaceDetail', { placeId: item.id })}
                    >
                      <Text style={styles.openBtnText}>Open</Text>
                    </Pressable>
                  </View>
                </View>
              );
            }}
          />
        </Animated.View>

        <View style={{ height: IS_TINY ? 16 : 18 }} />

        <Animated.View
          style={{
            width: cardW,
            opacity: infoFade,
            transform: [{ translateY: infoY }],
          }}
        >
          <View style={styles.infoCard}>
            <Image source={ICON_READMORE_GIRL} style={styles.girl} resizeMode="contain" />

            <View style={{ flex: 1, paddingVertical: 14, paddingRight: 16 }}>
              <Text style={styles.infoText}>Here you can read{'\n'}about our app!</Text>

              <View style={{ flex: 1 }} />

              <Pressable onPress={() => navigation.navigate('Information')} style={styles.readMoreBtn}>
                <Text style={styles.readMoreText}>Read more</Text>
              </Pressable>
            </View>
          </View>
        </Animated.View>
      </Animated.ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: '#000' },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  profileLeft: { flexDirection: 'row', alignItems: 'center' },

  avatar: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImg: { width: '100%', height: '100%' },
  addPhotoIcon: { width: 22, height: 22, opacity: 0.95 },

  hello: { color: '#fff', fontSize: IS_TINY ? 16 : 18, fontWeight: '900' },
  date: { color: 'rgba(255,255,255,0.72)', fontSize: 12, fontWeight: '700', marginTop: 2 },

  gearBtn: {
    backgroundColor: '#F3D34A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gearIcon: { width: 22, height: 22, tintColor: '#000' },

  quizCard: {
    borderRadius: 22,
    backgroundColor: 'rgba(60, 0, 0, 0.88)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    flexDirection: 'row',
    overflow: 'hidden',
  },
  quizTitle: {
    color: '#fff',
    fontSize: IS_TINY ? 16 : 18,
    fontWeight: '900',
    lineHeight: IS_TINY ? 18 : 21,
  },
  startBtn: {
    alignSelf: 'flex-start',
    height: IS_TINY ? 40 : 42,
    paddingHorizontal: 22,
    borderRadius: 18,
    backgroundColor: '#F3D34A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  startBtnText: { color: '#000', fontSize: 16, fontWeight: '900' },

  quizRightBtn: {
    width: IS_TINY ? 104 : 116,
    alignItems: 'center',
    justifyContent: 'center',
    paddingRight: 10,
  },
  quizRightImg: { width: IS_TINY ? 76 : 84, height: IS_TINY ? 98 : 108 },

  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: { color: '#fff', fontSize: IS_TINY ? 18 : 20, fontWeight: '900' },
  seeAll: { color: '#F3D34A', fontSize: 14, fontWeight: '900', textDecorationLine: 'underline' },

  placeCard: {
    borderRadius: 20,
    backgroundColor: 'rgba(60, 0, 0, 0.88)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    flexDirection: 'row',
    overflow: 'hidden',
  },
  placeImg: {
    width: IS_NARROW ? 86 : 94,
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.10)',
  },
  placeTitle: { color: '#fff', fontSize: 14, fontWeight: '900' },
  placeCoords: { color: 'rgba(255,255,255,0.72)', fontSize: 11, fontWeight: '700', marginTop: 2 },
  openBtn: {
    alignSelf: 'flex-start',
    height: 36,
    paddingHorizontal: 20,
    borderRadius: 16,
    backgroundColor: '#F3D34A',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  openBtnText: { color: '#000', fontSize: 14, fontWeight: '900' },

  infoCard: {
    borderRadius: 22,
    backgroundColor: 'rgba(60, 0, 0, 0.88)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    flexDirection: 'row',
    overflow: 'hidden',
    minHeight: IS_TINY ? 122 : 134,
  },
  girl: {
    width: IS_TINY ? 118 : 132,
    height: '100%',
    marginLeft: 10,
    marginTop: 6,
  },
  infoText: { color: '#fff', fontSize: IS_TINY ? 16 : 18, fontWeight: '900', lineHeight: 20 },
  readMoreBtn: {
    alignSelf: 'flex-start',
    height: IS_TINY ? 40 : 42,
    paddingHorizontal: 22,
    borderRadius: 18,
    backgroundColor: '#F3D34A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  readMoreText: { color: '#000', fontSize: 16, fontWeight: '900' },
});