# Dolphin Aquarium 🐬

Premium aquarium web application and catalog for Dolphin Aquarium, Madipakkam, Chennai. Featuring full Supabase database persistence, real-time catalog management, WhatsApp order checkout, and a secure administrator dashboard.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 🔐 Administrator Access

The protected catalog management dashboard allows adding, updating, publishing/unpublishing, and deleting fish and aquarium products.

- **Admin Access URL**: `http://localhost:5173/#/admin` (or click **Admin Panel** in the footer)
- **User ID / Email**: `manosvsm20070@gmail.com`
- **Password**: `manosvsm`

### Admin Features
- 📊 **Real-time Inventory Overview**: Total items, in-stock count, live fish, published/draft status.
- ➕ **Product Management**: Add new livestock, pumps, food, and accessories with image upload and water parameter guides (pH, temperature, temperament).
- ✏️ **Edit & Publish Controls**: Instantly toggle draft/published status and update prices, stock, and sizes.
- 🗄️ **Supabase Cloud Backend**: Backed by PostgreSQL with Row Level Security (RLS) and storage buckets.

## 🛠️ Tech Stack
- **Frontend**: React 19, Vite, Lucide Icons
- **Database & Auth**: Supabase (PostgreSQL, Supabase Auth, Storage)
- **Styling**: Vanilla CSS with dark ocean theme & glassmorphic design
