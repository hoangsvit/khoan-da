import React, { useState } from 'react';
import { AlertOctagon, CreditCard, Dices, Flame, PhoneCall, ShieldAlert, Smartphone } from 'lucide-react';
import { ConsumerMode } from '../types';
import { getRandomSamplePrompt, SAMPLE_PROMPTS, SamplePrompt } from '../data/samplePrompts';

interface DemoPresetButtonsProps {
  onSelectPreset: (mode: ConsumerMode, text: string) => void;
}

export const DemoPresetButtons: React.FC<DemoPresetButtonsProps> = ({ onSelectPreset }) => {
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');
  const categories = ['Tất cả', 'Đe dọa đòi nợ', 'SMS Giả mạo', 'Cuộc gọi đe dọa', 'Link Độc hại', 'An toàn chính thức', 'Việc làm online'];

  const filteredPrompts = selectedCategory === 'Tất cả'
    ? SAMPLE_PROMPTS.slice(0, 12)
    : SAMPLE_PROMPTS.filter(prompt => prompt.category === selectedCategory);

  const getExpectationLabel = (risk: SamplePrompt['riskExpectation']) => {
    switch (risk) {
      case 'STOP': return 'Kỳ vọng: dừng lại';
      case 'CAUTION': return 'Kỳ vọng: thận trọng';
      case 'VERIFY': return 'Kỳ vọng: xác minh';
      case 'NO_CLEAR_RISK': return 'Kỳ vọng: chưa thấy rõ';
    }
  };

  const getExpectationClass = (risk: SamplePrompt['riskExpectation']) => {
    switch (risk) {
      case 'STOP': return 'border-red-200 bg-red-50 text-red-700';
      case 'CAUTION': return 'border-amber-200 bg-amber-50 text-amber-800';
      case 'VERIFY': return 'border-yellow-200 bg-yellow-50 text-yellow-800';
      case 'NO_CLEAR_RISK': return 'border-emerald-200 bg-emerald-50 text-emerald-700';
    }
  };

  const getIcon = (mode: ConsumerMode) => {
    switch (mode) {
      case 'link': return <Smartphone className="h-3.5 w-3.5" />;
      case 'call': return <PhoneCall className="h-3.5 w-3.5" />;
      case 'threat': return <Flame className="h-3.5 w-3.5" />;
      case 'account': return <CreditCard className="h-3.5 w-3.5" />;
      case 'recovery': return <ShieldAlert className="h-3.5 w-3.5" />;
      default: return <AlertOctagon className="h-3.5 w-3.5" />;
    }
  };

  const handleRandomPick = () => {
    const random = getRandomSamplePrompt();
    onSelectPreset(random.mode, random.text);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <p className="text-xs font-bold text-slate-800">Chọn một tình huống để chạy thử Gemini</p>
          <p className="mt-0.5 text-[11px] text-slate-500">
            Các nhãn “kỳ vọng” chỉ phục vụ kiểm thử, không được truyền cho Gemini như đáp án.
          </p>
        </div>
        <button
          type="button"
          onClick={handleRandomPick}
          className="flex items-center justify-center gap-1.5 rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-slate-800"
        >
          <Dices className="h-4 w-4" />
          Chọn ngẫu nhiên
        </button>
      </div>

      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {categories.map(category => (
          <button
            key={category}
            type="button"
            onClick={() => setSelectedCategory(category)}
            className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-[11px] font-semibold transition ${
              selectedCategory === category
                ? 'bg-slate-950 text-white'
                : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-100'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filteredPrompts.map(prompt => (
          <button
            key={prompt.id}
            type="button"
            onClick={() => onSelectPreset(prompt.mode, prompt.text)}
            className="group rounded-2xl border border-slate-200 bg-white p-4 text-left transition hover:border-slate-300 hover:shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                  {getIcon(prompt.mode)}
                </div>
                <span className="truncate text-xs font-bold text-slate-900">{prompt.label}</span>
              </div>
              <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[9px] font-bold ${getExpectationClass(prompt.riskExpectation)}`}>
                {getExpectationLabel(prompt.riskExpectation)}
              </span>
            </div>
            <p className="mt-3 line-clamp-3 text-[11px] leading-relaxed text-slate-500">{prompt.text}</p>
          </button>
        ))}
      </div>
    </div>
  );
};
