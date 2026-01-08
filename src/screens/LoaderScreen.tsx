import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, Easing, Image, ImageBackground, StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Loader'>;

const BG = require('../assets/background.png');
const LOGO = require('../assets/logo.png');

const { width: W, height: H } = Dimensions.get('window');
const IS_SMALL = H < 740;
const IS_TINY = H < 680;
const IS_NARROW = W < 360;

export default function LoaderScreen({ navigation }: Props) {
  const logoScale = useRef(new Animated.Value(0.86)).current;
  const logoY = useRef(new Animated.Value(14)).current;
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 420,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(logoY, {
        toValue: 0,
        duration: 520,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        speed: 12,
        bounciness: 7,
        useNativeDriver: true,
      }),
    ]).start();

    const t = setTimeout(() => {
      navigation.replace('Onboard');
    }, 3000);

    return () => clearTimeout(t);
  }, [fade, logoScale, logoY, navigation]);

  const logoSize = IS_TINY ? 170 : IS_SMALL ? 200 : 240;
  const maxLogoW = IS_NARROW ? Math.min(W - 64, 220) : Math.min(W - 72, 260);
  const finalSize = Math.min(logoSize, maxLogoW);

  return (
    <ImageBackground source={BG} style={styles.bg} resizeMode="cover">
      <View style={styles.center}>
        <Animated.View
          style={[
            styles.animWrap,
            {
              opacity: fade,
              transform: [{ translateY: logoY }, { scale: logoScale }],
            },
          ]}
        >
          <Image source={LOGO} style={[styles.logo, { width: finalSize, height: finalSize }]} resizeMode="contain" />
        </Animated.View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  animWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {},
});
