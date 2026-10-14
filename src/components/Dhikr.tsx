import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { ADHKAR, DAILY_ADHKAR } from '../data/adhkar';
import { owned, useApp } from '../store/app';
import { localDate } from '../lib/dates';
import { useLanguage } from '../lib/i18n';
import { Button, Card, Label, ProgressRing, Row, SectionHeader } from './ui';
export function Dhikr() {
  const { t } = useLanguage(); const [phrase, setPhrase] = useState(0); const [period, setPeriod] = useState<'morning' | 'evening'>('morning');
  const records = useApp((s) => s.records); const put = useApp((s) => s.put); const date = localDate();
  const item = ADHKAR[phrase] ?? ADHKAR[0]!;
  const session = records.dhikr_sessions.find((s) => s.date === date && s.phrase === item.id); const count = session?.count ?? 0;
  const checklist = records.dhikr_sessions.find((s) => s.date === date && s.phrase === period);
  function setCount(value: number) { put('dhikr_sessions', { ...session ?? owned(), phrase: item.id, count: Math.max(0, value), date, checklist: [] }); }
  return <><SectionHeader title={t('A little remembrance', 'قليل من الذكر')} /><Card><Row style={{ flexWrap: 'wrap' }}>{ADHKAR.map((a, i) => <Button key={a.id} title={a.arabic} variant={phrase === i ? 'primary' : 'secondary'} onPress={() => setPhrase(i)} />)}</Row><Label size={30} style={{ writingDirection: 'rtl', textAlign: 'center' }}>{item.arabic}</Label><Label muted style={{ textAlign: 'center' }}>{item.meaning}</Label><Pressable accessibilityRole="button" accessibilityLabel={t(`Count dhikr, current count ${count}`, `عدّ الذكر، العدد الحالي ${count}`)} onPress={() => setCount(count + 1)} style={{ alignItems: 'center', padding: 20, borderRadius: 100, alignSelf: 'center', borderWidth: 1, borderColor: '#756746' }}><ProgressRing value={count} total={item.target} label={t('TAP TO COUNT', 'اضغط للعدّ')} /></Pressable><Label muted size={12}>{item.source}</Label><Row style={{ justifyContent: 'center' }}><Button title={t('Undo one', 'تراجع واحد')} variant="ghost" disabled={count === 0} onPress={() => setCount(count - 1)} /><Button title={t('Reset counter', 'تصفير العدّاد')} variant="ghost" onPress={() => setCount(0)} /></Row></Card>
    <Card><SectionHeader title={t('Morning & evening adhkar', 'أذكار الصباح والمساء')} /><Row><Button title={t('Morning', 'الصباح')} variant={period === 'morning' ? 'primary' : 'secondary'} onPress={() => setPeriod('morning')} /><Button title={t('Evening', 'المساء')} variant={period === 'evening' ? 'primary' : 'secondary'} onPress={() => setPeriod('evening')} /></Row><Label muted size={12}>{t('A small sourced starter checklist; not a complete adhkar collection.', 'قائمة بداية قصيرة موثّقة، وليست مجموعة أذكار كاملة.')}</Label>
      {DAILY_ADHKAR.map((a) => { const complete = checklist?.checklist.includes(a.id) ?? false; return <View key={a.id} style={{ gap: 8, paddingVertical: 12 }}><Button title={`${complete ? '✓ ' : '○ '}${a.arabic} × ${a.target}`} variant={complete ? 'primary' : 'secondary'} onPress={() => {
        const entries = checklist?.checklist ?? [];
        const next = complete ? entries.filter((e) => e !== a.id) : [...entries, a.id];
        put('dhikr_sessions', { ...checklist ?? owned(), phrase: period, date, count: next.length, checklist: next });
      }} /><Label muted size={12}>{a.source}</Label></View>; })}
    </Card></>;
}
