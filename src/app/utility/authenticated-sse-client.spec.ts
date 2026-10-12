import { AuthenticatedSSEClient } from './authenticated-sse-client';
import { AuthService } from '../auth/auth.service';

describe('AuthenticatedSSEClient', () => {
  let client: AuthenticatedSSEClient;
  let authService: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    authService = jasmine.createSpyObj<AuthService>('AuthService', [
      'getApiToken',
    ]);
    authService.getApiToken.and.returnValue('bearer test-token');
    client = new AuthenticatedSSEClient(authService);
  });

  it('should parse CRLF-delimited SSE events without trailing carriage returns', () => {
    const callback = jasmine.createSpy('statusListener');
    client.addEventListener('status', callback);

    (client as any).processLine('event: status\r');
    (client as any).processLine('data: {"message":"hello"}\r');
    (client as any).processLine('');

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith('{"message":"hello"}');
  });

  it('should accept LF and CR line endings while preserving payload text', () => {
    const callback = jasmine.createSpy('logListener');
    client.addEventListener('log', callback);

    (client as any).processLine('event: log\n');
    (client as any).processLine('data: hello\r');
    (client as any).processLine('');

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith('hello');
  });
});
