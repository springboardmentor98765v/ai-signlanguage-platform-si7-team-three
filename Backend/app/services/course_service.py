from app.schemas.course import Course, Module, Lesson
import csv
from io import StringIO
# Sample Course Data
courses = [
    Course(
        id=1,
        title="Alphabet Course",
        description="Learn A-Z Sign Language",
        modules=[
            Module(
                id=1,
                title="Alphabet & Common Words",
                lessons=[
                    Lesson(id=1, title="Letter A", description="Learn sign for A", category="Alphabet", difficulty="Easy"),
                    Lesson(id=2, title="Letter B", description="Learn sign for B", category="Alphabet", difficulty="Easy"),
                    Lesson(id=3, title="Letter C", description="Learn sign for C", category="Alphabet", difficulty="Easy"),
                    Lesson(id=4, title="Letter D", description="Learn sign for D", category="Alphabet", difficulty="Easy"),
                    Lesson(id=5, title="Letter E", description="Learn sign for E", category="Alphabet", difficulty="Easy"),
                    Lesson(id=6, title="Letter F", description="Learn sign for F", category="Alphabet", difficulty="Easy"),
                    Lesson(id=7, title="Letter G", description="Learn sign for G", category="Alphabet", difficulty="Easy"),
                    Lesson(id=8, title="Letter H", description="Learn sign for H", category="Alphabet", difficulty="Easy"),
                    Lesson(id=9, title="Letter I", description="Learn sign for I", category="Alphabet", difficulty="Easy"),
                    Lesson(id=10, title="Letter J", description="Learn sign for J", category="Alphabet", difficulty="Easy"),
                    Lesson(id=11, title="Letter K", description="Learn sign for K", category="Alphabet", difficulty="Medium"),
                    Lesson(id=12, title="Letter L", description="Learn sign for L", category="Alphabet", difficulty="Medium"),
                    Lesson(id=13, title="Letter M", description="Learn sign for M", category="Alphabet", difficulty="Medium"),
                    Lesson(id=14, title="Letter N", description="Learn sign for N", category="Alphabet", difficulty="Medium"),
                    Lesson(id=15, title="Letter O", description="Learn sign for O", category="Alphabet", difficulty="Medium"),
                    Lesson(id=16, title="Letter P", description="Learn sign for P", category="Alphabet", difficulty="Medium"),
                    Lesson(id=17, title="Letter Q", description="Learn sign for Q", category="Alphabet", difficulty="Medium"),
                    Lesson(id=18, title="Letter R", description="Learn sign for R", category="Alphabet", difficulty="Medium"),
                    Lesson(id=19, title="Letter S", description="Learn sign for S", category="Alphabet", difficulty="Medium"),
                    Lesson(id=20, title="Letter T", description="Learn sign for T", category="Alphabet", difficulty="Medium"),
                    Lesson(id=21, title="Letter U", description="Learn sign for U", category="Alphabet", difficulty="Hard"),
                    Lesson(id=22, title="Letter V", description="Learn sign for V", category="Alphabet", difficulty="Hard"),
                    Lesson(id=23, title="Letter W", description="Learn sign for W", category="Alphabet", difficulty="Hard"),
                    Lesson(id=24, title="Letter X", description="Learn sign for X", category="Alphabet", difficulty="Hard"),
                    Lesson(id=25, title="Letter Y", description="Learn sign for Y", category="Alphabet", difficulty="Hard"),
                    Lesson(id=26, title="Letter Z", description="Learn sign for Z", category="Alphabet", difficulty="Hard"),

                    Lesson(id=27, title="Hello", description="Greeting sign", category="Words", difficulty="Easy"),
                    Lesson(id=28, title="Thank You", description="Thank you sign", category="Words", difficulty="Easy"),
                    Lesson(id=29, title="Please", description="Polite expression", category="Words", difficulty="Easy"),
                    Lesson(id=30, title="Sorry", description="Apology sign", category="Words", difficulty="Easy"),
                    Lesson(id=31, title="Good Morning", description="Morning greeting", category="Words", difficulty="Medium"),
                    Lesson(id=32, title="Good Night", description="Night greeting", category="Words", difficulty="Medium"),
                    Lesson(id=33, title="Yes", description="Yes sign", category="Words", difficulty="Easy"),
                    Lesson(id=34, title="No", description="No sign", category="Words", difficulty="Easy"),
                    Lesson(id=35, title="Help", description="Help sign", category="Words", difficulty="Medium"),
                    Lesson(id=36, title="Welcome", description="Welcome sign", category="Words", difficulty="Medium"),
                ],
            )
        ],
    )
]


def get_all_courses(page: int = 1, limit: int = 10):
    start = (page - 1) * limit
    end = start + limit

    return {
        "page": page,
        "limit": limit,
        "total_courses": len(courses),
        "courses": courses[start:end]
    }


def get_course(course_id: int):
    for course in courses:
        if course.id == course_id:
            return course
    return None


def create_course(course: Course):
    courses.append(course)
    return course


def update_course(course_id: int, updated_course: Course):
    for i, course in enumerate(courses):
        if course.id == course_id:
            courses[i] = updated_course
            return updated_course
    return None


def delete_course(course_id: int):
    for i, course in enumerate(courses):
        if course.id == course_id:
            deleted = courses.pop(i)
            return deleted
    return None

def search_lessons(keyword: str):
    result = []

    for course in courses:
        for module in course.modules:
            for lesson in module.lessons:
                if keyword.lower() in lesson.title.lower():
                    result.append(lesson)

    return result

def create_lesson(course_id: int, module_id: int, lesson: Lesson):
    for course in courses:
        if course.id == course_id:
            for module in course.modules:
                if module.id == module_id:
                    module.lessons.append(lesson)
                    return lesson
    return None

def update_lesson(course_id: int, module_id: int, lesson_id: int, updated_lesson):
    course = get_course(course_id)
    if not course:
        return None

    for module in course.modules:
        if module.id == module_id:
            for i, lesson in enumerate(module.lessons):
                if lesson.id == lesson_id:
                    module.lessons[i] = updated_lesson
                    return updated_lesson

    return None   

def delete_lesson(course_id: int, module_id: int, lesson_id: int):
    course = get_course(course_id)

    if not course:
        return None

    for module in course.modules:
        if module.id == module_id:
            for i, lesson in enumerate(module.lessons):
                if lesson.id == lesson_id:
                    return module.lessons.pop(i)

    return None    

def bulk_upload_lessons(file):
    content = file.file.read().decode("utf-8")
    reader = csv.DictReader(StringIO(content))

    uploaded = 0

    for row in reader:
        course_id = int(row["course_id"])
        module_id = int(row["module_id"])

        lesson = Lesson(
            id=int(row["id"]),
            title=row["title"],
            description=row["description"],
            category=row["category"],
            difficulty=row["difficulty"]
        )

        if create_lesson(course_id, module_id, lesson):
            uploaded += 1

    return {
        "message": f"{uploaded} lessons uploaded successfully"
    }