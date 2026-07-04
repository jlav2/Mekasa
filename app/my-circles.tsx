import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import Svg, { Circle, Path } from 'react-native-svg';
import {
  Screen,
  Txt,
  Card,
  Badge,
  ProBadge,
  Button,
  SegmentedControl,
  StatusDot,
  Avatar,
  AvatarStack,
  SandRing,
  Icon,
  TabBar,
} from '../src/components';
import { colors, fonts, shadows } from '../src/theme';

export default function MyCircles() {
  const router = useRouter();
  const [tab, setTab] = useState(0);
  const onTab = (i: number) => {
    if (i === 1) router.replace('/recurring');
    else if (i === 2) router.replace('/history');
    else setTab(0);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.sandBg }}>
      <Screen scroll contentStyle={{ paddingBottom: 120, paddingTop: 24 }}>
        <Txt style={{ fontFamily: fonts.displayBold, fontSize: 56, lineHeight: 56, color: colors.petrol }}>
          המעגלים שלי
        </Txt>
        <SegmentedControl
          options={['קרובים', 'קבועים', 'היסטוריה']}
          value={tab}
          onChange={onTab}
          activeColor={colors.petrol}
          style={{ marginTop: 14 }}
        />

        <View style={{ gap: 10, marginTop: 16 }}>
          {/* live now */}
          <Card petrol floating style={{ overflow: 'hidden' }}>
            <SandRing size={190} color="#fff" strokeWidth={2} variant={1} rotate={0} style={{ position: 'absolute', left: -55, top: -40, opacity: 0.14 }} />
            <View style={{ flexDirection: 'row-reverse', alignItems: 'center' }}>
              <View style={styles.liveBadge}>
                <StatusDot color="#fff" size={7} />
                <Txt style={{ color: '#fff', fontSize: 11.5, fontFamily: fonts.extrabold }}>משחק חי — אתה בפנים</Txt>
              </View>
              <Txt style={{ marginLeft: 'auto', fontSize: 12, color: 'rgba(255,255,255,.6)', fontFamily: fonts.medium }}>התחיל 17:40</Txt>
            </View>
            <Txt style={{ fontFamily: fonts.displayBold, fontSize: 36, lineHeight: 36, color: '#fff', marginTop: 10 }}>
              פוצ'יוולי · חוף פרישמן
            </Txt>
            <View style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: 12, marginTop: 10 }}>
              <AvatarStack
                size={32}
                people={[
                  { letter: 'ע', color: colors.sunset },
                  { letter: 'ד', color: colors.live },
                  { letter: 'נ', color: colors.amber },
                  { letter: 'ג', color: colors.muted },
                ]}
              />
              <Txt style={{ fontSize: 12.5, color: 'rgba(255,255,255,.7)', fontFamily: fonts.medium }}>4/4 · מגרש 2</Txt>
            </View>
            <View style={{ flexDirection: 'row-reverse', gap: 8, marginTop: 14 }}>
              <Button label="פתח צ'אט" size="sm" style={{ flex: 1, height: 42, borderRadius: 21 }} onPress={() => router.push('/chat')} />
              <Button label="ניווט" size="sm" variant="ghost" style={{ height: 42, borderRadius: 21, backgroundColor: 'rgba(255,255,255,.14)', paddingHorizontal: 18 }} fontSize={14} />
            </View>
          </Card>

          {/* upcoming — tournament registered */}
          <UpcomingRow
            ringColor={colors.petrol}
            ringRotate={-70}
            center={<Icon name="flag" size={14} color={colors.sandGlow} />}
            centerBg={colors.petrol}
            title="טורניר פוצ'יוולי · חוף הילטון"
            meta="מחר, שבת 9:00 · רשום עם דניאל · 8 קבוצות"
            badge={<Badge label="רשום" bg={colors.chipBg} color={colors.petrol} />}
            onPress={() => router.push('/tournament')}
          />

          {/* own scheduled */}
          <UpcomingRow
            ringColor={colors.live}
            ringRotate={80}
            center={<Txt style={{ fontSize: 11, fontFamily: fonts.extrabold, color: '#fff' }}>2/6</Txt>}
            centerBg={colors.live}
            title="אלטינה · חוף גורדון"
            meta="ראשון 18:00 · פתחת את המעגל · חסרים 4"
            badge={<Badge label="שלך" bg="rgba(255,107,44,.12)" color={colors.sunsetDeep} />}
            onPress={() => router.push('/circle-detail')}
          />

          {/* recurring pro teaser */}
          <View style={styles.recurringCard}>
            <View style={styles.recurringIcon}>
              <Icon name="repeat" size={22} color={colors.sunset} />
            </View>
            <View style={{ flex: 1 }}>
              <Txt style={{ fontSize: 14, fontFamily: fonts.bold, color: colors.ink }}>הקבוע של שלישי — 18:30 בפרישמן</Txt>
              <Txt style={{ fontSize: 12.5, color: colors.muted, marginTop: 2, fontFamily: fonts.medium }}>מעגל קבוע שחוזר כל שבוע · נפתח אוטומטית</Txt>
            </View>
            <ProBadge size={10.5} />
          </View>

          {/* history teaser divider */}
          <View style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: 12, paddingVertical: 10, paddingHorizontal: 6, opacity: 0.7 }}>
            <View style={{ flex: 1, height: 1, backgroundColor: 'rgba(14,79,94,.14)' }} />
            <Txt style={{ fontSize: 12, fontFamily: fonts.bold, color: colors.faint }}>שיחקת 47 מעגלים · 12 חופים</Txt>
            <View style={{ flex: 1, height: 1, backgroundColor: 'rgba(14,79,94,.14)' }} />
          </View>
        </View>
      </Screen>
      <TabBar active="circles" />
    </View>
  );
}

function UpcomingRow({ ringColor, ringRotate, center, centerBg, title, meta, badge, onPress }: any) {
  return (
    <Card floating={false} pad={14} style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: 12 }}>
      <View style={{ width: 48, height: 48 }}>
        <SandRing size={48} color={ringColor} strokeWidth={4} variant={2} rotate={ringRotate} />
        <View style={{ position: 'absolute', top: 9, left: 9, right: 9, bottom: 9, borderRadius: 24, backgroundColor: centerBg, alignItems: 'center', justifyContent: 'center' }}>
          {center}
        </View>
      </View>
      <View style={{ flex: 1 }}>
        <Txt style={{ fontSize: 14.5, fontFamily: fonts.bold, color: colors.ink }}>{title}</Txt>
        <Txt style={{ fontSize: 12.5, color: colors.muted, marginTop: 2, fontFamily: fonts.medium }}>{meta}</Txt>
      </View>
      {badge}
    </Card>
  );
}

const styles = StyleSheet.create({
  liveBadge: { flexDirection: 'row-reverse', alignItems: 'center', gap: 6, backgroundColor: colors.live, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 4 },
  recurringCard: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 14,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: 'rgba(255,107,44,.45)',
  },
  recurringIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,107,44,.1)', alignItems: 'center', justifyContent: 'center' },
});
