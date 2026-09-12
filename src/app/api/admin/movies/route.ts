import { NextResponse } from "next/server";
import { addMovie, deleteMovie, getMovies } from "@/lib/data-store";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";

const movieSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  synopsis: z.string().min(10),
  director: z.string().min(1),
  castMembers: z.string().min(1),
  genre: z.string().min(1),
  language: z.string().min(1),
  durationMinutes: z.number().positive(),
  mpaaRating: z.string().min(1),
  posterUrl: z.string().url(),
  backdropUrl: z.string().url(),
  trailerUrl: z.string().optional(),
  releaseDate: z.string().min(1),
  ratingScore: z.string().min(1),
  isNowShowing: z.boolean().default(true),
});

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized admin access" }, { status: 403 });
    }

    const body = await req.json();
    const result = movieSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: "Invalid movie payload", details: result.error.issues }, { status: 400 });
    }

    const created = await addMovie(result.data);
    return NextResponse.json({ success: true, movie: created });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create movie" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized admin access" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Movie id is required" }, { status: 400 });
    }

    const ok = await deleteMovie(id);
    return NextResponse.json({ success: ok });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete movie" }, { status: 500 });
  }
}
