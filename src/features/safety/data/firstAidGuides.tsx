import type { ReactNode } from 'react';

import {
  BackBlowIllustration,
  BloodDropIcon,
  ChokingMouthIllustration,
  CprIcon,
  HeatIcon,
  HeimlichIllustration,
  MedicalBagIcon,
} from '../components/SafetyEmergencyIcons';

export type FirstAidTopicId =
  | 'bleeding'
  | 'choking'
  | 'cpr'
  | 'heatstroke'
  | 'poisoning'
  | 'seizure';

export type FirstAidStep = {
  body: string;
  illustration?: ReactNode;
  title: string;
};

export type FirstAidGuide = {
  emergencyAction: string;
  icon: ReactNode;
  id: FirstAidTopicId;
  sourceName: string;
  sourceUrl: string;
  steps: FirstAidStep[];
  timerSeconds?: number;
  title: string;
  warningBody: string;
  warningTitle: string;
};

const RED_CROSS_DOG_FIRST_AID_URL =
  'https://www.redcross.org/take-a-class/resources/learn-pet-first-aid/dog';

export const FIRST_AID_GUIDES: Record<FirstAidTopicId, FirstAidGuide> = {
  bleeding: {
    emergencyAction:
      'Call a vet now for heavy bleeding, deep wounds, pale gums, or weakness.',
    icon: <BloodDropIcon />,
    id: 'bleeding',
    sourceName: 'American Red Cross pet first aid',
    sourceUrl: RED_CROSS_DOG_FIRST_AID_URL,
    steps: [
      {
        body: 'Use clean gauze or a clean cloth to apply steady pressure directly over the bleeding area.',
        title: 'Apply direct pressure',
      },
      {
        body: 'Keep pressure in place. Add more gauze over the first layer if blood soaks through.',
        title: 'Do not keep lifting the bandage',
      },
      {
        body: 'Keep your dog as still and calm as possible while arranging veterinary care.',
        title: 'Limit movement',
      },
    ],
    title: 'Bleeding',
    warningBody:
      'Severe bleeding, bite wounds, pale gums, weakness, or bleeding that does not slow is an emergency.',
    warningTitle: 'Control bleeding and call for help',
  },
  choking: {
    emergencyAction:
      'Call an emergency vet now if breathing is blocked or your dog collapses.',
    icon: <MedicalBagIcon />,
    id: 'choking',
    sourceName: 'American Red Cross pet first aid',
    sourceUrl: RED_CROSS_DOG_FIRST_AID_URL,
    steps: [
      {
        body: 'If your dog is conscious, look for a visible object only. Do not sweep blindly into the mouth.',
        illustration: <ChokingMouthIllustration />,
        title: 'Check the mouth safely',
      },
      {
        body: 'If you cannot safely remove the object, give several firm blows between the shoulder blades while keeping your dog supported.',
        illustration: <BackBlowIllustration />,
        title: 'Use back blows',
      },
      {
        body: 'If back blows do not help, use abdominal thrusts for a dog whose airway remains blocked, then seek emergency care.',
        illustration: <HeimlichIllustration />,
        title: 'Use abdominal thrusts if needed',
      },
    ],
    title: 'Choking',
    warningBody:
      'A dog that cannot breathe, is turning blue or gray, or collapses needs emergency veterinary help immediately.',
    warningTitle: 'Do not delay breathing emergencies',
  },
  cpr: {
    emergencyAction:
      'Start CPR only if your dog is not breathing and has no heartbeat, and call emergency care.',
    icon: <CprIcon />,
    id: 'cpr',
    sourceName: 'American Red Cross pet first aid',
    sourceUrl: RED_CROSS_DOG_FIRST_AID_URL,
    steps: [
      {
        body: 'Check for breathing and a heartbeat. If either is present, do not start chest compressions.',
        title: 'Confirm breathing and heartbeat',
      },
      {
        body: 'Place your dog on their right side on a firm surface. Put your hands over the widest part of the chest for most dogs.',
        title: 'Position for compressions',
      },
      {
        body: 'Use firm, steady chest compressions and arrange emergency transport as soon as another person can help.',
        title: 'Compress and reassess',
      },
    ],
    timerSeconds: 120,
    title: 'CPR',
    warningBody:
      'CPR is for dogs who are not breathing and have no detectable heartbeat. If you are unsure, call emergency care while checking.',
    warningTitle: 'Use only for breathing and cardiac arrest',
  },
  heatstroke: {
    emergencyAction:
      'Move to shade and call an emergency vet now. Heatstroke can be life-threatening.',
    icon: <HeatIcon />,
    id: 'heatstroke',
    sourceName: 'American Red Cross pet first aid',
    sourceUrl: RED_CROSS_DOG_FIRST_AID_URL,
    steps: [
      {
        body: 'Move your dog out of heat immediately. Use shade, air conditioning, or airflow.',
        title: 'Move to a cooler place',
      },
      {
        body: 'Offer small amounts of cool water if your dog is alert and able to swallow.',
        title: 'Offer water only if alert',
      },
      {
        body: 'Use cool, not ice-cold, water on the body while arranging emergency veterinary care.',
        title: 'Begin gentle cooling',
      },
    ],
    title: 'Heatstroke',
    warningBody:
      'Collapse, heavy panting, seizures, red or pale gums, or weakness after heat exposure is an emergency.',
    warningTitle: 'Cool first and call now',
  },
  poisoning: {
    emergencyAction:
      'Call poison control or an emergency vet before giving anything or inducing vomiting.',
    icon: <MedicalBagIcon />,
    id: 'poisoning',
    sourceName:
      'ASPCA Animal Poison Control and American Red Cross pet first aid',
    sourceUrl: 'https://www.aspca.org/pet-care/aspca-poison-control',
    steps: [
      {
        body: 'Move your dog away from the substance and remove access to the item if you can do so safely.',
        title: 'Prevent more exposure',
      },
      {
        body: 'Save packaging, labels, plant photos, medication bottles, or a sample of the item.',
        title: 'Collect source details',
      },
      {
        body: 'Call poison control or an emergency vet with your dog weight, item, amount, and time of exposure.',
        title: 'Call before home treatment',
      },
    ],
    title: 'Poisoning',
    warningBody:
      'Do not induce vomiting or give home remedies unless a veterinary professional tells you to do so.',
    warningTitle: 'Call before treating',
  },
  seizure: {
    emergencyAction:
      'Call emergency care now for a seizure over five minutes, repeated seizures, heat exposure, toxin exposure, or trouble breathing.',
    icon: <MedicalBagIcon />,
    id: 'seizure',
    sourceName: 'American Red Cross pet first aid',
    sourceUrl: RED_CROSS_DOG_FIRST_AID_URL,
    steps: [
      {
        body: 'Move furniture or objects away. Do not put hands or objects in your dog mouth.',
        title: 'Make the area safe',
      },
      {
        body: 'Start a timer and watch breathing, color, and whether another seizure follows.',
        title: 'Time the episode',
      },
      {
        body: 'Keep the room quiet as your dog recovers and contact your vet for next steps.',
        title: 'Reduce stimulation',
      },
    ],
    title: 'Seizure',
    warningBody:
      'A prolonged seizure, repeated seizures, or seizure after possible poisoning needs emergency care.',
    warningTitle: 'Time matters',
  },
};

export const QUICK_FIRST_AID_TOPICS: FirstAidTopicId[] = [
  'choking',
  'bleeding',
  'cpr',
  'heatstroke',
];

export function getFirstAidGuide(topic: string | string[] | undefined) {
  const topicId = Array.isArray(topic) ? topic[0] : topic;

  if (topicId && topicId in FIRST_AID_GUIDES) {
    return FIRST_AID_GUIDES[topicId as FirstAidTopicId];
  }

  return FIRST_AID_GUIDES.choking;
}
