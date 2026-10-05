import { generateLocalChat, isChatModelInstalled } from './chatModel';
import {
  buildLocalChatPrompt,
  canAskLocalChat,
  isAcceptableLocalChatAnswer,
  tryAnswerLocalChat,
} from './localChatEngine';

jest.mock(
  './chatModel',
  () => ({
    generateLocalChat: jest.fn(),
    isChatModelInstalled: jest.fn(),
  }),
  { virtual: true },
);

const context = {
  dogName: 'Milo',
  last30DaysSummary: 'Two walks were logged this week. No meals were logged.',
  trainingContextSummary: 'No training sessions logged.',
};

describe('local conversation boundary', () => {
  beforeEach(() => {
    jest.mocked(generateLocalChat).mockReset();
    jest.mocked(isChatModelInstalled).mockReset();
  });

  it('uses only journal topics and excludes medical or advice questions', () => {
    expect(canAskLocalChat('How has Milo been doing lately?')).toBe(true);
    expect(canAskLocalChat('Should I change his medication dose?')).toBe(false);
    expect(canAskLocalChat('What causes parvo?')).toBe(false);
    expect(canAskLocalChat('Is Milo healthy this week?')).toBe(false);
    expect(canAskLocalChat('How to train my dog?')).toBe(false);
  });

  it('places the journal in a bounded data section and disables thinking', () => {
    const prompt = buildLocalChatPrompt(
      'How has Milo been doing lately?',
      context,
    );
    expect(prompt).toContain('Recent journal facts: Two walks');
    expect(prompt).toContain('/no_think');
    expect(prompt).toContain('<think>\n\n</think>');
  });

  it('rejects an invented count or clinical claim before showing an answer', () => {
    expect(isAcceptableLocalChatAnswer('Milo had two walks.', context)).toBe(
      true,
    );
    expect(isAcceptableLocalChatAnswer('Milo had three walks.', context)).toBe(
      false,
    );
    expect(isAcceptableLocalChatAnswer('Milo had two meals.', context)).toBe(
      false,
    );
    expect(isAcceptableLocalChatAnswer('Milo has an infection.', context)).toBe(
      false,
    );
  });

  it('avoids inference without a download and uses the downloaded model when present', async () => {
    jest
      .mocked(isChatModelInstalled)
      .mockResolvedValueOnce(false)
      .mockResolvedValueOnce(true);
    expect(
      await tryAnswerLocalChat({
        question: 'How has Milo been doing lately?',
        context,
      }),
    ).toBeNull();
    expect(generateLocalChat).not.toHaveBeenCalled();
    jest.mocked(generateLocalChat).mockResolvedValue('Milo had two walks.');
    expect(
      await tryAnswerLocalChat({
        question: 'How has Milo been doing lately?',
        context,
      }),
    ).toBe('Milo had two walks.');
  });
});
