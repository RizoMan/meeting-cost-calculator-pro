# Implementation Plan - Internationalization (i18n)

## Goal Description
Implement full multi-language support for the application. The default language will be English, with support for Spanish (`es`), Italian (`it`), Portuguese (`pt`), Chinese (`cn`/`zh`), and French (`fr`).

## User Review Required
> [!NOTE]
> I will install `i18next`, `react-i18next`, and `expo-localization`.
> Text strings will be extracted into JSON files.

## Proposed Changes

### 1. Dependencies
#### [NEW] Install Packages
- `npm install i18next react-i18next expo-localization`

### 2. Infrastructure Layer
#### [NEW] [i18n.ts](file:///d:/Proyectos-rentables/meeting-cost-calculator-pro/src/infrastructure/i18n/i18n.ts)
- Initialize `i18next`.
- Configure language detection using `expo-localization`.
- Helper to load translation resources.

#### [NEW] [locales](file:///d:/Proyectos-rentables/meeting-cost-calculator-pro/src/infrastructure/i18n/locales)
- `en.json`: Base English strings.
- `es.json`: Spanish translations.
- `it.json`: Italian translations.
- `pt.json`: Portuguese translations.
- `zh.json`: Chinese translations.
- `fr.json`: French translations.

### 3. Presentation Layer (Refactoring)
Wrapping text strings with `t(...)` hook in:
- `LiveTrackerScreen.tsx`
- `HistoryScreen.tsx`
- `MeetingConfigScreen.tsx` (Home)
- `PaywallScreen.tsx`
- `UserScreen.tsx`
- `SavedTeamsScreen.tsx`
- `AnalyticsScreen.tsx`

### 4. Configuration
#### [MODIFY] [App.tsx](file:///d:/Proyectos-rentables/meeting-cost-calculator-pro/App.tsx) (or root layout)
- Ensure i18n is initialized before rendering. (Usually just importing the config file is enough).

## Verification Plan
1.  **Manual Test**: Change device language (or mock `expo-localization`) and verify app text changes.
2.  **Fallback**: Verify that unsupported languages fall back to English.
