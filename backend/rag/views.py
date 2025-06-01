from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser
from . import rag_utils
import os

class UploadDocumentView(APIView):
    parser_classes = [MultiPartParser]

    def post(self, request):
        uploaded_file = request.FILES.get("file")
        if not uploaded_file:
            return Response({"error": "No file uploaded"}, status=400)

        file_path = f"temp/{uploaded_file.name}"
        os.makedirs("temp", exist_ok=True)
        with open(file_path, "wb+") as f:
            for chunk in uploaded_file.chunks():
                f.write(chunk)

        docs = rag_utils.load_and_split_document(file_path)
        rag_utils.add_to_vectorstore(docs)
        return Response({"message": "Document uploaded and processed"})

class AskQuestionView(APIView):
    def post(self, request):
        query = request.data.get("query")
        if not query:
            return Response({"error": "No query provided"}, status=400)

        result = rag_utils.run_qa(query)
        return Response({"answer": result})
