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
 
// ---------------------------------------------------------------------------
// Milestone 3 additions — Notification Bell, Badges/Streaks, Leaderboard
// ---------------------------------------------------------------------------
export const mockNotifications = [
  {
    id: 'n1',
    title: 'You earned a badge!',
    body: 'Alphabet Master unlocked — you\u2019ve completed all 26 letters.',
    read: false,
    createdAt: '2026-08-06T09:15:00Z',
  },
  {
    id: 'n2',
    title: 'New recommendation available',
    body: 'Try \u2018Numbers 1-10\u2019 next based on your recent accuracy.',
    read: false,
    createdAt: '2026-08-06T08:40:00Z',
  },
  {
    id: 'n3',
    title: '7-Day Streak!',
    body: 'You\u2019ve practiced every day this week. Keep it going.',
    read: false,
    createdAt: '2026-08-05T18:05:00Z',
  },
  {
    id: 'n4',
    title: 'Leaderboard update',
    body: 'You moved up to rank #4 in your class.',
    read: true,
    createdAt: '2026-08-04T12:00:00Z',
  },
  {
    id: 'n5',
    title: 'Weekly report ready',
    body: 'Your progress report for last week is ready to export.',
    read: true,
    createdAt: '2026-08-03T07:30:00Z',
  },
]
 
export const mockBadges = [
  { id: 'b1', name: 'Alphabet Master', emoji: '\ud83d\udd24', unlocked: true, description: 'Completed all 26 letters' },
  { id: 'b2', name: '7-Day Streak', emoji: '\ud83d\udd25', unlocked: true, description: 'Practiced 7 days in a row' },
  { id: 'b3', name: 'Numbers Novice', emoji: '\ud83d\udd22', unlocked: true, description: 'Completed Numbers 1-10' },
  { id: 'b4', name: 'Quick Learner', emoji: '\u26a1', unlocked: false, description: 'Complete a lesson in under 2 minutes' },
  { id: 'b5', name: 'Perfectionist', emoji: '\ud83c\udfaf', unlocked: false, description: 'Score 100% on 5 lessons' },
  { id: 'b6', name: '30-Day Streak', emoji: '\ud83c\udfc6', unlocked: false, description: 'Practiced 30 days in a row' },
]
 
export const mockStreak = {
  currentStreak: 7,
  longestStreak: 12,
}
 
export const mockLeaderboard = [
  { id: 'u1', name: 'Priya S.', accuracy: 96, streak: 14 },
  { id: 'u2', name: 'Arjun K.', accuracy: 94, streak: 21 },
  { id: 'u3', name: 'Meera R.', accuracy: 91, streak: 9 },
  { id: 'u4', name: 'You', accuracy: 89, streak: 7 },
  { id: 'u5', name: 'Kabir T.', accuracy: 87, streak: 5 },
  { id: 'u6', name: 'Ananya V.', accuracy: 85, streak: 3 },
]
 
export const mockCurrentLeaderboardUserId = 'u4'
 
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
 