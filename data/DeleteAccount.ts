type DeleteAccountReason = {
  label: string;
  value: string;
};

export const DeleteAccountReasons: DeleteAccountReason[] = [
  {
    label: 'settings.deleteAccount.reasons.privacy',
    value: 'privacy',
  },
  {
    label: 'settings.deleteAccount.reasons.dissatisfaction',
    value: 'dissatisfaction',
  },
  {
    label: 'settings.deleteAccount.reasons.tooManyAds',
    value: 'tooManyAds',
  },
  {
    label: 'settings.deleteAccount.reasons.competition',
    value: 'competition',
  },
  {
    label: 'settings.deleteAccount.reasons.tooManyNotifications',
    value: 'tooManyNotifications',
  },
  {
    label: 'settings.deleteAccount.reasons.tooExpensive',
    value: 'tooExpensive',
  },
  {
    label: 'settings.deleteAccount.reasons.other',
    value: 'other',
  },
];
