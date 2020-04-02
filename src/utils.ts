/**
 * Get the extension name from its id.
 * @param extId extension id, the format of it is ${publisher.name}.
 */
export function getExtensionName(extId: string): string {
  return extId.replace(/(\w+)\.(\w+)*/, '$2');
}

/**
 * Get the publisher name from its id.
 * @param extId extension id, the format of it is ${publisher.name}.
 */
export function getPublisherName(extId: string): string {
  return extId.replace(getExtensionName(extId), '').replace('.', '');
}
