import { render, screen } from '@testing-library/react-native';
import {
  Icon,
  SportIcon,
  AppleGlyph,
  GoogleGlyph,
  FacebookGlyph,
  WhatsappGlyph,
} from '../icons';

// Mostly static SVG glyphs — this is lean smoke coverage: confirm each
// branch of the name/sport switch mounts without crashing, not pixel-level
// path assertions (those would just restate the source).
describe('Icon', () => {
  it.each([
    'chevronRight',
    'close',
    'x',
    'checkCircle',
    'bell',
    'star',
    'ball',
    'settings',
  ] as const)('renders without crashing for name=%s', async (name) => {
    await render(<Icon name={name} />);
    expect(screen.toJSON()).toBeTruthy();
  });

  it('falls through to the default glyph for an unrecognized name', async () => {
    // Cast past the IconName union to exercise the switch's default branch.
    await render(<Icon name={'not-a-real-icon' as any} />);
    expect(screen.toJSON()).toBeTruthy();
  });

  it('applies a custom size to the underlying svg', async () => {
    await render(<Icon name="star" size={40} />);
    const svg = screen.toJSON();
    expect(svg?.props.width).toBe(40);
    expect(svg?.props.height).toBe(40);
  });
});

describe('SportIcon', () => {
  it.each(['footvolley', 'altinha', 'volleyball'] as const)(
    'renders without crashing for sport=%s',
    async (sport) => {
      await render(<SportIcon sport={sport} />);
      expect(screen.toJSON()).toBeTruthy();
    }
  );
});

describe('brand glyphs', () => {
  it('renders AppleGlyph without crashing', async () => {
    await render(<AppleGlyph />);
    expect(screen.toJSON()).toBeTruthy();
  });

  it('renders GoogleGlyph without crashing', async () => {
    await render(<GoogleGlyph />);
    expect(screen.toJSON()).toBeTruthy();
  });

  it('renders FacebookGlyph without crashing', async () => {
    await render(<FacebookGlyph />);
    expect(screen.toJSON()).toBeTruthy();
  });

  it('renders WhatsappGlyph without crashing', async () => {
    await render(<WhatsappGlyph />);
    expect(screen.toJSON()).toBeTruthy();
  });
});
