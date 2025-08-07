# GroupSettle - Design Specifications

## Design System Foundation

### Color Palette

**Primary Colors**
- Primary Blue: `#2563EB` (Safe for accessibility, professional trust)
- Primary Blue Light: `#3B82F6` (Interactive states, highlights)
- Primary Blue Dark: `#1E40AF` (Active states, emphasis)

**Secondary Colors**
- Success Green: `#10B981` (Positive balances, confirmations)
- Warning Orange: `#F59E0B` (Pending settlements, alerts)
- Error Red: `#EF4444` (Negative balances, errors)
- Info Purple: `#8B5CF6` (Information, secondary actions)

**Neutral Colors**
- Background: `#FFFFFF` (Primary background)
- Surface: `#F8FAFC` (Card backgrounds, secondary surfaces)
- Border: `#E2E8F0` (Dividers, card borders)
- Text Primary: `#0F172A` (Headlines, primary text)
- Text Secondary: `#64748B` (Subtitles, secondary information)
- Text Disabled: `#94A3B8` (Disabled states, placeholder text)

**Currency Colors**
- Positive Amount: `#10B981` (Money owed to user)
- Negative Amount: `#EF4444` (Money user owes)
- Neutral Amount: `#64748B` (Balanced or informational)

### Typography Scale

**Font Family**
- Primary: `Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`
- Monospace: `'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', monospace` (for amounts)

**Font Sizes & Weights**
- **Display Large**: 32px, font-weight: 700 (Welcome screens, major headings)
- **Headline 1**: 24px, font-weight: 600 (Screen titles)
- **Headline 2**: 20px, font-weight: 600 (Section headers)
- **Headline 3**: 18px, font-weight: 600 (Card titles, important labels)
- **Body Large**: 16px, font-weight: 400 (Primary body text, input text)
- **Body Medium**: 14px, font-weight: 400 (Secondary text, descriptions)
- **Body Small**: 12px, font-weight: 400 (Captions, timestamps)
- **Label**: 14px, font-weight: 500 (Form labels, button text)
- **Caption**: 11px, font-weight: 400 (Helper text, legal text)

**Currency Display**
- **Large Amount**: 20px, font-weight: 600, monospace (Settlement totals)
- **Medium Amount**: 16px, font-weight: 500, monospace (Expense amounts)
- **Small Amount**: 14px, font-weight: 400, monospace (Converted amounts)

### Spacing System

**Base Unit**: 4px
- **xs**: 4px (Tight spacing, icon margins)
- **sm**: 8px (Close elements, small padding)
- **md**: 16px (Standard spacing, card padding)
- **lg**: 24px (Section spacing, larger margins)
- **xl**: 32px (Screen margins, major sections)
- **2xl**: 48px (Large spacing, screen sections)

**Layout Grid**
- **Mobile Margin**: 16px (Screen edge margins)
- **Card Padding**: 16px (Internal card spacing)
- **List Item Height**: 64px (Standard list item minimum)
- **Button Height**: 48px (Minimum touch target)

### Component Library

#### Buttons

**Primary Button**
- Background: `#2563EB`
- Text: `#FFFFFF`, 14px, font-weight: 500
- Height: 48px, Border-radius: 8px
- Padding: 0 24px
- States:
  - Hover: Background `#3B82F6`
  - Active: Background `#1E40AF`
  - Disabled: Background `#94A3B8`, Text `#FFFFFF`

**Secondary Button**
- Background: `#F8FAFC`
- Border: 1px solid `#E2E8F0`
- Text: `#2563EB`, 14px, font-weight: 500
- Height: 48px, Border-radius: 8px
- Padding: 0 24px

**Text Button**
- Background: Transparent
- Text: `#2563EB`, 14px, font-weight: 500
- Height: 32px, Border-radius: 4px
- Padding: 0 12px

**Floating Action Button (FAB)**
- Background: `#2563EB`
- Size: 56px diameter, Border-radius: 28px
- Icon: 24px, color `#FFFFFF`
- Shadow: 0 4px 12px rgba(37, 99, 235, 0.3)
- Position: Fixed, bottom: 24px, right: 16px

#### Input Fields

