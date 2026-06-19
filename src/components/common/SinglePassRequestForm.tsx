import type { ReactNode } from 'react';
import { AlignLeft, ArrowRight, Loader2, ShieldCheck } from 'lucide-react';
import PurposeSelect from './PurposeSelect';
import AttachmentUpload from './AttachmentUpload';
import { cn } from '../../utils/cn';

interface SinglePassRequestFormProps {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  profileName: string;
  profileMeta?: string;
  initials: string;
  purpose: string;
  onPurposeChange: (value: string) => void;
  purposeError?: string;
  reason: string;
  onReasonChange: (value: string) => void;
  onReasonBlur?: () => void;
  reasonError?: string;
  reasonPlaceholder?: string;
  attachmentUri: string;
  attachmentName?: string;
  onAttachmentChange: (value: string, name?: string) => void;
  submitText: string;
  submitting?: boolean;
  disabled?: boolean;
  onSubmit: () => void;
  submitDesktopOnly?: boolean;
  buttonIcon?: ReactNode;
  className?: string;
}

export default function SinglePassRequestForm({
  eyebrow = 'Single Pass Request',
  title = 'Gate Pass Request',
  subtitle = 'Provide the purpose, reason, and optional attachment for this request.',
  profileName,
  profileMeta,
  initials,
  purpose,
  onPurposeChange,
  purposeError,
  reason,
  onReasonChange,
  onReasonBlur,
  reasonError,
  reasonPlaceholder = 'Please provide specific details for this request...',
  attachmentUri,
  attachmentName,
  onAttachmentChange,
  submitText,
  submitting = false,
  disabled = false,
  onSubmit,
  submitDesktopOnly = false,
  buttonIcon,
  className,
}: SinglePassRequestFormProps) {
  return (
    <section className={cn('mx-auto w-full max-w-3xl space-y-5 lg:max-w-4xl', className)}>
      <div className="overflow-hidden rounded-[30px] border border-white/55 bg-white/80 shadow-[0_24px_70px_rgba(15,23,42,0.10)] backdrop-blur-xl">
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-slate-950 px-5 py-5 text-white lg:px-7 lg:py-6">
          <div className="absolute -right-12 -top-16 h-40 w-40 rounded-full bg-cyan-300/25 blur-3xl" />
          <div className="absolute -bottom-20 left-12 h-44 w-44 rounded-full bg-blue-300/20 blur-3xl" />
          <div className="relative flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl border border-white/25 bg-white/15 text-2xl font-black shadow-inner backdrop-blur-md">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="mb-1 text-[11px] font-black uppercase tracking-[0.24em] text-blue-100/80">
                {eyebrow}
              </p>
              <h2 className="truncate text-[22px] font-black leading-tight tracking-tight lg:text-[26px]">
                {profileName}
              </h2>
              {profileMeta && (
                <p className="mt-1 truncate text-[12px] font-bold uppercase tracking-[0.18em] text-blue-100/80">
                  {profileMeta}
                </p>
              )}
            </div>
            <div className="hidden h-12 w-12 items-center justify-center rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md sm:flex">
              <ShieldCheck className="h-6 w-6 text-white/75" />
            </div>
          </div>
        </div>

        <div className="space-y-5 px-5 py-5 lg:px-7 lg:py-6">
          <div>
            <h3 className="text-[20px] font-black leading-tight tracking-tight text-slate-950 lg:text-[24px]">
              {title}
            </h3>
            <p className="mt-1 max-w-2xl text-[13px] font-semibold leading-relaxed text-slate-500 lg:text-[14px]">
              {subtitle}
            </p>
          </div>

          <div className="grid gap-5">
            <div className="space-y-2.5">
              <label className="block px-1 text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
                Purpose of Visit
              </label>
              <PurposeSelect
                value={purpose}
                onChange={onPurposeChange}
                error={purposeError}
                variant="outlined"
              />
            </div>

            <div className="space-y-2.5">
              <label className="block px-1 text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
                Detailed Reason
              </label>
              <div className="group relative">
                <AlignLeft
                  className={cn(
                    'absolute left-4 top-4 h-5 w-5 transition-colors',
                    reasonError ? 'text-rose-400' : 'text-slate-300 group-focus-within:text-blue-600'
                  )}
                />
                <textarea
                  rows={4}
                  placeholder={reasonPlaceholder}
                  value={reason}
                  onChange={event => onReasonChange(event.target.value)}
                  onBlur={onReasonBlur}
                  className={cn(
                    'min-h-[128px] w-full resize-none rounded-2xl border bg-white/90 py-4 pl-12 pr-4 text-[15px] font-bold text-slate-950 shadow-sm outline-none transition-all placeholder:text-slate-300 focus:ring-4 dark:bg-slate-950 dark:text-white',
                    reasonError
                      ? 'border-rose-400 focus:ring-rose-300/25'
                      : 'border-slate-200/80 focus:border-blue-400 focus:ring-blue-500/10 dark:border-slate-800'
                  )}
                />
              </div>
              {reasonError && (
                <p className="px-1 text-[11px] font-bold text-rose-500">{reasonError}</p>
              )}
            </div>

            <AttachmentUpload
              value={attachmentUri}
              fileName={attachmentName}
              onChange={onAttachmentChange}
            />
          </div>

          <button
            type="button"
            onClick={onSubmit}
            disabled={disabled || submitting}
            className={cn(
              'group flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 px-5 text-[14px] font-black uppercase tracking-[0.16em] text-white shadow-[0_18px_35px_rgba(37,99,235,0.30)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_22px_42px_rgba(37,99,235,0.38)] active:scale-[0.98]',
              (disabled || submitting) && 'cursor-not-allowed opacity-55 shadow-none hover:translate-y-0',
              submitDesktopOnly && 'hidden lg:flex'
            )}
          >
            {submitting ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              buttonIcon || <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            )}
            <span>{submitting ? 'Submitting request' : submitText}</span>
          </button>
        </div>
      </div>
    </section>
  );
}
