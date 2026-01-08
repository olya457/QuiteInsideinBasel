import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Image,
  ImageBackground,
  Pressable,
  Share,
  StyleSheet,
  Text,
  View,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'ClosedQuiz'>;

type QuizId = 'quiz1' | 'quiz2' | 'quiz3';
type Mode = 'list' | 'play' | 'result' | 'allPassed' | 'certificate';

const { width: W, height: H } = Dimensions.get('window');
const IS_TINY = H < 720;
const IS_VERY_TINY = H < 660;
const IS_NARROW = W < 360;

const BG = require('../assets/background1.png');
const GUIDE = require('../assets/guide_girl.png');
const CERT = require('../assets/certificate.png');
const ONBOARD3 = require('../assets/onboard3.png');

const KEY_PROGRESS = 'basel_quiz_progress_v1';
const KEY_NAME = 'profile_name_v1';

type Progress = Record<QuizId, { best: number; passed: boolean }>;

const DEFAULT_PROGRESS: Progress = {
  quiz1: { best: 0, passed: false },
  quiz2: { best: 0, passed: false },
  quiz3: { best: 0, passed: false },
};

type Question = {
  q: string;
  options: Array<{ t: string; correct?: boolean }>;
};

const QUIZ_1: Question[] = [
  { q: 'Which river flows through Basel?', options: [{ t: 'A) Danube' }, { t: 'B) Rhine', correct: true }, { t: 'C) Seine' }] },
  { q: 'The main cathedral of Basel is called:', options: [{ t: 'A) Basel Minster', correct: true }, { t: 'B) St. Peter' }, { t: 'C) Grosskirche' }] },
  { q: 'The oldest bridge over the Rhine in Basel:', options: [{ t: 'A) Mittlere Brücke', correct: true }, { t: 'B) Trinity Bridge' }, { t: 'C) Old Cross' }] },
  { q: 'What color is the Basel town hall?', options: [{ t: 'A) Blue' }, { t: 'B) Red', correct: true }, { t: 'C) White' }] },
  { q: 'What is the name of the old town of Basel?', options: [{ t: 'A) Altstadt', correct: true }, { t: 'B) Downtown' }, { t: 'C) Old Core' }] },
  { q: 'Medieval gate tower:', options: [{ t: 'A) Spalentor', correct: true }, { t: 'B) City Gate' }, { t: 'C) North Tower' }] },
  { q: 'Famous kinetic fountain in the center:', options: [{ t: 'A) Tinguely Fountain', correct: true }, { t: 'B) Art Well' }, { t: 'C) Motion Pool' }] },
  { q: 'Main square with market:', options: [{ t: 'A) Marktplatz', correct: true }, { t: 'B) Central Square' }, { t: 'C) Market Hall' }] },
  { q: 'Museum of modern art next to the park:', options: [{ t: 'A) Fondation Beyeler', correct: true }, { t: 'B) Art House' }, { t: 'C) Modern Hall' }] },
  { q: 'River divides the city into two parts:', options: [{ t: 'A) Rhine', correct: true }, { t: 'B) Main' }, { t: 'C) Po' }] },
];

