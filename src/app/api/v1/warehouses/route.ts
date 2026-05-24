import { listWarehousesController } from "../../../../controllers/warehouse.controller";
import { NextRequest } from "next/server";

export const GET = (req: NextRequest) => listWarehousesController(req);
