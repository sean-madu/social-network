from rest_framework import serializers
from .models import Post, Author
from django.core.exceptions import ValidationError

class PostSerializer(serializers.ModelSerializer):
    class Meta:
        model = Post
        fields = '__all__'

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['type'] = 'post'
        return data
    
    def validate_content_type(self, value):
        allowed_content_types = ["text/markdown", "text/plain", "application/base64", "image/png;base64", "image/jpeg;base64"]
        if value not in allowed_content_types:
            raise ValidationError("Invalid content_type")
        return value
    
    def validate_visibility(self, value):
        allowed_visibilities = ["PUBLIC", "FRIENDS"]
        if value not in allowed_visibilities:
            raise ValidationError("Invalid visibility")
        return value
    
class AuthorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Author
        fields = '__all__'