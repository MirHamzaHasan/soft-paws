// A Pick records the reviewer's choice; flowDefault is not an approval.
window.F.SCREENS.forEach(screen => {
  if (screen.build && !screen.group && screen.id !== 'home-before') {
    screen.group = 'review-' + screen.id;
    screen.flowDefault = true;
  }
});
