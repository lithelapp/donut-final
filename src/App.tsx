import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";
import Home from "./pages/home";
import Layout from "./Layout";
import List from "./pages/list";
import CompanyInfo from "./pages/company/info";
import { ThemeProvider } from "./components/theme-provider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

function App() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: 3, // Retry failed requests up to 3 times
        retryDelay: (attempt: number) => Math.min(1000 * 2 ** attempt, 30000), // Exponential backoff with a max delay of 30 seconds
      },
    },
  });

  const router = createBrowserRouter([
    {
      element: <Layout />,
      children: [
        {
          path: "/",
          element: <Home />,
        },
        {
          path: "/list",
          element: <List />,
        },
        {
          path: "/company",
          children: [
            // Assuming /company would also redirect to /company/info
            {
              index: true,
              // Redirect /company to /company/info using Navigate
              element: <Navigate to="/company/info" replace />,
            },
            {
              path: "info",
              element: <CompanyInfo />,
            },
            {
              // Catch all unmatched paths under /company
              path: "*",
              element: <Navigate to="/company/info" replace />,
            },
          ],
        },
      ],
    },
  ]);

  return (
    <ThemeProvider defaultTheme="blue" storageKey="vite-ui-theme">
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
