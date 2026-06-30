export const zIndex = {
  base: 0,
  docked: 10,
  sidebar: 50,
  mobileFab: 60,
  cart: 420,
  popover: 460,
  modal: 500,
  modalContent: 501,
  chatbot: 520,
  tooltip: 600,
} as const;

export type ZIndexToken = keyof typeof zIndex;
