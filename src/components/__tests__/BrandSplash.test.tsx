import { render, screen } from '@testing-library/react-native';
import { BrandSplash } from '../BrandSplash';

describe('BrandSplash', () => {
  it('renders the wordmark and tagline', async () => {
    await render(<BrandSplash />);
    expect(screen.getByText('מקאסה')).toBeTruthy();
    expect(screen.getByText('המעגל הבא שלך כבר על החול')).toBeTruthy();
  });

  it('renders three pulsing loading dots', async () => {
    await render(<BrandSplash />);
    // The three loading dots are the only 8x8 views, each carrying the pulse
    // animation. Walk the host tree and count them.
    const tree = screen.toJSON();
    let dots = 0;
    const walk = (node: any) => {
      if (!node || typeof node !== 'object') return;
      const style = Array.isArray(node.props?.style)
        ? Object.assign({}, ...node.props.style)
        : node.props?.style;
      if (style?.width === 8 && style?.height === 8 && style?.animationName) dots++;
      (Array.isArray(node) ? node : node.children ?? []).forEach(walk);
    };
    (Array.isArray(tree) ? tree : [tree]).forEach(walk);
    expect(dots).toBe(3);
  });
});