**Text Input**
- Background: `#FFFFFF`
- Border: 1px solid `#E2E8F0`
- Height: 48px, Border-radius: 8px
- Padding: 0 16px
- Font: 16px, color `#0F172A`
- Placeholder: color `#94A3B8`
- Focus: Border color `#2563EB`, shadow `0 0 0 3px rgba(37, 99, 235, 0.1)`

**Currency Input**
- Same as text input
- Font: Monospace for amount display
- Prefix: Currency symbol in `#64748B`
- Right-aligned for amounts

**Search Input**
- Background: `#F8FAFC`
- Border: 1px solid `#E2E8F0`
- Height: 40px, Border-radius: 20px
- Padding: 0 16px 0 40px (space for search icon)
- Search Icon: 16px, positioned left: 12px, color `#64748B`

#### Cards

**Standard Card**
- Background: `#FFFFFF`
- Border: 1px solid `#E2E8F0`
- Border-radius: 12px
- Padding: 16px
- Shadow: 0 1px 3px rgba(0, 0, 0, 0.1)

**Interactive Card** (tappable)
- Same as standard card
- Hover/Press: Background `#F8FAFC`
- Transition: all 0.2s ease

**Expense Card**
- Standard card styling
- Left border: 4px solid category color
- Swipe actions revealed on left/right swipe

#### Navigation

**Tab Bar** (Bottom navigation)
- Background: `#FFFFFF`
- Border-top: 1px solid `#E2E8F0`
- Height: 64px + safe area
- Icons: 24px
- Active: Icon and text `#2563EB`
- Inactive: Icon and text `#64748B`
- Badge: Background `#EF4444`, text `#FFFFFF`, size 18px

**Header**
- Background: `#FFFFFF`
- Border-bottom: 1px solid `#E2E8F0`
- Height: 56px + safe area
- Title: 18px, font-weight: 600, color `#0F172A`
- Back button: 24px icon, color `#2563EB`

### Iconography

**Icon Style**: Outline icons, 2px stroke width, rounded line caps
**Sizes**: 16px (small), 20px (medium), 24px (large), 32px (extra large)

**Core Icons Needed**:
- Plus (Add expense)
- Users (Group management)
- Calculator (Settlements)
- Download (Export)
- Settings (Configuration)
- QR Code (Group joining)
- Camera (Receipt photos)
- Currency Exchange (Multi-currency)
- Wifi Off (Offline indicator)
- Check Circle (Completed settlements)
- Alert Circle (Pending actions)
- Edit (Modify entries)
- Trash (Delete actions)
- Share (Export/sharing)
- Filter (List filtering)

## Screen Wireframes & Layouts

### 1. Onboarding/Welcome Screen

**Purpose**: Introduce app concept and guide first-time setup

**Layout Structure**:
- **Header**: Logo and app name (top 20%)
- **Content**: Feature highlights with icons (middle 60%)
- **Footer**: Get Started button (bottom 20%)

**Key Elements**:
- App logo: 80px, centered
- Welcome headline: "Split expenses, settle simply"
- Feature list: 3 key benefits with icons
- Primary button: "Get Started" - full width minus margins
- Skip option: Text button, right-aligned

**Mobile Responsiveness**:
- Maintain proportions across screen sizes
- Adjust text sizes for accessibility settings
- Ensure button remains thumbs-reach accessible

### 2. Group Creation Screen

**Purpose**: Create new expense groups or join existing ones

**Layout Structure**:
- **Header**: "New Group" title with back button
- **Content**: Group creation form or QR scanner
- **Footer**: Action buttons

**Key Elements**:
- Tab switcher: "Create Group" / "Join Group"
- **Create Tab**:
  - Group name input (required)
  - Default currency selector
  - Member invitation section
  - QR code generation button
- **Join Tab**:
  - QR code scanner interface
  - Manual group code input as alternative
- Primary button: "Create Group" or "Join Group"

**QR Code Integration**:
- Camera viewfinder overlay with scan area
- Real-time QR detection feedback
- Manual entry fallback option
- Generated QR codes: 200px square, high contrast

### 3. Group Dashboard Screen

**Purpose**: Central hub showing group overview and quick actions

**Layout Structure**:
- **Header**: Group name, member count, sync status
- **Balance Summary**: Current user's net balance (prominent)
- **Quick Actions**: Add expense, calculate settlements
- **Recent Activity**: Latest expenses and settlements
- **Navigation**: Bottom tab bar

