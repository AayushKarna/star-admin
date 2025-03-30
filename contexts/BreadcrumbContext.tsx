import { createContext, useContext, useState } from 'react';

interface BreadcrumbContextType {
  breadcrumb: { label: string; href?: string }[];
  setBreadcrumb: (items: { label: string; href?: string }[]) => void;
}

const BreadcrumbContext = createContext<BreadcrumbContextType | undefined>(
  undefined
);

export function BreadcrumbProvider({
  children
}: {
  children: React.ReactNode;
}) {
  const [breadcrumb, setBreadcrumb] = useState<
    { label: string; href?: string }[]
  >([]);

  return (
    <BreadcrumbContext.Provider value={{ breadcrumb, setBreadcrumb }}>
      {children}
    </BreadcrumbContext.Provider>
  );
}

export function useBreadcrumb() {
  const context = useContext(BreadcrumbContext);
  if (!context) {
    throw new Error('useBreadcrumb must be used within a BreadcrumbProvider');
  }
  return context;
}
