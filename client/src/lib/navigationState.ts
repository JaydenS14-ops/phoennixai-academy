export function isNavigationActive(location: string, hash: string, href: string) {
  const [path, section] = href.split("#");
  return location === path && (section ? hash === `#${section}` : !hash);
}
