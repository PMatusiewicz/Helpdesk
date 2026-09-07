from django.db import models
from django.contrib.auth.models import AbstractUser

# Create your models here.
class User(AbstractUser):
    class Roles(models.TextChoices):
        CLIENT = "client", "Klient"
        ENGINEER = "engineer", "Inżynier"
        ADMIN = "admin", "Admin"
        
    role = models.CharField(max_length=20, default=Roles.CLIENT, choices=Roles)
