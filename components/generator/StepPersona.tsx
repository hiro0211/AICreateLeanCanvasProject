import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Persona, DifyPersonaCandidate } from "@/types";

interface StepPersonaProps {
  persona: Persona | null;
  personaCandidates: DifyPersonaCandidate[];
  onNext: () => void;
  onPrev: () => void;
  onSelectPersona: (candidate: DifyPersonaCandidate) => void;
  isLoading: boolean;
}

export const StepPersona: React.FC<StepPersonaProps> = ({
  persona,
  personaCandidates,
  onNext,
  onPrev,
  onSelectPersona,
  isLoading,
}) => {
  // ペルソナが選択済みの場合の表示
  if (persona) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>選択されたペルソナ</CardTitle>
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
                    {persona.painPoints?.map((point, index) => (
                      <li key={index}>{point}</li>
                    )) || (
                      <li className="text-muted-foreground">
                        課題が設定されていません
                      </li>
                    )}
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium mb-2">目標・願望</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    {persona.goals?.map((goal, index) => (
                      <li key={index}>{goal}</li>
                    )) || (
                      <li className="text-muted-foreground">
                        目標が設定されていません
                      </li>
                    )}
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium mb-2">行動特性</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    {persona.behaviors?.map((behavior, index) => (
                      <li key={index}>{behavior}</li>
                    )) || (
                      <li className="text-muted-foreground">
                        行動特性が設定されていません
                      </li>
                    )}
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
  }

  // ペルソナ候補が存在する場合の選択UI
  if (personaCandidates.length > 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>ペルソナ候補から選択してください</CardTitle>
            <p className="text-muted-foreground">
              以下の候補から最も適切と思われるペルソナを選択してください
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {personaCandidates.map((candidate) => (
                <Card
                  key={candidate.id}
                  className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-primary"
                  onClick={() => onSelectPersona(candidate)}
                >
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold">
                          ペルソナ {candidate.id}
                        </h4>
                        <Button size="sm" variant="outline">
                          選択
                        </Button>
                      </div>

                      <div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {candidate.description}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <div>
                          <span className="text-xs font-medium text-green-600">
                            顕在ニーズ:
                          </span>
                          <p className="text-xs text-gray-700 mt-1">
                            {candidate.needs.explicit}
                          </p>
                        </div>

                        <div>
                          <span className="text-xs font-medium text-blue-600">
                            潜在ニーズ:
                          </span>
                          <p className="text-xs text-gray-700 mt-1">
                            {candidate.needs.implicit}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={onPrev}>
                戻る
              </Button>
              <div className="text-sm text-muted-foreground">
                ペルソナを選択して次に進んでください
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ローディング状態
  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p>ペルソナ候補を生成中...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 初期状態
  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <p>ペルソナ候補の生成を開始してください</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
