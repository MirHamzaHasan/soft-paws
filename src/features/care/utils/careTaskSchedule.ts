import type {
  CareTaskDueState,
  CareTaskRecurrence,
  CareTaskType,
} from '@/types/care';
import { getCareTaskOption } from '@/types/care';

const DAY_MS = 86_400_000;

type CareTaskDueFields = {
  completedAt: string | null;
  dueAt: string;
};

type CareTaskSortableFields = {
  dueAt: string;
};

export function normalizeCareDateInput(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  const slashMatch = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);

  if (slashMatch) {
    const month = slashMatch[1] ?? '';
    const day = slashMatch[2] ?? '';
    const year = slashMatch[3] ?? '';

    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }

  const dashMatch = trimmed.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);

  if (dashMatch) {
    const year = dashMatch[1] ?? '';
    const month = dashMatch[2] ?? '';
    const day = dashMatch[3] ?? '';

    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }

  return trimmed;
}

function parseDateOnly(value: string) {
  const [year, month, day] = value.split('-').map(Number);

  if (!year || !month || !day) {
    return null;
  }

  const date = new Date(year, month - 1, day, 9, 0, 0, 0);

  return Number.isNaN(date.getTime()) ? null : date;
}

export function parseCareTaskDueDate(dueAt: string) {
  return parseDateOnly(dueAt) ?? new Date(dueAt);
}

export function getCareTaskDueState(
  task: CareTaskDueFields,
  now = new Date(),
): CareTaskDueState {
  if (task.completedAt) {
    return 'completed';
  }

  const dueDate = parseCareTaskDueDate(task.dueAt);

  if (Number.isNaN(dueDate.getTime())) {
    return 'upcoming';
  }

  const todayStart = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  ).getTime();
  const dueStart = new Date(
    dueDate.getFullYear(),
    dueDate.getMonth(),
    dueDate.getDate(),
  ).getTime();

  if (dueStart < todayStart) {
    return 'overdue';
  }

  if (dueStart === todayStart) {
    return 'due_today';
  }

  return 'upcoming';
}

function addOneRecurrence(date: Date, recurrence: CareTaskRecurrence) {
  const next = new Date(date);

  if (recurrence === 'daily') {
    next.setDate(next.getDate() + 1);
  } else if (recurrence === 'weekly') {
    next.setDate(next.getDate() + 7);
  } else if (recurrence === 'monthly') {
    next.setMonth(next.getMonth() + 1);
  }

  return next;
}

export function formatCareTaskDateInput(date: Date) {
  const year = String(date.getFullYear());
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export function getNextCareTaskDueAt(input: {
  completedAt?: Date;
  dueAt: string;
  recurrence: CareTaskRecurrence;
}) {
  if (input.recurrence === 'none' || input.recurrence === 'custom') {
    return null;
  }

  let nextDate = parseCareTaskDueDate(input.dueAt);
  const completedAt = input.completedAt ?? new Date();

  if (Number.isNaN(nextDate.getTime())) {
    return null;
  }

  do {
    nextDate = addOneRecurrence(nextDate, input.recurrence);
  } while (nextDate.getTime() <= completedAt.getTime());

  return formatCareTaskDateInput(nextDate);
}

export function formatCareTaskDueLabel(
  task: CareTaskDueFields,
  now = new Date(),
) {
  const state = getCareTaskDueState(task, now);

  if (state === 'completed') {
    return 'Completed';
  }

  if (state === 'due_today') {
    return 'Due today';
  }

  const dueDate = parseCareTaskDueDate(task.dueAt);

  if (Number.isNaN(dueDate.getTime())) {
    return 'Due date needs review';
  }

  const days = Math.ceil((dueDate.getTime() - now.getTime()) / DAY_MS);

  if (state === 'overdue') {
    return `${Math.abs(days)} day${Math.abs(days) === 1 ? '' : 's'} overdue`;
  }

  return `Due in ${Math.max(days, 1)} day${days === 1 ? '' : 's'}`;
}

export function getCareTaskTypeLabel(type: CareTaskType) {
  return getCareTaskOption(type).label;
}

export function sortCareTasksByDueAt<TTask extends CareTaskSortableFields>(
  tasks: TTask[],
) {
  return [...tasks].sort((left, right) => {
    const leftTime = parseCareTaskDueDate(left.dueAt).getTime();
    const rightTime = parseCareTaskDueDate(right.dueAt).getTime();

    return leftTime - rightTime;
  });
}
