import { Linking, Platform, Share } from 'react-native';

import {
  captureBarklogError,
  queueBarklogEvent,
} from '@/features/observability';

import type { DogSafetyProfile } from '../data/toxicityDatabase';

function sanitizePhoneNumber(phoneNumber: string) {
  return phoneNumber.replace(/[^0-9+]/g, '');
}

export async function callPhoneNumber(phoneNumber: string) {
  const url = `tel:${sanitizePhoneNumber(phoneNumber)}`;
  const supported = await Linking.canOpenURL(url);

  if (supported) {
    try {
      await Linking.openURL(url);
      queueBarklogEvent('emergency_action_started', {
        action: 'phone_call',
      });
    } catch (error) {
      captureBarklogError(error, {
        source: 'call_phone_number',
      });
      throw error;
    }
  }
}

export async function openEmergencyVetSearch() {
  const query = encodeURIComponent('24 hour emergency vet near me');
  const url =
    Platform.OS === 'ios'
      ? `maps://?q=${query}`
      : `https://www.google.com/maps/search/?api=1&query=${query}`;

  const supported = await Linking.canOpenURL(url);

  if (supported) {
    await Linking.openURL(url);
    queueBarklogEvent('emergency_action_started', {
      action: 'clinic_search',
    });
    return;
  }

  await Linking.openURL(`https://www.google.com/maps/search/${query}`);
  queueBarklogEvent('emergency_action_started', {
    action: 'clinic_search_web_fallback',
  });
}

export async function openTrustedSource(url: string) {
  await Linking.openURL(url);
}

export async function shareEmergencySummary(dog: DogSafetyProfile) {
  const weightLine =
    typeof dog.weightLbs === 'number'
      ? `Weight: ${dog.weightLbs.toFixed(1)} lb`
      : 'Weight: not saved';

  await Share.share({
    message: [
      `BarkLog emergency summary for ${dog.name}`,
      weightLine,
      'Bring recent medications, exposure details, symptoms, and timestamps to the vet.',
      'BarkLog does not diagnose. This summary is for organizing facts during care.',
    ].join('\n'),
    title: `${dog.name} emergency summary`,
  });
  queueBarklogEvent('export_completed', {
    export_type: 'text/plain',
    surface: 'emergency_summary',
  });
}
