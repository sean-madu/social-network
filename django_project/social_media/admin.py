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
        if not self.instance.id:
            self.initial['id'] = self.instance.generateUrl()
            self.initial['url'] = self.instance.generateUrl()

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

class FollowAdminForm(forms.ModelForm):
    class Meta:
        model = models.Follower
        fields = '__all__'


class FollowAdmin(admin.ModelAdmin):
    form = FollowAdminForm
class NodeAdminForm(forms.ModelForm):
    class Meta:
        model = models.Node
        fields = '__all__'
        
class NodeAdmin(admin.ModelAdmin):
    form = NodeAdminForm

class InboxAdminForm(forms.ModelForm):
    class Meta:
        model = models.InboxItem
        fields = '__all__'
        
class InboxAdmin(admin.ModelAdmin):
    form = InboxAdminForm


#Deploy models
admin.site.register(models.Author, AuthorAdmin)
admin.site.register(models.Post, PostAdmin)
admin.site.register(models.Like, LikeAdmin)
admin.site.register(models.Comment, CommentAdmin)
admin.site.register(models.Follower, FollowAdmin)
admin.site.register(models.Node, NodeAdmin)
admin.site.register(models.InboxItem, InboxAdmin)
