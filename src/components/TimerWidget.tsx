import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Bell } from 'lucide-react';
import { playTimerBeep, playSuccessChime } from '../utils/sound';

export const TimerWidget: React.FC = () => {
  const [mode, setMode] = useState<'stopwatch' | 'countdown' | 'interval'>('countdown');
  const [secondsLeft, setSecondsLeft] = useState(180);
  const [isRunning, setIsRunning] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // 间歇计时设置
  const [intervalWorkSec, setIntervalWorkSec] = useState(30);
  const [intervalRestSec, setIntervalRestSec] = useState(15);
  const [currentIntervalPhase, setCurrentIntervalPhase] = useState<'work' | 'rest'>('work');
  const [currentRound, setCurrentRound] = useState(1);
  const [totalRounds] = useState(5);

  const timerRef = useRef<number | null>(null);

  const switchMode = (newMode: 'stopwatch' | 'countdown' | 'interval') => {
    setIsRunning(false);
    setMode(newMode);
    if (newMode === 'stopwatch') {
      setSecondsLeft(0);
    } else if (newMode === 'countdown') {
      setSecondsLeft(180);
    } else {
      setSecondsLeft(intervalWorkSec);
      setCurrentIntervalPhase('work');
      setCurrentRound(1);
    }
  };

  useEffect(() => {
    if (!isRunning) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (mode === 'stopwatch') {
          return prev + 1;
        }

        if (mode === 'countdown') {
          if (prev <= 1) {
            setIsRunning(false);
            if (soundEnabled) playSuccessChime();
            return 0;
          }
          if (prev <= 4 && soundEnabled) {
            playTimerBeep(false);
          }
          return prev - 1;
        }

        // interval mode
        if (prev <= 1) {
          if (currentIntervalPhase === 'work') {
            setCurrentIntervalPhase('rest');
            if (soundEnabled) playTimerBeep(true);
            return intervalRestSec;
          } else {
            if (currentRound >= totalRounds) {
              setIsRunning(false);
              if (soundEnabled) playSuccessChime();
              return 0;
            }
            setCurrentRound((r) => r + 1);
            setCurrentIntervalPhase('work');
            if (soundEnabled) playTimerBeep(true);
            return intervalWorkSec;
          }
        }
        if (prev <= 3 && soundEnabled) {
          playTimerBeep(false);
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, mode, currentIntervalPhase, currentRound, totalRounds, intervalRestSec, intervalWorkSec, soundEnabled]);

  const toggleRun = () => setIsRunning(!isRunning);

  const resetTimer = () => {
    setIsRunning(false);
    if (mode === 'stopwatch') {
      setSecondsLeft(0);
    } else if (mode === 'countdown') {
      setSecondsLeft(180);
    } else {
      setSecondsLeft(intervalWorkSec);
      setCurrentIntervalPhase('work');
      setCurrentRound(1);
    }
  };

  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="rounded-2xl bg-[#0A1F18] border border-[#14382B] p-5 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-[#CCFF00]" />
          <h4 className="text-sm font-bold text-[#F5F7F5] tracking-wide">训练辅助计时器</h4>
        </div>

        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="p-1.5 rounded-lg text-[#8E9F94] hover:text-[#F5F7F5] hover:bg-[#0E2A20] transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
          title={soundEnabled ? '音效开启' : '音效静音'}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4 text-[#CCFF00]" /> : <VolumeX className="w-4 h-4" />}
        </button>
      </div>

      {/* Mode Tabs (Refactoring UI: Segmented button controls) */}
      <div className="flex items-center gap-1 p-1 bg-[#06140F] rounded-xl mb-4 text-xs font-medium border border-[#14382B]">
        <button
          type="button"
          onClick={() => switchMode('countdown')}
          className={`flex-1 py-2 min-h-[36px] rounded-lg transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#CCFF00] ${
            mode === 'countdown' ? 'bg-[#0E2A20] text-[#CCFF00] font-bold shadow-sm' : 'text-[#7E9385] hover:text-[#F5F7F5]'
          }`}
        >
          倒计时
        </button>
        <button
          type="button"
          onClick={() => switchMode('interval')}
          className={`flex-1 py-2 min-h-[36px] rounded-lg transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#CCFF00] ${
            mode === 'interval' ? 'bg-[#0E2A20] text-[#CCFF00] font-bold shadow-sm' : 'text-[#7E9385] hover:text-[#F5F7F5]'
          }`}
        >
          步法间歇
        </button>
        <button
          type="button"
          onClick={() => switchMode('stopwatch')}
          className={`flex-1 py-2 min-h-[36px] rounded-lg transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#CCFF00] ${
            mode === 'stopwatch' ? 'bg-[#0E2A20] text-[#CCFF00] font-bold shadow-sm' : 'text-[#7E9385] hover:text-[#F5F7F5]'
          }`}
        >
          正计秒表
        </button>
      </div>

      {/* Quick presets for countdown */}
      {mode === 'countdown' && !isRunning && (
        <div className="flex items-center justify-center gap-2 mb-3">
          {[30, 60, 120, 180, 300].map((sec) => (
            <button
              type="button"
              key={sec}
              onClick={() => {
                setIsRunning(false);
                setSecondsLeft(sec);
              }}
              className={`px-2.5 py-1 min-h-[32px] text-xs rounded-md font-mono transition-all active:scale-95 ${
                secondsLeft === sec
                  ? 'bg-[#0E2A20] text-[#CCFF00] border border-[#CCFF00]/50 font-bold'
                  : 'bg-[#06140F] text-[#7E9385] hover:text-[#F5F7F5] border border-[#14382B]'
              }`}
            >
              {sec < 60 ? `${sec}s` : `${sec / 60}m`}
            </button>
          ))}
        </div>
      )}

      {/* Interval info banner (Clean athletic indicators, zero emoji) */}
      {mode === 'interval' && (
        <div className="flex items-center justify-between text-xs px-3.5 py-2 bg-[#06140F] rounded-lg mb-3 border border-[#14382B]">
          <span className="text-[#7E9385] font-mono">
            循环组数: <strong className="text-[#F5F7F5]">{currentRound} / {totalRounds}</strong>
          </span>
          <span className={`font-bold flex items-center gap-1.5 ${currentIntervalPhase === 'work' ? 'text-[#CCFF00]' : 'text-[#B3C4B8]'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${currentIntervalPhase === 'work' ? 'bg-[#CCFF00]' : 'bg-[#7E9385]'}`} />
            <span>{currentIntervalPhase === 'work' ? '高频对抗期' : '心率回落期'}</span>
          </span>
        </div>
      )}

      {/* Clock Display (Tabular athletic figures) */}
      <div className="text-center py-2">
        <div className="font-mono tabular-nums text-4xl sm:text-5xl font-black text-[#F5F7F5] tracking-wider select-none">
          {formatTime(secondsLeft)}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-3 mt-4">
        <button
          type="button"
          onClick={resetTimer}
          className="p-3 min-h-[44px] min-w-[44px] rounded-xl bg-[#06140F] border border-[#14382B] text-[#7E9385] hover:text-[#F5F7F5] hover:bg-[#0E2A20] transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#CCFF00]"
          title="重置计时器"
          aria-label="重置"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={toggleRun}
          className={`flex items-center gap-2 px-6 py-3 min-h-[44px] rounded-xl font-bold text-sm tracking-wide transition-all shadow-sm active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#CCFF00] ${
            isRunning
              ? 'bg-[#0E2A20] border border-[#CCFF00]/60 text-[#CCFF00]'
              : 'bg-[#CCFF00] hover:bg-[#B8E600] text-black shadow-[#CCFF00]/10'
          }`}
        >
          {isRunning ? (
            <>
              <Pause className="w-4 h-4 fill-current" />
              <span>暂停</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              <span>开始</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