const QUIZ_2: Question[] = [
  { q: 'The tallest building in Basel:', options: [{ t: 'A) Roche Tower', correct: true }, { t: 'B) City Spire' }, { t: 'C) Basel Point' }] },
  { q: 'The ancient city gate:', options: [{ t: 'A) Spalentor', correct: true }, { t: 'B) West Gate' }, { t: 'C) Iron Gate' }] },
  { q: 'Museum of moving sculptures:', options: [{ t: 'A) Museum Tinguely', correct: true }, { t: 'B) Motion Art' }, { t: 'C) Steel Lab' }] },
  { q: 'Canal district:', options: [{ t: 'A) St. Alban', correct: true }, { t: 'B) Old Port' }, { t: 'C) Water Town' }] },
  { q: 'Main Market Square:', options: [{ t: 'A) Marktplatz', correct: true }, { t: 'B) Food Square' }, { t: 'C) Trade Yard' }] },
  { q: 'Summer Swimming River:', options: [{ t: 'A) Rhine', correct: true }, { t: 'B) Aare' }, { t: 'C) Rhône' }] },
  { q: 'Paper and Printing Museum:', options: [{ t: 'A) Paper Mill', correct: true }, { t: 'B) Print House' }, { t: 'C) Ink Lab' }] },
  { q: 'Architectural Campus Near the City:', options: [{ t: 'A) Vitra Campus', correct: true }, { t: 'B) Design Park' }, { t: 'C) Build Zone' }] },
  { q: 'Bridge Between Three Countries:', options: [{ t: 'A) Three Countries Bridge', correct: true }, { t: 'B) Unity Bridge' }, { t: 'C) Border Way' }] },
  { q: 'Old Town Center:', options: [{ t: 'A) Altstadt', correct: true }, { t: 'B) Old Town' }, { t: 'C) Core City' }] },
  { q: 'Cathedral Towers by Number:', options: [{ t: 'A) Two', correct: true }, { t: 'B) Three' }, { t: 'C) One' }] },
  { q: 'Fountain Near the Theater:', options: [{ t: 'A) Tinguely Fountain', correct: true }, { t: 'B) Opera Well' }, { t: 'C) City Flow' }] },
  { q: 'District Along Rhine:', options: [{ t: 'A) Rhine Promenade', correct: true }, { t: 'B) River Walk' }, { t: 'C) Blue Line' }] },
  { q: 'Modern symbol of the city:', options: [{ t: 'A) Roche Tower', correct: true }, { t: 'B) Clock Hall' }, { t: 'C) Glass Dome' }] },
  { q: 'The city is known for art:', options: [{ t: 'A) Yes', correct: true }, { t: 'B) No' }, { t: 'C) Partially' }] },
];

const QUIZ_3: Question[] = [
  { q: "Basel's main river:", options: [{ t: 'A) Rhine', correct: true }, { t: 'B) Main' }, { t: 'C) Po' }] },
  { q: 'Red government building:', options: [{ t: 'A) Town Hall', correct: true }, { t: 'B) City Court' }, { t: 'C) State House' }] },
  { q: 'Museum of Modern Art:', options: [{ t: 'A) Fondation Beyeler', correct: true }, { t: 'B) Art Base' }, { t: 'C) Modern Hub' }] },
  { q: 'Medieval gate:', options: [{ t: 'A) Spalentor', correct: true }, { t: 'B) Old Gate' }, { t: 'C) North Arch' }] },
  { q: 'Tallest skyscraper:', options: [{ t: 'A) Roche Tower', correct: true }, { t: 'B) Basel Rise' }, { t: 'C) Sky Point' }] },
  { q: 'Old bridge over the Rhine:', options: [{ t: 'A) Mittlere Brücke', correct: true }, { t: 'B) Stone Way' }, { t: 'C) Old Line' }] },
  { q: 'Kinetic fountain:', options: [{ t: 'A) Tinguely Fountain', correct: true }, { t: 'B) Motion Pool' }, { t: 'C) Art Drop' }] },
  { q: 'Canal district:', options: [{ t: 'A) St. Alban', correct: true }, { t: 'B) Water Side' }, { t: 'C) Mill Town' }] },
  { q: 'Main Square:', options: [{ t: 'A) Marktplatz', correct: true }, { t: 'B) City Square' }, { t: 'C) Trade Point' }] },
  { q: 'Paper Museum:', options: [{ t: 'A) Paper Mill', correct: true }, { t: 'B) Book Hall' }, { t: 'C) Print Lab' }] },
  { q: 'Promenade:', options: [{ t: 'A) Rhine Promenade', correct: true }, { t: 'B) River Park' }, { t: 'C) Water Lane' }] },
  { q: 'Architecture Campus:', options: [{ t: 'A) Vitra Campus', correct: true }, { t: 'B) Design Yard' }, { t: 'C) Build Lab' }] },
  { q: 'Museum of Movement and Mechanics:', options: [{ t: 'A) Museum Tinguely', correct: true }, { t: 'B) Steel Art' }, { t: 'C) Motion Lab' }] },
  { q: 'Church with neo-Gothic:', options: [{ t: 'A) Elisabethenkirche', correct: true }, { t: 'B) City Chapel' }, { t: 'C) Old Church' }] },
  { q: 'Church-museum in the center:', options: [{ t: 'A) Barfüsserkirche', correct: true }, { t: 'B) Art Church' }, { t: 'C) Stone Hall' }] },
  { q: 'Bridge between countries:', options: [{ t: 'A) Three Countries Bridge', correct: true }, { t: 'B) Border Bridge' }, { t: 'C) Unity Way' }] },
  { q: 'Part of the city with history:', options: [{ t: 'A) Altstadt', correct: true }, { t: 'B) Old Zone' }, { t: 'C) Core' }] },
  { q: 'The city is located in:', options: [{ t: 'A) Switzerland', correct: true }, { t: 'B) France' }, { t: 'C) Germany' }] },
  { q: 'A river divides the city:', options: [{ t: 'A) Yes', correct: true }, { t: 'B) No' }, { t: 'C) Partially' }] },
  { q: 'Basel is a cultural center:', options: [{ t: 'A) Yes', correct: true }, { t: 'B) No' }, { t: 'C) Maybe' }] },
];

