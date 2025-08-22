# Home Page Quick Actions Update

## Overview
Updated the home page quick actions section to rename "Event Planning" to "Event Management" and added a new "Event Planning" button that redirects to the dedicated event planning page.

## Changes Made

### 1. Quick Actions Array Update
- **Renamed**: "Event Planning" → "Event Management" 
  - Keeps the same functionality (opens EventBookingModal)
  - Maintains the PartyPopper icon
  - Description: "Organize special occasions"

- **Added**: New "Event Planning" action
  - Title: "Event Planning"
  - Description: "Find event managers & services"
  - Icon: Calendar
  - Action: Navigates to `/event-planning` page
  - Opens the new OLX-style event planning marketplace

### 2. Grid Layout Update
- Changed grid from `grid-cols-2 lg:grid-cols-3` to `grid-cols-2 lg:grid-cols-4`
- This accommodates the new fourth quick action button
- Maintains responsive design with 2 columns on mobile and 4 on larger screens

## File Modified
- `src/pages/HomePage.tsx`

## Quick Actions Now Include:
1. **Book Table** - Opens table booking modal
2. **Order Food** - Opens food ordering modal  
3. **Event Management** - Opens event booking modal (renamed from "Event Planning")
4. **Event Planning** - Redirects to event planning marketplace page (new)

## User Experience
- Users can now distinguish between:
  - **Event Management**: For organizing events at specific restaurants
  - **Event Planning**: For finding professional event managers and services
- Clear separation of concerns between restaurant-based events and professional event planning
- Maintains existing functionality while adding new capabilities
