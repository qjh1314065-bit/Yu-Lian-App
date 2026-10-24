import { UserProfile, WeeklyPlan, DayPlan, DrillItem, TrainingGoal, PhaseType } from '../types';
import { DRILL_TEMPLATES, DrillTemplate, GOAL_LABELS, VENUE_LABELS } from '../data/badmintonKnowledge';

const DAY_NAMES = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];

// 科学训练日分布方案 (根据每周训练天数智能分配，确保休息日穿插)
const SCHEDULE_PATTERNS: Record<number, number[]> = {
  1: [6], // 周六
  2: [2, 6], // 周二、周六
  3: [1, 3, 5], // 周一、周三、周五 (经典隔天练)
  4: [1, 3, 5, 7], // 周一、周三、周五、周日
  5: [1, 2, 4, 5, 6], // 周一、周二、周四、周五、周六 (周三周日休息)
  6: [1, 2, 3, 4, 5, 6], // 周一至周六 (周日系统休息)
};

// 时长切分规则 (保证总时长严格等于选择时长)
interface PhaseDurationSplit {
  warmup: number;
  technical: number;
  footwork_or_fitness: number;
  cooldown: number;
}

const DURATION_SPLITS: Record<number, PhaseDurationSplit> = {
  30: { warmup: 5, technical: 12, footwork_or_fitness: 10, cooldown: 3 },
  45: { warmup: 7, technical: 20, footwork_or_fitness: 14, cooldown: 4 },
  60: { warmup: 10, technical: 26, footwork_or_fitness: 19, cooldown: 5 },
  90: { warmup: 12, technical: 42, footwork_or_fitness: 30, cooldown: 6 },
};

// 休息日恢复建议库
const REST_DAY_TIPS = [
  '主动恢复：进行15-20分钟低强度快走或动态关节拉伸，促进下肢乳酸代谢与血液循环。',
  '筋膜放松：使用泡沫轴或筋膜球重点滚压大腿股四头肌、小腿腓肠肌与足底筋膜，每处滚压30-60秒。',
  '战术复盘：观看1-2局高水平国际羽毛球比赛（如全英赛、世锦赛），重点观察职业球员的启动步时机与发接发第三拍选择。',
  '营养与睡眠：补充优质蛋白质与电解质水，保证7.5小时以上深度睡眠，加速骨骼肌微损伤的超量恢复。',
  '预防劳损：检查球拍拍线磅数是否偏高、手胶是否磨损变滑，如有手腕或肘部不适可做轻度冰敷或热敷。',
];

export function generateWeeklyPlan(profile: UserProfile): WeeklyPlan {
  const activeDays = SCHEDULE_PATTERNS[profile.daysPerWeek] || [1, 3, 5];
  const durationSplit = DURATION_SPLITS[profile.durationMinutes] || DURATION_SPLITS[60];

  const days: DayPlan[] = [];

  let trainingSessionIndex = 0;

  for (let dayNum = 1; dayNum <= 7; dayNum++) {
    const isRestDay = !activeDays.includes(dayNum);
    const dayName = DAY_NAMES[dayNum - 1];

    if (isRestDay) {
      days.push({
        dayOfWeek: dayNum,
        dayName,
        isRestDay: true,
        theme: '主动休息与肌肉再生',
        focusGoal: 'rest',
        totalDurationMinutes: 0,
        difficultyRating: 1,
        venue: profile.venue,
        drills: [],
        precautions: [
          '休息日严禁进行高强度羽毛球对抗或负重训练',
          '让跟腱、膝关节半月板及肩袖韧带获得充分修复周期',
        ],
        restDayTips: REST_DAY_TIPS[(dayNum - 1) % REST_DAY_TIPS.length],
      });
    } else {
      trainingSessionIndex++;
      const dayPlan = buildTrainingDay(
        dayNum,
        dayName,
        trainingSessionIndex,
        profile,
        durationSplit
      );
      days.push(dayPlan);
    }
  }

  return {
    id: `plan_${Date.now()}`,
    createdAt: new Date().toISOString(),
    profileSnapshot: { ...profile },
    days,
  };
}

