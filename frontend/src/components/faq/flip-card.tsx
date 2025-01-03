import React, { useState } from 'react';
import { Card } from '@/components/ui/card';

interface FlipCardProps {
  index: number;
  question: string;
  answer: string;
  tags: string[];
}

const FlipCard: React.FC<FlipCardProps> = ({
  question,
  answer,
  tags,
  index,
}) => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div
      className="relative h-48 cursor-pointer perspective-1000"
      onClick={() => setIsFlipped(!isFlipped)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          setIsFlipped(!isFlipped);
        }
      }}
    >
      <div
        className={`relative w-full h-full transition-transform duration-500 transform-style-preserve-3d ${
          isFlipped ? 'rotate-y-180' : ''
        }`}
      >
        {/* Front of card */}
        <div className="absolute w-full h-full backface-hidden">
          <Card className="w-full h-full p-4 flex flex-col items-center justify-center bg-card hover:bg-accent transition-colors">
            <h3 className="text-center font-medium mb-2">{question}</h3>
            <div className="flex flex-wrap gap-1 justify-center">
              {tags.map((tag) => (
                <span key={tag} className="text-xs text-muted-foreground">
                  #{tag}
                </span>
              ))}
            </div>
          </Card>
        </div>

        {/* Back of card */}
        <div className="absolute w-full h-full backface-hidden rotate-y-180">
          <Card className="w-full h-full p-4 flex items-center justify-center bg-primary text-primary-foreground">
            <p className="text-sm overflow-y-auto">{answer}</p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export { FlipCard };
