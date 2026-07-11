import { render, screen } from '@testing-library/react-native';
import { InAppBanner } from '../InAppBanner';
import { useStore } from '../../store';
import type { Banner } from '../../store/slices/bannerSlice';

const mockPush = jest.fn();
jest.mock('expo-router', () => ({ useRouter: () => ({ push: mockPush }) }));

const banner = (overrides: Partial<Banner>): Banner => ({
  id: 'b1',
  kind: 'newCircle',
  title: 'כותרת',
  body: 'גוף',
  coalesced: 0,
  createdAt: 0,
  ...overrides,
});

beforeEach(() => {
  useStore.setState({ banner: null, bannerQueue: [], bannerContext: { pathname: '/' } });
  mockPush.mockClear();
});

describe('InAppBanner', () => {
  it('renders nothing when there is no banner', async () => {
    await render(<InAppBanner />);
    expect(screen.toJSON()).toBeNull();
  });

  it('renders a standard banner title + body', async () => {
    useStore.setState({ banner: banner({ kind: 'newCircle', title: 'נפתח מעגל בפרישמן', body: 'ווליבול · בינונית', circleId: 'c1' }) });
    await render(<InAppBanner />);
    expect(screen.getByText('נפתח מעגל בפרישמן')).toBeTruthy();
    expect(screen.getByText('ווליבול · בינונית')).toBeTruthy();
  });

  it('renders the inline "תפוס" CTA for a claim banner', async () => {
    useStore.setState({ banner: banner({ id: 'b2', kind: 'claim', title: 'התפנה מקום', body: 'עד 9:46', circleId: 'c1', expiresAt: Date.now() + 300000 }) });
    await render(<InAppBanner />);
    expect(screen.getByText('תפוס')).toBeTruthy();
  });

  it('coalesced chat title shows the sender + count', async () => {
    useStore.setState({ banner: banner({ id: 'b3', kind: 'chat', title: 'עומר · פרישמן', body: 'מביא רשת', circleId: 'c1', senderName: 'עומר', coalesced: 2 }) });
    await render(<InAppBanner />);
    expect(screen.getByText('עומר +2 הודעות')).toBeTruthy();
  });

  it('renders inline אשר/דחה for a host request', async () => {
    useStore.setState({ banner: banner({ id: 'b4', kind: 'hostRequest', title: 'דניאל רוצה להצטרף', body: 'נשאר מקום', circleId: 'c1', requestId: 'r1' }) });
    await render(<InAppBanner />);
    expect(screen.getByText('אשר')).toBeTruthy();
    expect(screen.getByText('דחה')).toBeTruthy();
  });
});
