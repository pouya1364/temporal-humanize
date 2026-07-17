import type { LocaleInput, LocaleTranslations } from '../types.js';

const registry = new Map<string, LocaleTranslations>();

function expandCandidates(locale: LocaleInput | undefined): string[] {
  if (locale === undefined) return [];

  const entries = Array.isArray(locale) ? locale : [locale];
  const candidates: string[] = [];

  for (const entry of entries) {
    candidates.push(entry);
    const dashIndex = entry.indexOf('-');
    if (dashIndex > 0) {
      candidates.push(entry.slice(0, dashIndex));
    }
  }

  return candidates;
}

/**
 * Resolves a single translation field by walking the candidate locales (the
 * requested locale(s), each followed by its base language subtag) in order
 * and returning the first registered value found, or `fallback` if none of
 * the candidates have that field registered.
 *
 * @example
 * ```ts
 * import { resolveField } from './locale-registry.js';
 *
 * resolveField('es-MX', 'now', 'now'); // "now" unless 'es-MX' or 'es' registers `now`
 * ```
 */
export function resolveField<K extends keyof LocaleTranslations>(
  locale: LocaleInput | undefined,
  field: K,
  fallback: NonNullable<LocaleTranslations[K]>,
): NonNullable<LocaleTranslations[K]> {
  for (const candidate of expandCandidates(locale)) {
    const entry = registry.get(candidate);
    const value = entry?.[field];
    if (value !== undefined) return value as NonNullable<LocaleTranslations[K]>;
  }

  return fallback;
}

/**
 * Merges `translations` into whatever is already registered for `locale`
 * (fields not present in `translations` are left untouched), so repeated
 * calls for the same locale accumulate rather than clobber earlier fields.
 */
export function setLocale(locale: string, translations: Partial<LocaleTranslations>): void {
  const existing = registry.get(locale);
  registry.set(locale, existing ? { ...existing, ...translations } : { ...translations });
}

export function deleteLocale(locale: string): void {
  registry.delete(locale);
}

export function clearRegistry(): void {
  registry.clear();
}

export function registeredLocaleKeys(): string[] {
  return [...registry.keys()];
}
