from django.shortcuts import render
from rest_framework import generics, permissions
from rest_framework.pagination import PageNumberPagination
from .serializers import RegisterSerializer, UserSerializer, CreateReportSerializer, ListCategorySerializer, ListReportSerializer
from .models import Report, Priorities, Category
from django.utils import timezone
from datetime import timedelta

# Create your views here.
class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

class UserView(generics.RetrieveAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self): # type: ignore[override]
        return self.request.user

class ListCreateReportView(generics.ListCreateAPIView):
    serializer_class = CreateReportSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = PageNumberPagination

    def get_serializer_class(self): # type: ignore
        if self.request.method == 'POST':
            return CreateReportSerializer
        return ListReportSerializer

    def perform_create(self, serializer):
        sla_time = Priorities.objects.get(priority=serializer.validated_data["priority"]).sla
        calculated_sla_deadline = timezone.now() + timedelta(hours=sla_time)
        serializer.save(author=self.request.user, status=Report.Status.NEW, sla_deadline=calculated_sla_deadline)

    def get_queryset(self): # type: ignore
        if self.request.user.role == "client": # type: ignore
            return Report.objects.filter(author=self.request.user)
        return Report.objects.all()

class ListCategoryView(generics.ListAPIView):
    serializer_class = ListCategorySerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Category.objects.filter(is_active=True)

class ListReportView(generics.ListAPIView):
    serializer_class = ListReportSerializer
    permission_classes = [permissions.IsAuthenticated]

    
