# Design Guidelines: Discord Bot License Management System

## Design Approach

**Selected Approach:** Design System with Modern Dashboard Patterns

**Justification:** This is a utility-focused admin application requiring efficiency, data clarity, and consistent interaction patterns. Drawing inspiration from Linear, Vercel Dashboard, and Stripe's admin interfaces while maintaining systematic consistency.

**Core Principles:**
- Data-first design with clear information hierarchy
- Efficient workflows for admin tasks
- Clean, distraction-free interface
- Professional, trustworthy aesthetic

---

## Typography

**Font Families:**
- Primary: Inter (via Google Fonts) - body text, tables, forms
- Monospace: JetBrains Mono - license keys, technical identifiers

**Hierarchy:**
- Page Titles: text-3xl, font-semibold
- Section Headers: text-xl, font-semibold  
- Card Titles: text-lg, font-medium
- Body Text: text-base, font-normal
- Labels: text-sm, font-medium
- Captions/Meta: text-xs, font-normal
- Table Headers: text-sm, font-semibold, uppercase tracking-wider

---

## Layout System

**Spacing Primitives:** Use Tailwind units of 2, 4, 6, 8, 12, and 16
- Component padding: p-6 or p-8
- Section gaps: gap-6 or gap-8
- Element margins: m-2, m-4, m-6
- List spacing: space-y-4
- Grid gaps: gap-6

**Container Strategy:**
- App shell: Full viewport with sidebar
- Content area: max-w-7xl with px-6 lg:px-8
- Forms: max-w-2xl
- Modals: max-w-lg or max-w-xl

---

## Component Library

### Navigation Structure

**Sidebar (Fixed Left):**
- Width: w-64 on desktop, collapsible on mobile
- Logo placement at top (h-16 container)
- Navigation items with icons (from Heroicons)
- Active state: subtle background highlight
- User profile section at bottom
- Sections: Dashboard, Licenses, Users, Settings

**Top Bar:**
- Height: h-16
- Breadcrumb navigation on left
- User menu/notifications on right
- Search bar (if applicable)

### Dashboard Components

**Stats Cards (Grid):**
- 4-column grid on desktop (grid-cols-1 md:grid-cols-2 lg:grid-cols-4)
- Each card: p-6, rounded-lg border
- Metric value: text-3xl font-bold
- Label: text-sm
- Trend indicator with icon (optional)

**Data Tables:**
- Zebra striping for rows
- Sticky headers with subtle border
- Compact row height (h-12 or h-14)
- Hover state on rows
- Action buttons/dropdowns aligned right
- Pagination at bottom
- Filters/search above table

**Table Columns:**
- License ID: Monospace font, truncate if needed
- Status: Badge component with dot indicator
- Dates: Relative time format (e.g., "2 days ago")
- Actions: Icon buttons or dropdown menu

### Forms & Inputs

**Form Layout:**
- Vertical stack with consistent spacing (space-y-6)
- Labels above inputs (mb-2)
- Helper text below inputs (text-sm, mt-1)
- Required field indicators (asterisk)
- Error states with icon and message

**Input Fields:**
- Height: h-10 or h-11
- Padding: px-4
- Rounded corners: rounded-md
- Border with focus ring
- Disabled state clearly visible

**Buttons:**
- Primary action: Solid with accent
- Secondary: Border outline
- Danger: For delete actions
- Height: h-10 or h-11
- Padding: px-6
- Rounded: rounded-md

### Status Indicators

**License Status Badges:**
- Active: Solid with green dot
- Expired: Muted with gray dot
- Suspended: Bordered with red dot
- Size: text-xs or text-sm, px-3 py-1, rounded-full

### Modals & Dialogs

**Structure:**
- Centered overlay with backdrop blur
- Max width: max-w-lg or max-w-xl
- Header with title and close button (h-16)
- Body content: p-6
- Footer with action buttons: p-6, border-t

**Use Cases:**
- Create new license
- Edit license details
- Delete confirmations
- Assign license to user
- User details view

### Cards

**Content Cards:**
- Border with subtle shadow
- Padding: p-6
- Rounded: rounded-lg
- Header section with title and actions
- Divider between sections

### Authentication Pages

**Login Page:**
- Centered card layout (max-w-md)
- Logo at top center
- Dual authentication options: Discord button and email/password form
- Discord button: Full width, branded styling with icon
- Email form below with divider ("or continue with email")
- "Remember me" checkbox
- Admin credentials pre-filled option for testing

---

## Page-Specific Layouts

### Dashboard Home
- Stats grid at top (4 cards)
- Recent licenses table below
- Recent users list or activity feed

### License Management
- Page header with "Create License" button
- Filters/search bar
- Data table with columns: ID, User, Status, Created, Expires, Actions
- Pagination controls

### User Management  
- Similar to licenses: header, filters, table
- Columns: Name, Email, Discord ID, Licenses Count, Joined, Actions
- User detail modal on row click

### Settings Page
- Two-column layout on desktop
- Sidebar navigation for settings sections
- Forms for: Profile, Discord integration, Database settings

---

## Responsive Behavior

**Breakpoints:**
- Mobile: Single column, hamburger menu
- Tablet (md:): Two columns for grids, sidebar toggles
- Desktop (lg:): Full sidebar visible, 3-4 column grids

**Mobile Adaptations:**
- Sidebar becomes slide-out drawer
- Tables become card lists
- 4-column stats become 2-column then 1-column
- Reduce padding: p-4 instead of p-6

---

## Micro-interactions

**Minimal Animation Strategy:**
- Button hover: Subtle scale or brightness change
- Loading states: Spinner or skeleton screens
- Page transitions: None or very subtle fade
- Toast notifications: Slide in from top-right
- Modal entrance: Quick fade-in (duration-200)
- Dropdown menus: Simple fade-in

**Avoid:**
- Elaborate scroll animations
- Distracting motion effects
- Particle effects or decorative animations

---

## Images

**Logo Usage:**
- Sidebar: Full logo at h-8 or h-10
- Login page: Larger at h-16 or h-20
- Favicon: Generated from logo

**No Hero Images:** This is a dashboard application - no marketing hero sections needed. Focus entirely on functional interfaces.