**Key Elements**:
- Group header with settings icon
- Balance card: Large currency display with color coding
- FAB: Add expense (positioned for easy thumb access)
- Recent expenses list: 3-5 most recent items
- Settlement status indicator
- Sync status: Small icon with last sync time

**Balance Display**:
- Green background if user is owed money
- Red background if user owes money
- Gray if balanced
- Amount in large, monospace font
- Currency symbol and conversion note if applicable

### 4. Add Expense Screen

**Purpose**: Quick expense entry with flexible splitting options

**Layout Structure**:
- **Header**: "Add Expense" with save/cancel
- **Expense Details**: Amount, description, category
- **Splitting Section**: Member selection and split method
- **Footer**: Save expense button

**Key Elements**:
- **Amount Input**: Large, prominent currency input
- **Description**: Text input for expense details
- **Date Picker**: Default to today, easy to change
- **Category Selector**: Optional, with common presets
- **Member Selection**: Checkboxes for all group members
- **Split Method Toggle**: Equal / Custom / Percentage
- **Split Preview**: Show amounts per person

**Splitting Interface**:
- Equal split: Automatic calculation shown
- Custom split: Individual amount inputs per selected member
- Percentage split: Percentage sliders per member
- Total validation: Ensure splits equal expense amount
- Real-time calculation feedback

### 5. Expense List Screen

**Purpose**: View, filter, and manage all group expenses

**Layout Structure**:
- **Header**: Group name with search and filter icons
- **Filter Bar**: Quick filter chips (if active)
- **Expense List**: Chronological list of all expenses
- **Footer**: Tab navigation

**Key Elements**:
- Search bar (expandable from header icon)
- Filter chips: Date range, category, member, settled status
- **Expense Cards**: 
  - Description and category
  - Amount in group currency
  - Date and who paid
  - Settlement status indicator
  - Your share amount (if different from total)
- Swipe actions: Edit (right swipe), Delete (left swipe)
- Empty state: Illustration with "Add your first expense"

**Expense Card Details**:
- Primary: Expense description (16px)
- Secondary: Category • Date • Paid by [Name] (14px)
- Amount: Right-aligned, monospace, color-coded (16px)
- Your share: Below amount if different, smaller text (12px)
- Status badge: "Settled" or "Pending" with appropriate color

### 6. Settlement View Screen

**Purpose**: Show optimal settlement calculations and track payments

**Layout Structure**:
- **Header**: "Settlements" with calculation date
- **Settlement Summary**: Net balances for all members
- **Optimal Payments**: Recommended payment transactions
- **Settlement Actions**: Mark payments complete, export
- **History**: Previously completed settlements

**Key Elements**:
- **Balance Cards**: Each member's net position
  - Name and avatar/initial
  - Net amount owed or owed to them
  - Color coding: green (owed to), red (owes), gray (even)
- **Payment Recommendations**:
  - "[Person A] pays [Person B] $X" format
  - One-tap "Mark as Paid" buttons
  - Payment method selection (optional)
- **Settlement Actions**:
  - "Export Settlement Report" button
  - "Mark All as Settled" option
  - Reset settlements option (with confirmation)

**Optimization Display**:
- Show "X transactions needed" vs "Y transactions saved"
- Expandable "How this works" explanation
- Alternative payment methods if users prefer

### 7. Settings/Profile Screen

**Purpose**: App configuration and data management

**Layout Structure**:
- **User Profile**: Basic user info and preferences
- **Group Settings**: Group-specific configurations
- **Data Management**: Export, backup, sync options
- **App Settings**: General app preferences

**Key Elements**:
- **Profile Section**:
  - User name (editable)
  - Profile picture/avatar
  - Default currency preference
- **Group Settings**:
  - Group name and description
  - Member management (add/remove)
  - Default currency for group
  - Notification preferences
- **Data Management**:
  - Export options (CSV, PDF)
  - Backup/restore functionality
  - Sync status and manual sync
  - Clear data options (with warnings)
- **App Settings**:
  - Theme selection (light/dark/system)
  - Language preferences
  - Accessibility options
  - About and privacy policy

### 8. Offline/Sync Status Indicators

**Purpose**: Clear communication of connectivity and data freshness

