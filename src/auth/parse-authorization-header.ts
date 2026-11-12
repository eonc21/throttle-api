export interface ParsedAuthorizationHeader {
  scheme: string;
  credentials: string;
}

const AUTHORIZATION_HEADER_PATTERN = /^(\S+)\s+(\S.*)$/;

export function parseAuthorizationHeader(
  header: string | undefined,
): ParsedAuthorizationHeader | undefined {
  const match = header?.trim().match(AUTHORIZATION_HEADER_PATTERN);
  if (!match) {
    return undefined;
  }
  return { scheme: match[1], credentials: match[2] };
}
