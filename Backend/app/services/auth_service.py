from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

fake_users = []

def register_user(user):
    hashed_password = pwd_context.hash(user.password)

    new_user = {
        "full_name": user.full_name,
        "email": user.email,
        "password": hashed_password
    }

    fake_users.append(new_user)

    return {
        "message": "User registered successfully",
        "user": {
            "full_name": user.full_name,
            "email": user.email
        }
    }


def login_user(user):
    for existing_user in fake_users:
        if existing_user["email"] == user.email:
            if pwd_context.verify(user.password, existing_user["password"]):
                return {
                    "message": "Login successful"
                }

    return {
        "message": "Invalid email or password"
    }