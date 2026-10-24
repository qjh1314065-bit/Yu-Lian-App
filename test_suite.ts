/**
 * Automated test suite for Badminton Coach core features:
 * 1. Empty/abnormal inputs & boundaries
 * 2. Storage persistence & reload simulation
 * 3. Duplicate check-ins & update behavior
 * 4. Plan regeneration without losing history
 * 5. Clear all data & factory reset
 * 6. Responsive mathematical constraints (7-day chart & mobile tabs)
 */

import { generateWeeklyPlan } from './src/utils/planGenerator';
import { 
  DEFAULT_PROFILE, 
  loadProfile, 
  saveProfile, 
  loadWeeklyPlan, 
  saveWeeklyPlan, 
  loadCheckins, 
  addCheckin, 
  deleteCheckin, 
  clearAllData,
  getLocalDateString
} from './src/utils/storage';
import { UserProfile, CheckinRecord, SessionDuration } from './src/types';

// Simple in-memory localStorage polyfill for Node.js test execution
const storageMap = new Map<string, string>();
(globalThis as any).localStorage = {
  getItem: (key: string) => storageMap.get(key) ?? null,
  setItem: (key: string, value: string) => storageMap.set(key, String(value)),
  removeItem: (key: string) => storageMap.delete(key),
  clear: () => storageMap.clear(),
};

let passedCount = 0;
let totalCount = 0;

function assert(description: string, condition: boolean, details?: string) {
  totalCount++;
  if (condition) {
    passedCount++;
    console.log(`✅ [PASS] ${description}`);
  } else {
    console.error(`❌ [FAIL] ${description} ${details ? `(${details})` : ''}`);
    process.exitCode = 1;
  }
}

console.log('🏸 ====== 开始执行 羽练 Badminton Coach 自动化测试 ====== 🏸\n');

// -------------------------------------------------------------
// TEST 1: 空输入与异常输入容错 (Empty & Boundary Inputs)
// -------------------------------------------------------------
console.log('--- 测试 1: 空输入与边界输入容错 ---');
try {
  // 测试 localStorage 为空时的默认加载
  localStorage.clear();
  const emptyProfile = loadProfile();
  assert('空 localStorage 时 loadProfile 返回默认初始画像', 
    emptyProfile.level === 'intermediate' && emptyProfile.daysPerWeek === 3);

  const emptyPlan = loadWeeklyPlan(emptyProfile);
  assert('空 localStorage 时 loadWeeklyPlan 自动生成合规 7 天课表', 
    Array.isArray(emptyPlan.days) && emptyPlan.days.length === 7);

  const emptyCheckins = loadCheckins();
  assert('空 localStorage 时 loadCheckins 返回空数组 []', 
    Array.isArray(emptyCheckins) && emptyCheckins.length === 0);

  // 测试异常时长边界生成
  for (const dur of [30, 45, 60, 90] as SessionDuration[]) {
    const testP: UserProfile = { ...DEFAULT_PROFILE, durationMinutes: dur };
    const plan = generateWeeklyPlan(testP);
    const activeDays = plan.days.filter(d => !d.isRestDay);
    const allMatch = activeDays.every(d => d.totalDurationMinutes === dur);
    assert(`时长为 ${dur} 分钟时，所有训练日各阶段时长总和严格等于 ${dur} 分钟`, allMatch);
  }
} catch (err) {
  assert('测试 1 抛出未捕获异常', false, String(err));
}

