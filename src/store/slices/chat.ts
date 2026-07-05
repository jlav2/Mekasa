import { CHAT_MESSAGES } from '../../data/fixtures';
import { pushMessages } from '../../data/backend';
import type { ChatMessage } from '../../data/models';
import { msgId, nowTime } from '../helpers';
import type { AppState, Set, Get } from '../types';

type ChatSlice = Pick<AppState, 'messages' | 'messagesFor' | 'sendMessage'>;

export const createChatSlice = (set: Set, get: Get): ChatSlice => ({
  messages: CHAT_MESSAGES,

  messagesFor: (circleId) => get().messages.filter((m) => m.circleId === circleId),

  sendMessage: (circleId, text) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const message: ChatMessage = {
      id: msgId(),
      circleId,
      kind: 'out',
      text: trimmed,
      time: nowTime(),
    };
    set((s) => ({ messages: [...s.messages, message] }));
    if (get().live) pushMessages([message]);
  },
});
