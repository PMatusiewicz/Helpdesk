import django_filters
from .models import Report
from django.utils import timezone

class ReportFilter(django_filters.FilterSet):
    only_my = django_filters.BooleanFilter(method="only_my_filter")
    by_sla = django_filters.BooleanFilter(method="by_sla_filter")

    class Meta:
        model = Report
        fields = ["status", "priority", "category", "assigned_engineer"]

    def only_my_filter(self, queryset, name, value):
        if not value:
            return queryset
        return queryset.filter(assigned_engineer=self.request.user) # type: ignore

    def by_sla_filter(self, queryset, name, value):
        if not value:
            return queryset
        return queryset.filter(sla_deadline__lt=timezone.now())
