import { useLocalSearchParams } from 'expo-router';

import EventDetailScreen from '@/features/archive/screens/EventDetailScreen';

export default function EventDetailRoute() {
  const { id } = useLocalSearchParams<{ id?: string | string[] }>();
  const eventId = Array.isArray(id) ? id[0] : id;

  return <EventDetailScreen eventId={eventId} />;
}
