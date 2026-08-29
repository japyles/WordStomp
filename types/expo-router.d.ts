export {};

declare global {
  namespace ReactNavigation {
    interface RootParamList {
      'game/[id]': { id: string };
      // Add other routes here as needed
    }
  }
}
