from pydantic import BaseModel


class Lesson(BaseModel):
    id: int
    title: str
    description: str
    category: str
    difficulty: str


class Module(BaseModel):
    id: int
    title: str
    lessons: list[Lesson]


class Course(BaseModel):
    id: int
    title: str
    description: str
    modules: list[Module]