**Status Indicators**:
- **Online/Synced**: Green dot, "Last synced: [time]"
- **Offline**: Orange dot with wifi-off icon, "Offline mode"
- **Syncing**: Blue dot with loading animation, "Syncing..."
- **Conflict**: Red dot with alert icon, "Sync conflict - tap to resolve"
- **Out of Date**: Yellow dot, "Data may be outdated - [time] ago"

**Placement**:
- Header bar: Small status dot next to group name
- Settings screen: Detailed sync status section
- Error states: Full-screen overlay for critical sync issues

## User Experience Flows

### Primary Flow: Create Group and Add First Expense

1. **App Launch** → Welcome screen (first time) or Dashboard
2. **Create Group** → Enter group name → Set currency → Generate QR code
3. **Invite Members** → Share QR code → Wait for members to join
4. **Add Expense** → Enter amount → Add description → Select participants
5. **Choose Split** → Equal/Custom/Percentage → Review split
6. **Save Expense** → Return to dashboard → See updated balances

### Secondary Flow: Join Group and View Settlement

1. **Scan QR Code** → Join group confirmation → Dashboard loads
2. **View Expenses** → Browse expense list → Understand group activity
3. **Check Balance** → See personal balance → Understand who owes what
4. **Calculate Settlement** → View optimal payments → Mark payments made
5. **Export Data** → Generate CSV → Share via preferred method

### Error Handling Flows

**Network Issues**:
1. Action attempted while offline → Clear offline indicator shown
2. Data entered offline → Saved locally with "pending sync" indicator  
3. Connection restored → Automatic sync with progress indicator
4. Sync conflict → Clear resolution interface with both versions shown

**Data Validation**:
1. Invalid expense amount → Real-time validation message
2. Unbalanced split → Prevention with clear error and suggestion
3. Empty required fields → Highlight missing fields with helpful text

### Interaction Patterns

**Gesture Navigation**:
- **Swipe right on expense**: Edit expense
- **Swipe left on expense**: Delete expense (with confirmation)
- **Pull to refresh**: Refresh data and attempt sync
- **Long press on member**: Quick actions menu (remove, edit)

**Touch Targets**:
- Minimum 48px × 48px for all interactive elements
- 56px × 56px for primary actions (FAB, main buttons)
- 8px minimum spacing between adjacent touch targets

**Feedback**:
- Immediate visual feedback on touch (button press states)
- Loading states for operations > 200ms
- Success/error toasts for completed actions
- Haptic feedback for important actions (iOS)

## Multi-Currency & Offline UX

### Currency Display Patterns

**Primary Amount Display**:
- Native currency entered: `$25.00 USD`
- Converted to group currency: `€22.15 EUR` (smaller, below)
- Exchange rate note: `Rate: 1.13 on Dec 15` (caption size)

**Multi-Currency Balance**:
- Group default currency shown prominently
- "View in original currencies" expandable section
- Clear indication when amounts are converted
- Exchange rate freshness indicator

**Currency Selection UI**:
- Search-enabled currency picker
- Common currencies at top
- Recent selections
- Flag icons for visual recognition

### Sync Status Communication

**Dashboard Sync Indicator**:
- Real-time status with clear icons and colors
- Tap to see detailed sync information
- Last successful sync timestamp
- Number of pending changes (if any)

**Conflict Resolution Interface**:
1. **Conflict Detected**: Clear notification with red indicator
2. **Comparison View**: Side-by-side view of conflicting versions
3. **Resolution Options**: Keep yours, keep theirs, or merge
4. **Confirmation**: Review merged result before applying

**Offline Capability Communication**:
- Entry screen: "Working offline" banner (dismissible)
- Clear indication of which features require internet
- Graceful degradation for exchange rate features
- Data freshness indicators throughout app

## Accessibility & Usability

### Touch Targets & Spacing

**Minimum Requirements**:
- Touch targets: 48px × 48px minimum
- Primary actions: 56px × 56px preferred
- Adjacent targets: 8px minimum spacing
- Text line height: 1.4× font size for readability

**Thumb-Friendly Design**:
- FAB positioned in natural thumb reach area
- Primary actions in bottom half of screen when possible
- Secondary actions accessible but not accidental
- One-handed operation for core features

### Color Contrast & Readability

