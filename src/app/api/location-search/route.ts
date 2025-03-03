import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

type SearchResult = {
  name: string;
  address: string;
  lat: number;
  lng: number;
  place_id: string;
};

export async function GET(request: NextRequest) {
  // Get the query parameter
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("query");

  if (!query) {
    return NextResponse.json(
      { error: "Query parameter is required" },
      { status: 400 },
    );
  }

  try {
    // Call Google Places API with axios
    const apiUrl = "https://maps.googleapis.com/maps/api/place/textsearch/json";
    const params = {
      query: query,
      key: process.env.GOOGLE_PLACES_API_KEY,
    };

    const response = await axios.get(apiUrl, { params });

    // Check if the response status is not OK
    if (response.data.status !== "OK") {
      console.error(
        "Google Places API error:",
        response.data.status,
        response.data.error_message,
      );
      return NextResponse.json(
        {
          error: `Google Places API error: ${response.data.status}`,
          details: response.data.error_message,
        },
        { status: 500 },
      );
    }

    // Format the response
    const results: SearchResult[] = response.data.results.map((place: any) => ({
      name: place.name,
      address: place.formatted_address,
      lat: place.geometry.location.lat,
      lng: place.geometry.location.lng,
      place_id: place.place_id,
    }));

    return NextResponse.json({ results });
  } catch (error) {
    console.error("Error fetching locations:", error);

    // Handle axios specific errors
    if (axios.isAxiosError(error)) {
      const statusCode = error.response?.status || 500;
      const errorMessage =
        error.response?.data?.error_message || "Failed to fetch locations";

      console.error("Axios error details:", {
        status: statusCode,
        message: errorMessage,
        data: error.response?.data,
      });

      return NextResponse.json({ error: errorMessage }, { status: statusCode });
    }

    return NextResponse.json(
      { error: "Failed to fetch locations" },
      { status: 500 },
    );
  }
}
