import { memo } from 'react';
import Svg, {
  Path,
  Circle,
  Line,
  Polyline,
  Rect,
  G,
} from 'react-native-svg';
import { colors } from '../theme';

// 24x24 grid line icons, stroke round-cap/round-join.
export type IconName =
  | 'chevronRight'
  | 'chevronLeft'
  | 'chevronDown'
  | 'close'
  | 'check'
  | 'checkCircle'
  | 'bell'
  | 'pin'
  | 'navigate'
  | 'share'
  | 'plus'
  | 'minus'
  | 'search'
  | 'edit'
  | 'users'
  | 'clock'
  | 'flag'
  | 'trophy'
  | 'chat'
  | 'send'
  | 'mic'
  | 'settings'
  | 'star'
  | 'calendar'
  | 'lock'
  | 'sun'
  | 'menu'
  | 'repeat'
  | 'ball'
  | 'link'
  | 'sliders'
  | 'x';

type IconProps = {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
  fill?: string;
};

function IconBase({
  name,
  size = 22,
  color = colors.ink,
  strokeWidth = 2,
  fill = 'none',
}: IconProps) {
  const common = {
    stroke: color,
    strokeWidth,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    fill,
  };
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {render(name, common, color)}
    </Svg>
  );
}

function render(name: IconName, c: any, color: string) {
  switch (name) {
    case 'chevronRight':
      return <Polyline points="9 6 15 12 9 18" {...c} />;
    case 'chevronLeft':
      return <Polyline points="15 6 9 12 15 18" {...c} />;
    case 'chevronDown':
      return <Polyline points="6 9 12 15 18 9" {...c} />;
    case 'close':
    case 'x':
      return (
        <>
          <Line x1="18" y1="6" x2="6" y2="18" {...c} />
          <Line x1="6" y1="6" x2="18" y2="18" {...c} />
        </>
      );
    case 'check':
      return <Polyline points="20 6 9 17 4 12" {...c} />;
    case 'checkCircle':
      return (
        <>
          <Circle cx="12" cy="12" r="9" {...c} />
          <Polyline points="16 9.5 10.5 15 8 12.5" {...c} />
        </>
      );
    case 'bell':
      return (
        <>
          <Path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" {...c} />
          <Path d="M13.7 21a2 2 0 0 1-3.4 0" {...c} />
        </>
      );
    case 'pin':
      return (
        <>
          <Path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" {...c} />
          <Circle cx="12" cy="10" r="3" {...c} />
        </>
      );
    case 'navigate':
      return <Polyline points="3 11 22 2 13 21 11 13 3 11" {...c} />;
    case 'share':
      return (
        <>
          <Circle cx="18" cy="5" r="3" {...c} />
          <Circle cx="6" cy="12" r="3" {...c} />
          <Circle cx="18" cy="19" r="3" {...c} />
          <Line x1="8.6" y1="13.5" x2="15.4" y2="17.5" {...c} />
          <Line x1="15.4" y1="6.5" x2="8.6" y2="10.5" {...c} />
        </>
      );
    case 'plus':
      return (
        <>
          <Line x1="12" y1="5" x2="12" y2="19" {...c} />
          <Line x1="5" y1="12" x2="19" y2="12" {...c} />
        </>
      );
    case 'minus':
      return <Line x1="5" y1="12" x2="19" y2="12" {...c} />;
    case 'search':
      return (
        <>
          <Circle cx="11" cy="11" r="7" {...c} />
          <Line x1="21" y1="21" x2="16.2" y2="16.2" {...c} />
        </>
      );
    case 'edit':
      return (
        <>
          <Path d="M12 20h9" {...c} />
          <Path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" {...c} />
        </>
      );
    case 'users':
      return (
        <>
          <Path d="M17 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" {...c} />
          <Circle cx="9.5" cy="7" r="4" {...c} />
          <Path d="M22 21v-2a4 4 0 0 0-3-3.87" {...c} />
          <Path d="M16 3.13a4 4 0 0 1 0 7.75" {...c} />
        </>
      );
    case 'clock':
      return (
        <>
          <Circle cx="12" cy="12" r="9" {...c} />
          <Polyline points="12 7 12 12 15.5 14" {...c} />
        </>
      );
    case 'flag':
      return (
        <>
          <Path d="M5 21V4M5 4h11l-2 4 2 4H5" {...c} />
        </>
      );
    case 'trophy':
      return (
        <>
          <Path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4Z" {...c} />
          <Path d="M17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3" {...c} />
        </>
      );
    case 'chat':
      return (
        <Path
          d="M21 11.5a8.5 8.5 0 0 1-11.7 7.9L3 21l1.6-6.3A8.5 8.5 0 1 1 21 11.5Z"
          {...c}
        />
      );
    case 'send':
      // RTL: arrow points left
      return (
        <>
          <Line x1="20" y1="12" x2="5" y2="12" {...c} />
          <Polyline points="12 5 5 12 12 19" {...c} />
        </>
      );
    case 'mic':
      return (
        <>
          <Rect x="9" y="3" width="6" height="11" rx="3" {...c} />
          <Path d="M5 11a7 7 0 0 0 14 0M12 18v3" {...c} />
        </>
      );
    case 'settings':
      return (
        <>
          <Circle cx="12" cy="12" r="3" {...c} />
          <Path
            d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1V21a2 2 0 0 1-4 0v-.1A1.6 1.6 0 0 0 7 19.4a1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0-1.1-2.7H1a2 2 0 0 1 0-4h.1A1.6 1.6 0 0 0 2.6 7a1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H7a1.6 1.6 0 0 0 1-1.5V1a2 2 0 0 1 4 0v.1a1.6 1.6 0 0 0 2.7 1.1l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V7a1.6 1.6 0 0 0 1.5 1H23a2 2 0 0 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1Z"
            {...c}
          />
        </>
      );
    case 'star':
      return (
        <Path
          d="M12 3l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 17.8 6.8 19.2l1-5.8L3.5 9.2l5.9-.9Z"
          {...c}
        />
      );
    case 'calendar':
      return (
        <>
          <Rect x="3" y="5" width="18" height="16" rx="2" {...c} />
          <Line x1="3" y1="9" x2="21" y2="9" {...c} />
          <Line x1="8" y1="3" x2="8" y2="6" {...c} />
          <Line x1="16" y1="3" x2="16" y2="6" {...c} />
        </>
      );
    case 'lock':
      return (
        <>
          <Rect x="4" y="10" width="16" height="11" rx="2.5" {...c} />
          <Path d="M8 10V7a4 4 0 0 1 8 0v3" {...c} />
        </>
      );
    case 'sun':
      return (
        <>
          <Circle cx="12" cy="12" r="4.5" {...c} />
          <Path
            d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4"
            {...c}
          />
        </>
      );
    case 'menu':
      return (
        <>
          <Line x1="3" y1="6" x2="21" y2="6" {...c} />
          <Line x1="3" y1="12" x2="21" y2="12" {...c} />
          <Line x1="3" y1="18" x2="21" y2="18" {...c} />
        </>
      );
    case 'repeat':
      return (
        <>
          <Polyline points="17 1 21 5 17 9" {...c} />
          <Path d="M3 11V9a4 4 0 0 1 4-4h14" {...c} />
          <Polyline points="7 23 3 19 7 15" {...c} />
          <Path d="M21 13v2a4 4 0 0 1-4 4H3" {...c} />
        </>
      );
    case 'link':
      return (
        <>
          <Path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1.5 1.5" {...c} />
          <Path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1.5-1.5" {...c} />
        </>
      );
    case 'sliders':
      return (
        <>
          <Line x1="4" y1="21" x2="4" y2="14" {...c} />
          <Line x1="4" y1="10" x2="4" y2="3" {...c} />
          <Line x1="12" y1="21" x2="12" y2="12" {...c} />
          <Line x1="12" y1="8" x2="12" y2="3" {...c} />
          <Line x1="20" y1="21" x2="20" y2="16" {...c} />
          <Line x1="20" y1="12" x2="20" y2="3" {...c} />
          <Line x1="1" y1="14" x2="7" y2="14" {...c} />
          <Line x1="9" y1="8" x2="15" y2="8" {...c} />
          <Line x1="17" y1="16" x2="23" y2="16" {...c} />
        </>
      );
    case 'ball':
      return (
        <>
          <Circle cx="12" cy="12" r="9" {...c} />
          <Path d="M12 3a9 9 0 0 0 0 18M3.5 9h17M3.5 15h17" {...c} />
        </>
      );
    default:
      return <Circle cx="12" cy="12" r="9" {...c} />;
  }
}

