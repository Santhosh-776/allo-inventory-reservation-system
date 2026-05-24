import { listProductsController } from "../../../../controllers/product.controller";
import { NextRequest } from "next/server";

export const GET = (req: NextRequest) => listProductsController(req);
