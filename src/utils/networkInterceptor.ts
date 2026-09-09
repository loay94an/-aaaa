// Network Interceptor for Preview Environment
// Intercepts window.fetch and XMLHttpRequest targeting /api/* to simulate successful responses

export interface InterceptedRequestLog {
  id: string;
  timestamp: string;
  url: string;
  method: string;
  status: number;
  requestBody?: any;
  responseBody: any;
  contentType: string;
  isSimulated: boolean;
}

export interface ApiRouteHandler {
  pattern: RegExp | string;
  method?: string;
  handler: (url: string, options?: any) => { status?: number; data: any; headers?: Record<string, string> };
}

/**
 * Returns script code to be injected into the preview iframe to intercept fetch and XMLHttpRequest
 */
export function generateNetworkInterceptorScript(): string {
  return `
    (function() {
      if (window.__NETWORK_INTERCEPTOR_INSTALLED__) return;
      window.__NETWORK_INTERCEPTOR_INSTALLED__ = true;

      const interceptedLogs = [];
      window.__INTERCEPTED_API_LOGS__ = interceptedLogs;

      function logIntercept(url, method, status, reqBody, resBody, isSimulated) {
        const logItem = {
          id: 'req_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
          timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          url: url,
          method: method,
          status: status,
          requestBody: reqBody,
          responseBody: resBody,
          contentType: 'application/json',
          isSimulated: isSimulated
        };
        interceptedLogs.unshift(logItem);
        if (interceptedLogs.length > 50) interceptedLogs.pop();

        try {
          window.parent.postMessage({
            type: 'preview-network-intercept',
            log: logItem
          }, '*');
          
          window.parent.postMessage({
            type: 'preview-runtime-log',
            level: 'info',
            message: '[Network Interceptor] ⚡ ' + method + ' ' + url + ' => ' + status + ' (محاكاة خادم Express الافتراضي)'
          }, '*');
        } catch(e) {}
      }

      function resolveMockApiResponse(urlStr, method, body) {
        const methodUpper = (method || 'GET').toUpperCase();
        let parsedBody = null;
        if (typeof body === 'string') {
          try { parsedBody = JSON.parse(body); } catch(e) { parsedBody = body; }
        } else if (body) {
          parsedBody = body;
        }

        let status = 200;
        let responseData = {
          success: true,
          status: 'ok',
          endpoint: urlStr,
          method: methodUpper,
          timestamp: new Date().toISOString()
        };

        // 1. Health checks & Server info
        if (/\\/api(\\/health|\\/status|\\/ping)?\\/?$/i.test(urlStr) || urlStr.includes('/health')) {
          responseData = {
            success: true,
            status: 'ok',
            uptime: Math.floor(performance.now() / 1000),
            server: 'Virtual Express Network Interceptor',
            env: window.process?.env?.NODE_ENV || 'development',
            timestamp: new Date().toISOString()
          };
        } 
        // 2. Auth & Login / Register
        else if (urlStr.includes('/auth') || urlStr.includes('/login') || urlStr.includes('/signin')) {
          responseData = {
            success: true,
            token: 'mock-jwt-token-' + Math.random().toString(36).substring(2),
            user: {
              id: 'usr_1001',
              name: parsedBody?.name || parsedBody?.username || parsedBody?.email?.split('@')[0] || 'المستخدم التجريبي',
              email: parsedBody?.email || 'demo@user.local',
              role: 'admin'
            },
            message: 'تم تسجيل الدخول بنجاح عبر محاكي واجهات برمجة التطبيقات'
          };
        } 
        // 3. User info / Current user
        else if (urlStr.includes('/user') || urlStr.includes('/me') || urlStr.includes('/profile')) {
          if (methodUpper === 'GET') {
            responseData = {
              success: true,
              user: {
                id: 'usr_1001',
                name: 'المستخدم التجريبي',
                email: 'demo@user.local',
                role: 'admin',
                avatar: '',
                joinedDate: '2024-01-01'
              }
            };
          } else {
            responseData = {
              success: true,
              message: 'تم تحديث الملف الشخصي بنجاح',
              updated: parsedBody || {}
            };
          }
        }
        // 4. Chat, Gemini & AI Generation
        else if (urlStr.includes('/chat') || urlStr.includes('/generate') || urlStr.includes('/ai') || urlStr.includes('/completion')) {
          const userPrompt = parsedBody?.prompt || parsedBody?.message || (parsedBody?.messages && parsedBody.messages[parsedBody.messages.length - 1]?.content) || '';
          responseData = {
            success: true,
            message: 'تمت معالجة الطلب بنجاح عبر محاكي الذكاء الاصطناعي',
            text: 'مرحباً بك! هذه استجابة محاكاة تلقائية وناجحة من خادم الواجهات الخلفية (Network Interceptor) للطلب: "' + (userPrompt.slice(0, 40) || 'طلب جديد') + '". خادمك يعمل بكفاءة.',
            response: 'مرحباً بك! هذه استجابة محاكاة تلقائية وناجحة من خادم الواجهات الخلفية (Network Interceptor).',
            candidates: [
              {
                content: {
                  parts: [{ text: 'استجابة محاكاة نموذج الذكاء الاصطناعي الافتراضية.' }],
                  role: 'model'
                }
              }
            ]
          };
        }
        // 5. Employees & Attendance data
        else if (urlStr.includes('/employees') || urlStr.includes('/staff')) {
          if (window.__ATTENDANCE_DB_SERVICE__ && typeof window.__ATTENDANCE_DB_SERVICE__.getEmployees === 'function') {
            responseData = {
              success: true,
              employees: window.__ATTENDANCE_DB_SERVICE__.getEmployees(),
              data: window.__ATTENDANCE_DB_SERVICE__.getEmployees()
            };
          } else {
            responseData = {
              success: true,
              data: [
                { id: '1', name: 'أحمد محمود', role: 'مطور واجهات' },
                { id: '2', name: 'سارة العتيبي', role: 'مديرة مشاريع' }
              ]
            };
          }
        }
        // 6. Generic items / data listing & operations (CRUD)
        else if (methodUpper === 'POST' || methodUpper === 'PUT' || methodUpper === 'PATCH') {
          responseData = {
            success: true,
            id: parsedBody?.id || 'item_' + Date.now(),
            data: parsedBody || {},
            message: 'تم حفظ وتحديث البيانات بنجاح في محاكي الـ API',
            timestamp: new Date().toISOString()
          };
        } else if (methodUpper === 'DELETE') {
          responseData = {
            success: true,
            message: 'تم حذف العنصر المطلوب بنجاح',
            id: urlStr.split('/').pop()
          };
        } else {
          // Default GET response for any other /api/* endpoints
          responseData = {
            success: true,
            status: 'ok',
            endpoint: urlStr,
            method: methodUpper,
            data: [],
            items: [],
            message: 'استجابة تلقائية ناجحة من معترض الشبكة لمنع خطأ 404',
            timestamp: new Date().toISOString()
          };
        }

        return { status, data: responseData };
      }

      // ==========================================
      // 1. Intercept window.fetch
      // ==========================================
      const originalFetch = window.fetch;
      window.fetch = function(resource, init) {
        let urlStr = '';
        if (typeof resource === 'string') {
          urlStr = resource;
        } else if (resource && resource.url) {
          urlStr = resource.url;
        } else if (resource) {
          urlStr = resource.toString();
        }

        const method = (init?.method || (typeof resource === 'object' && resource.method) || 'GET').toUpperCase();
        const reqBody = init?.body || null;

        // Check if targeting /api or api/
        const isApiRoute = urlStr.startsWith('/api') || 
                           urlStr.startsWith('api/') || 
                           urlStr.includes('/api/') || 
                           (urlStr.startsWith('http') && /\\/api(\\b|\\/)/.test(urlStr));

        if (isApiRoute) {
          try {
            const mockRes = resolveMockApiResponse(urlStr, method, reqBody);
            logIntercept(urlStr, method, mockRes.status, reqBody, mockRes.data, true);

            const jsonString = JSON.stringify(mockRes.data);
            const responseObj = new Response(jsonString, {
              status: mockRes.status,
              statusText: 'OK (Simulated API Response)',
              headers: {
                'Content-Type': 'application/json',
                'X-Powered-By': 'Virtual-Express-Network-Interceptor'
              }
            });

            return Promise.resolve(responseObj);
          } catch(err) {
            console.error('[Network Interceptor Error]:', err);
          }
        }

        // Check virtual files map
        const cleanPath = urlStr.replace(/^(\\.\\/|\\/)/, '');
        const filename = cleanPath.split('/').pop();
        if (window.__VIRTUAL_FILES__ && window.__VIRTUAL_FILES__[cleanPath] !== undefined) {
          return Promise.resolve(new Response(window.__VIRTUAL_FILES__[cleanPath], {
            status: 200,
            headers: { 'Content-Type': cleanPath.endsWith('.json') ? 'application/json' : 'text/plain' }
          }));
        }
        if (window.__VIRTUAL_FILES__ && filename && window.__VIRTUAL_FILES__[filename] !== undefined) {
          return Promise.resolve(new Response(window.__VIRTUAL_FILES__[filename], {
            status: 200,
            headers: { 'Content-Type': filename.endsWith('.json') ? 'application/json' : 'text/plain' }
          }));
        }

        // Fallback to native fetch
        return originalFetch ? originalFetch.apply(this, arguments) : Promise.reject(new Error('Fetch not available'));
      };

      // ==========================================
      // 2. Intercept XMLHttpRequest (Axios / jQuery)
      // ==========================================
      const OriginalXHR = window.XMLHttpRequest;
      if (OriginalXHR) {
        function InterceptedXHR() {
          const xhr = new OriginalXHR();
          let _url = '';
          let _method = 'GET';
          let _isApi = false;
          let _reqHeaders = {};
          let _mockResponse = null;

          const origOpen = xhr.open;
          xhr.open = function(method, url) {
            _method = (method || 'GET').toUpperCase();
            _url = (url || '').toString();
            _isApi = _url.startsWith('/api') || 
                     _url.startsWith('api/') || 
                     _url.includes('/api/') || 
                     (_url.startsWith('http') && /\\/api(\\b|\\/)/.test(_url));
            
            if (_isApi) {
              return;
            }
            return origOpen.apply(xhr, arguments);
          };

          const origSetRequestHeader = xhr.setRequestHeader;
          xhr.setRequestHeader = function(header, value) {
            _reqHeaders[header] = value;
            if (!_isApi) {
              return origSetRequestHeader.apply(xhr, arguments);
            }
          };

          const origSend = xhr.send;
          xhr.send = function(body) {
            if (_isApi) {
              setTimeout(() => {
                const res = resolveMockApiResponse(_url, _method, body);
                logIntercept(_url, _method, res.status, body, res.data, true);

                const responseText = JSON.stringify(res.data);
                
                Object.defineProperty(xhr, 'readyState', { value: 4, writable: true });
                Object.defineProperty(xhr, 'status', { value: res.status, writable: true });
                Object.defineProperty(xhr, 'statusText', { value: 'OK (Simulated API)', writable: true });
                Object.defineProperty(xhr, 'responseText', { value: responseText, writable: true });
                Object.defineProperty(xhr, 'response', { value: responseText, writable: true });

                if (typeof xhr.onreadystatechange === 'function') {
                  xhr.onreadystatechange(new Event('readystatechange'));
                }
                if (typeof xhr.onload === 'function') {
                  xhr.onload(new ProgressEvent('load'));
                }
              }, 20);
              return;
            }
            return origSend.apply(xhr, arguments);
          };

          return xhr;
        }

        InterceptedXHR.prototype = OriginalXHR.prototype;
        window.XMLHttpRequest = InterceptedXHR;
      }

      console.info('[Network Interceptor]: تم تثبيت معترض طلبات الشبكة بنجاح لحماية وتوجيه طلبات /api/*');
    })();
  `;
}
