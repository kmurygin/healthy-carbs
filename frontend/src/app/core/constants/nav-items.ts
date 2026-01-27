export interface NavItem {
  readonly label: string;
  readonly path: string;
  readonly icon: string;
}

export const NAV_ITEMS: readonly NavItem[] = [
  {label: 'Features', path: '/features', icon: 'fa-layer-group'},
  {label: 'Blog', path: '/blog', icon: 'fa-blog'},
  {label: 'Offers', path: '/offers', icon: 'fa-tags'},
  {label: 'About us', path: '/about-us', icon: 'fa-circle-info'},
] as const;
