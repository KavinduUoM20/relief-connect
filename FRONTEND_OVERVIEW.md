# Frontend Overview - Relief Connect

## 🏗️ Architecture Overview

The frontend is a **Next.js 15** application built with **React 18** and **TypeScript**, part of an NX monorepo structure. It's designed as a crisis relief platform connecting people in need with those who can help in Sri Lanka.

### Tech Stack

- **Framework**: Next.js 15.0.3 (Pages Router)
- **React**: 18.3.1
- **TypeScript**: 5.3.3
- **Styling**: 
  - Tailwind CSS 4.1.17
  - CSS Modules (for component-specific styles)
  - shadcn/ui components (New York style)
- **Maps**: Leaflet 1.9.4 + React-Leaflet 4.2.1
- **HTTP Client**: Native Fetch API (custom ApiClient wrapper)
- **UI Components**: 
  - Radix UI primitives (Dialog, Select, Label, Slot)
  - Lucide React icons
  - Custom shadcn/ui components
- **State Management**: React Hooks (useState, useEffect, useMemo)
- **Form Handling**: Controlled components with React state

---

## 📁 Project Structure

```
apps/web/
├── src/
│   ├── components/          # React components
│   │   ├── ui/              # shadcn/ui components (Button, Card, Dialog, etc.)
│   │   ├── LandingPage.tsx  # Main landing page component
│   │   ├── Map.tsx          # Interactive map component
│   │   ├── HelpRequestForm.tsx
│   │   ├── CampForm.tsx
│   │   ├── DonationForm.tsx
│   │   ├── EmergencyRequestForm.tsx
│   │   ├── LocationPicker.tsx
│   │   ├── MapFilters.tsx
│   │   └── SafetyBanner.tsx
│   ├── pages/               # Next.js pages (file-based routing)
│   │   ├── _app.tsx         # App wrapper
│   │   ├── index.tsx        # Home page
│   │   ├── map.tsx          # Map dashboard
│   │   ├── need-help.tsx    # Individual help request
│   │   ├── camp.tsx         # Camp registration
│   │   ├── donate.tsx        # Donation page
│   │   ├── help.tsx         # Help page
│   │   ├── requests.tsx     # View all requests
│   │   ├── my-requests.tsx  # User's requests
│   │   ├── login.tsx
│   │   └── register.tsx
│   ├── services/            # API service layer
│   │   ├── api-client.ts    # HTTP client wrapper
│   │   ├── help-request-service.ts
│   │   ├── camp-service.ts
│   │   └── index.ts
│   ├── types/               # TypeScript type definitions
│   │   ├── help-request.ts
│   │   └── camp.ts
│   ├── data/                # Static data
│   │   └── sri-lanka-locations.ts  # Provinces, districts, coordinates
│   ├── lib/                 # Utility functions
│   │   └── utils.ts         # cn() helper for className merging
│   └── styles/              # CSS files
│       ├── globals.css      # Global styles + Tailwind
│       ├── Form.module.css
│       ├── Map.module.css
│       ├── LocationPicker.module.css
│       └── ...
├── components.json           # shadcn/ui configuration
├── next.config.ts           # Next.js configuration
├── package.json
└── tsconfig.json
```

---

## 🎯 Key Features

### 1. **Landing Page** (`LandingPage.tsx`)
- **Dual-mode interface**: "I Need Help" vs "I Can Help"
- **User authentication**: Simple identifier-based login (email/phone)
- **Analytics dashboard**: Shows total requests, people, meals needed, donations
- **Request listing**: Grid view of help requests with filters
- **Search & filters**: 
  - Search by text
  - Filter by province/district
  - Filter by urgency level (Low/Medium/High)
  - Filter by type (Individual/Group)
- **Request cards**: Display request details with urgency badges
- **Modal dialogs**: Detailed view of each request

### 2. **Interactive Map** (`Map.tsx` + `map.tsx`)
- **Leaflet integration**: Interactive map showing Sri Lanka
- **Markers**: 
  - Help requests (color-coded by urgency: red=high, orange=medium, green=low)
  - Camps (blue markers with tent icon)
- **Popups**: Click markers to see details and contact options
- **Dynamic filtering**: Map updates based on applied filters
- **Location-based centering**: Auto-centers on selected district/province
- **Contact integration**: Direct phone/WhatsApp links from map popups

