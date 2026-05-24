import { listProductsController, createProductController } from "../../../../controllers/product.controller";
import { NextRequest } from "next/server";

export const GET = (req: NextRequest) => listProductsController(req);
export const POST = (req: NextRequest) => createProductController(req);
