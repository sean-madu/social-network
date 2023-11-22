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

class LikeAdminForm(forms.ModelForm):
    class Meta:
        model = models.Like
        fields = '__all__'

class LikeAdmin(admin.ModelAdmin):
    form = LikeAdminForm

class CommentAdminForm(forms.ModelForm):
    class Meta:
        model = models.Comment
        fields = '__all__'

class CommentAdmin(admin.ModelAdmin):
    form = CommentAdminForm

admin.site.register(models.Author, AuthorAdmin)
admin.site.register(models.Post, PostAdmin)
admin.site.register(models.Like, LikeAdmin)
admin.site.register(models.Comment, CommentAdmin)