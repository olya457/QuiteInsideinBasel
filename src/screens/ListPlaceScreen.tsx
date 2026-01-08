import React, { useMemo, useRef } from 'react';
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
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { BASEL_PLACES } from '../data/placesBasel';

type Props = NativeStackScreenProps<RootStackParamList, 'ListPlace'>;

const { width: W, height: H } = Dimensions.get('window');
const IS_TINY = H < 700;
const IS_VERY_TINY = H < 640;
const IS_NARROW = W < 360;

const BG = require('../assets/background1.png');

export default function ListPlaceScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();

  const data = useMemo(() => BASEL_PLACES, []);

  const topPad = Math.max(insets.top, 12);
  const bottomPad = Math.max(insets.bottom, 12);

  const SHIFT_DOWN = 20;

  const contentW = Math.min(W * 0.92, 430);

  const imgSize = IS_VERY_TINY ? (IS_NARROW ? 72 : 78) : IS_NARROW ? 78 : 86;
  const cardMinH = IS_VERY_TINY ? 82 : IS_TINY ? 88 : 94;

  const openH = IS_VERY_TINY ? 38 : 40;
  const openPadX = IS_VERY_TINY ? 16 : 18;

  const fade = useRef(new Animated.Value(0)).current;
  const y = useRef(new Animated.Value(14)).current;
  const scale = useRef(new Animated.Value(0.985)).current;

  React.useEffect(() => {
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

  const goBack = () => navigation.goBack();

  return (
    <ImageBackground source={BG} style={styles.bg} resizeMode="cover">
      <View
        style={[
          styles.screen,
          {
            paddingTop: topPad + 10 + SHIFT_DOWN,
            paddingBottom: bottomPad + 10,
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
              marginBottom: IS_VERY_TINY ? 10 : 14,
            },
          ]}
        >
          <Pressable onPress={goBack} hitSlop={10} style={styles.backRow}>
            <Text style={styles.backArrow}>←</Text>
            <Text style={styles.backTitle}>Popular place</Text>
          </Pressable>
        </Animated.View>
        <Animated.View
          style={{
            width: contentW,
            flex: 1,
            opacity: fade,
            transform: [{ translateY: y }],
          }}
        >
          <FlatList
            data={data}
            keyExtractor={(it) => it.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingBottom: bottomPad + 14 + 40, 
            }}
            ItemSeparatorComponent={() => <View style={{ height: IS_VERY_TINY ? 10 : 12 }} />}
            renderItem={({ item, index }) => {
              const itemDelay = Math.min(220, index * 28);

              const itemFade = fade.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 1],
                extrapolate: 'clamp',
              });

              const itemY = y.interpolate({
                inputRange: [0, 14],
                outputRange: [0, 14],
                extrapolate: 'clamp',
              });

              return (
                <Animated.View
                  style={{
                    opacity: itemFade,
                    transform: [{ translateY: itemY }],
                  }}
                >
                  <View style={[styles.card, { minHeight: cardMinH }]}>
                    <Image source={item.image} style={[styles.cardImg, { width: imgSize, height: imgSize }]} />

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
                      style={[
                        styles.openBtn,
                        {
                          height: openH,
                          paddingHorizontal: openPadX,
                          borderRadius: 18,
                        },
                      ]}
                      android_ripple={{ color: 'rgba(0,0,0,0.12)' }}
                    >
                      <Text style={styles.openText}>Open</Text>
                    </Pressable>
                  </View>
                </Animated.View>
              );
            }}
          />
        </Animated.View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: '#000' },
  screen: { flex: 1, alignItems: 'center' },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  backRow: { flexDirection: 'row', alignItems: 'center' },
  backArrow: {
    color: '#fff',
    fontSize: 22, 
    fontWeight: '900',
    marginRight: 10,
  },
  backTitle: {
    color: '#fff',
    fontSize: 22, 
    fontWeight: '900',
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
    paddingRight: 12,
    paddingVertical: 10,
  },
  cardImg: {
    marginLeft: 10,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  cardMid: {
    flex: 1,
    paddingLeft: 12,
    paddingRight: 10,
  },
  cardTitle: { color: '#fff', fontSize: 14, fontWeight: '900' },
  cardCoords: { color: 'rgba(255,255,255,0.70)', fontSize: 11, fontWeight: '800', marginTop: 4 },

  openBtn: {
    backgroundColor: '#F3D34A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  openText: { color: '#000', fontSize: 14, fontWeight: '900' },
});
