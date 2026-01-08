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
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Onboard'>;

const { width: W, height: H } = Dimensions.get('window');
const IS_SMALL = H < 740;
const IS_TINY = H < 680;
const IS_NARROW = W < 360;

const BG = require('../assets/background1.png');
const ON1 = require('../assets/onboard1.png');
const ON2 = require('../assets/onboard2.png');
const ON3 = require('../assets/onboard3.png');
const ON4 = require('../assets/onboard4.png');
const ON5 = require('../assets/onboard5.png');

type Slide = {
  key: string;
  image: any;
  title: string;
  desc: string;
  button: string;
  isPrivacy?: boolean;
};

export default function OnboardScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();

  const slides: Slide[] = useMemo(
    () => [
      {
        key: '1',
        image: ON1,
        title: 'Hello. I will be your guide!',
        desc:
          "I will be there to show you the city as most everyone sees it. Let’s start with places where the architecture speaks for itself.",
        button: 'HELLO!',
      },
      {
        key: '2',
        image: ON2,
        title: 'Navigate easily',
        desc:
          "I will help you not to get lost. Save the places you want to visit and see how they are arranged in a route on the map.",
        button: 'CONTINUE',
      },
      {
        key: '3',
        image: ON3,
        title: 'Test your knowledge',
        desc:
          'Want to go further? I have prepared questions that reveal details that only the attentive notice.',
        button: 'OKAY',
      },
      {
        key: '4',
        image: ON4,
        title: 'Become a city expert',
        desc:
          'Pass all the levels — and I will personally present you with a certificate of city expert. Not everyone will get it.',
        button: 'NEXT',
      },
      {
        key: '5',
        image: ON5,
        title: 'Privacy policy',
        desc:
          'To personalize the app, we ask for minimal information: your name, a short description about yourself, and a profile photo.\n\nThis data is stored only on your device and is not shared with third parties.\n\nWe do not use analytics, advertising, or tracking.\n\nYou can change or delete this data at any time.',
        button: 'I AGREE',
        isPrivacy: true,
      },
    ],
    []
  );

  const [index, setIndex] = useState(0);

  const fade = useRef(new Animated.Value(0)).current;
  const heroScaleAnim = useRef(new Animated.Value(0.96)).current;
  const heroYAnim = useRef(new Animated.Value(14)).current;

  const cardFade = useRef(new Animated.Value(0)).current;
  const cardYAnim = useRef(new Animated.Value(22)).current;

  const topPad = Math.max(insets.top, 14);
  const bottomPad = Math.max(insets.bottom, 14);

  const cardW = Math.min(W * 0.9, 420);
  const cardPad = IS_TINY ? 12 : 14;
  const cardRadius = 18;

  const btnH = IS_TINY ? 44 : 48;

  const SKIP_W = 46;
  const SKIP_H = 26;

  const cardRaise = 40;

  const animateIn = () => {
    fade.setValue(0);
    heroScaleAnim.setValue(0.96);
    heroYAnim.setValue(14);

    cardFade.setValue(0);
    cardYAnim.setValue(22);

    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 360,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(heroYAnim, {
        toValue: 0,
        duration: 520,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(cardFade, {
        toValue: 1,
        duration: 420,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(cardYAnim, {
        toValue: 0,
        duration: 520,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(heroScaleAnim, {
        toValue: 1,
        speed: 12,
        bounciness: 6,
        useNativeDriver: true,
      }),
    ]).start();
  };

  useEffect(() => {
    animateIn();
  }, [index]);

  const goNext = () => {
    if (index < slides.length - 1) setIndex(index + 1);
    else navigation.replace('CreateProfile1');
  };

  const skip = () => {
    navigation.replace('CreateProfile1');
  };

  const slide = slides[index];

  const baseHeroW = Math.min(W * 0.88, IS_NARROW ? 300 : 380);
  const baseHeroH = Math.min(H * (IS_TINY ? 0.42 : 0.46), IS_TINY ? 320 : 420);

  const baseOffset =
    index === 0 ? 0 : index === 1 ? 30 : 20;

  const extraDown2345 = index >= 1 && index <= 4 ? 70 : 0;

  const heroYExtra = baseOffset + extraDown2345;

  const heroScaleStatic = index >= 2 ? 0.86 : 1;

  const heroW = Math.round(baseHeroW * heroScaleStatic);
  const heroH = Math.round(baseHeroH * heroScaleStatic);

  const titleFont = IS_TINY ? 13 : 14;
  const descFont = IS_TINY ? 10.5 : 11;

  return (
    <ImageBackground source={BG} style={styles.bg} resizeMode="cover">
      <View
        style={[
          styles.topRow,
          {
            paddingTop: topPad + 6 + 20 + 20,
            paddingHorizontal: 16,
          },
        ]}
      >
        <View style={{ width: SKIP_W }} />
        <Pressable onPress={skip} hitSlop={10} style={[styles.skipBtn, { width: SKIP_W, height: SKIP_H }]}>
          <Text style={styles.skipText}>SKIP</Text>
        </Pressable>
      </View>

      <View style={styles.wrap}>
        {index === 0 ? (
          <View style={styles.firstTightLayout}>
            <Animated.View
              style={[
                styles.heroWrap,
                {
                  width: heroW,
                  height: heroH,
                  opacity: fade,
                  transform: [{ translateY: heroYAnim }, { scale: heroScaleAnim }],
                },
              ]}
            >
              <Image source={slide.image} style={styles.heroImg} resizeMode="contain" />
            </Animated.View>

            <Animated.View
              style={[
                styles.card,
                {
                  width: cardW,
                  borderRadius: cardRadius,
                  padding: cardPad,
                  marginTop: IS_TINY ? 8 : 10,
                  marginBottom: bottomPad + (IS_TINY ? 10 : 14) + cardRaise,
                  opacity: cardFade,
                  transform: [{ translateY: cardYAnim }],
                },
              ]}
            >
              <Text style={[styles.cardTitle, { fontSize: titleFont }]}>{slide.title}</Text>

              <Text
                style={[
                  styles.cardDesc,
                  {
                    fontSize: descFont,
                    lineHeight: IS_TINY ? 16 : 17,
                    marginBottom: IS_TINY ? 10 : 12,
                  },
                ]}
                numberOfLines={IS_TINY ? 4 : 3}
              >
                {slide.desc}
              </Text>

              <Pressable style={[styles.btn, { height: btnH, width: IS_NARROW ? '84%' : '78%' }]} onPress={goNext}>
                <Text style={styles.btnText}>{slide.button}</Text>
              </Pressable>
            </Animated.View>
          </View>
        ) : (
          <>
            <Animated.View
              style={[
                styles.heroWrap,
                {
                  marginTop: Math.max(topPad + (IS_TINY ? 10 : 18), 18) + heroYExtra,
                  width: heroW,
                  height: heroH,
                  opacity: fade,
                  transform: [{ translateY: heroYAnim }, { scale: heroScaleAnim }],
                },
              ]}
            >
              <Image source={slide.image} style={styles.heroImg} resizeMode="contain" />
            </Animated.View>

            <View style={{ flex: 1 }} />

            <Animated.View
              style={[
                styles.card,
                {
                  width: cardW,
                  borderRadius: cardRadius,
                  padding: cardPad,
                  marginBottom: bottomPad + (IS_TINY ? 10 : 14) + cardRaise,
                  opacity: cardFade,
                  transform: [{ translateY: cardYAnim }],
                },
              ]}
            >
              <Text style={[styles.cardTitle, { fontSize: titleFont }]}>{slide.title}</Text>

              <Text
                style={[
                  styles.cardDesc,
                  {
                    fontSize: descFont,
                    lineHeight: slide.isPrivacy ? (IS_TINY ? 15 : 16) : IS_TINY ? 16 : 17,
                    marginBottom: IS_TINY ? 10 : 12,
                  },
                ]}
                numberOfLines={slide.isPrivacy ? 0 : IS_TINY ? 4 : 3}
              >
                {slide.desc}
              </Text>

              <Pressable style={[styles.btn, { height: btnH, width: IS_NARROW ? '84%' : '78%' }]} onPress={goNext}>
                <Text style={styles.btnText}>{slide.button}</Text>
              </Pressable>
            </Animated.View>
          </>
        )}
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: '#000' },
  wrap: { flex: 1, alignItems: 'center' },
  firstTightLayout: { flex: 1, alignItems: 'center', justifyContent: 'flex-end' },
  topRow: { position: 'absolute', zIndex: 10, top: 0, left: 0, right: 0, alignItems: 'flex-end', flexDirection: 'row', justifyContent: 'space-between' },
  skipBtn: { alignItems: 'center', justifyContent: 'center', borderRadius: 10, backgroundColor: 'rgba(0,0,0,0.18)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.14)' },
  skipText: { color: '#fff', fontSize: 11, fontWeight: '900', letterSpacing: 0.4, opacity: 0.95 },
  heroWrap: { alignItems: 'center', justifyContent: 'center' },
  heroImg: { width: '100%', height: '100%' },
  card: { backgroundColor: 'rgba(40, 0, 0, 0.86)', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.10)' },
  cardTitle: { color: '#fff', fontWeight: '900', textAlign: 'center', marginBottom: 8 },
  cardDesc: { color: 'rgba(255,255,255,0.78)', fontWeight: '600', textAlign: 'center' },
  btn: { alignSelf: 'center', borderRadius: 14, backgroundColor: '#F3D34A', alignItems: 'center', justifyContent: 'center' },
  btnText: { color: '#000', fontSize: 13, fontWeight: '900', letterSpacing: 0.6 },
});