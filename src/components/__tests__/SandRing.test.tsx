import { render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';
import { SandRing, DecorRing, RingBadge } from '../SandRing';

describe('SandRing', () => {
  it('wraps children so they render inside the ring', async () => {
    await render(
      <SandRing>
        <Text>מרכז</Text>
      </SandRing>,
    );
    expect(screen.getByText('מרכז')).toBeTruthy();
  });

  it('applies the rotate prop (in degrees) to the inner rotating layer', async () => {
    const { toJSON } = await render(<SandRing rotate={45} />);
    const json = JSON.stringify(toJSON());
    expect(json).toContain('"rotate":"45deg"');
  });

  it('does not crash when variant is out of range of the dash-preset list (wraps via modulo)', async () => {
    // DASH_PRESETS has 5 entries; variant=12 should still resolve (12 % 5) without throwing.
    await expect(render(<SandRing variant={12} />)).resolves.toBeTruthy();
  });
});

describe('RingBadge', () => {
  it('renders children inside the center disc', async () => {
    await render(
      <RingBadge>
        <Text>3</Text>
      </RingBadge>,
    );
    expect(screen.getByText('3')).toBeTruthy();
  });

  it('passes the rotate prop through to the underlying ring', async () => {
    const { toJSON } = await render(<RingBadge rotate={90} />);
    expect(JSON.stringify(toJSON())).toContain('"rotate":"90deg"');
  });

  it('uses centerBg for the disc background when provided, falling back to color otherwise', async () => {
    const { toJSON: withCenterBg } = await render(<RingBadge color="#111111" centerBg="#222222" />);
    expect(JSON.stringify(withCenterBg())).toContain('"backgroundColor":"#222222"');
    expect(JSON.stringify(withCenterBg())).not.toContain('"backgroundColor":"#111111"');

    const { toJSON: withoutCenterBg } = await render(<RingBadge color="#333333" />);
    expect(JSON.stringify(withoutCenterBg())).toContain('"backgroundColor":"#333333"');
  });
});

describe('DecorRing', () => {
  it('renders, merging the absolute/opacity decor style with the caller-provided style', async () => {
    const { toJSON } = await render(<DecorRing style={{ left: -70, top: -40 }} opacity={0.2} />);
    const json = JSON.stringify(toJSON());
    expect(json).toContain('"position":"absolute"');
    expect(json).toContain('"opacity":0.2');
    expect(json).toContain('"left":-70');
    expect(json).toContain('"top":-40');
  });

  it('updates its output when the style prop actually changes value', async () => {
    const { rerender, toJSON } = await render(<DecorRing style={{ left: -70, top: -40 }} />);
    expect(JSON.stringify(toJSON())).toContain('"left":-70');

    await rerender(<DecorRing style={{ left: -10, top: 5 }} />);
    const updated = JSON.stringify(toJSON());
    expect(updated).toContain('"left":-10');
    expect(updated).toContain('"top":5');
    expect(updated).not.toContain('"left":-70');
  });

  it('produces identical output when re-rendered with a new style object that has the same values', async () => {
    const { rerender, toJSON } = await render(<DecorRing style={{ left: -70, top: -40 }} variant={2} rotate={12} />);
    const before = toJSON();

    // New object identity every time (as a real call site inlining a style literal would produce),
    // but structurally identical values -> the custom comparator should treat this as "equal".
    await rerender(<DecorRing style={{ left: -70, top: -40 }} variant={2} rotate={12} />);
    const after = toJSON();

    expect(after).toEqual(before);
  });

  it('re-renders when a scalar prop (e.g. variant) changes even if style stays the same', async () => {
    const sameStyle = { left: -70, top: -40 };
    const { rerender, toJSON } = await render(<DecorRing style={sameStyle} variant={1} rotate={0} />);
    const before = JSON.stringify(toJSON());

    await rerender(<DecorRing style={sameStyle} variant={3} rotate={0} />);
    const after = JSON.stringify(toJSON());

    expect(after).not.toEqual(before);
  });

  // The comparator is a plain function reachable via the memo() descriptor React produces
  // (memo(type, compare) => { $$typeof, type, compare }); calling it directly lets us pin
  // down the exact equality semantics without relying on render-count side channels.
  describe('custom style comparator', () => {
    const compare = (DecorRing as any).compare as (prev: any, next: any) => boolean;
    const baseProps = { size: 240, color: '#fff', opacity: 0.14, variant: 1, rotate: 0, strokeWidth: 2 };

    it('is exposed on the memo descriptor', () => {
      expect(typeof compare).toBe('function');
    });

    it('returns true (bail out / stay stable) for a new style object with identical values', () => {
      const prev = { ...baseProps, style: { left: -70, top: -40 } };
      const next = { ...baseProps, style: { left: -70, top: -40 } };
      expect(prev.style).not.toBe(next.style); // different reference
      expect(compare(prev, next)).toBe(true);
    });

    it('returns true when style is undefined on both sides', () => {
      const prev = { ...baseProps, style: undefined };
      const next = { ...baseProps, style: undefined };
      expect(compare(prev, next)).toBe(true);
    });

    it('returns false when style values actually differ', () => {
      const prev = { ...baseProps, style: { left: -70, top: -40 } };
      const next = { ...baseProps, style: { left: -10, top: -40 } };
      expect(compare(prev, next)).toBe(false);
    });

    it('returns false when any scalar prop differs, regardless of style', () => {
      const style = { left: -70, top: -40 };
      expect(compare({ ...baseProps, style }, { ...baseProps, style, variant: 2 })).toBe(false);
      expect(compare({ ...baseProps, style }, { ...baseProps, style, rotate: 5 })).toBe(false);
      expect(compare({ ...baseProps, style }, { ...baseProps, style, size: 100 })).toBe(false);
      expect(compare({ ...baseProps, style }, { ...baseProps, style, color: '#000' })).toBe(false);
      expect(compare({ ...baseProps, style }, { ...baseProps, style, opacity: 0.5 })).toBe(false);
      expect(compare({ ...baseProps, style }, { ...baseProps, style, strokeWidth: 9 })).toBe(false);
    });
  });
});
