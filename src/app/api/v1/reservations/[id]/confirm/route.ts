import { confirmReservationController } from "../../../../../../controllers/reservation.controller";
import { NextRequest } from "next/server";

export const POST = (
    req: NextRequest,
    context: { params: Promise<Record<string, string>> },
) => confirmReservationController(req, context);
