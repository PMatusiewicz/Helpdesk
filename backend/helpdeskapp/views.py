from django.shortcuts import render
from rest_framework import generics, permissions, filters, status
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from .serializers import RegisterSerializer, UserSerializer, CreateReportSerializer, ListCategorySerializer, ListReportSerializer, ListEngineerSerializer, DetailsReportSerializer, ChangeStatusSerializer, AssignEngineerByAdminSerializer, ChangePrioritySerializer
from .models import Report, Priorities, Category, User
from django.utils import timezone
from datetime import timedelta
from django_filters import rest_framework as django_filters
from .filters import ReportFilter
from django.db.models import Count

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

class DetailsReportView(generics.RetrieveAPIView):
    serializer_class = DetailsReportSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self): #type: ignore
        if self.request.user.role == "client": #type: ignore
            return Report.objects.filter(author=self.request.user).select_related("category", "assigned_engineer", "author")
        return Report.objects.all().select_related("category", "assigned_engineer", "author")

class ChangeStatusView(generics.UpdateAPIView):
    serializer_class = ChangeStatusSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Report.objects.all()

    def update(self, request, *args, **kwargs):
        report = self.get_object()
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        new_status = serializer.validated_data["status"]
        current_status = report.status
        allowed_next_statuses = Report.ALLOWED_TRANSITIONS.get(current_status, [])

        BLOCKED_TRANSITIONS = {
            ("NEW", "IN_PROGRESS"),
            ("WAITING_FOR_CLIENT", "IN_PROGRESS")
        }
        CLIENT_ONLY_TRANSITIONS = {
            ("RESOLVED", "CLOSED"),
            ("RESOLVED", "IN_PROGRESS")
        }

        if new_status not in allowed_next_statuses:
            return Response(
                {"status": f"Nie można zmienić statusu z '{current_status}' na '{new_status}'."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if (current_status, new_status) in BLOCKED_TRANSITIONS:
            return Response(
                {"status": f"Tego przejścia nie można ustawić ręcznie."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if request.user.role == "client":
            if not (current_status, new_status) in CLIENT_ONLY_TRANSITIONS:
                return Response(
                    {"status": "Te przejście jest niedostępne dla klienta"},
                    status=status.HTTP_403_FORBIDDEN
                )
            if report.author != request.user:
                return Response(
                    {"status": "Klient nie może zmieniać statusów nie swoich zgłoszeń"},
                    status=status.HTTP_403_FORBIDDEN
                )

        report.status = new_status
        report.save()

        response_serializer = DetailsReportSerializer(report)
        return Response(response_serializer.data)

class AssignToMeView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]
    queryset = Report.objects.all()

    def post(self, request, *args, **kwargs):
        report = self.get_object()

        if request.user.role != "engineer":
            return Response(
                {"detail": "Tylko inżynier może zostać przypisany do zgłoszenia"},
                status=status.HTTP_403_FORBIDDEN
            )

        if report.status in ["RESOLVED", "CLOSED"]:
            return Response(
                {"detail": "Nie można przypisać inżyniera do zgłoszeń zamkniętych lub rozwiązanych"},
                status=status.HTTP_400_BAD_REQUEST
            )

        if report.assigned_engineer is not None:
            return Response(
                {"detail": "Te zgłoszenie ma już przypisanego inżyniera"},
                status=status.HTTP_400_BAD_REQUEST
            )

        report.assigned_engineer = request.user
        if report.status == "NEW":
            report.status = "IN_PROGRESS"
        report.save()

        response_serializer = DetailsReportSerializer(report)
        return Response(response_serializer.data)

class AssignEngineerByAdminView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = AssignEngineerByAdminSerializer
    queryset = Report.objects.all()

    def post(self, request, *args, **kwargs):
        report = self.get_object()

        if request.user.role != "admin":
            return Response(
                {"detail": "Tylko admin może przypisywać inżynierów do zgłoszenia"},
                status=status.HTTP_403_FORBIDDEN
            )

        if report.status in ["RESOLVED", "CLOSED"]:
            return Response(
                {"detail": "Nie można przypisać inżyniera do zgłoszeń zamkniętych lub rozwiązanych"},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        engineer = serializer.validated_data["engineer"]
        report.assigned_engineer = engineer
        if report.status == "NEW":
            report.status = "IN_PROGRESS"
        report.save()

        response_serializer = DetailsReportSerializer(report)
        return Response(response_serializer.data)

class ListAvailableStatusView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]
    queryset = Report.objects.all()

    def get(self, request, *args, **kwargs):
        report = self.get_object()
        current_status = report.status
        allowed_next_statuses = Report.ALLOWED_TRANSITIONS.get(current_status, [])

        BLOCKED_TRANSITIONS = {
            ("NEW", "IN_PROGRESS"),
            ("WAITING_FOR_CLIENT", "IN_PROGRESS")
        }

        if request.user.role == "client":
            return Response({"allowed_transitions": []})

        allowed_next_statuses = list(filter(lambda next_status: (current_status, next_status) not in BLOCKED_TRANSITIONS, allowed_next_statuses))

        return Response({"allowed_transitions": allowed_next_statuses})

class ChangePriorityView(generics.UpdateAPIView):
    serializer_class = ChangePrioritySerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Report.objects.all()

    def update(self, request, *args, **kwargs):
        report = self.get_object()
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        new_priority = serializer.validated_data["priority"]

        if request.user.role == "client":
            return Response({"detail": "Klient nie może zmieniać priorytetu"},
                status=status.HTTP_403_FORBIDDEN
            )

        sla_time = Priorities.objects.get(priority=new_priority).sla
        new_sla_deadline = timezone.now() + timedelta(hours=sla_time)

        report.priority = new_priority
        report.sla_deadline = new_sla_deadline
        report.save()

        response_serializer = DetailsReportSerializer(report)
        return Response(response_serializer.data)

class DashboardView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        if request.user.role == "client":
            counts = {
                "new": Report.objects.filter(author=request.user, status="NEW").count(),
                "in_progress": Report.objects.filter(author=request.user, status="IN_PROGRESS").count(),
                "waiting_for_client": Report.objects.filter(author=request.user, status="WAITING_FOR_CLIENT").count(),
                "resolved": Report.objects.filter(author=request.user, status="RESOLVED").count(),
                "closed": Report.objects.filter(author=request.user, status="CLOSED").count(),
            }
            recent_reports = Report.objects.filter(author=request.user).order_by("-creation_date")[:5].select_related("category", "assigned_engineer")

            return Response({
                "status_counts": counts,
                "recent_reports": ListReportSerializer(recent_reports, many=True).data
            })

        new_unassigned = Report.objects.filter(status="NEW", assigned_engineer__isnull=True).count()
        my_in_progress = Report.objects.filter(status="IN_PROGRESS", assigned_engineer=request.user).count()
        after_sla_time = Report.objects.filter(status__in=["NEW", "IN_PROGRESS"], sla_deadline__lt=timezone.now()).count()
        assigned_to_me = Report.objects.filter(assigned_engineer=request.user).order_by("-creation_date").select_related("category", "assigned_engineer")

        response_data = {
            "new_unassigned": new_unassigned,
            "my_in_progress": my_in_progress,
            "after_sla_time": after_sla_time,
            "assigned_to_me": ListReportSerializer(assigned_to_me, many=True).data
        }

        if request.user.role == "admin":
            category_counts = Report.objects.values("category__name").annotate(count=Count("id"))
            response_data["category_counts"] = list(category_counts)

        return Response(response_data)
