from rest_framework_simplejwt.views import TokenRefreshView, TokenObtainPairView
from django.urls import path
from .views import RegisterView, UserView, ListCreateReportView, ListCategoryView, ListEngineerView, DetailsReportView, ChangeStatusView, AssignToMeView

urlpatterns = [
    path('token/', TokenObtainPairView.as_view()),
    path('token/refresh/', TokenRefreshView.as_view()),
    path('register/', RegisterView.as_view()),
    path('me/', UserView.as_view()),
    path('reports/', ListCreateReportView.as_view()),
    path('categories/', ListCategoryView.as_view()),
    path('engineers/', ListEngineerView.as_view()),
    path('reports/<int:pk>/', DetailsReportView.as_view()),
    path('reports/<int:pk>/status/', ChangeStatusView.as_view()),
    path('reports/<int:pk>/assign-to-me/', AssignToMeView.as_view())
]
