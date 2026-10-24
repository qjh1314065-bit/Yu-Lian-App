import React, { useState } from 'react';
import { WeeklyPlan, CheckinRecord, DayPlan } from '../types';
import { NavView } from './Navbar';
import { 
  Calendar, 
  CheckCircle2, 
  Play, 
  ChevronDown, 
  ChevronUp, 
  AlertCircle, 
  Dumbbell, 
  Shield, 
  Footprints, 
  Flame,
  HeartHandshake
} from 'lucide-react';

interface WeeklyPlanViewProps {
  weeklyPlan: WeeklyPlan;
  checkins: CheckinRecord[];
  onNavigate: (view: NavView, targetDay?: number) => void;
}

export const WeeklyPlanView: React.FC<WeeklyPlanViewProps> = ({
  weeklyPlan,
  checkins,
  onNavigate,
}) => {
  const [filter, setFilter] = useState<'all' | 'training' | 'rest'>('all');
  const [expandedDay, setExpandedDay] = useState<number | null>(null);

  const toggleExpand = (dayOfWeek: number) => {
    setExpandedDay(expandedDay === dayOfWeek ? null : dayOfWeek);
  };

  const currentJsDay = new Date().getDay();
  const todayDayOfWeek = currentJsDay === 0 ? 7 : currentJsDay;

  const filteredDays = weeklyPlan.days.filter((day) => {
    if (filter === 'training') return !day.isRestDay;
    if (filter === 'rest') return day.isRestDay;
    return true;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 头部标题与筛选器 (Refactoring UI: 明确标题层级与轻量选项卡) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono font-bold tracking-wider uppercase text-[#CCFF00]">
            <Calendar className="w-4 h-4 shrink-0" />
            <span>Weekly Microcycle & Periodization</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F5F7F5] tracking-tight">
            一周训练执行计划表
          </h1>
          <p className="text-xs sm:text-sm text-[#7E9385] max-w-xl">
            根据可用天数与单次时长量身定制，涵盖热身准备、核心技术、专项步法与整理拉伸四大训练模块。
          </p>
        </div>

        {/* 筛选标签 (Refactoring UI: Segmented control 按钮组) */}
        <div className="flex items-center gap-1 p-1 bg-[#0A1F18] border border-[#14382B] rounded-xl self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-3.5 py-1.5 min-h-[36px] text-xs font-medium rounded-lg transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#CCFF00] whitespace-nowrap ${
              filter === 'all'
                ? 'bg-[#CCFF00] text-black font-extrabold shadow-sm'
                : 'text-[#7E9385] hover:text-[#F5F7F5]'
            }`}
          >
            全部 7 天
          </button>
          <button
            type="button"
            onClick={() => setFilter('training')}
            className={`px-3.5 py-1.5 min-h-[36px] text-xs font-medium rounded-lg transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#CCFF00] whitespace-nowrap ${
              filter === 'training'
                ? 'bg-[#CCFF00] text-black font-extrabold shadow-sm'
                : 'text-[#7E9385] hover:text-[#F5F7F5]'
            }`}
          >
            训练日 ({weeklyPlan.days.filter((d) => !d.isRestDay).length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('rest')}
            className={`px-3.5 py-1.5 min-h-[36px] text-xs font-medium rounded-lg transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#CCFF00] whitespace-nowrap ${
              filter === 'rest'
                ? 'bg-[#CCFF00] text-black font-extrabold shadow-sm'
                : 'text-[#7E9385] hover:text-[#F5F7F5]'
            }`}
          >
            休息日 ({weeklyPlan.days.filter((d) => d.isRestDay).length})
          </button>
        </div>
      </div>

      {/* 7天课表卡片列表 (Refactoring UI: 呼吸感留白与层级分明) */}
      <div className="space-y-4">
        {filteredDays.map((day) => {
          const isToday = day.dayOfWeek === todayDayOfWeek;
          const isDone = checkins.some((c) => c.dayOfWeek === day.dayOfWeek);
          const isExpanded = expandedDay === day.dayOfWeek || isToday;

          if (day.isRestDay) {
            return (
              <div
                key={day.dayOfWeek}
                className="rounded-2xl bg-[#0A1F18]/50 border border-[#14382B]/70 p-5 sm:p-6 transition-all space-y-3 hover:border-[#14382B]"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3.5">
                    <span className="w-11 h-11 rounded-xl bg-[#06140F] border border-[#14382B] flex items-center justify-center font-bold text-[#7E9385] text-sm shrink-0">
                      {day.dayName}
                    </span>
                    <div>
                      <div className="flex items-center gap-2 text-xs text-[#7E9385]">
                        <span>系统休息日</span>
                        <span aria-hidden="true" className="text-[#365042]">·</span>
                        <span>主动肌能与神经修复</span>
                        {isToday && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-[#CCFF00] text-black ml-1">
                            今日
                          </span>
                        )}
                      </div>
                      <h3 className="text-base sm:text-lg font-bold text-[#B3C4B8] mt-0.5">
                        {day.theme}
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto pt-2 sm:pt-0 border-t border-[#14382B]/50 sm:border-0">
                    <span className="text-xs text-[#7E9385]">0 分钟高强度负荷</span>
                    <button
                      type="button"
                      onClick={() => onNavigate('workout', day.dayOfWeek)}
                      className="px-4 py-2 min-h-[40px] text-xs font-bold text-[#F5F7F5] hover:text-white bg-[#0E2A20] hover:bg-[#14382B] border border-[#14382B] rounded-xl transition-all active:scale-[0.98] whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#CCFF00]"
                    >
                      查看恢复建议
                    </button>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#14382B]/50 text-xs text-[#7E9385] leading-relaxed">
                  <strong className="text-[#B3C4B8]">恢复建议: </strong>
                  {day.restDayTips}
                </div>
              </div>
            );
          }

          return (
            <div
              key={day.dayOfWeek}
              className={`rounded-2xl border transition-all ${
                isToday
                  ? 'bg-[#0A1F18] border-[#CCFF00]/80 shadow-md shadow-[#CCFF00]/5 ring-1 ring-[#CCFF00]/30'
                  : 'bg-[#0A1F18] border-[#14382B] hover:border-[#1C4B3B]'
              } p-5 sm:p-6 space-y-4`}
            >
              {/* 卡片头部 */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start sm:items-center gap-3.5">
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center font-extrabold text-base shrink-0 ${
                      isToday
                        ? 'bg-[#CCFF00] text-black font-black'
                        : 'bg-[#06140F] border border-[#14382B] text-[#F5F7F5]'
                    }`}
                  >
                    {day.dayName}
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-[#7E9385]">
                      <span>单次预定: {day.totalDurationMinutes} 分钟</span>
                      <span aria-hidden="true" className="text-[#365042]">·</span>
                      <span>难度: {'★'.repeat(day.difficultyRating)}{'☆'.repeat(3 - day.difficultyRating)}</span>
                      <span aria-hidden="true" className="text-[#365042]">·</span>
                      <span>
                        {day.focusGoal === 'attack'
                          ? '进攻专训'
                          : day.focusGoal === 'defense'
                          ? '防守专训'
                          : day.focusGoal === 'footwork'
                          ? '步法专项'
                          : day.focusGoal === 'fitness'
                          ? '体能专项'
                          : day.focusGoal === 'fundamentals'
                          ? '基础手法'
                          : '综合提升'}
                      </span>
                      {isToday && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-[#CCFF00] text-black">
                          今日课表
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg sm:text-xl font-bold text-[#F5F7F5] tracking-tight">
                      {day.theme}
                    </h3>
                  </div>
                </div>

                {/* 移动端全宽操作条，桌面端右侧紧凑对齐 */}
                <div className="flex items-center justify-between sm:justify-end gap-2.5 w-full sm:w-auto pt-2.5 sm:pt-0 border-t border-[#14382B]/60 sm:border-0">
                  {isDone && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0E2A20] border border-[#14382B] text-[#CCFF00] text-xs font-bold">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>已打卡</span>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => onNavigate('workout', day.dayOfWeek)}
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 min-h-[44px] rounded-xl bg-[#CCFF00] hover:bg-[#B8E600] text-black font-extrabold text-xs tracking-wide transition-all shadow-[#CCFF00]/10 shadow-sm active:scale-[0.98] whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#CCFF00]"
                  >
                    <Play className="w-3.5 h-3.5 fill-black" />
                    <span>{isDone ? '查看/重新执行' : '进入训练'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleExpand(day.dayOfWeek)}
                    className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-[#7E9385] hover:text-[#F5F7F5] rounded-xl hover:bg-[#0E2A20] transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#CCFF00]"
                    aria-label={isExpanded ? '收起详情' : '展开详情'}
                  >
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* 展开的动作阶段列表 (Refactoring UI: 干净的数据展示) */}
              {isExpanded && (
                <div className="space-y-4 pt-3 border-t border-[#14382B]">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    {day.drills.map((drill, idx) => (
                      <div
                        key={drill.id || idx}
                        className="rounded-xl bg-[#06140F]/70 border border-[#14382B]/70 p-4 space-y-2.5 flex flex-col justify-between"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-bold text-[#CCFF00]">
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
                          <div className="text-sm font-bold text-[#F5F7F5]">{drill.name}</div>
                          <div className="text-xs text-[#7E9385] line-clamp-2 leading-relaxed">
                            {drill.objective}
                          </div>
                        </div>

                        <div className="pt-2 border-t border-[#14382B]/60 text-[11px] text-[#7E9385] space-y-0.5 font-mono tabular-nums">
                          <div>
                            <span className="text-[#B3C4B8]">组数:</span> {drill.sets}组 · {drill.repsOrDuration}
                          </div>
                          <div>
                            <span className="text-[#B3C4B8]">组歇:</span> {drill.restBetweenSets}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* 当日注意事项 */}
                  {day.precautions && day.precautions.length > 0 && (
                    <div className="p-3.5 rounded-xl bg-[#06140F]/60 border border-[#14382B] text-xs text-[#B3C4B8] flex items-start gap-2.5">
                      <AlertCircle className="w-4 h-4 text-[#CCFF00] shrink-0 mt-0.5" />
                      <div className="space-y-0.5 leading-relaxed">
                        <strong className="text-[#F5F7F5] font-semibold">执行要领与安全提示: </strong>
                        <span>{day.precautions.join('；')}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