function buildTrainingDay(
  dayNum: number,
  dayName: string,
  sessionIndex: number,
  profile: UserProfile,
  split: PhaseDurationSplit
): DayPlan {
  // 根据用户主目标、训练场次和场地生成有针对性的当日主题与焦点
  const { theme, focusGoal, difficultyRating, precautions } = determineDailyFocus(
    sessionIndex,
    profile
  );

  // 筛选匹配的训练项
  const warmupDrills = selectDrills('warmup', profile, split.warmup, sessionIndex);
  const technicalDrills = selectDrills('technical', profile, split.technical, sessionIndex);
  const footworkDrills = selectDrills('footwork_or_fitness', profile, split.footwork_or_fitness, sessionIndex);
  const cooldownDrills = selectDrills('cooldown', profile, split.cooldown, sessionIndex);

  const allDrills = [...warmupDrills, ...technicalDrills, ...footworkDrills, ...cooldownDrills];

  // 严格核算总时长
  const calculatedTotal = allDrills.reduce((sum, d) => sum + d.durationMinutes, 0);

  return {
    dayOfWeek: dayNum,
    dayName,
    isRestDay: false,
    theme,
    focusGoal,
    totalDurationMinutes: calculatedTotal,
    difficultyRating,
    venue: profile.venue,
    drills: allDrills,
    precautions,
  };
}

function determineDailyFocus(
  sessionIndex: number,
  profile: UserProfile
): {
  theme: string;
  focusGoal: TrainingGoal;
  difficultyRating: 1 | 2 | 3;
  precautions: string[];
} {
  const { goal, venue, level } = profile;

  // 场地特化提示
  const venueTips: string[] = [];
  if (venue === 'home') {
    venueTips.push('居家训练务必清理地面障碍物，挥拍前反复确认上方灯具及墙壁安全距离');
  } else if (venue === 'gym') {
    venueTips.push('器械负重以动作速率和神经爆发力为主，避免大重量力竭影响手腕手指敏锐度');
  } else {
    venueTips.push('全场大跨步制动时注意脚后跟先着地再过渡前脚掌，膝盖严禁内扣');
  }

  // 难度阶梯
  const difficulty: 1 | 2 | 3 = level === 'beginner' ? 1 : level === 'intermediate' ? 2 : 3;

  if (goal === 'attack') {
    const themes = [
      '后场引拍蓄力与高远球压迫',
      '重杀与点杀落点变速突击',
      '后场进攻后连贯前场扑杀',
      '双打后场连续下压与平抽反压',
      '杀球下压与滑板吊球假动作',
      '进攻步法与起跳滞空爆发力',
    ];
    return {
      theme: themes[(sessionIndex - 1) % themes.length],
      focusGoal: 'attack',
      difficultyRating: difficulty,
      precautions: [
        '杀球下压切忌全靠手腕生硬下折，必须依靠大臂带小臂内旋鞭打发力',
        ...venueTips,
      ],
    };
  }

  if (goal === 'defense') {
    const themes = [
      '低重心防守站位与接杀挡网',
      '平抽挡快节奏对攻与回放',
      '被动反手后场高球摆脱',
      '防守反击变对角与直线挑后场',
      '追身球手腕闪动卸力控制',
      '防守步法横向大跨步制动与回动',
    ];
    return {
      theme: themes[(sessionIndex - 1) % themes.length],
      focusGoal: 'defense',
      difficultyRating: difficulty,
      precautions: [
        '接杀时站位重心必须下沉，持拍手置于胸腹前，不要让拍头下垂',
        ...venueTips,
      ],
    };
  }

  if (goal === 'footwork') {
    const themes = [
      '分腿启动步与网前跨步缓冲',
      '六点米字步全场节奏连贯',
      '后场两点起跳并步与交叉步',
      '被动步法转换与快速重心回位',
      '突击并步冲刺与急停变向',
      '小碎步调整与防守滑步',
    ];
    return {
      theme: themes[(sessionIndex - 1) % themes.length],
      focusGoal: 'footwork',
      difficultyRating: (Math.min(difficulty + 1, 3) as 1 | 2 | 3),
      precautions: [
        '启动步务必与击球假想动作同步，落地轻盈，脚跟微悬空保持跟腱弹性',
        ...venueTips,
      ],
    };
  }

  if (goal === 'fitness') {
    const themes = [
      '下肢爆发力与起跳抗阻训练',
      '核心抗旋转与杀球螺旋发力',
      '肩袖肌群保养与上肢鞭打耐力',
      '羽毛球无氧间歇与心肺冲刺',
      '踝关节稳定与膝周肌肉强化',
      '敏捷反应与高频碎步耐力',
    ];
    return {
      theme: themes[(sessionIndex - 1) % themes.length],
      focusGoal: 'fitness',
      difficultyRating: (Math.min(difficulty + 1, 3) as 1 | 2 | 3),
      precautions: [
        '羽毛球体能注重高频爆发与多向变向，严禁在动作严重变形时盲目加量',
        ...venueTips,
      ],
    };
  }

  if (goal === 'fundamentals') {
    const themes = [
      '正反手握拍灵活转换与空挥定型',
      '后场高远球架拍与发力链条',
      '网前正反手搓放球手指微调',
      '正手发高远球与反手发网前球到位率',
      '中场平抽挡与手腕点弹技巧',
      '前后场基础移动与击球点判断',
    ];
    return {
      theme: themes[(sessionIndex - 1) % themes.length],
      focusGoal: 'fundamentals',
      difficultyRating: 1,
      precautions: [
        '初学者最关键是保持击球前手指放松握拍，触球瞬间紧握发力，避免手臂死力',
        ...venueTips,
      ],
    };
  }

  // comprehensive (综合提升)
  const compThemes = [
    '后场高远拉吊与四方球控点',
    '攻防转换：接杀挡网后连贯上网',
    '平抽快挡与中半场抓推突击',
    '前后场全套米字步结合假动作',
    '双打战术轮转与防守反击',
    '高强度多球击打与实战模拟',
  ];
  return {
    theme: compThemes[(sessionIndex - 1) % compThemes.length],
    focusGoal: 'comprehensive',
    difficultyRating: difficulty,
    precautions: [
      '实战连贯中注意每一拍击球后身体立即回动中场并做分腿准备步，切勿看球发呆',
      ...venueTips,
    ],
  };
}