### 3. **Forms**
- **Help Request Form**: Individual help requests
- **Camp Form**: Group/camp registration
- **Donation Form**: For donors
- **Emergency Request Form**: Quick emergency submissions
- **Location Picker**: Interactive map-based location selection
- **Validation**: Client-side validation with error messages

### 4. **Services Layer**
- **ApiClient**: Centralized HTTP client with error handling
- **Service classes**: Singleton pattern for API services
- **Type-safe**: Uses shared DTOs from monorepo
- **Error handling**: Graceful error handling with user-friendly messages

---

## 🔌 API Integration

### API Client (`api-client.ts`)
- **Base URL**: Configurable via `NEXT_PUBLIC_API_URL` (defaults to `http://localhost:3000`)
- **Methods**: GET, POST, PUT, PATCH, DELETE
- **Features**:
  - Query parameter support
  - JSON request/response handling
  - Error handling with descriptive messages
  - Connection error detection

### Services
- **HelpRequestService**: 
  - `getAllHelpRequests(filters?)` - Get filtered requests
  - `createHelpRequest(data)` - Create new request
- **CampService**:
  - `getAllCamps(filters?)` - Get filtered camps
  - `createCamp(data)` - Create new camp

### Shared Types
The frontend uses shared types from `@nx-mono-repo-deployment-test/shared`:
- DTOs (Data Transfer Objects)
- Enums (Urgency, HelpRequestCategory, CampType, etc.)
- Interfaces (ICreateHelpRequest, ICamp, etc.)

---

## 🎨 Styling Approach

### Tailwind CSS 4
- **Utility-first**: Extensive use of Tailwind utility classes
- **Custom theme**: Configured with CSS variables for colors, shadows, spacing
- **Dark mode**: CSS variables support dark mode (though not fully implemented)
- **Responsive**: Mobile-first responsive design

### CSS Modules
- Component-specific styles in `.module.css` files
- Scoped to components
- Used for complex component styling (Map, Forms, LocationPicker)

### shadcn/ui Components
- **Style**: New York variant
- **Components**: Button, Card, Dialog, Drawer, Input, Label, Select, Textarea
- **Customizable**: Uses Tailwind + CSS variables
- **Accessible**: Built on Radix UI primitives

---

## 🗺️ Routing

Next.js Pages Router (file-based routing):

- `/` - Landing page (index.tsx)
- `/map` - Map dashboard
- `/need-help` - Individual help request form
- `/camp` - Camp registration form
- `/donate` - Donation page
- `/help` - Help page
- `/requests` - View all requests
- `/my-requests` - User's requests
- `/login` - Login page
- `/register` - Registration page

---

## 📊 State Management

**No global state library** - Uses React's built-in state:

1. **Component State**: `useState` for local component state
2. **Derived State**: `useMemo` for computed values (filtered lists, analytics)
3. **Side Effects**: `useEffect` for data fetching, URL sync, localStorage
4. **URL State**: Query parameters for filters (map page)
5. **Persistent State**: `localStorage` for user session

### State Patterns
- **Lifting state up**: Shared state in parent components
- **Controlled components**: Forms use controlled inputs
- **Optimistic updates**: UI updates before API confirmation (in some cases)

---

## 🗄️ Data Management

### Static Data
- **Sri Lanka locations**: Provinces, districts, coordinates in `sri-lanka-locations.ts`
- **Mock data**: Currently using mock data for development (in LandingPage, Map)

### API Data Flow
1. User action triggers service call
2. Service calls API via ApiClient
3. Response handled with error checking
4. State updated with response data
5. UI re-renders with new data

### Data Types
- **Help Requests**: Category, urgency, location, contact info
- **Camps**: Type, people range, needs, location
- **Filters**: Province, district, urgency, type

---

## 🔐 Authentication

**Simple identifier-based authentication**:
- User enters email/phone as identifier
- Stored in `localStorage` as `donor_user`
- Token-based URL parameter support
- No backend authentication (currently)
- Session persists across page reloads

---

## 📱 Responsive Design

- **Mobile-first**: Designed for mobile, enhanced for desktop
- **Breakpoints**: Uses Tailwind's default breakpoints (sm, md, lg, xl)
- **Flexible layouts**: Grid and flexbox for responsive layouts
- **Touch-friendly**: Large buttons, adequate spacing

---

## 🚀 Performance Optimizations

