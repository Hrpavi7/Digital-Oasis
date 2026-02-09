# Digital Oasis Architecture Documentation

## Table of Contents
1. [System Overview](#system-overview)
2. [Frontend Architecture](#frontend-architecture)
3. [Backend Integration](#backend-integration)
4. [Data Flow](#data-flow)
5. [Component Architecture](#component-architecture)
6. [State Management](#state-management)
7. [Security Architecture](#security-architecture)
8. [Performance Architecture](#performance-architecture)
9. [Scalability Considerations](#scalability-considerations)
10. [Monitoring and Logging](#monitoring-and-logging)

## System Overview

### High-Level Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                    Digital Oasis Client                    │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                 React + Vite Frontend                 │  │
│  │  ┌─────────────┬──────────────┬────────────────────┐  │  │
│  │  │   Pages     │  Components  │      Hooks       │  │  │
│  │  │             │              │                  │  │  │
│  │  │ • Home      │ • Analytics  │ • useScan        │  │  │
│  │  │ • Scan      │ • Assistant  │ • useAuth        │  │  │
│  │  │ • Organize  │ • Gamification│ • useBackup      │  │  │
│  │  │ • Settings  │ • File Tools │ • useOrganization│  │  │
│  │  └─────────────┴──────────────┴────────────────────┘  │  │
│  │                                                        │  │
│  │  ┌────────────────────────────────────────────────┐  │  │
│  │  │              State Management                   │  │  │
│  │  │  ┌─────────────┬──────────────┬────────────┐  │  │  │
│  │  │  │ React Query │   Context    │   Zustand  │  │  │  │
│  │  │  │             │   Providers  │   Stores   │  │  │  │
│  │  └─────────────┴──────────────┴────────────┘  │  │  │
│  └───────────────────────────────────────────────────────┘  │
│                              │                              │
└──────────────────────────────┼──────────────────────────────┘
                               │
                               │ HTTPS/WebSocket
                               │
┌──────────────────────────────┼──────────────────────────────┐
│                              │                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              Base44 Backend Platform                 │  │
│  │  ┌─────────────┬──────────────┬────────────────────┐  │  │
│  │  │   API       │   Database   │   File System    │  │  │
│  │  │   Gateway   │              │     Service      │  │  │
│  │  │             │ • PostgreSQL │                  │  │  │
│  │  │ • REST API  │ • Redis      │ • File Analysis  │  │  │
│  │  │ • WebSocket │ • S3 Storage │ • AI Processing  │  │  │
│  │  │ • GraphQL   │              │ • Backup System  │  │  │
│  │  └─────────────┴──────────────┴────────────────────┘  │  │
│  │                                                        │  │
│  │  ┌────────────────────────────────────────────────┐  │  │
│  │  │            External Services                  │  │  │
│  │  │  ┌─────────────┬──────────────┬────────────┐  │  │  │
│  │  │  │    AI/ML     │   Analytics  │  Security  │  │  │  │
│  │  │  │              │              │            │  │  │  │
│  │  │ • Content      │ • Mixpanel   │ • Auth0    │  │  │  │
│  │  │   Analysis     │ • Sentry     │ • SSL/TLS  │  │  │  │
│  │  │ • File         │ • Logging    │ • Encryption│  │  │  │
│  │  │   Categorization│              │            │  │  │  │
│  │  └─────────────┴──────────────┴────────────┘  │  │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

#### Frontend Technologies
- **React 18**: UI framework with concurrent features
- **Vite**: Build tool and development server
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **Radix UI**: Accessible component primitives
- **React Query**: Data synchronization and caching
- **Zustand**: Lightweight state management
- **React Router**: Client-side routing

#### Backend Integration
- **Base44 Platform**: Backend-as-a-Service provider
- **REST API**: Primary data communication
- **WebSocket**: Real-time updates and notifications
- **GraphQL**: Complex data queries (optional)

#### External Services
- **AI/ML Services**: File content analysis and categorization
- **Analytics**: User behavior and system monitoring
- **Security**: Authentication and encryption services

## Frontend Architecture

### Component Hierarchy
```
App.jsx (Root Component)
├── Layout.jsx (Application Layout)
│   ├── Navigation (Sidebar/Header)
│   ├── Main Content Area
│   │   ├── Routes (React Router)
│   │   │   ├── Home.jsx (Dashboard)
│   │   │   ├── Scan.jsx (File Scanning)
│   │   │   ├── Organize.jsx (Organization Tools)
│   │   │   ├── Settings.jsx (Configuration)
│   │   │   └── ... (Other Pages)
│   │   └── Context Providers
│   │       ├── AuthContext
│   │       ├── ThemeContext
│   │       └── NotificationContext
│   └── Footer/Status Bar
└── Global Components
    ├── Toaster (Notifications)
    ├── Modal Manager
    └── Error Boundaries
```

### Component Design Patterns

#### Container/Presentational Pattern
```javascript
// Container Component (handles logic)
const ScanContainer = () => {
  const { data: scanResults, isLoading } = useScanResults();
  const { mutate: startScan } = useStartScan();
  
  return (
    <ScanPresentation
      results={scanResults}
      isLoading={isLoading}
      onStartScan={startScan}
    />
  );
};

// Presentational Component (handles UI)
const ScanPresentation = ({ results, isLoading, onStartScan }) => {
  return (
    <div className="scan-view">
      <ScanControls onStartScan={onStartScan} />
      {isLoading ? (
        <ScanLoadingState />
      ) : (
        <ScanResults results={results} />
      )}
    </div>
  );
};
```

#### Compound Component Pattern
```javascript
// Card compound component
const Card = ({ children, className }) => {
  return (
    <div className={`card ${className}`}>
      {children}
    </div>
  );
};

Card.Header = ({ children }) => (
  <div className="card-header">{children}</div>
);

Card.Content = ({ children }) => (
  <div className="card-content">{children}</div>
);

// Usage
<Card>
  <Card.Header>Scan Results</Card.Header>
  <Card.Content>
    <ScanResults />
  </Card.Content>
</Card>
```

### State Management Architecture

#### React Query for Server State
```javascript
// Query key factory
const queryKeys = {
  scan: (id) => ['scan', id],
  files: (filters) => ['files', filters],
  backup: (configId) => ['backup', configId],
  achievements: ['achievements'],
};

// Custom hooks for data fetching
const useScanResults = (scanId) => {
  return useQuery({
    queryKey: queryKeys.scan(scanId),
    queryFn: () => fetchScanResults(scanId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
};
```

#### Context for Global State
```javascript
// Theme context example
const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');
  const [systemTheme, setSystemTheme] = useState('light');
  
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setSystemTheme(mediaQuery.matches ? 'dark' : 'light');
    
    const handler = (e) => setSystemTheme(e.matches ? 'dark' : 'light');
    mediaQuery.addEventListener('change', handler);
    
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);
  
  const effectiveTheme = theme === 'system' ? systemTheme : theme;
  
  return (
    <ThemeContext.Provider value={{ theme, setTheme, effectiveTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
```

## Backend Integration

### API Architecture

#### RESTful Endpoints Structure
```
/api/v1/
├── /auth
│   ├── POST /login
│   ├── POST /logout
│   ├── POST /refresh
│   └── GET /profile
├── /scan
│   ├── POST /start
│   ├── GET /{scanId}
│   ├── GET /{scanId}/results
│   └── DELETE /{scanId}
├── /files
│   ├── POST /analyze
│   ├── POST /organize
│   ├── GET /large-files
│   └── GET /duplicates
├── /cleaning
│   ├── POST /rules
│   ├── GET /rules
│   ├── PUT /rules/{ruleId}
│   └── POST /rules/{ruleId}/execute
├── /backup
│   ├── POST /configurations
│   ├── GET /history
│   └── POST /restore
└── /gamification
    ├── GET /achievements
    ├── GET /challenges
    └── POST /challenges/{id}/progress
```

#### WebSocket Events
```javascript
// WebSocket connection manager
class WebSocketManager {
  constructor(url) {
    this.url = url;
    this.socket = null;
    this.reconnectInterval = 5000;
    this.listeners = new Map();
  }
  
  connect() {
    this.socket = new WebSocket(this.url);
    
    this.socket.onopen = () => {
      console.log('WebSocket connected');
      this.onConnect();
    };
    
    this.socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.handleMessage(data);
    };
    
    this.socket.onclose = () => {
      console.log('WebSocket disconnected');
      setTimeout(() => this.connect(), this.reconnectInterval);
    };
  }
  
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }
  
  handleMessage(data) {
    const callbacks = this.listeners.get(data.event);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }
}
```

### Data Synchronization Strategy

#### Optimistic Updates
```javascript
// Optimistic update example
const useUpdateFileOrganization = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateFileOrganization,
    
    // Optimistic update
    onMutate: async (newOrganization) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries(['file-organization']);
      
      // Snapshot previous value
      const previousOrganization = queryClient.getQueryData(['file-organization']);
      
      // Optimistically update
      queryClient.setQueryData(['file-organization'], newOrganization);
      
      // Return context for rollback
      return { previousOrganization };
    },
    
    // Rollback on error
    onError: (err, newOrganization, context) => {
      queryClient.setQueryData(['file-organization'], context.previousOrganization);
    },
    
    // Refetch after mutation
    onSettled: () => {
      queryClient.invalidateQueries(['file-organization']);
    },
  });
};
```

## Data Flow

### File Scanning Flow
```
User initiates scan
    ↓
ScanComponent calls useStartScan()
    ↓
React Query mutation sends request to /api/scan/start
    ↓
Backend processes scan request
    ↓
WebSocket sends progress updates
    ↓
Frontend updates UI with progress
    ↓
Scan completion notification
    ↓
Fetch scan results via useScanResults()
    ↓
Update UI with scan results
    ↓
Cache results for offline access
```

### File Organization Flow
```
User selects files to organize
    ↓
AI analysis request to /api/files/analyze
    ↓
Backend performs content analysis
    ↓
Return organization suggestions
    ↓
User reviews and approves suggestions
    ↓
Execute organization via /api/files/organize
    ↓
Optimistic UI update
    ↓
Confirm successful organization
    ↓
Update achievement progress
```

### State Management Flow
```
Component dispatches action
    ↓
Action processed by hook/store
    ↓
Update local state optimistically
    ↓
Sync with backend via API call
    ↓
Handle success/error response
    ↓
Update global state if needed
    ↓
Notify other components of changes
    ↓
Persist state changes (if required)
```

## Component Architecture

### Component Categories

#### Page Components
```javascript
// Page component structure
const ScanPage = () => {
  const { user } = useAuth();
  const { data: scanHistory } = useScanHistory();
  
  return (
    <PageLayout title="File Scanning">
      <ScanControls />
      <ScanHistory history={scanHistory} />
      <ScanRecommendations />
    </PageLayout>
  );
};
```

#### Feature Components
```javascript
// Feature component with business logic
const ScanControls = () => {
  const [scanType, setScanType] = useState('quick');
  const { mutate: startScan, isLoading } = useStartScan();
  
  const handleStartScan = () => {
    startScan({ scanType });
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Start Scan</CardTitle>
      </CardHeader>
      <CardContent>
        <ScanTypeSelector value={scanType} onChange={setScanType} />
        <Button onClick={handleStartScan} disabled={isLoading}>
          {isLoading ? 'Scanning...' : 'Start Scan'}
        </Button>
      </CardContent>
    </Card>
  );
};
```

#### UI Components
```javascript
// Reusable UI component
const FileItem = ({ file, onSelect, onDelete }) => {
  return (
    <div className="file-item">
      <div className="file-icon">
        <FileIcon type={file.type} />
      </div>
      <div className="file-info">
        <h4>{file.name}</h4>
        <p>{formatFileSize(file.size)}</p>
      </div>
      <div className="file-actions">
        <Button variant="ghost" onClick={() => onSelect(file)}>
          View
        </Button>
        <Button variant="destructive" onClick={() => onDelete(file)}>
          Delete
        </Button>
      </div>
    </div>
  );
};
```

### Component Communication Patterns

#### Parent-Child Communication
```javascript
// Parent component
const FileManager = () => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  
  const handleFileSelect = (file) => {
    setSelectedFiles(prev => [...prev, file]);
  };
  
  return (
    <div>
      <FileList onFileSelect={handleFileSelect} />
      <SelectedFiles files={selectedFiles} />
    </div>
  );
};

// Child component
const FileList = ({ onFileSelect }) => {
  return (
    <div>
      {files.map(file => (
        <FileItem 
          key={file.id}
          file={file}
          onClick={() => onFileSelect(file)}
        />
      ))}
    </div>
  );
};
```

#### Sibling Communication via Context
```javascript
// Context provider
const FileSelectionContext = createContext();

export const FileSelectionProvider = ({ children }) => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  
  const selectFile = (file) => {
    setSelectedFiles(prev => [...prev, file]);
  };
  
  const deselectFile = (fileId) => {
    setSelectedFiles(prev => prev.filter(f => f.id !== fileId));
  };
  
  return (
    <FileSelectionContext.Provider 
      value={{ selectedFiles, selectFile, deselectFile }}
    >
      {children}
    </FileSelectionContext.Provider>
  );
};

// Sibling components
const FileList = () => {
  const { selectFile } = useContext(FileSelectionContext);
  
  return (
    <div>
      {files.map(file => (
        <div key={file.id} onClick={() => selectFile(file)}>
          {file.name}
        </div>
      ))}
    </div>
  );
};

const SelectedFilesPanel = () => {
  const { selectedFiles } = useContext(FileSelectionContext);
  
  return (
    <div>
      <h3>Selected Files ({selectedFiles.length})</h3>
      {selectedFiles.map(file => (
        <div key={file.id}>{file.name}</div>
      ))}
    </div>
  );
};
```

## State Management

### React Query for Server State

#### Query Configuration
```javascript
// Query client configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: 3,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});
```

#### Query Invalidation Strategy
```javascript
// Invalidate related queries after mutations
const useCreateCleaningRule = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createCleaningRule,
    onSuccess: (newRule) => {
      // Invalidate related queries
      queryClient.invalidateQueries(['cleaning-rules']);
      queryClient.invalidateQueries(['user-achievements']);
      queryClient.invalidateQueries(['system-status']);
      
      // Add optimistic update
      queryClient.setQueryData(['cleaning-rules'], (old) => 
        [...old, newRule]
      );
    },
  });
};
```

### Local State Management

#### Zustand Store Pattern
```javascript
// File organization store
const useFileOrganizationStore = create((set, get) => ({
  // State
  organizedFiles: [],
  organizationRules: [],
  isOrganizing: false,
  
  // Actions
  setOrganizedFiles: (files) => set({ organizedFiles: files }),
  
  addOrganizationRule: (rule) => set((state) => ({
    organizationRules: [...state.organizationRules, rule],
  })),
  
  removeOrganizationRule: (ruleId) => set((state) => ({
    organizationRules: state.organizationRules.filter(r => r.id !== ruleId),
  })),
  
  // Async actions
  organizeFiles: async (files, rules) => {
    set({ isOrganizing: true });
    
    try {
      const organized = await organizeFiles(files, rules);
      set({ organizedFiles: organized, isOrganizing: false });
      return organized;
    } catch (error) {
      set({ isOrganizing: false });
      throw error;
    }
  },
}));
```

## Security Architecture

### Authentication Flow
```javascript
// Auth flow with token management
const useAuth = () => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  
  const login = async (credentials) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      
      const { user, token } = await response.json();
      
      localStorage.setItem('token', token);
      setToken(token);
      setUser(user);
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };
  
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };
  
  // Auto-login with stored token
  useEffect(() => {
    if (token) {
      validateToken(token);
    }
  }, [token]);
  
  return { user, login, logout };
};
```

### Data Encryption
```javascript
// File data encryption for sensitive information
const encryptFileData = (fileData) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(JSON.stringify(fileData));
  
  return crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: crypto.getRandomValues(new Uint8Array(12)),
    },
    encryptionKey,
    data
  );
};
```

### API Security Headers
```javascript
// Secure API client configuration
const secureApiClient = axios.create({
  baseURL: process.env.VITE_API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
  },
  withCredentials: true,
});

// Request interceptor for token management
secureApiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);
```

## Performance Architecture

### Code Splitting Strategy
```javascript
// Route-based code splitting
const Home = lazy(() => import('./pages/Home'));
const Scan = lazy(() => import('./pages/Scan'));
const Organize = lazy(() => import('./pages/Organize'));
const Settings = lazy(() => import('./pages/Settings'));

// Component-based code splitting for heavy components
const FilePreview = lazy(() => import('./components/FilePreview'));
const DataVisualization = lazy(() => import('./components/DataVisualization'));

// Loading component
const PageLoader = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
  </div>
);

// Usage in router
<Route
  path="/scan"
  element={
    <Suspense fallback={<PageLoader />}>
      <Scan />
    </Suspense>
  }
/>
```

### Performance Optimization Patterns

#### Memoization Strategy
```javascript
// Component memoization
const FileList = memo(({ files, onFileSelect }) => {
  return (
    <div>
      {files.map(file => (
        <FileItem 
          key={file.id}
          file={file}
          onSelect={onFileSelect}
        />
      ))}
    </div>
  );
}, (prevProps, nextProps) => {
  return prevProps.files === nextProps.files && 
         prevProps.onFileSelect === nextProps.onFileSelect;
});

// Hook memoization
const useExpensiveCalculation = (files) => {
  return useMemo(() => {
    return files.reduce((total, file) => total + file.size, 0);
  }, [files]);
};

// Callback memoization
const FileManager = () => {
  const [files, setFiles] = useState([]);
  
  const handleFileSelect = useCallback((file) => {
    // File selection logic
  }, []);
  
  return <FileList files={files} onFileSelect={handleFileSelect} />;
};
```

#### Virtual Scrolling for Large Lists
```javascript
// Virtual scrolling implementation
const VirtualFileList = ({ files, height, itemHeight }) => {
  const Row = ({ index, style }) => (
    <div style={style}>
      <FileItem file={files[index]} />
    </div>
  );
  
  return (
    <FixedSizeList
      height={height}
      itemCount={files.length}
      itemSize={itemHeight}
      width="100%"
    >
      {Row}
    </FixedSizeList>
  );
};
```

### Caching Strategy
```javascript
// Multi-layer caching approach
const cacheStrategy = {
  // Browser cache for static assets
  static: {
    maxAge: 31536000, // 1 year
    immutable: true,
  },
  
  // API response cache
  api: {
    staleWhileRevalidate: 5 * 60 * 1000, // 5 minutes
    maxAge: 10 * 60 * 1000, // 10 minutes
  },
  
  // React Query cache
  query: {
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  },
  
  // Service worker cache for offline support
  offline: {
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/api\.base44\.com/,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'api-cache',
          expiration: {
            maxEntries: 100,
            maxAgeSeconds: 60 * 60 * 24, // 24 hours
          },
        },
      },
    ],
  },
};
```

## Scalability Considerations

### Horizontal Scaling Strategy
```javascript
// Modular architecture for scalability
const scalableArchitecture = {
  // Micro-frontend approach for large features
  modules: {
    scanning: {
      components: ['ScanControls', 'ScanResults', 'ScanHistory'],
      services: ['ScanAPI', 'ScanWebSocket'],
      state: ['scanStore'],
    },
    organization: {
      components: ['FileOrganizer', 'OrganizationRules', 'AIAnalysis'],
      services: ['OrganizationAPI', 'AIService'],
      state: ['organizationStore'],
    },
    gamification: {
      components: ['Achievements', 'Challenges', 'Leaderboard'],
      services: ['GamificationAPI'],
      state: ['gamificationStore'],
    },
  },
  
  // Feature flags for gradual rollout
  featureFlags: {
    newScanAlgorithm: false,
    advancedAI: false,
    teamChallenges: false,
  },
};
```

### Load Balancing Considerations
```javascript
// Client-side load balancing for API calls
const loadBalancedAPI = {
  endpoints: [
    'https://api1.base44.com',
    'https://api2.base44.com',
    'https://api3.base44.com',
  ],
  
  getEndpoint() {
    // Simple round-robin
    const index = Math.floor(Math.random() * this.endpoints.length);
    return this.endpoints[index];
  },
  
  async requestWithFallback(endpoint, options) {
    for (let i = 0; i < this.endpoints.length; i++) {
      try {
        const response = await fetch(endpoint, options);
        if (response.ok) return response;
      } catch (error) {
        console.warn(`Request failed for ${endpoint}, trying next...`);
        continue;
      }
    }
    throw new Error('All endpoints failed');
  },
};
```

## Monitoring and Logging

### Performance Monitoring
```javascript
// Performance monitoring with Web Vitals
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

const reportWebVitals = (onPerfEntry) => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    getCLS(onPerfEntry);
    getFID(onPerfEntry);
    getFCP(onPerfEntry);
    getLCP(onPerfEntry);
    getTTFB(onPerfEntry);
  }
};

// Custom performance monitoring
const measurePerformance = (name, fn) => {
  return (...args) => {
    const start = performance.now();
    const result = fn(...args);
    const end = performance.now();
    
    // Report to analytics
    analytics.track('Performance', {
      operation: name,
      duration: end - start,
      timestamp: Date.now(),
    });
    
    return result;
  };
};
```

### Error Tracking
```javascript
// Error boundary with reporting
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error, errorInfo) {
    // Report to error tracking service
    errorTracker.captureException(error, {
      extra: errorInfo,
      tags: {
        component: this.props.componentName,
        userId: this.props.userId,
      },
    });
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }
    
    return this.props.children;
  }
}
```

### Application Logging
```javascript
// Structured logging system
const logger = {
  log: (level, message, context = {}) => {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      userId: getCurrentUserId(),
      sessionId: getSessionId(),
    };
    
    // Console logging in development
    if (process.env.NODE_ENV === 'development') {
      console[level](message, context);
    }
    
    // Send to logging service in production
    if (process.env.NODE_ENV === 'production') {
      loggingService.send(logEntry);
    }
  },
  
  info: (message, context) => logger.log('info', message, context),
  warn: (message, context) => logger.log('warn', message, context),
  error: (message, context) => logger.log('error', message, context),
  debug: (message, context) => logger.log('debug', message, context),
};
```

This architecture documentation provides a comprehensive overview of the Digital Oasis system design, including frontend architecture, backend integration, data flow patterns, component organization, state management strategies, security considerations, performance optimization techniques, and monitoring approaches. The architecture is designed to be scalable, maintainable, and performant while providing a seamless user experience for PC organization tasks.