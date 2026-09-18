from django.shortcuts import render
from rest_framework import generics, permissions, filters
from rest_framework.pagination import PageNumberPagination
from .serializers import RegisterSerializer, UserSerializer, CreateReportSerializer, ListCategorySerializer, ListReportSerializer, ListEngineerSerializer
from .models import Report, Priorities, Category, User
from django.utils import timezone
from datetime import timedelta
from django_filters import rest_framework as django_filters
from .filters import ReportFilter

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
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = PageNumberPagination
    filter_backends = [django_filters.DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = ReportFilter
    search_fields = ["title"]
    ordering_fields = ["id", "title", "category__name", "priority", "status", "assigned_engineer__username", "creation_date", "sla_deadline"]

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
            return Report.objects.select_related("category", "assigned_engineer").filter(author=self.request.user).order_by("id")
        return Report.objects.select_related("category", "assigned_engineer").all().order_by("id")

class ListCategoryView(generics.ListAPIView):
    serializer_class = ListCategorySerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Category.objects.filter(is_active=True).order_by("name")

class ListEngineerView(generics.ListAPIView):
    serializer_class = ListEngineerSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = User.objects.filter(role="engineer").order_by("username")
