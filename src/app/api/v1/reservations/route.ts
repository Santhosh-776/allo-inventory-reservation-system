import { createReservationController } from "../../../../controllers/reservation.controller";
import { NextRequest } from "next/server";

export const POST = (req: NextRequest) => createReservationController(req);
