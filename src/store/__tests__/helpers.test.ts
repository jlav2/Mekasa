import { freshUser, deriveInitial, avatarColorFor, msgId, nowTime } from '../helpers';
import { CURRENT_USER } from '../../data/fixtures';
import { avatarPalette } from '../../theme';

describe('freshUser', () => {
  // Regression test for the session's CRITICAL finding: new accounts (guest,
  // first-time OAuth, confirmed signup) must never inherit the demo fixture
  // identity (name/Pro/sports/beaches), which previously leaked in via the
  // store's seed state and got persisted to Supabase.
  it('never inherits the demo fixture identity', () => {
    const u = freshUser('new-uid-123', 'אורח');
    expect(u.name).not.toBe(CURRENT_USER.name);
    expect(u.avatarColor).not.toBe(CURRENT_USER.avatarColor);
    expect(u.isPro).toBe(false);
    expect(u.sports).toEqual([]);
    expect(u.homeBeaches).toEqual([]);
    expect(u.followedBeaches).toEqual([]);
    expect(u.stats).toEqual({ circles: 0, beaches: 0, partners: 0, hours: 0 });
  });

  it('sets the given uid and name', () => {
    const u = freshUser('uid-1', 'אורח');
    expect(u.id).toBe('uid-1');
    expect(u.name).toBe('אורח');
  });

  it('derives the avatar initial from the given name', () => {
    expect(freshUser('uid', 'Guy Levi').avatarInitial).toBe('G');
  });

  it('produces a deterministic, palette-valid avatar color for a given uid', () => {
    const a = freshUser('same-uid', 'A');
    const b = freshUser('same-uid', 'B');
    expect(a.avatarColor).toBe(b.avatarColor);
    expect(avatarPalette).toContain(a.avatarColor);
  });

  it('produces different colors for different uids (not a constant fallback)', () => {
    // Not a mathematical guarantee, but the hash should vary across these ids.
    const colors = new Set(['uid-a', 'uid-b', 'uid-c', 'uid-d'].map((id) => freshUser(id, 'x').avatarColor));
    expect(colors.size).toBeGreaterThan(1);
  });
});

describe('deriveInitial', () => {
  it('takes the first character after trimming', () => {
    expect(deriveInitial('  Guy Levi')).toBe('G');
  });

  it('falls back to a placeholder for an empty or whitespace-only name', () => {
    expect(deriveInitial('   ')).toBe('·');
    expect(deriveInitial('')).toBe('·');
  });
});

describe('avatarColorFor', () => {
  it('is deterministic for the same uid', () => {
    expect(avatarColorFor('abc-123')).toBe(avatarColorFor('abc-123'));
  });

  it('always returns a color from the avatar palette', () => {
    expect(avatarPalette).toContain(avatarColorFor('any-uid-whatsoever'));
    expect(avatarPalette).toContain(avatarColorFor(''));
  });
});

describe('msgId', () => {
  it('produces unique ids across many calls', () => {
    const ids = new Set(Array.from({ length: 200 }, () => msgId()));
    expect(ids.size).toBe(200);
  });

  it('is prefixed for easy identification', () => {
    expect(msgId()).toMatch(/^msg-/);
  });
});

describe('nowTime', () => {
  it('returns a non-empty time string', () => {
    expect(typeof nowTime()).toBe('string');
    expect(nowTime().length).toBeGreaterThan(0);
  });
});
