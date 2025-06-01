# docchat/views.py
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser
from rest_framework.response import Response
from rest_framework import status
from .models import Document
from .serializers import DocumentSerializer
from .utils import load_and_process_document, get_qa_chain
import os
from django.conf import settings
import tempfile
import shutil

class DocumentUploadView(APIView):
    parser_classes = [MultiPartParser]
    
    def post(self, request, format=None):
        serializer = DocumentSerializer(data=request.data)
        if serializer.is_valid():
            document = serializer.save()
            file_path = os.path.join(settings.MEDIA_ROOT, document.file.name)
            
            # Process document and get vectorstore path
            vectorstore_path = load_and_process_document(file_path)
            
            # Store vectorstore path in session
            request.session['vectorstore_path'] = vectorstore_path
            
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ChatView(APIView):
    def post(self, request, format=None):
        question = request.data.get('question')
        if not question:
            return Response({"error": "Question is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        vectorstore_path = request.session.get('vectorstore_path')
        if not vectorstore_path:
            return Response({"error": "No document uploaded"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Create QA chain for this request
        qa_chain = get_qa_chain(vectorstore_path)
        result = qa_chain({"query": question})
        
        return Response({
            "answer": result["result"],
            "sources": [doc.metadata["source"] for doc in result["source_documents"]]
        })
    
    def delete(self, request, format=None):
        # Clean up vectorstore files when session ends
        vectorstore_path = request.session.get('vectorstore_path')
        if vectorstore_path:
            try:
                shutil.rmtree(os.path.dirname(vectorstore_path))
            except:
                pass
            del request.session['vectorstore_path']
        return Response(status=status.HTTP_204_NO_CONTENT)