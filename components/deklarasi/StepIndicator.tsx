'use client'

import { CheckCircle } from 'lucide-react'

interface StepIndicatorProps {
  steps: string[]
  currentStep: number
}

export default function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <div className="w-full" role="navigation" aria-label="Progress">
      {/* Progress bar */}
      <div className="progress-bar mb-6">
        <div
          className="progress-fill"
          style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
          aria-valuenow={currentStep}
          aria-valuemin={1}
          aria-valuemax={steps.length}
        />
      </div>

      {/* Step Labels */}
      <div className="flex items-start justify-between">
        {steps.map((step, idx) => {
          const stepNum = idx + 1
          const isCompleted = stepNum < currentStep
          const isCurrent = stepNum === currentStep

          return (
            <div
              key={step}
              id={`step-indicator-${stepNum}`}
              className="flex flex-col items-center gap-2 flex-1"
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-300 ${
                  isCompleted
                    ? 'bg-[#10B981] border-[#10B981] text-white'
                    : isCurrent
                    ? 'bg-[#0A2558] border-[#0A2558] text-white scale-110'
                    : 'bg-white border-[#CBD5E1] text-[#94A3B8]'
                }`}
              >
                {isCompleted ? <CheckCircle size={16} /> : stepNum}
              </div>
              <span
                className={`text-xs text-center hidden sm:block leading-tight ${
                  isCurrent ? 'text-[#0A2558] font-semibold' : isCompleted ? 'text-[#10B981]' : 'text-[#94A3B8]'
                }`}
              >
                {step}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
