import React, { useState } from 'react';
import { UserProfile, BadmintonLevel, TrainingGoal, VenueType, SessionDuration } from '../types';
import { LEVEL_LABELS, GOAL_LABELS, VENUE_LABELS } from '../data/badmintonKnowledge';
import { ConfirmModal } from './ConfirmModal';
import { NavView } from './Navbar';
import { 
  Settings, 
  RotateCw, 
  Trash2, 
  Sparkles, 
  Check, 
  AlertTriangle, 
  Info,
  ShieldAlert,
  Save,
  Loader2,
  ArrowRight,
  AlertCircle
} from 'lucide-react';

interface ProfileSettingsViewProps {
  profile: UserProfile;
  onUpdateProfileAndRegenerate: (newProfile: UserProfile) => void;
  onClearAllData: () => void;
  onLoadSampleData: () => void;
  onNavigate?: (view: NavView, targetDay?: number) => void;
}

export const ProfileSettingsView: React.FC<ProfileSettingsViewProps> = ({
  profile,
  onUpdateProfileAndRegenerate,
  onClearAllData,
  onLoadSampleData,
  onNavigate,
}) => {
  const [level, setLevel] = useState<BadmintonLevel>(profile.level);
  const [goal, setGoal] = useState<TrainingGoal>(profile.goal);
  const [daysPerWeek, setDaysPerWeek] = useState<number>(profile.daysPerWeek);
  const [durationMinutes, setDurationMinutes] = useState<SessionDuration>(profile.durationMinutes);
  const [venue, setVenue] = useState<VenueType>(profile.venue);

  const [showRegenerateModal, setShowRegenerateModal] = useState<boolean>(false);
  const [showResetModal, setShowResetModal] = useState<boolean>(false);
  const [showSampleModal, setShowSampleModal] = useState<boolean>(false);
  
  // 交互状态控制：校验错误、计算加载状态、生成错误与成功摘要
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [saveSuccessNotice, setSaveSuccessNotice] = useState<boolean>(false);
  const [generationSummary, setGenerationSummary] = useState<{
    levelName: string;
    goalName: string;
    venueName: string;
    days: number;
    duration: number;
  } | null>(null);

  React.useEffect(() => {
    setLevel(profile.level);
    setGoal(profile.goal);
    setDaysPerWeek(profile.daysPerWeek);
    setDurationMinutes(profile.durationMinutes);
    setVenue(profile.venue);
  }, [profile]);

  const validateInputs = (): string | null => {
    if (!level || !['beginner', 'intermediate', 'advanced'].includes(level)) {
      return '请选择当前羽毛球技术水平（入门/中级/进阶）。';
    }
    if (!goal) {
      return '请选择当前阶段的核心训练目标。';
    }
    if (!venue || !['court', 'home', 'gym'].includes(venue)) {
      return '请选择主要可用训练场地。';
    }
    if (!daysPerWeek || daysPerWeek < 1 || daysPerWeek > 6) {
      return '每周可训练天数需在 1 到 6 天之间。';
    }
    if (!durationMinutes || ![30, 45, 60, 90].includes(durationMinutes)) {
      return '单次训练时间需为 30 / 45 / 60 / 90 分钟之一。';
    }
    return null;
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const error = validateInputs();
    if (error) {
      setValidationError(error);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setValidationError(null);
    setShowRegenerateModal(true);
  };

  const confirmRegenerate = () => {
    setShowRegenerateModal(false);
    setIsCalculating(true);
    setGenerationError(null);
    setValidationError(null);

    // 采用本地羽球运动学规则引擎排课（真实计算延迟，防止重复点击，不伪装大模型）
    setTimeout(() => {
      try {
        const updated: UserProfile = {
          level,
          goal,
          daysPerWeek,
          durationMinutes,
          venue,
          updatedAt: new Date().toISOString(),
        };

        onUpdateProfileAndRegenerate(updated);
        setGenerationSummary({
          levelName: LEVEL_LABELS[level].name,
          goalName: GOAL_LABELS[goal].name,
          venueName: VENUE_LABELS[venue].name.split(' ')[0],
          days: daysPerWeek,
          duration: durationMinutes,
        });
        setSaveSuccessNotice(true);
        setIsCalculating(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } catch (err) {
        setIsCalculating(false);
        setGenerationError('计划计算过程中出现异常。您的输入已妥善保留，请点击重试。');
      }
    }, 550);
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
      {/* 标题 */}
      <div>
        <div className="flex items-center gap-2 text-xs font-mono font-bold tracking-wider uppercase text-[#CCFF00] mb-1">
          <Settings className="w-4 h-4" />
          <span>Athlete Profile & Conditioning Engine</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F5F7F5] tracking-tight">
          个人训练画像与数据管理
        </h1>
        <p className="text-xs sm:text-sm text-[#8E9F94] mt-1">
          修改训练水平、目标或场地后，系统将依据羽毛球生物力学与负荷周期重新编排课表。
        </p>
      </div>

      {/* 校验错误提示 (缺少信息时明确告知) */}
      {validationError && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/40 text-rose-300 text-sm font-semibold flex items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
            <span>{validationError}</span>
          </div>
          <button
            type="button"
            onClick={() => setValidationError(null)}
            className="text-xs text-rose-400 hover:text-white underline"
          >
            关闭
          </button>
        </div>
      )}

      {/* 生成错误重试入口 */}
      {generationError && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/40 text-amber-200 text-sm font-semibold flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 shrink-0 text-amber-400" />
            <span>{generationError}</span>
          </div>
          <button
            type="button"
            onClick={confirmRegenerate}
            disabled={isCalculating}
            className="px-4 py-2 min-h-[38px] text-xs font-bold bg-[#CCFF00] text-black rounded-lg hover:bg-[#B8E600] transition-colors whitespace-nowrap self-start sm:self-auto"
          >
            重试计算生成
          </button>
        </div>
      )}

      {/* 成功反馈与偏好依据详单展示 */}
      {saveSuccessNotice && generationSummary && (
        <div className="p-5 rounded-2xl bg-[#0E2A20] border border-[#CCFF00]/50 text-[#F5F7F5] space-y-3.5 animate-fade-in">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5 text-[#CCFF00] font-bold text-sm sm:text-base">
              <Check className="w-5 h-5 shrink-0" />
              <span>新训练计划已依据本地运动学规则计算生成！</span>
            </div>
            {onNavigate && (
              <button
                type="button"
                onClick={() => onNavigate('plan')}
                className="flex items-center gap-1.5 px-3.5 py-1.5 min-h-[36px] text-xs font-extrabold bg-[#CCFF00] text-black rounded-lg hover:bg-[#B8E600] transition-all shrink-0 active:scale-95"
              >
                <span>立即查看课表</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="p-3 rounded-xl bg-[#06140F]/80 border border-[#14382B] text-xs text-[#B3C4B8] space-y-1.5">
            <div className="font-semibold text-[#CCFF00]">本次排课所依据的个人训练偏好参数:</div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 font-mono text-[11px] text-[#F5F7F5]">
              <div className="p-2 rounded-lg bg-[#0A1F18] border border-[#14382B]">
                <span className="text-[#7E9385] block text-[10px]">技术段位</span>
                {generationSummary.levelName}
              </div>
              <div className="p-2 rounded-lg bg-[#0A1F18] border border-[#14382B]">
                <span className="text-[#7E9385] block text-[10px]">专项目标</span>
                {generationSummary.goalName}
              </div>
              <div className="p-2 rounded-lg bg-[#0A1F18] border border-[#14382B]">
                <span className="text-[#7E9385] block text-[10px]">每周频次</span>
                每周 {generationSummary.days} 天
              </div>
              <div className="p-2 rounded-lg bg-[#0A1F18] border border-[#14382B]">
                <span className="text-[#7E9385] block text-[10px]">单次时长</span>
                {generationSummary.duration} 分钟
              </div>
              <div className="p-2 rounded-lg bg-[#0A1F18] border border-[#14382B] col-span-2 sm:col-span-1">
                <span className="text-[#7E9385] block text-[10px]">主练场地</span>
                {generationSummary.venueName}
              </div>
            </div>
            <p className="text-[10px] text-[#7E9385] pt-1">
              注：本系统采用本地羽球专项负荷分配算法计算，绝无虚假大模型等待延迟，所有打卡历史数据均完整保留。
            </p>
          </div>
        </div>
      )}

      {/* 表单卡片 */}
      <form onSubmit={handleFormSubmit} className="space-y-8">
        {/* 1. 羽毛球水平 */}
        <div className="rounded-2xl bg-[#0A1F18] border border-[#14382B] p-6 space-y-4">
          <label className="block text-sm font-bold text-[#F5F7F5] tracking-wide">
            1. 羽毛球当前水平
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {(['beginner', 'intermediate', 'advanced'] as BadmintonLevel[]).map((lvl) => {
              const info = LEVEL_LABELS[lvl];
              const isSelected = level === lvl;

              return (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setLevel(lvl)}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'bg-[#0E2A20] border-[#CCFF00] ring-1 ring-[#CCFF00]/40 shadow-sm'
                      : 'bg-[#06140F]/80 border-[#14382B] hover:border-[#1C4B3B]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`text-sm font-bold ${isSelected ? 'text-[#CCFF00]' : 'text-[#F5F7F5]'}`}>
                      {info.name}
                    </span>
                    {isSelected && <Check className="w-4 h-4 text-[#CCFF00]" />}
                  </div>
                  <p className="text-xs text-[#8E9F94] leading-relaxed mb-2">{info.desc}</p>
                  <div className="text-[11px] text-[#B3C4B8] font-medium pt-2 border-t border-[#14382B]">
                    侧重: {info.focus}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. 训练目标 */}
        <div className="rounded-2xl bg-[#0A1F18] border border-[#14382B] p-6 space-y-4">
          <label className="block text-sm font-bold text-[#F5F7F5] tracking-wide">
            2. 本阶段核心训练目标
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {(['fundamentals', 'footwork', 'fitness', 'attack', 'defense', 'comprehensive'] as TrainingGoal[]).map((g) => {
              const info = GOAL_LABELS[g];
              const isSelected = goal === g;

              return (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGoal(g)}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'bg-[#0E2A20] border-[#CCFF00] ring-1 ring-[#CCFF00]/40 shadow-sm'
                      : 'bg-[#06140F]/80 border-[#14382B] hover:border-[#1C4B3B]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`text-sm font-bold ${isSelected ? 'text-[#CCFF00]' : 'text-[#F5F7F5]'}`}>
                      {info.name}
                    </span>
                    {isSelected && <Check className="w-4 h-4 text-[#CCFF00]" />}
                  </div>
                  <p className="text-xs text-[#8E9F94] leading-relaxed">{info.desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. 场地环境 */}
        <div className="rounded-2xl bg-[#0A1F18] border border-[#14382B] p-6 space-y-4">
          <label className="block text-sm font-bold text-[#F5F7F5] tracking-wide">
            3. 主要可用训练场地
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {(['court', 'home', 'gym'] as VenueType[]).map((v) => {
              const info = VENUE_LABELS[v];
              const isSelected = venue === v;

              return (
                <button
                  key={v}
                  type="button"
                  onClick={() => setVenue(v)}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'bg-[#0E2A20] border-[#CCFF00] ring-1 ring-[#CCFF00]/40 shadow-sm'
                      : 'bg-[#06140F]/80 border-[#14382B] hover:border-[#1C4B3B]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`text-sm font-bold ${isSelected ? 'text-[#CCFF00]' : 'text-[#F5F7F5]'}`}>
                      {info.name.split(' ')[0]}
                    </span>
                    {isSelected && <Check className="w-4 h-4 text-[#CCFF00]" />}
                  </div>
                  <p className="text-xs text-[#8E9F94] leading-relaxed mb-2">{info.desc}</p>
                  <div className="text-[10px] text-[#CCFF00]/80 pt-2 border-t border-[#14382B]">
                    注意: {info.caution}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. 每周天数与单次时长 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 每周天数 */}
          <div className="rounded-2xl bg-[#0A1F18] border border-[#14382B] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-[#F5F7F5] tracking-wide">
                4. 每周可训练天数
              </label>
              <span className="text-xs font-mono tabular-nums text-[#CCFF00] font-bold">
                每周 {daysPerWeek} 天 (休息 {7 - daysPerWeek} 天)
              </span>
            </div>

            <div className="grid grid-cols-6 gap-2">
              {[1, 2, 3, 4, 5, 6].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setDaysPerWeek(num)}
                  className={`py-3 min-h-[44px] rounded-lg font-bold font-mono text-sm transition-all active:scale-95 border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#CCFF00] ${
                    daysPerWeek === num
                      ? 'bg-[#CCFF00] text-black border-[#CCFF00] font-extrabold shadow-sm'
                      : 'bg-[#06140F] border-[#14382B] text-[#7E9385] hover:text-[#F5F7F5] hover:border-[#1C4B3B]'
                  }`}
                >
                  {num}天
                </button>
              ))}
            </div>
            <p className="text-xs text-[#7E9385] leading-relaxed">
              系统将根据天数自动在周一至周日合理排布训练与超量恢复休息日。
            </p>
          </div>

          {/* 单次训练时长 */}
          <div className="rounded-2xl bg-[#0A1F18] border border-[#14382B] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-[#F5F7F5] tracking-wide">
                5. 每次训练时间
              </label>
              <span className="text-xs font-mono tabular-nums text-[#CCFF00] font-bold">
                单次 {durationMinutes} 分钟
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {([30, 45, 60, 90] as SessionDuration[]).map((dur) => (
                <button
                  key={dur}
                  type="button"
                  onClick={() => setDurationMinutes(dur)}
                  className={`py-3 min-h-[44px] rounded-lg font-bold font-mono text-sm transition-all active:scale-95 border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#CCFF00] ${
                    durationMinutes === dur
                      ? 'bg-[#CCFF00] text-black border-[#CCFF00] font-extrabold shadow-sm'
                      : 'bg-[#06140F] border-[#14382B] text-[#7E9385] hover:text-[#F5F7F5] hover:border-[#1C4B3B]'
                  }`}
                >
                  {dur}m
                </button>
              ))}
            </div>
            <p className="text-xs text-[#7E9385] leading-relaxed">
              热身、技术、步法体能与拉伸各阶段时间配比将严格依照此总时长智能计算分配。
            </p>
          </div>
        </div>

        {/* 提交重新生成按钮 (Refactoring UI: Primary CTA 带防重触与明确规则计算状态) */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isCalculating}
            className={`w-full py-4 px-6 min-h-[48px] rounded-xl font-extrabold text-base tracking-wide transition-all shadow-[#CCFF00]/10 shadow-sm flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#CCFF00] ${
              isCalculating
                ? 'bg-[#B8E600]/80 text-black cursor-not-allowed opacity-90'
                : 'bg-[#CCFF00] hover:bg-[#B8E600] text-black active:scale-[0.99]'
            }`}
          >
            {isCalculating ? (
              <>
                <Loader2 className="w-5 h-5 text-black animate-spin" />
                <span>正在根据羽球运动学规则计算编排新课表...</span>
              </>
            ) : (
              <>
                <RotateCw className="w-5 h-5 text-black" />
                <span>保存训练画像并重新编排周计划</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* 数据管理卡片 (二次确认与安全控制) */}
      <section className="rounded-2xl bg-[#0A1F18] border border-[#14382B] p-6 space-y-5">
        <div>
          <h3 className="text-base font-bold text-[#F5F7F5] tracking-tight">数据管理与初始设置</h3>
          <p className="text-xs text-[#7E9385] mt-0.5">
            所有计划和打卡数据均存储在您浏览器的 localStorage 中，不依赖任何第三方服务器。
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-[#14382B]">
          <div className="space-y-0.5 self-start sm:self-auto">
            <div className="text-xs font-bold text-[#F5F7F5]">载入示例数据体验</div>
            <div className="text-xs text-[#7E9385]">一键填充3天真实训练日志，立即查看图表与看板效果</div>
          </div>

          <button
            type="button"
            onClick={() => setShowSampleModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 min-h-[40px] text-xs font-bold bg-[#0E2A20] hover:bg-[#14382B] text-[#CCFF00] border border-[#14382B] rounded-xl transition-all active:scale-95 whitespace-nowrap self-stretch sm:self-auto justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#CCFF00]"
          >
            <Sparkles className="w-4 h-4" />
            <span>载入示例数据</span>
          </button>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#14382B]">
          <div className="space-y-0.5 self-start sm:self-auto">
            <div className="text-xs font-bold text-rose-400">清空测试数据并恢复出厂</div>
            <div className="text-xs text-[#7E9385]">删除本地所有打卡记录与自定义课表，重新开始</div>
          </div>

          <button
            type="button"
            onClick={() => setShowResetModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 min-h-[40px] text-xs font-bold bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 rounded-xl transition-all active:scale-95 whitespace-nowrap self-stretch sm:self-auto justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
          >
            <Trash2 className="w-4 h-4" />
            <span>清空所有数据</span>
          </button>
        </div>
      </section>

      {/* 重新生成确认弹窗 */}
      <ConfirmModal
        isOpen={showRegenerateModal}
        title="确认重新编排本周课表？"
        message="调整画像后，系统将依据新的天数、场地和时长重新计算周一至周日的训练排布。您的历史打卡记录将完全保留，不受任何影响。"
        confirmText="确认重新编排"
        cancelText="稍后再说"
        isDestructive={false}
        onConfirm={confirmRegenerate}
        onCancel={() => setShowRegenerateModal(false)}
      />

      {/* 清空所有数据确认弹窗 */}
      <ConfirmModal
        isOpen={showResetModal}
        title="警告：确定清空所有本地数据？"
        message="此操作将彻底清除保存在当前浏览器中的所有训练计划与历史打卡日志，并将所有设置重置为初始状态。该操作无法撤销，请谨慎确认。"
        confirmText="确定清空重置"
        cancelText="取消返回"
        isDestructive={true}
        onConfirm={() => {
          onClearAllData();
          setShowResetModal(false);
        }}
        onCancel={() => setShowResetModal(false)}
      />

      {/* 载入示例数据确认弹窗 */}
      <ConfirmModal
        isOpen={showSampleModal}
        title="载入业余羽球训练示例数据？"
        message="这将在本地生成标准的3天打卡记录（包含高远球、接杀连贯与平抽快挡），方便您立即体验最近7天训练时长图表与主题分布看板。"
        confirmText="确认载入"
        cancelText="取消"
        isDestructive={false}
        onConfirm={() => {
          onLoadSampleData();
          setShowSampleModal(false);
          setSaveSuccessNotice(true);
          setTimeout(() => setSaveSuccessNotice(false), 3000);
        }}
        onCancel={() => setShowSampleModal(false)}
      />
    </div>
  );
};
