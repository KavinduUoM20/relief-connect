# Sri Lanka Crisis Help Web App

A public, no-login web application that connects people in need with those who can help during crisis situations. Fast, simple, and lightweight.

## 🎯 Goal

Create a *public, no-login web app* that lets anyone:
- **Request help** - Post their needs with location
- **Create a camp** - Register relief camps
- **View all requests & camps on a map** - See where help is needed and offer assistance

No login required. Fast, simple, lightweight.

---

## ✨ Main Features

### A) I Need Help

- **No login required**
- **Auto GPS** → or manual pin placement
- **Simple form**:
  - Category (Food/Water, Rescue, Medical, Shelter, Other)
  - Urgency (Low / Medium / High)
  - Short note (max 160 chars)
  - Approx area (e.g., "Kelaniya near bridge")
  - Contact: Phone / WhatsApp / No contact
- **Submit** → shown as a red/orange/green marker on map

### B) We Are a Camp

- **No login required**
- **Auto GPS** → or manual pin placement
- **Simple form**:
  - Camp type (Official / Community)
  - Name/landmark
  - People count (1–10, 10–50, 50+)
  - Needs (Food, Medical, Rescue, Clothes, Children/Elderly)
  - Short note
  - Contact (optional)
- Shows as **camp icon** on map

### C) I Can Help

- **No login required**
- Opens a **map** with:
  - All help requests (pins)
  - All camps (tent icons)
- **Zoom/pan** functionality
- **Tap marker** → see details
- If contact exists → **Call / WhatsApp** button
- **Filters**:
  - Type: All / Individuals / Camps
  - Category
  - District (optional)

---

## 🛠️ Tech Stack

- **Frontend**: Next.js (App Router), TypeScript, react-leaflet
- **Backend**: Next.js API routes
- **Database**: PostgreSQL
- **Map**: Leaflet + OpenStreetMap
- **UI**: Simple custom CSS (mobile-first)

---

## 📊 Data Models

### HelpRequest

```typescript
{
  id: string
  lat: number
  lng: number
  category: 'Food/Water' | 'Rescue' | 'Medical' | 'Shelter' | 'Other'
  urgency: 'Low' | 'Medium' | 'High'
  shortNote: string (max 160 chars)
  approxArea: string
  contactType: 'Phone' | 'WhatsApp' | 'None'
  contact?: string
  status: 'OPEN' | 'CLOSED'
  createdAt: Date
}
```

### Camp

```typescript
{
  id: string
  lat: number
  lng: number
  campType: 'Official' | 'Community'
  name: string
  peopleRange: '1-10' | '10-50' | '50+'
  needs: string[] // ['Food', 'Medical', 'Rescue', 'Clothes', 'Children/Elderly']
  shortNote: string
  contactType?: 'Phone' | 'WhatsApp' | 'None'
  contact?: string
  createdAt: Date
}
```

---

## 🔌 API Endpoints

### Help Requests

- `POST /api/help-requests` - Create a new help request
- `GET /api/help-requests` - Get all help requests

### Camps

- `POST /api/camps` - Create a new camp
- `GET /api/camps` - Get all camps

**Note**: All endpoints are public, no authentication required.

---

## 📱 Pages

### Home
- I need help (button/link)
- We are a camp (button/link)
- I can help (button/link)

### I Need Help
- GPS location detection → small form → submit

### We Are a Camp
- GPS location detection → simple form → submit

### I Can Help
- Map with markers + filters + popups
- Filter by type, category, district
- Click markers to see details and contact options

---

## 🛡️ Safety Features

