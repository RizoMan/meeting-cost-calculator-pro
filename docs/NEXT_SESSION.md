# Next Session Guide - Meeting Cost Calculator Pro

**Last Updated:** v0.2.0 (Premium Features Complete)
**Current Phase:** Ready for "Sprint 7-8: Polish & Launch"
**Documentation:**
- [FEATURES_READY.md](./FEATURES_READY.md): Manual of working features.
- [task.md](./task.md): Includes new "Future Roadmap" (Phase 2 & 3).

## 🚀 Current Status
The application is feature-complete for an internal MVP/Beta.
- **Core**: Meeting Tracking, History (SQLite), Team Management.
- **Premium**: Paywall UI, User Profile, "AI" Insights (Local Heuristics), Usage Limits.
- **Architecture**: Clean Architecture (Domain/Infrastructure/Presentation) with strict TypeScript.

## ⚠️ Critical Context (Technical Debt/Mocks)
Before launching to a real store, you must address these **Mocks**:
1.  **Subscription System**:
    - File: `src/presentation/state/useSubscriptionStore.ts`
    - Status: Uses `setTimeout` to simulate purchases.
    - Action: Integrate **RevenueCat** or **Expo In-App Purchases** if real payments are needed.
2.  **AI Analysis**:
    - File: `src/domain/services/AnalyticsService.ts`
    - Status: Uses deterministic if/else logic to generate text.
    - Action: Keep as is for "offline AI" (selling point: privacy) OR connect to OpenAI API for dynamic insights.

## 📋 Immediate Next Steps
When you resume, start here:

1.  **Visual Polish**:
    - Check `src/presentation/theme/theme.ts`. ensure Dark Mode colors are accessible.
    - Verify "Safe Area" on physical devices (especially Paywall & Profile).

2.  **Testing**:
    - Run the app on a **real Android/iOS device** (not just simulator).
    - Verify database persistence after app close/reopen.

3.  **Store Assets**:
    - `app.json`: Update `displayName`, `slug`, `ios.bundleIdentifier`, `android.package`.
    - Generate `privacy_policy.md` (Stub in `docs/` but needs content).

## 🤖 Kickstart Prompt
Copy-paste this to the AI agent to resume context instantly:

> "Hola, retomemos el proyecto 'Meeting Cost Calculator Pro'. Estamos en la fase de Polish & Launch. Revisa `docs/NEXT_SESSION.md` para ver el estado actual. Quiero empezar revisando el archivo `app.json` para preparar la build de Android."
