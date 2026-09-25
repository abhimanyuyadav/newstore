import { mutationGeneric, queryGeneric } from "convex/server";
import { v } from "convex/values";
// Retired endpoints must also be deployed/disabled on any previously used Convex deployment.
// Store data is now served only through Next.js, where sessions and permissions are checked.
const retired = async () => { throw new Error("Legacy shared storage is disabled. Use the store API."); };
export const getValue = queryGeneric({ args: { key:v.string() }, handler:retired });
export const listValues = queryGeneric({ args: {}, handler:retired });
export const setValue = mutationGeneric({ args: { key:v.string(), value:v.any() }, handler:retired });
export const deleteValue = mutationGeneric({ args: { key:v.string() }, handler:retired });
