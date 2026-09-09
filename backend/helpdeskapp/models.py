from django.db import models
from django.contrib.auth.models import AbstractUser

# Create your models here.
class User(AbstractUser):
    class Role(models.TextChoices):
        CLIENT = "client", "Klient"
        ENGINEER = "engineer", "Inżynier"
        ADMIN = "admin", "Admin"
        
    role = models.CharField(max_length=20, default=Role.CLIENT, choices=Role)

class Category(models.Model):
    name = models.CharField(max_length=50)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.name}"
    

class Report(models.Model):
    class Status(models.TextChoices):
        NEW = "NEW", "Nowe"
        IN_PROGRESS = "IN_PROGRESS", "W trakcie"
        WAITING_FOR_CLIENT = "WAITING_FOR_CLIENT", "Oczekuje na klienta"
        RESOLVED = "RESOLVED", "Rozwiązane"
        CLOSED = "CLOSED", "Zamknięte"

    class Priority(models.TextChoices):
        CRITICAL = "CRITICAL", "Krytyczny"
        HIGH = "HIGH", "Wysoki"
        MEDIUM = "MEDIUM", "Średni"
        LOW = "LOW", "Niski"

    title = models.CharField(max_length=50)
    description = models.TextField(max_length=500)
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name="reports_created")
    assigned_engineer = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True, related_name="reports_assigned")
    status = models.CharField(max_length=20, choices=Status, default=Status.NEW)
    priority = models.CharField(max_length=20, choices=Priority, default=Priority.CRITICAL)
    category = models.ForeignKey(Category, on_delete=models.CASCADE)
    is_escalated = models.BooleanField(default=False)
    auto_close_disabled = models.BooleanField(default=False)
    creation_date = models.DateTimeField(auto_now_add=True)
    sla_deadline = models.DateTimeField()

    def __str__(self):
        return f"{self.pk}. {self.title}"

class Comment(models.Model):
    description = models.TextField(max_length=500)
    report = models.ForeignKey(Report, on_delete=models.CASCADE)
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    is_inner = models.BooleanField(default=False)
    creation_date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.author}: {self.description[:20]}"

class Attachment(models.Model):
    file = models.FileField(upload_to="files")
    size = models.PositiveIntegerField()
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    report = models.ForeignKey(Report, on_delete=models.CASCADE, null=True, blank=True)
    comment = models.ForeignKey(Comment, on_delete=models.CASCADE, null=True, blank=True)
    creation_date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.file}"

class ReportHistory(models.Model):
    report = models.ForeignKey(Report, on_delete=models.CASCADE)
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    field_name = models.CharField(max_length=50)
    old_value = models.CharField(max_length=500)
    new_value = models.CharField(max_length=500)
    creation_date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.report.title}: {self.field_name} - {self.new_value}"

class Priorities(models.Model):
    priority = models.CharField(max_length=20, choices=Report.Priority.choices, unique=True)
    sla = models.PositiveIntegerField()

    def __str__(self):
        return f"{self.priority}: {self.sla}"

class Settings(models.Model):
    days_until_closure = models.PositiveIntegerField()

    def __str__(self):
        return f"{self.days_until_closure}"
