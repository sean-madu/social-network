from django.contrib import admin
from social_media import models
from django import forms

# Register your models here.
class AuthorAdminForm(forms.ModelForm):
    class Meta:
        model = models.Author
        fields = '__all__'

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Allowing empty values in these fields (ONLY for admin view form submission)
        self.fields['github'].required = False
        self.fields['profileImage'].required = False

class AuthorAdmin(admin.ModelAdmin):
    form = AuthorAdminForm


class PostAdminForm(forms.ModelForm):
    class Meta:
        model = models.Post
        fields = '__all__'

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Allowing empty values in these fields (ONLY for admin view form submission)
        self.fields['source'].required = False
        self.fields['commentsSrc'].required = False
        self.fields['categories'].required = False

class PostAdmin(admin.ModelAdmin):
    form = PostAdminForm

admin.site.register(models.Author, AuthorAdmin)
admin.site.register(models.Post, PostAdmin)