- ✅ **No login required** - Fast access for everyone
- ✅ **No personal details** - Only optional phone/WhatsApp
- ✅ **No address** - Only approximate area
- ✅ **No photos** - Privacy-focused
- ✅ **Auto-expire data** - Requests expire after 30 days
- ⚠️ **Safety banner**: "Do not share OTPs or bank details."

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18.x or higher
- PostgreSQL 14.x or higher
- Yarn 4.x (via Corepack)
- Git

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/KavinduUoM20/relief-connect.git
   cd relief-connect
   ```

2. **Install dependencies**
   ```bash
   # Enable Corepack for Yarn
   corepack enable
   
   # Install all workspace dependencies
   yarn install
   ```

3. **Set up environment variables**
   
   Create `.env.local` in the root:
   ```env
   DATABASE_URL=postgresql://user:password@localhost:5432/relief_connect
   NODE_ENV=development
   ```

4. **Set up database**
   ```bash
   # Create database
   createdb relief_connect
   
   # Run migrations (when available)
   yarn db:migrate
   ```

5. **Start the development server**
   ```bash
   yarn web:dev
   ```
   App will run on http://localhost:3000

6. **Access the application**
   - Home: http://localhost:3000
   - I Need Help: http://localhost:3000/need-help
   - We Are a Camp: http://localhost:3000/camp
   - I Can Help: http://localhost:3000/help-map

---

## 📜 Available Scripts

```bash
yarn web:dev          # Start Next.js dev server
yarn web:build        # Build for production
yarn web:start        # Start production server
yarn db:migrate       # Run database migrations
yarn db:seed          # Seed database (if available)
yarn lint             # Run linter
yarn type-check       # Run TypeScript type checking
```

---

## 🏗️ Project Structure

```
relief-connect/
├── apps/
│   └── web/                    # Next.js frontend + API routes
│       ├── src/
│       │   ├── app/            # Next.js App Router pages
│       │   │   ├── page.tsx    # Home page
│       │   │   ├── need-help/  # I Need Help page
│       │   │   ├── camp/       # We Are a Camp page
│       │   │   └── help-map/   # I Can Help map page
│       │   ├── api/            # API routes
│       │   │   ├── help-requests/
│       │   │   └── camps/
│       │   ├── components/     # React components
│       │   │   ├── Map/        # Map component
│       │   │   ├── Forms/      # Form components
│       │   │   └── Filters/    # Filter components
│       │   └── lib/            # Utilities
│       │       ├── db.ts       # Database connection
│       │       └── types.ts    # TypeScript types
│       └── package.json
│
├── libs/
│   └── shared/                 # Shared utilities and types
│       └── src/
│           ├── dtos/           # Data Transfer Objects
│           └── interfaces/     # TypeScript interfaces
│
├── .github/
│   └── workflows/              # CI/CD pipelines
│
├── docker-compose.yml          # Docker Compose configuration
├── nx.json                     # NX configuration
└── package.json                # Root package.json
```

---

## 🗺️ Development Phases

### Phase 1 (MVP) ✅

- [x] Data models: HelpRequest, Camp
- [x] API endpoints: POST + GET for both
- [x] Pages: home, need-help, camp, help-map
- [x] Map showing markers
- [x] Basic form submissions
- [x] GPS location detection

### Phase 2 🚧

- [ ] Advanced filters (type, category, district)
- [ ] Map-bound loading (load markers in viewport)
- [ ] UI polish + mobile optimization
- [ ] Multi-language support (Sinhala, Tamil, English)
- [ ] Auto-expire old requests (30 days)
- [ ] Contact buttons (Call/WhatsApp)

### Phase 3 🔮

- [ ] Real-time updates
- [ ] Request status updates
- [ ] Admin dashboard (moderation)
- [ ] Analytics and reporting
- [ ] SMS notifications (optional)

---

## 🔧 Configuration

### Environment Variables

**Development (.env.local)**
```env
DATABASE_URL=postgresql://user:password@localhost:5432/relief_connect
NODE_ENV=development
NEXT_PUBLIC_MAP_TILE_URL=https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png
```

**Production**
```env
DATABASE_URL=postgresql://user:password@host:5432/relief_connect
NODE_ENV=production
NEXT_PUBLIC_MAP_TILE_URL=https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png
```

---

## 🗄️ Database Schema

### help_requests

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| lat | DECIMAL(10,8) | Latitude |
| lng | DECIMAL(11,8) | Longitude |
| category | VARCHAR(50) | Request category |
| urgency | VARCHAR(20) | Urgency level |
| short_note | VARCHAR(160) | Short description |
| approx_area | VARCHAR(255) | Approximate location |
| contact_type | VARCHAR(20) | Contact method |
| contact | VARCHAR(50) | Contact info (optional) |
| status | VARCHAR(20) | Request status |
| created_at | TIMESTAMP | Creation timestamp |

### camps

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| lat | DECIMAL(10,8) | Latitude |
| lng | DECIMAL(11,8) | Longitude |
| camp_type | VARCHAR(20) | Camp type |
| name | VARCHAR(255) | Camp name/landmark |
| people_range | VARCHAR(10) | People count range |
| needs | TEXT[] | Array of needs |
| short_note | TEXT | Description |
| contact_type | VARCHAR(20) | Contact method (optional) |
| contact | VARCHAR(50) | Contact info (optional) |
| created_at | TIMESTAMP | Creation timestamp |

---

## 🛡️ Security & Privacy

- ✅ **No authentication** - Public access for speed
- ✅ **Minimal data collection** - Only essential information
- ✅ **No personal addresses** - Only approximate areas
- ✅ **Optional contact** - Users choose to share
- ✅ **Auto-expiration** - Data expires after 30 days
- ✅ **Rate limiting** - Prevent abuse
- ✅ **Input validation** - Sanitize all inputs
- ⚠️ **Safety warnings** - Display security notices

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

MIT

---

## 🐛 Troubleshooting

### Database Connection Issues

```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Check connection string
psql $DATABASE_URL
```

### Map Not Loading

- Check browser console for errors
- Verify `NEXT_PUBLIC_MAP_TILE_URL` is set correctly
- Ensure internet connection (OpenStreetMap tiles)

### GPS Not Working

- Ensure HTTPS in production (required for geolocation API)
- Check browser permissions for location access
- Fallback to manual pin placement available

---

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Leaflet Documentation](https://leafletjs.com/reference.html)
- [React Leaflet Documentation](https://react-leaflet.js.org/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

---

## 📧 Support

For issues, questions, or contributions, please open an issue on [GitHub](https://github.com/KavinduUoM20/relief-connect/issues).

---

**Built with ❤️ to help connect people in need with those who can help**