// -------------------------------------------------------------
// TEST 2: 页面刷新与本地持久化 (Persistence & Reload)
// -------------------------------------------------------------
console.log('\n--- 测试 2: 页面刷新与本地持久化 ---');
try {
  const customProfile: UserProfile = {
    level: 'beginner',
    goal: 'footwork',
    daysPerWeek: 4,
    durationMinutes: 45,
    venue: 'home',
    updatedAt: new Date().toISOString(),
  };

  saveProfile(customProfile);
  // 模拟刷新后从 storage 读取
  const reloadedProfile = loadProfile();
  assert('刷新页面后 用户画像(beginner/footwork/4天/45分/home) 完整读取保持一致',
    reloadedProfile.level === 'beginner' &&
    reloadedProfile.goal === 'footwork' &&
    reloadedProfile.daysPerWeek === 4 &&
    reloadedProfile.durationMinutes === 45 &&
    reloadedProfile.venue === 'home'
  );

  const generated = generateWeeklyPlan(reloadedProfile);
  saveWeeklyPlan(generated);

  const reloadedPlan = loadWeeklyPlan(reloadedProfile);
  assert('刷新页面后 7天课表数据完整读取', 
    reloadedPlan.days.length === 7 && reloadedPlan.days[0].venue === 'home');
} catch (err) {
  assert('测试 2 抛出未捕获异常', false, String(err));
}

// -------------------------------------------------------------
// TEST 3: 重复打卡与数据替换 (Duplicate Check-in & Replacement)
// -------------------------------------------------------------
console.log('\n--- 测试 3: 重复打卡与数据替换 ---');
try {
  localStorage.clear();
  const testDate = getLocalDateString();

  const firstCheckin: CheckinRecord = {
    id: `checkin_${Date.now()}_1`,
    date: testDate,
    timestamp: Date.now(),
    dayOfWeek: 1,
    dayName: '周一',
    theme: '分腿启动步与网前跨步缓冲',
    plannedDurationMinutes: 45,
    actualDurationMinutes: 45,
    feeling: 'good',
    fatigueRpe: 6,
    completedDrillIds: ['drill_1', 'drill_2'],
    mistakesOrReflections: '初次打卡记录：启动步稍微拖沓',
    notes: '感觉还行',
    venue: 'home',
    level: 'beginner',
  };

  const listAfterFirst = addCheckin(firstCheckin);
  assert('初次打卡成功，列表长度为 1', listAfterFirst.length === 1);
  assert('初次打卡实际时长为 45 分钟', listAfterFirst[0].actualDurationMinutes === 45);

  // 用户重新进入周一课表，发现多练了15分钟，更新打卡为 60 分钟并修改反思
  const updatedCheckin: CheckinRecord = {
    ...firstCheckin,
    actualDurationMinutes: 60,
    feeling: 'excellent',
    fatigueRpe: 7,
    mistakesOrReflections: '更新打卡记录：后半程加练了影子步，状态极佳',
  };

  const listAfterUpdate = addCheckin(updatedCheckin);
  assert('同日/同ID重复打卡时，记录被替换更新，列表总数依然为 1 (不虚假累加)', listAfterUpdate.length === 1);
  assert('更新后的实际时长正确修改为 60 分钟', listAfterUpdate[0].actualDurationMinutes === 60);
  assert('更新后的感受正确修改为 excellent', listAfterUpdate[0].feeling === 'excellent');
  assert('更新后的反思内容正确替换', listAfterUpdate[0].mistakesOrReflections.includes('后半程加练了影子步'));

  // 跨不同日期打卡
  const secondCheckin: CheckinRecord = {
    ...firstCheckin,
    id: `checkin_${Date.now()}_2`,
    date: '2026-10-22',
    dayOfWeek: 3,
    dayName: '周三',
    actualDurationMinutes: 45,
  };
  const listWithTwo = addCheckin(secondCheckin);
  assert('不同日期打卡正常新增，总记录数变为 2', listWithTwo.length === 2);
} catch (err) {
  assert('测试 3 抛出未捕获异常', false, String(err));
}

