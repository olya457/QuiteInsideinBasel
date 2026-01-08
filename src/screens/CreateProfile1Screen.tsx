import React, { useMemo, useRef, useState, useEffect } from 'react';
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'CreateProfile1'>;

const { width: W, height: H } = Dimensions.get('window');
const IS_TINY = H < 680;
const IS_NARROW = W < 360;

const BG = require('../assets/background1.png');
const ICON_TOP = require('../assets/create_profile_icon.png');
const ICON_ADD = require('../assets/add_photo_icon.png');

const KEY_PROFILE_NAME = 'profile_name_v1';
const KEY_PROFILE_ABOUT = 'profile_about_v1';
const KEY_PROFILE_PHOTO_URI = 'profile_photo_uri_v1';

export default function CreateProfile1Screen({ navigation }: Props) {
  const insets = useSafeAreaInsets();

  const [name, setName] = useState('');
  const [about, setAbout] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  const maxAbout = 100;

  const canCreate = useMemo(() => {
    return name.trim().length > 0 && about.trim().length > 0;
  }, [about, name]);

  const fade = useRef(new Animated.Value(0)).current;
  const y = useRef(new Animated.Value(14)).current;
  const scale = useRef(new Animated.Value(0.98)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 360,
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
    (async () => {
      try {
        const n = await AsyncStorage.getItem(KEY_PROFILE_NAME);
        const a = await AsyncStorage.getItem(KEY_PROFILE_ABOUT);
        const p = await AsyncStorage.getItem(KEY_PROFILE_PHOTO_URI);

        if (n && n.trim().length > 0) setName(n.trim());
        if (a && a.trim().length > 0) setAbout(a.trim());
        if (p && p.trim().length > 0) setPhotoUri(p.trim());
      } catch {}
    })();
  }, []);

  const topPad = Math.max(insets.top, 12);
  const bottomPad = Math.max(insets.bottom, 12);

  const topIconW = Math.min(W * 0.78, IS_NARROW ? 310 : 340);
  const topIconH = Math.min(H * 0.22, IS_TINY ? 140 : 160);

  const cardW = Math.min(W * 0.9, 420);
  const cardRadius = 24;

  const avatarSize = IS_TINY ? 92 : 104;
  const inputH = IS_TINY ? 44 : 48;
  const btnH = IS_TINY ? 54 : 60;

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
      Alert.alert('Gallery is not ready', 'Install react-native-image-picker and run pod install for iOS.');
    }
  };

  const onCreate = async () => {
    if (!canCreate) return;

    try {
      const safeName = name.trim();
      const safeAbout = about.trim();

      await AsyncStorage.setItem(KEY_PROFILE_NAME, safeName);
      await AsyncStorage.setItem(KEY_PROFILE_ABOUT, safeAbout);

      if (photoUri && photoUri.trim().length > 0) {
        await AsyncStorage.setItem(KEY_PROFILE_PHOTO_URI, photoUri.trim());
      } else {
        await AsyncStorage.removeItem(KEY_PROFILE_PHOTO_URI);
      }

      navigation.replace('Tabs');
    } catch {
      Alert.alert('Error', 'Could not save profile. Try again.');
    }
  };

  return (
    <ImageBackground source={BG} style={styles.bg} resizeMode="cover">
      <View style={{ paddingTop: topPad + 10 }} />

      <Animated.View
        style={[
          styles.topIconWrap,
          {
            width: topIconW,
            height: topIconH,
            marginTop: 26,
            opacity: fade,
            transform: [{ translateY: y }, { scale }],
          },
        ]}
      >
        <Image source={ICON_TOP} style={styles.topIcon} resizeMode="contain" />
      </Animated.View>

      <View style={{ flex: 1 }} />

      <Animated.View
        style={[
          styles.card,
          {
            width: cardW,
            borderRadius: cardRadius,
            padding: IS_TINY ? 16 : 18,
            marginBottom: bottomPad + (IS_TINY ? 10 : 14),
            opacity: fade,
            transform: [{ translateY: y }],
          },
        ]}
      >
        <Text style={[styles.title, { fontSize: IS_TINY ? 18 : 20 }]}>Create your profile</Text>

        <Pressable
          style={[styles.avatarBox, { width: avatarSize, height: avatarSize, borderRadius: 16 }]}
          onPress={pickFromGallery}
          hitSlop={10}
        >
          {photoUri ? (
            <Image source={{ uri: photoUri }} style={styles.photo} resizeMode="cover" />
          ) : (
            <View style={StyleSheet.absoluteFill} />
          )}

          <Pressable onPress={pickFromGallery} hitSlop={10} style={styles.addOverlayBtn}>
            <Image source={ICON_ADD} style={styles.addOverlayIcon} resizeMode="contain" />
          </Pressable>
        </Pressable>

        <View style={{ height: IS_TINY ? 12 : 14 }} />

        <View style={[styles.inputWrap, { height: inputH, borderRadius: 12 }]}>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Your name"
            placeholderTextColor="rgba(255,255,255,0.42)"
            style={styles.input}
            autoCapitalize="words"
            returnKeyType="next"
          />
        </View>

        <View style={{ height: 12 }} />

        <View style={[styles.aboutWrap, { borderRadius: 12, minHeight: IS_TINY ? 86 : 96 }]}>
          <TextInput
            value={about}
            onChangeText={(t) => setAbout(t.slice(0, maxAbout))}
            placeholder="Tell us about yourself"
            placeholderTextColor="rgba(255,255,255,0.42)"
            style={styles.aboutInput}
            multiline
            textAlignVertical="top"
          />
          <Text style={styles.counter}>
            {Math.min(maxAbout, about.length)}/{maxAbout}
          </Text>
        </View>

        <View style={{ height: IS_TINY ? 14 : 16 }} />

        <Pressable
          style={[styles.createBtn, { height: btnH, borderRadius: 18, opacity: canCreate ? 1 : 0.55 }]}
          onPress={onCreate}
          disabled={!canCreate}
        >
          <Text style={[styles.createText, { fontSize: IS_TINY ? 18 : 20 }]}>Save</Text>
        </Pressable>
      </Animated.View>

      <Text style={[styles.footer, { paddingBottom: bottomPad + 10 }]}>{' '}</Text>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: '#000', alignItems: 'center' },

  topIconWrap: { alignItems: 'center', justifyContent: 'center' },
  topIcon: { width: '100%', height: '100%' },

  card: {
    backgroundColor: 'rgba(60, 0, 0, 0.86)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.10)',
  },

  title: { color: '#fff', fontWeight: '900', textAlign: 'center', marginBottom: 14 },

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
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addOverlayIcon: { width: 18, height: 18 },

  inputWrap: {
    backgroundColor: 'rgba(255,255,255,0.16)',
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  input: { color: '#fff', fontSize: 14, fontWeight: '700', paddingVertical: 0 },

  aboutWrap: {
    backgroundColor: 'rgba(255,255,255,0.16)',
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 18,
  },
  aboutInput: { color: '#fff', fontSize: 13, fontWeight: '700', minHeight: 70 },
  counter: {
    position: 'absolute',
    right: 10,
    bottom: 8,
    color: 'rgba(255,255,255,0.55)',
    fontSize: 10,
    fontWeight: '800',
  },

  createBtn: { backgroundColor: '#F3D34A', alignItems: 'center', justifyContent: 'center' },
  createText: { color: '#000', fontWeight: '900' },

  footer: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 10,
  },
});
