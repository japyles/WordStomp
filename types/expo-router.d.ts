import { Link, LinkProps } from 'expo-router';

declare global {
  namespace ReactNavigation {
    interface RootParamList {
      'game/[id]': { id: string };
      // Add other routes here as needed
    }
  }
}

// This extends the Link component to include our custom routes
declare module 'expo-router' {
  interface LinkProps<T> extends Omit<LinkProps<T>, 'href'> {
    href: string | { pathname: string; params?: Record<string, string> };
  }
}
