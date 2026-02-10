/**
 * Component Registry stub
 * Dynamic component lookup for domain diagrams - simplified for browser preview
 */

import React from 'react';

// Placeholder component for dynamic domain diagram components
const PlaceholderComponent: React.FC<any> = ({ label }) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(255,255,255,0.1)',
      borderRadius: '8px',
      padding: '8px',
      color: '#fff',
      fontSize: '14px',
    }}
  >
    {label || 'Component'}
  </div>
);

// Component registry map
export const componentRegistry: Record<string, React.FC<any>> = {
  // System design components
  DatabaseCylinder: PlaceholderComponent,
  ServiceNode: PlaceholderComponent,
  LoadBalancer: PlaceholderComponent,
  Cache: PlaceholderComponent,
  Queue: PlaceholderComponent,
  Gateway: PlaceholderComponent,

  // Generic fallback
  default: PlaceholderComponent,
};

// Get component from registry
export const getComponent = (componentName: string): React.FC<any> => {
  return componentRegistry[componentName] || componentRegistry.default;
};

// Render component by name
export const renderDynamicComponent = (componentName: string, props: any) => {
  const Component = getComponent(componentName);
  return <Component {...props} />;
};
