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
  TextInput,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

const { width: W, height: H } = Dimensions.get('window');
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

export default function SettingsScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const SHIFT_DOWN = 20;

  const [profileName, setProfileName] = useState<string>(DEFAULT_UNKNOWN);
  const [about, setAbout] = useState<string>('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  const topPad = Math.max(insets.top, 12);
  const bottomPad = Math.max(insets.bottom, 12);

  const contentW = Math.min(W * 0.92, 430);
  const cardRadius = IS_VERY_TINY ? 20 : 22;

  const avatarSize = useMemo(() => {
    if (IS_VERY_TINY) return IS_NARROW ? 86 : 92;
    if (IS_TINY) return IS_NARROW ? 92 : 100;
    return IS_NARROW ? 98 : 108;
  }, []);

  const fieldH = IS_VERY_TINY ? 32 : IS_TINY ? 34 : 36;
  const aboutH = IS_VERY_TINY ? 68 : IS_TINY ? 74 : 82;

  const changeBtnH = IS_VERY_TINY ? 44 : IS_TINY ? 46 : 50;
  const deleteBtnH = IS_VERY_TINY ? 38 : IS_TINY ? 40 : 42;

  const sectionGap = IS_VERY_TINY ? 10 : 14;

  const headerAnim = useRef(new Animated.Value(0)).current;
  const profileAnim = useRef(new Animated.Value(0)).current;
  const deleteAnim = useRef(new Animated.Value(0)).current;

  const loadProfile = useCallback(async () => {
    try {
      const n = await AsyncStorage.getItem(KEY_PROFILE_NAME);
      const a = await AsyncStorage.getItem(KEY_PROFILE_ABOUT);
      const p = await AsyncStorage.getItem(KEY_PROFILE_PHOTO_URI);

      setProfileName(n && n.trim().length > 0 ? n.trim() : DEFAULT_UNKNOWN);
      setAbout(a && a.trim().length > 0 ? a.trim() : '');
      setPhotoUri(p && p.trim().length > 0 ? p.trim() : null);
    } catch {}
  }, []);

  const runIntro = useCallback(() => {
    headerAnim.setValue(0);
    profileAnim.setValue(0);
    deleteAnim.setValue(0);

    const fadeUp = (v: Animated.Value, delay: number) =>
      Animated.timing(v, {
        toValue: 1,
        duration: 420,
        delay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      });

    Animated.sequence([fadeUp(headerAnim, 0), fadeUp(profileAnim, 80), fadeUp(deleteAnim, 140)]).start();
  }, [deleteAnim, headerAnim, profileAnim]);

  useEffect(() => {
    loadProfile();
    runIntro();
  }, [loadProfile, runIntro]);

  const headerY = headerAnim.interpolate({ inputRange: [0, 1], outputRange: [12, 0] });
  const headerScale = headerAnim.interpolate({ inputRange: [0, 1], outputRange: [0.985, 1] });

  const profileY = profileAnim.interpolate({ inputRange: [0, 1], outputRange: [14, 0] });
  const profileScale = profileAnim.interpolate({ inputRange: [0, 1], outputRange: [0.985, 1] });

  const deleteY = deleteAnim.interpolate({ inputRange: [0, 1], outputRange: [14, 0] });
  const deleteScale = deleteAnim.interpolate({ inputRange: [0, 1], outputRange: [0.985, 1] });

  const aboutCounter = `${Math.min(MAX_ABOUT, about.length)}/${MAX_ABOUT}`;

  const pickFromGallery = useCallback(async () => {
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
      if (uri) {
        setPhotoUri(uri);
        await AsyncStorage.setItem(KEY_PROFILE_PHOTO_URI, uri);
      }
    } catch {
      Alert.alert('Gallery is not ready', 'Install react-native-image-picker and run pod install for iOS.');
    }
  }, []);

  const onSave = useCallback(async () => {
    try {
      const safeName = profileName.trim().length > 0 ? profileName.trim() : DEFAULT_UNKNOWN;
      const safeAbout = about.trim();

      await AsyncStorage.setItem(KEY_PROFILE_NAME, safeName);
      await AsyncStorage.setItem(KEY_PROFILE_ABOUT, safeAbout);

      if (photoUri && photoUri.trim().length > 0) {
        await AsyncStorage.setItem(KEY_PROFILE_PHOTO_URI, photoUri.trim());
      } else {
        await AsyncStorage.removeItem(KEY_PROFILE_PHOTO_URI);
      }

      setProfileName(safeName);
      setAbout(safeAbout);

      Alert.alert('Saved', 'Your profile was updated.');
    } catch {
      Alert.alert('Error', 'Could not save changes.');
    }
  }, [about, photoUri, profileName]);

  const clearAllData = useCallback(async () => {
    try {
      await AsyncStorage.multiRemove([KEY_PROFILE_NAME, KEY_PROFILE_ABOUT, KEY_PROFILE_PHOTO_URI]);
    } catch {}

    setProfileName(DEFAULT_UNKNOWN);
    setAbout('');
    setPhotoUri(null);
  }, []);

  const onDeletePress = useCallback(() => {
    Alert.alert('Delete all data?', 'This action cannot be undone', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: clearAllData },
    ]);
  }, [clearAllData]);

  return (
    <ImageBackground source={BG} style={styles.bg} resizeMode="cover">
      <View style={[styles.screen, { paddingTop: topPad + 12 + SHIFT_DOWN, paddingBottom: bottomPad + 16 }]}>
        <Animated.View
          style={[
            styles.topBar,
            {
              width: contentW,
              opacity: headerAnim,
              transform: [{ translateY: headerY }, { scale: headerScale }],
            },
          ]}
        >
          <Pressable onPress={() => navigation.goBack()} style={styles.backRow} hitSlop={12}>
            <Text style={styles.backArrow}>←</Text>
            <Text style={styles.title}>Settings</Text>
          </Pressable>
        </Animated.View>

        <View style={{ height: sectionGap }} />

        <Animated.View
          style={[
            styles.profileCard,
            {
              width: contentW,
              borderRadius: cardRadius,
              opacity: profileAnim,
              transform: [{ translateY: profileY }, { scale: profileScale }],
              paddingHorizontal: IS_VERY_TINY ? 14 : 16,
              paddingTop: IS_VERY_TINY ? 12 : 14,
              paddingBottom: IS_VERY_TINY ? 14 : 16,
            },
          ]}
        >
          <Text style={[styles.cardHeader, { fontSize: IS_VERY_TINY ? 15 : 16 }]}>Your profile</Text>

          <View style={{ height: IS_VERY_TINY ? 10 : 12 }} />

          <View style={styles.avatarRow}>
            <View style={[styles.avatarBox, { width: avatarSize, height: avatarSize, borderRadius: 16 }]}>
              {photoUri ? (
                <Image source={{ uri: photoUri }} style={styles.avatarImg} resizeMode="cover" />
              ) : (
                <Image source={ICON_ADD_PHOTO} style={styles.addIcon} resizeMode="contain" />
              )}
            </View>

            <Pressable onPress={pickFromGallery} style={styles.smallIconBtn} hitSlop={10}>
              <Image source={ICON_USER_YELLOW} style={styles.smallIcon} resizeMode="contain" />
            </Pressable>
          </View>

          <View style={{ height: IS_VERY_TINY ? 12 : 14 }} />

          <View style={[styles.field, { height: fieldH }]}>
            <TextInput
              value={profileName}
              onChangeText={setProfileName}
              placeholder="Your name"
              placeholderTextColor="rgba(255,255,255,0.40)"
              style={[styles.fieldInput, { fontSize: IS_VERY_TINY ? 11.5 : 12 }]}
              autoCapitalize="words"
              returnKeyType="done"
            />
          </View>

          <View style={{ height: IS_VERY_TINY ? 10 : 12 }} />

          <View style={[styles.aboutField, { height: aboutH }]}>
            <TextInput
              value={about}
              onChangeText={(t) => setAbout(t.slice(0, MAX_ABOUT))}
              placeholder="Tell us about yourself"
              placeholderTextColor="rgba(255,255,255,0.40)"
              style={[styles.aboutInput, { fontSize: IS_VERY_TINY ? 11 : 11.5 }]}
              multiline
              textAlignVertical="top"
            />
            <Text style={styles.counter}>{aboutCounter}</Text>
          </View>

          <View style={{ height: IS_VERY_TINY ? 14 : 16 }} />

          <Pressable onPress={onSave} style={[styles.changeBtn, { height: changeBtnH }]} hitSlop={10}>
            <Text style={[styles.changeText, { fontSize: IS_VERY_TINY ? 15 : 16 }]}>Save</Text>
          </Pressable>
        </Animated.View>

        <View style={{ height: sectionGap }} />

        <Animated.View
          style={[
            styles.deleteCard,
            {
              width: contentW,
              borderRadius: cardRadius,
              opacity: deleteAnim,
              transform: [{ translateY: deleteY }, { scale: deleteScale }],
              paddingHorizontal: IS_VERY_TINY ? 14 : 16,
              paddingVertical: IS_VERY_TINY ? 14 : 16,
            },
          ]}
        >
          <Text style={[styles.deleteLabel, { fontSize: IS_VERY_TINY ? 13 : 14 }]}>Delete all data</Text>

          <Pressable onPress={onDeletePress} style={[styles.deleteBtn, { height: deleteBtnH }]} hitSlop={10}>
            <Text style={[styles.deleteBtnText, { fontSize: IS_VERY_TINY ? 13 : 14 }]}>DELETE</Text>
          </Pressable>
        </Animated.View>

        <View style={{ flex: 1 }} />
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
  title: { color: '#fff', fontSize: 22, fontWeight: '900' },

  profileCard: {
    backgroundColor: 'rgba(60, 0, 0, 0.88)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
  },
  cardHeader: { color: '#fff', fontWeight: '900', textAlign: 'center' },

  avatarRow: { alignItems: 'center', justifyContent: 'center' },

  avatarBox: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.85)',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImg: { width: '100%', height: '100%' },
  addIcon: { width: 26, height: 26, opacity: 0.95 },

  smallIconBtn: {
    position: 'absolute',
    right: W < 360 ? 34 : 44,
    top: 36,
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  smallIcon: { width: 18, height: 18 },

  field: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 10,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  fieldInput: {
    color: 'rgba(255,255,255,0.90)',
    fontWeight: '900',
    paddingVertical: 0,
    textAlign: 'center',
  },

  aboutField: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 18,
  },
  aboutInput: {
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '800',
    lineHeight: 15,
    textAlign: 'center',
    padding: 0,
  },
  counter: {
    position: 'absolute',
    right: 10,
    bottom: 8,
    color: 'rgba(255,255,255,0.55)',
    fontSize: 10,
    fontWeight: '800',
  },

  changeBtn: {
    borderRadius: 22,
    backgroundColor: '#F3D34A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  changeText: { color: '#000', fontWeight: '900' },

  deleteCard: {
    backgroundColor: 'rgba(60, 0, 0, 0.70)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  deleteLabel: { color: 'rgba(255,255,255,0.80)', fontWeight: '800' },

  deleteBtn: {
    paddingHorizontal: 18,
    borderRadius: 18,
    backgroundColor: '#F3D34A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteBtnText: { color: '#000', fontWeight: '900' },
});
