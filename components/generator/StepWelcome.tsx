import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface StepWelcomeProps {
  onNext: (initialInput: string) => void;
  isLoading: boolean;
}

export const StepWelcome: React.FC<StepWelcomeProps> = ({ onNext, isLoading }) => {
  const [input, setInput] = useState('');

  const handleSubmit = () => {
    if (input.trim()) {
      onNext(input.trim());
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>AIリーンキャンバスジェネレーターへようこそ</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-4">
            <p className="text-lg text-muted-foreground">
              このツールは、あなたのビジネスアイデアからリーンキャンバスを自動生成します。
            </p>
            <p className="text-sm text-muted-foreground">
              まずは、あなたのビジネスアイデアや解決したい課題について簡単に教えてください。
            </p>
          </div>
          
          <div className="space-y-4">
            <label className="block text-sm font-medium">
              ビジネスアイデアや解決したい課題を入力してください
            </label>
            <Textarea
              placeholder="例：忙しい働く人のための時短料理サービス、高齢者の見守りアプリ、学習効率を上げるツール など"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={4}
              disabled={isLoading}
            />
          </div>

          <div className="flex justify-center">
            <Button
              onClick={handleSubmit}
              disabled={!input.trim() || isLoading}
              size="lg"
            >
              {isLoading ? '生成中...' : '開始する'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};