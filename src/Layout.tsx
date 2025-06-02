import { Outlet, Link, useLocation } from "react-router-dom";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Tabs, TabsList, TabsTrigger } from "./components/ui/tabs";
import { useTheme } from "./hooks/useTheme";

export default function Layout() {
  const { theme, setTheme } = useTheme();
  const location = useLocation();

  const setAppTheme = (theme: "blue" | "pink") => {
    setTheme(theme);
  };

  // Define pages that don't need the theme Tabs
  const pagesWithoutTheme = ["/company/info"];

  // Check if the current route matches any of the pages in the array
  const isPageWithoutTheme = pagesWithoutTheme.includes(location.pathname);

  return (
    <div data-theme={isPageWithoutTheme ? 'blue' : theme} className="bg-(--bg-primary) text-[var(--foreground-primary)] flex flex-col min-h-screen">
      <header className="sticky top-0 z-10 w-full border-b bg-white text-black">
        <div className="flex h-16 items-center justify-between px-4">
          <NavigationMenu className="flex justify-center w-full">
            <NavigationMenuList className="mx-auto">
              <NavigationMenuItem>
                <Link to="/">
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                    Home
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link to="/list">
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                    List
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link to="/company/info">
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                    Company Info
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
          {/* Only show Tabs if the current page is not in the pagesWithoutTheme array */}
          {!isPageWithoutTheme && (
            <Tabs defaultValue={theme}>
              <TabsList>
                <TabsTrigger value="blue" onClick={() => setAppTheme("blue")}>
                  Blue
                </TabsTrigger>
                <TabsTrigger value="pink" onClick={() => setAppTheme("pink")}>
                  Pink
                </TabsTrigger>
              </TabsList>
            </Tabs>
          )}
        </div>
      </header>
      <Outlet />
    </div>
  );
}