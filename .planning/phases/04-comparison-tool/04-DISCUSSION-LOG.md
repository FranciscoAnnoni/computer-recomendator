> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions captured in CONTEXT.md — this log preserves the discussion.

**Date:** 2026-04-02
**Phase:** 04-comparison-tool
**Mode:** discuss

## Questions Asked & Answers

### Selection trigger
- **Q:** How do users add a laptop to the comparison list?
- **A:** No trigger from catalog cards — comparator is self-contained. Users select from within `/compare` itself.

### Comparison View format
- **Q:** Route and structure?
- **A:** Dedicated `/compare` page, Navbar button. Starts with 2 slots: slot 1 pre-filled random, slot 2 is "+". When slot 2 filled → 3rd "+" appears (desktop only). Max 3 desktop / 2 mobile.

### Laptop picker
- **Q:** What appears when tapping "+"?
- **A:** Modal/drawer with full catalog list + search.

### Spec visualization
- **Q:** Which specs to show and how?
- **A:** Technical specs only (GPU, CPU, RAM, Storage, Price) as text rows with horizontal dividers. No bars, no icons, no simplified tags.

### Mobile layout
- **Q:** 3 columns on mobile?
- **A:** Mobile cap at 2 laptops. 3rd slot is desktop-only. User provided reference mockup (3-comparador.png) showing target design.

## Reference Material
- User provided mockup image: `3-comparador.png` — Apple-style comparator with bracket aesthetic, side-by-side cards, dashed empty slot.

## No Corrections Made
All decisions were new (no prior phase context to contradict).
