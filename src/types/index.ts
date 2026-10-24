export type BadmintonLevel = 'beginner' | 'intermediate' | 'advanced';

export type TrainingGoal = 
  | 'fundamentals'   // 基础技术 (握拍/发球/高远球/网前小球)
  | 'footwork'       // 步法 (米字步/启动步/前后场连贯)
  | 'fitness'        // 体能 (核心/下肢爆发力/专项耐力)
  | 'attack'         // 进攻 (后场杀球/点杀突击/连贯抓推)
  | 'defense'        // 防守 (接杀挡网/挑球/平抽摆脱)
  | 'comprehensive'; // 综合提升 (攻防转换/多球连贯/战术模拟)

export type VenueType = 'court' | 'home' | 'gym';

export type SessionDuration = 30 | 45 | 60 | 90;

export interface UserProfile {
  level: BadmintonLevel;
  goal: TrainingGoal;
  daysPerWeek: number; // 1 - 6
  durationMinutes: SessionDuration;
  venue: VenueType;
  updatedAt: string;
}

export type PhaseType = 'warmup' | 'technical' | 'footwork_or_fitness' | 'cooldown';

export interface DrillItem {
  id: string;
  name: string;
  phase: PhaseType;
  objective: string; // 训练目的
  durationMinutes: number; // 建议时长
  sets: number; // 组数
  repsOrDuration: string; // 每组次数或每组持续时间 (e.g. "15次/组" or "40秒")
  restBetweenSets: string; // 组间休息 (e.g. "休息30秒")
  keyPoints: string[]; // 动作要领与注意事项
  difficulty: 'low' | 'medium' | 'high'; // 难度
}

export interface DayPlan {
  dayOfWeek: number; // 1 (Mon) to 7 (Sun)
  dayName: string; // '周一', '周二', etc.
  isRestDay: boolean;
  theme: string; // 训练主题 (e.g. "前后场连贯步法与反手过渡", "主动休息与静态伸展")
  focusGoal: TrainingGoal | 'rest';
  totalDurationMinutes: number;
  difficultyRating: 1 | 2 | 3; // 1: 适中, 2: 进阶, 3: 强化
  venue: VenueType;
  drills: DrillItem[];
  precautions: string[]; // 当天整体注意事项
  restDayTips?: string; // 休息日提示
}

export interface WeeklyPlan {
  id: string;
  createdAt: string;
  profileSnapshot: UserProfile;
  days: DayPlan[];
}

export type WorkoutFeeling = 'excellent' | 'good' | 'moderate' | 'fatigued';

export interface CheckinRecord {
  id: string;
  date: string; // YYYY-MM-DD
  timestamp: number;
  dayOfWeek: number; // 1-7
  dayName: string;
  theme: string;
  plannedDurationMinutes: number;
  actualDurationMinutes: number;
  feeling: WorkoutFeeling;
  fatigueRpe: number; // 1 - 10
  completedDrillIds: string[];
  mistakesOrReflections: string; // 主要失误与反思
  nextFocusOrImprovements?: string; // 下一次希望重点改善的内容
  notes: string; // 训练心得体会
  venue: VenueType;
  level: BadmintonLevel;
}
