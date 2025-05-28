const TELEGRAM_API_BASE = 'https://api.telegram.org';

const DOC_HTML = `<!DOCTYPE html>...<b>ok</b>`;

async function handleRequest(request) {
  const url = new URL(request.url);

  if (url.pathname === '/' || url.pathname === '') {
    return new Response(DOC_HTML, {
      headers: {
        'Content-Type': 'text/html; charset=UTF-8',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  }

  const pathParts = url.pathname.split('/').filter(Boolean);
  if (pathParts.length < 2 || !pathParts[0].startsWith('bot')) {
    return new Response('Invalid bot request format', { status: 400 });
  }

  const telegramUrl = `${TELEGRAM_API_BASE}${url.pathname}${url.search}`;

  const requestHeaders = new Headers(request.headers);
  let body = null;
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    body = await request.arrayBuffer();
  }

  try {
    const telegramResponse = await fetch(telegramUrl, {
      method: request.method,
      headers: requestHeaders,
      body: body,
      redirect: 'follow',
    });

    const responseHeaders = new Headers(telegramResponse.headers);
    responseHeaders.set('Access-Control-Allow-Origin', '*');
    responseHeaders.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    responseHeaders.set('Access-Control-Allow-Headers', 'Content-Type');

    return new Response(telegramResponse.body, {
      status: telegramResponse.status,
      statusText: telegramResponse.statusText,
      headers: responseHeaders,
    });
  } catch (err) {
    return new Response(`Error proxying request: ${err.message}`, { status: 500 });
  }
}

function handleOptions(request) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  };

  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}

addEventListener('fetch', event => {
  const request = event.request;
  if (request.method === 'OPTIONS') {
    event.respondWith(handleOptions(request));
  } else {
    event.respondWith(handleRequest(request));
  }
});
