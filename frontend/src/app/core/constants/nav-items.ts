export interface NavItem {
  readonly label: string;
  readonly path: string;
  readonly icon: string;
}

export const NAV_ITEMS: readonly NavItem[] = [
  {label: 'Blog', path: '/blog', icon: 'fa-blog'},
  {label: 'Offers', path: '/offers', icon: 'fa-tags'},
] as const;
