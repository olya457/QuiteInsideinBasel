import type { NavigatorScreenParams } from '@react-navigation/native';

export type TabsParamList = {
  Home: undefined;
  NoSaved: undefined;
  InteractiveMap: undefined;
};

export type QuizId = 'quiz1' | 'quiz2' | 'quiz3';

export type RootStackParamList = {
  Loader: undefined;
  Onboard: undefined;
  CreateProfile1: undefined;

  Tabs: NavigatorScreenParams<TabsParamList> | undefined;
  ClosedQuiz: undefined; 
  QuizList: undefined;  
  QuizPlay: { quizId: QuizId }; 
  QuizResults: { quizId: QuizId; correct: number; total: number }; 
  Certificate: { userName?: string } | undefined; 

  ListPlace: undefined;
  PlaceDetail: { placeId: string };

  Information: undefined;
  Settings: undefined;
};
