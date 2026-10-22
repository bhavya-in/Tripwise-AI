from datetime import date
from typing import Literal

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, field_validator

app = FastAPI(
    title="TripWise AI API",
    description="API for creating budget-aware travel itinerary drafts.",
    version="0.1.0",
)

# Local development only. Restrict this to the deployed frontend origin in production.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)

Interest = Literal["Culture", "Food", "Nature", "Adventure", "Shopping", "History"]


class ItineraryRequest(BaseModel):
    destination: str = Field(min_length=2, max_length=100)
    start_date: date
    days: int = Field(ge=1, le=7)
    budget: int = Field(ge=500, le=10_000_000)
    travelers: int = Field(ge=1, le=8)
    interests: list[Interest] = Field(min_length=1, max_length=6)

    @field_validator("destination")
    @classmethod
    def clean_destination(cls, value: str) -> str:
        cleaned = " ".join(value.split())
        if len(cleaned) < 2:
            raise ValueError("Please enter a valid destination.")
        return cleaned

    @field_validator("interests")
    @classmethod
    def unique_interests(cls, value: list[Interest]) -> list[Interest]:
        return list(dict.fromkeys(value))


class Activity(BaseModel):
    time: str
    title: str
    detail: str
    cost: int
    type: str


class DayPlan(BaseModel):
    day: int
    title: str
    activities: list[Activity]


class ItineraryResponse(BaseModel):
    destination: str
    days: int
    budget: int
    estimated_total: int
    currency: str = "INR"
    itinerary: list[DayPlan]
    note: str


# This is demo content, not live attraction data. We'll replace it with real place data later.
ACTIVITY_LIBRARY: dict[str, list[dict[str, str | int]]] = {
    "Culture": [
        {"time": "09:00", "title": "Explore a local cultural district", "detail": "Walk around the area and discover its character.", "cost": 250, "type": "culture"},
        {"time": "15:00", "title": "Visit a craft or arts space", "detail": "Discover local makers, art, and traditions.", "cost": 200, "type": "culture"},
    ],
    "Food": [
        {"time": "12:30", "title": "Try a local food spot", "detail": "Explore regional flavors; confirm menus and prices before visiting.", "cost": 400, "type": "food"},
    ],
    "Nature": [
        {"time": "07:30", "title": "Easy morning nature walk", "detail": "Choose a nearby public garden or scenic walking area.", "cost": 100, "type": "nature"},
    ],
    "Adventure": [
        {"time": "10:00", "title": "Try a beginner-friendly outdoor activity", "detail": "Check local operators, safety guidance, and availability first.", "cost": 700, "type": "adventure"},
    ],
    "Shopping": [
        {"time": "16:00", "title": "Browse a local market", "detail": "Look for regional crafts and everyday finds.", "cost": 300, "type": "shopping"},
    ],
    "History": [
        {"time": "09:30", "title": "Explore a historic landmark", "detail": "Check current opening hours and entry fees before going.", "cost": 350, "type": "history"},
    ],
}


def build_demo_itinerary(request: ItineraryRequest) -> ItineraryResponse:
    """Build a predictable starter itinerary from selected interest templates."""
    daily_budget = request.budget // request.days
    selected = [item for interest in request.interests for item in ACTIVITY_LIBRARY[interest]]
    selected.sort(key=lambda item: str(item["time"]))

    itinerary: list[DayPlan] = []
    estimated_total = 0
    for day_number in range(1, request.days + 1):
        activities: list[Activity] = []
        for template in selected:
            cost = int(template["cost"]) * request.travelers
            # Keep this demo's estimated activity spend within the user's total budget.
            if estimated_total + cost <= request.budget:
                activities.append(Activity(**{**template, "cost": cost}))
                estimated_total += cost
        if not activities:
            activities.append(Activity(
                time="10:00", title="Flexible free-time block",
                detail="Explore at your own pace; verify any local costs before committing.",
                cost=0, type="flexible",
            ))
        itinerary.append(DayPlan(
            day=day_number,
            title=f"Day {day_number} · {request.destination}",
            activities=activities,
        ))

    return ItineraryResponse(
        destination=request.destination,
        days=request.days,
        budget=request.budget,
        estimated_total=estimated_total,
        itinerary=itinerary,
        note="Prototype estimate for suggested activities only; excludes transport and accommodation.",
    )


@app.get("/")
def root() -> dict[str, str]:
    return {"message": "Welcome to TripWise AI API", "docs": "/docs", "health": "/health"}


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/api/itineraries", response_model=ItineraryResponse)
def create_itinerary(request: ItineraryRequest) -> ItineraryResponse:
    return build_demo_itinerary(request)
