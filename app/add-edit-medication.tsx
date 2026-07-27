import { useLocalSearchParams } from 'expo-router';

import AddEditMedicationScreen from '../src/features/medications/screens/AddEditMedicationScreen';

export default function AddEditMedicationRoute() {
  const { id } = useLocalSearchParams<{ id?: string | string[] }>();
  const medicationId = Array.isArray(id) ? id[0] : id;

  return <AddEditMedicationScreen medicationId={medicationId} />;
}
