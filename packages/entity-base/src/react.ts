import { createContext, createElement, useContext, useMemo, type ComponentType } from "react";
import { createPackageRegistry } from "./packageRegistry";
import type {
  UiPackageDescriptor,
  UiPackageEnumValues,
  UiPackageModuleExports,
  UiPackageProviderProps,
  UiPackageRegistry
} from "./types";

const UiPackageRegistryContext = createContext<UiPackageRegistry | undefined>(undefined);

export function UiPackageProvider({
  packages = [],
  registry,
  children
}: UiPackageProviderProps) {
  const value = useMemo(
    () => registry ?? createPackageRegistry(packages),
    [packages, registry]
  );

  return createElement(UiPackageRegistryContext.Provider, { value }, children);
}

export function useUiPackageRegistry(): UiPackageRegistry | undefined {
  return useContext(UiPackageRegistryContext);
}

export function useUiPage<TProps = unknown>(
  name: string,
  fallback: ComponentType<TProps>
): ComponentType<TProps>;
export function useUiPage<TProps = unknown>(
  name: string,
  fallback?: ComponentType<TProps>
): ComponentType<TProps> | undefined;
export function useUiPage<TProps = unknown>(name: string, fallback?: ComponentType<TProps>) {
  const registry = useUiPackageRegistry();
  return registry?.getPage<TProps>(name) ?? fallback;
}

export function useUiTemplate<TProps = unknown>(
  name: string,
  fallback: ComponentType<TProps>
): ComponentType<TProps>;
export function useUiTemplate<TProps = unknown>(
  name: string,
  fallback?: ComponentType<TProps>
): ComponentType<TProps> | undefined;
export function useUiTemplate<TProps = unknown>(
  name: string,
  fallback?: ComponentType<TProps>
) {
  const registry = useUiPackageRegistry();
  return registry?.getTemplate<TProps>(name) ?? fallback;
}

export function useUiField<TProps = unknown>(
  name: string,
  fallback: ComponentType<TProps>
): ComponentType<TProps>;
export function useUiField<TProps = unknown>(
  name: string,
  fallback?: ComponentType<TProps>
): ComponentType<TProps> | undefined;
export function useUiField<TProps = unknown>(
  name: string,
  fallback?: ComponentType<TProps>
) {
  const registry = useUiPackageRegistry();
  return registry?.getField<TProps>(name) ?? fallback;
}

export function useUiGrid<TProps = unknown>(
  name: string,
  fallback: ComponentType<TProps>
): ComponentType<TProps>;
export function useUiGrid<TProps = unknown>(
  name: string,
  fallback?: ComponentType<TProps>
): ComponentType<TProps> | undefined;
export function useUiGrid<TProps = unknown>(
  name: string,
  fallback?: ComponentType<TProps>
) {
  const registry = useUiPackageRegistry();
  return registry?.getGrid<TProps>(name) ?? fallback;
}

export function useUiComponent<TProps = unknown>(
  name: string,
  fallback: ComponentType<TProps>
): ComponentType<TProps>;
export function useUiComponent<TProps = unknown>(
  name: string,
  fallback?: ComponentType<TProps>
): ComponentType<TProps> | undefined;
export function useUiComponent<TProps = unknown>(
  name: string,
  fallback?: ComponentType<TProps>
) {
  const registry = useUiPackageRegistry();
  return registry?.getComponent<TProps>(name) ?? fallback;
}

export function useUiEnum<TValues extends UiPackageEnumValues = UiPackageEnumValues>(
  name: string,
  fallback: TValues
): TValues;
export function useUiEnum<TValues extends UiPackageEnumValues = UiPackageEnumValues>(
  name: string,
  fallback?: TValues
): TValues | undefined;
export function useUiEnum<TValues extends UiPackageEnumValues = UiPackageEnumValues>(
  name: string,
  fallback?: TValues
) {
  const registry = useUiPackageRegistry();
  return registry?.getEnum<TValues>(name) ?? fallback;
}

export function useUiModule<TExports extends UiPackageModuleExports = UiPackageModuleExports>(
  name: string,
  fallback: TExports
): TExports;
export function useUiModule<TExports extends UiPackageModuleExports = UiPackageModuleExports>(
  name: string,
  fallback?: TExports
): TExports | undefined;
export function useUiModule<TExports extends UiPackageModuleExports = UiPackageModuleExports>(
  name: string,
  fallback?: TExports
) {
  const registry = useUiPackageRegistry();
  return registry?.getModule<TExports>(name) ?? fallback;
}

export function useUiPackage(name: string): UiPackageDescriptor | undefined {
  const registry = useUiPackageRegistry();
  return registry?.packages.find((pkg) => pkg.name === name);
}
