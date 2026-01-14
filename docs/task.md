# Meeting Cost Calculator Pro - Task List

- [/] **App Assembly & Polish**
    - [x] Assemble `HomeScreen` <!-- id: 9 -->
    - [x] Implement "Pro" aesthetics (animations, layout) <!-- id: 10 -->
    - [x] Configure Immersive Mode (Hide Headers/NavBars) <!-- id: 11_b -->
    - [x] Verify functionality (Running on Android Emulator) <!-- id: 11 -->

## Future Sprints (Planned)
- [/] **Sprint 3-4: Core Features** (Team Management, Analytics, History)
    - [x] History Screen
        - [x] Create Screen Component <!-- id: 13 -->
        - [x] Connect to Repository <!-- id: 14 -->
        - [x] Add Route & Navigation <!-- id: 15 -->
    - [x] UI Polish
        - [x] Add Gradients & Glow Effects <!-- id: 16 -->
        - [x] Refine Spacing (Safe Area) & Card Design <!-- id: 17 -->
    - [x] **Team Management (Saved Teams)**
        - [x] create `Team` Entity & SQLite Table <!-- id: 18 -->
        - [x] create `SavedTeamsScreen` <!-- id: 19 -->
        - [x] Add "Save/Load Team" to Config Screen <!-- id: 20 -->
- [x] **Sprint 5-6: Premium Features** (AI Analysis, Subscription System)
    - [x] Subscription System
        - [x] `useSubscriptionStore` (Mock Persistence) <!-- id: 21 -->
        - [x] Paywall Screen (`PaywallScreen.tsx`) <!-- id: 22 -->
    - [x] AI Analysis
        - [x] Local Insights Service (`AnalyticsService`) <!-- id: 23 -->
        - [x] AI Insights UI in Analytics <!-- id: 24 -->
    - [x] Usage Limits (Freemium Model)
        - [x] History Limit (3 items) <!-- id: 25 -->
        - [x] Gate Logic (Lock overlays) <!-- id: 26 -->
    - [x] **User Profile** (New Request)
        - [x] User Screen & Navigation <!-- id: 27 -->
        - [x] Home Screen Integration <!-- id: 28 -->
- [ ] **Sprint 7-8: Polish & Launch** (Testing, Security Audit, Store Prep) (Ready to Start)

## 🚀 Future Roadmap (High Potential)
These features are identified to increase B2B value and recurring revenue.

### Phase 2: Professional Tools (Retention)
- [ ] **Calendar Integration (Google/Outlook)**
    - Auto-import meetings and participants.
    - Push notifications "Your $500 meeting is starting".
- [ ] **Export & Reporting**
    - Generate PDF/CSV reports for expense reimbursement.
    - Email monthly summaries to managers.
- [ ] **Widgets & Live Activities**
    - **iOS Dynamic Island**: Show burning cash while app is backgrounded.
    - **Home Screen Widget**: Quick "Start Meeting" button.

### Phase 3: Team & Enterprise (B2B Expansion)
- [ ] **Shared "Taximeter" (Web View)**
    - Generate a unique URL for the meeting.
    - Participants can watch the cost ticker in their browser/Zoom.
- [ ] **Organization Accounts**
    - Shared billing for companies.
    - Centralized dashboard for the CFO.

