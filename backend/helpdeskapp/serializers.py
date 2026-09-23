from rest_framework import serializers
from .models import User, Report, Category
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError

class RegisterSerializer(serializers.ModelSerializer):
    confirm_password = serializers.CharField(write_only=True)
    class Meta:
        model = User
        fields = ["username", "email", "password", "confirm_password"]
        extra_kwargs = {
            "password": {"write_only": True},
            "email": {"required": True, "allow_blank": False}
        }

    def validate(self, attrs):
        if attrs["password"] != attrs["confirm_password"]:
            raise serializers.ValidationError({"confirm_password": "Hasła się nie zgadzają"})
        try:
            validate_password(attrs["password"])
        except DjangoValidationError as error:
            raise serializers.ValidationError({"password": error.messages})
        return attrs

    def create(self, validated_data):
        validated_data.pop("confirm_password")
        user = User.objects.create_user(**validated_data)
        return user

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["username", "email", "role"]

class CreateReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = Report
        fields = ["title", "description", "category", "priority"]

class ListCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "name"]

class ListReportSerializer(serializers.ModelSerializer):
    category = serializers.SlugRelatedField(
        slug_field = "name",
        read_only = True
    )

    assigned_engineer = serializers.SlugRelatedField(
        slug_field = "username",
        read_only = True
    )

    class Meta:
        model = Report
        fields = ["id", "title", "category", "priority", "status", "assigned_engineer", "creation_date", "sla_deadline"]

class ListEngineerSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username"]

class DetailsReportSerializer(serializers.ModelSerializer):
    category = serializers.SlugRelatedField(
        slug_field = "name",
        read_only = True
    )

    assigned_engineer = serializers.SlugRelatedField(
        slug_field = "username",
        read_only = True
    )

    author = serializers.SlugRelatedField(
        slug_field = "username",
        read_only = True
    )
    class Meta:
        model = Report
        fields = ["id", "title", "status", "priority", "sla_deadline", "category", "author", "assigned_engineer", "description"]

class ChangeStatusSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=Report.Status.choices)

class AssignEngineerByAdminSerializer(serializers.Serializer):
    engineer_id = serializers.PrimaryKeyRelatedField(queryset=User.objects.filter(role="engineer"), source="engineer")

class ChangePrioritySerializer(serializers.Serializer):
    priority = serializers.ChoiceField(choices=Report.Priority.choices)
