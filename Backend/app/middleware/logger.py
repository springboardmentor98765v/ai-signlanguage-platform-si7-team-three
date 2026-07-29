from starlette.middleware.base import BaseHTTPMiddleware
import time


class LoggingMiddleware(BaseHTTPMiddleware):

    async def dispatch(self, request, call_next):
        start = time.time()

        response = await call_next(request)

        end = time.time()

        print(
            f"{request.method} {request.url.path} "
            f"Status:{response.status_code} "
            f"Time:{round(end-start,3)}s"
        )

        return response