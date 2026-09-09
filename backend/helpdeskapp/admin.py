from django.contrib import admin
from .models import *

# Register your models here.
admin.site.register(User)
admin.site.register(Category)
admin.site.register(Report)
admin.site.register(Comment)
admin.site.register(Attachment)
admin.site.register(ReportHistory)
admin.site.register(Priorities)
admin.site.register(Settings)