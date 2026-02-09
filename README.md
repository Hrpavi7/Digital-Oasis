# Digital Oasis

An intelligent PC organization application that helps you clean, organize, and optimize your computer files with AI-powered tools and gamification features.

## Overview

Digital Oasis is a modern desktop application built with React and Vite that transforms how you manage your PC files. It provides intelligent file analysis, automated organization, cleaning recommendations, and gamification elements to make PC maintenance engaging and efficient. The platform integrates with Base44 for backend services and offers comprehensive tools for personal file management.

## Features

### Core PC Organization
- **Smart File Scanning**: Deep analysis of your PC files, folders, and storage usage
- **Intelligent File Organization**: AI-powered categorization and smart folder structure recommendations
- **Duplicate File Detection**: Find and remove duplicate files to free up storage space
- **Storage Cleanup**: Identify large files, temporary files, and unused applications
- **Automated File Renaming**: Smart naming suggestions based on file content and metadata

### Cleaning & Optimization
- **System Cleanup**: Remove temporary files, cache, and system junk
- **Large File Detection**: Identify and manage space-consuming files
- **Unused Application Detection**: Find and remove unused programs
- **Scheduled Cleaning**: Set up automated cleaning routines
- **Cleaning Rules**: Customizable rules for automated file management

### AI-Powered Assistance
- **File Analysis**: AI examines file content to suggest optimal organization
- **Smart Recommendations**: Intelligent suggestions for file categorization
- **Chatbot Assistant**: Get help with file organization tasks
- **Content Recognition**: Automatic tagging and categorization of documents and media

### Gamification & Motivation
- **Achievement System**: Earn rewards for completing organization tasks
- **Progress Tracking**: Visual progress indicators for cleaning goals
- **Challenges**: Daily and weekly challenges to maintain organization
- **Points System**: Accumulate points for maintaining a clean PC
- **Team Competitions**: Compare progress with friends or colleagues

### Backup & Security
- **Backup Management**: Automated backup of important files before cleaning
- **Security Auditing**: Monitor file permissions and access patterns
- **Safe Deletion**: Confirm important file deletions with backup options
- **Recovery Options**: Restore accidentally deleted files from backup

## Technology Stack

### Frontend
- **React 18** - Modern UI framework with hooks and concurrent features
- **Vite** - Fast build tool and development server
- **React Router v7** - Client-side routing and navigation
- **TanStack Query** - Data fetching and state management
- **React Hook Form** - Form handling and validation
- **Zod** - Schema validation and type safety

### UI/UX
- **Radix UI** - Unstyled, accessible component primitives
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful and consistent icon library
- **Framer Motion** - Animation and gesture library
- **Recharts** - Data visualization and charting

### Backend Integration
- **Base44 SDK** - Backend services and API integration
- **React Query** - Efficient data synchronization
- **TypeScript** - Type-safe development (configured)

### Development Tools
- **ESLint** - Code linting and quality assurance
- **PostCSS** - CSS processing and optimization
- **Autoprefixer** - Vendor prefix automation

## Project Structure

```
digital-oasis/
├── src/
│   ├── api/              # API clients and Base44 integrations
│   ├── components/       # Reusable UI components
│   │   ├── analytics/   # Storage usage and cleaning analytics
│   │   ├── assistant/   # AI chatbot for organization help
│   │   ├── automation/  # Automated cleaning rules and workflows
│   │   ├── backup/      # File backup management before cleanup
│   │   ├── gamification/ # Achievement and challenge UI
│   │   ├── organize/    # File organization and categorization tools
│   │   ├── scan/        # PC scanning and analysis interface
│   │   ├── security/    # File security and permission auditing
│   │   └── ui/          # Base UI components (Radix)
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Utility libraries and contexts
│   ├── pages/           # Main application pages
│   └── utils/           # Helper functions
├── entities/             # Data models for files, backups, cleaning rules
└── public/              # Static assets
```

## Installation

### Prerequisites
- Node.js (version 18 or higher)
- npm or yarn package manager

### Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/Hrpavi7/Digital-Oasis.git
   cd Digital-Oasis
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables (if required for Base44 integration)

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:5173`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking

## Configuration

The application uses several configuration files:
- `vite.config.js` - Vite build configuration
- `tailwind.config.js` - Tailwind CSS configuration
- `jsconfig.json` - JavaScript/TypeScript configuration
- `eslint.config.js` - ESLint rules and settings

## API Integration

Digital Oasis integrates with Base44 for backend services to manage PC organization tasks. The API client is configured in `src/api/base44Client.js` and provides:
- File system analysis and scanning
- Storage usage tracking and analytics
- Backup management for important files
- Cleaning rule automation and scheduling
- Achievement and progress tracking
- Real-time synchronization of organization progress

## Key Components

### File Analysis & Organization
- **AIFileAnalyzer**: Deep analysis of file content and metadata for intelligent categorization
- **SmartRenamer**: Automated file naming based on content, date, and type analysis
- **FilePreview**: Multi-format preview for documents, images, and media files
- **DuplicateDetector**: Advanced algorithms to identify duplicate files across your system

### Cleaning & Optimization
- **CleaningRuleCreator**: Customizable rules for automated file cleanup
- **LargeFileDetector**: Identify space-consuming files and provide management options
- **SystemCleanup**: Remove temporary files, cache, and system junk safely
- **ScheduleManager**: Set up automated cleaning schedules and maintenance routines

### AI-Powered Features
- **AIChatbot**: Interactive assistant for file organization guidance and support
- **ContentRecognition**: AI-powered tagging and categorization of documents and media
- **SmartRecommendations**: Intelligent suggestions for optimal file organization
- **VisualEditAgent**: Visual interface for file management and organization tasks

### Gamification System
- **ChallengeCard**: Daily and weekly challenges to keep your PC organized
- **GamificationDashboard**: Track progress, earn points, and view achievements
- **AchievementSystem**: Rewards for completing organization and cleaning tasks
- **TeamManager**: Compare progress with friends in organization challenges

## Security Features

- **SecurityAudit**: Comprehensive security monitoring
- **Authentication**: Secure user authentication with Base44
- **Data Protection**: Encrypted data transmission and storage
- **Access Control**: Role-based permission system

## Performance Optimizations

- **Code Splitting**: Dynamic imports for optimal loading
- **Image Optimization**: Lazy loading and responsive images
- **Caching**: Intelligent data caching with React Query
- **Bundle Optimization**: Tree shaking and minification

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Contributing

This project is currently maintained by the development team. For contributions, please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

This project is proprietary software. All rights reserved.

## Support

For support and inquiries, please contact the development team through the GitHub repository.

## Changelog

Version 2.1.3 - Current release with enhanced PC organization features, improved AI-powered file analysis, and advanced cleaning automation tools.