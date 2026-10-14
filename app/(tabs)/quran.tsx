import { useCallback, useEffect, useRef, useState } from 'react';
import { FlatList, Pressable, View } from 'react-native';
import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import { Button, Card, EmptyState, ErrorState, Label, LoadingState, Row, Screen, TextInput, colors } from '../../src/components/ui';
import { getSurah, getSurahs } from '../../src/services/quran';
import { useAudio } from '../../src/hooks/useAudio';
import type { Ayah, Surah } from '../../src/lib/models';
import { owned, useApp } from '../../src/store/app';
import { useLanguage } from '../../src/lib/i18n';
export default function Quran() {
  const { t } = useLanguage(); const params = useLocalSearchParams<{ surah?: string; ayah?: string }>();
  const [surahs, setSurahs] = useState<Surah[]>([]); const [selected, setSelected] = useState<number | null>(null);
  const [ayahs, setAyahs] = useState<Ayah[]>([]); const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false); const [error, setError] = useState(''); const [isCached, setCached] = useState(false);
  const [jump, setJump] = useState(''); const [targetAyah, setTargetAyah] = useState(1); const [revision, setRevision] = useState(0);
  const list = useRef<FlatList<Ayah>>(null); const requestToken = useRef(0);
  const records = useApp((s) => s.records); const put = useApp((s) => s.put); const remove = useApp((s) => s.remove); const owner = useApp((s) => s.owner);
  const audio = useAudio(); const stopAudio = audio.stop;
  // A stable callback ensures the player stops on tab navigation, not each render.
  const stopRef = useRef(stopAudio); stopRef.current = stopAudio;
  useFocusEffect(useCallback(() => () => { void stopRef.current(); }, []));
  useEffect(() => { if (params.surah && Number(params.surah) >= 1 && Number(params.surah) <= 114) { setSelected(Number(params.surah)); setTargetAyah(Math.max(1, Number(params.ayah) || 1)); } }, [params.surah, params.ayah]);
  useEffect(() => {
    const token = ++requestToken.current; setLoading(true); setError('');
    const request = selected ? getSurah(selected) : getSurahs();
    void request.then((result) => {
      if (token !== requestToken.current) return;
      if (selected) setAyahs(result.data as Ayah[]); else setSurahs(result.data as Surah[]);
      setCached(result.cached);
    }).catch((e: unknown) => { if (token === requestToken.current) setError(e instanceof Error ? e.message : t('Could not load Qur’an.', 'تعذّر تحميل القرآن.')); }).finally(() => { if (token === requestToken.current) setLoading(false); });
    return () => { requestToken.current = token + 1; };
  // Language changes do not refetch the text or recitation.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected, revision]);
  useEffect(() => {
    if (!selected || loading || !ayahs.length) return;
    const index = Math.min(ayahs.length - 1, Math.max(0, targetAyah - 1));
    const timer = setTimeout(() => list.current?.scrollToIndex({ index, animated: false, viewPosition: 0 }), 200);
    return () => clearTimeout(timer);
  }, [selected, ayahs, loading, targetAyah]);
  function markRead(ayah: number) {
    if (!selected) return;
    const existing = records.reading_progress[0];
    put('reading_progress', { ...existing ?? owned(), surah: selected, ayah, updated_at: new Date().toISOString() });
  }
  function bookmark(ayah: number) {
    if (!selected) return;
    const existing = records.quran_bookmarks.find((b) => b.surah === selected && b.ayah === ayah);
    if (existing) remove('quran_bookmarks', existing.id); else put('quran_bookmarks', { ...owned(), surah: selected, ayah });
  }
  const currentSurah = surahs.find((s) => s.number === selected); const progress = records.reading_progress[0];
  const metadata = <><Label muted size={12}>{t('Arabic: Uthmani · English: Saheeh International · Reciter: Mishary Alafasy. Provider: AlQuran Cloud.', 'العربية: عثماني · الإنجليزية: صحيح إنترناشيونال · القارئ: مشاري العفاسي. المزوّد: AlQuran Cloud.')}</Label>{isCached && <Label gold>{t('Offline copy · previously cached text', 'نسخة غير متصلة · نص محفوظ سابقًا')}</Label>}{error && <ErrorState message={error} retry={() => setRevision((n) => n + 1)} />}{audio.error && <ErrorState message={audio.error} />}</>;
  if (selected) return <View style={{ flex: 1, backgroundColor: colors.canvas }}><FlatList ref={list} data={loading || error ? [] : ayahs} keyExtractor={(a) => `${selected}:${a.number}`} contentContainerStyle={{ padding: 24, paddingTop: 50, gap: 14, maxWidth: 1000, width: '100%', alignSelf: 'center' }} onScrollToIndexFailed={({ index, averageItemLength }) => { list.current?.scrollToOffset({ offset: index * averageItemLength, animated: false }); setTimeout(() => list.current?.scrollToIndex({ index, animated: false }), 400); }} ListHeaderComponent={<View style={{ gap: 14 }}><Button title={t('← Surah index', 'فهرس السور →')} variant="secondary" onPress={() => { void audio.stop(); setSelected(null); setAyahs([]); }} /><Label size={30}>{currentSurah?.englishName ?? t(`Surah ${selected}`, `سورة ${selected}`)}</Label>{metadata}<Row><View style={{ flex: 1 }}><TextInput label={t('Go to ayah', 'انتقل إلى الآية')} value={jump} onChangeText={setJump} keyboardType="number-pad" /></View><Button title={t('Go', 'انتقل')} onPress={() => { const number = Number(jump); if (!Number.isInteger(number) || number < 1 || number > ayahs.length) { setError(t('Enter a valid ayah number.', 'أدخل رقم آية صالحًا.')); return; } setError(''); setTargetAyah(number); }} /></Row><Label muted>{t('Mark an ayah read to save your last-read position.', 'سجّل قراءة الآية لحفظ موضعك الأخير.')}</Label>{loading && <LoadingState />}</View>} renderItem={({ item }) => { const saved = records.quran_bookmarks.some((b) => b.surah === selected && b.ayah === item.numberInSurah); return <Card><Label gold size={12}>{selected}:{item.numberInSurah}</Label><Label size={28} style={{ writingDirection: 'rtl', textAlign: 'right', lineHeight: 52 }}>{item.arabic}</Label><Label style={{ writingDirection: 'ltr', textAlign: 'left' }}>{item.english}</Label><Row style={{ flexWrap: 'wrap' }}><Button title={audio.playing === item.number ? t('Stop', 'إيقاف') : t('Play', 'تشغيل')} loading={audio.loading} variant="secondary" onPress={() => { void audio.play(item.number, item.audio); }} icon="play-outline" /><Button title={saved ? t('Bookmarked ✓', 'محفوظة ✓') : t('Bookmark', 'احفظ')} variant="ghost" onPress={() => bookmark(item.numberInSurah)} /><Button title={progress?.surah === selected && progress.ayah === item.numberInSurah ? t('Last read ✓', 'آخر قراءة ✓') : t('Mark read', 'سجّل القراءة')} variant="ghost" onPress={() => markRead(item.numberInSurah)} /></Row></Card>; }} ListFooterComponent={<View style={{ height: 32 }} />} /></View>;
  return <Screen title={t('Words for the heart.', 'كلمات للقلب.')} subtitle={t('QUR’AN · READ WITH PRESENCE', 'القرآن · اقرأ بقلب حاضر')}>
    {metadata}
    {progress && <Button title={t(`Continue reading · ${progress.surah}:${progress.ayah}`, `تابع القراءة · ${progress.surah}:${progress.ayah}`)} onPress={() => { setSelected(progress.surah); setTargetAyah(progress.ayah); }} />}
    {!!records.quran_bookmarks.length && <Card><Label gold>{t('Your bookmarks', 'آياتك المحفوظة')}</Label><Row style={{ flexWrap: 'wrap' }}>{records.quran_bookmarks.map((b) => <Button key={`${owner}:${b.id}`} title={`${b.surah}:${b.ayah}`} variant="secondary" onPress={() => { setSelected(b.surah); setTargetAyah(b.ayah); }} />)}</Row></Card>}
    <TextInput label={t('Find a surah', 'ابحث عن سورة')} placeholder={t('Name or number', 'الاسم أو الرقم')} value={query} onChangeText={setQuery} />
    {loading ? <LoadingState /> : <>{surahs.filter((s) => `${s.number} ${s.name} ${s.englishName} ${s.englishNameTranslation}`.toLowerCase().includes(query.toLowerCase())).map((s) => <Pressable key={s.number} accessibilityRole="button" accessibilityLabel={`${s.number}. ${s.englishName}`} onPress={() => { setSelected(s.number); setTargetAyah(1); }}><Card><Row><Label gold size={18}>{String(s.number).padStart(2, '0')}</Label><View style={{ flex: 1 }}><Label size={19}>{s.englishName}</Label><Label muted size={12}>{s.englishNameTranslation} · {s.numberOfAyahs} {t('ayahs', 'آيات')}</Label></View><Label size={25} style={{ writingDirection: 'rtl' }}>{s.name}</Label></Row></Card></Pressable>)}{!error && !surahs.some((s) => `${s.number} ${s.name} ${s.englishName} ${s.englishNameTranslation}`.toLowerCase().includes(query.toLowerCase())) && <EmptyState title={t('No matching surahs', 'لا توجد سور مطابقة')} message={t('Try another name or number.', 'جرّب اسمًا أو رقمًا آخر.')} />}</>}
  </Screen>;
}
