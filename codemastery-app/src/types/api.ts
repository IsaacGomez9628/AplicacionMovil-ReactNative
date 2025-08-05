// User types
export interface User {
  id: number
  name: string
  email: string
  image?: string
  created_at: string
  updated_at: string
}

export interface UserCreate {
  name: string
  email: string
  password: string
}

export interface UserUpdate {
  name?: string
  email?: string
  image?: string
}

export interface UserLogin {
  email: string
  password: string
}

export interface Token {
  access_token: string
  token_type: string
}

// Course types
export interface Course {
  id: string
  title: string
  description: string
  icon: string
  color_class: string
  created_at: string
  updated_at: string
}

export interface CourseCreate {
  id: string
  title: string
  description: string
  icon: string
  color_class: string
}

export interface CourseUpdate {
  title?: string
  description?: string
  icon?: string
  color_class?: string
}

// Module types
export interface Module {
  id: string
  course_id: string
  title: string
  description: string
  position: number
  created_at: string
  updated_at: string
}

export interface ModuleCreate {
  id: string
  course_id: string
  title: string
  description: string
  position: number
}

export interface ModuleUpdate {
  title?: string
  description?: string
  position?: number
}

// Lesson types
export interface Lesson {
  id: number
  module_id: string
  title: string
  theory: string
  practice_instructions: string
  practice_initial_code: string
  practice_solution: string
  position: number
  created_at: string
  updated_at: string
}

export interface LessonCreate {
  module_id: string
  title: string
  theory: string
  practice_instructions: string
  practice_initial_code: string
  practice_solution: string
  position: number
}

export interface LessonUpdate {
  title?: string
  theory?: string
  practice_instructions?: string
  practice_initial_code?: string
  practice_solution?: string
  position?: number
}

// Progress types
export interface UserProgress {
  id: number
  user_id: number
  module_id: string
  completed: boolean
  completion_date?: string
  created_at: string
  updated_at: string
}

export interface UserProgressCreate {
  user_id: number
  module_id: string
  completed: boolean
}

export interface UserProgressUpdate {
  completed?: boolean
  completion_date?: string
}

// Exercise Attempt types
export interface ExerciseAttempt {
  id: number
  user_id: number
  lesson_id: number
  code_submitted: string
  is_correct: boolean
  attempt_date: string
}

export interface ExerciseAttemptCreate {
  user_id: number
  lesson_id: number
  code_submitted: string
  is_correct: boolean
}

export interface ExerciseSubmission {
  code_submitted: string
}

// API Response types
export interface ApiResponse<T> {
  data: T
  message?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  size: number
  pages: number
}
