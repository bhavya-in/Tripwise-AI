
import httpx

NOMINATIM_URL = "https://nominatim.openstreetmap.org/search"
OVERPASS_URL = "https://overpass-api.de/api/interpreter"

CATEGORY_TAGS = {
    "Culture": ["museum", "arts_centre", "theatre"],
    "Food": ["restaurant", "cafe", "food_court"],
    "Nature": ["park", "garden", "viewpoint"],
    "Adventure": ["theme_park", "water_park", "sports_centre"],
    "Shopping": ["marketplace", "mall"],
    "History": ["monument", "castle", "archaeological_site"],
}


async def discover_places(destination: str, interests: list[str]) -> list[dict]:
    """Find real mapped attractions near a destination using OpenStreetMap."""

    headers = {
        "User-Agent": "TripWiseAI/1.0 (travel itinerary learning project)"
    }

    async with httpx.AsyncClient(
        timeout=25.0,
        headers=headers,
        follow_redirects=True,
    ) as client:
        geo_response = await client.get(
            NOMINATIM_URL,
            params={
                "q": destination,
                "format": "jsonv2",
                "limit": 1,
            },
        )
        geo_response.raise_for_status()
        locations = geo_response.json()

        if not locations:
            return []

        location = locations[0]
        lat = float(location["lat"])
        lon = float(location["lon"])

        selected_tags = sorted({
            tag
            for interest in interests
            for tag in CATEGORY_TAGS.get(interest, [])
        })

        if not selected_tags:
            selected_tags = [
                "attraction", "museum", "park", "monument"
            ]

        filters = "".join(
            f'node(around:8000,{lat},{lon})["tourism"="{tag}"];'
            f'way(around:8000,{lat},{lon})["tourism"="{tag}"];'
            f'node(around:8000,{lat},{lon})["amenity"="{tag}"];'
            f'way(around:8000,{lat},{lon})["amenity"="{tag}"];'
            f'node(around:8000,{lat},{lon})["historic"="{tag}"];'
            f'way(around:8000,{lat},{lon})["historic"="{tag}"];'
            for tag in selected_tags
        )

        query = f"""
        [out:json][timeout:20];
        (
            {filters}
            node(around:8000,{lat},{lon})["tourism"="attraction"];
            way(around:8000,{lat},{lon})["tourism"="attraction"];
        );
        out center tags;
        """

        response = await client.post(
            OVERPASS_URL,
            data={"data": query},
        )
        response.raise_for_status()

        places = []
        seen_names = set()

        for element in response.json().get("elements", []):
            tags = element.get("tags", {})
            name = tags.get("name")

            if not name or name.casefold() in seen_names:
                continue

            seen_names.add(name.casefold())

            center = element.get("center", {})
            place_lat = element.get("lat", center.get("lat"))
            place_lon = element.get("lon", center.get("lon"))

            if place_lat is None or place_lon is None:
                continue

            category = (
                tags.get("tourism")
                or tags.get("amenity")
                or tags.get("historic")
                or tags.get("leisure")
                or "attraction"
            )

            places.append({
                "id": f'{element.get("type")}-{element.get("id")}',
                "name": name,
                "category": category.replace("_", " ").title(),
                "latitude": float(place_lat),
                "longitude": float(place_lon),
                "address": tags.get("addr:street", ""),
                "website": tags.get("website", ""),
                "source": "OpenStreetMap",
            })

        return places[:50]
