import {
  buildExpandedCareDetails,
  defaultExpandedCareFormState,
  getExpandedCareFormStateFromDetails,
  parseOptionalPositiveNumber,
} from './expandedCareDetails';

describe('expanded care detail contracts', () => {
  it('builds water details with optional amount and selected source', () => {
    expect(
      buildExpandedCareDetails('water', {
        ...defaultExpandedCareFormState,
        amountOz: '12',
        waterSource: 'fountain',
      }),
    ).toEqual({
      amount_oz: 12,
      source: 'fountain',
    });
  });

  it('builds health-adjacent observation contracts without interpretation', () => {
    expect(
      buildExpandedCareDetails('vomit', {
        ...defaultExpandedCareFormState,
        vomitAppearance: 'bile',
        vomitFrequency: 'multiple',
      }),
    ).toEqual({
      appearance: 'bile',
      frequency: 'multiple',
    });

    expect(
      buildExpandedCareDetails('mobility', {
        ...defaultExpandedCareFormState,
        mobilityObservation: 'slow_to_rise',
        mobilitySeverity: 'mild',
      }),
    ).toEqual({
      observation: 'slow_to_rise',
      severity: 'mild',
    });
  });

  it('normalizes optional text and positive numbers for exports and sync', () => {
    expect(parseOptionalPositiveNumber('0')).toBeUndefined();
    expect(parseOptionalPositiveNumber('bad')).toBeUndefined();
    expect(
      buildExpandedCareDetails('parasite_prevention', {
        ...defaultExpandedCareFormState,
        parasitePreventionType: 'heartworm',
        parasiteProductName: '  Monthly chew  ',
      }),
    ).toEqual({
      prevention_type: 'heartworm',
      product_name: 'Monthly chew',
    });
  });

  it('hydrates edit state from existing event details', () => {
    expect(
      getExpandedCareFormStateFromDetails('vet_visit', {
        clinic_name: 'Northside Vet',
        visit_type: 'follow_up',
      }),
    ).toMatchObject({
      vetClinicName: 'Northside Vet',
      vetVisitType: 'follow_up',
    });

    expect(
      getExpandedCareFormStateFromDetails('cough_sneeze', {
        frequency: 'frequent',
        type: 'reverse_sneeze',
      }),
    ).toMatchObject({
      coughSneezeFrequency: 'frequent',
      coughSneezeType: 'reverse_sneeze',
    });
  });
});
