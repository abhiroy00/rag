import os
from dotenv import load_dotenv
from openai import OpenAI

from langchain_community.vectorstores import FAISS
from langchain_community.document_loaders import TextLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_openai import OpenAIEmbeddings   
from langchain.chains import RetrievalQA
from langchain.docstore.document import Document

load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
client = OpenAI(api_key=OPENAI_API_KEY)
embeddings = OpenAIEmbeddings(api_key=OPENAI_API_KEY)


docs = []  # you probably planned to load documents here
if docs:
    vectorstore = FAISS.from_documents(docs, embeddings)
else:
    vectorstore = None  # or leave it empty until docs are uploaded


def load_and_split_document(file_path: str):
    loader = TextLoader(file_path)
    documents = loader.load()
    splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=100)
    return splitter.split_documents(documents)

def add_to_vectorstore(docs: list[Document]):
    global vectorstore
    vectorstore.add_documents(docs)

def get_retriever():
    return vectorstore.as_retriever()

def run_qa(query: str):
    retriever = get_retriever()
    qa_chain = RetrievalQA.from_chain_type(
        llm=client.chat.completions,
        retriever=retriever,
        return_source_documents=True
    )
    return qa_chain.run(query)
