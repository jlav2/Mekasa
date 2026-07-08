import { fireEvent, act } from '@testing-library/react-native';

// Verified fix (see git history / session notes): firing multiple bare
// fireEvent.changeText() calls back-to-back on separate controlled inputs
// leaves pending unflushed updates that corrupt a LATER async userEvent
// interaction in the same test — the resulting state update (e.g. an error
// set after an awaited store action) silently never commits, with no error
// surfaced beyond a stray "overlapping act() calls" warning. Wrapping each
// changeText in its own act() forces it to fully commit before the next one.
// Use this for every controlled TextInput/TextField fill in a screen test.
export async function fillField(element: any, text: string) {
  await act(async () => {
    fireEvent.changeText(element, text);
  });
}
