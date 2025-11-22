"use client";

import { useActionState, useState, useTransition } from 'react';
import { validateTraining } from '@/app/lib/actions';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

type Props = {
  employeeNumber: string;
  skillCode: string;
  skillName: string;
  targetLevel?: number | null;
  dueDate?: Date;
  currentLevel?: number | null;
  validatorName?: string;
  lastValidated?: Date;
};

type State = {
  message: string | null;
};

const levelLabels: Record<number, string> = {
  1: "Level 1 - Trainee",
  2: "Level 2 - Practitioner",
  3: "Level 3 - Expert",
  4: "Level 4 - Trainer",
};

export default function QuickValidateForm({
  employeeNumber,
  skillCode,
  skillName,
  targetLevel,
  dueDate,
  currentLevel,
  validatorName,
  lastValidated,
}: Props) {
  const initialState: State = { message: null };
  // @ts-expect-error Server action typing
  const [state, formAction] = useActionState(validateTraining, initialState);
  const [selectedLevel, setSelectedLevel] = useState<string>(currentLevel ? String(currentLevel) : '');
  const [isPending, startTransition] = useTransition();

  return (
    <Card className="p-4 shadow-sm border-border/80">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-sm font-semibold">{skillCode} — {skillName}</p>
            <p className="text-xs text-muted-foreground">
              {targetLevel ? `Target L${targetLevel}` : 'No target'} {dueDate ? `• Due ${new Date(dueDate).toLocaleDateString()}` : ''}
            </p>
          </div>
          {currentLevel ? (
            <Badge variant="secondary" className="rounded-full text-xs px-3">
              Current L{currentLevel}
            </Badge>
          ) : (
            <Badge variant="outline" className="rounded-full text-xs px-3">
              Not validated
            </Badge>
          )}
        </div>

        {lastValidated && (
          <p className="text-xs text-muted-foreground">
            Last validated {lastValidated.toLocaleDateString()} {validatorName ? `by ${validatorName}` : ''}
          </p>
        )}

        <form
          action={(formData) => {
            startTransition(() => formAction(formData));
          }}
          className="space-y-3"
          encType="multipart/form-data"
        >
          <input type="hidden" name="employeeId" value={employeeNumber} />
          <input type="hidden" name="skillId" value={skillCode} />

          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4].map((level) => {
              const isSelected = selectedLevel === String(level);
              return (
                <Button
                  key={level}
                  type="button"
                  variant={isSelected ? "default" : "outline"}
                  className="h-10 px-3"
                  onClick={() => setSelectedLevel(String(level))}
                >
                  L{level}
                </Button>
              );
            })}
          </div>
          <input type="hidden" name="level" value={selectedLevel} required />
          <p className="text-xs text-muted-foreground">
            {selectedLevel ? levelLabels[Number(selectedLevel)] : 'Select a level to validate'}
          </p>

          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground" htmlFor={`notes-${employeeNumber}-${skillCode}`}>
              Quick note (optional)
            </label>
            <Textarea
              id={`notes-${employeeNumber}-${skillCode}`}
              name="notes"
              placeholder="Observations, evidence reference..."
              className="min-h-[70px]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground" htmlFor={`evidence-${employeeNumber}-${skillCode}`}>
              Photo or file (optional)
            </label>
            <Input id={`evidence-${employeeNumber}-${skillCode}`} name="evidence" type="file" accept="image/*,application/pdf" />
          </div>

          {state?.message && <p className="text-xs text-muted-foreground">{state.message}</p>}

          <div className="flex justify-end">
            <Button type="submit" disabled={isPending || !selectedLevel}>
              {isPending ? 'Validating...' : 'Validate'}
            </Button>
          </div>
        </form>
      </div>
    </Card>
  );
}
