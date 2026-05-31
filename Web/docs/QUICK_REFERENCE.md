# NovoTak - Quick Reference Guide

## 🚀 Quick Start

### Running the Application

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### Environment Variables

Create `.env.local` file:

```env
NEXT_PUBLIC_ZETA_API_URL=https://api.novotak.com
NEXT_PUBLIC_SERVER_URL=http://localhost:3000
```

---

## 📁 File Locations Cheat Sheet

| What You Need | Where to Find It |
|---------------|------------------|
| **Pages** | `src/app/**/page.jsx` |
| **Layouts** | `src/app/**/layout.jsx` |
| **Components** | `src/sections/[module]/` |
| **API Actions** | `src/actions/[module]/` |
| **API Endpoints** | `src/utils/api-endpoints/` |
| **Axios Config** | `src/utils/axios-zeta.js` |
| **Auth Context** | `src/auth/context/jwt/` |
| **Translations** | `src/locales/langs/[en|ar]/` |
| **Theme** | `src/theme/` |
| **Shared Components** | `src/components/` |

---

## 🔄 Common Workflows

### 1. Adding a New Page

```bash
# Create page file
src/app/dashboard/[module]/list/page.jsx
```

```javascript
import { ModuleView } from 'src/sections/[module]/view';

export const metadata = {
  title: 'Module List - NovoTak',
};

export default function Page() {
  return <ModuleView />;
}
```

### 2. Creating a New API Action

**Step 1**: Define endpoint in `src/utils/api-endpoints/[module].ts`

```typescript
export const moduleEndpoints = {
  getItems: '/module/Item/getItems',
  addItem: '/module/Item/addItem',
  updateItem: '/module/Item/updateItem',
  deleteItem: '/module/Item/deleteItem',
};
```

**Step 2**: Create action in `src/actions/[module]/moduleActions.ts`

```typescript
import useSWR from 'swr';
import { useMemo } from 'react';
import { postFetcher, zetaAxiosInstance } from 'src/utils/axios-zeta';
import { apiEndpoints } from 'src/utils/api-endpoints';

export function getItems(payload) {
  const swrKey = useMemo(
    () => [apiEndpoints.module.getItems, payload],
    [JSON.stringify(payload)]
  );

  const { data, isLoading, error, mutate } = useSWR(swrKey, postFetcher);

  return useMemo(() => ({
    itemsList: data?.successStatus?.items ?? [],
    itemsListLoading: isLoading,
    itemsListError: error,
    mutate,
  }), [data, error, isLoading]);
}

export async function addItem(data) {
  try {
    const response = await zetaAxiosInstance.post(
      apiEndpoints.module.addItem,
      data
    );
    return { success: true, response };
  } catch (error) {
    return { success: false, error };
  }
}
```

**Step 3**: Use in component

```javascript
import { getItems, addItem } from 'src/actions/[module]/moduleActions';

export function ModuleView() {
  const { itemsList, itemsListLoading, mutate } = getItems();

  const handleAdd = async (data) => {
    const result = await addItem(data);
    if (result.success) {
      mutate(); // Refresh list
    }
  };

  return <div>{/* Your UI */}</div>;
}
```

### 3. Adding Translations

**English** (`src/locales/langs/en/common.json`):
```json
{
  "module": {
    "title": "Module Title",
    "addNew": "Add New Item"
  }
}
```

**Arabic** (`src/locales/langs/ar/common.json`):
```json
{
  "module": {
    "title": "عنوان الوحدة",
    "addNew": "إضافة عنصر جديد"
  }
}
```

**Usage**:
```javascript
import { useTranslation } from 'react-i18next';

function Component() {
  const { t } = useTranslation();
  return <h1>{t('module.title')}</h1>;
}
```

---

## 🎯 Common Code Snippets

### Fetch Data with SWR

```javascript
const { data, isLoading, error, mutate } = useSWR(
  [apiEndpoints.module.getItems, payload],
  postFetcher
);
```

### Make API Call

```javascript
const response = await zetaAxiosInstance.post(endpoint, data);
```

### Show Toast Notification

```javascript
import { toast } from 'src/components/snackbar';

toast.success('Operation successful');
toast.error('Operation failed');
toast.info('Information message');
toast.warning('Warning message');
```

### Open Confirmation Dialog

```javascript
import { useBoolean } from 'src/hooks/use-boolean';
import { ConfirmDialog } from 'src/components/custom-dialog';

const confirm = useBoolean();

<ConfirmDialog
  open={confirm.value}
  onClose={confirm.onFalse}
  title="Delete"
  content="Are you sure you want to delete this item?"
  action={
    <Button variant="contained" color="error" onClick={handleDelete}>
      Delete
    </Button>
  }
/>
```

---

## 🔐 Authentication

### Get Current User

```javascript
import { useAuthContext } from 'src/auth/hooks';

function Component() {
  const { user, loading } = useAuthContext();
  
  if (loading) return <Loading />;
  if (!user) return <Login />;
  
  return <div>Welcome {user.name}</div>;
}
```

### Check User Permissions

```javascript
const { user } = useAuthContext();
const canEdit = user?.permissions?.includes('client.edit');

{canEdit && <Button>Edit</Button>}
```

---

## 📊 Table Implementation

```javascript
import { useTable } from 'src/components/table';

function ListView() {
  const table = useTable();

  return (
    <Table>
      <TableHeadCustom
        order={table.order}
        orderBy={table.orderBy}
        headLabel={TABLE_HEAD}
        onSort={table.onSort}
      />
      <TableBody>
        {data.map((row) => (
          <TableRow key={row.id}>
            <TableCell>{row.name}</TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TablePaginationCustom
        count={total}
        page={table.page}
        rowsPerPage={table.rowsPerPage}
        onPageChange={table.onChangePage}
        onRowsPerPageChange={table.onChangeRowsPerPage}
      />
    </Table>
  );
}
```

---

## 🎨 Common MUI Components

```javascript
import {
  Card,
  Table,
  TableBody,
  TableRow,
  TableCell,
  Button,
  IconButton,
  Dialog,
  TextField,
  MenuItem,
  Chip,
  Avatar,
  Box,
  Stack,
} from '@mui/material';
```

---

## 🐛 Debugging Tips

### Check API Calls

```javascript
// In browser console
console.log('SWR Cache:', window.__SWR_CACHE__);
```

### Check Auth Token

```javascript
console.log('Token:', sessionStorage.getItem('accessToken'));
```

### Check Current Language

```javascript
import { useTranslation } from 'react-i18next';

const { i18n } = useTranslation();
console.log('Language:', i18n.language);
```

---

## 📝 Naming Conventions

- **Components**: `PascalCase` → `ClientView.jsx`
- **Files**: `kebab-case` → `client-view.jsx`
- **Functions**: `camelCase` → `getClients()`
- **Constants**: `UPPER_SNAKE_CASE` → `API_BASE_URL`
- **Hooks**: `camelCase` with `use` → `useTable()`

---

## 🔗 Useful Links

- [Next.js Documentation](https://nextjs.org/docs)
- [SWR Documentation](https://swr.vercel.app/)
- [Material-UI Documentation](https://mui.com/)
- [React Hook Form](https://react-hook-form.com/)
- [i18next Documentation](https://www.i18next.com/)

---

**For detailed architecture information, see [DATA_FLOW_ARCHITECTURE.md](./DATA_FLOW_ARCHITECTURE.md)**

