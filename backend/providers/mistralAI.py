from langchain_mistralai import ChatMistralAI
from dotenv import load_dotenv

load_dotenv()

model = ChatMistralAI(model="mistral-small-2603")

response = model.invoke("hi how are u")

print(response)
