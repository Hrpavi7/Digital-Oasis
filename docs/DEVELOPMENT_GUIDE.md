# Digital Oasis Development Guide

## Table of Contents
1. [Development Environment Setup](#development-environment-setup)
2. [Project Structure](#project-structure)
3. [Component Development](#component-development)
4. [State Management](#state-management)
5. [API Integration](#api-integration)
6. [Testing Guidelines](#testing-guidelines)
7. [Performance Optimization](#performance-optimization)
8. [Code Standards](#code-standards)
9. [Deployment Process](#deployment-process)
10. [Contributing Guidelines](#contributing-guidelines)

## Development Environment Setup

### Prerequisites
- Node.js 18+ and npm 8+
- Git for version control
- VS Code (recommended) with suggested extensions
- Windows 10/11, macOS 10.15+, or Ubuntu 20.04+

### Initial Setup
```bash
# Clone the repository
git clone https://github.com/Hrpavi7/Digital-Oasis.git
cd Digital-Oasis

# Install dependencies
npm install

# Copy environment variables (if needed)
cp .env.example .env.local

# Start development server
npm run dev
```

### VS Code Extensions (Recommended)
```json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-typescript-next",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense",
    "ms-vscode.vscode-json"
  ]
}
```

### Development Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run lint         # Run ESLint
npm run typecheck    # Run TypeScript checks
npm run preview      # Preview production build
```

## Project Structure

### Directory Organization
```
src/
├── api/                    # API clients and integrations
│   ├── base44Client.js     # Base44 API client
│   ├── entities.js         # Entity management
│   └── integrations.js     # Third-party integrations
├── components/             # React components
│   ├── analytics/         # Data visualization
│   ├── assistant/       # AI chatbot components
│   ├── automation/      # Automation UI
│   ├── backup/           # Backup management
│   ├── gamification/     # Achievement system
│   ├── organize/         # File organization tools
│   ├── scan/             # Scanning interface
│   ├── security/         # Security components
│   └── ui/               # Base UI components (Radix)
├── hooks/                  # Custom React hooks
│   └── use-mobile.jsx    # Mobile detection
├── lib/                    # Utility libraries
│   ├── AuthContext.jsx   # Authentication context
│   ├── NavigationTracker.jsx
│   ├── VisualEditAgent.jsx
│   └── utils.js          # Utility functions
├── pages/                  # Page components
│   ├── Home.jsx          # Dashboard
│   ├── Scan.jsx          # File scanning
│   ├── Organize.jsx      # Organization tools
│   └── ...               # Other pages
└── utils/                  # Helper utilities
    └── index.ts
```

### File Naming Conventions
- **Components**: PascalCase (e.g., `FileScanner.jsx`)
- **Utilities**: camelCase (e.g., `fileUtils.js`)
- **Hooks**: camelCase with 'use' prefix (e.g., `useMobile.jsx`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_FILE_SIZE`)

### Component Architecture
```javascript
// Component structure example
import React from 'react';
import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const ComponentName = ({ prop1, prop2 }) => {
  const [state, setState] = useState(initialState);
  
  useEffect(() => {
    // Effect logic
    return () => {
      // Cleanup
    };
  }, [dependency]);
  
  const handleEvent = () => {
    // Event handler
  };
  
  return (
    <div className="component-class">
      {/* Component JSX */}
    </div>
  );
};

ComponentName.propTypes = {
  prop1: PropTypes.string.isRequired,
  prop2: PropTypes.number,
};

export default ComponentName;
```

## Component Development

### Creating New Components

#### Component Template
```javascript
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const NewComponent = ({ title, data, onAction }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Component content */}
      </CardContent>
    </Card>
  );
};

export default NewComponent;
```

#### Component Guidelines
- Use functional components with hooks
- Follow single responsibility principle
- Keep components under 200 lines when possible
- Use composition over inheritance
- Implement proper prop validation

### UI Component Integration

#### Radix UI Components
```javascript
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const CustomDialog = ({ isOpen, onClose, title, children }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
};
```

#### Tailwind CSS Usage
```javascript
// Use Tailwind for styling
const FileItem = ({ file, onSelect }) => {
  return (
    <div 
      className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => onSelect(file)}
    >
      <div className="flex items-center space-x-3">
        <FileIcon className="w-5 h-5 text-blue-500" />
        <span className="font-medium text-gray-900">{file.name}</span>
      </div>
      <div className="text-sm text-gray-500">
        {formatFileSize(file.size)}
      </div>
    </div>
  );
};
```

### State Management Patterns

#### Local Component State
```javascript
const FileScanner = () => {
  const [scanStatus, setScanStatus] = useState('idle');
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState([]);
  
  const startScan = async () => {
    setScanStatus('scanning');
    setProgress(0);
    
    try {
      // Scanning logic
      setResults(scanResults);
      setScanStatus('completed');
    } catch (error) {
      setScanStatus('error');
      console.error('Scan failed:', error);
    }
  };
  
  return { scanStatus, progress, results, startScan };
};
```

#### Context for Global State
```javascript
// AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Check authentication status
    checkAuthStatus();
  }, []);
  
  const login = async (credentials) => {
    // Login logic
  };
  
  const logout = () => {
    // Logout logic
  };
  
  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

## State Management

### React Query for Server State
```javascript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Fetching data
const { data, isLoading, error } = useQuery({
  queryKey: ['scan-results', scanId],
  queryFn: () => fetchScanResults(scanId),
  enabled: !!scanId,
  staleTime: 5 * 60 * 1000, // 5 minutes
});

// Mutating data
const mutation = useMutation({
  mutationFn: createCleaningRule,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['cleaning-rules'] });
  },
});
```

### Zustand for Complex State
```javascript
import { create } from 'zustand';

const useFileStore = create((set) => ({
  files: [],
  selectedFiles: [],
  filters: {
    type: 'all',
    size: 'all',
    date: 'all',
  },
  
  setFiles: (files) => set({ files }),
  
  selectFile: (file) => set((state) => ({
    selectedFiles: [...state.selectedFiles, file],
  })),
  
  deselectFile: (fileId) => set((state) => ({
    selectedFiles: state.selectedFiles.filter(f => f.id !== fileId),
  })),
  
  setFilter: (filterType, value) => set((state) => ({
    filters: { ...state.filters, [filterType]: value },
  })),
}));
```

## API Integration

### Base44 API Client
```javascript
// api/base44Client.js
class Base44Client {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseURL = 'https://api.base44.com/v1';
  }
  
  async request(endpoint, options = {}) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }
    
    return response.json();
  }
  
  async startScan(scanConfig) {
    return this.request('/scan', {
      method: 'POST',
      body: JSON.stringify(scanConfig),
    });
  }
  
  async getScanResults(scanId) {
    return this.request(`/scan/${scanId}`);
  }
}

export default Base44Client;
```

### API Hook Pattern
```javascript
// hooks/useScan.js
import { useMutation, useQuery } from '@tanstack/react-query';
import { base44Client } from '@/api/base44Client';

export const useStartScan = () => {
  return useMutation({
    mutationFn: (scanConfig) => base44Client.startScan(scanConfig),
  });
};

export const useScanResults = (scanId) => {
  return useQuery({
    queryKey: ['scan-results', scanId],
    queryFn: () => base44Client.getScanResults(scanId),
    enabled: !!scanId,
  });
};
```

## Testing Guidelines

### Component Testing with Vitest
```javascript
// components/__tests__/FileScanner.test.jsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import FileScanner from '../FileScanner';

describe('FileScanner', () => {
  it('renders scan button', () => {
    render(<FileScanner />);
    expect(screen.getByText('Start Scan')).toBeInTheDocument();
  });
  
  it('starts scan when button clicked', async () => {
    const mockStartScan = vi.fn();
    render(<FileScanner onStartScan={mockStartScan} />);
    
    fireEvent.click(screen.getByText('Start Scan'));
    
    await waitFor(() => {
      expect(mockStartScan).toHaveBeenCalled();
    });
  });
});
```

### Integration Testing
```javascript
// __tests__/scanFlow.test.js
import { renderHook, waitFor } from '@testing-library/react';
import { useStartScan } from '@/hooks/useScan';

describe('Scan Flow Integration', () => {
  it('successfully starts and monitors scan', async () => {
    const { result } = renderHook(() => useStartScan());
    
    await result.current.mutateAsync({
      scanType: 'quick',
      targetDirectories: ['/downloads'],
    });
    
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });
});
```

### Mocking Strategies
```javascript
// __mocks__/base44Client.js
export const mockBase44Client = {
  startScan: vi.fn().mockResolvedValue({
    scanId: 'test-scan-123',
    status: 'in_progress',
  }),
  getScanResults: vi.fn().mockResolvedValue({
    scanId: 'test-scan-123',
    status: 'completed',
    filesAnalyzed: 100,
  }),
};
```

## Performance Optimization

### Code Splitting
```javascript
// Lazy load heavy components
const LazyFilePreview = React.lazy(() => import('./FilePreview'));

function App() {
  return (
    <React.Suspense fallback={<div>Loading...</div>}>
      <LazyFilePreview />
    </React.Suspense>
  );
}
```

### Memoization
```javascript
import { useMemo, useCallback } from 'react';

const FileList = ({ files, filter, onFileSelect }) => {
  const filteredFiles = useMemo(() => {
    return files.filter(file => 
      file.name.toLowerCase().includes(filter.toLowerCase())
    );
  }, [files, filter]);
  
  const handleFileSelect = useCallback((file) => {
    onFileSelect(file);
  }, [onFileSelect]);
  
  return (
    <div>
      {filteredFiles.map(file => (
        <FileItem 
          key={file.id} 
          file={file} 
          onSelect={handleFileSelect}
        />
      ))}
    </div>
  );
};
```

### Virtual Scrolling for Large Lists
```javascript
import { FixedSizeList } from 'react-window';

const LargeFileList = ({ files }) => {
  const Row = ({ index, style }) => (
    <div style={style}>
      <FileItem file={files[index]} />
    </div>
  );
  
  return (
    <FixedSizeList
      height={600}
      itemCount={files.length}
      itemSize={50}
      width="100%"
    >
      {Row}
    </FixedSizeList>
  );
};
```

## Code Standards

### ESLint Configuration
```javascript
// eslint.config.js
export default {
  rules: {
    // React specific rules
    'react/prop-types': 'error',
    'react/no-unused-prop-types': 'error',
    'react/jsx-no-duplicate-props': 'error',
    
    // General best practices
    'no-unused-vars': 'error',
    'no-console': 'warn',
    'prefer-const': 'error',
    'no-var': 'error',
    
    // Import organization
    'import/order': ['error', {
      groups: [
        'builtin',
        'external',
        'internal',
        'parent',
        'sibling',
        'index',
      ],
    }],
  },
};
```

### TypeScript Guidelines
```typescript
// Use strict TypeScript configuration
interface FileItem {
  id: string;
  name: string;
  size: number;
  type: 'document' | 'image' | 'video' | 'other';
  createdAt: Date;
  modifiedAt: Date;
  path: string;
}

interface ScanResult {
  scanId: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  filesAnalyzed: number;
  recommendations: Recommendation[];
}

// Use proper error handling
try {
  const result = await api.startScan(config);
  return result;
} catch (error) {
  if (error instanceof ApiError) {
    console.error('API Error:', error.message);
    throw new ScanError(`Scan failed: ${error.message}`);
  }
  throw error;
}
```

### Git Commit Conventions
```
feat: add new file scanning component
fix: resolve memory leak in scan results
docs: update API documentation
style: format code with prettier
refactor: reorganize component structure
test: add unit tests for file utilities
chore: update dependencies
```

## Deployment Process

### Environment Configuration
```bash
# Production environment variables
VITE_API_URL=https://api.digitaloasis.com
VITE_APP_ENV=production
VITE_SENTRY_DSN=your-sentry-dsn
VITE_ANALYTICS_ID=your-analytics-id
```

### Build Process
```bash
# Install dependencies
npm ci

# Run tests
npm run test

# Build for production
npm run build

# Verify build
npm run preview
```

### Deployment Checklist
- [ ] Environment variables configured
- [ ] API endpoints tested
- [ ] Error tracking enabled
- [ ] Analytics configured
- [ ] Performance monitoring active
- [ ] Security headers configured
- [ ] SSL certificates valid

## Contributing Guidelines

### Code Review Process
1. Create feature branch from `main`
2. Implement changes following code standards
3. Write comprehensive tests
4. Update documentation
5. Submit pull request
6. Address review feedback
7. Merge after approval

### Pull Request Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Screenshots
Include relevant screenshots

## Checklist
- [ ] Code follows project standards
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] Tests added/updated
```

### Issue Reporting
```markdown
**Bug Description**
Clear description of the bug

**Steps to Reproduce**
1. Step one
2. Step two
3. Step three

**Expected Behavior**
What should happen

**Actual Behavior**
What actually happens

**Environment**
- OS: [e.g., Windows 11]
- Browser: [e.g., Chrome 120]
- Version: [e.g., 2.1.3]

**Additional Context**
Any other relevant information
```

### Performance Monitoring
```javascript
// Use performance API for monitoring
const measurePerformance = (fn) => {
  return (...args) => {
    const start = performance.now();
    const result = fn(...args);
    const end = performance.now();
    
    console.log(`${fn.name} took ${end - start} milliseconds`);
    
    return result;
  };
};
```

### Security Considerations
- Never commit API keys or sensitive data
- Use environment variables for configuration
- Implement proper input validation
- Sanitize user inputs
- Use HTTPS for all API communications
- Implement rate limiting for API endpoints
- Regular dependency updates for security patches