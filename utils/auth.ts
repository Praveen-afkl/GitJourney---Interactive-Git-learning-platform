// Authentication and Progress Management

export interface User {
  email: string;
  avatarName: string;
  currentLessonIdx: number;
  unlockedLessonIdx: number;
  totalTimeSpent: number;
  lastLogin: number;
  createdAt: number;
}

const USERS_STORAGE_KEY = 'gitjourney-users';
const CURRENT_USER_KEY = 'gitjourney-current-user';

// Get all users from storage
export const getUsers = (): Map<string, User> => {
  const stored = localStorage.getItem(USERS_STORAGE_KEY);
  if (!stored) return new Map();
  
  try {
    const usersArray = JSON.parse(stored);
    return new Map(usersArray);
  } catch {
    return new Map();
  }
};

// Save users to storage
const saveUsers = (users: Map<string, User>) => {
  const usersArray = Array.from(users.entries());
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(usersArray));
};

// Get current logged-in user
export const getCurrentUser = (): User | null => {
  const email = localStorage.getItem(CURRENT_USER_KEY);
  if (!email) return null;
  
  const users = getUsers();
  const user = users.get(email);
  
  // Migration: Add avatarName to existing users if missing
  if (user && !user.avatarName) {
    user.avatarName = email.split('@')[0];
    users.set(email, user);
    saveUsers(users);
  }
  
  return user || null;
};

// Set current logged-in user
export const setCurrentUser = (email: string | null) => {
  if (email) {
    localStorage.setItem(CURRENT_USER_KEY, email);
  } else {
    localStorage.removeItem(CURRENT_USER_KEY);
  }
};

// Sign up new user
export const signUp = (email: string, avatarName?: string): User => {
  const users = getUsers();
  
  if (users.has(email)) {
    throw new Error('User already exists');
  }
  
  const newUser: User = {
    email,
    avatarName: avatarName || email.split('@')[0], // Use provided avatar name or default to email username
    currentLessonIdx: 0,
    unlockedLessonIdx: 0,
    totalTimeSpent: 0,
    lastLogin: Date.now(),
    createdAt: Date.now(),
  };
  
  users.set(email, newUser);
  saveUsers(users);
  setCurrentUser(email);
  
  return newUser;
};

// Sign in existing user
export const signIn = (email: string): User | null => {
  const users = getUsers();
  const user = users.get(email);
  
  if (!user) {
    return null;
  }
  
  // Update last login
  user.lastLogin = Date.now();
  users.set(email, user);
  saveUsers(users);
  setCurrentUser(email);
  
  return user;
};

// Sign out
export const signOut = () => {
  setCurrentUser(null);
};

// Update user progress
export const updateUserProgress = (
  email: string,
  updates: Partial<Pick<User, 'currentLessonIdx' | 'unlockedLessonIdx' | 'totalTimeSpent'>>
): User | null => {
  const users = getUsers();
  const user = users.get(email);
  
  if (!user) return null;
  
  Object.assign(user, updates);
  users.set(email, user);
  saveUsers(users);
  
  return user;
};

// Save current user progress
export const saveProgress = (
  currentLessonIdx: number,
  unlockedLessonIdx: number,
  totalTimeSpent: number
) => {
  const currentUser = getCurrentUser();
  if (!currentUser) return;
  
  updateUserProgress(currentUser.email, {
    currentLessonIdx,
    unlockedLessonIdx,
    totalTimeSpent,
  });
};

// Load user progress
export const loadProgress = (): {
  currentLessonIdx: number;
  unlockedLessonIdx: number;
  totalTimeSpent: number;
} | null => {
  const currentUser = getCurrentUser();
  if (!currentUser) return null;
  
  return {
    currentLessonIdx: currentUser.currentLessonIdx,
    unlockedLessonIdx: currentUser.unlockedLessonIdx,
    totalTimeSpent: currentUser.totalTimeSpent,
  };
};

