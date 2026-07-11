from pymongo import MongoClient

MONGO_URI = "mongodb://localhost:27017"

client = MongoClient(MONGO_URI)

db = client["ai_sign_language"]

users_collection = db["users"]