# TODOS

## Phase 2 prerequisites

### EditorPanel tab navigation needs a layout rethink before 3 more tabs can land
**What:** The tab bar uses `grid-cols-4` hardcoded to 4 tabs. Phase 2 adds Projects, Certifications, Languages — 7 total.
**Why:** 7 tabs at 420px = ~60px each. Labels truncate to nothing. Users can't reach the new editor panels.
**Approach options:** 2-row tab grid, scrollable overflow tabs, or sidebar nav. Sidebar nav gives the most room and mirrors tools like Canva's left panel.
**Where:** `src/components/editor/EditorPanel.tsx:11` (`grid-cols-4` and hardcoded `tabs` array)
**Depends on:** None. Can be done independently of Phase 2 feature work.

### resumeStore.ts missing mutations for projects / certifications / languages
**What:** `addProject`, `updateProject`, `removeProject`, `addCertification`, `updateCertification`, `removeCertification`, `addLanguage`, `updateLanguage`, `removeLanguage`.
**Why:** Phase 2 editor panels for these sections have no store methods to call.
**Approach:** Direct copy of the `addExperience/updateExperience/removeExperience` pattern. ~40 lines of boilerplate.
**Where:** `src/store/resumeStore.ts` — add after the existing skills mutations.
**Depends on:** None. Safe to add before Phase 2 editor panels exist (mutations are inert until called).