1. **Dynamic imports**: Map component loaded dynamically (no SSR)
2. **Memoization**: `useMemo` for expensive computations (filtering, analytics)
3. **Code splitting**: Next.js automatic code splitting
4. **Image optimization**: (if images are added, Next.js Image component)
5. **Lazy loading**: Map component lazy loaded

---

## 🛠️ Development Setup

### Scripts
```bash
npm run web:dev      # Start dev server (port 3001)
npm run web:build    # Production build
npm run web:start    # Start production server
npm run type-check   # TypeScript type checking
```

### Environment Variables
- `NEXT_PUBLIC_API_URL`: API base URL (default: `http://localhost:3000`)

### Dependencies
- **Core**: Next.js, React, TypeScript
- **UI**: Tailwind, shadcn/ui, Radix UI, Lucide icons
- **Maps**: Leaflet, React-Leaflet
- **Utils**: clsx, tailwind-merge, class-variance-authority

---

## 🎯 Key Components Breakdown

### `LandingPage.tsx`
- **975 lines**: Main application component
- **Three view modes**: Initial, Need Help, Can Help
- **Complex state**: Multiple filters, search, user session
- **Analytics**: Real-time calculation from request data
- **Request grid**: Responsive card layout

### `Map.tsx`
- **Leaflet integration**: Interactive map with markers
- **Custom icons**: Color-coded by urgency
- **Popups**: Rich content with contact buttons
- **Dynamic updates**: Responds to filter changes

### `HelpRequestForm.tsx`
- **Form validation**: Client-side validation
- **Location picker**: Integrated map selection
- **Category/urgency**: Dropdown selections
- **Contact types**: Phone, WhatsApp, Email, None

### `api-client.ts`
- **Singleton pattern**: Single instance exported
- **Error handling**: Comprehensive error messages
- **Type-safe**: Generic methods with TypeScript
- **Query params**: Built-in URL parameter support

---

## 🔄 Data Flow Example

**Creating a Help Request**:
1. User fills form in `/need-help`
2. Form calls `handleSubmit` with form data
3. `handleSubmit` calls `helpRequestService.createHelpRequest(data)`
4. Service uses `apiClient.post('/api/help-requests', data)`
5. ApiClient makes fetch request to backend
6. Response handled, success/error shown to user
7. User redirected or form reset

---

## 📝 Type Safety

- **Shared types**: Uses types from shared library
- **Frontend-specific types**: Additional types in `types/` directory
- **Strict TypeScript**: `strict: true` in tsconfig
- **Type inference**: Leverages TypeScript inference where possible

---

## 🎨 UI/UX Features

- **Gradient backgrounds**: Modern gradient designs
- **Card-based layout**: Clean card components
- **Hover effects**: Interactive hover states
- **Loading states**: Loading indicators during API calls
- **Error messages**: User-friendly error display
- **Success feedback**: Visual feedback on actions
- **Responsive navigation**: Mobile-friendly navigation
- **Accessibility**: Radix UI provides accessible components

---

## 🔮 Future Considerations

Based on the codebase, potential improvements:
1. **State management**: Consider Redux/Zustand for complex state
2. **Real API integration**: Replace mock data with actual API calls
3. **Authentication**: Implement proper auth (JWT, OAuth)
4. **Caching**: Add request caching (React Query, SWR)
5. **PWA**: Make it a Progressive Web App
6. **Testing**: Add unit/integration tests
7. **Error boundaries**: React error boundaries for better error handling
8. **Internationalization**: i18n support for multiple languages

---

## 📚 Key Files Reference

| File | Purpose |
|------|---------|
| `src/pages/_app.tsx` | App wrapper, global styles |
| `src/pages/index.tsx` | Home page entry point |
| `src/components/LandingPage.tsx` | Main landing page component |
| `src/components/Map.tsx` | Interactive map component |
| `src/services/api-client.ts` | HTTP client |
| `src/services/help-request-service.ts` | Help request API service |
| `src/services/camp-service.ts` | Camp API service |
| `src/types/help-request.ts` | Help request types |
| `src/types/camp.ts` | Camp types |
| `src/data/sri-lanka-locations.ts` | Location data |
| `next.config.ts` | Next.js configuration |
| `components.json` | shadcn/ui configuration |

---

This frontend is a well-structured, modern React application built with best practices, focusing on user experience and maintainability. The codebase is clean, type-safe, and ready for production with proper API integration.

