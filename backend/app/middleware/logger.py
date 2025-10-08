import time
from flask import request

# This function runs before every request
def log_requests_start():
    request.start_time = time.time()

# This function runs after every request
def log_requests_end(response):
    duration = 0
    if hasattr(request, 'start_time'):
        duration = time.time() - request.start_time
        print(f"{request.method} {request.path} - {response.status_code} - {duration:.2f}s")
    
    response.headers['X-Response-Time'] = str(duration)
    return response
