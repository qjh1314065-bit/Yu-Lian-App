import React, { useState, useEffect } from 'react';
import { UserProfile, WeeklyPlan, CheckinRecord, DayPlan, WorkoutFeeling } from '../types';
import { COMMON_MISTAKES } from '../data/badmintonKnowledge';
import { TimerWidget } from './TimerWidget';
import { NavView } from './Navbar';
import { playSuccessChime } from '../utils/sound';
import { getLocalDateString } from '../utils/storage';
import { 
  CheckCircle2, 
  Circle, 
  ChevronDown, 
  ChevronUp, 
  Save, 
  Award, 
  RotateCcw, 
  Sparkles, 
  AlertCircle,
  HelpCircle,
  Clock,
  Zap,
  Info,
  ArrowRight,
  Check,
  Target,
  Trophy
} from 'lucide-react';

interface WorkoutDetailViewProps {
  profile: UserProfile;
  weeklyPlan: WeeklyPlan;
  checkins: CheckinRecord[];
  selectedDayOfWeek: number;
  onSelectDay: (day: number) => void;
  onSaveCheckin: (record: CheckinRecord) => void;
  onNavigate: (view: NavView) => void;
}

export const WorkoutDetailView: React.FC<WorkoutDetailViewProps> = ({
  profile,
  weeklyPlan,
  checkins,
  selectedDayOfWeek,
  onSelectDay,
  onSaveCheckin,
  onNavigate,
}) => {
  const currentPlanDay = weeklyPlan.days.find((d) => d.dayOfWeek === selectedDayOfWeek) || weeklyPlan.days[0];

  // 勾选已完成的项目
  const [completedDrills, setCompletedDrills] = useState<string[]>([]);
  const [expandedDrills, setExpandedDrills] = useState<Record<string, boolean>>({});

  // 打卡表单状态
  const [actualMinutes, setActualMinutes] = useState<number | ''>(currentPlanDay.totalDurationMinutes || 60);
  const [feeling, setFeeling] = useState<WorkoutFeeling>('good');
  const [fatigueRpe, setFatigueRpe] = useState<number>(6);
  const [selectedMistakes, setSelectedMistakes] = useState<string[]>([]);
  const [customMistake, setCustomMistake] = useState<string>('');
  const [nextFocusOrImprovements, setNextFocusOrImprovements] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isSavedSuccess, setIsSavedSuccess] = useState<boolean>(false);

  // 检查该天是否已有打卡记录
  const existingCheckin = checkins.find((c) => c.dayOfWeek === currentPlanDay.dayOfWeek);

  // 当选择不同星期日时，初始化状态
  useEffect(() => {
    setIsSavedSuccess(false);
    if (existingCheckin) {
      setActualMinutes(existingCheckin.actualDurationMinutes);
      setFeeling(existingCheckin.feeling);
      setFatigueRpe(existingCheckin.fatigueRpe);
      setCompletedDrills(existingCheckin.completedDrillIds || []);
      setNotes(existingCheckin.notes || '');
      setNextFocusOrImprovements(existingCheckin.nextFocusOrImprovements || '');
      if (existingCheckin.mistakesOrReflections) {
        setCustomMistake(existingCheckin.mistakesOrReflections);
      }
    } else {
      setActualMinutes(currentPlanDay.totalDurationMinutes || (currentPlanDay.isRestDay ? 20 : 60));
      setCompletedDrills([]);
      setFeeling('good');
      setFatigueRpe(currentPlanDay.isRestDay ? 2 : 6);
      setSelectedMistakes([]);
      setCustomMistake('');
      setNotes('');
      setNextFocusOrImprovements('');
    }
  }, [selectedDayOfWeek, existingCheckin, currentPlanDay]);

  const toggleDrillComplete = (drillId: string) => {
    setCompletedDrills((prev) =>
      prev.includes(drillId) ? prev.filter((id) => id !== drillId) : [...prev, drillId]
    );
  };

  const toggleDrillExpand = (drillId: string) => {
    setExpandedDrills((prev) => ({
      ...prev,
      [drillId]: !prev[drillId],
    }));
  };

  const toggleMistakeTag = (tag: string) => {
    setSelectedMistakes((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleCheckinSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const combinedMistakes = [
      ...selectedMistakes,
      customMistake.trim(),
    ].filter(Boolean).join('； ');

    const newRecord: CheckinRecord = {
      id: existingCheckin ? existingCheckin.id : `checkin_${Date.now()}`,
      date: existingCheckin ? existingCheckin.date : getLocalDateString(),
      timestamp: Date.now(),
      dayOfWeek: currentPlanDay.dayOfWeek,
      dayName: currentPlanDay.dayName,
      theme: currentPlanDay.theme,
      plannedDurationMinutes: currentPlanDay.totalDurationMinutes,
      actualDurationMinutes: actualMinutes === '' || isNaN(Number(actualMinutes))
        ? (currentPlanDay.totalDurationMinutes || 60)
        : Math.min(300, Math.max(5, Number(actualMinutes))),
      feeling,
      fatigueRpe,
      completedDrillIds: completedDrills,
      mistakesOrReflections: combinedMistakes,
      nextFocusOrImprovements: nextFocusOrImprovements.trim(),
      notes: notes.trim(),
      venue: currentPlanDay.venue,
      level: profile.level,
    };

    onSaveCheckin(newRecord);
    setIsSavedSuccess(true);
    playSuccessChime();

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const RPE_DESCRIPTIONS: Record<number, string> = {
    1: '1 极度轻松 · 几乎无心肺负担，相当于常速步行',
    2: '2 很轻松 · 呼吸自然，轻微出汗，关节充分润滑',
    3: '3 轻松适度 · 可保持连续清晰交流，体表微微发热',
    4: '4 节奏适中 · 心率微升，多拍相持后可完整言语',
    5: '5 中等强度 · 汗液明显析出，步法节奏平稳受控',
    6: '6 较重负荷 · 步法出球需持续注意力，间歇需深呼吸',
    7: '7 剧烈负荷 · 高心率多球压迫，体能消耗进入无氧区',
    8: '8 极限吃力 · 对抗强度极高，心跳急促且难以连续交谈',
    9: '9 临界竭力 · 接近无氧乳酸阈值，连续起跳出现迟滞',
    10: '10 彻底力竭 · 无法多维持一次完整的后场跃起杀上网',
  };

  return (
    <div className="space-y-8 animate-fade-in pb-16 lg:pb-0">
      {/* 星期切换标签栏 (Refactoring UI: 触控区 ≥ 44px，平滑横向滚动) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
        {weeklyPlan.days.map((day) => {
          const isSelected = day.dayOfWeek === selectedDayOfWeek;
          const isDone = checkins.some((c) => c.dayOfWeek === day.dayOfWeek);

          return (
            <button
              type="button"
              key={day.dayOfWeek}
              onClick={() => onSelectDay(day.dayOfWeek)}
              className={`flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-xl text-xs font-bold transition-all active:scale-95 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#CCFF00] ${
                isSelected
                  ? 'bg-[#CCFF00] text-black shadow-sm font-extrabold'
                  : 'bg-[#0A1F18] border border-[#14382B] text-[#7E9385] hover:text-[#F5F7F5] hover:border-[#1C4B3B]'
              }`}
            >
              <span>{day.dayName}</span>
              {day.isRestDay ? (
                <span className={`text-[10px] ${isSelected ? 'text-black/80' : 'text-[#4D6154]'}`}>
                  (休)
                </span>
              ) : isDone ? (
                <CheckCircle2 className={`w-3.5 h-3.5 ${isSelected ? 'text-black' : 'text-[#CCFF00]'}`} />
              ) : (
                <span className={`font-mono text-[10px] ${isSelected ? 'text-black/80' : 'text-[#7E9385]'}`}>
                  {day.totalDurationMinutes}m
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 保存成功提示条 (Refactoring UI: 明确的双重状态编码与次要操作) */}
      {isSavedSuccess && (
        <div className="rounded-xl bg-[#0E2A20] border border-[#CCFF00]/40 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#CCFF00] text-black shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm sm:text-base font-bold text-[#F5F7F5]">
                训练记录已成功保存到本地存储
              </h4>
              <p className="text-xs text-[#7E9385]">
                已实时更新累计时长与本周执行率，刷新或重新打开页面数据依然保持。
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onNavigate('stats')}
              className="px-4 py-2 min-h-[36px] text-xs font-bold bg-[#CCFF00] hover:bg-[#B8E600] text-black rounded-lg transition-all active:scale-95 whitespace-nowrap focus-visible:outline-none"
            >
              查看看板图表
            </button>
            <button
              type="button"
              onClick={() => setIsSavedSuccess(false)}
              className="px-3 py-2 min-h-[36px] text-xs text-[#7E9385] hover:text-[#F5F7F5] transition-colors focus-visible:outline-none"
            >
              继续编辑
            </button>
          </div>
        </div>
      )}

      {/* 当日训练信息头 */}
      <section className="rounded-2xl bg-[#0A1F18] border border-[#14382B] p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-[#7E9385]">
              <span className="font-bold text-[#CCFF00]">{currentPlanDay.dayName}</span>
              <span aria-hidden="true" className="text-[#365042]">·</span>
              <span>
                {currentPlanDay.isRestDay
                  ? '超量恢复与战术复盘'
                  : `单次计划时长 ${currentPlanDay.totalDurationMinutes} 分钟`}
              </span>
              <span aria-hidden="true" className="text-[#365042]">·</span>
              <span>场地: {profile.venue === 'court' ? '球场' : profile.venue === 'home' ? '居家' : '健身房'}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[#F5F7F5] tracking-tight">
              {currentPlanDay.theme}
            </h2>
          </div>

          {existingCheckin && (
            <div className="flex items-center gap-2 text-xs px-3.5 py-1.5 rounded-lg bg-[#0E2A20] border border-[#14382B] text-[#CCFF00] self-start sm:self-auto font-medium font-mono">
              <CheckCircle2 className="w-4 h-4" />
              <span>已记录打卡: {existingCheckin.actualDurationMinutes}分钟</span>
            </div>
          )}
        </div>

        {/* 注意事项 */}
        {currentPlanDay.precautions && currentPlanDay.precautions.length > 0 && (
          <div className="p-3.5 rounded-xl bg-[#06140F]/80 border border-[#14382B] text-xs text-[#B3C4B8] flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-[#CCFF00] shrink-0 mt-0.5" />
            <div className="space-y-0.5 leading-relaxed">
              <span className="font-bold text-[#F5F7F5]">动作要领与教练提示: </span>
              <span>{currentPlanDay.precautions.join('；')}</span>
            </div>
          </div>
        )}
      </section>

      {/* 主体两栏布局：左侧动作清单与计时器，右侧打卡表单 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* 左侧：任务清单与计时器 */}
        <div className="lg:col-span-7 space-y-6">
          {/* 计时器组件 */}
          <TimerWidget />

          {/* 任务交互清单与当前焦点训练 */}
          <div className="rounded-2xl bg-[#0A1F18] border border-[#14382B] p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#F5F7F5] tracking-tight">训练项目专注执行</h3>
                <p className="text-xs text-[#7E9385] mt-0.5">
                  跟随步骤逐项攻克，完成后点击勾选推进
                </p>
              </div>
              <div className="text-xs font-mono tabular-nums text-[#7E9385]">
                完成: <strong className="text-[#CCFF00]">{completedDrills.length}</strong> / {currentPlanDay.drills.length} 项
              </div>
            </div>

            {/* 实时真实进度条 */}
            {!currentPlanDay.isRestDay && currentPlanDay.drills.length > 0 && (
              <div className="space-y-1.5">
                <div className="w-full h-2 rounded-full bg-[#06140F] border border-[#14382B] overflow-hidden">
                  <div
                    style={{
                      width: `${Math.round((completedDrills.length / currentPlanDay.drills.length) * 100)}%`,
                    }}
                    className="h-full bg-[#CCFF00] rounded-full transition-all duration-300"
                  />
                </div>
              </div>
            )}

            {currentPlanDay.isRestDay ? (
              <div className="p-5 rounded-xl bg-[#06140F]/80 border border-[#14382B] text-sm text-[#B3C4B8] space-y-3">
                <div className="font-bold text-[#CCFF00]">今日休息日指导建议:</div>
                <p className="text-xs leading-relaxed">{currentPlanDay.restDayTips}</p>
                <div className="pt-2 border-t border-[#14382B] text-xs text-[#7E9385]">
                  可利用右侧表单记录今日身体疲劳感受或轻度拉伸记录。
                </div>
              </div>
            ) : (
              <>
                {/* 全部完成提示（不跳页，不弹窗中断） */}
                {currentPlanDay.drills.length > 0 &&
                  completedDrills.length === currentPlanDay.drills.length && (
                    <div className="p-4 rounded-xl bg-[#0E2A20] border border-[#CCFF00]/60 space-y-2 text-[#F5F7F5] animate-fade-in">
                      <div className="flex items-center gap-2 text-[#CCFF00] font-black text-sm sm:text-base">
                        <Trophy className="w-5 h-5 text-[#CCFF00] shrink-0" />
                        <span>本节训练动作已全部完成！</span>
                      </div>
                      <p className="text-xs text-[#B3C4B8] leading-relaxed">
                        您已顺利完成全套动作定型与负荷组数。请在右侧表单记录本次疲劳指数 (RPE)、主要感受与心得，并点击「结束训练并保存打卡」归档记录。
                      </p>
                    </div>
                  )}

                {/* 当前焦点项目（突出显示当前正在执行的动作，并提供直接推进入口） */}
                {(() => {
                  const focusDrill = currentPlanDay.drills.find(
                    (d) => !completedDrills.includes(d.id)
                  );
                  if (!focusDrill) return null;

                  return (
                    <div className="p-5 rounded-xl bg-[#0E2A20] border-2 border-[#CCFF00]/70 space-y-3 shadow-lg relative overflow-hidden animate-fade-in">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-[#CCFF00] text-black">
                            当前进行中
                          </span>
                          <span className="text-xs text-[#CCFF00] font-bold">
                            {focusDrill.phase === 'warmup'
                              ? '热身准备'
                              : focusDrill.phase === 'technical'
                              ? '核心技术'
                              : focusDrill.phase === 'footwork_or_fitness'
                              ? '步法体能'
                              : '整理拉伸'}
                          </span>
                        </div>
                        <span className="text-xs font-mono tabular-nums text-[#CCFF00] font-bold">
                          建议 {focusDrill.durationMinutes} 分钟
                        </span>
                      </div>

                      <div>
                        <h4 className="text-lg font-black text-[#F5F7F5] tracking-tight">
                          {focusDrill.name}
                        </h4>
                        <p className="text-xs text-[#B3C4B8] mt-1 leading-relaxed">
                          <strong className="text-[#CCFF00]">目标: </strong>
                          {focusDrill.objective}
                        </p>
                      </div>

                      <div className="grid grid-cols-3 gap-2 p-2.5 rounded-lg bg-[#06140F] text-xs font-mono text-center">
                        <div>
                          <span className="text-[10px] text-[#7E9385] block">组数</span>
                          <span className="font-bold text-[#F5F7F5]">{focusDrill.sets}组</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-[#7E9385] block">每组负荷</span>
                          <span className="font-bold text-[#CCFF00]">{focusDrill.repsOrDuration}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-[#7E9385] block">组间歇</span>
                          <span className="font-bold text-[#7E9385]">{focusDrill.restBetweenSets}</span>
                        </div>
                      </div>

                      {focusDrill.keyPoints && focusDrill.keyPoints.length > 0 && (
                        <div className="text-xs text-[#8E9F94] space-y-1">
                          <span className="font-semibold text-[#F5F7F5]">教练要领提示:</span>
                          <ul className="list-disc list-inside space-y-0.5 text-[11px] text-[#B3C4B8]">
                            {focusDrill.keyPoints.slice(0, 2).map((kp, kIdx) => (
                              <li key={kIdx}>{kp}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          toggleDrillComplete(focusDrill.id);
                          playSuccessChime();
                        }}
                        className="w-full py-3 min-h-[44px] rounded-xl bg-[#CCFF00] hover:bg-[#B8E600] text-black font-extrabold text-xs sm:text-sm tracking-wide transition-all shadow-[#CCFF00]/15 shadow-sm active:scale-[0.98] flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#CCFF00]"
                      >
                        <Check className="w-4 h-4 stroke-[3]" />
                        <span>完成此项并进入下一项训练</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })()}

                {/* 完整训练阶段清单 */}
                <div className="space-y-3 pt-2">
                  <div className="text-xs font-bold text-[#7E9385] tracking-wider uppercase">
                    全部阶段动作概览
                  </div>
                  {currentPlanDay.drills.map((drill, idx) => {
                    const isChecked = completedDrills.includes(drill.id);
                    const isExpanded = expandedDrills[drill.id] ?? false;

                    return (
                      <div
                        key={drill.id || idx}
                        className={`rounded-xl border transition-all ${
                          isChecked
                            ? 'bg-[#06140F]/40 border-[#CCFF00]/30'
                            : 'bg-[#06140F]/70 border-[#14382B]/80 hover:border-[#14382B]'
                        } p-4 space-y-3`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <button
                            type="button"
                            onClick={() => toggleDrillComplete(drill.id)}
                            className="flex items-start gap-3 text-left group flex-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#CCFF00] rounded-lg p-1 -m-1 min-h-[44px]"
                          >
                            <div className="mt-0.5 shrink-0 transition-transform active:scale-90">
                              {isChecked ? (
                                <CheckCircle2 className="w-5 h-5 text-[#CCFF00]" />
                              ) : (
                                <Circle className="w-5 h-5 text-[#365042] group-hover:text-[#7E9385] transition-colors" />
                              )}
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="text-[11px] font-bold text-[#CCFF00] tracking-wider uppercase">
                                  {drill.phase === 'warmup'
                                    ? '热身准备'
                                    : drill.phase === 'technical'
                                    ? '核心技术'
                                    : drill.phase === 'footwork_or_fitness'
                                    ? '步法体能'
                                    : '整理拉伸'}
                                </span>
                                <span className="text-[#365042] text-[10px]">·</span>
                                <span className="text-[11px] font-mono tabular-nums text-[#7E9385]">
                                  {drill.durationMinutes}m
                                </span>
                              </div>
                              <h4
                                className={`text-sm font-bold tracking-tight transition-colors ${
                                  isChecked ? 'text-[#4D6154] line-through' : 'text-[#F5F7F5]'
                                }`}
                              >
                                {drill.name}
                              </h4>
                            </div>
                          </button>

                          <button
                            type="button"
                            onClick={() => toggleDrillExpand(drill.id)}
                            className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-[#7E9385] hover:text-[#F5F7F5] rounded-lg hover:bg-[#0E2A20] transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#CCFF00]"
                            title="查看动作要领"
                            aria-label="展开动作要领"
                          >
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                        </div>

                        {/* 组数与时长指标 */}
                        <div className="flex items-center gap-4 text-xs font-mono tabular-nums text-[#7E9385] pl-8">
                          <div>
                            <span className="text-[#B3C4B8]">组数:</span> {drill.sets}组
                          </div>
                          <div>
                            <span className="text-[#B3C4B8]">负荷:</span> {drill.repsOrDuration}
                          </div>
                          <div>
                            <span className="text-[#B3C4B8]">组歇:</span> {drill.restBetweenSets}
                          </div>
                        </div>

                        {/* 展开的动作细节指导 */}
                        {isExpanded && (
                          <div className="pt-3 border-t border-[#14382B] text-xs text-[#B3C4B8] space-y-2 pl-8">
                            <div>
                              <span className="font-semibold text-[#CCFF00]">训练目的: </span>
                              <span>{drill.objective}</span>
                            </div>
                            <div>
                              <span className="font-semibold text-[#F5F7F5]">动作要领: </span>
                              <ul className="list-disc list-inside space-y-1 text-[#7E9385] mt-1">
                                {drill.keyPoints.map((point, pIdx) => (
                                  <li key={pIdx}>{point}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>

        {/* 右侧：打卡记录表单 (Refactoring UI: 字段层级分明，标签与输入紧密贴合) */}
        <div className="lg:col-span-5">
          <form
            onSubmit={handleCheckinSubmit}
            className="rounded-2xl bg-[#0A1F18] border border-[#14382B] p-6 space-y-6 sticky top-20 shadow-xl"
          >
            <div className="border-b border-[#14382B] pb-4">
              <div className="flex items-center gap-2 text-[#CCFF00] text-xs font-mono font-bold tracking-wider uppercase mb-1">
                <Save className="w-4 h-4 shrink-0" />
                <span>Training Session Logger</span>
              </div>
              <h3 className="text-lg font-bold text-[#F5F7F5] tracking-tight">记录本次训练感受与失误</h3>
              <p className="text-xs text-[#7E9385] mt-0.5">
                记录真实数据可帮助回顾体能负荷与技术短板
              </p>
            </div>

            {/* 实际训练时长 (Refactoring UI: 输入框贴紧说明) */}
            <div className="space-y-1.5">
              <label htmlFor="actualMinutesInput" className="block text-xs font-bold text-[#F5F7F5] tracking-wide">
                实际训练时长 (分钟)
              </label>
              <div className="flex items-center gap-3">
                <input
                  id="actualMinutesInput"
                  type="number"
                  min={5}
                  max={240}
                  step={5}
                  value={actualMinutes}
                  onChange={(e) => {
                    const val = e.target.value;
                    setActualMinutes(val === '' ? '' : Number(val));
                  }}
                  className="w-32 px-3.5 py-2.5 rounded-lg bg-[#06140F] border border-[#14382B] text-[#F5F7F5] font-mono tabular-nums text-sm focus:outline-none focus:border-[#CCFF00] focus:ring-1 focus:ring-[#CCFF00] transition-colors"
                  required
                />
                <span className="text-xs text-[#7E9385]">
                  计划为 {currentPlanDay.totalDurationMinutes} 分钟
                </span>
              </div>
            </div>

            {/* 训练感受 (Refactoring UI: 无 emoji 运动科技专业选择器) */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#F5F7F5] tracking-wide">
                本次训练感受
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'excellent', title: '状态极佳', sub: '击球精准 · 连贯迅速' },
                  { id: 'good', title: '表现平稳', sub: '步法受控 · 节奏正常' },
                  { id: 'moderate', title: '稍感吃力', sub: '心肺负荷 · 间歇略长' },
                  { id: 'fatigued', title: '状态疲惫', sub: '动作轻度变形 · 需减量' },
                ].map((item) => {
                  const isCurrent = feeling === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setFeeling(item.id as WorkoutFeeling)}
                      className={`p-3 min-h-[52px] rounded-lg text-xs font-semibold border text-left transition-all active:scale-95 focus-visible:outline-none flex flex-col justify-center ${
                        isCurrent
                          ? 'bg-[#0E2A20] text-[#CCFF00] border-[#CCFF00] shadow-sm font-bold'
                          : 'bg-[#06140F] border-[#14382B] text-[#7E9385] hover:text-[#F5F7F5] hover:border-[#1C4B3B]'
                      }`}
                    >
                      <span className={isCurrent ? 'text-[#CCFF00]' : 'text-[#F5F7F5]'}>{item.title}</span>
                      <span className={`text-[10px] mt-0.5 ${isCurrent ? 'text-[#B3C4B8]' : 'text-[#4D6154]'}`}>
                        {item.sub}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* RPE 疲劳度评分 (1-10) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <label className="font-bold text-[#F5F7F5]">
                  RPE 主观疲劳量表 (1-10)
                </label>
                <span className="font-mono tabular-nums text-[#CCFF00] font-bold">
                  {fatigueRpe} / 10
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={10}
                value={fatigueRpe}
                onChange={(e) => setFatigueRpe(Number(e.target.value))}
                className="w-full accent-[#CCFF00] h-2 bg-[#06140F] rounded-lg cursor-pointer"
              />
              <div className="text-[11px] text-[#7E9385] leading-tight bg-[#06140F] p-3 rounded-lg border border-[#14382B]">
                {RPE_DESCRIPTIONS[fatigueRpe] || `${fatigueRpe} 级疲劳`}
              </div>
            </div>

            {/* 主要失误反思 (标签库选择) */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#F5F7F5] tracking-wide">
                常见技术失误速记 (可选)
              </label>
              <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1">
                {COMMON_MISTAKES.map((mistake) => {
                  const isSelected = selectedMistakes.includes(mistake);
                  return (
                    <button
                      key={mistake}
                      type="button"
                      onClick={() => toggleMistakeTag(mistake)}
                      className={`px-2.5 py-1.5 min-h-[30px] rounded-lg text-[11px] transition-all active:scale-95 text-left focus-visible:outline-none ${
                        isSelected
                          ? 'bg-[#0E2A20] text-[#CCFF00] border border-[#CCFF00]/60 font-semibold'
                          : 'bg-[#06140F] text-[#7E9385] border border-[#14382B] hover:text-[#F5F7F5]'
                      }`}
                    >
                      {mistake}
                    </button>
                  );
                })}
              </div>

              <input
                type="text"
                placeholder="或输入其他自定义失误点..."
                value={customMistake}
                onChange={(e) => setCustomMistake(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg bg-[#06140F] border border-[#14382B] text-xs text-[#F5F7F5] placeholder-[#4D6154] focus:outline-none focus:border-[#CCFF00] focus:ring-1 focus:ring-[#CCFF00] transition-colors"
              />
            </div>

            {/* 训练心得体会 (可选) */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#F5F7F5] tracking-wide">
                训练心得与体会笔记 (可选)
              </label>
              <textarea
                rows={2}
                placeholder="例如：今天杀球落点控制有了明显进步，但在多拍对抗后半程启动步有点拖沓..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg bg-[#06140F] border border-[#14382B] text-xs text-[#F5F7F5] placeholder-[#4D6154] focus:outline-none focus:border-[#CCFF00] focus:ring-1 focus:ring-[#CCFF00] resize-none leading-relaxed transition-colors"
              />
            </div>

            {/* 下一次希望改善的内容 (可选) */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#F5F7F5] tracking-wide">
                下一次希望重点改善的内容 (可选)
              </label>
              <input
                type="text"
                placeholder="例如：提升反手后场高远球借力感、启动步分腿时机提前..."
                value={nextFocusOrImprovements}
                onChange={(e) => setNextFocusOrImprovements(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg bg-[#06140F] border border-[#14382B] text-xs text-[#F5F7F5] placeholder-[#4D6154] focus:outline-none focus:border-[#CCFF00] focus:ring-1 focus:ring-[#CCFF00] transition-colors"
              />
              <p className="text-[10px] text-[#7E9385]">非必填项，记录下一次训练前需要关注的细节</p>
            </div>

            {/* 保存打卡按钮 (Primary CTA) */}
            <button
              type="submit"
              className="w-full py-3.5 px-4 rounded-xl bg-[#CCFF00] hover:bg-[#B8E600] text-black font-extrabold text-sm tracking-wide transition-all shadow-[#CCFF00]/10 shadow-sm active:scale-[0.98] flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#CCFF00]"
            >
              <CheckCircle2 className="w-4 h-4 fill-black" />
              <span>{existingCheckin ? '更新今日打卡记录' : '结束训练并保存打卡'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
