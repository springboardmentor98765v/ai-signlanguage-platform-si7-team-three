from app.schemas.course import Course, Module, Lesson

# Sample Course Data
courses = [
    Course(
        id=1,
        title="Alphabet Course",
        description="Learn A to Z in Sign Language",
        modules=[
            Module(
                id=1,
                title="Alphabet Module",
                lessons=[
                    Lesson(id=1, title="Letter A", description="Learn sign for A"),
                    Lesson(id=2, title="Letter B", description="Learn sign for B"),
                    Lesson(id=3, title="Letter C", description="Learn sign for C"),
                    Lesson(id=4, title="Letter D", description="Learn sign for D"),
                    Lesson(id=5, title="Letter E", description="Learn sign for E"),
                ],
            )
        ],
    )
]


def get_all_courses():
    return courses


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