from starlette.middleware.base import BaseHTTPMiddleware
from fastapi.responses import JSONResponse
import time

clients = {}


class RateLimitMiddleware(BaseHTTPMiddleware):

    async def dispatch(self, request, call_next):

        ip = request.client.host
        now = time.time()

        if ip not in clients:
            clients[ip] = []

        clients[ip] = [
            t for t in clients[ip]
            if now - t < 60
        ]

        if len(clients[ip]) >= 30:
            return JSONResponse(
                status_code=429,
                content={
                    "message": "Too many requests"
                }
            )

        clients[ip].append(now)

        return await call_next(request)