from django.shortcuts import render
from rest_framework import generics, permissions
from .serializers import RegisterSerializer, UserSerializer, CreateReportSerializer
from .models import Report, Priorities
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

class CreateReportView(generics.CreateAPIView):
    serializer_class = CreateReportSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        sla_time = Priorities.objects.get(priority=serializer.validated_data["priority"]).sla
        calculated_sla_deadline = timezone.now() + timedelta(hours=sla_time)
        serializer.save(author=self.request.user, status=Report.Status.NEW, sla_deadline=calculated_sla_deadline)