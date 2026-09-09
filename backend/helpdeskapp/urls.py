from rest_framework_simplejwt.views import TokenRefreshView, TokenObtainPairView
from django.urls import path

urlpatterns = [
    path('token/', TokenObtainPairView.as_view()),
    path('token/refresh/', TokenRefreshView.as_view())
]
