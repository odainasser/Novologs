# NovoTak Application - Data Flow Architecture Documentation

## Table of Contents
1. [Overview](#overview)
2. [Architecture Layers](#architecture-layers)
3. [Complete Data Flow](#complete-data-flow)
4. [Authentication Flow](#authentication-flow)
5. [Mutation Flow](#mutation-flow)
6. [File Structure](#file-structure)
7. [Key Technologies](#key-technologies)
8. [Code Examples](#code-examples)

---

## Overview

The NovoTak application follows a **layered architecture** pattern with clear separation of concerns between the presentation, business logic, and data access layers. The application uses **Next.js 13+ App Router**, **SWR for data fetching**, and **Axios for HTTP requests**.

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        User Browser                              │
└────────────────────────────┬────────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                    1. Presentation Layer                         │
│  • Pages (src/app/**/page.jsx)                                  │
│  • Layouts (src/app/**/layout.jsx)                              │
└────────────────────────────┬────────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                    2. Component Layer                            │
│  • View Components (src/sections/*/view/)                       │
│  • UI Components (Tables, Forms, Dialogs)                       │
│  • Shared Components (src/components/)                          │
└────────────────────────────┬────────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                 3. Business Logic Layer                          │
│  • Actions (src/actions/)                                       │
│  • Custom Hooks (useBoolean, useSetState, etc.)                 │
│  • State Management (SWR Cache + React State)                   │
└────────────────────────────┬────────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                 4. API Integration Layer                         │
│  • Axios Instance (src/utils/axios-zeta.js)                     │
│  • API Endpoints (src/utils/api-endpoints/)                     │
│  • Fetchers (postFetcher, fetchGetRequest)                      │
│  • Interceptors (Auth, Error Handling)                          │
└────────────────────────────┬────────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                 5. Cross-Cutting Concerns                        │
│  • Authentication (JWT Context)                                  │
│  • Localization (i18n - English/Arabic)                         │
│  • Theme (MUI Theme Provider)                                    │
│  • Routing (Next.js Router)                                      │
└────────────────────────────┬────────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                    Backend API Server                            │
│  • REST API (CONFIG.zetaApiUrl)                                 │
│  • Database                                                      │
└─────────────────────────────────────────────────────────────────┘
```

---

## Architecture Layers

### 1. Presentation Layer
**Location**: `src/app/`

**Responsibilities**:
- Define application routes using Next.js App Router
- Provide layout wrappers with providers (Theme, Auth, i18n)
- Render page components

**Key Files**:
- `src/app/layout.jsx` - Root layout with all providers
- `src/app/(home)/page.jsx` - Home page
- `src/app/dashboard/client/list/page.jsx` - Client list page

### 2. Component Layer
**Location**: `src/sections/` and `src/components/`

**Responsibilities**:
- Render UI elements
- Handle user interactions
- Manage local component state
- Call action functions for data operations

**Key Files**:
- `src/sections/client/view/client-view.jsx` - Client list view
- `src/sections/client/client-table-row.jsx` - Table row component
- `src/components/table/` - Reusable table components

### 3. Business Logic Layer
**Location**: `src/actions/`

**Responsibilities**:
- Fetch data from backend API
- Manage data caching with SWR
- Process and transform API responses
- Provide memoized data to components

**Key Files**:
- `src/actions/client/clientActions.ts` - Client data operations
- `src/actions/task/taskActions.ts` - Task data operations
- `src/actions/project/projectActions.ts` - Project data operations

### 4. API Integration Layer
**Location**: `src/utils/`

**Responsibilities**:
- Configure HTTP client (Axios)
- Define API endpoints
- Handle authentication tokens
- Manage request/response interceptors
- Provide fetcher functions for SWR

**Key Files**:
- `src/utils/axios-zeta.js` - Axios instance with interceptors
- `src/utils/api-endpoints/index.ts` - API endpoint definitions
- `src/utils/api-endpoints/clients.ts` - Client API endpoints

### 5. Cross-Cutting Concerns

**Authentication**:
- Location: `src/auth/context/jwt/`
- Manages JWT tokens, refresh tokens, user session

**Localization**:
- Location: `src/locales/`
- Supports English and Arabic (RTL)
- Translation files: `src/locales/langs/en/` and `src/locales/langs/ar/`

**Theme**:
- Location: `src/theme/`
- Material-UI theme configuration
- Color schemes, typography, components

**Routing**:
- Location: `src/routes/`
- Path definitions and navigation hooks

---

## Complete Data Flow

### Scenario: Fetching Client List

#### Step 1: User Navigation
```
User navigates to: /dashboard/client/list
```

#### Step 2: Next.js Routing
- **File**: `src/app/dashboard/client/list/page.jsx`
- **Action**: Next.js renders the page component
- **Component**: `<ClientMainList />`

#### Step 3: View Component Initialization
- **File**: `src/sections/client/view/client-view.jsx`
- **Action**: Component mounts and calls data fetching hook

**Code**:
```javascript
export function ClientView({ isClientView, isPurchaseClient }) {
  // Call the action to fetch clients
  const { clientsList, clientsListLoading, clientsListError, mutate } = getClients(payload);

  // Component renders based on loading state
  if (clientsListLoading) return <LinearProgress />;
  if (clientsListError) return <ErrorView />;

  // Render table with client data
  return (
    <DashboardContent>
      <Card>
        <Table>
          <TableBody>
            {clientsList.clients.map((row) => (
              <ClientTableListRow key={row.id} row={row} />
            ))}
          </TableBody>
        </Table>
      </Card>
    </DashboardContent>
  );
}
```

#### Step 4: Action Layer - Data Fetching
- **File**: `src/actions/client/clientActions.ts`
- **Function**: `getClients(payload)`

**Process**:
1. Creates payload with pagination and filters
2. Generates SWR cache key: `[endpoint, payload]`
3. Calls `useSWR()` hook with key and fetcher function
4. Returns memoized data object

**Code**:
```typescript
export function getClients(payload?: GetClientPayload) {
  // Step 1: Build final payload with defaults
  const finalPayload: GetClientPayload = {
    pagination: {
      pageNumber: 1,
      pageSize: 100,
    },
    ...payload,
  };

  // Step 2: Create SWR cache key (memoized)
  const swrKey = useMemo(
    () => [apiEndpoints.clients.getClients, finalPayload],
    [JSON.stringify(finalPayload)]
  );

  // Step 3: Call SWR hook
  const { data, isLoading, error, isValidating, mutate } = useSWR<GetClientResponse>(
    swrKey,
    postFetcher,
    swrOptions
  );

  // Step 4: Process and memoize response data
  const memoizedValue = useMemo(() => {
    const clientsObject = data?.successStatus;
    const clients = data?.successStatus?.items ?? [];
    const totalClients = data?.successStatus?.total;

    return {
      clientsList: { clients, totalClients, clientsObject },
      clientsListLoading: isLoading,
      clientsListError: error,
      clientsListValidating: isValidating,
      clientsListEmpty: !isLoading && clients.length === 0,
      mutate,
    };
  }, [data, error, isLoading, isValidating]);

  return memoizedValue;
}
```

**SWR Options**:
```typescript
const swrOptions = {
  revalidateOnFocus: false,      // Don't refetch when window regains focus
  revalidateOnReconnect: false,  // Don't refetch on network reconnect
  refreshWhenOffline: false,     // Don't refresh when offline
  refreshWhenHidden: false,      // Don't refresh when tab is hidden
  shouldRetryOnError: false,     // Don't retry on error
  dedupingInterval: 30000,       // Dedupe requests within 30 seconds
};
```

#### Step 5: SWR Cache Management
- **Library**: SWR (Stale-While-Revalidate)
- **Action**: Checks cache for existing data

**Cache Hit Flow**:
```
SWR checks cache with key: ["/client/client/getClients", {pagination: {...}}]
  ↓
Cache found → Return cached data immediately
  ↓
Component renders with cached data (fast!)
  ↓
(Optional) Revalidate in background if needed
```

**Cache Miss Flow**:
```
SWR checks cache with key
  ↓
No cache found → Call fetcher function
  ↓
Wait for API response
  ↓
Cache the response
  ↓
Return data to component
```

#### Step 6: Fetcher Function
- **File**: `src/utils/axios-zeta.js`
- **Function**: `postFetcher(args)`

**Code**:
```javascript
export const postFetcher = async (args) => {
  try {
    // Extract URL, data, and config from arguments
    const [url, data, config] = Array.isArray(args) ? args : [args, {}, {}];

    // Make POST request using Axios instance
    const res = await zetaAxiosInstance.post(url, data, { ...config });

    // Return only the data portion of response
    return res.data;
  } catch (error) {
    console.error('Failed to post:', error);
    throw error;
  }
};
```

**GET Fetcher** (for GET requests):
```javascript
export const fetchGetRequest = async (args) => {
  try {
    const [url, data, config] = Array.isArray(args) ? args : [args, {}, {}];
    const res = await zetaAxiosInstance.get(url, data, { ...config });
    return res.data;
  } catch (error) {
    console.error('Failed to get:', error);
    throw error;
  }
};
```

#### Step 7: Request Interceptor (Authentication)
- **File**: `src/utils/axios-zeta.js`
- **Purpose**: Add authentication token to every request

**Code**:
```javascript
zetaAxiosInstance.interceptors.request.use(
  async (config) => {
    // Get token and check if it needs refresh
    const token = await handleTokenExpiration();

    // Add Authorization header if token exists
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);
```

**Token Expiration Handler**:
```javascript
export const handleTokenExpiration = async () => {
  const accessToken = sessionStorage.getItem('accessToken');
  const refreshToken = sessionStorage.getItem('refreshToken');

  // Check if access token is expired
  if (isTokenExpired(accessToken)) {
    // Refresh the token
    const newToken = await refreshAccessToken(refreshToken);
    sessionStorage.setItem('accessToken', newToken);
    return newToken;
  }

  return accessToken;
};
```

#### Step 8: HTTP Request to Backend
**Request Details**:
```http
POST https://api.novotak.com/client/client/getClients
Headers:
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  Content-Type: application/json
Body:
{
  "pagination": {
    "pageNumber": 1,
    "pageSize": 100
  },
  "filters": {
    "status": ["active"],
    "search": ""
  }
}
```

#### Step 9: Backend Processing
1. Backend API receives request
2. Validates JWT token
3. Extracts user information from token
4. Queries database with filters
5. Formats response
6. Returns JSON response

**Response Format**:
```json
{
  "successStatus": {
    "items": [
      {
        "id": "client-001",
        "name": "ABC Corporation",
        "email": "contact@abc.com",
        "phone": "+971-50-123-4567",
        "status": "active",
        "createdAt": "2024-01-15T10:30:00Z"
      },
      {
        "id": "client-002",
        "name": "XYZ Industries",
        "email": "info@xyz.com",
        "phone": "+971-50-987-6543",
        "status": "active",
        "createdAt": "2024-01-20T14:45:00Z"
      }
    ],
    "total": 2,
    "pageNumber": 1,
    "pageSize": 100
  }
}
```

#### Step 10: Response Interceptor
- **File**: `src/utils/axios-zeta.js`
- **Purpose**: Handle errors and token refresh

**Code**:
```javascript
zetaAxiosInstance.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    // If unauthorized (401) and not retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Attempt to refresh token
        const newToken = await handleTokenExpiration();

        if (newToken) {
          // Update Authorization header with new token
          originalRequest.headers['Authorization'] = `Bearer ${newToken}`;

          // Retry the original request
          return zetaAxiosInstance(originalRequest);
        }
      } catch (err) {
        // Refresh failed, redirect to login
        window.location.href = '/auth/jwt/sign-in';
      }
    }

    // For other errors, reject the promise
    return Promise.reject(error);
  }
);
```

**Error Handling Flow**:
```
API returns 401 Unauthorized
  ↓
Response Interceptor catches error
  ↓
Check if retry already attempted
  ↓
Call handleTokenExpiration() to refresh token
  ↓
If refresh successful:
  - Update Authorization header
  - Retry original request
  ↓
If refresh fails:
  - Redirect to login page
```

#### Step 11: Data Processing (useMemo)
- **File**: `src/actions/client/clientActions.ts`
- **Purpose**: Memoize processed data to prevent unnecessary re-renders

**Why useMemo?**
- Prevents recalculating derived data on every render
- Only recalculates when dependencies change
- Improves performance for expensive operations

**Code**:
```typescript
const memoizedValue = useMemo(() => {
  // Extract data from API response
  const clientsObject = data?.successStatus;
  const clients = data?.successStatus?.items ?? [];
  const totalClients = data?.successStatus?.total;

  // Return processed object
  return {
    clientsList: { clients, totalClients, clientsObject },
    clientsListLoading: isLoading,
    clientsListError: error,
    clientsListValidating: isValidating,
    clientsListEmpty: !isLoading && clients.length === 0,
    mutate, // Function to manually revalidate
  };
}, [data, error, isLoading, isValidating]); // Only recalculate when these change
```

#### Step 12: Component Re-render
- **File**: `src/sections/client/view/client-view.jsx`
- **Action**: Component receives updated data and re-renders

**Render Logic**:
```javascript
export function ClientView() {
  const { clientsList, clientsListLoading, clientsListError, mutate } = getClients();

  // Show loading state
  if (clientsListLoading) {
    return <LinearProgress />;
  }

  // Show error state
  if (clientsListError) {
    return <ErrorView error={clientsListError} />;
  }

  // Show empty state
  if (clientsList.clients.length === 0) {
    return <TableNoData />;
  }

  // Render table with data
  return (
    <DashboardContent>
      <Card>
        <ClientTableToolbar />
        <TableContainer>
          <Table>
            <TableHeadCustom headLabel={TABLE_HEAD} />
            <TableBody>
              {clientsList.clients.map((row) => (
                <ClientTableListRow
                  key={row.id}
                  row={row}
                  onDeleteRow={() => handleDeleteRow(row.id)}
                  onEditRow={() => handleEditRow(row.id)}
                />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePaginationCustom
          count={clientsList.totalClients}
          page={page}
          rowsPerPage={rowsPerPage}
        />
      </Card>
    </DashboardContent>
  );
}
```

#### Step 13: Display to User
- Browser renders the updated UI
- User sees the client list table with all data
- Table includes: Name, Email, Phone, Status, Actions

---

## Authentication Flow

### Initial Login

```
User enters credentials
  ↓
POST /tenant/Users/login
  ↓
Backend validates credentials
  ↓
Returns: { accessToken, refreshToken, user }
  ↓
Store tokens in sessionStorage
  ↓
Store user in AuthContext
  ↓
Redirect to dashboard
```

### Token Refresh Flow

```
User makes API request
  ↓
Request Interceptor checks token expiration
  ↓
Token expired?
  ├─ No → Add current token to request
  └─ Yes → Refresh token flow:
      ↓
      POST /tenant/Users/refresh
      Body: { refreshToken }
      ↓
      Backend validates refresh token
      ↓
      Returns new accessToken
      ↓
      Update sessionStorage
      ↓
      Add new token to request
```

### Authentication Context

**File**: `src/auth/context/jwt/auth-provider.jsx`

**Code**:
```javascript
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state
  useEffect(() => {
    const initialize = async () => {
      const accessToken = sessionStorage.getItem('accessToken');

      if (accessToken && !isTokenExpired(accessToken)) {
        // Token valid, fetch user data
        const userData = await fetchUserData(accessToken);
        setUser(userData);
      } else {
        // Token invalid, clear session
        sessionStorage.clear();
      }

      setLoading(false);
    };

    initialize();
  }, []);

  const signIn = async (email, password) => {
    const response = await axios.post('/tenant/Users/login', { email, password });
    const { accessToken, refreshToken, user } = response.data;

    sessionStorage.setItem('accessToken', accessToken);
    sessionStorage.setItem('refreshToken', refreshToken);
    setUser(user);
  };

  const signOut = () => {
    sessionStorage.clear();
    setUser(null);
    window.location.href = '/auth/jwt/sign-in';
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
```

---

## Mutation Flow

### Scenario: Adding a New Client

#### Step 1: User Action
```
User clicks "Add Client" button
  ↓
Dialog opens with form
  ↓
User fills in client details
  ↓
User clicks "Save"
```

#### Step 2: Form Submission
**File**: `src/sections/client/view/client-view.jsx`

**Code**:
```javascript
const handleAddClient = async (formData) => {
  try {
    // Call add client action
    const result = await addClient(formData);

    if (result.success) {
      // Show success message
      toast.success('Client added successfully');

      // Revalidate client list (triggers refetch)
      mutate();

      // Close dialog
      setOpenDialog(false);
    } else {
      toast.error('Failed to add client');
    }
  } catch (error) {
    toast.error(error.message);
  }
};
```

#### Step 3: Action Function
**File**: `src/actions/client/clientActions.ts`

**Code**:
```typescript
export async function addClient(data: CreateClient) {
  try {
    // Make POST request to create client
    const response = await zetaAxiosInstance.post(
      apiEndpoints.clients.addClient,
      data
    );

    if (response.status === 200) {
      return { success: true, response };
    } else {
      return { success: false, error: 'Failed to create client' };
    }
  } catch (error: any) {
    console.error('Error adding client:', error);
    return { success: false, error };
  }
}
```

#### Step 4: API Request
```http
POST https://api.novotak.com/client/client/addClient
Headers:
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  Content-Type: application/json
Body:
{
  "name": "New Client Corp",
  "email": "contact@newclient.com",
  "phone": "+971-50-111-2222",
  "status": "active",
  "address": "Dubai, UAE"
}
```

#### Step 5: Backend Processing
```
Backend receives request
  ↓
Validates JWT token
  ↓
Validates client data
  ↓
Inserts into database
  ↓
Returns success response
```

#### Step 6: Cache Invalidation
**Code**:
```javascript
// After successful add
mutate(); // This triggers SWR to refetch the client list
```

**What happens**:
```
mutate() called
  ↓
SWR invalidates cache for client list
  ↓
SWR calls postFetcher again
  ↓
Fetches updated client list from API
  ↓
Updates cache with new data
  ↓
Component re-renders with updated list
  ↓
User sees new client in table
```

### Update Flow

**Similar to Add, but uses PUT/PATCH**:

```javascript
export async function updateClient(data: UpdateClient) {
  try {
    const response = await zetaAxiosInstance.put(
      apiEndpoints.clients.updateClient,
      data
    );

    if (response.status === 200) {
      return { success: true, response };
    }
  } catch (error) {
    return { success: false, error };
  }
}
```

### Delete Flow

**Uses DELETE method**:

```javascript
export async function deleteClient(data: DeleteClient) {
  try {
    const response = await zetaAxiosInstance.delete(
      apiEndpoints.clients.deleteClient,
      { data }
    );

    if (response.status === 200) {
      return { success: true, response };
    }
  } catch (error) {
    return { success: false, error };
  }
}
```

**Component Usage**:
```javascript
const handleDeleteClient = async (clientId) => {
  const confirmed = await confirm('Are you sure you want to delete this client?');

  if (confirmed) {
    const result = await deleteClient({ id: clientId });

    if (result.success) {
      toast.success('Client deleted successfully');
      mutate(); // Refresh list
    }
  }
};
```

---

## File Structure

### Complete Directory Structure

```
ZETA/
├── src/
│   ├── app/                              # Next.js App Router (Pages & Routing)
│   │   ├── layout.jsx                    # Root layout with providers
│   │   ├── (home)/
│   │   │   ├── layout.jsx               # Home layout
│   │   │   └── page.jsx                 # Home page (redirects to dashboard)
│   │   ├── dashboard/
│   │   │   ├── layout.jsx               # Dashboard layout
│   │   │   ├── client/
│   │   │   │   └── list/
│   │   │   │       └── page.jsx         # Client list page
│   │   │   ├── task/
│   │   │   │   └── list/
│   │   │   │       └── page.jsx         # Task list page
│   │   │   ├── project/
│   │   │   │   └── list/
│   │   │   │       └── page.jsx         # Project list page
│   │   │   └── user/
│   │   │       └── list/
│   │   │           └── page.jsx         # User list page
│   │   ├── support/
│   │   │   ├── layout.jsx               # Support layout
│   │   │   └── components/
│   │   │       └── common-sidebar-layout.jsx
│   │   └── about-us/
│   │       └── page.jsx                 # About us page
│   │
│   ├── sections/                         # Feature Components
│   │   ├── client/
│   │   │   ├── view/
│   │   │   │   ├── client-view.jsx      # Main client view component
│   │   │   │   └── client-settings-view.jsx
│   │   │   ├── client-table-row.jsx     # Table row component
│   │   │   ├── client-table-toolbar.jsx # Toolbar with filters
│   │   │   └── add-client-details.jsx   # Add/Edit dialog
│   │   ├── task/
│   │   │   ├── view/
│   │   │   │   └── kanban-list-view.jsx
│   │   │   └── task-details.jsx
│   │   ├── project/
│   │   │   ├── view/
│   │   │   │   └── project-list-view.jsx
│   │   │   └── project-item.jsx
│   │   └── user/
│   │       ├── view/
│   │       │   └── user-list-view.jsx
│   │       └── user-table-row.jsx
│   │
│   ├── actions/                          # Data Fetching & Business Logic
│   │   ├── client/
│   │   │   ├── clientActions.ts         # Client CRUD operations
│   │   │   └── clientModels.ts          # TypeScript types
│   │   ├── task/
│   │   │   ├── taskActions.ts           # Task CRUD operations
│   │   │   └── taskModels.ts
│   │   ├── project/
│   │   │   ├── projectActions.ts        # Project CRUD operations
│   │   │   └── projectModels.ts
│   │   ├── userManage/
│   │   │   ├── userManageActions.ts     # User CRUD operations
│   │   │   └── userManageModels.ts
│   │   ├── file/
│   │   │   ├── fileActions.ts           # File operations
│   │   │   └── fileModels.ts
│   │   └── settings/
│   │       ├── settingActions.ts        # Settings operations
│   │       └── settingModels.ts
│   │
│   ├── utils/                            # Utilities & API Configuration
│   │   ├── axios.js                     # Basic axios instance
│   │   ├── axios-zeta.js                # Main axios instance with interceptors
│   │   └── api-endpoints/
│   │       ├── index.ts                 # Main endpoint exports
│   │       ├── clients.ts               # Client endpoints
│   │       ├── tasks.ts                 # Task endpoints
│   │       ├── projects.ts              # Project endpoints
│   │       ├── userManage.ts            # User endpoints
│   │       ├── files.ts                 # File endpoints
│   │       ├── documents.ts             # Document endpoints
│   │       └── settings.ts              # Settings endpoints
│   │
│   ├── auth/                             # Authentication
│   │   ├── context/
│   │   │   └── jwt/
│   │   │       ├── auth-provider.jsx    # Auth context provider
│   │   │       ├── auth-consumer.jsx    # Auth consumer hook
│   │   │       └── utils.ts             # Token management utilities
│   │   └── hooks/
│   │       └── use-auth-context.js      # useAuthContext hook
│   │
│   ├── components/                       # Reusable UI Components
│   │   ├── table/                       # Table components
│   │   │   ├── table-head-custom.jsx
│   │   │   ├── table-pagination-custom.jsx
│   │   │   ├── table-no-data.jsx
│   │   │   └── use-table.js
│   │   ├── custom-dialog/               # Dialog components
│   │   │   └── confirm-dialog.jsx
│   │   ├── hook-form/                   # Form components
│   │   │   ├── form-provider.jsx
│   │   │   └── rhf-text-field.jsx
│   │   ├── iconify/                     # Icon component
│   │   ├── label/                       # Label component
│   │   ├── snackbar/                    # Toast notifications
│   │   └── settings/                    # Settings drawer
│   │
│   ├── layouts/                          # Layout Components
│   │   ├── dashboard/
│   │   │   ├── layout.jsx               # Dashboard layout wrapper
│   │   │   ├── nav.jsx                  # Navigation sidebar
│   │   │   └── header.jsx               # Dashboard header
│   │   ├── main/
│   │   │   └── layout.jsx               # Main layout for public pages
│   │   └── support/
│   │       └── layout.jsx               # Support layout
│   │
│   ├── locales/                          # Internationalization
│   │   ├── langs/
│   │   │   ├── en/
│   │   │   │   ├── common.json
│   │   │   │   └── support.json
│   │   │   └── ar/
│   │   │       ├── common.json
│   │   │       └── support.json
│   │   ├── i18n-provider.jsx
│   │   └── server.js
│   │
│   ├── theme/                            # MUI Theme Configuration
│   │   ├── core/
│   │   │   ├── palette.js
│   │   │   └── typography.js
│   │   ├── theme-provider.jsx
│   │   └── scheme-config.js
│   │
│   ├── routes/                           # Routing Configuration
│   │   ├── paths.js                     # Path definitions
│   │   ├── hooks/
│   │   │   └── use-router.js
│   │   └── components/
│   │       └── router-link.jsx
│   │
│   ├── hooks/                            # Custom React Hooks
│   │   ├── use-boolean.js               # Boolean state hook
│   │   ├── use-set-state.js             # Object state hook
│   │   └── use-table.js                 # Table state hook
│   │
│   ├── config-global.js                  # Global configuration
│   └── global.css                        # Global styles
│
├── docs/                                 # Documentation
│   └── DATA_FLOW_ARCHITECTURE.md        # This file
│
├── public/                               # Static assets
│   └── assets/
│       ├── icons/
│       ├── images/
│       └── support/
│
├── package.json                          # Dependencies
├── next.config.js                        # Next.js configuration
└── tsconfig.json                         # TypeScript configuration
```

### Key File Descriptions

#### API Endpoints (`src/utils/api-endpoints/`)

**clients.ts**:
```typescript
export const clientEndpoints = {
  getClients: '/client/client/getClients',
  addClient: '/client/client/addClient',
  updateClient: '/client/client/updateClient',
  deleteClient: '/client/client/deleteClient',

  getLeads: '/client/leads/getLeads',
  addLead: '/client/leads/addLead',
  updateLead: '/client/leads/updateLead',
  deleteLead: '/client/leads/deleteLead',

  getSources: '/client/sources/getSources',
  addSource: '/client/sources/addSource',
};
```

**tasks.ts**:
```typescript
export const taskEndpoints = {
  getTask: '/task/Task/getTaskQuery',
  createTask: '/task/Task/createTask',
  updateTask: '/task/Task/updateTask',
  deleteTask: '/task/Task/deleteTask',
  changeStatus: '/task/Task/changeStatus',

  getStatus: '/task/Status/getStatus',
  addStatus: '/task/Status/addStatus',
  updateStatus: 'task/Status/updateStatus',
  deleteStatus: '/task/Status/deleteStatus',
};
```

**index.ts** (Main export):
```typescript
import { userEndpoints } from './userManage';
import { clientEndpoints } from './clients';
import { taskEndpoints } from './tasks';
import { projectEndpoints } from './projects';

export const apiEndpoints = {
  auth: {
    signIn: '/tenant/Users/login',
    forgotPassword: '/tenant/Users/forgotPassword',
    resetPassword: '/tenant/Users/resetPassword',
    refreshToken: '/tenant/Users/refresh',
  },
  users: userEndpoints,
  clients: clientEndpoints,
  tasks: taskEndpoints,
  projects: projectEndpoints,
};
```

---

## Key Technologies

### 1. Next.js 13+ (App Router)
**Purpose**: React framework for production

**Features Used**:
- File-based routing
- Server-side rendering (SSR)
- Server components
- Layouts and nested layouts
- API routes

**Configuration** (`next.config.js`):
```javascript
module.exports = {
  reactStrictMode: true,
  i18n: {
    locales: ['en', 'ar'],
    defaultLocale: 'en',
  },
};
```

### 2. SWR (Stale-While-Revalidate)
**Purpose**: Data fetching and caching library

**Why SWR?**
- ✅ Automatic caching
- ✅ Automatic revalidation
- ✅ Request deduplication
- ✅ Optimistic UI updates
- ✅ Built-in error handling
- ✅ TypeScript support

**Installation**:
```bash
npm install swr
```

**Basic Usage**:
```javascript
import useSWR from 'swr';

function Component() {
  const { data, error, isLoading, mutate } = useSWR(key, fetcher);

  if (isLoading) return <Loading />;
  if (error) return <Error />;
  return <div>{data}</div>;
}
```

### 3. Axios
**Purpose**: HTTP client for API requests

**Features**:
- Request/response interceptors
- Automatic JSON transformation
- Request cancellation
- TypeScript support

**Installation**:
```bash
npm install axios
```

**Instance Configuration**:
```javascript
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'https://api.novotak.com',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});
```

### 4. Material-UI (MUI)
**Purpose**: React UI component library

**Components Used**:
- Table, TableRow, TableCell
- Card, Paper
- Button, IconButton
- Dialog, Drawer
- TextField, Select
- Tabs, Tab
- Grid, Box

**Installation**:
```bash
npm install @mui/material @emotion/react @emotion/styled
```

### 5. React Hook Form
**Purpose**: Form state management

**Features**:
- Minimal re-renders
- Built-in validation
- Easy integration with UI libraries
- TypeScript support

**Installation**:
```bash
npm install react-hook-form
```

**Usage**:
```javascript
import { useForm } from 'react-hook-form';

function Form() {
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = (data) => {
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('name', { required: true })} />
      {errors.name && <span>This field is required</span>}
      <button type="submit">Submit</button>
    </form>
  );
}
```

### 6. i18next
**Purpose**: Internationalization framework

**Languages Supported**:
- English (en)
- Arabic (ar) with RTL support

**Installation**:
```bash
npm install react-i18next i18next
```

**Usage**:
```javascript
import { useTranslation } from 'react-i18next';

function Component() {
  const { t, i18n } = useTranslation();

  return (
    <div>
      <h1>{t('welcome')}</h1>
      <button onClick={() => i18n.changeLanguage('ar')}>
        Switch to Arabic
      </button>
    </div>
  );
}
```

### 7. TypeScript
**Purpose**: Type safety for JavaScript

**Benefits**:
- Catch errors at compile time
- Better IDE support
- Self-documenting code
- Easier refactoring

**Configuration** (`tsconfig.json`):
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM"],
    "jsx": "preserve",
    "module": "ESNext",
    "moduleResolution": "node",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

---

## Code Examples

### Example 1: Complete Client List Implementation

#### 1. Page Component
**File**: `src/app/dashboard/client/list/page.jsx`

```javascript
import { ClientMainList } from 'src/sections/client/view';

export const metadata = {
  title: 'Client List - NovoTak',
};

export default function Page() {
  return <ClientMainList />;
}
```

#### 2. View Component
**File**: `src/sections/client/view/client-view.jsx`

```javascript
'use client';

import { useState } from 'react';
import { Card, Table, TableBody, Button } from '@mui/material';
import { DashboardContent } from 'src/layouts/dashboard';
import { getClients, deleteClient } from 'src/actions/client/clientActions';
import { ClientTableRow } from '../client-table-row';
import { ClientTableToolbar } from '../client-table-toolbar';
import { AddClientDetails } from '../add-client-details';

export function ClientView() {
  const [openDialog, setOpenDialog] = useState(false);
  const [filters, setFilters] = useState({ name: '', status: [] });

  // Fetch clients using action
  const { clientsList, clientsListLoading, clientsListError, mutate } = getClients({
    filters,
  });

  const handleDeleteRow = async (id) => {
    const result = await deleteClient({ id });
    if (result.success) {
      mutate(); // Refresh list
    }
  };

  if (clientsListLoading) return <LinearProgress />;
  if (clientsListError) return <ErrorView />;

  return (
    <DashboardContent>
      <Card>
        <ClientTableToolbar
          filters={filters}
          onFilters={setFilters}
          onAddClient={() => setOpenDialog(true)}
        />

        <Table>
          <TableBody>
            {clientsList.clients.map((row) => (
              <ClientTableRow
                key={row.id}
                row={row}
                onDeleteRow={() => handleDeleteRow(row.id)}
              />
            ))}
          </TableBody>
        </Table>
      </Card>

      <AddClientDetails
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        onSuccess={mutate}
      />
    </DashboardContent>
  );
}
```

#### 3. Action Function
**File**: `src/actions/client/clientActions.ts`

```typescript
import useSWR from 'swr';
import { useMemo } from 'react';
import { zetaAxiosInstance, postFetcher } from 'src/utils/axios-zeta';
import { apiEndpoints } from 'src/utils/api-endpoints';

export function getClients(payload?: GetClientPayload) {
  const finalPayload: GetClientPayload = {
    pagination: { pageNumber: 1, pageSize: 100 },
    ...payload,
  };

  const swrKey = useMemo(
    () => [apiEndpoints.clients.getClients, finalPayload],
    [JSON.stringify(finalPayload)]
  );

  const { data, isLoading, error, mutate } = useSWR(
    swrKey,
    postFetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000,
    }
  );

  const memoizedValue = useMemo(() => ({
    clientsList: {
      clients: data?.successStatus?.items ?? [],
      totalClients: data?.successStatus?.total,
    },
    clientsListLoading: isLoading,
    clientsListError: error,
    mutate,
  }), [data, error, isLoading]);

  return memoizedValue;
}

export async function addClient(data: CreateClient) {
  try {
    const response = await zetaAxiosInstance.post(
      apiEndpoints.clients.addClient,
      data
    );
    return { success: true, response };
  } catch (error) {
    return { success: false, error };
  }
}

export async function deleteClient(data: DeleteClient) {
  try {
    const response = await zetaAxiosInstance.delete(
      apiEndpoints.clients.deleteClient,
      { data }
    );
    return { success: true, response };
  } catch (error) {
    return { success: false, error };
  }
}
```

#### 4. API Endpoints
**File**: `src/utils/api-endpoints/clients.ts`

```typescript
export const clientEndpoints = {
  getClients: '/client/client/getClients',
  addClient: '/client/client/addClient',
  updateClient: '/client/client/updateClient',
  deleteClient: '/client/client/deleteClient',
};
```

#### 5. Axios Configuration
**File**: `src/utils/axios-zeta.js`

```javascript
import axios from 'axios';
import { CONFIG } from 'src/config-global';
import { handleTokenExpiration } from 'src/auth/context/jwt/utils';

export const zetaAxiosInstance = axios.create({
  baseURL: CONFIG.zetaApiUrl,
});

// Request interceptor - Add auth token
zetaAxiosInstance.interceptors.request.use(
  async (config) => {
    const token = await handleTokenExpiration();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - Handle 401
zetaAxiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const newToken = await handleTokenExpiration();

      if (newToken) {
        originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
        return zetaAxiosInstance(originalRequest);
      }
    }

    return Promise.reject(error);
  }
);

export const postFetcher = async (args) => {
  const [url, data, config] = Array.isArray(args) ? args : [args, {}, {}];
  const res = await zetaAxiosInstance.post(url, data, { ...config });
  return res.data;
};
```

---

### Example 2: Form with Validation

**File**: `src/sections/client/add-client-details.jsx`

```javascript
import { useForm } from 'react-hook-form';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from '@mui/material';
import { addClient } from 'src/actions/client/clientActions';
import { toast } from 'src/components/snackbar';

export function AddClientDetails({ open, onClose, onSuccess }) {
  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  const onSubmit = async (data) => {
    const result = await addClient(data);

    if (result.success) {
      toast.success('Client added successfully');
      onSuccess(); // Trigger mutate to refresh list
      reset();
      onClose();
    } else {
      toast.error('Failed to add client');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle>Add New Client</DialogTitle>

        <DialogContent>
          <TextField
            fullWidth
            label="Client Name"
            margin="normal"
            {...register('name', { required: 'Name is required' })}
            error={!!errors.name}
            helperText={errors.name?.message}
          />

          <TextField
            fullWidth
            label="Email"
            type="email"
            margin="normal"
            {...register('email', {
              required: 'Email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email address',
              },
            })}
            error={!!errors.email}
            helperText={errors.email?.message}
          />

          <TextField
            fullWidth
            label="Phone"
            margin="normal"
            {...register('phone', { required: 'Phone is required' })}
            error={!!errors.phone}
            helperText={errors.phone?.message}
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained">Save</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
```

---

### Example 3: Custom Hook for Table State

**File**: `src/hooks/use-table.js`

```javascript
import { useState, useCallback } from 'react';

export function useTable(defaultRowsPerPage = 10) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(defaultRowsPerPage);
  const [orderBy, setOrderBy] = useState('name');
  const [order, setOrder] = useState('asc');
  const [selected, setSelected] = useState([]);

  const onChangePage = useCallback((event, newPage) => {
    setPage(newPage);
  }, []);

  const onChangeRowsPerPage = useCallback((event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  }, []);

  const onSort = useCallback((property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  }, [order, orderBy]);

  const onSelectRow = useCallback((id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }, []);

  const onSelectAllRows = useCallback((checked, rows) => {
    if (checked) {
      setSelected(rows.map((row) => row.id));
    } else {
      setSelected([]);
    }
  }, []);

  return {
    page,
    rowsPerPage,
    orderBy,
    order,
    selected,
    onChangePage,
    onChangeRowsPerPage,
    onSort,
    onSelectRow,
    onSelectAllRows,
  };
}
```

---

### Example 4: Localization Usage

**File**: `src/sections/client/view/client-view.jsx`

```javascript
import { useTranslation } from 'react-i18next';

export function ClientView() {
  const { t } = useTranslation();

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading={t('clients.title')}
        links={[
          { name: t('dashboard'), href: '/dashboard' },
          { name: t('clients.list') },
        ]}
      />

      <Button variant="contained">
        {t('clients.addNew')}
      </Button>
    </DashboardContent>
  );
}
```

**Translation Files**:

`src/locales/langs/en/common.json`:
```json
{
  "dashboard": "Dashboard",
  "clients": {
    "title": "Clients",
    "list": "Client List",
    "addNew": "Add New Client",
    "edit": "Edit Client",
    "delete": "Delete Client"
  }
}
```

`src/locales/langs/ar/common.json`:
```json
{
  "dashboard": "لوحة التحكم",
  "clients": {
    "title": "العملاء",
    "list": "قائمة العملاء",
    "addNew": "إضافة عميل جديد",
    "edit": "تعديل العميل",
    "delete": "حذف العميل"
  }
}
```

---

### Example 5: Protected Route with Authentication

**File**: `src/app/dashboard/layout.jsx`

```javascript
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from 'src/auth/hooks';
import { DashboardLayout } from 'src/layouts/dashboard';
import { SplashScreen } from 'src/components/loading-screen';

export default function Layout({ children }) {
  const router = useRouter();
  const { user, loading } = useAuthContext();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/jwt/sign-in');
    }
  }, [user, loading, router]);

  if (loading) {
    return <SplashScreen />;
  }

  if (!user) {
    return null;
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}
```

---

## Performance Optimizations

### 1. SWR Caching Strategy

**Benefits**:
- Reduces unnecessary API calls
- Improves perceived performance
- Automatic background revalidation

**Configuration**:
```javascript
const swrOptions = {
  revalidateOnFocus: false,      // Don't refetch on window focus
  revalidateOnReconnect: false,  // Don't refetch on reconnect
  dedupingInterval: 30000,       // Dedupe requests within 30s
};
```

### 2. React.memo for Components

**Prevents unnecessary re-renders**:

```javascript
import { memo } from 'react';

export const ClientTableRow = memo(({ row, onDeleteRow }) => {
  return (
    <TableRow>
      <TableCell>{row.name}</TableCell>
      <TableCell>{row.email}</TableCell>
      <TableCell>
        <IconButton onClick={onDeleteRow}>
          <DeleteIcon />
        </IconButton>
      </TableCell>
    </TableRow>
  );
});
```

### 3. useMemo for Expensive Calculations

**Memoize filtered/sorted data**:

```javascript
const filteredClients = useMemo(() => {
  return clientsList.clients.filter((client) => {
    const matchesName = client.name.toLowerCase().includes(filters.name.toLowerCase());
    const matchesStatus = filters.status.length === 0 || filters.status.includes(client.status);
    return matchesName && matchesStatus;
  });
}, [clientsList.clients, filters]);
```

### 4. useCallback for Event Handlers

**Prevent function recreation**:

```javascript
const handleDeleteRow = useCallback(async (id) => {
  const result = await deleteClient({ id });
  if (result.success) {
    mutate();
  }
}, [mutate]);
```

### 5. Code Splitting with Dynamic Imports

**Lazy load heavy components**:

```javascript
import dynamic from 'next/dynamic';

const AddClientDetails = dynamic(() => import('../add-client-details'), {
  loading: () => <CircularProgress />,
});
```

---

## Best Practices

### 1. Error Handling

**Always handle errors gracefully**:

```javascript
export function ClientView() {
  const { clientsList, clientsListLoading, clientsListError, mutate } = getClients();

  if (clientsListLoading) {
    return <LinearProgress />;
  }

  if (clientsListError) {
    return (
      <ErrorView
        title="Failed to load clients"
        message={clientsListError.message}
        onRetry={mutate}
      />
    );
  }

  return <ClientTable data={clientsList} />;
}
```

### 2. Loading States

**Provide feedback during async operations**:

```javascript
const [isSubmitting, setIsSubmitting] = useState(false);

const handleSubmit = async (data) => {
  setIsSubmitting(true);
  try {
    await addClient(data);
    toast.success('Client added');
  } catch (error) {
    toast.error('Failed to add client');
  } finally {
    setIsSubmitting(false);
  }
};

return (
  <Button type="submit" disabled={isSubmitting}>
    {isSubmitting ? <CircularProgress size={20} /> : 'Save'}
  </Button>
);
```

### 3. Type Safety

**Use TypeScript for actions and models**:

```typescript
// clientModels.ts
export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive';
}

export interface GetClientPayload {
  pagination: {
    pageNumber: number;
    pageSize: number;
  };
  filters?: {
    name?: string;
    status?: string[];
  };
}

export interface GetClientResponse {
  successStatus: {
    items: Client[];
    total: number;
  };
}
```

### 4. Consistent Naming Conventions

**Follow these patterns**:

- **Components**: PascalCase (`ClientView`, `AddClientDetails`)
- **Files**: kebab-case (`client-view.jsx`, `add-client-details.jsx`)
- **Functions**: camelCase (`getClients`, `handleDeleteRow`)
- **Constants**: UPPER_SNAKE_CASE (`API_BASE_URL`, `TABLE_HEAD`)
- **Hooks**: camelCase with 'use' prefix (`useTable`, `useAuthContext`)

### 5. Component Organization

**Structure components logically**:

```
sections/client/
├── view/
│   ├── client-view.jsx          # Main view
│   └── client-settings-view.jsx # Settings view
├── client-table-row.jsx         # Table row component
├── client-table-toolbar.jsx     # Toolbar component
├── client-table-filters.jsx     # Filters component
├── add-client-details.jsx       # Add/Edit dialog
└── client-mock-data.js          # Mock data for development
```

---

## Troubleshooting

### Common Issues

#### 1. Token Expiration Errors

**Problem**: Getting 401 errors even after login

**Solution**: Check token refresh logic

```javascript
// Verify token is being stored
console.log('Access Token:', sessionStorage.getItem('accessToken'));

// Check token expiration
const isExpired = isTokenExpired(accessToken);
console.log('Token Expired:', isExpired);

// Verify refresh token exists
console.log('Refresh Token:', sessionStorage.getItem('refreshToken'));
```

#### 2. SWR Not Refetching

**Problem**: Data not updating after mutation

**Solution**: Ensure mutate is called

```javascript
const handleAddClient = async (data) => {
  const result = await addClient(data);
  if (result.success) {
    mutate(); // ← Make sure this is called
  }
};
```

#### 3. CORS Errors

**Problem**: CORS policy blocking requests

**Solution**: Configure backend to allow frontend origin

```javascript
// Backend configuration (example)
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));
```

#### 4. Translation Keys Not Found

**Problem**: Seeing translation keys instead of text

**Solution**: Verify translation files exist

```javascript
// Check if translation exists
const { t, i18n } = useTranslation();
console.log('Current Language:', i18n.language);
console.log('Translation:', t('clients.title'));
```

---

## Conclusion

This documentation provides a comprehensive overview of the NovoTak application's data flow architecture. The layered approach ensures:

- ✅ **Separation of Concerns**: Clear boundaries between layers
- ✅ **Reusability**: Actions can be used across multiple components
- ✅ **Type Safety**: TypeScript for API contracts
- ✅ **Performance**: Efficient caching and memoization
- ✅ **Maintainability**: Organized file structure
- ✅ **Security**: Automatic token management and refresh
- ✅ **Scalability**: Easy to add new features and modules
- ✅ **Developer Experience**: Clear patterns and conventions

For questions or contributions, please refer to the project repository or contact the development team.

---

**Last Updated**: December 22, 2024
**Version**: 1.0.0
**Author**: NovoTak Development Team