function getQuiz(quizId: QuizId): { title: string; questions: Question[] } {
  if (quizId === 'quiz1') return { title: 'Quiz 1', questions: QUIZ_1 };
  if (quizId === 'quiz2') return { title: 'Quiz 2', questions: QUIZ_2 };
  return { title: 'Quiz 3', questions: QUIZ_3 };
}

async function readProgress(): Promise<Progress> {
  try {
    const raw = await AsyncStorage.getItem(KEY_PROGRESS);
    if (!raw) return DEFAULT_PROGRESS;
    const obj = JSON.parse(raw);

    const safe = (id: QuizId) => ({
      best: Number(obj?.[id]?.best ?? 0),
      passed: Boolean(obj?.[id]?.passed ?? false),
    });

    return { quiz1: safe('quiz1'), quiz2: safe('quiz2'), quiz3: safe('quiz3') };
  } catch {
    return DEFAULT_PROGRESS;
  }
}

async function patchProgress(quizId: QuizId, best: number, passed: boolean) {
  try {
    const raw = await AsyncStorage.getItem(KEY_PROGRESS);
    const obj = raw ? JSON.parse(raw) : {};
    const prevBest = Number(obj?.[quizId]?.best ?? 0);
    const prevPassed = Boolean(obj?.[quizId]?.passed ?? false);
    obj[quizId] = { best: Math.max(prevBest, best), passed: prevPassed || passed };
    await AsyncStorage.setItem(KEY_PROGRESS, JSON.stringify(obj));
  } catch {}
}

async function readName(): Promise<string> {
  try {
    return (await AsyncStorage.getItem(KEY_NAME)) ?? '';
  } catch {
    return '';
  }
}

