import { useStore } from '../index';
import { isSuppressed, type Banner } from '../slices/bannerSlice';

const resetBanners = () =>
  useStore.setState({ banner: null, bannerQueue: [], bannerContext: { pathname: '/' } });

beforeEach(resetBanners);

describe('isSuppressed (matrix #11d)', () => {
  it('drops a chat banner while inside that same chat', () => {
    expect(isSuppressed({ kind: 'chat', circleId: 'c1' }, { pathname: '/chat', circleId: 'c1' })).toBe(true);
  });
  it('allows a chat banner for a different circle', () => {
    expect(isSuppressed({ kind: 'chat', circleId: 'c2' }, { pathname: '/chat', circleId: 'c1' })).toBe(false);
  });
  it('drops a newCircle banner while viewing that circle (/c/[id])', () => {
    expect(isSuppressed({ kind: 'newCircle', circleId: 'c1' }, { pathname: '/c/c1', circleId: 'c1' })).toBe(true);
  });
  it('drops any info banner during a live game', () => {
    expect(isSuppressed({ kind: 'chat', circleId: 'c9' }, { pathname: '/x', liveGameActive: true })).toBe(true);
  });
  it('drops the claim banner on the waitlist/claim screen', () => {
    expect(isSuppressed({ kind: 'claim', circleId: 'c1' }, { pathname: '/circle-waitlist' })).toBe(true);
  });
  it('drops the tournament banner on the bracket/tournament screen', () => {
    expect(isSuppressed({ kind: 'tournament' }, { pathname: '/tournament' })).toBe(true);
  });
});

describe('banner slice', () => {
  it('shows a banner immediately on an empty stage', () => {
    useStore.getState().showBanner({ kind: 'newCircle', title: 't', body: 'b', circleId: 'c1' });
    expect(useStore.getState().banner?.kind).toBe('newCircle');
  });

  it('respects suppression from the current context', () => {
    useStore.getState().setBannerContext({ pathname: '/c/c1', circleId: 'c1' });
    useStore.getState().showBanner({ kind: 'newCircle', title: 't', body: 'b', circleId: 'c1' });
    expect(useStore.getState().banner).toBeNull();
  });

  it('coalesces repeat chats from the same sender instead of re-showing', () => {
    useStore.getState().showBanner({ kind: 'chat', title: 'a', body: 'm1', circleId: 'c1', senderName: 'עומר' });
    useStore.getState().showBanner({ kind: 'chat', title: 'a', body: 'm2', circleId: 'c1', senderName: 'עומר' });
    expect(useStore.getState().banner?.coalesced).toBe(1);
    expect(useStore.getState().banner?.body).toBe('m2');
  });

  it('never displaces a visible claim — others queue behind it', () => {
    useStore.getState().showBanner({ kind: 'claim', title: 'c', body: 'b', circleId: 'c1', expiresAt: Date.now() + 300000 });
    useStore.getState().showBanner({ kind: 'newCircle', title: 'n', body: 'b', circleId: 'c2' });
    expect(useStore.getState().banner?.kind).toBe('claim');
    expect(useStore.getState().bannerQueue).toHaveLength(1);
  });

  it('dismiss promotes the next queued banner', () => {
    useStore.getState().showBanner({ kind: 'claim', title: 'c', body: 'b', circleId: 'c1', expiresAt: Date.now() + 300000 });
    useStore.getState().showBanner({ kind: 'newCircle', title: 'n', body: 'b', circleId: 'c2' });
    useStore.getState().dismissBanner();
    expect(useStore.getState().banner?.kind).toBe('newCircle');
    expect(useStore.getState().bannerQueue).toHaveLength(0);
  });

  it('caps the queue behind a claim at 2', () => {
    const now = Date.now();
    useStore.getState().showBanner({ kind: 'claim', title: 'c', body: 'b', circleId: 'c1', expiresAt: now + 300000 });
    useStore.getState().showBanner({ kind: 'newCircle', title: 'n1', body: 'b', circleId: 'c2' });
    useStore.getState().showBanner({ kind: 'startingSoon', title: 'n2', body: 'b', circleId: 'c3' });
    useStore.getState().showBanner({ kind: 'tournament', title: 'n3', body: 'b' });
    expect(useStore.getState().banner?.kind).toBe('claim');
    expect(useStore.getState().bannerQueue.length).toBeLessThanOrEqual(2);
  });

  it('a non-claim banner is pushed out by a newer one', () => {
    useStore.getState().showBanner({ kind: 'newCircle', title: 'first', body: 'b', circleId: 'c1' });
    useStore.getState().showBanner({ kind: 'startingSoon', title: 'second', body: 'b', circleId: 'c2' });
    expect(useStore.getState().banner?.title).toBe('second');
    expect(useStore.getState().bannerQueue).toHaveLength(0);
  });
});
