// src/navigation/navigationRef.js
import { createNavigationContainerRef } from "@react-navigation/native";

export const navigationRef = createNavigationContainerRef();

export function navigate(name, params) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name, params);
  }
}

export function reset(routes) {
  if (navigationRef.isReady()) {
    navigationRef.reset({
      index: 0,
      routes: routes,
    });
  }
}

// Hacer la referencia global para el interceptor
global.navigationRef = navigationRef;
