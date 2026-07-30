from app.schemas.course import Course, Module, Lesson

# Sample Course Data
courses = [
    Course(
        id=1,
        title="Sign Language Basics",
        description="Learn alphabets and common words",
        modules=[
            Module(
                id=1,
                title="Alphabet Module",
                lessons=[
                    Lesson(
                        id=1,
                        title="Letter A",
                        description="Learn sign for A",
                        category="Alphabet",
                        difficulty="Easy"
                    ),
                    Lesson(
                        id=2,
                        title="Letter B",
                        description="Learn sign for B",
                        category="Alphabet",
                        difficulty="Easy"
                    ),
                    Lesson(
                        id=3,
                        title="Letter C",
                        description="Learn sign for C",
                        category="Alphabet",
                        difficulty="Easy"
                    ),
                    Lesson(
                        id=4,
                        title="Letter D",
                        description="Learn sign for D",
                        category="Alphabet",
                        difficulty="Easy"
                    ),
                    Lesson(
                        id=5,
                        title="Letter E",
                        description="Learn sign for E",
                        category="Alphabet",
                        difficulty="Easy"
                    ),
                    Lesson(
                        id=6,
                        title="Letter F",
                        description="Learn sign for F",
                        category="Alphabet",
                        difficulty="Medium"
                    ),
                    Lesson(
                        id=7,
                        title="Letter G",
                        description="Learn sign for G",
                        category="Alphabet",
                        difficulty="Medium"
                    ),
                    Lesson(
                        id=8,
                        title="Hello",
                        description="Greeting sign",
                        category="Words",
                        difficulty="Easy"
                    ),
                    Lesson(
                        id=9,
                        title="Thank You",
                        description="Thank you sign",
                        category="Words",
                        difficulty="Easy"
                    ),
                    Lesson(
                        id=10,
                        title="Good Morning",
                        description="Morning greeting",
                        category="Words",
                        difficulty="Medium"
                    ),
                    Lesson(
                        id=11,
                        title="Good Night",
                        description="Night greeting",
                        category="Words",
                        difficulty="Medium"
                    ),
                    Lesson(
                        id=12,
                        title="Please",
                        description="Polite expression",
                        category="Words",
                        difficulty="Easy"
                    ),
                ],
            )
        ],
    )
]


def get_all_courses(page: int = 1, limit: int = 10):
    all_lessons = []

    for course in courses:
        for module in course.modules:
            all_lessons.extend(module.lessons)

    start = (page - 1) * limit
    end = start + limit

    return {
        "page": page,
        "limit": limit,
        "total_lessons": len(all_lessons),
        "lessons": all_lessons[start:end]
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