from pymongo import MongoClient

client = MongoClient("mongodb://localhost:27017")

db = client["sign_language_platform"]

users_collection = db["users"]
courses_collection = db["courses"]