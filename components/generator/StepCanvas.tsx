import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CanvasData } from '@/types';

interface StepCanvasProps {
  data: CanvasData | null;
  onPrev: () => void;
  onReset: () => void;
}

const CanvasBox: React.FC<{ title: string; subtitle: string; children: React.ReactNode; className?: string }> = ({ 
  title, 
  subtitle, 
  children, 
  className 
}) => (
  <Card className={`h-full flex flex-col ${className}`}>
    <CardHeader className="pb-3">
      <CardTitle className="text-lg">{title}</CardTitle>
      <p className="text-sm text-muted-foreground">{subtitle}</p>
    </CardHeader>
    <CardContent className="flex-grow">
      {children}
    </CardContent>
  </Card>
);

const LoadingSkeleton: React.FC = () => (
  <div className="max-w-screen-xl mx-auto">
    <header className="text-center mb-6">
      <h1 className="text-3xl font-bold">Lean Canvas</h1>
      <p className="text-muted-foreground mt-2">キャンバスを生成中...</p>
    </header>
    <main className="grid grid-cols-1 md:grid-cols-5 gap-2" style={{ minHeight: '75vh' }}>
      {Array.from({ length: 9 }).map((_, index) => (
        <div key={index} className="animate-pulse bg-muted rounded-lg h-48" />
      ))}
    </main>
  </div>
);

export const StepCanvas: React.FC<StepCanvasProps> = ({ data, onPrev, onReset }) => {
  if (!data) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="max-w-screen-xl mx-auto">
      <header className="text-center mb-6">
        <h1 className="text-3xl font-bold">Lean Canvas</h1>
        <p className="text-muted-foreground mt-2">生成されたリーンキャンバス</p>
      </header>
      
      <main className="grid grid-cols-1 md:grid-cols-5 gap-2" style={{ minHeight: '75vh' }}>
        {/* Problem */}
        <div className="md:row-span-2">
          <CanvasBox title="Problem" subtitle="課題">
            <ul className="list-disc list-inside space-y-1 text-sm">
              {data.problem.map((item, i) => <li key={i}>{item}</li>)}
            </ul>
          </CanvasBox>
        </div>

        {/* Solution & Key Metrics */}
        <div className="md:row-span-2 grid grid-rows-2 gap-2">
          <CanvasBox title="Solution" subtitle="解決策">
            <ul className="list-disc list-inside space-y-1 text-sm">
              {data.solution.map((item, i) => <li key={i}>{item}</li>)}
            </ul>
          </CanvasBox>
          <CanvasBox title="Key Metrics" subtitle="主要指標">
            <ul className="list-disc list-inside space-y-1 text-sm">
              {data.keyMetrics.map((item, i) => <li key={i}>{item}</li>)}
            </ul>
          </CanvasBox>
        </div>

        {/* Unique Value Proposition */}
        <div className="md:row-span-2">
          <CanvasBox title="Unique Value Proposition" subtitle="独自の価値提案" className="items-center justify-center text-center">
            <div className="space-y-2">
              <p className="font-semibold text-lg text-indigo-600">
                {data.uniqueValueProposition[0]}
              </p>
              {data.uniqueValueProposition.slice(1).map((item, i) => (
                <p key={i} className="text-sm">
                  {item}
                </p>
              ))}
            </div>
          </CanvasBox>
        </div>

        {/* Unfair Advantage & Channels */}
        <div className="md:row-span-2 grid grid-rows-2 gap-2">
          <CanvasBox title="Unfair Advantage" subtitle="圧倒的優位性">
            <ul className="list-disc list-inside space-y-1 text-sm">
              {data.unfairAdvantage.map((item, i) => <li key={i}>{item}</li>)}
            </ul>
          </CanvasBox>
          <CanvasBox title="Channels" subtitle="チャネル">
            <ul className="list-disc list-inside space-y-1 text-sm">
              {data.channels.map((item, i) => <li key={i}>{item}</li>)}
            </ul>
          </CanvasBox>
        </div>

        {/* Customer Segments */}
        <div className="md:row-span-2">
          <CanvasBox title="Customer Segments" subtitle="顧客セグメント">
            <ul className="list-disc list-inside space-y-1 text-sm">
              {data.customerSegments.map((item, i) => <li key={i}>{item}</li>)}
            </ul>
          </CanvasBox>
        </div>

        {/* Cost Structure */}
        <div className="md:col-span-2">
          <CanvasBox title="Cost Structure" subtitle="コスト構造">
            <ul className="list-disc list-inside space-y-1 text-sm">
              {data.costStructure.map((item, i) => <li key={i}>{item}</li>)}
            </ul>
          </CanvasBox>
        </div>

        {/* Revenue Streams */}
        <div className="md:col-span-3">
          <CanvasBox title="Revenue Streams" subtitle="収益の流れ">
            <ul className="list-disc list-inside space-y-1 text-sm">
              {data.revenueStreams.map((item, i) => <li key={i}>{item}</li>)}
            </ul>
          </CanvasBox>
        </div>
      </main>

      <footer className="mt-8 flex justify-center space-x-4">
        <Button variant="outline" onClick={onPrev}>
          戻る
        </Button>
        <Button onClick={onReset}>
          新しいキャンバスを作成
        </Button>
      </footer>
    </div>
  );
};