export default function ClosedQuizScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const topPad = Math.max(insets.top, 12);
  const bottomPad = Math.max(insets.bottom, 12);

  const EXTRA_DOWN = 20;
  const CARD_DOWN_FROM_HEADER = 20;

  const contentW = Math.min(W * 0.92, 430);

  const [mode, setMode] = useState<Mode>('list');
  const [progress, setProgress] = useState<Progress>(DEFAULT_PROGRESS);
  const [activeQuiz, setActiveQuiz] = useState<QuizId>('quiz1');

  const [qIndex, setQIndex] = useState(0);
  const [score, setScore] = useState(0);

  const [profileName, setProfileName] = useState('');

  const fade = useRef(new Animated.Value(0)).current;
  const y = useRef(new Animated.Value(18)).current;
  const scale = useRef(new Animated.Value(0.985)).current;

  const stepAnim = useRef(new Animated.Value(1)).current;
  const listAnim = useRef(new Animated.Value(0)).current;

  const { title, questions } = useMemo(() => getQuiz(activeQuiz), [activeQuiz]);
  const total = questions.length;

  const allPassed = progress.quiz1.passed && progress.quiz2.passed && progress.quiz3.passed;

  const unlocked = useMemo(() => {
    return {
      quiz1: true,
      quiz2: progress.quiz1.passed,
      quiz3: progress.quiz2.passed,
    } as const;
  }, [progress.quiz1.passed, progress.quiz2.passed]);

  const resetPlay = (quizId: QuizId) => {
    setActiveQuiz(quizId);
    setQIndex(0);
    setScore(0);
  };

  const load = async () => {
    const p = await readProgress();
    setProgress(p);
    const name = await readName();
    setProfileName(name);

    if (p.quiz1.passed && p.quiz2.passed && p.quiz3.passed) {
      if (mode === 'list') setMode('allPassed');
    }
  };

  const runAppear = () => {
    fade.setValue(0);
    y.setValue(18);
    scale.setValue(0.985);

    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 320, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(y, { toValue: 0, duration: 520, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, speed: 12, bounciness: 6, useNativeDriver: true }),
    ]).start();
  };

  const runListStagger = () => {
    listAnim.setValue(0);
    Animated.timing(listAnim, { toValue: 1, duration: 520, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  };

  useEffect(() => {
    runAppear();
    runListStagger();

    const unsub = navigation.addListener('focus', () => {
      load();
      runAppear();
      runListStagger();
    });
    load();
    return unsub;
  
  }, []);

  useEffect(() => {
    runAppear();
    if (mode === 'list') runListStagger();
 
  }, [mode]);

  const goBackSmart = () => {
    if (mode === 'play' || mode === 'result' || mode === 'allPassed') {
      setMode('list');
      return;
    }
    if (mode === 'certificate') {
      setMode('allPassed');
      return;
    }
    navigation.goBack();
  };

  const animateStep = (next: () => void) => {
    stepAnim.setValue(1);
    Animated.sequence([
      Animated.timing(stepAnim, { toValue: 0, duration: 120, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(stepAnim, { toValue: 1, duration: 220, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
    setTimeout(next, 120);
  };

  const onPick = async (isCorrect: boolean) => {
    const nextScore = isCorrect ? score + 1 : score;

    if (qIndex + 1 >= total) {
      const passed = nextScore === total;
      await patchProgress(activeQuiz, nextScore, passed);
      const p = await readProgress();
      setProgress(p);

      setScore(nextScore);
      setMode('result');
      return;
    }

    animateStep(() => {
      setScore(nextScore);
      setQIndex((v) => v + 1);
    });
  };

  const onShare = async () => {
    try {
      const msg =
        mode === 'certificate'
          ? `Basel Expert Certificate\n${(profileName || 'Name').trim()}`
          : `${title}\n${mode === 'result' && score === total ? 'Quiz completed!' : 'Quiz result'}\n${score}/${total}`;
      await Share.share({ message: msg });
    } catch {}
  };

  const cardH = Math.min(H * 0.55, IS_VERY_TINY ? 410 : 470);

  const stepOpacity = stepAnim;
  const stepTranslateY = stepAnim.interpolate({ inputRange: [0, 1], outputRange: [6, 0] });

  const listGap = (IS_VERY_TINY ? 10 : 12) + 10;
  const iconSize = IS_NARROW ? 54 : IS_VERY_TINY ? 56 : 60;

  return (
    <ImageBackground source={BG} style={styles.bg} resizeMode="cover">
      <View style={[styles.screen, { paddingTop: topPad + 10 + EXTRA_DOWN, paddingBottom: bottomPad + 10 }]}>
        <Animated.View
          style={[
            styles.topBar,
            { width: contentW, opacity: fade, transform: [{ translateY: y }, { scale }], marginBottom: IS_VERY_TINY ? 10 : 12 },
          ]}
        >
          <Pressable onPress={goBackSmart} style={styles.backRow} hitSlop={10}>
            <Text style={styles.backArrow}>←</Text>
            <Text style={styles.backTitle}>Quiz</Text>
          </Pressable>
        </Animated.View>

        {mode === 'list' ? (
          <ScrollView
            style={{ width: contentW, flex: 1 }}
            contentContainerStyle={{ paddingBottom: 18 }}
            showsVerticalScrollIndicator={false}
          >
            {(['quiz1', 'quiz2', 'quiz3'] as QuizId[]).map((id, idx) => {
              const isOn = unlocked[id];
              const quizTitle = id === 'quiz1' ? 'Quiz 1' : id === 'quiz2' ? 'Quiz 2' : 'Quiz 3';
              const count = id === 'quiz1' ? 10 : id === 'quiz2' ? 15 : 20;
              const best = progress[id].best;

              const itemOpacity = listAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });
              const itemTranslateY = listAnim.interpolate({ inputRange: [0, 1], outputRange: [14 + idx * 6, 0] });

              return (
                <Animated.View
                  key={id}
                  style={[
                    styles.quizCard,
                    {
                      width: contentW,
                      opacity: itemOpacity,
                      transform: [{ translateY: itemTranslateY }],
                      minHeight: IS_VERY_TINY ? 92 : IS_TINY ? 100 : 112,
                      marginTop: idx === 0 ? 0 : listGap,
                    },
                  ]}
                >
                  <View style={styles.quizLeft}>
                    <Text style={styles.quizTitle}>{quizTitle}</Text>
                    <Text style={styles.quizMeta}>
                      {count} questions {best > 0 ? `• best ${best}/${count}` : ''}
                    </Text>

                    <Pressable
                      disabled={!isOn}
                      onPress={() => {
                        resetPlay(id);
                        setMode('play');
                      }}
                      style={[
                        styles.startBtn,
                        { height: IS_VERY_TINY ? 34 : 38, width: IS_NARROW ? 86 : 98 },
                        isOn ? styles.startBtnOn : styles.startBtnOff,
                      ]}
                    >
                      <Text style={[styles.startText, isOn ? styles.startTextOn : styles.startTextOff]}>Start</Text>
                    </Pressable>
                  </View>

                  <View style={styles.quizRight}>
                    <Image
                      source={ONBOARD3}
                      style={{ width: iconSize, height: iconSize, opacity: isOn ? 0.95 : 0.55 }}
                      resizeMode="contain"
                    />
                  </View>

                  {idx !== 0 && !isOn ? <View style={styles.lockDim} /> : null}
                </Animated.View>
              );
            })}
          </ScrollView>
        ) : null}

        {mode === 'play' ? (
          <Animated.View
            style={[
              styles.playCard,
              {
                width: contentW,
                minHeight: cardH,
                opacity: fade,
                transform: [{ translateY: y }],
                marginTop: CARD_DOWN_FROM_HEADER,
              },
            ]}
          >
            <Animated.View style={{ flex: 1, opacity: stepOpacity, transform: [{ translateY: stepTranslateY }] }}>
      
              <View style={{ alignItems: 'center' }}>
                <Text style={[styles.playTitle, IS_VERY_TINY && { fontSize: 15 }]}>{title}</Text>
                <Text style={styles.playProgress}>
                  {qIndex + 1}/{total}
                </Text>
              </View>

              {IS_VERY_TINY ? (
                <ScrollView
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center' }}
                >
                  <View style={{ width: '100%', alignItems: 'center' }}>
                    <Text style={styles.qTextCenter}>{questions[qIndex]?.q ?? 'Question'}</Text>

                    <View style={{ height: 14 }} />

                    <View style={{ width: '100%' }}>
                      {(questions[qIndex]?.options ?? []).map((op, i) => (
                        <Pressable
                          key={`${qIndex}_${i}`}
                          onPress={() => onPick(Boolean(op.correct))}
                          style={[styles.ansBtn, { marginTop: i === 0 ? 0 : 14 }]}
                        >
                          <Text style={[styles.ansText, { fontSize: 15 }]}>{op.t}</Text>
                        </Pressable>
                      ))}
                    </View>
                  </View>
                </ScrollView>
              ) : (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                  <View style={{ width: '100%', alignItems: 'center' }}>
                    <Text style={styles.qTextCenter}>{questions[qIndex]?.q ?? 'Question'}</Text>

                    <View style={{ height: 14 }} />

                    <View style={{ width: '100%' }}>
                      {(questions[qIndex]?.options ?? []).map((op, i) => (
                        <Pressable
                          key={`${qIndex}_${i}`}
                          onPress={() => onPick(Boolean(op.correct))}
                          style={[styles.ansBtn, { marginTop: i === 0 ? 0 : 14 }]}
                        >
                          <Text style={styles.ansText}>{op.t}</Text>
                        </Pressable>
                      ))}
                    </View>
                  </View>
                </View>
              )}
            </Animated.View>
          </Animated.View>
        ) : null}

        {mode === 'result' ? (
          <ScrollView
            style={{ width: contentW, flex: 1 }}
            contentContainerStyle={{ paddingBottom: 18 }}
            showsVerticalScrollIndicator={false}
          >
            <Animated.View
              style={[
                styles.resultCard,
                {
                  width: contentW,
                  minHeight: Math.min(H * 0.62, IS_VERY_TINY ? 520 : 560),
                  opacity: fade,
                  transform: [{ translateY: y }],
                  marginTop: CARD_DOWN_FROM_HEADER,
                },
              ]}
            >
              <View style={styles.resultHeader}>
                <Text style={styles.resultTitle}>{score === total ? 'Quiz completed!' : 'Quiz not completed!'}</Text>
                {score === total ? <View style={styles.greenDot} /> : null}
              </View>

              <Text style={styles.resultScore}>
                {score}/{total}
              </Text>

              <View style={{ height: 14 }} />

              {score === total ? (
                <Image source={GUIDE} style={styles.resultImg} resizeMode="contain" />
              ) : (
                <Image source={ONBOARD3} style={styles.resultImg} resizeMode="contain" />
              )}

              <View style={{ flex: 1 }} />

              <Pressable
                onPress={() => {
                  resetPlay(activeQuiz);
                  setMode('play');
                }}
                style={styles.bigBtn}
              >
                <Text style={styles.bigBtnText}>Repeat</Text>
              </Pressable>

              <Pressable onPress={onShare} style={[styles.bigBtn, { marginTop: 10 }]}>
                <Text style={styles.bigBtnText}>Share</Text>
              </Pressable>

              <Pressable
                onPress={() => {
                  if (allPassed) setMode('allPassed');
                  else setMode('list');
                }}
                style={styles.homeMini}
                hitSlop={10}
              >
                <Text style={styles.homeMiniText}>⌂</Text>
              </Pressable>
            </Animated.View>
          </ScrollView>
        ) : null}

        {mode === 'allPassed' ? (
          <ScrollView
            style={{ width: contentW, flex: 1 }}
            contentContainerStyle={{ paddingBottom: 18 }}
            showsVerticalScrollIndicator={false}
          >
            <Animated.View
              style={[
                styles.passedCard,
                { width: contentW, opacity: fade, transform: [{ translateY: y }], marginTop: CARD_DOWN_FROM_HEADER },
              ]}
            >
              <Text style={styles.passedTitle}>ALL QUIZZES{'\n'}PASSED!</Text>
              <Text style={styles.passedSub}>
                You passed all the quiz levels and{'\n'}unlocked the Basel expert certificate.
              </Text>

              <Pressable onPress={() => setMode('certificate')} style={[styles.bigBtn, { marginTop: 12 }]}>
                <Text style={styles.bigBtnText}>OPEN CERTIFICATE</Text>
              </Pressable>

              <Image source={GUIDE} style={styles.passedGirl} resizeMode="contain" />
            </Animated.View>
          </ScrollView>
        ) : null}

        {mode === 'certificate' ? (
          <ScrollView
            style={{ width: contentW, flex: 1 }}
            contentContainerStyle={{ paddingBottom: 18 }}
            showsVerticalScrollIndicator={false}
          >
            <Animated.View
              style={[styles.certWrap, { width: contentW, opacity: fade, transform: [{ translateY: y }], marginTop: CARD_DOWN_FROM_HEADER }]}
            >
              <View style={styles.certCard}>
                <Image source={CERT} style={styles.certImg} resizeMode="contain" />
                <Text style={styles.certName}>{(profileName || 'Name').trim()}</Text>
              </View>

              <Pressable onPress={onShare} style={styles.bigBtn}>
                <Text style={styles.bigBtnText}>Share</Text>
              </Pressable>
            </Animated.View>
          </ScrollView>
        ) : null}
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

  quizCard: {
    borderRadius: 24,
    backgroundColor: 'rgba(60, 0, 0, 0.88)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: IS_VERY_TINY ? 12 : 14,
    paddingVertical: IS_VERY_TINY ? 12 : 14,
  },
  quizLeft: { flex: 1, paddingRight: 12 },
  quizTitle: { color: '#fff', fontSize: 14, fontWeight: '900' },
  quizMeta: { color: 'rgba(255,255,255,0.70)', fontSize: 11.5, fontWeight: '800', marginTop: 6 },

  startBtn: { marginTop: IS_VERY_TINY ? 10 : 12, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  startBtnOn: { backgroundColor: '#F3D34A' },
  startBtnOff: { backgroundColor: 'rgba(255,255,255,0.10)' },
  startText: { fontSize: 13, fontWeight: '900' },
  startTextOn: { color: '#000' },
  startTextOff: { color: 'rgba(255,255,255,0.50)' },

  quizRight: { width: IS_NARROW ? 70 : 78, alignItems: 'flex-end', justifyContent: 'center' },

  lockDim: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.18)' },

  playCard: {
    borderRadius: 24,
    backgroundColor: 'rgba(60, 0, 0, 0.88)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    padding: IS_VERY_TINY ? 14 : 18,
  },
  playTitle: { color: '#fff', fontSize: 16, fontWeight: '900', textAlign: 'center' },
  playProgress: { color: 'rgba(255,255,255,0.80)', fontSize: 12, fontWeight: '900', textAlign: 'center', marginTop: 8 },

  qTextCenter: {
    color: 'rgba(255,255,255,0.86)',
    fontSize: IS_VERY_TINY ? 13 : 14,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 14,
    paddingHorizontal: IS_NARROW ? 8 : 12,
  },

  ansBtn: {
    height: IS_VERY_TINY ? 46 : 52,
    borderRadius: 22,
    backgroundColor: '#F3D34A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ansText: { color: '#000', fontSize: 16, fontWeight: '900' },

  resultCard: {
    borderRadius: 26,
    backgroundColor: 'rgba(60, 0, 0, 0.88)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    padding: IS_VERY_TINY ? 14 : 18,
  },
  resultHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  resultTitle: { color: '#fff', fontSize: 14, fontWeight: '900', textAlign: 'center' },
  greenDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#36D06F', marginLeft: 8 },
  resultScore: { color: 'rgba(255,255,255,0.86)', fontSize: 12, fontWeight: '900', textAlign: 'center', marginTop: 8 },

  resultImg: { width: '100%', height: IS_VERY_TINY ? 220 : 260, alignSelf: 'center' },

  bigBtn: { height: IS_VERY_TINY ? 44 : 50, borderRadius: 22, backgroundColor: '#F3D34A', alignItems: 'center', justifyContent: 'center' },
  bigBtnText: { color: '#000', fontSize: 14, fontWeight: '900' },

  homeMini: { marginTop: 14, alignSelf: 'center', width: 40, height: 40, borderRadius: 12, backgroundColor: '#F3D34A', alignItems: 'center', justifyContent: 'center' },
  homeMiniText: { color: '#000', fontSize: 18, fontWeight: '900' },

  passedCard: {
    borderRadius: 26,
    backgroundColor: 'rgba(60, 0, 0, 0.88)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    padding: IS_VERY_TINY ? 14 : 18,
    alignItems: 'center',
  },
  passedTitle: { color: '#fff', fontSize: 16, fontWeight: '900', textAlign: 'center' },
  passedSub: { color: 'rgba(255,255,255,0.75)', fontSize: 12, fontWeight: '800', textAlign: 'center', marginTop: 10, lineHeight: 16 },
  passedGirl: { width: '100%', height: IS_VERY_TINY ? 220 : 250, marginTop: 8 },

  certWrap: { alignItems: 'center' },
  certCard: {
    borderRadius: 26,
    backgroundColor: 'rgba(60, 0, 0, 0.88)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    padding: 14,
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  certImg: { width: '100%', height: IS_VERY_TINY ? 220 : 250 },
  certName: {
    position: 'absolute',
    top: IS_VERY_TINY ? 112 : 120,
    alignSelf: 'center',
    color: '#000',
    fontSize: 14,
    fontWeight: '900',
  },
});
