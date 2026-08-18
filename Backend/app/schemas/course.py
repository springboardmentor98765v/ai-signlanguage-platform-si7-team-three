from pydantic import BaseModel , Field


class Lesson(BaseModel):
    id: int = Field(gt=0)
    title: str = Field(min_length=1)
    description: str = Field(min_length=1)
    category: str = Field(min_length=1)
    difficulty: str = Field(min_length=1)


class Module(BaseModel):
    id: int = Field(gt=0)
    title: str = Field(min_length=1)
    lessons: list[Lesson]


class Course(BaseModel):
    id: int = Field(gt=0)
    title: str = Field(min_length=1)
    description: str = Field(min_length=1)
    modules: list[Module]