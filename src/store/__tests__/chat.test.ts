import { resetStore, useStore } from '../testUtils/testStore';
import * as backend from '../../data/backend';

beforeEach(resetStore);

describe('sendMessage', () => {
  it('appends a trimmed outgoing message', () => {
    const before = useStore.getState().messages.length;
    useStore.getState().sendMessage('frishman', '  בדרך אליכם  ');
    const messages = useStore.getState().messages;
    expect(messages).toHaveLength(before + 1);
    const last = messages[messages.length - 1];
    expect(last).toMatchObject({ circleId: 'frishman', kind: 'out', text: 'בדרך אליכם' });
  });

  it('ignores an empty or whitespace-only message', () => {
    const before = useStore.getState().messages.length;
    useStore.getState().sendMessage('frishman', '   ');
    expect(useStore.getState().messages).toHaveLength(before);
  });

  it('does not write through to the backend while offline (not live)', () => {
    useStore.getState().sendMessage('frishman', 'hello');
    expect(backend.pushMessages).not.toHaveBeenCalled();
  });

  it('writes through to the backend once live', () => {
    useStore.setState({ live: true });
    useStore.getState().sendMessage('frishman', 'hello');
    expect(backend.pushMessages).toHaveBeenCalledTimes(1);
    const [sent] = jest.mocked(backend.pushMessages).mock.calls[0];
    expect(sent).toHaveLength(1);
    expect(sent[0].text).toBe('hello');
  });
});

describe('messagesFor', () => {
  it('filters messages to the given circle', () => {
    useStore.getState().sendMessage('frishman', 'a');
    useStore.getState().sendMessage('gordon', 'b');
    const frishmanMessages = useStore.getState().messagesFor('frishman');
    expect(frishmanMessages.every((m) => m.circleId === 'frishman')).toBe(true);
    expect(frishmanMessages.some((m) => m.text === 'a')).toBe(true);
    expect(frishmanMessages.some((m) => m.text === 'b')).toBe(false);
  });
});
