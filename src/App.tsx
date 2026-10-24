import React, { useState, useEffect } from 'react';
import { UserProfile, WeeklyPlan, CheckinRecord } from './types';
import { 
  loadProfile, 
  saveProfile, 
  loadWeeklyPlan, 
  saveWeeklyPlan, 
  loadCheckins, 
  addCheckin, 
  deleteCheckin, 
  clearAllData,
  loadSampleData,
  getLocalDateString,
  DEFAULT_PROFILE
} from './utils/storage';
import { generateWeeklyPlan } from './utils/planGenerator';
import { Navbar, NavView } from './components/Navbar';
import { HomeView } from './components/HomeView';
import { WeeklyPlanView } from './components/WeeklyPlanView';
import { WorkoutDetailView } from './components/WorkoutDetailView';
import { StatsHistoryView } from './components/StatsHistoryView';
import { ProfileSettingsView } from './components/ProfileSettingsView';

export default function App() {
  const [profile, setProfile] = useState<UserProfile>(() => loadProfile());
  const [weeklyPlan, setWeeklyPlan] = useState<WeeklyPlan>(() => loadWeeklyPlan(profile));
  const [checkins, setCheckins] = useState<CheckinRecord[]>(() => loadCheckins());
  const [currentView, setCurrentView] = useState<NavView>('home');

  // 当前选中的星期几 (1=周一, ..., 7=周日)
  const currentJsDay = new Date().getDay();
  const initialToday = currentJsDay === 0 ? 7 : currentJsDay;
  const [selectedDayOfWeek, setSelectedDayOfWeek] = useState<number>(initialToday);

  // 导航切换处理
  const handleNavigate = (view: NavView, targetDay?: number) => {
    if (targetDay !== undefined) {
      setSelectedDayOfWeek(targetDay);
    } else if (view === 'workout') {
      setSelectedDayOfWeek(initialToday);
    }
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 保存打卡记录
  const handleSaveCheckin = (record: CheckinRecord) => {
    const updated = addCheckin(record);
    setCheckins(updated);
  };

  // 删除单条打卡记录
  const handleDeleteCheckin = (id: string) => {
    const updated = deleteCheckin(id);
    setCheckins(updated);
  };

  // 更新画像并重新生成周课表
  const handleUpdateProfileAndRegenerate = (newProfile: UserProfile) => {
    saveProfile(newProfile);
    setProfile(newProfile);

    const newPlan = generateWeeklyPlan(newProfile);
    saveWeeklyPlan(newPlan);
    setWeeklyPlan(newPlan);
  };

  // 清空所有数据
  const handleClearAllData = () => {
    clearAllData();
    setProfile(DEFAULT_PROFILE);
    const freshPlan = generateWeeklyPlan(DEFAULT_PROFILE);
    saveWeeklyPlan(freshPlan);
    setWeeklyPlan(freshPlan);
    setCheckins([]);
    setCurrentView('home');
  };

  // 载入示例数据
  const handleLoadSampleData = () => {
    const { plan, checkins: sampleCheckins } = loadSampleData(profile);
    setWeeklyPlan(plan);
    setCheckins(sampleCheckins);
  };

  // 检查今天是否是训练日以及今天是否打卡
  const todayPlan = weeklyPlan.days.find((d) => d.dayOfWeek === initialToday);
  const todayIsTraining = todayPlan ? !todayPlan.isRestDay : true;
  const todayDateStr = getLocalDateString();
  const todayCompleted = checkins.some((c) => c.date === todayDateStr || c.dayOfWeek === initialToday);

  return (
    <div className="min-h-screen bg-[#06140F] text-[#F5F7F5] flex flex-col font-sans selection:bg-[#CCFF00] selection:text-black bg-court-pattern">
      {/* 顶部与移动端导航 */}
      <Navbar
        currentView={currentView}
        onNavigate={(view) => handleNavigate(view)}
        todayIsTraining={todayIsTraining}
        todayCompleted={todayCompleted}
      />

      {/* 主体视口容器 (1440px baseline，留白与卡片层次统一) */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-28 md:pb-12">
        {currentView === 'home' && (
          <HomeView
            profile={profile}
            weeklyPlan={weeklyPlan}
            checkins={checkins}
            onNavigate={handleNavigate}
          />
        )}

        {currentView === 'plan' && (
          <WeeklyPlanView
            weeklyPlan={weeklyPlan}
            checkins={checkins}
            onNavigate={handleNavigate}
          />
        )}

        {currentView === 'workout' && (
          <WorkoutDetailView
            profile={profile}
            weeklyPlan={weeklyPlan}
            checkins={checkins}
            selectedDayOfWeek={selectedDayOfWeek}
            onSelectDay={(day) => setSelectedDayOfWeek(day)}
            onSaveCheckin={handleSaveCheckin}
            onNavigate={handleNavigate}
          />
        )}

        {currentView === 'stats' && (
          <StatsHistoryView
            profile={profile}
            weeklyPlan={weeklyPlan}
            checkins={checkins}
            onDeleteCheckin={handleDeleteCheckin}
            onLoadSampleData={handleLoadSampleData}
          />
        )}

        {currentView === 'profile' && (
          <ProfileSettingsView
            profile={profile}
            onUpdateProfileAndRegenerate={handleUpdateProfileAndRegenerate}
            onClearAllData={handleClearAllData}
            onLoadSampleData={handleLoadSampleData}
            onNavigate={handleNavigate}
          />
        )}
      </main>

      {/* 专业级极简运动科技底部声明 */}
      <footer className="border-t border-[#14382B] bg-[#06140F]/80 backdrop-blur-md py-6 text-xs text-[#8E9F94]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold tracking-wide text-[#F5F7F5]">羽练 BADMINTON COACH</span>
            <span className="text-[#3A5647]">/</span>
            <span>科学训练与技术工坊</span>
          </div>
          <div className="text-[#8E9F94] flex items-center gap-2">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#CCFF00]"></span>
            <span>本地结构化存储 · 遵循运动周期渐进负荷原理</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
