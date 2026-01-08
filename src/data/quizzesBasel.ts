export type QuizId = 'quiz1' | 'quiz2' | 'quiz3';

export type QuizQuestion = {
  id: string;
  question: string;
  options: [string, string, string];
  correctIndex: 0 | 1 | 2;
};

export type QuizPack = {
  id: QuizId;
  title: string;
  total: number;
  questions: QuizQuestion[];
};

export const QUIZZES_BASEL: QuizPack[] = [
  {
    id: 'quiz1',
    title: 'Quiz 1',
    total: 10,
    questions: [
      { id: 'q1_1', question: 'Which river flows through Basel?', options: ['Danube', 'Rhine', 'Seine'], correctIndex: 1 },
      { id: 'q1_2', question: 'The main cathedral of Basel is called:', options: ['Basel Minster', 'St. Peter', 'Grosskirche'], correctIndex: 0 },
      { id: 'q1_3', question: 'The oldest bridge over the Rhine in Basel:', options: ['Mittlere Brücke', 'Trinity Bridge', 'Old Cross'], correctIndex: 0 },
      { id: 'q1_4', question: 'What color is the Basel town hall?', options: ['Blue', 'Red', 'White'], correctIndex: 1 },
      { id: 'q1_5', question: 'What is the name of the old town of Basel?', options: ['Altstadt', 'Downtown', 'Old Core'], correctIndex: 0 },
      { id: 'q1_6', question: 'Medieval gate tower:', options: ['Spalentor', 'City Gate', 'North Tower'], correctIndex: 0 },
      { id: 'q1_7', question: 'Famous kinetic fountain in the center:', options: ['Tinguely Fountain', 'Art Well', 'Motion Pool'], correctIndex: 0 },
      { id: 'q1_8', question: 'Main square with market:', options: ['Marktplatz', 'Central Square', 'Market Hall'], correctIndex: 0 },
      { id: 'q1_9', question: 'Museum of modern art next to the park:', options: ['Fondation Beyeler', 'Art House', 'Modern Hall'], correctIndex: 0 },
      { id: 'q1_10', question: 'River divides the city into two parts:', options: ['Rhine', 'Main', 'Po'], correctIndex: 0 },
    ],
  },
  {
    id: 'quiz2',
    title: 'Quiz 2',
    total: 15,
    questions: [
      { id: 'q2_1', question: 'The tallest building in Basel:', options: ['Roche Tower', 'City Spire', 'Basel Point'], correctIndex: 0 },
      { id: 'q2_2', question: 'The ancient city gate:', options: ['Spalentor', 'West Gate', 'Iron Gate'], correctIndex: 0 },
      { id: 'q2_3', question: 'Museum of moving sculptures:', options: ['Museum Tinguely', 'Motion Art', 'Steel Lab'], correctIndex: 0 },
      { id: 'q2_4', question: 'Canal district:', options: ['St. Alban', 'Old Port', 'Water Town'], correctIndex: 0 },
      { id: 'q2_5', question: 'Main Market Square:', options: ['Marktplatz', 'Food Square', 'Trade Yard'], correctIndex: 0 },
      { id: 'q2_6', question: 'Summer Swimming River:', options: ['Rhine', 'Aare', 'Rhône'], correctIndex: 0 },
      { id: 'q2_7', question: 'Paper and Printing Museum:', options: ['Paper Mill', 'Print House', 'Ink Lab'], correctIndex: 0 },
      { id: 'q2_8', question: 'Architectural Campus Near the City:', options: ['Vitra Campus', 'Design Park', 'Build Zone'], correctIndex: 0 },
      { id: 'q2_9', question: 'Bridge Between Three Countries:', options: ['Three Countries Bridge', 'Unity Bridge', 'Border Way'], correctIndex: 0 },
      { id: 'q2_10', question: 'Old Town Center:', options: ['Altstadt', 'Old Town', 'Core City'], correctIndex: 0 },
      { id: 'q2_11', question: 'Cathedral Towers by Number:', options: ['Two', 'Three', 'One'], correctIndex: 0 },
      { id: 'q2_12', question: 'Fountain Near the Theater:', options: ['Tinguely Fountain', 'Opera Well', 'City Flow'], correctIndex: 0 },
      { id: 'q2_13', question: 'District Along Rhine:', options: ['Rhine Promenade', 'River Walk', 'Blue Line'], correctIndex: 0 },
      { id: 'q2_14', question: 'Modern symbol of the city:', options: ['Roche Tower', 'Clock Hall', 'Glass Dome'], correctIndex: 0 },
      { id: 'q2_15', question: 'The city is known for art:', options: ['Yes', 'No', 'Partially'], correctIndex: 0 },
    ],
  },
  {
    id: 'quiz3',
    title: 'Quiz 3',
    total: 20,
    questions: [
      { id: 'q3_1', question: "Basel's main river:", options: ['Rhine', 'Main', 'Po'], correctIndex: 0 },
      { id: 'q3_2', question: 'Red government building:', options: ['Town Hall', 'City Court', 'State House'], correctIndex: 0 },
      { id: 'q3_3', question: 'Museum of Modern Art:', options: ['Fondation Beyeler', 'Art Base', 'Modern Hub'], correctIndex: 0 },
      { id: 'q3_4', question: 'Medieval gate:', options: ['Spalentor', 'Old Gate', 'North Arch'], correctIndex: 0 },
      { id: 'q3_5', question: 'Tallest skyscraper:', options: ['Roche Tower', 'Basel Rise', 'Sky Point'], correctIndex: 0 },
      { id: 'q3_6', question: 'Old bridge over the Rhine:', options: ['Mittlere Brücke', 'Stone Way', 'Old Line'], correctIndex: 0 },
      { id: 'q3_7', question: 'Kinetic fountain:', options: ['Tinguely Fountain', 'Motion Pool', 'Art Drop'], correctIndex: 0 },
      { id: 'q3_8', question: 'Canal district:', options: ['St. Alban', 'Water Side', 'Mill Town'], correctIndex: 0 },
      { id: 'q3_9', question: 'Main Square:', options: ['Marktplatz', 'City Square', 'Trade Point'], correctIndex: 0 },
      { id: 'q3_10', question: 'Paper Museum:', options: ['Paper Mill', 'Book Hall', 'Print Lab'], correctIndex: 0 },
      { id: 'q3_11', question: 'Promenade:', options: ['Rhine Promenade', 'River Park', 'Water Lane'], correctIndex: 0 },
      { id: 'q3_12', question: 'Architecture Campus:', options: ['Vitra Campus', 'Design Yard', 'Build Lab'], correctIndex: 0 },
      { id: 'q3_13', question: 'Museum of Movement and Mechanics:', options: ['Museum Tinguely', 'Steel Art', 'Motion Lab'], correctIndex: 0 },
      { id: 'q3_14', question: 'Church with neo-Gothic:', options: ['Elisabethenkirche', 'City Chapel', 'Old Church'], correctIndex: 0 },
      { id: 'q3_15', question: 'Church-museum in the center:', options: ['Barfüsserkirche', 'Art Church', 'Stone Hall'], correctIndex: 0 },
      { id: 'q3_16', question: 'Bridge between countries:', options: ['Three Countries Bridge', 'Border Bridge', 'Unity Way'], correctIndex: 0 },
      { id: 'q3_17', question: 'Part of the city with history:', options: ['Altstadt', 'Old Zone', 'Core'], correctIndex: 0 },
      { id: 'q3_18', question: 'The city is located in:', options: ['Switzerland', 'France', 'Germany'], correctIndex: 0 },
      { id: 'q3_19', question: 'A river divides the city:', options: ['Yes', 'No', 'Partially'], correctIndex: 0 },
      { id: 'q3_20', question: 'Basel is a cultural center:', options: ['Yes', 'No', 'Maybe'], correctIndex: 0 },
    ],
  },
];

export function getQuiz(quizId: QuizId): QuizPack {
  return QUIZZES_BASEL.find((q) => q.id === quizId) ?? QUIZZES_BASEL[0];
}
