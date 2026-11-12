import { parseAuthorizationHeader } from './parse-authorization-header.js';

describe('parseAuthorizationHeader', () => {
  it('should split the scheme and the credentials', () => {
    expect(parseAuthorizationHeader('Bearer abc.def')).toEqual({
      scheme: 'Bearer',
      credentials: 'abc.def',
    });
  });

  it('should ignore surrounding and repeated whitespace', () => {
    expect(parseAuthorizationHeader('  Basic   dXNlcjpwYXNz ')).toEqual({
      scheme: 'Basic',
      credentials: 'dXNlcjpwYXNz',
    });
  });

  it.each([undefined, '', 'Bearer', 'Bearer '])(
    'should return undefined for %j',
    (header) => {
      expect(parseAuthorizationHeader(header)).toBeUndefined();
    },
  );
});