**WCAG 2.1 AA Compliance**:
- Normal text: 4.5:1 contrast ratio minimum
- Large text (18px+): 3:1 contrast ratio minimum
- Interactive elements: Clear focus indicators
- Error states: Don't rely on color alone

**Color-Blind Friendly**:
- Positive/negative amounts use icons in addition to color
- Status indicators include shapes and text labels
- Interactive elements have multiple visual cues

### Screen Reader Support

**Semantic Structure**:
- Proper heading hierarchy (H1, H2, H3)
- Meaningful alt text for icons and images
- Form labels properly associated with inputs
- Button text describes action clearly

**Dynamic Content**:
- Live regions for balance updates
- Status announcements for successful actions
- Error messages read automatically
- Loading states announced

### Text Sizing & Dynamic Type

**Scalability**:
- Support iOS Dynamic Type and Android font scaling
- Layout remains functional at 200% text size
- Touch targets scale appropriately
- Maintain visual hierarchy at all sizes

**Reading Experience**:
- Sufficient line spacing for comfortable reading
- Appropriate text contrast in all themes
- Important information remains visible when scaled

### Theme Support

**Light Theme** (Default):
- Background: `#FFFFFF`
- Surface: `#F8FAFC`
- Text: `#0F172A` on light backgrounds

**Dark Theme**:
- Background: `#0F172A`
- Surface: `#1E293B`
- Text: `#F8FAFC` on dark backgrounds
- Adjusted accent colors for dark theme accessibility

**System Theme**:
- Automatic switching based on device settings
- Smooth transitions between themes
- Consistent branding in both themes

## Developer Handoff Specifications

### CSS Custom Properties

```css
:root {
  /* Colors */
  --color-primary: #2563EB;
  --color-primary-light: #3B82F6;
  --color-primary-dark: #1E40AF;
  
  --color-success: #10B981;
  --color-warning: #F59E0B;
  --color-error: #EF4444;
  --color-info: #8B5CF6;
  
  --color-background: #FFFFFF;
  --color-surface: #F8FAFC;
  --color-border: #E2E8F0;
  
  --color-text-primary: #0F172A;
  --color-text-secondary: #64748B;
  --color-text-disabled: #94A3B8;
  
  /* Typography */
  --font-family-primary: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-family-mono: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', monospace;
  
  --font-size-xs: 11px;
  --font-size-sm: 12px;
  --font-size-base: 14px;
  --font-size-lg: 16px;
  --font-size-xl: 18px;
  --font-size-2xl: 20px;
  --font-size-3xl: 24px;
  --font-size-4xl: 32px;
  
  /* Spacing */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;
  --space-2xl: 48px;
  
  /* Border Radius */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-full: 9999px;
  
  /* Shadows */
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.1);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.15);
  --shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.2);
}
```

### Component Implementation Notes

**React Native/Expo Considerations**:
- Use `StyleSheet.create()` for performance
- Implement haptic feedback on iOS using `Haptics.impactAsync()`
- Use `SafeAreaView` for proper screen boundaries
- Implement dark theme using `Appearance` API

**Animation Specifications**:
- Button press animations: 150ms ease-out
- Screen transitions: 300ms ease-in-out
- Loading animations: 1000ms linear loop
- Micro-interactions: 200ms ease-out
- FAB entrance: 400ms spring animation

**Performance Considerations**:
- List virtualization for expense lists > 50 items
- Image optimization for receipt photos
- Debounced search input (300ms delay)
- Lazy loading for non-critical screens
- Efficient re-rendering for balance calculations

### Asset Requirements

**Icons**:
- SVG format preferred for scalability
- 24px base size with 2px stroke weight
- Consistent style across all icons
- Export in 1x, 2x, 3x for React Native

**Images**:
- App icon: 1024×1024px (iOS), adaptive icon (Android)
- Splash screen assets for various screen densities
- Empty state illustrations: Simple, on-brand style
- Onboarding graphics: Lightweight SVG preferred

**Typography Assets**:
- Inter font family (Regular, Medium, SemiBold, Bold)
- Include variable font if supported by platform
- Fallback system fonts configured

This comprehensive design specification provides everything needed for the development team to build GroupSettle with a consistent, accessible, and delightful user experience. The design prioritizes simplicity and clarity while ensuring the app feels modern and trustworthy for financial data handling.