# Finvest - Your Financial Buddy

This project is split into separate frontend and backend directories to maintain a clean architecture:

*   **`frontend/`**: The React + Vite client-side application.
*   **`backend/`**: Supabase migrations, schemas, and backend configurations.

## Commands

For convenience, helper scripts are configured at the root level to delegate commands to the `frontend/` directory.

### Root-Level commands:
*   `npm run dev` - Starts the frontend development server.
*   `npm run build` - Builds the frontend production bundle.
*   `npm run lint` - Runs the linter.
*   `npm run preview` - Previews the built production site.

### Frontend-specific commands (within `frontend/` directory):
*   `npm install` - Installs frontend dependencies.
*   `npm run dev` - Starts Vite dev server.
*   `npm run build` - Builds production dist directory.
