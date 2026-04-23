import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Clock, Circle } from 'lucide-react';
import { cn } from '../../utils/cn';

interface RequestTimelineProps {
  request: any;
}

export default function RequestTimeline({ request }: RequestTimelineProps) {
  if (!request) return null;

  const { status, staffApproval, hodApproval, staffRemark, hodRemark } = request;

  const getStepStatus = (step: number) => {
    if (status === 'REJECTED') {
      if (step === 1) return 'completed';
      if (step === 2) {
        if (staffApproval === 'REJECTED') return 'rejected';
        if (staffApproval === 'APPROVED' || ['PENDING_HOD', 'APPROVED_BY_STAFF'].includes(status) || !!hodApproval) return 'completed';
        return 'pending';
      }
      if (step === 3 && hodApproval === 'REJECTED') return 'rejected';
      return 'pending';
    }

    if (status === 'APPROVED' || status === 'USED') {
      return 'completed';
    }

    if (step === 1) return 'completed';
    if (step === 2) {
      if (staffApproval === 'APPROVED' || ['PENDING_HOD', 'APPROVED_BY_STAFF', 'APPROVED'].includes(status) || !!hodApproval) return 'completed';
      if (staffApproval === 'REJECTED') return 'rejected';
      return 'active';
    }
    if (step === 3) {
      if (hodApproval === 'APPROVED' || status === 'APPROVED') return 'completed';
      if (hodApproval === 'REJECTED') return 'rejected';
      if (staffApproval === 'APPROVED' || ['PENDING_HOD', 'APPROVED_BY_STAFF'].includes(status)) return 'active';
      return 'pending';
    }
    return 'pending';
  };

  const getStepColors = (stepStatus: string) => {
    switch (stepStatus) {
      case 'completed': return { text: 'text-emerald-500', bg: 'bg-emerald-500/20', icon: CheckCircle2, color: '#10B981' };
      case 'rejected': return { text: 'text-rose-500', bg: 'bg-rose-500/20', icon: XCircle, color: '#EF4444' };
      case 'active': return { text: 'text-amber-500', bg: 'bg-amber-500/20', icon: Clock, color: '#F59E0B' };
      default: return { text: 'text-slate-300', bg: 'bg-slate-100', icon: Circle, color: '#CBD5E1' };
    }
  };

  const steps = [
    { label: 'Request Submitted', step: 1 },
    { label: 'Staff Approval', step: 2 },
    { label: 'HOD Approval', step: 3 },
  ];

  const getCompletedStepsCount = () => {
    let count = 1;
    if (staffApproval === 'APPROVED' || !!hodApproval || status === 'APPROVED') count++;
    if (hodApproval === 'APPROVED' || status === 'APPROVED') count++;
    return count;
  };

  const progressPercentage = (getCompletedStepsCount() / 3) * 100;
  const barColor = status === 'APPROVED' ? 'bg-emerald-500' : status === 'REJECTED' ? 'bg-rose-500' : 'bg-amber-500';

  return (
    <div className="w-full">
      {/* Progress Bar */}
      <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full mb-8 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progressPercentage}%` }}
          className={cn("h-full rounded-full transition-colors", barColor)}
        />
      </div>

      {/* Timeline Steps */}
      <div className="space-y-6">
        {steps.map((item, index) => {
          const stepStatus = getStepStatus(item.step);
          const config = getStepColors(stepStatus);
          const Icon = config.icon;
          const isLast = index === steps.length - 1;

          return (
            <div key={item.step} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className={cn("w-12 h-12 rounded-full flex items-center justify-center shrink-0", config.bg)}>
                  <Icon className={cn("w-7 h-7", config.text)} />
                </div>
                {!isLast && (
                  <div className={cn(
                    "w-1 flex-1 my-1.5 rounded-full min-h-[30px]",
                    getStepColors(getStepStatus(item.step + 1)).bg.replace('/20', '/40')
                  )} />
                )}
              </div>

              <div className="flex-1 pt-2">
                <h4 className="text-base font-bold text-slate-900 dark:text-white leading-none mb-1.5 tracking-tight">
                  {item.label}
                </h4>
                <p className={cn("text-sm font-bold uppercase tracking-wide", config.text)}>
                  {stepStatus === 'completed' ? '✓ Completed' :
                   stepStatus === 'rejected' ? '✗ Rejected' :
                   stepStatus === 'active' ? '⏳ In Progress' : '○ Pending'}
                </p>

                {/* Remarks */}
                {item.step === 2 && staffRemark && (
                  <div className="mt-3 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border-l-[3px] border-amber-500">
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Staff Remark:</p>
                    <p className="text-[13px] font-medium text-slate-700 dark:text-slate-300 italic leading-snug">
                      "{staffRemark}"
                    </p>
                  </div>
                )}
                {item.step === 3 && hodRemark && (
                  <div className="mt-3 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border-l-[3px] border-amber-500">
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1">HOD Remark:</p>
                    <p className="text-[13px] font-medium text-slate-700 dark:text-slate-300 italic leading-snug">
                      "{hodRemark}"
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
