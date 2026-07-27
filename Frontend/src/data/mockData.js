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
  weeklyProgress: {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    data: [58, 63, 60, 70, 74, 76, 78],
  },
  upcomingLessons: [
    { id: 'alpha-2', title: 'Letters F – J', level: 'Beginner' },
    { id: 'alpha-3', title: 'Letters K – O', level: 'Intermediate' },
  ],
}

export const mockStudents = [
  { id: 's1', name: 'Priya Nair', email: 'priya@example.com', accuracy: 91, lessonsCompleted: 9, level: 'Advanced', lastActive: '2h ago' },
  { id: 's2', name: 'Rohan Mehta', email: 'rohan@example.com', accuracy: 74, lessonsCompleted: 6, level: 'Intermediate', lastActive: '1d ago' },
  { id: 's3', name: 'Ana Costa', email: 'ana@example.com', accuracy: 85, lessonsCompleted: 8, level: 'Advanced', lastActive: '5h ago' },
  { id: 's4', name: 'Liam O\u2019Brien', email: 'liam@example.com', accuracy: 52, lessonsCompleted: 3, level: 'Beginner', lastActive: '3d ago' },
  { id: 's5', name: 'Sara Ahmed', email: 'sara@example.com', accuracy: 68, lessonsCompleted: 5, level: 'Intermediate', lastActive: '6h ago' },
  { id: 's6', name: 'Diego Fernandez', email: 'diego@example.com', accuracy: 88, lessonsCompleted: 10, level: 'Advanced', lastActive: '1h ago' },
]

export const mockAdminUsers = [
  { id: 'u1', name: 'Priya Nair', email: 'priya@example.com', role: 'Learner', status: 'Active', joined: '2026-03-02' },
  { id: 'u2', name: 'Marcus Lee', email: 'marcus@example.com', role: 'Instructor', status: 'Active', joined: '2026-01-14' },
  { id: 'u3', name: 'Rohan Mehta', email: 'rohan@example.com', role: 'Learner', status: 'Inactive', joined: '2026-04-19' },
  { id: 'u4', name: 'Wei Zhang', email: 'wei@example.com', role: 'Trainer', status: 'Active', joined: '2025-12-08' },
  { id: 'u5', name: 'Sara Ahmed', email: 'sara@example.com', role: 'Learner', status: 'Active', joined: '2026-05-27' },
  { id: 'u6', name: 'Admin User', email: 'admin@example.com', role: 'Admin', status: 'Active', joined: '2025-11-01' },
]

export const mockAdminStats = {
  totalUsers: 248,
  totalInstructors: 12,
  activeLearners: 189,
  totalLessons: 42,
  roleDistribution: { labels: ['Learners', 'Instructors', 'Trainers', 'Admins'], data: [214, 12, 18, 4] },
  recentRegistrations: [
    { id: 'r1', name: 'Sara Ahmed', role: 'Learner', time: '3h ago' },
    { id: 'r2', name: 'Wei Zhang', role: 'Trainer', time: '1d ago' },
    { id: 'r3', name: 'Marcus Lee', role: 'Instructor', time: '2d ago' },
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
