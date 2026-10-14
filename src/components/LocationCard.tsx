import { useState } from 'react';
import { Linking } from 'react-native';
import { Button, Card, ErrorState, Label, Row, TextInput } from './ui';
import { usePosition } from '../hooks/usePrayer';
import { validCoordinates } from '../services/prayer';
import { useLanguage } from '../lib/i18n';
export function LocationCard() {
  const position = usePosition();
  const { t } = useLanguage();
  const [latitude, setLatitude] = useState(''); const [longitude, setLongitude] = useState('');
  const [error, setError] = useState('');
  return <Card><Label size={20}>{t('Your place in the world', 'موقعك في العالم')}</Label><Label muted>{t('Location is used on-device to calculate prayer times. Manual times use this device’s time zone; use coordinates near your current location.', 'يُستخدم الموقع على الجهاز لحساب مواقيت الصلاة. تعتمد الأوقات اليدوية على المنطقة الزمنية لجهازك؛ أدخل إحداثيات قريبة من موقعك الحالي.')}</Label>
    {position.coords && <Label gold>{position.coords.latitude.toFixed(3)}, {position.coords.longitude.toFixed(3)} · {position.source === 'gps' ? 'GPS' : t('Manual', 'يدوي')}</Label>}
    {position.error && <ErrorState message={position.error} />}
    <Button title={t('Use my location', 'استخدم موقعي')} loading={position.loading} onPress={() => { void position.request(); }} icon="location-outline" />
    {position.denied && <Button title={t('Open device settings', 'افتح إعدادات الجهاز')} variant="ghost" onPress={() => { void Linking.openSettings().catch(() => setError(t('Open your browser site permissions to enable location.', 'فعّل الموقع من أذونات المتصفح.'))); }} />}
    <Row><TextInput label={t('Latitude', 'خط العرض')} value={latitude} onChangeText={setLatitude} keyboardType="numbers-and-punctuation" style={{ minWidth: 90 }} /><TextInput label={t('Longitude', 'خط الطول')} value={longitude} onChangeText={setLongitude} keyboardType="numbers-and-punctuation" style={{ minWidth: 90 }} /></Row>
    {error && <ErrorState message={error} />}
    <Button title={t('Use coordinates', 'استخدم الإحداثيات')} variant="secondary" onPress={() => {
      const coords = { latitude: Number(latitude), longitude: Number(longitude) };
      if (!latitude.trim() || !longitude.trim() || !validCoordinates(coords)) { setError(t('Enter valid latitude (−90…90) and longitude (−180…180).', 'أدخل خط عرض صالحًا (−٩٠…٩٠) وخط طول صالحًا (−١٨٠…١٨٠).')); return; }
      setError(''); position.manual(coords);
    }} />
  </Card>;
}
