'use client';

import React from 'react';
import { useGeneratorState } from '@/hooks/useGeneratorState';
import { StepWelcome } from '@/components/generator/StepWelcome';
import { StepPersona } from '@/components/generator/StepPersona';
import { StepIdea } from '@/components/generator/StepIdea';
import { StepDetails } from '@/components/generator/StepDetails';
import { StepName } from '@/components/generator/StepName';
import { StepCanvas } from '@/components/generator/StepCanvas';

const StepIndicator: React.FC<{ 
  steps: Array<{ title: string; completed: boolean }>;
  currentStep: number;
}> = ({ steps, currentStep }) => (
  <div className="flex justify-center mb-8">
    <div className="flex items-center space-x-2">
      {steps.map((step, index) => (
        <React.Fragment key={index}>
          <div className={`
            flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium
            ${index === currentStep 
              ? 'bg-primary text-primary-foreground' 
              : step.completed 
                ? 'bg-green-500 text-white' 
                : 'bg-muted text-muted-foreground'
            }
          `}>
            {step.completed ? '✓' : index + 1}
          </div>
          {index < steps.length - 1 && (
            <div className={`
              w-12 h-0.5 
              ${step.completed ? 'bg-green-500' : 'bg-muted'}
            `} />
          )}
        </React.Fragment>
      ))}
    </div>
  </div>
);

const ErrorDisplay: React.FC<{ error: string; onDismiss: () => void }> = ({ error, onDismiss }) => (
  <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
    <div className="flex justify-between items-center">
      <p className="text-red-800 text-sm">{error}</p>
      <button
        onClick={onDismiss}
        className="text-red-600 hover:text-red-800 text-sm"
      >
        ✕
      </button>
    </div>
  </div>
);

export default function HomePage() {
  const { state, actions } = useGeneratorState();

  const renderCurrentStep = () => {
    switch (state.currentStep) {
      case 0:
        return (
          <StepWelcome
            onNext={actions.generatePersona}
            isLoading={state.isLoading}
          />
        );
      
      case 1:
        return (
          <StepPersona
            persona={state.persona}
            onNext={actions.nextStep}
            onPrev={actions.prevStep}
            isLoading={state.isLoading}
          />
        );
      
      case 2:
        return (
          <StepIdea
            onNext={actions.refineBusinessIdea}
            onPrev={actions.prevStep}
            isLoading={state.isLoading}
          />
        );
      
      case 3:
        return (
          <StepDetails
            businessIdea={state.businessIdea}
            onNext={actions.nextStep}
            onPrev={actions.prevStep}
            isLoading={state.isLoading}
          />
        );
      
      case 4:
        return (
          <StepName
            onNext={() => actions.generateCanvas()}
            onPrev={actions.prevStep}
            isLoading={state.isLoading}
          />
        );
      
      case 5:
        return (
          <StepCanvas
            data={state.canvasData}
            onPrev={actions.prevStep}
            onReset={actions.reset}
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-primary mb-2">
          AIリーンキャンバスジェネレーター
        </h1>
        <p className="text-muted-foreground">
          AIとの対話でビジネスアイデアからリーンキャンバスを自動生成
        </p>
      </div>

      {state.currentStep < 5 && (
        <StepIndicator 
          steps={state.steps} 
          currentStep={state.currentStep} 
        />
      )}

      {state.error && (
        <ErrorDisplay 
          error={state.error} 
          onDismiss={() => actions.setError(null)} 
        />
      )}

      <div className="animate-in fade-in-50 duration-500">
        {renderCurrentStep()}
      </div>
    </div>
  );
}