import { CIRCLES } from '../../data/fixtures';
import { BEACH_OPTIONS, distanceLabelFrom } from '../../data/beaches';
import { pushCreateCircle, pushJoin, pushLeave } from '../../data/backend';
import type { ChatMessage, Circle, Player } from '../../data/models';
import { nowTime } from '../helpers';
import type { AppState, Set, Get } from '../types';

type CirclesSlice = Pick<
  AppState,
  'circles' | 'draftBeach' | 'circleById' | 'isJoined' | 'setDraftBeach' | 'createCircle' | 'joinCircle' | 'leaveCircle'
>;

export const createCirclesSlice = (set: Set, get: Get): CirclesSlice => ({
  circles: CIRCLES,
  draftBeach: BEACH_OPTIONS[0],

  circleById: (id) => get().circles.find((c) => c.id === id),
  isJoined: (circleId) => {
    const { user } = get();
    return !!get()
      .circleById(circleId)
      ?.players.some((p) => p.id === user.id);
  },

  setDraftBeach: (beach) => set({ draftBeach: beach }),

  createCircle: (input) => {
    const { user, draftBeach } = get();
    const id = `c-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`;
    const host: Player = {
      id: user.id,
      name: user.name,
      avatarInitial: user.avatarInitial,
      avatarColor: user.avatarColor,
    };
    const circle: Circle = {
      id,
      sport: input.sport,
      sportLabel: input.sportLabel,
      beachId: draftBeach.id,
      beachName: draftBeach.name,
      court: draftBeach.court,
      levelLabel: input.levelLabel,
      capacity: input.missing + 1, // host takes the first slot
      players: [host],
      waitlist: [],
      state: input.scheduled ? 'scheduled' : 'missing',
      isOpen: input.isOpen,
      hostId: user.id,
      hostName: user.name,
      startLabel: input.startLabel,
      distanceLabel: distanceLabelFrom(draftBeach.lat, draftBeach.lng),
      // nudge off the beach anchor so markers don't stack on existing circles
      // (random, not Date.now()-derived — same-tick creates would collide)
      lat: draftBeach.lat + (Math.random() - 0.5) * 0.0016,
      lng: draftBeach.lng + (Math.random() - 0.5) * 0.0012,
    };
    const time = nowTime();
    const opening: ChatMessage = {
      id: `evt-open-${id}`,
      circleId: id,
      kind: 'join',
      text: `${user.name} פתח את המעגל · ${time}`,
      time,
    };
    set((s) => ({ circles: [...s.circles, circle], messages: [...s.messages, opening] }));
    if (get().live) {
      pushCreateCircle(circle, host, [opening]).then((ok) => {
        if (ok) return;
        // Persist failed — drop the optimistic circle (its /c/[id] route falls
        // back to the in-app not-found screen if the user already navigated).
        set((s) => ({
          circles: s.circles.filter((c) => c.id !== id),
          messages: s.messages.filter((m) => m.circleId !== id),
        }));
      });
    }
    return id;
  },

  joinCircle: (circleId) => {
    const { user, circles, messages } = get();
    const circle = circles.find((c) => c.id === circleId);
    if (!circle) return;
    if (circle.players.some((p) => p.id === user.id)) return; // already in
    if (circle.players.length >= circle.capacity) return; // full → waitlist flow (8c)

    const me: Player = {
      id: user.id,
      name: user.name,
      avatarInitial: user.avatarInitial,
      avatarColor: user.avatarColor,
    };
    const players = [...circle.players, me];
    const nowFull = players.length >= circle.capacity;
    const updated: Circle = {
      ...circle,
      players,
      state: nowFull ? 'live' : circle.state,
    };

    const time = nowTime();
    const events: ChatMessage[] = [
      {
        id: `evt-join-${circleId}-${user.id}`,
        circleId,
        kind: 'join',
        text: `${user.name} הצטרף למעגל · ${time}`,
        time,
      },
    ];
    if (nowFull) {
      events.push({
        // include the joiner id so a refill after someone leaves isn't
        // clobbered by the previous fill's message on realtime upsert
        id: `evt-full-${circleId}-${user.id}`,
        circleId,
        kind: 'milestone',
        text: `המעגל התמלא — ${players.length}/${circle.capacity}. משחקים!`,
        time,
      });
    }

    set({
      circles: circles.map((c) => (c.id === circleId ? updated : c)),
      messages: [...messages, ...events],
    });
    if (get().live) {
      pushJoin(circle, me, events).then((ok) => {
        if (ok) return;
        // DB rejected the join (capacity trigger lost a race) — undo the
        // optimistic add so local state doesn't stay overfull/live.
        const eventIds = new Set(events.map((e) => e.id));
        set((s) => ({
          circles: s.circles.map((c) =>
            c.id === circleId
              ? { ...c, players: c.players.filter((p) => p.id !== me.id), state: circle.state }
              : c,
          ),
          messages: s.messages.filter((m) => !eventIds.has(m.id)),
        }));
      });
    }
  },

  leaveCircle: (circleId) => {
    const { user, circles } = get();
    const circle = circles.find((c) => c.id === circleId);
    if (!circle || !circle.players.some((p) => p.id === user.id)) return;
    const players = circle.players.filter((p) => p.id !== user.id);
    // leaving reopens a circle that was full (mirrors the DB trigger)
    const state = circle.state === 'live' && players.length < circle.capacity ? 'missing' : circle.state;
    set({
      circles: circles.map((c) => (c.id === circleId ? { ...c, players, state } : c)),
    });
    if (get().live) pushLeave(circleId, user.id);
  },
});
