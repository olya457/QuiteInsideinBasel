import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  Easing,
  Image,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

const { width: W, height: H } = Dimensions.get('window');
const IS_TABLET = Math.min(W, H) >= 768;
const IS_VERY_TINY = H < 640;
const IS_TINY = H < 690;
const IS_NARROW = W < 360;

const BG = require('../assets/background1.png');
const ICON_ADD_PHOTO = require('../assets/add_photo_icon.png');
const ICON_USER_YELLOW = require('../assets/add_photo_icon.png');

const KEY_PROFILE_NAME = 'profile_name_v1';
const KEY_PROFILE_ABOUT = 'profile_about_v1';
const KEY_PROFILE_PHOTO_URI = 'profile_photo_uri_v1';

const DEFAULT_UNKNOWN = 'Unknown';
const MAX_ABOUT = 100;
const MAX_NAME = 24;

const LETTER_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M'],
];

type ActiveField = 'name' | 'about' | null;

export default function SettingsScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const SHIFT_DOWN = 20;

  const [profileName, setProfileName] = useState<string>('');
  const [about, setAbout] = useState<string>('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [activeField, setActiveField] = useState<ActiveField>(null);

  const topPad = Math.max(insets.top, 12);
  const bottomPad = Math.max(insets.bottom, 12);

  const contentW = IS_TABLET ? 420 : Math.min(W * 0.92, 430);
  const cardRadius = 22;
  const keyboardW = IS_TABLET ? 400 : Math.min(contentW, 360);

  const avatarSize = useMemo(() => {
    if (IS_TABLET) return 82;
    if (IS_VERY_TINY) return IS_NARROW ? 86 : 92;
    return 100;
  }, []);

  const headerAnim = useRef(new Animated.Value(0)).current;
  const profileAnim = useRef(new Animated.Value(0)).current;
  const deleteAnim = useRef(new Animated.Value(0)).current;

  const loadProfile = useCallback(async () => {
    try {
      const n = await AsyncStorage.getItem(KEY_PROFILE_NAME);
      const a = await AsyncStorage.getItem(KEY_PROFILE_ABOUT);
      const p = await AsyncStorage.getItem(KEY_PROFILE_PHOTO_URI);

      setProfileName(n || '');
      setAbout(a || '');
      setPhotoUri(p || null);
    } catch {}
  }, []);

  useEffect(() => {
    loadProfile();
    Animated.parallel([
      Animated.timing(headerAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(profileAnim, { toValue: 1, duration: 400, delay: 100, useNativeDriver: true }),
      Animated.timing(deleteAnim, { toValue: 1, duration: 400, delay: 200, useNativeDriver: true }),
    ]).start();
  }, []);

  const appendChar = (ch: string) => {
    if (!activeField) return;
    if (activeField === 'name') {
      setProfileName((prev) => (prev + ch).slice(0, MAX_NAME));
    } else {
      setAbout((prev) => (prev + ch).slice(0, MAX_ABOUT));
    }
  };

  const backspace = () => {
    if (!activeField) return;
    if (activeField === 'name') setProfileName((prev) => prev.slice(0, -1));
    else setAbout((prev) => prev.slice(0, -1));
  };

  const pickFromGallery = useCallback(async () => {
    try {
      const mod = await import('react-native-image-picker');
      const { launchImageLibrary } = mod;
      const res = await launchImageLibrary({ mediaType: 'photo', quality: 0.9 });
      if (res.assets?.[0]?.uri) {
        setPhotoUri(res.assets[0].uri);
      }
    } catch {}
  }, []);

  const onSave = useCallback(async () => {
    const safeName = profileName.trim() || DEFAULT_UNKNOWN;
    await AsyncStorage.setItem(KEY_PROFILE_NAME, safeName);
    await AsyncStorage.setItem(KEY_PROFILE_ABOUT, about.trim());
    if (photoUri) await AsyncStorage.setItem(KEY_PROFILE_PHOTO_URI, photoUri);
    setActiveField(null);
    Alert.alert('Success', 'Profile updated');
  }, [about, photoUri, profileName]);

  const onDeletePress = () => {
    Alert.alert('Delete?', 'This will clear your profile', [
      { text: 'Cancel' },
      { text: 'Delete', onPress: async () => {
        await AsyncStorage.clear();
        setProfileName('');
        setAbout('');
        setPhotoUri(null);
      }}
    ]);
  };

  const renderKey = (label: string, onPress: () => void, wide?: boolean) => (
    <Pressable
      key={label}
      onPress={onPress}
      style={[styles.keyBtn, wide && { minWidth: 90 }]}
    >
      <Text style={styles.keyText}>{label}</Text>
    </Pressable>
  );

  return (
    <ImageBackground source={BG} style={styles.bg} resizeMode="cover">
      <ScrollView contentContainerStyle={[styles.scroll, { paddingTop: topPad + 12 + SHIFT_DOWN, paddingBottom: bottomPad + 40 }]}>
        
        <Animated.View style={[styles.topBar, { width: contentW, opacity: headerAnim }]}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backRow}>
            <Text style={styles.backArrow}>←</Text>
            <Text style={styles.title}>Settings</Text>
          </Pressable>
        </Animated.View>

        <View style={{ height: 15 }} />

        <Animated.View style={[styles.profileCard, { width: contentW, opacity: profileAnim }]}>
          <Text style={styles.cardHeader}>Edit Profile</Text>
          
          <View style={styles.avatarRow}>
            <View style={[styles.avatarBox, { width: avatarSize, height: avatarSize }]}>
              {photoUri ? <Image source={{ uri: photoUri }} style={styles.avatarImg} /> : <Image source={ICON_ADD_PHOTO} style={styles.addIcon} />}
            </View>
            <Pressable onPress={pickFromGallery} style={styles.smallIconBtn}>
              <Image source={ICON_USER_YELLOW} style={styles.smallIcon} />
            </Pressable>
          </View>

          <View style={{ height: 15 }} />

          <Pressable 
            onPress={() => setActiveField('name')} 
            style={[styles.fakeInput, activeField === 'name' && styles.activeInput]}
          >
            <Text style={styles.fakeLabel}>Name</Text>
            <Text style={styles.fakeValue}>{profileName || 'Tap to type'}</Text>
          </Pressable>

          <View style={{ height: 10 }} />

          <Pressable 
            onPress={() => setActiveField('about')} 
            style={[styles.fakeInput, styles.fakeInputMultiline, activeField === 'about' && styles.activeInput]}
          >
            <View style={styles.rowBetween}>
              <Text style={styles.fakeLabel}>About</Text>
              <Text style={styles.counter}>{about.length}/{MAX_ABOUT}</Text>
            </View>
            <Text style={styles.fakeValue}>{about || 'Tell us about yourself'}</Text>
          </Pressable>

          <View style={{ height: 15 }} />

          <Pressable onPress={onSave} style={styles.saveBtn}>
            <Text style={styles.saveBtnText}>Save Changes</Text>
          </Pressable>
        </Animated.View>

        <View style={{ height: 12 }} />

        <View style={[styles.keyboardBox, { width: keyboardW }]}>
          {LETTER_ROWS.map((row, i) => (
            <View key={i} style={styles.kbRow}>
              {row.map(char => renderKey(char, () => appendChar(char)))}
            </View>
          ))}
          <View style={styles.kbRow}>
            {renderKey('Space', () => appendChar(' '), true)}
            {renderKey('⌫', backspace)}
            {renderKey('✓', () => setActiveField(null))}
          </View>
        </View>

        <View style={{ height: 12 }} />

        <Animated.View style={[styles.deleteCard, { width: contentW, opacity: deleteAnim }]}>
          <Text style={styles.deleteLabel}>Reset all data</Text>
          <Pressable onPress={onDeletePress} style={styles.deleteBtn}>
            <Text style={styles.deleteBtnText}>RESET</Text>
          </Pressable>
        </Animated.View>

      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: '#000' },
  scroll: { alignItems: 'center' },
  topBar: { flexDirection: 'row', alignItems: 'center' },
  backRow: { flexDirection: 'row', alignItems: 'center' },
  backArrow: { color: '#fff', fontSize: 24, fontWeight: '900', marginRight: 10 },
  title: { color: '#fff', fontSize: 24, fontWeight: '900' },
  profileCard: {
    backgroundColor: 'rgba(60, 0, 0, 0.88)',
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  cardHeader: { color: '#fff', fontWeight: '900', textAlign: 'center', marginBottom: 12 },
  avatarRow: { alignItems: 'center' },
  avatarBox: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 2,
    borderColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center'
  },
  avatarImg: { width: '100%', height: '100%' },
  addIcon: { width: 26, height: 26 },
  smallIconBtn: {
    position: 'absolute',
    bottom: -5,
    right: '35%',
    width: 30,
    height: 30,
    backgroundColor: '#F3D34A',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center'
  },
  smallIcon: { width: 16, height: 16 },
  fakeInput: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: 'transparent'
  },
  activeInput: { borderColor: '#F3D34A' },
  fakeInputMultiline: { minHeight: 70 },
  fakeLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 10, fontWeight: '800', marginBottom: 4 },
  fakeValue: { color: '#fff', fontWeight: '700', fontSize: 14 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between' },
  counter: { color: 'rgba(255,255,255,0.4)', fontSize: 10 },
  saveBtn: {
    backgroundColor: '#F3D34A',
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center'
  },
  saveBtnText: { color: '#000', fontWeight: '900', fontSize: 16 },
  keyboardBox: {
    backgroundColor: 'rgba(20,20,20,0.95)',
    borderRadius: 16,
    padding: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)'
  },
  kbRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 5 },
  keyBtn: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    height: 30,
    minWidth: 30,
    margin: 2,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4
  },
  keyText: { color: '#fff', fontWeight: '800', fontSize: 12 },
  deleteCard: {
    backgroundColor: 'rgba(60, 0, 0, 0.7)',
    borderRadius: 22,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  deleteLabel: { color: '#fff', fontWeight: '700' },
  deleteBtn: { backgroundColor: '#F3D34A', paddingHorizontal: 15, height: 36, borderRadius: 18, justifyContent: 'center' },
  deleteBtnText: { color: '#000', fontWeight: '900', fontSize: 12 }
});