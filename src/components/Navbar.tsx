import React from 'react';
import { LayoutDashboard, CalendarDays, Activity, BarChart3, Settings, Play, CheckCircle2 } from 'lucide-react';

export type NavView = 'home' | 'plan' | 'workout' | 'stats' | 'profile';

interface NavbarProps {
  currentView: NavView;
  onNavigate: (view: NavView) => void;
  todayIsTraining: boolean;
  todayCompleted: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  todayIsTraining,
  todayCompleted,
}) => {
  const navItems = [
    { id: 'home' as NavView, label: '训练概览', icon: LayoutDashboard },
    { id: 'plan' as NavView, label: '周计划表', icon: CalendarDays },
    { id: 'workout' as NavView, label: '课表执行', icon: Activity },
    { id: 'stats' as NavView, label: '负荷看板', icon: BarChart3 },
    { id: 'profile' as NavView, label: '球员画像', icon: Settings },
  ];

  return (
    <>
      {/* 顶部主导航 (严格遵循 Refactoring UI Top Bar Contract: 品牌区 - 导航区 - 重点操作) */}
      <header className="sticky top-0 z-40 bg-[#06140F]/95 backdrop-blur-md border-b border-[#14382B]/60 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6 sm:gap-8">
          {/* Zone 1: Single element brand wordmark with baseline alignment */}
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2.5 text-left group whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#CCFF00] rounded-lg py-1 px-1.5 -ml-1.5 transition-all"
            aria-label="返回首页"
          >
            {/* 羽球球头与三羽几何徽标 */}
            <div className="w-8 h-8 rounded-lg bg-[#0A221A] border border-[#14382B] flex items-center justify-center text-[#CCFF00] group-hover:border-[#CCFF00]/60 group-hover:scale-105 active:scale-95 transition-all">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v7" />
                <path d="M7 6l5 3 5-3" />
                <path d="M5 11l7 3 7-3" />
                <circle cx="12" cy="18" r="3" fill="#CCFF00" stroke="none" />
              </svg>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base sm:text-lg font-extrabold tracking-tight text-[#F5F7F5] group-hover:text-[#CCFF00] transition-colors">
                羽练
              </span>
              <span className="font-mono text-[10px] font-bold text-[#7E9385] tracking-widest uppercase">
                COACH
              </span>
            </div>
          </button>

          {/* Zone 2: Navigation Links (Refactoring UI: clean typography, no pills, subtle hover) */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-sm font-medium">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`relative py-5 flex items-center gap-2 transition-all whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#CCFF00] rounded-sm ${
                    isActive
                      ? 'text-[#F5F7F5] font-semibold'
                      : 'text-[#7E9385] hover:text-[#F5F7F5]'
                  }`}
                >
                  <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-[#CCFF00]' : 'text-[#4D6154]'}`} />
                  <span>{item.label}</span>
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#CCFF00] rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: 1 Primary Action (Refactoring UI: strict single primary action) */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onNavigate('workout')}
              className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 min-h-[40px] rounded-lg text-xs sm:text-sm font-bold tracking-tight transition-all active:scale-[0.98] whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#CCFF00] shadow-sm ${
                todayCompleted
                  ? 'bg-[#0A221A] text-[#CCFF00] border border-[#14382B] hover:bg-[#0F2F24] hover:border-[#CCFF00]/40'
                  : todayIsTraining
                  ? 'bg-[#CCFF00] hover:bg-[#B8E600] text-black shadow-[#CCFF00]/10 hover:shadow-[#CCFF00]/20'
                  : 'bg-[#0E2A20] hover:bg-[#14382B] text-[#F5F7F5] border border-[#14382B]'
              }`}
            >
              {todayCompleted ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#CCFF00]" />
                  <span>今日已打卡</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{todayIsTraining ? '开始今日训练' : '自主加练打卡'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Ergonomic Bottom Tab Bar (触控区严格 ≥ 44x44px，高度克制，自然拇指热区) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#06140F]/95 backdrop-blur-md border-t border-[#14382B]/60 px-2 pt-1 pb-safe">
        <div className="grid grid-cols-5 items-center h-14">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex flex-col items-center justify-center min-h-[48px] w-full py-1 transition-all active:scale-95 focus-visible:outline-none ${
                  isActive ? 'text-[#CCFF00]' : 'text-[#7E9385] hover:text-[#F5F7F5]'
                }`}
                aria-label={item.label}
              >
                <Icon className={`w-5 h-5 mb-0.5 transition-transform ${isActive ? 'scale-110' : ''}`} />
                <span className={`text-[10px] tracking-tight whitespace-nowrap ${isActive ? 'font-bold' : 'font-normal'}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
