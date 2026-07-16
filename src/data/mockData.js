export const mockDashboard = {
  accuracy: 78,
  lessonsCompleted: 6,
  practiceHours: 4.5,
  streakDays: 5,
  weakLetters: ['M', 'R', 'S'],
  recentActivity: [
    { id: 1, label: 'Practiced letter B', result: '92% match', time: '2h ago' },
    { id: 2, label: 'Completed Lesson: Vowels A-E', result: '85% avg', time: '1d ago' },
    { id: 3, label: 'Practiced letter M', result: '61% match', time: '2d ago' },
  ],
}

export const mockLessons = [
  {
    id: 'alpha-1',
    level: 'Beginner',
    title: 'Vowels A – E',
    description: 'Master the five foundational hand shapes.',
    letters: ['A', 'B', 'C', 'D', 'E'],
    progress: 80,
  },
  {
    id: 'alpha-2',
    level: 'Beginner',
    title: 'Letters F – J',
    description: 'Build fluency with everyday consonants.',
    letters: ['F', 'G', 'H', 'I', 'J'],
    progress: 40,
  },
  {
    id: 'alpha-3',
    level: 'Intermediate',
    title: 'Letters K – O',
    description: 'Trickier finger positions and rotations.',
    letters: ['K', 'L', 'M', 'N', 'O'],
    progress: 10,
  },
  {
    id: 'alpha-4',
    level: 'Intermediate',
    title: 'Letters P – T',
    description: 'Practice motion-based letter transitions.',
    letters: ['P', 'Q', 'R', 'S', 'T'],
    progress: 0,
  },
  {
    id: 'alpha-5',
    level: 'Advanced',
    title: 'Letters U – Y',
    description: 'Refine accuracy on close-together shapes.',
    letters: ['U', 'V', 'W', 'X', 'Y'],
    progress: 0,
  },
  {
    id: 'alpha-6',
    level: 'Advanced',
    title: 'Full Alphabet Review',
    description: 'A mixed round-up of every sign so far.',
    letters: ['A', 'L', 'P', 'H', 'A'],
    progress: 0,
  },
]
