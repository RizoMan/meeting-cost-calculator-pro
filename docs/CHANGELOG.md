# Changelog

All notable changes to the "Meeting Cost Calculator Pro" project will be documented in this file.

## [Unreleased]

## [0.2.0] - Premium Features Update
### Added
- **Subscription Structure**: Added `useSubscriptionStore` with mock persistency to handle PRO status.
- **Paywall Screen**: New screen (`/paywall`) showcasing features with "Unlock" and "Restore" actions.
- **User Profile**: New `UserScreen` reachable from Home (top-right avatar). Displays status and settings placeholders.
- **AI Analysis**:
    - `AnalyticsService` now generates text insights based on meeting cost, duration, and day of week.
    - Added "AI Insights" section to Analytics Dashboard.
- **Freemium Limits**:
    - History screen limits free users to the last 3 meetings.
    - Analytics insights are blurred/locked for free users.
    - "Upgrade" banners added to gated sections.

### Changed
- **Home Screen**: Added Profile Button (Avatar) to the top right.
- **Analytics**: Improved layout to include Insights section.
- **History**: Added footer for upgrade prompt.

## [0.1.0] - Core Foundation (MVP)
### Added
- **Live Meeting Tracker**: Real-time ticker (`LiveTrackerScreen`).
- **Meeting Configuration**: Add participants (`MeetingConfigScreen`) and define hourly rates.
- **History**: Local SQLite database storing past meetings (`HistoryScreen`).
- **Team Management**: Save and load frequently used teams (`SavedTeamsScreen`).
- **Tutorial**: Onboarding overlay showing how to use the app (`TutorialOverlay`).
