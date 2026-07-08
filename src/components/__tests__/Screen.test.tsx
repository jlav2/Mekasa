import { render, screen } from '@testing-library/react-native';
import { StyleSheet, Text } from 'react-native';
import { Screen } from '../Screen';
import { colors } from '../../theme';

// @testing-library/react-native v14 removed the legacy UNSAFE_getByType /
// UNSAFE_getByProps queries (host-elements-only Test Renderer), so structural
// assertions here walk the raw screen.toJSON() host-node tree instead.
type JsonNode = {
  type: string;
  props: Record<string, any>;
  children: (JsonNode | string)[] | null;
};

function flattenStyle(style: unknown): Record<string, any> {
  return (StyleSheet.flatten(style as any) ?? {}) as Record<string, any>;
}

// Depth-first search for the first host node whose flattened style carries
// the given backgroundColor. The Screen component applies `bg` to exactly
// one View — either the outermost node (no keyboardAvoiding) or one level
// inside it (keyboardAvoiding wraps that View in a KeyboardAvoidingView).
function findByBackgroundColor(
  node: JsonNode | (JsonNode | string)[] | null,
  color: string,
): JsonNode | null {
  if (!node) return null;
  if (Array.isArray(node)) {
    for (const child of node) {
      const found = findByBackgroundColor(child as any, color);
      if (found) return found;
    }
    return null;
  }
  if (typeof node === 'string') return null;
  if (flattenStyle(node.props?.style).backgroundColor === color) return node;
  return findByBackgroundColor(node.children, color);
}

function containsType(node: JsonNode | (JsonNode | string)[] | null, type: string): boolean {
  if (!node) return false;
  if (Array.isArray(node)) return node.some((child) => containsType(child as any, type));
  if (typeof node === 'string') return false;
  if (node.type === type) return true;
  return containsType(node.children, type);
}

describe('Screen', () => {
  it('renders its children', async () => {
    await render(
      <Screen>
        <Text>שלום</Text>
      </Screen>,
    );
    expect(screen.getByText('שלום')).toBeTruthy();
  });

  it('renders a plain View container (no ScrollView) when scroll is false', async () => {
    await render(
      <Screen scroll={false}>
        <Text>תוכן</Text>
      </Screen>,
    );
    const tree = screen.toJSON() as unknown as JsonNode;
    expect(containsType(tree, 'RCTScrollView')).toBe(false);
    expect(screen.getByText('תוכן')).toBeTruthy();
  });

  it('renders a ScrollView container when scroll is true', async () => {
    await render(
      <Screen scroll>
        <Text>תוכן גלילה</Text>
      </Screen>,
    );
    const tree = screen.toJSON() as unknown as JsonNode;
    expect(containsType(tree, 'RCTScrollView')).toBe(true);
    // children still render, nested inside the scroll container
    expect(screen.getByText('תוכן גלילה')).toBeTruthy();
  });

  it('applies horizontal padding by default (padded=true)', async () => {
    await render(
      <Screen>
        <Text>ריפוד</Text>
      </Screen>,
    );
    const tree = screen.toJSON() as unknown as JsonNode;
    const bgNode = findByBackgroundColor(tree, colors.sandBg);
    expect(bgNode).toBeTruthy();
    expect(flattenStyle(bgNode!.props.style).paddingHorizontal).toBe(22);
  });

  it('removes horizontal padding when padded=false', async () => {
    await render(
      <Screen padded={false}>
        <Text>בלי ריפוד</Text>
      </Screen>,
    );
    const tree = screen.toJSON() as unknown as JsonNode;
    const bgNode = findByBackgroundColor(tree, colors.sandBg);
    expect(bgNode).toBeTruthy();
    expect(flattenStyle(bgNode!.props.style).paddingHorizontal).toBe(0);
  });

  it('sets the background color from the bg prop', async () => {
    await render(
      <Screen bg="#123456">
        <Text>רקע</Text>
      </Screen>,
    );
    const tree = screen.toJSON() as unknown as JsonNode;
    expect(findByBackgroundColor(tree, '#123456')).toBeTruthy();
  });

  it('does not wrap content in an extra KeyboardAvoidingView layer by default', async () => {
    await render(
      <Screen>
        <Text>ללא מקלדת</Text>
      </Screen>,
    );
    const tree = screen.toJSON() as unknown as JsonNode;
    // With keyboardAvoiding=false, the background View IS the root node.
    expect(flattenStyle(tree.props.style).backgroundColor).toBe(colors.sandBg);
    expect(screen.getByText('ללא מקלדת')).toBeTruthy();
  });

  it('wraps content in a KeyboardAvoidingView layer when keyboardAvoiding is true', async () => {
    await render(
      <Screen keyboardAvoiding>
        <Text>עם מקלדת</Text>
      </Screen>,
    );
    const tree = screen.toJSON() as unknown as JsonNode;
    // The root is now the KeyboardAvoidingView's host node, which does not
    // itself carry the screen background — that lives one level deeper, on
    // the wrapped View — proving an extra layer was inserted.
    expect(flattenStyle(tree.props.style).backgroundColor).toBeUndefined();
    expect(findByBackgroundColor(tree, colors.sandBg)).toBeTruthy();
    // Content is still reachable/rendered through the extra wrapper.
    expect(screen.getByText('עם מקלדת')).toBeTruthy();
  });
});