function selectDrills(
  phase: PhaseType,
  profile: UserProfile,
  targetMinutes: number,
  seedIndex: number
): DrillItem[] {
  // 过滤满足场地条件的动作模版
  let candidates = DRILL_TEMPLATES.filter((t) => {
    if (t.phase !== phase) return false;
    // 场地过滤
    if (!t.suitableVenues.includes(profile.venue)) return false;
    return true;
  });

  // 如果按目标优先有，则优先取目标相关的
  const goalFiltered = candidates.filter((t) => t.suitableGoals.includes(profile.goal));
  if (goalFiltered.length > 0) {
    candidates = goalFiltered;
  }

  // 如果依然为空（极端情况），取同phase任意可用模版
  if (candidates.length === 0) {
    candidates = DRILL_TEMPLATES.filter((t) => t.phase === phase);
  }

  // 90分钟技术阶段可能安排2个专项技术项目，其余阶段安排1-2项
  const items: DrillItem[] = [];

  if (phase === 'technical' && targetMinutes >= 35 && candidates.length >= 2) {
    // 两个练习项目，平分时长
    const half1 = Math.round(targetMinutes / 2);
    const half2 = targetMinutes - half1;
    const t1 = candidates[seedIndex % candidates.length];
    const t2 = candidates[(seedIndex + 1) % candidates.length];

    items.push(formatDrillItem(t1, half1, 1));
    items.push(formatDrillItem(t2, half2, 2));
  } else if (phase === 'footwork_or_fitness' && targetMinutes >= 25 && candidates.length >= 2) {
    const half1 = Math.round(targetMinutes / 2);
    const half2 = targetMinutes - half1;
    const t1 = candidates[seedIndex % candidates.length];
    const t2 = candidates[(seedIndex + 1) % candidates.length];

    items.push(formatDrillItem(t1, half1, 1));
    items.push(formatDrillItem(t2, half2, 2));
  } else {
    // 单项满额
    const t = candidates[seedIndex % candidates.length];
    items.push(formatDrillItem(t, targetMinutes, 1));
  }

  return items;
}

function formatDrillItem(template: DrillTemplate, minutes: number, idx: number): DrillItem {
  // 根据目标分钟动态调整组数
  const adjustedSets = Math.max(2, Math.round((minutes / template.baseMinutes) * template.sets));

  return {
    id: `drill_${template.name.replace(/\s+/g, '')}_${idx}_${minutes}`,
    name: template.name,
    phase: template.phase,
    objective: template.objective,
    durationMinutes: minutes,
    sets: adjustedSets,
    repsOrDuration: template.repsOrDuration,
    restBetweenSets: template.restBetweenSets,
    keyPoints: template.keyPoints,
    difficulty: template.difficulty,
  };
}
