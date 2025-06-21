import { initORM } from "./db";

let isInitialized = false;

export async function ensureInit() {
  if (!isInitialized) {
    await initORM();
    isInitialized = true;
  }
}
