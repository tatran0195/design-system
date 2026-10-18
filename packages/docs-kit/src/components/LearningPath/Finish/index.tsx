import { Rating } from '@cms/docs-kit';
import type React from 'react';
import type { LearningPathStepType } from '@/providers/LearningPath';

export type LearningPathFinishType =
  | {
      type: 'rating';
      step: Omit<LearningPathStepType, 'descriptionJSX'> & {
        eventName?: string;
      };
    }
  | {
      type: 'custom';
      step: LearningPathStepType & {
        descriptionJSX: JSX.Element;
      };
    };

type LearningPathFinishProps = LearningPathFinishType & {
  onRating?: () => void;
};

export const LearningPathFinish = ({ type, step, onRating }: LearningPathFinishProps) => (
  <>
    {type === 'rating' && <Rating event={step.eventName} onRating={onRating} />}
    {type === 'custom' && <span className="text-compact-small text-cms-fg-subtle">{step.descriptionJSX as React.ReactNode}</span>}
  </>
);
