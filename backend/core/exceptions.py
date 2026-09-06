from rest_framework.exceptions import AuthenticationFailed
from rest_framework.views import exception_handler


def handler(exc, context):
    response = exception_handler(exc, context)
    if isinstance(exc, AuthenticationFailed) and response is not None:
        response.status_code = 401
    return response
