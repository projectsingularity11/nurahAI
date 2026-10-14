import { type ReactNode } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput as NativeInput, View, type TextInputProps, type ViewStyle, type StyleProp } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';
import { useLanguage } from '../lib/i18n';
import { useApp } from '../store/app';
import { syncAccount } from '../services/sync';
export const colors = { canvas: '#091815', surface: '#122621', gold: '#D6BE85', ink: '#F4F2EA', muted: '#A6B8AE', border: '#2B4137', error: '#F2A69B' };
export function Label({ children, muted = false, gold = false, size = 15, style }: { children: ReactNode; muted?: boolean; gold?: boolean; size?: number; style?: StyleProp<import('react-native').TextStyle> }) {
  const { rtl } = useLanguage();
  return <Text style={[{ color: gold ? colors.gold : muted ? colors.muted : colors.ink, fontSize: size, lineHeight: size * 1.6, textAlign: rtl ? 'right' : 'left', writingDirection: rtl ? 'rtl' : 'ltr' }, style]}>{children}</Text>;
}
export function Row({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const { rtl } = useLanguage();
  return <View style={[{ flexDirection: rtl ? 'row-reverse' : 'row', alignItems: 'center', gap: 12 }, style]}>{children}</View>;
}
export function Screen({ children, title, subtitle, action }: { children: ReactNode; title: string; subtitle?: string; action?: ReactNode }) {
  const { t, rtl } = useLanguage();
  const online = useApp((s) => s.online);
  const error = useApp((s) => s.syncError);
  const owner = useApp((s) => s.owner);
  return <SafeAreaView className="flex-1 bg-canvas" edges={['top', 'left', 'right']} style={{ direction: rtl ? 'rtl' : 'ltr' }}>
    <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: 24, paddingBottom: 48, width: '100%', maxWidth: 1050, alignSelf: 'center', gap: 22 }}>
      <Row style={{ justifyContent: 'space-between' }}><Row><View style={{ borderWidth: 1, borderColor: colors.gold, borderRadius: 14, padding: 8 }}><Ionicons name="moon-outline" color={colors.gold} size={22} /></View><Label size={19} style={{ letterSpacing: 4 }}>NURAH</Label></Row><Label muted size={11}>{t('A LITTLE CLOSER, EVERY DAY', 'أقرب، كل يوم')}</Label></Row>
      {!online && <Card><Label gold>{t('You’re offline. Changes are saved on this device; cached Qur’an text remains available.', 'أنت غير متصل. تُحفظ التغييرات على هذا الجهاز، ويمكن قراءة النص المخزّن.')}</Label></Card>}
      {error && <ErrorState message={error} retry={() => { void syncAccount(); }} />}
      <Row style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}><View style={{ flex: 1 }}><Label size={32} style={{ fontWeight: '600' }}>{title}</Label>{subtitle && <Label muted>{subtitle}</Label>}</View>{action}</Row>
      {owner === 'guest' && <Label muted size={12}>{t('Guest mode · saved on this device only', 'وضع الضيف · الحفظ على هذا الجهاز فقط')}</Label>}
      {children}
    </ScrollView>
  </SafeAreaView>;
}
export function Card({ children, style, accent = false }: { children: ReactNode; style?: StyleProp<ViewStyle>; accent?: boolean }) {
  return <View className="rounded-3xl bg-surface p-5" style={[{ borderWidth: 1, borderColor: accent ? '#756746' : colors.border, gap: 14 }, style]}>{children}</View>;
}
export function Button({ title, onPress, variant = 'primary', disabled = false, loading = false, icon }: { title: string; onPress: () => void; variant?: 'primary' | 'secondary' | 'ghost'; disabled?: boolean; loading?: boolean; icon?: keyof typeof Ionicons.glyphMap }) {
  const foreground = variant === 'primary' ? colors.canvas : colors.gold;
  return <Pressable accessibilityRole="button" accessibilityLabel={title} accessibilityState={{ disabled: disabled || loading, busy: loading }} disabled={disabled || loading} onPress={onPress} style={({ pressed }) => ({ paddingVertical: 13, paddingHorizontal: 18, minHeight: 48, borderRadius: 14, borderWidth: variant === 'secondary' ? 1 : 0, borderColor: colors.border, backgroundColor: variant === 'primary' ? colors.gold : variant === 'secondary' ? '#19372E' : 'transparent', opacity: disabled || loading ? 0.5 : pressed ? 0.75 : 1 })}>
    <Row style={{ justifyContent: 'center' }}>{loading ? <ActivityIndicator color={foreground} /> : icon && <Ionicons name={icon} size={18} color={foreground} />}<Text style={{ color: foreground, fontWeight: '600', fontSize: 14, textAlign: 'center' }}>{title}</Text></Row>
  </Pressable>;
}
export function TextInput({ label, ...props }: TextInputProps & { label: string }) {
  const { rtl } = useLanguage();
  return <View style={{ gap: 6 }}><Label muted size={13}>{label}</Label><NativeInput {...props} accessibilityLabel={label} placeholderTextColor={colors.muted} style={[{ color: colors.ink, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 14, minHeight: 48, fontSize: 16, textAlign: rtl ? 'right' : 'left', writingDirection: rtl ? 'rtl' : 'ltr', backgroundColor: colors.canvas }, props.style]} /></View>;
}
export function SectionHeader({ title, note }: { title: string; note?: string }) {
  return <Row style={{ justifyContent: 'space-between', flexWrap: 'wrap' }}><Label size={20} style={{ fontWeight: '600' }}>{title}</Label>{note && <Label muted size={12}>{note}</Label>}</Row>;
}
export function ProgressRing({ value, total, label }: { value: number; total: number; label: string }) {
  const ratio = total > 0 ? Math.min(1, Math.max(0, value / total)) : 0;
  const circumference = 2 * Math.PI * 42;
  return <View accessibilityLabel={`${label}: ${value}/${total}`} style={{ width: 110, height: 110, alignItems: 'center', justifyContent: 'center' }}><Svg width={110} height={110} style={{ position: 'absolute' }}><Circle cx={55} cy={55} r={42} stroke={colors.border} strokeWidth={5} fill="none" /><Circle cx={55} cy={55} r={42} stroke={colors.gold} strokeWidth={5} fill="none" strokeDasharray={`${circumference} ${circumference}`} strokeDashoffset={circumference * (1 - ratio)} strokeLinecap="round" rotation={-90} origin="55,55" /></Svg><Label size={25}>{value}<Text style={{ fontSize: 14, color: colors.muted }}>/{total}</Text></Label><Label muted size={10}>{label}</Label></View>;
}
export function EmptyState({ title, message }: { title: string; message: string }) { return <Card><Ionicons name="leaf-outline" color={colors.gold} size={24} /><Label>{title}</Label><Label muted>{message}</Label></Card>; }
export function ErrorState({ message, retry }: { message: string; retry?: () => void }) {
  const { t } = useLanguage();
  return <Card><Text accessibilityRole="alert" style={{ color: colors.error, lineHeight: 24 }}>{message}</Text>{retry && <Button title={t('Try again', 'حاول مرة أخرى')} onPress={retry} variant="secondary" />}</Card>;
}
export function LoadingState({ message }: { message?: string }) {
  const { t } = useLanguage();
  return <Row style={{ padding: 24, justifyContent: 'center' }}><ActivityIndicator color={colors.gold} /><Label muted>{message ?? t('Loading…', 'جارٍ التحميل…')}</Label></Row>;
}
