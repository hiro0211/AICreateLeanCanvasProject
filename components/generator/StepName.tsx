import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface StepNameProps {
  onNext: (businessName: string) => void;
  onPrev: () => void;
  isLoading: boolean;
}

export const StepName: React.FC<StepNameProps> = ({ onNext, onPrev, isLoading }) => {
  const [businessName, setBusinessName] = useState('');

  const handleSubmit = () => {
    onNext(businessName || 'My Business');
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>ビジネス名の設定</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <p className="text-muted-foreground">
              リーンキャンバスに表示するビジネス名を入力してください。
              空白の場合は「My Business」と表示されます。
            </p>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium">
                ビジネス名（任意）
              </label>
              <Input
                type="text"
                placeholder="例：QuickCook、時短料理キット など"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded-md">
            <p className="text-sm text-green-800">
              いよいよリーンキャンバスを生成します！
            </p>
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={onPrev}>
              戻る
            </Button>
            <Button onClick={handleSubmit} disabled={isLoading}>
              {isLoading ? 'キャンバス生成中...' : 'キャンバス生成'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};