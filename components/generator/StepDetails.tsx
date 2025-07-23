import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BusinessIdea } from '@/types';

interface StepDetailsProps {
  businessIdea: BusinessIdea | null;
  onNext: () => void;
  onPrev: () => void;
  isLoading: boolean;
}

export const StepDetails: React.FC<StepDetailsProps> = ({ 
  businessIdea, 
  onNext, 
  onPrev, 
  isLoading 
}) => {
  if (!businessIdea) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p>ビジネスアイデアを分析中...</p>
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
          <CardTitle>最適化されたビジネス構想</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">ビジネスコンセプト</h3>
              <p className="text-sm bg-muted p-3 rounded-md">{businessIdea.concept}</p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">ターゲット市場</h3>
              <p className="text-sm bg-muted p-3 rounded-md">{businessIdea.targetMarket}</p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">独自価値</h3>
              <p className="text-sm bg-muted p-3 rounded-md">{businessIdea.uniqueValue}</p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">収益モデル</h3>
              <p className="text-sm bg-muted p-3 rounded-md">{businessIdea.revenueModel}</p>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-md">
            <p className="text-sm text-blue-800">
              この情報を基に、詳細なリーンキャンバスを生成します。
            </p>
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