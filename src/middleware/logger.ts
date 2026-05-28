import fs from 'fs';
import path from 'path';

const logFile = path.resolve(__dirname, '..', '..', 'server.log');

function formatTimestamp(): string {
  return new Date().toISOString();
}

export function logEvent(event: string): void {
  const line = `[${formatTimestamp()}] ${event}\n`;
  fs.appendFileSync(logFile, line, 'utf-8');
}

export function loggerMiddleware(req: any, _res: any, next: any): void {
  const method = req.method;
  const url = req.originalUrl || req.url;

  if (url.startsWith('/api/auth/login') && method === 'POST') {
    const originalSend = _res.send;
    _res.send = function (body: any) {
      try {
        const parsed = typeof body === 'string' ? JSON.parse(body) : body;
        if (parsed.token) {
          logEvent(`Successful login: email=${req.body?.email || 'unknown'}, ip=${req.ip}`);
        } else {
          logEvent(`Failed login attempt: email=${req.body?.email || 'unknown'}, ip=${req.ip}`);
        }
      } catch { /* ignore parse errors */ }
      return originalSend.call(this, body);
    };
  }

  if (url === '/api/orders' && method === 'POST') {
    const originalSend = _res.send;
    _res.send = function (body: any) {
      try {
        const parsed = typeof body === 'string' ? JSON.parse(body) : body;
        if (parsed.order) {
          logEvent(`Checkout transaction: order_id=${parsed.order.id}, total=${parsed.order.total}, ip=${req.ip}`);
        }
      } catch { /* ignore parse errors */ }
      return originalSend.call(this, body);
    };
  }

  if (url.startsWith('/api/admin/products/') && (method === 'PUT' || method === 'PATCH')) {
    const originalSend = _res.send;
    _res.send = function (body: any) {
      try {
        logEvent(`Product price change: product_id=${req.params?.id}, ip=${req.ip}`);
      } catch { /* ignore parse errors */ }
      return originalSend.call(this, body);
    };
  }

  next();
}