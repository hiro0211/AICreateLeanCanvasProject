import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Persona } from '@/types';

interface StepPersonaProps {
  persona: Persona | null;
  onNext: () => void;
  onPrev: () => void;
  isLoading: boolean;
}

export const StepPersona: React.FC<StepPersonaProps> = ({ 
  persona, 
  onNext, 
  onPrev, 
  isLoading 
}) => {
  if (!persona) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p>ペルソナを生成中...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>生成されたペルソナ</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg">{persona.name}</h3>
              {persona.age && persona.occupation && (
                <p className="text-muted-foreground">
                  {persona.age}歳、{persona.occupation}
                </p>
              )}
            </div>

            <div className="grid gap-4">
              <div>
                <h4 className="font-medium mb-2">痛み・課題</h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {persona.painPoints.map((point, index) => (
                    <li key={index}>{point}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-medium mb-2">目標・願望</h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {persona.goals.map((goal, index) => (
                    <li key={index}>{goal}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-medium mb-2">行動特性</h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {persona.behaviors.map((behavior, index) => (
                    <li key={index}>{behavior}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={onPrev}>
              戻る
            </Button>
            <Button onClick={onNext} disabled={isLoading}>
              次へ
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};