# Milestone 4 Implementation Changes

## Summary of Changes

Milestone 4 delivers the pure monochrome redesign of the **Live Presence Tracker** (`src/views/LiveTrackerView.jsx`) and the **Master Visitor Information Register** (`src/views/VisitorLogView.jsx`).

### 1. `src/views/LiveTrackerView.jsx`
- **Real-Time Presence Tracker Board**: Displays all currently active guests inside the facility (`Checked-In` and `Overdue`), strictly filtering out `Checked-Out` visitors.
- **Pure Monochrome Status Badges**:
  - `Checked-In` guests render with high-contrast inverted status pills (`pill-badge-active`: solid black in light mode, solid white in dark mode) with animated live pulsing indicator dot.
  - `Overdue` guests render with high-contrast bold border pills (`pill-badge-overdue`) and distinct border highlighting.
- **Live Stay Duration Calculator**: Real-time timer updating every second, computing elapsed hours and minutes since `checkInTime` with clock skew safety.
- **1-Click Check-Out Workflow**: Immediate one-click check-out button invoking `checkOutVisitor(v.id)` with instant UI update, presence count decrement, and accessible monochrome toast notification feedback.
- **Live Search & Department Filtering**: Fast multi-field search (filtering on `fullName`, `company`, `hostName`, `badgeId`, `id`, `idNumber`, `phone`, `email`, `purpose`) and reactive department filter chips with reset actions.
- **Printable Pass Access**: 1-click modal preview trigger (`openBadgeModal(v)`) to open `VisitorPassModal`.
- **Empty States**: High-contrast, clean empty states handling zero inside guests vs zero search/filter matches with contextual CTA buttons.

### 2. `src/views/VisitorLogView.jsx`
- **Master Visitor Information Register**: Full audit table displaying all visitors across all historical statuses.
- **Multi-Field Real-Time Search**: Search filtering across visitor name, company, host, badge ID, visitor ID, ID number, phone, email, and purpose.
- **Status Tabs & Department Filters**: Dedicated status filter tabs (`All`, `Inside`, `Overdue`, `Checked-Out`) with real-time record count badges and a department filter selector.
- **Multi-Column Sorting**: Bi-directional column sorting (by Name, Company, Host, Purpose, Check-In Time, Check-Out Time, Status) with clear sort direction indicators (`ArrowUp`/`ArrowDown`/`ArrowUpDown`).
- **Configurable Pagination Controls**:
  - Selectable items per page (8, 15, 25, 50; default 8).
  - Showing entry range indicators ("Showing X to Y of Z entries").
  - Previous / Next buttons with boundary disabling and smart page button windowing with ellipses.
- **Export to CSV**: High-contrast action button invoking `exportToCSV()` to download standard RFC-compliant CSV audit records.
- **Pass Badge Modal Trigger**: `openBadgeModal` button available for every visitor record.
- **1-Click Check-Out from Table**: Quick check-out action button for active visitors with instant toast feedback.
