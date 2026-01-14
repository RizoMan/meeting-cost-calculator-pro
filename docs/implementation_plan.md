# Implementation Plan - Meeting Cost Calculator Pro

## Goal Description
Develop a "Pro" grade React Native application for tracking meeting costs in real-time. This project adheres to **Clean Architecture** and **SOLID Principles** as strictly requested. The initial goal is the **MVP Foundation** (Sprint 1-2).

## User Review Required
> [!IMPORTANT]
> **Strict Type Safety**: I will enable `strict: true` and `noImplicitAny: true` in `tsconfig.json`.
> **Architecture**: Code will be split into `Domain`, `Infrastructure`, and `Presentation` layers. This adds boilerplate but ensures scalability.
> **Dependencies**: I will be adding `zustand`, `expo-sqlite`, `zod`, and `expo-router` to the project.

## Proposed Changes

### 1. Configuration & Setup
#### [MODIFY] [tsconfig.json](file:///d:/Proyectos-rentables/meeting-cost-calculator-pro/tsconfig.json)
- Enable strict mode and no implicit any.

#### [NEW] Dependencies
- Install `zustand`, `expo-sqlite`, `zod`, `expo-router`, `react-native-safe-area-context`, `react-native-screens`.

### 2. Architecture Structure
I will restructure the `src` folder to follow Clean Architecture:
```
src/
  ├── domain/           # Entities, Value Objects, Repository Interfaces
  ├── infrastructure/   # API Clients, Database Implementation, Device Services
  ├── presentation/     # UI Components, Screens, ViewModels (Hooks), State
  └── shared/           # Constants, Utils, Types
```

### 3. Domain Layer (Pure TS)
#### [NEW] [Meeting.ts](file:///d:/Proyectos-rentables/meeting-cost-calculator-pro/src/domain/entities/Meeting.ts)
- `Meeting` entity with logic for cost calculation.
- `Participant` value object.

#### [NEW] [CostCalculator.ts](file:///d:/Proyectos-rentables/meeting-cost-calculator-pro/src/domain/services/CostCalculator.ts)
- Domain service for pure calculation logic.

### 4. Infrastructure Layer
#### [NEW] [SQLiteDatabase.ts](file:///d:/Proyectos-rentables/meeting-cost-calculator-pro/src/infrastructure/database/SQLiteDatabase.ts)
- Singleton database connection.
- Migration scripts.

#### [NEW] [MeetingRepositoryImpl.ts](file:///d:/Proyectos-rentables/meeting-cost-calculator-pro/src/infrastructure/repositories/MeetingRepositoryImpl.ts)
- Implementation of `MeetingRepository` utilizing SQLite.

### 5. Presentation Layer
#### [NEW] [useMeetingStore.ts](file:///d:/Proyectos-rentables/meeting-cost-calculator-pro/src/presentation/state/useMeetingStore.ts)
- Zustand store for global app state (current active meeting).

#### [MODIFY] [App.tsx](file:///d:/Proyectos-rentables/meeting-cost-calculator-pro/App.tsx)
- Setup `Expo Router` root layout and providers.

#### [NEW] [LiveMeetingScreen.tsx](file:///d:/Proyectos-rentables/meeting-cost-calculator-pro/src/presentation/screens/LiveMeetingScreen.tsx)
- The main "Ticker" view.
- Updates every second (or 30s as per spec, though 1s is better for UX "wow" factor, we can batch db writes).

### 6. History Feature (New)
#### [NEW] [HistoryScreen.tsx](file:///d:/Proyectos-rentables/meeting-cost-calculator-pro/src/presentation/screens/HistoryScreen.tsx)
- Displays list of past meetings from SQLite.
- Shows date, duration, and total cost.

#### [NEW] [history.tsx](file:///d:/Proyectos-rentables/meeting-cost-calculator-pro/app/meeting/history.tsx)
- Route for history screen.

#### [MODIFY] [index.tsx](file:///d:/Proyectos-rentables/meeting-cost-calculator-pro/app/index.tsx)
- Add button to navigate to History.

- Add button to navigate to History.

## 7. Implemented Architecture & Design (Reference)

### Design System (`src/presentation/theme/theme.ts`)
- **Palette**: Dark Zinc (`#09090B`, `#18181B`) with Emerald (`#10B981`) accents.
- **Typography**: Large, bold headers (32px), clean body text.
- **Components**:
    - **LinearGradient**: Used on all screen backgrounds and cards for depth.
    - **Glow Effects**: `textShadow` and `boxShadow` used on costs and buttons.
    - **Safe Area**: All screens MUST use `useSafeAreaInsets` to add `paddingTop`.

### Navigation & Layout
- **Immersive Mode**: `expo-navigation-bar` hides Android bottom buttons.
- **Headerless**: `headerShown: false` globally; custom headers implementation in each screen.
- **Routing**: `expo-router` file-based routing in `app/`.

### 8. Team Management (Next Steps)
#### [NEW] [Team.ts](file:///d:/Proyectos-rentables/meeting-cost-calculator-pro/src/domain/entities/Team.ts)
- `Team` entity: `{ id, name, participants }`.

#### [MODIFY] [SQLiteDatabase.ts](file:///d:/Proyectos-rentables/meeting-cost-calculator-pro/src/infrastructure/database/SQLiteDatabase.ts)
- Add `teams` table migration. Column `participants` will store JSON string.

#### [NEW] [SavedTeamsScreen.tsx](file:///d:/Proyectos-rentables/meeting-cost-calculator-pro/src/presentation/screens/SavedTeamsScreen.tsx)
- List saved teams.
- Tap to load into current meeting config.

#### [MODIFY] [MeetingConfigScreen.tsx](file:///d:/Proyectos-rentables/meeting-cost-calculator-pro/src/presentation/screens/MeetingConfigScreen.tsx)
- Add "Load Team" and "Save Team" buttons.

## Verification Plan
### Automated Tests
- **Unit Tests**: Jest tests for `NetCost` calculation logic in Domain layer.
- **Type Checking**: Run `tsc --noEmit` to verify zero type errors.

### Manual Verification
1.  **Architecture Check**: Verify imports flow *inwards* (Presentation -> Domain <- Infrastructure).
2.  **Strict Mode**: Verify no `any` types are used.
3.  **Live Cost**: Start a meeting with 2 people at $100/hr and verify the counter increases correctly ($3.33/min).
