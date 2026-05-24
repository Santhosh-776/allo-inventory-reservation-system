import { getReservationController } from "../../../../../controllers/reservation.controller";
import { NextRequest } from "next/server";

export const GET = (
    req: NextRequest,
    context: { params: Promise<Record<string, string>> },
) => getReservationController(req, context);
