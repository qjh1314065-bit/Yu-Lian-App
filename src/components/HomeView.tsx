import React from 'react';
import { UserProfile, WeeklyPlan, CheckinRecord, DayPlan } from '../types';
import { LEVEL_LABELS, GOAL_LABELS, VENUE_LABELS } from '../data/badmintonKnowledge';
import { NavView } from './Navbar';
import { getLocalDateString } from '../utils/storage';
import { 
  Play, 
  Calendar, 
  CheckCircle2, 
  Flame, 
  Award, 
  Clock, 
  ArrowRight, 
  ShieldCheck, 
  Footprints,
  Sparkles,
  ChevronRight,
  HeartHandshake
} from 'lucide-react';

interface HomeViewProps {
  profile: UserProfile;
  weeklyPlan: WeeklyPlan;
  checkins: CheckinRecord[];
  onNavigate: (view: NavView, targetDay?: number) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  profile,
  weeklyPlan,
  checkins,
  onNavigate,
}) => {
  const currentJsDay = new Date().getDay();
  const todayDayOfWeek = currentJsDay === 0 ? 7 : currentJsDay;

  const todayPlan = weeklyPlan.days.find((d) => d.dayOfWeek === todayDayOfWeek) || weeklyPlan.days[0];

  const todayDateStr = getLocalDateString();
  const todayCheckin = checkins.find((c) => c.date === todayDateStr);

  const plannedTrainingDaysCount = weeklyPlan.days.filter((d) => !d.isRestDay).length;
  
  const completedTrainingDaysCount = weeklyPlan.days.filter((d) => {
    if (d.isRestDay) return false;
    return checkins.some((c) => c.dayOfWeek === d.dayOfWeek);
  }).length;

  const weeklyCompletionRate = plannedTrainingDaysCount > 0
    ? Math.min(100, Math.round((completedTrainingDaysCount / plannedTrainingDaysCount) * 100))
    : 0;

  const totalSessions = checkins.length;
  const totalMinutes = checkins.reduce((sum, c) => sum + c.actualDurationMinutes, 0);
  const totalHours = (totalMinutes / 60).toFixed(1);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* 顶部训练画像概览与品牌英雄区 (Refactoring UI: 明确主视觉与行长限制) */}
      <section className="relative overflow-hidden rounded-2xl bg-[#091E17] border border-[#14382B] p-6 sm:p-8">
        {/* 背景轻量羽毛球球场线 SVG 装饰 (低对比度，不干扰前景文字阅读) */}
        <div className="absolute right-0 top-0 bottom-0 w-80 opacity-[0.05] pointer-events-none hidden md:block">
          <svg className="w-full h-full" viewBox="0 0 200 300" fill="none" stroke="#F5F7F5" strokeWidth="1.5">
            <rect x="10" y="10" width="180" height="280" />
            <line x1="10" y1="150" x2="190" y2="150" strokeWidth="2.5" />
            <line x1="10" y1="90" x2="190" y2="90" />
            <line x1="10" y1="210" x2="190" y2="210" />
            <line x1="100" y1="10" x2="100" y2="90" />
            <line x1="100" y1="210" x2="100" y2="290" />
          </svg>
        </div>

        <div className="max-w-2xl space-y-3 relative z-10">
          <div className="flex items-center gap-2 text-xs font-mono font-bold tracking-wider uppercase text-[#CCFF00]">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>Badminton Conditioning & Skill Engine</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#F5F7F5] tracking-tight leading-tight">
            科学规划，<span className="text-[#CCFF00]">精进每一拍</span>
          </h1>

          <p className="text-sm sm:text-base text-[#B3C4B8] leading-relaxed">
            系统已依据您的羽球段位、场地条件与生理负荷周期完成动态排课。专注每次高质量动作定型与步伐回动。
          </p>

          {/* 训练画像标签展示 (Refactoring UI: 零药丸设计，文字加中圆点分隔符) */}
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5 pt-2 text-xs text-[#7E9385]">
            <span className="font-semibold text-[#F5F7F5]">当前画像:</span>
            <span>{LEVEL_LABELS[profile.level].name}</span>
            <span aria-hidden="true" className="text-[#365042]">·</span>
            <span>目标: {GOAL_LABELS[profile.goal].name}</span>
            <span aria-hidden="true" className="text-[#365042]">·</span>
            <span>每周 {profile.daysPerWeek} 天</span>
            <span aria-hidden="true" className="text-[#365042]">·</span>
            <span>单次 {profile.durationMinutes} 分钟</span>
            <span aria-hidden="true" className="text-[#365042]">·</span>
            <span>{VENUE_LABELS[profile.venue].name.split(' ')[0]}</span>
            <span aria-hidden="true" className="text-[#365042]">·</span>
            <button
              type="button"
              onClick={() => onNavigate('profile')}
              className="text-[#CCFF00] hover:underline underline-offset-4 font-semibold transition-colors focus-visible:outline-none"
            >
              调整画像
            </button>
          </div>

          {/* 新手空打卡提示引导 (Refactoring UI: 解释当前为什么无数据 + 下一步行动) */}
          {totalSessions === 0 && (
            <div className="mt-3 p-3.5 rounded-xl bg-[#06140F]/80 border border-[#14382B] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5 text-[#B3C4B8]">
                <Sparkles className="w-4 h-4 text-[#CCFF00] shrink-0" />
                <span>初次使用：先查看今日课表并完成第 1 次训练打卡，系统将自动点亮 7 天负荷趋势图！</span>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('workout', todayPlan.dayOfWeek)}
                className="text-[#CCFF00] font-bold hover:underline whitespace-nowrap self-start sm:self-auto"
              >
                开始训练 →
              </button>
            </div>
          )}
        </div>
      </section>

      {/* 今日训练焦点卡片 (Refactoring UI: 唯一主要卡片，层次分明) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-[#CCFF00]" />
            <h2 className="text-lg sm:text-xl font-bold text-[#F5F7F5] tracking-tight">今日训练任务</h2>
            <span className="text-xs font-mono text-[#7E9385]">({todayPlan.dayName})</span>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('plan')}
            className="flex items-center gap-1 text-xs sm:text-sm font-semibold text-[#7E9385] hover:text-[#CCFF00] transition-colors focus-visible:outline-none"
          >
            <span>完整周课表</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {todayPlan.isRestDay ? (
          /* 休息日卡片 */
          <div className="rounded-2xl bg-[#0A1F18] border border-[#14382B] p-6 sm:p-7 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#7E9385]">
                  <HeartHandshake className="w-4 h-4 text-[#CCFF00]" />
                  <span>系统休息日 · 积极肌能再生与神经复原</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-[#F5F7F5] tracking-tight">
                  {todayPlan.theme}
                </h3>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs text-[#7E9385]">0 分钟高强度负荷</span>
                <button
                  type="button"
                  onClick={() => onNavigate('workout', todayPlan.dayOfWeek)}
                  className="px-4 py-2.5 min-h-[42px] text-xs font-bold text-[#F5F7F5] hover:text-white bg-[#0E2A20] hover:bg-[#14382B] border border-[#14382B] rounded-xl transition-all active:scale-[0.98] whitespace-nowrap flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#CCFF00]"
                >
                  <span>查看恢复指南与轻量记录</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#06140F]/80 border border-[#14382B] text-xs sm:text-sm text-[#B3C4B8] space-y-1">
              <div className="font-bold text-[#CCFF00] text-xs">运动科学教练贴士:</div>
              <p className="leading-relaxed">{todayPlan.restDayTips}</p>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-[#7E9385] pt-2 border-t border-[#14382B]/60">
              <span>羽毛球急停急起频繁，休息日充分放松跟腱与膝关节软组织至关重要。</span>
              <button
                type="button"
                onClick={() => onNavigate('workout', todayPlan.dayOfWeek)}
                className="text-[#B3C4B8] hover:text-[#CCFF00] underline underline-offset-4 text-left sm:text-right"
              >
                补充轻量拉伸记录
              </button>
            </div>
          </div>
        ) : (
          /* 正式训练日卡片 */
          <div className="rounded-2xl bg-[#0A1F18] border border-[#14382B] p-6 sm:p-7 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2 text-xs text-[#7E9385]">
                  <span className="font-semibold text-[#CCFF00]">{todayPlan.dayName}训练日</span>
                  <span aria-hidden="true">·</span>
                  <span>预定 {todayPlan.totalDurationMinutes} 分钟</span>
                  <span aria-hidden="true">·</span>
                  <span>难度 {'★'.repeat(todayPlan.difficultyRating)}{'☆'.repeat(3 - todayPlan.difficultyRating)}</span>
                  <span aria-hidden="true">·</span>
                  <span>场地: {profile.venue === 'court' ? '球场' : profile.venue === 'home' ? '居家' : '健身房'}</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-[#F5F7F5] tracking-tight">
                  {todayPlan.theme}
                </h3>
              </div>

              {todayCheckin ? (
                <div className="flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-xl bg-[#0E2A20] border border-[#14382B] text-[#CCFF00] text-xs sm:text-sm font-bold shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>今日已打卡 ({todayCheckin.actualDurationMinutes}分钟)</span>
                </div>
              ) : (
                /* Primary Button: 页面唯一的强对比度实心按钮 */
                <button
                  type="button"
                  onClick={() => onNavigate('workout', todayPlan.dayOfWeek)}
                  className="flex items-center justify-center gap-2 px-6 py-3 min-h-[46px] rounded-xl bg-[#CCFF00] hover:bg-[#B8E600] text-black font-extrabold text-sm tracking-wide transition-all shadow-[#CCFF00]/10 shadow-sm active:scale-[0.98] whitespace-nowrap shrink-0 w-full sm:w-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#CCFF00]"
                >
                  <Play className="w-4 h-4 fill-black" />
                  <span>进入训练执行与打卡</span>
                </button>
              )}
            </div>

            {/* 四阶段分解 (Refactoring UI: 留白与弱背景区隔，不搞卡套卡) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {todayPlan.drills.map((drill, idx) => (
                <div
                  key={drill.id || idx}
                  className="p-4 rounded-xl bg-[#06140F]/70 border border-[#14382B]/70 space-y-2 flex flex-col justify-between hover:border-[#14382B] transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-[#CCFF00] tracking-wider">
                        {drill.phase === 'warmup'
                          ? '01. 热身准备'
                          : drill.phase === 'technical'
                          ? '02. 核心技术'
                          : drill.phase === 'footwork_or_fitness'
                          ? '03. 步法/体能'
                          : '04. 整理拉伸'}
                      </span>
                      <span className="font-mono tabular-nums text-[#7E9385] font-semibold">
                        {drill.durationMinutes}m
                      </span>
                    </div>
                    <div className="text-sm font-bold text-[#F5F7F5] line-clamp-1">{drill.name}</div>
                    <div className="text-xs text-[#7E9385] line-clamp-1">{drill.objective}</div>
                  </div>

                  <div className="pt-2 border-t border-[#14382B]/60 text-[11px] text-[#7E9385] font-mono tabular-nums">
                    {drill.sets}组 · {drill.repsOrDuration}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-[#14382B] text-xs text-[#7E9385]">
              <span className="line-clamp-1">
                教练提示: {todayPlan.precautions[0] || '注意步法启动瞬间的分腿重心下沉'}
              </span>
              <button
                type="button"
                onClick={() => onNavigate('workout', todayPlan.dayOfWeek)}
                className="text-[#CCFF00] hover:underline font-bold whitespace-nowrap self-start sm:self-auto focus-visible:outline-none"
              >
                查看动作细节与秒表打卡 →
              </button>
            </div>
          </div>
        )}
      </section>

      {/* 本周七天进度条 (移动端水平滚动，保证触控面积 >= 44px) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#CCFF00]" />
            <h2 className="text-lg sm:text-xl font-bold text-[#F5F7F5] tracking-tight">本周排课概览</h2>
          </div>
          <div className="text-xs font-mono tabular-nums text-[#7E9385]">
            周完成度: <strong className="text-[#F5F7F5]">{completedTrainingDaysCount} / {plannedTrainingDaysCount} 天</strong> ({weeklyCompletionRate}%)
          </div>
        </div>

        {/* 移动端横向滑动容器，桌面端网格对齐 */}
        <div className="flex sm:grid sm:grid-cols-7 gap-2.5 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
          {weeklyPlan.days.map((day) => {
            const isToday = day.dayOfWeek === todayDayOfWeek;
            const isDone = checkins.some((c) => c.dayOfWeek === day.dayOfWeek);

            return (
              <button
                type="button"
                key={day.dayOfWeek}
                onClick={() => onNavigate('workout', day.dayOfWeek)}
                className={`relative flex-1 min-w-[76px] sm:min-w-0 min-h-[92px] flex flex-col items-center justify-between p-3 rounded-xl border text-center transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#CCFF00] ${
                  isToday
                    ? 'border-[#CCFF00] bg-[#0A1F18] shadow-md shadow-[#CCFF00]/5 ring-1 ring-[#CCFF00]/30'
                    : 'border-[#14382B] bg-[#0A1F18]/60 hover:bg-[#0A1F18] hover:border-[#1C4B3B]'
                }`}
              >
                {isToday && (
                  <span className="absolute -top-2 px-1.5 py-0.5 rounded text-[9px] font-black bg-[#CCFF00] text-black tracking-wider">
                    今日
                  </span>
                )}

                <span className={`text-xs font-bold ${isToday ? 'text-[#CCFF00]' : 'text-[#F5F7F5]'}`}>
                  {day.dayName}
                </span>

                <div className="my-1 flex items-center justify-center">
                  {day.isRestDay ? (
                    <span className="text-[11px] text-[#4D6154] font-medium">休息</span>
                  ) : isDone ? (
                    <CheckCircle2 className="w-5 h-5 text-[#CCFF00]" />
                  ) : (
                    <span className="font-mono tabular-nums text-xs font-semibold text-[#B3C4B8]">
                      {day.totalDurationMinutes}m
                    </span>
                  )}
                </div>

                <span className="text-[10px] text-[#7E9385] truncate max-w-full">
                  {day.isRestDay ? '肌能再生' : day.focusGoal === 'attack' ? '进攻' : day.focusGoal === 'defense' ? '防守' : day.focusGoal === 'footwork' ? '步法' : day.focusGoal === 'fitness' ? '体能' : '专项'}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 真实训练数据看板概览 (Refactoring UI: 基线对齐数字与单位) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-bold text-[#F5F7F5] tracking-tight">训练指标快报</h2>
          <button
            type="button"
            onClick={() => onNavigate('stats')}
            className="text-xs sm:text-sm font-semibold text-[#7E9385] hover:text-[#CCFF00] transition-colors focus-visible:outline-none"
          >
            历史日志与图表 →
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* 累计打卡 */}
          <div className="rounded-xl bg-[#0A1F18] border border-[#14382B] p-5 space-y-2">
            <div className="flex items-center justify-between text-[#7E9385]">
              <span className="text-xs font-medium">累计完成打卡</span>
              <Award className="w-4 h-4 text-[#CCFF00]" />
            </div>
            <div className="flex items-baseline gap-1.5 font-mono tabular-nums text-3xl font-extrabold text-[#F5F7F5]">
              <span>{totalSessions}</span>
              <span className="text-xs font-normal text-[#7E9385]">次训练</span>
            </div>
            <p className="text-xs text-[#7E9385]">
              {totalSessions === 0 ? '完成初次训练即可激活统计' : `已系统性沉淀 ${totalSessions} 节高质量训练`}
            </p>
          </div>

          {/* 累计时长 */}
          <div className="rounded-xl bg-[#0A1F18] border border-[#14382B] p-5 space-y-2">
            <div className="flex items-center justify-between text-[#7E9385]">
              <span className="text-xs font-medium">累计专注训练总时长</span>
              <Clock className="w-4 h-4 text-[#CCFF00]" />
            </div>
            <div className="flex items-baseline gap-1.5 font-mono tabular-nums text-3xl font-extrabold text-[#F5F7F5]">
              <span>{totalHours}</span>
              <span className="text-xs font-normal text-[#7E9385]">小时</span>
            </div>
            <p className="text-xs text-[#7E9385] font-mono tabular-nums">
              折合 {totalMinutes} 分钟专项运动负荷
            </p>
          </div>

          {/* 本周执行率带进度条 */}
          <div className="rounded-xl bg-[#0A1F18] border border-[#14382B] p-5 space-y-2.5">
            <div className="flex items-center justify-between text-[#7E9385]">
              <span className="text-xs font-medium">本周课表执行率</span>
              <Footprints className="w-4 h-4 text-[#CCFF00]" />
            </div>
            <div className="flex items-baseline gap-1 font-mono tabular-nums text-3xl font-extrabold text-[#F5F7F5]">
              <span>{weeklyCompletionRate}</span>
              <span className="text-xs font-normal text-[#7E9385]">%</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-[#06140F] overflow-hidden">
              <div
                style={{ width: `${weeklyCompletionRate}%` }}
                className="h-full bg-[#CCFF00] rounded-full transition-all duration-300"
              />
            </div>
            <p className="text-xs text-[#7E9385]">
              本周计划 {plannedTrainingDaysCount} 天，已完成 {completedTrainingDaysCount} 天
            </p>
          </div>
        </div>
      </section>

      {/* 科学训练原则提醒 (Refactoring UI: 人性化自然排版与微编号) */}
      <section className="rounded-xl bg-[#0A1F18]/60 border border-[#14382B] p-6 space-y-3">
        <h3 className="text-sm font-bold text-[#F5F7F5] tracking-wide">羽毛球业余训练三大核心原则</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-[#B3C4B8]">
          <div className="p-4 rounded-xl bg-[#06140F]/80 border border-[#14382B] space-y-1.5">
            <div className="font-bold text-[#CCFF00]">01. 动作一致性优先于盲目发蛮力</div>
            <p className="text-[#7E9385] leading-relaxed">
              高远球、吊球与杀球的架拍动作应完全一致，在击球前一刹那通过小臂内旋和拍面角度实现变速，避免拉大臂死发力。
            </p>
          </div>
          <div className="p-4 rounded-xl bg-[#06140F]/80 border border-[#14382B] space-y-1.5">
            <div className="font-bold text-[#CCFF00]">02. 启动步与回动中场是步法灵魂</div>
            <p className="text-[#7E9385] leading-relaxed">
              击球后切勿站在原地看球；每次出球后必须迅速回动中场，并在对手触球瞬间做一次轻盈的分腿启动步（Split-step）。
            </p>
          </div>
          <div className="p-4 rounded-xl bg-[#06140F]/80 border border-[#14382B] space-y-1.5">
            <div className="font-bold text-[#CCFF00]">03. 落地膝关节与脚尖同向减震</div>
            <p className="text-[#7E9385] leading-relaxed">
              跨步救球与起跳扣杀落地时，右膝务必与第二脚趾方向对齐，膝关节严禁向内扣，脚后跟先着地滚动至前脚掌，保护半月板。
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
