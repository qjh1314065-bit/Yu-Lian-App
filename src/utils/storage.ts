import { UserProfile, WeeklyPlan, CheckinRecord } from '../types';
import { generateWeeklyPlan } from './planGenerator';

const STORAGE_KEYS = {
  PROFILE: 'badminton_coach_profile',
  WEEKLY_PLAN: 'badminton_coach_weekly_plan',
  CHECKINS: 'badminton_coach_checkins',
};

export const DEFAULT_PROFILE: UserProfile = {
  level: 'intermediate',
  goal: 'comprehensive',
  daysPerWeek: 3,
  durationMinutes: 60,
  venue: 'court',
  updatedAt: new Date().toISOString(),
};

export function loadProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to parse profile from localStorage', e);
  }
  return DEFAULT_PROFILE;
}

export function saveProfile(profile: UserProfile): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  } catch (e) {
    console.error('Failed to save profile to localStorage', e);
  }
}

export function loadWeeklyPlan(currentProfile: UserProfile): WeeklyPlan {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.WEEKLY_PLAN);
    if (raw) {
      const parsed: WeeklyPlan = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.days) && parsed.days.length === 7) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to parse weekly plan from localStorage', e);
  }

  // 生成初始计划并保存
  const newPlan = generateWeeklyPlan(currentProfile);
  saveWeeklyPlan(newPlan);
  return newPlan;
}

export function saveWeeklyPlan(plan: WeeklyPlan): void {
  try {
    localStorage.setItem(STORAGE_KEYS.WEEKLY_PLAN, JSON.stringify(plan));
  } catch (e) {
    console.error('Failed to save weekly plan to localStorage', e);
  }
}

export function loadCheckins(): CheckinRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CHECKINS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to parse checkins from localStorage', e);
  }
  return [];
}

export function saveCheckins(checkins: CheckinRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CHECKINS, JSON.stringify(checkins));
  } catch (e) {
    console.error('Failed to save checkins to localStorage', e);
  }
}

export function getLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function addCheckin(record: CheckinRecord): CheckinRecord[] {
  const current = loadCheckins();
  // 若同一 id 或同一日期与星期的记录已存在，则替换更新，避免重复累加
  const existingIdx = current.findIndex(
    (c) => c.id === record.id || (c.date === record.date && c.dayOfWeek === record.dayOfWeek)
  );

  let updated: CheckinRecord[];
  if (existingIdx >= 0) {
    updated = [...current];
    updated[existingIdx] = record;
  } else {
    updated = [record, ...current];
  }

  saveCheckins(updated);
  return updated;
}

export function deleteCheckin(id: string): CheckinRecord[] {
  const current = loadCheckins();
  const updated = current.filter((c) => c.id !== id);
  saveCheckins(updated);
  return updated;
}

export function clearAllData(): void {
  localStorage.removeItem(STORAGE_KEYS.PROFILE);
  localStorage.removeItem(STORAGE_KEYS.WEEKLY_PLAN);
  localStorage.removeItem(STORAGE_KEYS.CHECKINS);
}

// 真实示例数据生成器（供用户一键体验看板功能）
export function loadSampleData(profile: UserProfile): { plan: WeeklyPlan; checkins: CheckinRecord[] } {
  const plan = generateWeeklyPlan(profile);
  saveWeeklyPlan(plan);

  const now = new Date();
  const sampleCheckins: CheckinRecord[] = [
    {
      id: `sample_${Date.now() - 86400000 * 4}`,
      date: getLocalDateString(new Date(now.getTime() - 86400000 * 4)),
      timestamp: now.getTime() - 86400000 * 4,
      dayOfWeek: 1,
      dayName: '周一',
      theme: '前后场高远拉吊与四方球控点',
      plannedDurationMinutes: 60,
      actualDurationMinutes: 60,
      feeling: 'good',
      fatigueRpe: 6,
      completedDrillIds: ['drill_1', 'drill_2', 'drill_3', 'drill_4'],
      mistakesOrReflections: '高远球击球点有时偏后，靠手腕硬拉导致手腕微酸；后半程注意侧身后击球点在身体右前上方明显更省力。',
      nextFocusOrImprovements: '强化反手后场被动过渡拍的拍面切削角度与借力，避免出底线',
      notes: '今天重点练习了底线深度的到位率，四方球拉开后对手回球质量明显下降，战术执行较好。',
      venue: profile.venue,
      level: profile.level,
    },
    {
      id: `sample_${Date.now() - 86400000 * 2}`,
      date: getLocalDateString(new Date(now.getTime() - 86400000 * 2)),
      timestamp: now.getTime() - 86400000 * 2,
      dayOfWeek: 3,
      dayName: '周三',
      theme: '攻防转换：接杀挡网后连贯上网',
      plannedDurationMinutes: 60,
      actualDurationMinutes: 65,
      feeling: 'excellent',
      fatigueRpe: 7,
      completedDrillIds: ['drill_1', 'drill_2', 'drill_3', 'drill_4'],
      mistakesOrReflections: '接重杀时重心偶尔抬起导致球向上飞出底线；低重心放网前效果极佳，挡网滚网成功率高。',
      nextFocusOrImprovements: '中前场封网时拍头始终维持在网带高度以上，减少向下压拍后的漏球',
      notes: '接杀后上网扑推的速度有进步，分腿启动步非常扎实。心肺适应良好。',
      venue: profile.venue,
      level: profile.level,
    },
    {
      id: `sample_${Date.now() - 86400000 * 1}`,
      date: getLocalDateString(new Date(now.getTime() - 86400000 * 1)),
      timestamp: now.getTime() - 86400000 * 1,
      dayOfWeek: 5,
      dayName: '周五',
      theme: '平抽快挡与中半场抓推突击',
      plannedDurationMinutes: 60,
      actualDurationMinutes: 55,
      feeling: 'moderate',
      fatigueRpe: 8,
      completedDrillIds: ['drill_1', 'drill_2', 'drill_3'],
      mistakesOrReflections: '平抽快节奏下挥拍幅度过大，导致下一拍来不及举拍；改用手指点弹后出球明显更快。',
      nextFocusOrImprovements: '反手平抽挡击球点尽量迎前在身前半个拍位，提高出球平直度',
      notes: '双打平抽挡高强度对抗，出汗量大。赛后做了充分的小腿与跟腱拉伸。',
      venue: profile.venue,
      level: profile.level,
    },
  ];

  saveCheckins(sampleCheckins);
  return { plan, checkins: sampleCheckins };
}