// Memoized: SVG elements are native views with no draw cache — skip
// reconciling the glyph tree when props are unchanged.
export const Icon = memo(IconBase);

// ---- Sport icons (line-art, per handoff) ----
function SportIconBase({
  sport,
  size = 26,
  color = colors.petrol,
  strokeWidth = 2,
}: {
  sport: 'footvolley' | 'altinha' | 'volleyball';
  size?: number;
  color?: string;
  strokeWidth?: number;
}) {
  const c = {
    stroke: color,
    strokeWidth,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    fill: 'none',
  };
  if (sport === 'footvolley') {
    // ball above a dashed sand line
    return (
      <Svg width={size} height={size} viewBox="0 0 32 32">
        <Circle cx="16" cy="12" r="6.5" {...c} />
        <Path d="M9.5 12h13M16 5.5v13" {...c} strokeWidth={strokeWidth * 0.8} />
        <Line
          x1="3"
          y1="26"
          x2="29"
          y2="26"
          {...c}
          strokeDasharray="3 3"
        />
      </Svg>
    );
  }
  if (sport === 'altinha') {
    // circle of 5 dots
    const pts = [0, 1, 2, 3, 4].map((i) => {
      const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
      return { x: 16 + Math.cos(a) * 10, y: 16 + Math.sin(a) * 10 };
    });
    return (
      <Svg width={size} height={size} viewBox="0 0 32 32">
        {pts.map((p, i) => (
          <Circle key={i} cx={p.x} cy={p.y} r="2.4" fill={color} />
        ))}
      </Svg>
    );
  }
  // volleyball — globe-seam circle
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32">
      <Circle cx="16" cy="16" r="12" {...c} />
      <Path
        d="M16 4c-5 4-5 20 0 24M16 4c5 4 5 20 0 24M4.5 12c6 2 17 2 23 0M4.5 20c6-2 17-2 23 0"
        {...c}
        strokeWidth={strokeWidth * 0.8}
      />
    </Svg>
  );
}

