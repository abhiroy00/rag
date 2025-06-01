# docchat/utils.py
import os
import tempfile
from langchain_community.document_loaders import PyPDFLoader, Docx2txtLoader, TextLoader
from langchain.text_splitter import CharacterTextSplitter
from langchain_community.embeddings import OpenAIEmbeddings
from langchain_community.vectorstores import FAISS
from langchain.chains import RetrievalQA
from langchain_community.chat_models import ChatOpenAI
from django.conf import settings
from dotenv import load_dotenv

load_dotenv()

def load_and_process_document(file_path):
    """Load and process document into FAISS vector store"""
    # Validate file extension
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"File not found: {file_path}")
    
    # Load document based on file type
    if file_path.endswith('.pdf'):
        loader = PyPDFLoader(file_path)
    elif file_path.endswith('.docx'):
        loader = Docx2txtLoader(file_path)
    elif file_path.endswith('.txt'):
        loader = TextLoader(file_path)
    else:
        raise ValueError("Unsupported file format. Only PDF, DOCX, and TXT files are supported")
    
    try:
        documents = loader.load()
    except Exception as e:
        raise ValueError(f"Failed to load document: {str(e)}")
    
    # Split text into chunks
    text_splitter = CharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200,
        separator="\n"
    )
    texts = text_splitter.split_documents(documents)
    
    # Create embeddings and vector store
    embeddings = OpenAIEmbeddings()
    
    try:
        db = FAISS.from_documents(texts, embeddings)
    except Exception as e:
        raise RuntimeError(f"Failed to create vector store: {str(e)}")
    
    # Save to temporary directory
    temp_dir = tempfile.mkdtemp()
    temp_path = os.path.join(temp_dir, "vectorstore")
    
    try:
        db.save_local(temp_path)
    except Exception as e:
        raise RuntimeError(f"Failed to save vector store: {str(e)}")
    
    return temp_path

def get_qa_chain(vectorstore_path):
    """Create QA chain from saved vector store"""
    if not os.path.exists(vectorstore_path):
        raise FileNotFoundError(f"Vector store not found at {vectorstore_path}")
    
    # Load vector store with safety check
    embeddings = OpenAIEmbeddings()
    
    try:
        db = FAISS.load_local(
            vectorstore_path,
            embeddings,
            allow_dangerous_deserialization=True  # Required for pickle loading
        )
    except Exception as e:
        raise RuntimeError(f"Failed to load vector store: {str(e)}")
    
    # Create QA chain
    llm = ChatOpenAI(
        model_name="gpt-3.5-turbo",
        temperature=0,
        max_retries=3
    )
    
    qa_chain = RetrievalQA.from_chain_type(
        llm=llm,
        chain_type="stuff",
        retriever=db.as_retriever(
            search_type="similarity",
            search_kwargs={"k": 4}
        ),
        return_source_documents=True,
        verbose=True
    )
    
    return qa_chain