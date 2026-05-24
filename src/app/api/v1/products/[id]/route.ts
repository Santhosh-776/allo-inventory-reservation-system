import { getProductController, deleteProductController } from "../../../../../controllers/product.controller";
import { NextRequest } from "next/server";

export const GET = (req: NextRequest, context: { params: Promise<Record<string, string>> }) =>
    getProductController(req, context);

export const DELETE = (req: NextRequest, context: { params: Promise<Record<string, string>> }) =>
    deleteProductController(req, context);
