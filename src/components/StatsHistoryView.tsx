import React, { useState, useMemo } from 'react';
import { UserProfile, WeeklyPlan, CheckinRecord, TrainingGoal } from '../types';
import { GOAL_LABELS } from '../data/badmintonKnowledge';
import { ConfirmModal } from './ConfirmModal';
import { getLocalDateString } from '../utils/storage';
import { 
  BarChart3, 
  Award, 
  Clock, 
  Calendar, 
  TrendingUp, 
  Trash2, 
  Eye, 
  Flame, 
  X, 
  CheckCircle2, 
  Footprints,
  Sparkles,
  Zap,
  Info,
  CalendarDays
} from 'lucide-react';

interface StatsHistoryViewProps {
  profile: UserProfile;
  weeklyPlan: WeeklyPlan;
  checkins: CheckinRecord[];
  onDeleteCheckin: (id: string) => void;
  onLoadSampleData: () => void;
}

export const StatsHistoryView: React.FC<StatsHistoryViewProps> = ({
  profile,
  weeklyPlan,
  checkins,
  onDeleteCheckin,
  onLoadSampleData,
}) => {
  const [selectedRecordForDetail, setSelectedRecordForDetail] = useState<CheckinRecord | null>(null);
  const [recordToDelete, setRecordToDelete] = useState<string | null>(null);
  const [filterGoal, setFilterGoal] = useState<string>('all');

  const totalSessions = checkins.length;
  const totalMinutes = checkins.reduce((sum, c) => sum + c.actualDurationMinutes, 0);
  const totalHours = (totalMinutes / 60).toFixed(1);

  const plannedWeeklyDays = weeklyPlan.days.filter((d) => !d.isRestDay).length;
  const completedWeeklyDays = weeklyPlan.days.filter((d) => {
    if (d.isRestDay) return false;
    return checkins.some((c) => c.dayOfWeek === d.dayOfWeek);
  }).length;

  const weeklyCompletionRate = plannedWeeklyDays > 0
    ? Math.min(100, Math.round((completedWeeklyDays / plannedWeeklyDays) * 100))
    : 0;

  const avgRpe = totalSessions > 0
    ? (checkins.reduce((sum, c) => sum + c.fatigueRpe, 0) / totalSessions).toFixed(1)
    : '0';

  const todayDateStr = getLocalDateString();

  const last7DaysChartData = useMemo(() => {
    const days: { dateStr: string; label: string; minutes: number; dayName: string; isToday: boolean; checkin?: CheckinRecord }[] = [];
    const now = new Date();
    const dayNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 86400000);
      const dateStr = getLocalDateString(d);
      const monthDay = `${d.getMonth() + 1}/${d.getDate()}`;
      const dayName = dayNames[d.getDay()];

      const matchingCheckin = checkins.find((c) => c.date === dateStr);
      const minutes = matchingCheckin ? matchingCheckin.actualDurationMinutes : 0;

      days.push({
        dateStr,
        label: monthDay,
        minutes,
        dayName,
        isToday: dateStr === todayDateStr,
        checkin: matchingCheckin,
      });
    }

    return days;
  }, [checkins, todayDateStr]);

  const hasAnyPast7DaysWorkout = last7DaysChartData.some((d) => d.minutes > 0);
  const maxChartMinutes = Math.max(90, ...last7DaysChartData.map((d) => d.minutes));

  const themeDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    checkins.forEach((c) => {
      let matchedTheme = '综合提升';
      if (c.theme.includes('杀') || c.theme.includes('攻')) matchedTheme = '进攻专训';
      else if (c.theme.includes('防') || c.theme.includes('接杀') || c.theme.includes('抽挡')) matchedTheme = '防守专训';
      else if (c.theme.includes('步') || c.theme.includes('移动') || c.theme.includes('启动')) matchedTheme = '步法专项';
      else if (c.theme.includes('体能') || c.theme.includes('爆发') || c.theme.includes('核心')) matchedTheme = '体能专项';
      else if (c.theme.includes('高远') || c.theme.includes('握拍') || c.theme.includes('网前')) matchedTheme = '基础技术';

      counts[matchedTheme] = (counts[matchedTheme] || 0) + 1;
    });

    const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    return entries;
  }, [checkins]);

  const filteredRecords = checkins.filter((c) => {
    if (filterGoal === 'all') return true;
    return c.theme.includes(filterGoal);
  });

  return (
    <div className="space-y-8 animate-fade-in">
      {/* 标题 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold tracking-wider uppercase text-[#CCFF00] mb-1">
            <BarChart3 className="w-4 h-4" />
            <span>Badminton Performance Telemetry</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F5F7F5] tracking-tight">
            训练数据与历史看板
          </h1>
          <p className="text-xs sm:text-sm text-[#8E9F94] mt-1">
            所有图表与指标均由真实打卡日志动态汇算，呈现严谨的运动负荷曲线。
          </p>
        </div>

        {totalSessions === 0 && (
          <button
            onClick={onLoadSampleData}
            className="flex items-center gap-2 px-4 py-2.5 min-h-[44px] text-xs font-bold bg-[#0A1F18] hover:bg-[#0E2A20] text-[#CCFF00] border border-[#1C4B3B] rounded-xl transition-all self-start sm:self-auto"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>载入示例体验数据</span>
          </button>
        )}
      </div>

      {/* 顶部4大关键指标 (Refactoring UI: 基线对齐数字与单位，等宽数字) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="rounded-xl bg-[#0A1F18] border border-[#14382B] p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-[#7E9385]">
            <span>累计训练次数</span>
            <Award className="w-4 h-4 text-[#CCFF00]" />
          </div>
          <div className="flex items-baseline gap-1.5 font-mono tabular-nums text-3xl font-extrabold text-[#F5F7F5]">
            <span>{totalSessions}</span>
            <span className="text-xs font-normal text-[#7E9385]">次</span>
          </div>
          <div className="text-[11px] text-[#7E9385]">
            {totalSessions === 0 ? '完成初次训练即可累计' : '已归档的正式练习'}
          </div>
        </div>

        <div className="rounded-xl bg-[#0A1F18] border border-[#14382B] p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-[#7E9385]">
            <span>累计挥拍总时长</span>
            <Clock className="w-4 h-4 text-[#CCFF00]" />
          </div>
          <div className="flex items-baseline gap-1.5 font-mono tabular-nums text-3xl font-extrabold text-[#F5F7F5]">
            <span>{totalHours}</span>
            <span className="text-xs font-normal text-[#7E9385]">小时</span>
          </div>
          <div className="text-[11px] text-[#7E9385] font-mono tabular-nums">
            共计 {totalMinutes} 分钟专注沉淀
          </div>
        </div>

        <div className="rounded-xl bg-[#0A1F18] border border-[#14382B] p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-[#7E9385]">
            <span>本周计划执行率</span>
            <Footprints className="w-4 h-4 text-[#CCFF00]" />
          </div>
          <div className="flex items-baseline gap-1 font-mono tabular-nums text-3xl font-extrabold text-[#F5F7F5]">
            <span>{weeklyCompletionRate}</span>
            <span className="text-xs font-normal text-[#7E9385]">%</span>
          </div>
          <div className="text-[11px] text-[#7E9385]">
            计划 {plannedWeeklyDays} 天，已完成 {completedWeeklyDays} 天
          </div>
        </div>

        <div className="rounded-xl bg-[#0A1F18] border border-[#14382B] p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-[#7E9385]">
            <span>平均疲劳指数 (RPE)</span>
            <Zap className="w-4 h-4 text-[#CCFF00]" />
          </div>
          <div className="flex items-baseline gap-1 font-mono tabular-nums text-3xl font-extrabold text-[#F5F7F5]">
            <span>{avgRpe}</span>
            <span className="text-xs font-normal text-[#7E9385]">/ 10</span>
          </div>
          <div className="text-[11px] text-[#7E9385]">
            {Number(avgRpe) > 7 ? '高强度对抗期' : Number(avgRpe) > 4 ? '良性体能负荷' : '低强度/恢复期'}
          </div>
        </div>
      </div>

      {/* 2 列图表与统计分析 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* 左侧：最近7天训练时长柱状图 */}
        <div className="lg:col-span-7 rounded-2xl bg-[#0A1F18] border border-[#14382B] p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[#F5F7F5] tracking-tight">最近 7 天训练时长趋势</h3>
              <p className="text-xs text-[#7E9385] mt-0.5">每日挥拍专注时间 (分钟)</p>
            </div>
            <div className="text-xs font-mono tabular-nums text-[#CCFF00] font-bold">
              近7天合计 {last7DaysChartData.reduce((s, d) => s + d.minutes, 0)} 分钟
            </div>
          </div>

          {/* 带参考网格线的柱状图区域 */}
          <div className="pt-4 pb-2 relative">
            {/* 水平参考线 (90m, 60m, 30m) */}
            <div className="absolute inset-0 top-4 bottom-14 flex flex-col justify-between pointer-events-none z-0">
              <div className="border-b border-[#14382B] w-full flex justify-end">
                <span className="text-[9px] font-mono text-[#4D6154] pr-1 -mt-2.5">90m</span>
              </div>
              <div className="border-b border-[#14382B]/60 w-full flex justify-end">
                <span className="text-[9px] font-mono text-[#4D6154] pr-1 -mt-2.5">60m</span>
              </div>
              <div className="border-b border-[#14382B]/40 w-full flex justify-end">
                <span className="text-[9px] font-mono text-[#4D6154] pr-1 -mt-2.5">30m</span>
              </div>
            </div>

            {/* 柱状主体 */}
            <div className="h-48 flex items-end justify-between gap-2 sm:gap-4 px-2 border-b border-[#14382B] relative z-10">
              {last7DaysChartData.map((d) => {
                const heightPercent = maxChartMinutes > 0 ? (d.minutes / maxChartMinutes) * 100 : 0;
                const hasWorkout = d.minutes > 0;

                return (
                  <div key={d.dateStr} className="flex-1 flex flex-col items-center gap-2 group relative">
                    {/* Tooltip on hover */}
                    <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-[#06140F] text-[#F5F7F5] text-[10px] px-2.5 py-1 rounded-lg border border-[#14382B] whitespace-nowrap pointer-events-none z-20 shadow-xl font-mono">
                      {d.dateStr}: {d.minutes}m {d.checkin?.theme ? `(${d.checkin.theme.slice(0, 8)}...)` : ''}
                    </div>

                    {/* Bar container */}
                    <div className="w-full flex justify-center items-end h-36">
                      <div
                        style={{ height: `${Math.max(hasWorkout ? 8 : 3, heightPercent)}%` }}
                        className={`w-full max-w-[36px] rounded-t-sm transition-all ${
                          hasWorkout
                            ? 'bg-[#CCFF00] group-hover:bg-[#B8E600] shadow-sm shadow-[#CCFF00]/10'
                            : 'bg-[#0E2A20]'
                        }`}
                      />
                    </div>

                    {/* Minutes label on top of bar */}
                    {hasWorkout ? (
                      <span className="text-[10px] font-mono tabular-nums text-[#CCFF00] font-bold -mb-1">
                        {d.minutes}m
                      </span>
                    ) : (
                      <span className="text-[10px] text-[#4D6154] font-mono -mb-1">-</span>
                    )}

                    {/* Date label */}
                    <div className="text-center pt-1">
                      <div className={`text-[11px] font-bold ${d.isToday ? 'text-[#CCFF00]' : 'text-[#7E9385]'}`}>
                        {d.dayName}
                      </div>
                      <div className="text-[9px] text-[#4D6154] font-mono">{d.label}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 空图表引导 (Refactoring UI: 解释为什么无数据，并给明确引导) */}
          {!hasAnyPast7DaysWorkout && (
            <div className="p-3.5 rounded-xl bg-[#06140F]/80 border border-[#14382B] text-xs text-[#7E9385] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <span>过去 7 天尚无打卡数据，完成训练打卡后将在此绘制每日负荷柱状图。</span>
              <button
                type="button"
                onClick={onLoadSampleData}
                className="text-[#CCFF00] hover:underline font-bold whitespace-nowrap self-start sm:self-auto focus-visible:outline-none"
              >
                载入体验数据 →
              </button>
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-[#7E9385] pt-1">
            <span>基准负荷: 每日推荐训练 30-90 分钟</span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#CCFF00] inline-block" />
              <span>实际打卡</span>
              <span className="w-2.5 h-2.5 rounded-sm bg-[#0E2A20] inline-block ml-2" />
              <span>无训练</span>
            </span>
          </div>
        </div>

        {/* 右侧：最常训练的主题分布 */}
        <div className="lg:col-span-5 rounded-2xl bg-[#0A1F18] border border-[#14382B] p-6 space-y-4">
          <div>
            <h3 className="text-base font-bold text-[#F5F7F5] tracking-tight">最常训练主题分布</h3>
            <p className="text-xs text-[#7E9385] mt-0.5">按打卡专项归类统计</p>
          </div>

          {themeDistribution.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#7E9385] space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#06140F] flex items-center justify-center text-[#4D6154] mx-auto border border-[#14382B]">
                <BarChart3 className="w-5 h-5" />
              </div>
              <p>暂无分类数据，完成打卡后自动生成专项占比图</p>
              <button
                type="button"
                onClick={onLoadSampleData}
                className="text-[#CCFF00] hover:underline font-semibold focus-visible:outline-none"
              >
                点此载入示例训练记录体验
              </button>
            </div>
          ) : (
            <div className="space-y-3.5 pt-2">
              {themeDistribution.map(([themeName, count]) => {
                const percent = Math.round((count / totalSessions) * 100);
                return (
                  <div key={themeName} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-[#B3C4B8]">{themeName}</span>
                      <span className="font-mono tabular-nums text-[#7E9385]">
                        {count} 次 ({percent}%)
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-[#06140F] overflow-hidden">
                      <div
                        style={{ width: `${percent}%` }}
                        className="h-full bg-[#CCFF00] rounded-full transition-all duration-300"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 历史训练记录表 */}
      <section className="rounded-2xl bg-[#0A1F18] border border-[#14382B] p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-[#F5F7F5] tracking-tight">历史打卡记录日志</h3>
            <p className="text-xs text-[#7E9385] mt-0.5">
              记录包含训练时长、主观疲劳指数及技术反思
            </p>
          </div>

          {/* 筛选按钮 (Refactoring UI: Segmented controls) */}
          <div className="flex items-center gap-1.5 text-xs overflow-x-auto pb-1 scrollbar-none">
            <span className="text-[#7E9385] shrink-0 text-xs">过滤:</span>
            {['all', '进攻', '防守', '步法', '高远'].map((t) => (
              <button
                type="button"
                key={t}
                onClick={() => setFilterGoal(t)}
                className={`px-3 py-1.5 min-h-[34px] rounded-lg transition-all active:scale-95 whitespace-nowrap focus-visible:outline-none ${
                  filterGoal === t
                    ? 'bg-[#CCFF00] text-black font-extrabold shadow-sm'
                    : 'bg-[#06140F] text-[#7E9385] hover:text-[#F5F7F5] border border-[#14382B]'
                }`}
              >
                {t === 'all' ? '全部记录' : t}
              </button>
            ))}
          </div>
        </div>

        {filteredRecords.length === 0 ? (
          <div className="py-14 text-center space-y-3.5 border border-dashed border-[#14382B] rounded-2xl p-6">
            <div className="w-12 h-12 rounded-2xl bg-[#06140F] flex items-center justify-center text-[#4D6154] mx-auto border border-[#14382B]">
              <CalendarDays className="w-6 h-6" />
            </div>
            <div className="text-sm font-bold text-[#F5F7F5]">暂无符合条件的训练记录</div>
            <p className="text-xs text-[#7E9385] max-w-sm mx-auto leading-relaxed">
              所有完成的训练课都将保存在本地。前往「课表执行」保存今天或自主练习的第一笔日志。
            </p>
            {totalSessions === 0 && (
              <button
                type="button"
                onClick={onLoadSampleData}
                className="px-5 py-2.5 min-h-[44px] text-xs font-bold bg-[#CCFF00] hover:bg-[#B8E600] text-black rounded-xl transition-all shadow-[#CCFF00]/10 shadow-sm inline-flex items-center gap-2 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#CCFF00]"
              >
                <Sparkles className="w-4 h-4 fill-black" />
                <span>一键载入 3 条真实示例记录</span>
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredRecords.map((record) => (
              <div
                key={record.id}
                className="rounded-xl bg-[#06140F]/70 border border-[#14382B]/80 p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-[#14382B] transition-all"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-[#7E9385]">
                    <span className="font-mono tabular-nums text-[#F5F7F5]">{record.date}</span>
                    <span aria-hidden="true" className="text-[#365042]">·</span>
                    <span className="font-bold text-[#CCFF00]">{record.dayName}</span>
                    <span aria-hidden="true" className="text-[#365042]">·</span>
                    <span className="font-mono tabular-nums">时长 {record.actualDurationMinutes} 分钟</span>
                    <span aria-hidden="true" className="text-[#365042]">·</span>
                    <span>RPE {record.fatigueRpe}/10</span>
                    <span aria-hidden="true" className="text-[#365042]">·</span>
                    <span>
                      {record.feeling === 'excellent'
                        ? '状态极佳'
                        : record.feeling === 'good'
                        ? '表现平稳'
                        : record.feeling === 'moderate'
                        ? '稍感吃力'
                        : '状态疲惫'}
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-[#F5F7F5] tracking-tight">
                    {record.theme}
                  </h4>

                  {record.mistakesOrReflections && (
                    <div className="text-xs text-[#B3C4B8] line-clamp-1">
                      <strong className="text-[#CCFF00]/80 font-medium">反思: </strong>
                      {record.mistakesOrReflections}
                    </div>
                  )}

                  {record.nextFocusOrImprovements && (
                    <div className="text-xs text-[#B3C4B8] line-clamp-1">
                      <strong className="text-[#CCFF00]/80 font-medium">下次改善: </strong>
                      {record.nextFocusOrImprovements}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end md:self-auto w-full md:w-auto justify-end pt-2 md:pt-0 border-t border-[#14382B] md:border-0">
                  <button
                    type="button"
                    onClick={() => setSelectedRecordForDetail(record)}
                    className="flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 min-h-[40px] text-xs font-semibold text-[#F5F7F5] bg-[#0E2A20] hover:bg-[#14382B] rounded-lg border border-[#14382B] transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#CCFF00]"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>查看详情</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRecordToDelete(record.id)}
                    className="p-2 min-h-[40px] min-w-[40px] flex items-center justify-center text-[#7E9385] hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-colors focus-visible:outline-none"
                    title="删除此记录"
                    aria-label="删除此记录"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 记录详情弹窗 */}
      {selectedRecordForDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#06140F]/85 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-[#0A1F18] border border-[#14382B] p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs text-[#CCFF00] font-mono">
                  {selectedRecordForDetail.date} · {selectedRecordForDetail.dayName}
                </span>
                <h3 className="text-lg font-bold text-[#F5F7F5] mt-0.5">
                  {selectedRecordForDetail.theme}
                </h3>
              </div>
              <button
                onClick={() => setSelectedRecordForDetail(null)}
                className="p-1.5 text-[#8E9F94] hover:text-[#F5F7F5] rounded-lg hover:bg-[#0E2A20] min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-[#06140F] text-xs">
              <div>
                <span className="text-[#8E9F94]">实际训练时长:</span>{' '}
                <strong className="text-[#F5F7F5] font-mono">{selectedRecordForDetail.actualDurationMinutes} 分钟</strong>
              </div>
              <div>
                <span className="text-[#8E9F94]">主观疲劳指数:</span>{' '}
                <strong className="text-[#CCFF00] font-mono">RPE {selectedRecordForDetail.fatigueRpe} / 10</strong>
              </div>
              <div>
                <span className="text-[#8E9F94]">训练状态感受:</span>{' '}
                <strong className="text-[#F5F7F5]">
                  {selectedRecordForDetail.feeling === 'excellent'
                    ? '状态极佳'
                    : selectedRecordForDetail.feeling === 'good'
                    ? '表现平稳'
                    : selectedRecordForDetail.feeling === 'moderate'
                    ? '稍感吃力'
                    : '状态疲惫'}
                </strong>
              </div>
              <div>
                <span className="text-[#8E9F94]">训练场地:</span>{' '}
                <strong className="text-[#F5F7F5]">
                  {selectedRecordForDetail.venue === 'court'
                    ? '球场'
                    : selectedRecordForDetail.venue === 'home'
                    ? '居家空间'
                    : '健身房'}
                </strong>
              </div>
            </div>

            {selectedRecordForDetail.mistakesOrReflections && (
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold text-[#CCFF00]">技术失误与复盘重点</h4>
                <div className="p-3.5 rounded-xl bg-[#06140F] border border-[#14382B] text-xs text-[#B3C4B8] leading-relaxed">
                  {selectedRecordForDetail.mistakesOrReflections}
                </div>
              </div>
            )}

            {selectedRecordForDetail.nextFocusOrImprovements && (
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold text-[#CCFF00]">下一次希望重点改善的内容</h4>
                <div className="p-3.5 rounded-xl bg-[#06140F] border border-[#14382B] text-xs text-[#B3C4B8] leading-relaxed">
                  {selectedRecordForDetail.nextFocusOrImprovements}
                </div>
              </div>
            )}

            {selectedRecordForDetail.notes && (
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold text-[#F5F7F5]">训练心得笔记</h4>
                <div className="p-3.5 rounded-xl bg-[#06140F] border border-[#14382B] text-xs text-[#B3C4B8] leading-relaxed">
                  {selectedRecordForDetail.notes}
                </div>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedRecordForDetail(null)}
                className="px-6 py-2.5 min-h-[44px] text-xs font-bold bg-[#0E2A20] hover:bg-[#14382B] border border-[#1C4B3B] text-[#F5F7F5] rounded-xl transition-colors"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 删除确认弹窗 */}
      <ConfirmModal
        isOpen={Boolean(recordToDelete)}
        title="确认删除该条训练记录？"
        message="删除后该记录将从本地数据库中移除，且不可恢复。相关的累计时长与统计图表将自动重新计算。"
        confirmText="确认删除"
        cancelText="取消"
        isDestructive={true}
        onConfirm={() => {
          if (recordToDelete) {
            onDeleteCheckin(recordToDelete);
            setRecordToDelete(null);
          }
        }}
        onCancel={() => setRecordToDelete(null)}
      />
    </div>
  );
};
