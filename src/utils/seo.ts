interface PageMetadata {
  title: string;
  description: string;
  path?: string;
  image?: string;
}

const upsertMeta = (property: 'name' | 'property', key: string, content: string) => {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[${property}="${key}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(property, key);
    document.head.appendChild(element);
  }
  element.content = content;
};

export const setPageMetadata = ({ title, description, path = window.location.pathname, image }: PageMetadata) => {
  document.title = title;
  upsertMeta('name', 'description', description);
  upsertMeta('property', 'og:title', title);
  upsertMeta('property', 'og:description', description);
  upsertMeta('property', 'og:type', 'website');
  upsertMeta('property', 'og:url', new URL(path, window.location.origin).toString());

  upsertMeta('property', 'og:image', new URL(image ?? '/hero-house-stone.webp', window.location.origin).toString());

  let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.rel = 'canonical';
    document.head.appendChild(canonical);
  }
  canonical.href = new URL(path, window.location.origin).toString();
};