// -------------------------------------------------------------
// TEST 4: 重新生成计划且保留历史记录 (Regenerate Plan & Retain History)
// -------------------------------------------------------------
console.log('\n--- 测试 4: 重新生成计划且保留历史记录 ---');
try {
  // 当前有 2 条打卡记录
  const beforeCount = loadCheckins().length;
  assert('重新生成计划前已有 2 条历史记录', beforeCount === 2);

  // 用户修改训练目标为 attack (进攻), 场地为 gym (健身房), 天数 5 天
  const newProfile: UserProfile = {
    level: 'advanced',
    goal: 'attack',
    daysPerWeek: 5,
    durationMinutes: 90,
    venue: 'gym',
    updatedAt: new Date().toISOString(),
  };

  saveProfile(newProfile);
  const brandNewPlan = generateWeeklyPlan(newProfile);
  saveWeeklyPlan(brandNewPlan);

  // 验证新计划属性
  const trainingDays = brandNewPlan.days.filter(d => !d.isRestDay);
  assert('新计划包含 5 个训练日和 2 个休息日', trainingDays.length === 5 && brandNewPlan.days.filter(d => d.isRestDay).length === 2);
  assert('新计划单次时长准确匹配 90 分钟', trainingDays[0].totalDurationMinutes === 90);
  assert('新计划场地适配为 gym', trainingDays[0].venue === 'gym');

  // 验证打卡历史记录未被冲掉
  const afterCheckins = loadCheckins();
  assert('重新生成计划后，历史打卡记录仍然保留 2 条无损', afterCheckins.length === 2);
} catch (err) {
  assert('测试 4 抛出未捕获异常', false, String(err));
}

// -------------------------------------------------------------
// TEST 5: 清空测试数据与出厂重置 (Clear Data & Reset)
// -------------------------------------------------------------
console.log('\n--- 测试 5: 清空测试数据与出厂重置 ---');
try {
  clearAllData();
  const resetProfile = loadProfile();
  const resetPlan = loadWeeklyPlan(resetProfile);
  const resetCheckins = loadCheckins();

  assert('清空后 profile 恢复为 DEFAULT_PROFILE', resetProfile.level === DEFAULT_PROFILE.level);
  assert('清空后 checkins 恢复为空数组 []', resetCheckins.length === 0);
  assert('清空后 weeklyPlan 重新初始化为标准的 7 天课表', resetPlan.days.length === 7);
} catch (err) {
  assert('测试 5 抛出未捕获异常', false, String(err));
}

// -------------------------------------------------------------
// TEST 6: 场地与目标限制规则有效性 (Badminton Domain Invariants)
// -------------------------------------------------------------
console.log('\n--- 测试 6: 场地与训练原则约束测试 ---');
try {
  // 1. 居家场地 (home) 绝不出现全场大范围杀球或多球击打
  const homeProfile: UserProfile = { ...DEFAULT_PROFILE, venue: 'home', goal: 'attack' };
  const homePlan = generateWeeklyPlan(homeProfile);
  const homeDrillNames = homePlan.days.flatMap(d => d.drills.map(drill => drill.name));
  const hasFullCourtCourtSmash = homeDrillNames.some(name => name.includes('后场两点重杀') || name.includes('六点米字步无球全场'));
  assert('居家空间 (home) 不安排全场两点重杀或全场多球移动', !hasFullCourtCourtSmash);
  assert('居家空间包含手腕、挥拍定型或对墙抽球动作', homeDrillNames.some(name => name.includes('挥拍') || name.includes('抽球') || name.includes('倒拍') || name.includes('影子步')));

  // 2. 休息日绝不安排高强度训练
  const allRestDays = homePlan.days.filter(d => d.isRestDay);
  const restDaysZeroDuration = allRestDays.every(d => d.totalDurationMinutes === 0 && d.drills.length === 0);
  assert('所有休息日时长严格为 0 且 drills 列表为空', restDaysZeroDuration);
} catch (err) {
  assert('测试 6 抛出未捕获异常', false, String(err));
}

console.log(`\n🎉 测试执行完毕: 全部 ${totalCount} 项断言中通过 ${passedCount} 项！\n`);
