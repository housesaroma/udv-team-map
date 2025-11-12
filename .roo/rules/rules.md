## Technology Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: UnoCSS with custom theme
- **UI Components**: PrimeReact
- **State Management**: Redux Toolkit
- **Routing**: React Router DOM
- **Build Tool**: Vite

## Code Standards

### TypeScript

- Strict typing always
- Use `interface` for component props
- Avoid `any` - use `unknown` or specific types
- Export types from `@/types`

### React 18+

- Functional components with hooks
- Use `useCallback` and `useMemo` for optimization
- Follow Strict Mode guidelines
- Implement Error Boundaries

### Styling (UnoCSS)

```tsx
// ✅ Correct
<div className="flex items-center justify-center p-4 bg-primary">

// ❌ Avoid
<div style={{ display: 'flex' }}>
```

### PrimeReact Components

- Use Prime prefix for custom wrappers

- Customize via UnoCSS CSS variables

- All props must be typed

- Redux Toolkit
- Feature-based slices

- Use createAsyncThunk for async operations

- Normalized state structure

- RTK Query for API calls

- Naming Conventions
- Components: PascalCase (UserProfile.tsx)

- Files: kebab-case for utils, PascalCase for components

- Variables: camelCase

- Constants: UPPER_SNAKE_CASE

### Import Order

```tsx
import React from "react";
import { useSelector } from "react-redux";
import { Button } from "primereact/button";
import { UserCard } from "@/components/UserCard";
import { useAuth } from "@/hooks/useAuth";
import { User } from "@/types/user";
import "./styles.css";
```

### Quality Automation

After Every Task/RESPONSE Run:

```bash
npm run fix:all    # ESLint + Prettier auto-fix
npm test           # Run test suite
npm run build      # Verify build works
```

### Error Resolution:

- ESLint/Prettier errors - Auto-fix or manually resolve

- Test failures - Fix tests or implementation

- Build failures - Resolve TypeScript/import issues

- Critical Reminders
- Always check types before committing

- Use UnoCSS classes over inline styles

- Leverage PrimeReact components when possible

- Follow RTK patterns for state management

- Use React Router for navigation

- AFTER EVERY RESPONSE/TASK - run validation scripts!
