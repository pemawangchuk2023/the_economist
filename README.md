# 📚 Economist Library Reader

> **Academic Learning Project** — Built for personal growth and technical exploration, not for commercial use.

A modern, full-stack web application for browsing, organizing, and reading The Economist magazine archives. Built with cutting-edge web technologies to explore real-world patterns in content management, state handling, and document rendering.

---

## 🎯 Project Vision

This project demonstrates professional full-stack development practices with a focus on:
- **Next.js App Router** for scalable, file-based routing
- **Component-driven architecture** with reusable UI patterns
- **Cloud storage integration** (Cloudflare R2) for efficient document delivery
- **Advanced state management** with Cloudflare R2-backed metadata persistence
- **Responsive UI design** with theme support (light/dark mode)
- **PDF rendering** and document streaming capabilities

This is an educational endeavor to master modern web development patterns, not a production service.

---

## 🏗️ Architecture

### Tech Stack
- **Frontend**: Next.js 16+ (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS + shadcn/ui component library
- **State Management**: R2-backed server state with optimistic client UI
- **Storage**: Cloudflare R2 (S3-compatible object storage)
- **Development**: ESLint, PostCSS, TypeScript strict mode

### Project Structure

```
economist/
├── app/                      # Next.js App Router
│   ├── layout.tsx           # Root layout & theme setup
│   ├── page.tsx             # Homepage
│   └── economist/           # Main feature routes
│       ├── [year]/[month]/  # Dynamic issue navigation
│       ├── read/            # PDF reader experience
│       ├── bookmarks/       # User bookmarks collection
│       └── download/        # Content delivery routes
├── components/
│   ├── economist/           # Feature-specific components
│   ├── theme/               # Theme provider & toggle
│   └── ui/                  # Reusable UI components (shadcn)
├── lib/
│   ├── economist.ts         # Core business logic
│   ├── economist-store.ts   # R2-backed library metadata store
│   ├── r2.ts                # Cloud storage client
│   └── utils.ts             # Utility functions
├── types/                   # TypeScript definitions
├── data/                    # JSON data files
└── actions/                 # Server actions (if used)
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18.17+
- npm or yarn package manager

### Installation

```bash
# Clone or extract the project
cd economist

# Install dependencies
npm install
```

### Development

```bash
# Start development server (with hot reload)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Build for Production

```bash
# Create optimized production build
npm run build

# Start production server
npm run start
```

### Code Quality

```bash
# Run ESLint
npm run lint

# Format code
npm run format  # if configured
```

---

## 📖 Key Features

### 1. **Issue Browser**
   - Navigate The Economist archives by year and month
   - Dynamic routing for efficient issue discovery
   - Clean, responsive grid layouts

### 2. **PDF Reader**
   - Stream PDF documents directly in-browser
   - Optimized rendering with Cloudflare R2 integration
   - Responsive design for desktop and tablet viewing

### 3. **Bookmark System**
   - Per-user bookmark persistence in Cloudflare R2
   - Quick access to saved issues
   - Download counts stored with library metadata

### 4. **Theme Support**
   - Light/dark mode toggle
   - System preference detection
   - Persistent theme selection

### 5. **Content Streaming**
   - Efficient file delivery via cloud storage
   - Optimized caching strategies
   - RESTful download API endpoints

---

## 🛠️ Development Patterns

### Server Components vs Client Components
This project uses Next.js 13+ App Router with intelligent component splitting:
- **Server Components**: Layouts, data fetching, metadata management
- **Client Components**: Interactive features, theme switching, state management

### State Management
Server-backed metadata state for:
- Per-user bookmarks
- Global download counts
- Theme selection remains client-side through the theme provider

### Server Actions
RESTful API routes in `app/*/route.ts` for:
- Document downloading
- Content streaming
- File serving

---

## 🔧 Configuration

### Next.js Config
See `next.config.ts` for:
- Image optimization
- Font loading
- Build optimization

### TypeScript
Strict mode enabled in `tsconfig.json` for type safety

### ESLint
Configured for code quality checks in `eslint.config.mjs`

---

## 📚 Learning Outcomes

By exploring this codebase, you'll understand:
- ✅ Modern React patterns with Server Components
- ✅ File-based routing with dynamic segments
- ✅ TypeScript for large applications
- ✅ Component composition and reusability
- ✅ State management without Redux
- ✅ Cloud storage integration (R2/S3)
- ✅ PDF rendering in web browsers
- ✅ Theme systems and dark mode
- ✅ Responsive design with Tailwind CSS
- ✅ Development workflow optimization

---

## 📝 Notes for Contributors

This project is open for educational exploration. Feel free to:
- Study the architecture and patterns
- Experiment with new features
- Optimize performance
- Refactor components
- Add tests

**Remember**: This is an academic project for learning and growth. Use it as a reference, but respect The Economist's intellectual property rights regarding content.

---

## 🤝 Acknowledgments

Built with:
- [Next.js](https://nextjs.org) - React framework
- [shadcn/ui](https://ui.shadcn.com) - UI component library
- [Tailwind CSS](https://tailwindcss.com) - Utility-first CSS
- [Cloudflare R2](https://www.cloudflare.com/products/r2/) - Object storage
- [Vercel](https://vercel.com) - Deployment platform

---

## 📄 License

This project is for **academic learning purposes only**. It is not intended for commercial use or distribution of copyrighted content.

---

**Happy coding! 🚀**
