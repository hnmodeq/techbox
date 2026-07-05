export const zIndex = {
  base: 0,
  content: 1,
  raised: 5,
  docked: 10,
  sticky: 30,
  sidebarBackdrop: 40,
  sidebar: 50,
  mobileFab: 80,
  cart: 420,
  popover: 700,
  dropdown: 720,
  notification: 740,
  modal: 900,
  modalContent: 910,
  chatbot: 950,
  tooltip: 1200,
  toast: 1300,
  emergency: 2147483000,
} as const;

export type ZIndexToken = keyof typeof zIndex;
