# GroupSettle - Product Requirements Document (PRD)

## Product Overview

**Product Name**: GroupSettle (Expense Settlement App)  
**Product Type**: Local mobile application for group expense tracking and settlement  
**Target Platform**: Mobile (iOS/Android)  
**Architecture**: Hybrid local-first with minimal database involvement  

### Problem Statement
Groups of people struggle to track shared expenses across multiple currencies and calculate fair settlements with minimal transactions. Current solutions require cloud services, subscriptions, or complex setups that don't work well offline or for casual use.

### Solution
A lightweight, local-first expense settlement app that handles multi-currency expenses, calculates optimal settlement paths, and works completely offline with simple peer-to-peer synchronization.

## Core Features & Requirements

### 1. Group Management
- **Group Creation**: Users can create expense groups with custom names
- **Member Joining**: QR code-based invitation system for easy group joining
- **Group Settings**: Set default base currency for the group
- **Member Management**: View all group members and their participation status

### 2. Expense Entry
- **Quick Entry**: Add expenses with description, amount, currency, and date
- **Flexible Splitting**:
  - Equal split among selected members
  - Custom amounts per person
  - Percentage-based splits
  - Exclude specific members from individual expenses
- **Multi-Currency Support**: Support for any currency input
- **Expense Categories**: Optional categorization (food, transport, accommodation, etc.)
- **Receipt Reference**: Optional photo attachment or notes

### 3. Currency Management
- **Real-Time Exchange Rates**: Fetch current rates when online
- **Offline Rate Caching**: Store exchange rates for offline use
- **Historical Rate Locking**: Use exchange rate from expense entry date
- **Manual Rate Override**: Allow custom exchange rates for specific expenses
- **Base Currency Conversion**: Display all amounts in group's base currency

### 4. Settlement System
- **Smart Settlement Calculation**: Calculate optimal payment paths to minimize total transactions
- **Settlement Recommendations**: Generate "who pays whom" suggestions
- **Settlement Tracking**: Mark expenses/groups as settled with date and method
- **Partial Payments**: Handle and track partial settlement payments
- **Multi-Currency Settlements**: Allow settlements in any supported currency

### 5. Data Storage & Sync
- **Local Storage**: File-based JSON storage (no complex database)
- **Hybrid Sync Strategy**:
  - Primary: Auto-sync with nearby devices on same WiFi network
  - Backup: Manual export/import via file sharing
- **Conflict Resolution**: Timestamp-based conflict resolution with manual override option
- **Data Structure**: Single JSON file per group containing all expenses and member data

### 6. Export & Reporting
- **CSV Export Options**:
  - All expenses with full details
  - Settlement summary (who owes whom)
  - Member balance sheet
  - Date range filtering
  - Currency conversion details
- **Export Sharing**: Share CSV files via standard device sharing options
- **Settlement Status**: Track and export settled vs. unsettled expenses

## Technical Requirements

### Data Architecture
- **Storage**: Local JSON files (one per group)
- **No Database**: Avoid complex database setup - pure file-based
- **Data Format**: Human-readable JSON structure
- **Exchange Rate API**: Integration with free exchange rate service (ExchangeRate-API or similar)

### Sync Requirements
- **Local Network Discovery**: mDNS/Bonjour for device discovery
- **File Transfer**: Simple peer-to-peer file transfer for sync
- **Manual Sharing**: Export/import via standard device sharing (AirDrop, messaging apps, etc.)
- **Offline First**: All features work without internet connection

### Performance Requirements
- **Startup Time**: < 2 seconds on standard mobile devices
- **Calculation Speed**: Settlement calculations complete within 1 second for groups up to 50 people
- **Storage Efficiency**: Minimal storage footprint, human-readable data files

## User Experience Requirements

### Core User Flows
1. Create Group → Generate QR → Others scan to join
2. Add Expense → Select participants → Choose split method → Save
3. View Balances → Calculate settlements → Mark as settled
4. Export Data → Choose format → Share via preferred method

### Interface Requirements
- **Minimalist Design**: Clean, simple interface focused on essential functions
- **Offline Indicators**: Clear status showing sync state and data freshness
- **Quick Actions**: One-tap expense entry and settlement calculation
- **Multi-Language Support**: Support for major currencies and basic localization

## Success Metrics

### Primary Metrics
- **User Adoption**: Number of groups created and actively used
- **Feature Usage**: Frequency of expense entry and settlement calculations
- **Sync Success**: Percentage of successful data synchronization between devices

### Secondary Metrics
- **Export Usage**: Frequency of CSV exports
- **Multi-Currency Usage**: Percentage of groups using multiple currencies
- **Settlement Completion**: Rate of expenses marked as settled

## Out of Scope (V1)
- Cloud synchronization or server infrastructure
- User accounts or authentication systems
- Advanced receipt scanning/OCR
- Integration with payment services (Venmo, PayPal, etc.)
- Complex reporting or analytics
- Web application version
- Real-time collaboration features

## Risk Considerations

### Technical Risks
- **Data Loss**: Local-only storage without cloud backup
- **Sync Conflicts**: Complex conflict resolution in peer-to-peer scenarios
- **Exchange Rate API**: Dependency on external API for currency conversion

### Mitigation Strategies
- Simple export/import for data backup
- Timestamp-based conflict resolution with manual override
- Multiple API fallbacks and offline rate caching

## Target Users

### Primary Users
- Travel groups (friends, families on vacation)
- Roommates sharing household expenses
- Student groups with mixed nationalities
- Small teams on business trips

### User Characteristics
- Tech-comfortable but prefer simple solutions
- Value privacy and offline functionality
- Need occasional rather than daily expense tracking
- Often deal with multiple currencies