// ---- Brand SSO glyphs (simplified) ----
export function AppleGlyph({ size = 18, color = '#fff' }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        fill={color}
        d="M16.4 12.7c0-2.3 1.9-3.4 2-3.5-1.1-1.6-2.8-1.8-3.4-1.8-1.4-.1-2.8.9-3.5.9s-1.8-.8-3-.8c-1.5 0-3 .9-3.8 2.3-1.6 2.8-.4 7 1.2 9.3.8 1.1 1.7 2.4 2.9 2.3 1.2 0 1.6-.7 3-.7s1.8.7 3 .7 2-1.1 2.8-2.2c.9-1.3 1.2-2.5 1.3-2.6-.1 0-2.5-1-2.5-3.9ZM14.1 5.9c.6-.8 1.1-1.9 1-3-.9 0-2 .6-2.7 1.4-.6.7-1.1 1.8-1 2.9 1 .1 2-.5 2.7-1.3Z"
      />
    </Svg>
  );
}
export function GoogleGlyph({ size = 18 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        fill="#4285F4"
        d="M23 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.2a5.3 5.3 0 0 1-2.3 3.5v2.9h3.7c2.2-2 3.4-5 3.4-8.6Z"
      />
      <Path
        fill="#34A853"
        d="M12 24c3.1 0 5.7-1 7.6-2.8l-3.7-2.9c-1 .7-2.3 1.1-3.9 1.1-3 0-5.5-2-6.4-4.7H1.8v3C3.7 21.5 7.5 24 12 24Z"
      />
      <Path
        fill="#FBBC05"
        d="M5.6 14.7a7.2 7.2 0 0 1 0-4.6v-3H1.8a12 12 0 0 0 0 10.6l3.8-3Z"
      />
      <Path
        fill="#EA4335"
        d="M12 4.8c1.7 0 3.2.6 4.4 1.7l3.3-3.3C17.7 1.2 15.1 0 12 0 7.5 0 3.7 2.5 1.8 6.1l3.8 3C6.5 6.8 9 4.8 12 4.8Z"
      />
    </Svg>
  );
}
export function FacebookGlyph({ size = 18, color = '#fff' }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        fill={color}
        d="M14 8.5V6.8c0-.8.2-1.2 1.4-1.2H17V2.3c-.3 0-1.3-.1-2.4-.1-2.5 0-4.1 1.5-4.1 4.2v2.1H8v3.3h2.5V21H14v-9.2h2.5l.4-3.3H14Z"
      />
    </Svg>
  );
}
export function WhatsappGlyph({ size = 20, color = '#fff' }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        fill={color}
        d="M12 2a10 10 0 0 0-8.5 15.2L2 22l4.9-1.3A10 10 0 1 0 12 2Zm5.8 14.1c-.2.7-1.4 1.3-2 1.4-.5.1-1.1.1-1.8-.1-.4-.1-1-.3-1.7-.6-3-1.3-4.9-4.3-5-4.5-.2-.2-1.2-1.6-1.2-3s.7-2.1 1-2.4c.2-.3.5-.3.7-.3h.5c.2 0 .4-.1.7.5l.8 2c.1.2.1.4 0 .6l-.4.5c-.2.2-.4.4-.2.7.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.4 2.4 1.5.3.1.5.1.6-.1l.7-.9c.2-.3.4-.2.7-.1l2 .9c.3.1.5.2.5.4.1.2.1.9-.1 1.5Z"
      />
    </Svg>
  );
}

export const SportIcon = memo(SportIconBase);

export { Svg, Path, Circle, Line, Rect, Polyline, G };
