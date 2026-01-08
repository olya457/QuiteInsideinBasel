import React, { useMemo, useRef, useState, useEffect } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  Easing,
  Image,
  ImageBackground,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'CreateProfile1'>;

const { width: W, height: H } = Dimensions.get('window');
const IS_TINY = H < 680;
const IS_NARROW = W < 360;
const IS_TABLET = Math.min(W, H) >= 768;

const BG = require('../assets/background1.png');
const ICON_TOP = require('../assets/create_profile_icon.png');
const ICON_ADD = require('../assets/add_photo_icon.png');

const KEY_PROFILE_NAME = 'profile_name_v1';
const KEY_PROFILE_ABOUT = 'profile_about_v1';
const KEY_PROFILE_PHOTO_URI = 'profile_photo_uri_v1';

type ActiveField = 'name' | 'about' | null;

const LETTER_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M'],
];

export default function CreateProfile1Screen({ navigation }: Props) {
  const insets = useSafeAreaInsets();

  const [name, setName] = useState('');
  const [about, setAbout] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [activeField, setActiveField] = useState<ActiveField>(null);

  const maxAbout = 100;
  const maxName = 24;

  const canCreate = useMemo(() => {
    return name.trim().length > 0 && about.trim().length > 0;
  }, [about, name]);

  const fade = useRef(new Animated.Value(0)).current;
  const y = useRef(new Animated.Value(10)).current;
  const scale = useRef(new Animated.Value(0.99)).current;

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
        duration: 380,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        speed: 12,
        bounciness: 5,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fade, scale, y]);

  useEffect(() => {
    (async () => {
      try {
        const n = await AsyncStorage.getItem(KEY_PROFILE_NAME);
        const a = await AsyncStorage.getItem(KEY_PROFILE_ABOUT);
        const p = await AsyncStorage.getItem(KEY_PROFILE_PHOTO_URI);

        if (n?.trim()) setName(n.trim());
        if (a?.trim()) setAbout(a.trim());
        if (p?.trim()) setPhotoUri(p.trim());
      } catch {}
    })();
  }, []);

  const ANDROID_EXTRA = Platform.OS === 'android' ? 20 : 0;
  const topPad = Math.max(insets.top, 10) + 30 + ANDROID_EXTRA;
  const bottomPad = Math.max(insets.bottom, 10);

  const topIconW = Math.min(W * (IS_TABLET ? 0.45 : 0.68), IS_NARROW ? 270 : IS_TABLET ? 280 : 300);
  const topIconH = Math.min(H * (IS_TABLET ? 0.1 : 0.155), IS_TINY ? 92 : IS_TABLET ? 90 : 118);

  const cardW = IS_TABLET ? 420 : Math.min(W * 0.90, 420);
  const cardRadius = 22;

  const avatarSize = IS_TINY ? 72 : IS_TABLET ? 76 : 88;

  const keyboardW = IS_TABLET ? 400 : Math.min(cardW, 360);

  const KEY_H = IS_TABLET ? 28 : 28;      
  const KEY_MIN_W = IS_TABLET ? 28 : 28;  
  const KEY_FONT = IS_TABLET ? 11 : 11;

  const GAP = IS_TABLET ? 5 : 5;
  const ROW_MB = IS_TABLET ? 5 : 5;
  const KB_PAD = IS_TABLET ? 8 : 9;

  const appendChar = (ch: string) => {
    if (!activeField) return;
    if (activeField === 'name') {
      setName((prev) => (prev + ch).slice(0, maxName));
      return;
    }
    setAbout((prev) => (prev + ch).slice(0, maxAbout));
  };

  const backspace = () => {
    if (!activeField) return;
    if (activeField === 'name') setName((prev) => prev.slice(0, -1));
    else setAbout((prev) => prev.slice(0, -1));
  };

  const confirm = () => setActiveField(null);

  const pickFromGallery = async () => {
    try {
      const mod = await import('react-native-image-picker');
      const { launchImageLibrary } = mod;
      const res = await launchImageLibrary({
        mediaType: 'photo',
        selectionLimit: 1,
        quality: 0.9,
      });
      if (res.didCancel) return;
      if (res.errorCode) {
        Alert.alert('Error', res.errorMessage || res.errorCode);
        return;
      }
      const uri = res.assets?.[0]?.uri;
      if (uri) setPhotoUri(uri);
    } catch {
      Alert.alert('Gallery is not ready', 'Install react-native-image-picker.');
    }
  };

  const onCreate = async () => {
    if (!canCreate) return;
    try {
      await AsyncStorage.setItem(KEY_PROFILE_NAME, name.trim());
      await AsyncStorage.setItem(KEY_PROFILE_ABOUT, about.trim());
      if (photoUri?.trim()) await AsyncStorage.setItem(KEY_PROFILE_PHOTO_URI, photoUri.trim());
      else await AsyncStorage.removeItem(KEY_PROFILE_PHOTO_URI);
      setActiveField(null);
      navigation.replace('Tabs');
    } catch {
      Alert.alert('Error', 'Could not save profile.');
    }
  };

  const renderKey = (label: string, onPress: () => void, wide?: boolean) => (
    <Pressable
      key={label}
      onPress={onPress}
      style={[
        styles.keyBtn,
        {
          height: KEY_H,
          minWidth: KEY_MIN_W,
          borderRadius: 11,
          paddingHorizontal: wide ? 12 : 9,
        },
        wide ? styles.keyBtnWide : null,
      ]}
      android_ripple={{ color: 'rgba(255,255,255,0.10)' }}
    >
      <Text style={[styles.keyText, { fontSize: KEY_FONT }]}>{label}</Text>
    </Pressable>
  );

  return (
    <ImageBackground source={BG} style={styles.bg} resizeMode="cover">
      <View style={styles.root}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingTop: topPad,
              paddingBottom: bottomPad + 30,
            },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            style={[
              styles.topIconWrap,
              {
                width: topIconW,
                height: topIconH,
                opacity: fade,
                transform: [{ translateY: y }, { scale }],
              },
            ]}
          >
            <Image source={ICON_TOP} style={styles.topIcon} resizeMode="contain" />
          </Animated.View>

          <View style={{ height: 12 }} />

          <Animated.View
            style={[
              styles.card,
              {
                width: cardW,
                borderRadius: cardRadius,
                padding: 14,
                opacity: fade,
                transform: [{ translateY: y }],
              },
            ]}
          >
            <Text style={[styles.title, { fontSize: IS_TABLET ? 17 : 18 }]}>Create your profile</Text>

            <Pressable
              style={[styles.avatarBox, { width: avatarSize, height: avatarSize, borderRadius: 16 }]}
              onPress={pickFromGallery}
            >
              {photoUri ? <Image source={{ uri: photoUri }} style={styles.photo} resizeMode="cover" /> : null}
              <View style={StyleSheet.absoluteFill} />
              <Pressable onPress={pickFromGallery} style={styles.addOverlayBtn}>
                <Image source={ICON_ADD} style={styles.addOverlayIcon} resizeMode="contain" />
              </Pressable>
            </Pressable>

            <View style={{ height: 10 }} />

            <Pressable
              onPress={() => setActiveField('name')}
              style={[
                styles.fakeInput, 
                IS_TABLET && { paddingVertical: 6 },
                activeField === 'name' ? styles.fakeInputActive : null
              ]}
            >
              <Text style={styles.fakeLabel}>Your name</Text>
              <Text style={[styles.fakeValue, !name ? styles.fakePlaceholder : null]}>
                {name ? name : 'Tap to type'}
              </Text>
            </Pressable>

            <View style={{ height: 8 }} />

            <Pressable
              onPress={() => setActiveField('about')}
              style={[
                styles.fakeInput,
                styles.fakeInputMultiline,
                IS_TABLET && { minHeight: 60, paddingVertical: 6 },
                activeField === 'about' ? styles.fakeInputActive : null,
              ]}
            >
              <View style={styles.aboutTopRow}>
                <Text style={styles.fakeLabel}>About</Text>
                <Text style={styles.counter}>
                  {Math.min(maxAbout, about.length)}/{maxAbout}
                </Text>
              </View>
              <Text style={[styles.fakeValue, !about ? styles.fakePlaceholder : null]}>
                {about ? about : 'Tap to type'}
              </Text>
            </Pressable>
          </Animated.View>

          <View style={{ height: 12 }} />

          <View style={[styles.keyboardBox, { width: keyboardW, padding: KB_PAD }]}>
            <View style={{ gap: ROW_MB }}>
              {LETTER_ROWS.map((row, idx) => (
                <View
                  key={`row-${idx}`}
                  style={[styles.letterRow, { gap: GAP, marginBottom: idx === LETTER_ROWS.length - 1 ? 0 : ROW_MB }]}
                >
                  {row.map((ch) => renderKey(ch, () => appendChar(ch)))}
                </View>
              ))}
              <View style={[styles.letterRow, { gap: GAP, marginBottom: 0 }]}>
                {renderKey('Space', () => appendChar(' '), true)}
                {renderKey('⌫', backspace)}
                {renderKey('✓', confirm)}
              </View>
            </View>
          </View>

          <Pressable
            onPress={onCreate}
            disabled={!canCreate}
            style={[
              styles.saveBtn, 
              { 
                width: IS_TABLET ? 200 : keyboardW, 
                height: IS_TABLET ? 46 : 54,
                opacity: canCreate ? 1 : 0.55 
              }
            ]}
          >
            <Text style={[styles.saveText, IS_TABLET && { fontSize: 16 }]}>Save</Text>
          </Pressable>
        </ScrollView>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: '#000' },
  root: { flex: 1 },
  scroll: { flex: 1, width: '100%' },
  scrollContent: { alignItems: 'center' },
  topIconWrap: { alignItems: 'center', justifyContent: 'center' },
  topIcon: { width: '100%', height: '100%' },
  card: {
    backgroundColor: 'rgba(60, 0, 0, 0.86)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.10)',
  },
  title: { color: '#fff', fontWeight: '900', textAlign: 'center', marginBottom: 8 },
  avatarBox: {
    alignSelf: 'center',
    backgroundColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  photo: { width: '100%', height: '100%' },
  addOverlayBtn: {
    position: 'absolute',
    right: 8,
    bottom: 8,
    width: 28,
    height: 28,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addOverlayIcon: { width: 16, height: 16 },
  fakeInput: {
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  fakeInputMultiline: { minHeight: 84 },
  fakeInputActive: {
    borderColor: 'rgba(243, 211, 74, 0.55)',
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  fakeLabel: {
    color: 'rgba(255,255,255,0.65)',
    fontWeight: '800',
    fontSize: 10,
    marginBottom: 4,
  },
  fakeValue: { color: '#fff', fontSize: 14, fontWeight: '800' },
  fakePlaceholder: { color: 'rgba(255,255,255,0.42)' },
  aboutTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  counter: { color: 'rgba(255,255,255,0.55)', fontSize: 10, fontWeight: '900' },
  keyboardBox: {
    borderRadius: 16,
    backgroundColor: 'rgba(25,25,25,0.92)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
  },
  letterRow: { flexDirection: 'row', justifyContent: 'center' },
  keyBtn: {
    backgroundColor: 'rgba(255,255,255,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  keyBtnWide: { minWidth: 96 },
  keyText: { color: '#fff', fontWeight: '900' },
  saveBtn: {
    marginTop: 12,
    borderRadius: 18,
    backgroundColor: '#F3D34A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveText: { color: '#000', fontWeight: '900', fontSize: 18 },
});