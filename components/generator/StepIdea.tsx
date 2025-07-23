import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface StepIdeaProps {
  onNext: (idea: string) => void;
  onPrev: () => void;
  isLoading: boolean;
}

export const StepIdea: React.FC<StepIdeaProps> = ({ onNext, onPrev, isLoading }) => {
  const [idea, setIdea] = useState('');

  const handleSubmit = () => {
    if (idea.trim()) {
      onNext(idea.trim());
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>ビジネスアイデアの詳細</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <p className="text-muted-foreground">
              生成されたペルソナを踏まえて、より具体的なビジネスアイデアを入力してください。
              AIが最適化されたビジネス構想を提案します。
            </p>
            
            <div className="space-y-4">
              <label className="block text-sm font-medium">
                具体的なビジネスアイデア・サービス内容
              </label>
              <Textarea
                placeholder="例：働く親向けの15分で作れる栄養バランス料理キット配送サービス。冷凍食品ではなく、新鮮な食材と簡単レシピをセットで提供。"
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                rows={6}
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={onPrev}>
              戻る
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!idea.trim() || isLoading}
            >
              {isLoading ? 'AI分析中...' : '次へ'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};